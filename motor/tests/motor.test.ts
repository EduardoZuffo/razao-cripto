import { describe, expect, it } from 'vitest';
import { apurar, verificarInvariantes } from '../src/posicoes.js';
import {
  PARAMETROS_BR_2026,
  impostoProgressivo,
  simularAnualExterior,
  simularMensalNacional,
} from '../src/tributacao.js';
import { Decimal, ErroApuracao, type Lancamento } from '../src/tipos.js';

/** Fábrica enxuta: só o que o caso de teste realmente varia. */
const lanc = (p: Partial<Lancamento> & Pick<Lancamento, 'id' | 'tipo' | 'quantidade'>): Lancamento => ({
  ativoId: 'bitcoin',
  ocorridoEm: '2025-01-15T10:00:00Z',
  moeda: 'BRL',
  regime: 'nacional',
  origem: 'manual',
  confianca: 'documentado',
  ...p,
});

const perto = (a: Decimal, esperado: string, tolerancia = '0.00000001') =>
  expect(a.minus(esperado).abs().lte(tolerancia)).toBe(true);

describe('custo médio ponderado', () => {
  it('calcula a média de duas compras a preços diferentes', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '0.5', precoUnitario: '180000', ocorridoEm: '2025-01-10T00:00:00Z' }),
      lanc({ id: '2', tipo: 'compra', quantidade: '0.7', precoUnitario: '210000', ocorridoEm: '2025-02-10T00:00:00Z' }),
    ]);
    const btc = r.posicoes[0];
    perto(btc.quantidade, '1.2');
    // (180000×0,5 + 210000×0,7) / 1,2 = 197500
    perto(btc.custoMedioBrl, '197500');
    perto(btc.custoTotalBrl, '237000');
    expect(verificarInvariantes(r)).toEqual([]);
  });

  it('mantém o custo médio inalterado após uma venda parcial', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'venda', quantidade: '0.4', precoUnitario: '150000', ocorridoEm: '2025-03-01T00:00:00Z' }),
    ]);
    perto(r.posicoes[0].quantidade, '0.6');
    perto(r.posicoes[0].custoMedioBrl, '100000');
    perto(r.posicoes[0].custoTotalBrl, '60000');
    perto(r.alienacoes[0].ganhoBrl, '20000'); // 60000 recebido − 40000 de custo
  });

  it('incorpora a taxa de corretagem ao custo de aquisição', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '100000', taxa: '500' }),
    ]);
    perto(r.posicoes[0].custoTotalBrl, '100500');
  });

  it('deduz a taxa do valor recebido na venda', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'venda', quantidade: '1', precoUnitario: '150000', taxa: '300', ocorridoEm: '2025-02-01T00:00:00Z' }),
    ]);
    perto(r.alienacoes[0].valorAlienacaoBrl, '149700');
    perto(r.alienacoes[0].ganhoBrl, '49700');
  });

  it('zera a posição e o custo quando tudo é vendido', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '2', precoUnitario: '50000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'venda', quantidade: '2', precoUnitario: '60000', ocorridoEm: '2025-02-01T00:00:00Z' }),
    ]);
    expect(r.posicoes[0].quantidade.isZero()).toBe(true);
    expect(r.posicoes[0].custoTotalBrl.isZero()).toBe(true);
  });
});

describe('ordem cronológica', () => {
  it('produz o mesmo resultado independente da ordem de entrada', () => {
    const base: Lancamento[] = [
      lanc({ id: 'a', tipo: 'compra', quantidade: '1', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: 'b', tipo: 'compra', quantidade: '1', precoUnitario: '200000', ocorridoEm: '2025-02-01T00:00:00Z' }),
      lanc({ id: 'c', tipo: 'venda', quantidade: '1', precoUnitario: '250000', ocorridoEm: '2025-03-01T00:00:00Z' }),
    ];
    const direto = apurar(base);
    const invertido = apurar([...base].reverse());
    perto(invertido.posicoes[0].custoMedioBrl, direto.posicoes[0].custoMedioBrl.toString());
    perto(invertido.alienacoes[0].ganhoBrl, direto.alienacoes[0].ganhoBrl.toString());
    perto(direto.alienacoes[0].ganhoBrl, '100000'); // 250000 − 150000 de custo médio
  });
});

describe('câmbio na data do fato', () => {
  it('converte operação em dólar pelo câmbio gravado, não pelo atual', () => {
    const r = apurar([
      lanc({
        id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '20000',
        moeda: 'USD', cambioBrl: '5.00', ocorridoEm: '2025-01-01T00:00:00Z',
      }),
      lanc({
        id: '2', tipo: 'venda', quantidade: '1', precoUnitario: '25000',
        moeda: 'USD', cambioBrl: '6.00', ocorridoEm: '2025-06-01T00:00:00Z',
      }),
    ]);
    // Custo R$100.000, venda R$150.000 — o ganho cambial integra o ganho tributável
    perto(r.alienacoes[0].custoBrl, '100000');
    perto(r.alienacoes[0].valorAlienacaoBrl, '150000');
    perto(r.alienacoes[0].ganhoBrl, '50000');
  });

  it('recusa lançamento em moeda estrangeira sem câmbio', () => {
    expect(() =>
      apurar([lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '20000', moeda: 'USD' })])
    ).toThrow(ErroApuracao);
  });
});

describe('permuta cripto por cripto', () => {
  it('realiza ganho na perna de saída e forma custo na de entrada', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', ativoId: 'ethereum', quantidade: '10', precoUnitario: '10000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'permuta_saida', ativoId: 'ethereum', quantidade: '10', precoUnitario: '18000', ocorridoEm: '2025-05-01T00:00:00Z', parId: '3' }),
      lanc({ id: '3', tipo: 'permuta_entrada', ativoId: 'solana', quantidade: '400', precoUnitario: '450', ocorridoEm: '2025-05-01T00:00:00Z', parId: '2' }),
    ]);
    const eth = r.posicoes.find((p) => p.ativoId === 'ethereum')!;
    const sol = r.posicoes.find((p) => p.ativoId === 'solana')!;
    expect(eth.quantidade.isZero()).toBe(true);
    perto(sol.quantidade, '400');
    perto(sol.custoTotalBrl, '180000');       // mesmo valor da perna de saída
    perto(r.alienacoes[0].ganhoBrl, '80000'); // 180000 − 100000
    expect(r.alienacoes).toHaveLength(1);     // só a saída é alienação
  });
});

describe('eventos sem contraparte financeira', () => {
  it('entra rendimento pelo valor de mercado da data', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'rendimento', quantidade: '0.01', precoUnitario: '120000', ocorridoEm: '2025-02-01T00:00:00Z' }),
    ]);
    perto(r.posicoes[0].quantidade, '1.01');
    perto(r.posicoes[0].custoTotalBrl, '101200');
  });

  it('trata transferência entre custódias como neutra', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'transferencia_saida', quantidade: '1', ocorridoEm: '2025-02-01T00:00:00Z' }),
      lanc({ id: '3', tipo: 'transferencia_entrada', quantidade: '1', ocorridoEm: '2025-02-01T00:00:01Z' }),
    ]);
    perto(r.posicoes[0].quantidade, '1');
    perto(r.posicoes[0].custoTotalBrl, '100000');
    expect(r.alienacoes).toHaveLength(0);
  });

  it('baixa perda sem gerar ganho tributável', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '2', precoUnitario: '50000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'perda', quantidade: '1', ocorridoEm: '2025-02-01T00:00:00Z' }),
    ]);
    perto(r.posicoes[0].quantidade, '1');
    perto(r.posicoes[0].custoTotalBrl, '50000');
    expect(r.alienacoes).toHaveLength(0);
  });
});

describe('procedência e confiança do custo', () => {
  it('mede a fração documentada da posição', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '75000', confianca: 'documentado', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'compra', quantidade: '1', precoUnitario: '25000', confianca: 'estimado', origem: 'reconstruido', ocorridoEm: '2025-02-01T00:00:00Z' }),
    ]);
    perto(r.posicoes[0].indiceDocumentacao, '0.75');
    perto(r.posicoes[0].confianca.estimado, '25000');
  });

  it('preserva a proporção de confiança ao baixar custo', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '80000', confianca: 'documentado', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'compra', quantidade: '1', precoUnitario: '20000', confianca: 'ausente', origem: 'abertura', ocorridoEm: '2025-02-01T00:00:00Z' }),
      lanc({ id: '3', tipo: 'venda', quantidade: '1', precoUnitario: '90000', ocorridoEm: '2025-03-01T00:00:00Z' }),
    ]);
    perto(r.posicoes[0].indiceDocumentacao, '0.8'); // proporção intacta após a saída
    expect(r.alienacoes[0].custoIncerto).toBe(true);
    expect(r.avisos.length).toBeGreaterThan(0);
    expect(verificarInvariantes(r)).toEqual([]);
  });

  it('trata custo ausente como zero, maximizando o ganho apurado', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '0', origem: 'abertura', confianca: 'ausente', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'venda', quantidade: '1', precoUnitario: '90000', ocorridoEm: '2025-03-01T00:00:00Z' }),
    ]);
    perto(r.alienacoes[0].ganhoBrl, '90000'); // conservador: paga mais, nunca menos
  });
});

describe('validações', () => {
  it('recusa venda maior que o saldo', () => {
    expect(() =>
      apurar([
        lanc({ id: '1', tipo: 'compra', quantidade: '0.5', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
        lanc({ id: '2', tipo: 'venda', quantidade: '1', precoUnitario: '150000', ocorridoEm: '2025-02-01T00:00:00Z' }),
      ])
    ).toThrow(/saldo/i);
  });

  it('recusa quantidade não positiva', () => {
    expect(() => apurar([lanc({ id: '1', tipo: 'compra', quantidade: '0', precoUnitario: '1' })])).toThrow(ErroApuracao);
  });

  it('recusa compra sem preço', () => {
    expect(() => apurar([lanc({ id: '1', tipo: 'compra', quantidade: '1' })])).toThrow(/preço/i);
  });
});

describe('simulação — regime nacional', () => {
  it('isenta o mês cujas alienações não superam o teto', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'venda', quantidade: '0.2', precoUnitario: '150000', ocorridoEm: '2025-03-10T00:00:00Z' }),
    ]);
    const [mes] = simularMensalNacional(r.alienacoes);
    expect(mes.competencia).toBe('2025-03');
    perto(mes.totalAlienacoesBrl, '30000');
    expect(mes.isento).toBe(true);
    expect(mes.impostoBrl.isZero()).toBe(true);
    expect(mes.motivoIsencao).toBeTruthy();
  });

  it('tributa quando o total do mês supera o teto', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '1', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'venda', quantidade: '0.4', precoUnitario: '150000', ocorridoEm: '2025-03-10T00:00:00Z' }),
    ]);
    const [mes] = simularMensalNacional(r.alienacoes);
    perto(mes.totalAlienacoesBrl, '60000');
    expect(mes.isento).toBe(false);
    perto(mes.ganhoBrutoBrl, '20000');
    perto(mes.impostoBrl, '3000'); // 15%
  });

  it('soma alienações do mês inteiro para avaliar a isenção', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '2', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'venda', quantidade: '0.15', precoUnitario: '150000', ocorridoEm: '2025-03-05T00:00:00Z' }),
      lanc({ id: '3', tipo: 'venda', quantidade: '0.15', precoUnitario: '150000', ocorridoEm: '2025-03-25T00:00:00Z' }),
    ]);
    const [mes] = simularMensalNacional(r.alienacoes);
    perto(mes.totalAlienacoesBrl, '45000'); // duas de 22.500 estouram o teto juntas
    expect(mes.isento).toBe(false);
  });

  it('não compensa perdas com ganhos por padrão', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', ativoId: 'bitcoin', quantidade: '1', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'compra', ativoId: 'solana', quantidade: '100', precoUnitario: '1000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '3', tipo: 'venda', ativoId: 'bitcoin', quantidade: '0.5', precoUnitario: '160000', ocorridoEm: '2025-04-10T00:00:00Z' }),
      lanc({ id: '4', tipo: 'venda', ativoId: 'solana', quantidade: '50', precoUnitario: '400', ocorridoEm: '2025-04-20T00:00:00Z' }),
    ]);
    const [mes] = simularMensalNacional(r.alienacoes);
    perto(mes.ganhoBrutoBrl, '30000');       // só o lucro do bitcoin
    perto(mes.resultadoLiquidoBrl, '0');     // menos o prejuízo de 30000 na solana
    perto(mes.baseCalculoBrl, '30000');      // leitura conservadora

    const comCompensacao = simularMensalNacional(r.alienacoes, {
      ...PARAMETROS_BR_2026,
      compensarPerdasNoMesNacional: true,
    });
    expect(comCompensacao[0].impostoBrl.isZero()).toBe(true);
  });

  it('aplica a tabela progressiva por faixa, não a alíquota do topo', () => {
    const imposto = impostoProgressivo(new Decimal('6000000'), PARAMETROS_BR_2026);
    // 5.000.000 × 15% + 1.000.000 × 17,5%
    perto(imposto, '925000');
  });
});

describe('simulação — regime exterior', () => {
  it('apura no ano, compensa perdas e aplica alíquota fixa', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', ativoId: 'bitcoin', quantidade: '1', precoUnitario: '100000', regime: 'exterior', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'compra', ativoId: 'solana', quantidade: '100', precoUnitario: '1000', regime: 'exterior', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '3', tipo: 'venda', ativoId: 'bitcoin', quantidade: '1', precoUnitario: '160000', regime: 'exterior', ocorridoEm: '2025-04-10T00:00:00Z' }),
      lanc({ id: '4', tipo: 'venda', ativoId: 'solana', quantidade: '100', precoUnitario: '800', regime: 'exterior', ocorridoEm: '2025-09-20T00:00:00Z' }),
    ]);
    const [ano] = simularAnualExterior(r.alienacoes);
    expect(ano.ano).toBe(2025);
    perto(ano.resultadoLiquidoBrl, '40000'); // +60000 e −20000
    perto(ano.impostoBrl, '6000');           // 15%
  });

  it('separa os dois regimes na mesma carteira', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', quantidade: '2', precoUnitario: '100000', ocorridoEm: '2025-01-01T00:00:00Z' }),
      lanc({ id: '2', tipo: 'venda', quantidade: '0.5', precoUnitario: '150000', regime: 'nacional', ocorridoEm: '2025-04-10T00:00:00Z' }),
      lanc({ id: '3', tipo: 'venda', quantidade: '0.5', precoUnitario: '150000', regime: 'exterior', ocorridoEm: '2025-04-10T00:00:00Z' }),
    ]);
    expect(simularMensalNacional(r.alienacoes)).toHaveLength(1);
    expect(simularAnualExterior(r.alienacoes)).toHaveLength(1);
  });
});

describe('precisão numérica', () => {
  it('não acumula erro de ponto flutuante em muitos aportes', () => {
    const lancamentos: Lancamento[] = [];
    for (let i = 0; i < 365; i++) {
      const dia = new Date(Date.UTC(2025, 0, 1 + i)).toISOString();
      lancamentos.push(lanc({ id: `c${i}`, tipo: 'compra', quantidade: '0.001', precoUnitario: '100000', ocorridoEm: dia }));
    }
    const r = apurar(lancamentos);
    perto(r.posicoes[0].quantidade, '0.365', '1e-15'); // 0.001×365 — em float daria 0.36500000000000005
    perto(r.posicoes[0].custoTotalBrl, '36500', '1e-9');
    expect(verificarInvariantes(r)).toEqual([]);
  });

  it('suporta quantidades na casa do wei', () => {
    const r = apurar([
      lanc({ id: '1', tipo: 'compra', ativoId: 'ethereum', quantidade: '0.000000000000000001', precoUnitario: '20000' }),
    ]);
    perto(r.posicoes[0].quantidade, '0.000000000000000001', '1e-24');
  });
});
