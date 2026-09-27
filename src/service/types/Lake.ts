export interface ILakeProcesso {
  id: number;
  [key: string]: unknown;
}

export interface ILakeMetric {
  key: string;
  label: string;
  value: number;
  format?: "number" | "percent" | "currency";
}

export interface ILakeBreakdownItem {
  key: string;
  label: string;
  value: number;
  extra: number | null;
}

export interface ILakeBreakdown {
  key: string;
  label: string;
  items: ILakeBreakdownItem[];
}

export interface ILakeTimeseries {
  key: string;
  label: string;
  months: string[];
  series: { key: string; label: string; values: number[] }[];
}

export interface ILakeSection {
  key: string;
  title: string;
  description: string;
  metrics: ILakeMetric[];
  breakdowns: ILakeBreakdown[];
  timeseries: ILakeTimeseries[];
}

export interface ILakeRepresentante {
  id: number;
  id_processo: number;
  polo: string;
  parte_nome: string | null;
  advogado_nome: string;
  oab_numero: string | null;
  oab_uf: string | null;
  documento: string | null;
}

export interface ILakeMovimentacao {
  data_movimentacao: string;
  descricao: string;
}

export interface ILakeProcessoDetail {
  processo: Record<string, unknown>;
  representantes: ILakeRepresentante[];
  movimentacoes: ILakeMovimentacao[];
  outrasInfo: unknown;
}

export interface ILakeFreshness {
  refreshed_at: string | null;
  processos: number;
}

export interface ILakeSearchParams {
  search?: string;
  fromDate?: string;
  toDate?: string;
  filters?: Record<string, string>;
  sort?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}
