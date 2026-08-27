import {
  Decimal,
  type Alienacao,
  type ApuracaoAnualExterior,
  type ApuracaoMensal,
} from './tipos.js';

const ZERO = new Decimal(0);

/**
 * ATENÇÃO — este módulo produz SIMULAÇÃO, não apuração oficial.
 *
 * Os parâmetros abaixo refletem a leitura das regras vigentes em agosto de 2026
 * e são deliberadamente externalizados: quando a regra mudar, muda-se a tabela,
 * não o algoritmo. Todo resultado deve ser conferido por profissional habilitado
 * antes de virar declaração ou pagamento.
 */
export interface ParametrosFiscais {
  /** Teto mensal de alienações no regime nacional abaixo do qual há isenção. */
  isencaoMensalNacional: Decimal;
  /** Faixas progressivas de ganho de capital: [limite superior, alíquota]. */
  faixasGanhoCapital: Array<{ ate: Decimal; aliquota: Decimal }>;
  /** Alíquota fixa do regime de bens no exterior. */
  aliquotaExterior: Decimal;
  /**
   * Se falso, perdas não abatem ganhos dentro do mês no regime nacional —
   * leitura conservadora, operação a operação. Confirme com o contador.
   */
  compensarPerdasNoMesNacional: boolean;
  vigenciaDescrita: string;
}

export const PARAMETROS_BR_2026: ParametrosFiscais = {
  isencaoMensalNacional: new Decimal('35000'),
  faixasGanhoCapital: [
    { ate: new Decimal('5000000'), aliquota: new Decimal('0.15') },
    { ate: new Decimal('10000000'), aliquota: new Decimal('0.175') },
    { ate: new Decimal('30000000'), aliquota: new Decimal('0.20') },
    { ate: new Decimal(Infinity), aliquota: new Decimal('0.225') },
  ],
  aliquotaExterior: new Decimal('0.15'),
  compensarPerdasNoMesNacional: false,
  vigenciaDescrita: 'Parâmetros conforme leitura das regras vigentes em agosto de 2026',
};

/** Aplica a tabela progressiva de forma cumulativa por faixa. */
export function impostoProgressivo(base: Decimal, p: ParametrosFiscais): Decimal {
  if (base.lte(0)) return ZERO;
  let imposto = ZERO;
  let piso = ZERO;
  for (const faixa of p.faixasGanhoCapital) {
    if (base.lte(piso)) break;
    const topo = Decimal.min(base, faixa.ate);
    imposto = imposto.plus(topo.minus(piso).times(faixa.aliquota));
    piso = faixa.ate;
  }
  return imposto;
}

const competenciaDe = (iso: string) => iso.slice(0, 7);

/**
 * Simula a apuração mensal do regime nacional.
 * A isenção é avaliada sobre o TOTAL de alienações do mês — somando todas as
 * carteiras e corretoras nacionais, não por operação.
 */
export function simularMensalNacional(
  alienacoes: Alienacao[],
  p: ParametrosFiscais = PARAMETROS_BR_2026
): ApuracaoMensal[] {
  const porMes = new Map<string, Alienacao[]>();
  for (const a of alienacoes) {
    if (a.regime !== 'nacional') continue;
    const c = competenciaDe(a.data);
    if (!porMes.has(c)) porMes.set(c, []);
    porMes.get(c)!.push(a);
  }

  return [...porMes.entries()]
    .sort(([x], [y]) => x.localeCompare(y))
    .map(([competencia, lista]) => {
      const totalAlienacoes = lista.reduce((s, a) => s.plus(a.valorAlienacaoBrl), ZERO);
      const ganhoBruto = lista.reduce(
        (s, a) => (a.ganhoBrl.gt(0) ? s.plus(a.ganhoBrl) : s),
        ZERO
      );
      const resultadoLiquido = lista.reduce((s, a) => s.plus(a.ganhoBrl), ZERO);

      const isento = totalAlienacoes.lte(p.isencaoMensalNacional);
      const baseBruta = p.compensarPerdasNoMesNacional ? resultadoLiquido : ganhoBruto;
      const baseCalculo = isento || baseBruta.lte(0) ? ZERO : baseBruta;
      const imposto = impostoProgressivo(baseCalculo, p);

      return {
        competencia,
        regime: 'nacional' as const,
        totalAlienacoesBrl: totalAlienacoes,
        ganhoBrutoBrl: ganhoBruto,
        resultadoLiquidoBrl: resultadoLiquido,
        isento,
        motivoIsencao: isento
          ? `Alienações do mês (R$ ${totalAlienacoes.toFixed(2)}) dentro do limite de ` +
            `R$ ${p.isencaoMensalNacional.toFixed(2)}`
          : undefined,
        baseCalculoBrl: baseCalculo,
        impostoBrl: imposto,
        aliquotaEfetiva: baseCalculo.isZero() ? ZERO : imposto.div(baseCalculo),
        alienacoes: lista,
      };
    });
}

/**
 * Simula a apuração anual do regime de bens no exterior.
 * Diferente do nacional: perdas compensam ganhos dentro do período e não há
 * isenção por volume.
 */
export function simularAnualExterior(
  alienacoes: Alienacao[],
  p: ParametrosFiscais = PARAMETROS_BR_2026
): ApuracaoAnualExterior[] {
  const porAno = new Map<number, Alienacao[]>();
  for (const a of alienacoes) {
    if (a.regime !== 'exterior') continue;
    const ano = Number(a.data.slice(0, 4));
    if (!porAno.has(ano)) porAno.set(ano, []);
    porAno.get(ano)!.push(a);
  }

  return [...porAno.entries()]
    .sort(([x], [y]) => x - y)
    .map(([ano, lista]) => {
      const total = lista.reduce((s, a) => s.plus(a.valorAlienacaoBrl), ZERO);
      const resultado = lista.reduce((s, a) => s.plus(a.ganhoBrl), ZERO);
      const base = Decimal.max(resultado, ZERO);
      return {
        ano,
        regime: 'exterior' as const,
        totalAlienacoesBrl: total,
        resultadoLiquidoBrl: resultado,
        baseCalculoBrl: base,
        impostoBrl: base.times(p.aliquotaExterior),
        alienacoes: lista,
      };
    });
}

/** Texto obrigatório em qualquer saída deste módulo. */
export const AVISO_SIMULACAO =
  'Este relatório é uma SIMULAÇÃO gerada automaticamente a partir dos lançamentos ' +
  'informados. Não constitui apuração fiscal, orientação tributária ou recomendação ' +
  'de investimento. Os valores dependem da exatidão e da completude dos dados ' +
  'inseridos e da interpretação da legislação vigente. Confira com contador ou ' +
  'advogado tributarista habilitado antes de declarar ou recolher qualquer tributo.';
