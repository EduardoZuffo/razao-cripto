import Decimal from 'decimal.js';

// 28 casas cobrem satoshis (8) e wei (18) com folga para arredondamento intermediário.
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

/** Valor monetário ou quantidade. Sempre string na fronteira, Decimal por dentro. */
export type Valor = string | number | Decimal;

export type TipoLancamento =
  | 'compra'
  | 'venda'
  | 'permuta_saida'
  | 'permuta_entrada'
  | 'transferencia_entrada'
  | 'transferencia_saida'
  | 'rendimento'
  | 'airdrop'
  | 'bonificacao'
  | 'taxa'
  | 'perda';

/**
 * Regime tributário aplicável à operação.
 *  nacional — corretora no Brasil: apuração mensal, isenção por volume de alienações.
 *  exterior — corretora estrangeira ou DeFi: apuração anual, alíquota fixa.
 * O regime é do fato, não do ativo: o mesmo BTC pode gerar operações nos dois.
 */
export type Regime = 'nacional' | 'exterior';

export type Origem =
  | 'importado_corretora'
  | 'importado_onchain'
  | 'declaracao_irpf'
  | 'manual'
  | 'reconstruido'
  | 'abertura';

export type Confianca = 'documentado' | 'estimado' | 'arbitrado' | 'ausente';

export interface Lancamento {
  id: string;
  ativoId: string;
  tipo: TipoLancamento;
  /** ISO 8601. Define competência mensal e anual. */
  ocorridoEm: string;
  quantidade: Valor;
  /** Preço unitário na moeda do lançamento. Ausente em transferência e perda. */
  precoUnitario?: Valor;
  moeda: string;
  /** BRL por unidade da moeda do lançamento, na data do fato. Obrigatório se moeda ≠ BRL. */
  cambioBrl?: Valor;
  /** Taxa de corretagem ou rede, na moeda do lançamento. */
  taxa?: Valor;
  regime: Regime;
  origem: Origem;
  confianca: Confianca;
  /** Amarra as duas pernas de uma permuta. */
  parId?: string;
}

/** Quanto do custo de uma posição vem de cada nível de confiança, em BRL. */
export interface PerfilConfianca {
  documentado: Decimal;
  estimado: Decimal;
  arbitrado: Decimal;
  ausente: Decimal;
}

export interface Posicao {
  ativoId: string;
  quantidade: Decimal;
  custoTotalBrl: Decimal;
  custoMedioBrl: Decimal;
  confianca: PerfilConfianca;
  /** Fração do custo com comprovação documental, de 0 a 1. */
  indiceDocumentacao: Decimal;
}

/** Uma alienação apurada: saída de ativo com apuração de ganho. */
export interface Alienacao {
  lancamentoId: string;
  ativoId: string;
  data: string;
  regime: Regime;
  quantidade: Decimal;
  /** Valor recebido, líquido de taxas, em BRL. */
  valorAlienacaoBrl: Decimal;
  /** Parcela do custo médio consumida por esta saída. */
  custoBrl: Decimal;
  ganhoBrl: Decimal;
  /** Verdadeiro quando o custo consumido tem qualquer parcela não documentada. */
  custoIncerto: boolean;
}

export interface ApuracaoMensal {
  /** 'AAAA-MM' */
  competencia: string;
  regime: 'nacional';
  totalAlienacoesBrl: Decimal;
  /** Soma apenas dos ganhos positivos, operação a operação. */
  ganhoBrutoBrl: Decimal;
  /** Ganhos menos perdas. Exposto para conferência com o contador. */
  resultadoLiquidoBrl: Decimal;
  isento: boolean;
  motivoIsencao?: string;
  baseCalculoBrl: Decimal;
  impostoBrl: Decimal;
  aliquotaEfetiva: Decimal;
  alienacoes: Alienacao[];
}

export interface ApuracaoAnualExterior {
  ano: number;
  regime: 'exterior';
  totalAlienacoesBrl: Decimal;
  /** No exterior, perdas compensam ganhos dentro do mesmo período. */
  resultadoLiquidoBrl: Decimal;
  baseCalculoBrl: Decimal;
  impostoBrl: Decimal;
  alienacoes: Alienacao[];
}

export class ErroApuracao extends Error {
  constructor(
    message: string,
    readonly lancamentoId?: string,
    readonly codigo?: string
  ) {
    super(message);
    this.name = 'ErroApuracao';
  }
}
