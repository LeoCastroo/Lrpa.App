import { FailureKind } from "./Service";

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
  secondaryFailures: number;
}

export interface IFailureReasonCount {
  key: string;
  title: string;
  kind: FailureKind | null;
  explanation: string;
  action: string;
  count: number;
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
    secondaryFailures: { label: string; attempts: number; processes: number } | null;
  };
  daily: { day: string; ok: number; fail: number }[];
  failuresByReason: IFailureReasonCount[];
}

export interface IPanelItem {
  id: number;
  success: boolean;
  message: string | null;
  date: string | null;
  executionId: number | null;
  reason: { key: string; title: string; kind: FailureKind | null } | null;
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

export interface IRpaDoc {
  updatedAt: string;
  objetivo: string;
  quandoRoda: string;
  origem: { intro: string; itens: string[] };
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
  format?: "number" | "percent";
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
