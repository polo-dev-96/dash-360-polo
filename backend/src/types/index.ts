export interface FiltroData {
  dataInicio: string;
  dataFim: string;
  excluirEquipeAtivo?: boolean;
}

export interface KPIOverview {
  totalAtendimentos: number;
  concluidos: number;
  pendentes: number;
  tempoEsperaMedioSegundos: number;
  tempoAtendimentoMedioSegundos: number;
  tempoEsperaFormatado: string;
  tempoAtendimentoFormatado: string;
}

export interface TimelineData {
  data: string;
  total: number;
  concluidos: number;
  tempoEsperaMedio: number;
  tempoAtendimentoMedio: number;
}

export interface EquipeStats {
  equipe: string;
  total: number;
  tempoMedioSegundos: number;
  tempoMedioFormatado: string;
  tempoEsperaMedioSegundos: number;
  tempoEsperaMedioFormatado: string;
}

export interface AgenteStats {
  agente: string;
  total: number;
  tempoMedioSegundos: number;
  tempoMedioFormatado: string;
  tempoPrimeiraRespostaSegundos: number;
  tempoPrimeiraRespostaFormatado: string;
}

export interface NumeroCanalStats {
  numero: string;
  total: number;
  percentual: number;
}

export interface CanalStats {
  canal: string;
  total: number;
  percentual: number;
  numeros?: NumeroCanalStats[];
}

export interface FiltroClassificacao extends FiltroData {
  classificacao?: string;
}

export interface ClassificacaoStats {
  classificacao: string;
  total: number;
  percentual: number;
}

export interface ClassificacaoPorAgente {
  agente: string;
  classificacao: string;
  total: number;
}
