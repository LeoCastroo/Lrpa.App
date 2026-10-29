import { FailureKind } from "./Service";

/**
 * Classificação da falha gravada pelo próprio robô: "tratativa" (Requer Tratativa — a regra de
 * negócio pede ação do escritório), "automacao" (Falha da Automação — bug ou infraestrutura, ação
 * da LCS) ou "sem_classe" (registro anterior à classificação).
 */
export type FailureClassification = "tratativa" | "automacao" | "sem_classe";

export interface IClassCounts {
  tratativa: number;
  automacao: number;
  semClasse: number;
}

export type ExecutionState = "running" | "success" | "failed" | "interrupted";

export interface IExecution {
  id: number;
  state: ExecutionState;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  durationSeconds: number | null;
  ok: number;
  fail: number;
  /** Só em serviços com classificação de falha. */
  failTratativa?: number;
  failAutomacao?: number;
  secondaryFailures: number;
}

export interface IFailureReasonCount {
  key: string;
  title: string;
  kind: FailureKind | null;
  explanation: string;
  action: string;
  count: number;
  /** Só em serviços com classificação de falha: como as falhas deste motivo se dividem. */
  classes?: IClassCounts;
}

export interface IPanelSummary {
  period: { from: string; to: string };
  lastExecution: IExecution | null;
  kpis: {
    total: number;
    ok: number;
    fail: number;
    successRate: number | null;
    processes: number;
    /** Só em serviços com classificação de falha (null nos demais). */
    failClasses: IClassCounts | null;
    secondaryFailures: { label: string; attempts: number; processes: number } | null;
    amount: { label: string; total: number } | null;
  };
  daily: { day: string; ok: number; fail: number; failClasses?: IClassCounts }[];
  failuresByReason: IFailureReasonCount[];
}

export interface IPanelItem {
  id: number;
  success: boolean;
  message: string | null;
  date: string | null;
  executionId: number | null;
  reason: { key: string; title: string; kind: FailureKind | null } | null;
  /** Só em serviços com classificação de falha; null quando o item deu certo. */
  classification: FailureClassification | null;
  values: Record<string, unknown>;
}

export interface IPaginated<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IFailureReasonDoc {
  key: string;
  title: string;
  match: string[];
  kind: FailureKind;
  explanation: string;
  action: string;
}

export interface ISourceReport {
  sistema: string;
  id: string;
  nome: string;
  descricao?: string;
  destaque?: { titulo: string; itens: string[] };
}

export interface IRpaDoc {
  updatedAt: string;
  objetivo: string;
  quandoRoda: string;
  origem: { intro: string; itens: string[]; relatorio?: ISourceReport };
  passos: string[];
  sucesso: string[];
  falhas: { intro: string; motivos: IFailureReasonDoc[] };
  glossario: { termo: string; significado: string }[];
  observacoes?: string[];
}

export interface IServiceDocs {
  key: string;
  name: string;
  docs: IRpaDoc;
}

export interface IInsightMetric {
  key: string;
  label: string;
  value: number;
  headline?: string;
  format?: "number" | "percent" | "currency";
  percentOf?: number | null;
}

export interface IInsightBreakdown {
  key: string;
  label: string;
  kind: "ranking" | "distribution";
  items: { key: string; label: string; value: number }[];
}

export interface IInsightTimeseries {
  key: string;
  label: string;
  days: string[];
  series: { key: string; label: string; values: number[] }[];
}

export interface IInsightSection {
  key: string;
  title: string;
  description: string;
  metrics: IInsightMetric[];
  breakdowns: IInsightBreakdown[];
  timeseries: IInsightTimeseries[];
}
