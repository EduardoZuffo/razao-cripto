import {
  Decimal,
  ErroApuracao,
  type Alienacao,
  type Confianca,
  type Lancamento,
  type PerfilConfianca,
  type Posicao,
  type Valor,
} from './tipos.js';

const d = (v: Valor | undefined, padrao = '0') =>
  new Decimal(v === undefined || v === null || v === '' ? padrao : (v as any));

const ZERO = new Decimal(0);

const perfilVazio = (): PerfilConfianca => ({
  documentado: ZERO,
  estimado: ZERO,
  arbitrado: ZERO,
  ausente: ZERO,
});

/** Tolerância para tratar resíduo de ponto flutuante como zero. */
const POEIRA = new Decimal('1e-18');

/**
 * Converte o valor bruto de um lançamento para BRL na data do fato.
 * O câmbio vem gravado no lançamento — nunca é buscado "agora".
 */
function paraBrl(l: Lancamento, valor: Decimal): Decimal {
  if (l.moeda === 'BRL') return valor;
  const cambio = d(l.cambioBrl);
  if (cambio.lte(0)) {
    throw new ErroApuracao(
      `Lançamento ${l.id} está em ${l.moeda} mas não tem câmbio da data.`,
      l.id,
      'CAMBIO_AUSENTE'
    );
  }
  return valor.times(cambio);
}

/** Estado mutável de uma posição durante o processamento. */
interface Acumulador {
  ativoId: string;
  quantidade: Decimal;
  custo: Decimal;
  confianca: PerfilConfianca;
}

function novoAcumulador(ativoId: string): Acumulador {
  return { ativoId, quantidade: ZERO, custo: ZERO, confianca: perfilVazio() };
}

/** Soma custo a uma posição, registrando sob qual nível de confiança ele entrou. */
function adicionarCusto(a: Acumulador, custo: Decimal, nivel: Confianca): void {
  a.custo = a.custo.plus(custo);
  a.confianca[nivel] = a.confianca[nivel].plus(custo);
}

/**
 * Consome custo de forma proporcional ao que sai, preservando a composição
 * de confiança. Se 30% do custo é estimado, 30% do custo baixado é estimado.
 */
function baixarCusto(a: Acumulador, fracao: Decimal): { custo: Decimal; incerto: boolean } {
  const custoBaixado = a.custo.times(fracao);
  let incerto = false;
  for (const nivel of ['documentado', 'estimado', 'arbitrado', 'ausente'] as Confianca[]) {
    const parcela = a.confianca[nivel].times(fracao);
    if (nivel !== 'documentado' && parcela.gt(POEIRA)) incerto = true;
    a.confianca[nivel] = a.confianca[nivel].minus(parcela);
  }
  a.custo = a.custo.minus(custoBaixado);
  return { custo: custoBaixado, incerto };
}

export interface ResultadoApuracao {
  posicoes: Posicao[];
  alienacoes: Alienacao[];
  avisos: string[];
}

/**
 * Processa lançamentos pelo método do custo médio ponderado e devolve
 * as posições finais e todas as alienações apuradas.
 *
 * Determinístico: mesma entrada, mesma saída. Sem rede, sem relógio, sem banco.
 */
export function apurar(lancamentos: Lancamento[]): ResultadoApuracao {
  // Ordem cronológica é obrigatória: custo médio depende da sequência.
  // Empate de timestamp resolve pelo id, para o resultado ser reproduzível.
  const ordenados = [...lancamentos].sort((x, y) => {
    const c = x.ocorridoEm.localeCompare(y.ocorridoEm);
    return c !== 0 ? c : x.id.localeCompare(y.id);
  });

  const contas = new Map<string, Acumulador>();
  const alienacoes: Alienacao[] = [];
  const avisos: string[] = [];

  const conta = (ativoId: string) => {
    if (!contas.has(ativoId)) contas.set(ativoId, novoAcumulador(ativoId));
    return contas.get(ativoId)!;
  };

  for (const l of ordenados) {
    const qtd = d(l.quantidade);
    if (qtd.lte(0)) {
      throw new ErroApuracao(`Lançamento ${l.id} tem quantidade não positiva.`, l.id, 'QTD_INVALIDA');
    }
    const a = conta(l.ativoId);

    switch (l.tipo) {
      // ── Entradas com custo ────────────────────────────────────────
      case 'compra':
      case 'permuta_entrada':
      case 'rendimento':
      case 'airdrop':
      case 'bonificacao': {
        if (l.precoUnitario === undefined) {
          throw new ErroApuracao(
            `Lançamento ${l.id} (${l.tipo}) precisa de preço unitário.`,
            l.id,
            'PRECO_AUSENTE'
          );
        }
        // A taxa de aquisição integra o custo do bem.
        const bruto = qtd.times(d(l.precoUnitario)).plus(d(l.taxa));
        a.quantidade = a.quantidade.plus(qtd);
        adicionarCusto(a, paraBrl(l, bruto), l.confianca);
        break;
      }

      // ── Saídas com apuração de ganho ──────────────────────────────
      case 'venda':
      case 'permuta_saida': {
        if (l.precoUnitario === undefined) {
          throw new ErroApuracao(
            `Lançamento ${l.id} (${l.tipo}) precisa de preço unitário.`,
            l.id,
            'PRECO_AUSENTE'
          );
        }
        if (qtd.gt(a.quantidade.plus(POEIRA))) {
          throw new ErroApuracao(
            `Lançamento ${l.id} aliena ${qtd} de ${l.ativoId}, mas o saldo é ${a.quantidade}. ` +
              `Falta registrar aquisições anteriores.`,
            l.id,
            'SALDO_INSUFICIENTE'
          );
        }
        // A taxa de venda reduz o valor recebido.
        const liquido = qtd.times(d(l.precoUnitario)).minus(d(l.taxa));
        const valorBrl = paraBrl(l, liquido);
        const fracao = a.quantidade.isZero() ? ZERO : qtd.div(a.quantidade);
        const { custo, incerto } = baixarCusto(a, fracao);
        a.quantidade = a.quantidade.minus(qtd);

        alienacoes.push({
          lancamentoId: l.id,
          ativoId: l.ativoId,
          data: l.ocorridoEm,
          regime: l.regime,
          quantidade: qtd,
          valorAlienacaoBrl: valorBrl,
          custoBrl: custo,
          ganhoBrl: valorBrl.minus(custo),
          custoIncerto: incerto,
        });

        if (incerto) {
          avisos.push(
            `A alienação ${l.id} consumiu custo não documentado. O ganho apurado é estimativa.`
          );
        }
        break;
      }

      // ── Saídas sem apuração de ganho ──────────────────────────────
      // Taxa paga no próprio ativo e perda definitiva reduzem quantidade
      // e baixam o custo proporcional, sem gerar ganho tributável.
      case 'taxa':
      case 'perda': {
        if (qtd.gt(a.quantidade.plus(POEIRA))) {
          throw new ErroApuracao(
            `Lançamento ${l.id} baixa ${qtd} de ${l.ativoId}, mas o saldo é ${a.quantidade}.`,
            l.id,
            'SALDO_INSUFICIENTE'
          );
        }
        const fracao = a.quantidade.isZero() ? ZERO : qtd.div(a.quantidade);
        baixarCusto(a, fracao);
        a.quantidade = a.quantidade.minus(qtd);
        break;
      }

      // ── Neutros ───────────────────────────────────────────────────
      // Movimentação entre custódias do mesmo titular não é alienação
      // e não altera custo. Fica registrada para auditoria.
      case 'transferencia_entrada':
      case 'transferencia_saida':
        break;
    }
  }

  const posicoes: Posicao[] = [...contas.values()].map((a) => {
    // Resíduo de arredondamento não deve virar posição fantasma.
    const quantidade = a.quantidade.abs().lt(POEIRA) ? ZERO : a.quantidade;
    const custo = quantidade.isZero() ? ZERO : a.custo;
    const documentado = quantidade.isZero() ? ZERO : a.confianca.documentado;
    return {
      ativoId: a.ativoId,
      quantidade,
      custoTotalBrl: custo,
      custoMedioBrl: quantidade.isZero() ? ZERO : custo.div(quantidade),
      confianca: quantidade.isZero() ? perfilVazio() : a.confianca,
      indiceDocumentacao: custo.isZero() ? ZERO : documentado.div(custo),
    };
  });

  return { posicoes, alienacoes, avisos };
}

/** Verificações que devem valer sempre. Usadas em teste e como guarda em produção. */
export function verificarInvariantes(r: ResultadoApuracao): string[] {
  const falhas: string[] = [];
  for (const p of r.posicoes) {
    if (p.quantidade.lt(0)) falhas.push(`${p.ativoId}: quantidade negativa`);
    if (p.custoTotalBrl.lt(0)) falhas.push(`${p.ativoId}: custo negativo`);
    if (p.quantidade.gt(0) && p.custoMedioBrl.lt(0)) {
      falhas.push(`${p.ativoId}: custo médio negativo`);
    }
    const soma = p.confianca.documentado
      .plus(p.confianca.estimado)
      .plus(p.confianca.arbitrado)
      .plus(p.confianca.ausente);
    if (!soma.minus(p.custoTotalBrl).abs().lt('1e-12')) {
      falhas.push(`${p.ativoId}: perfil de confiança não fecha com o custo total`);
    }
  }
  return falhas;
}
