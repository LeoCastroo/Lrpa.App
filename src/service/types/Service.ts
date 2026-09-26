export interface ILayoutColumn {
  header: string; // cabeçalho exato esperado na planilha
  field: string;
  required: boolean;
  type: "string" | "excel_date";
  maxLength?: number;
  description?: string;
  example?: string;
}

export interface IServiceCapabilities {
  import: boolean;
  panel: boolean;
  docs: boolean;
}

export type FailureKind = "temporaria" | "permanente" | "correcao";

export interface IPanelField {
  key: string;
  label: string;
  type: "text" | "number" | "datetime" | "boolean" | "currency";
  table: boolean;
  export: boolean;
}

export interface IPanelFilter {
  key: string;
  label: string;
  input: "text" | "number" | "select";
  placeholder?: string;
}

export interface IPanelMeta {
  unit: { singular: string; plural: string };
  fields: IPanelField[];
  filters: IPanelFilter[];
  failureReasons: { key: string; title: string; kind: FailureKind }[];
  secondaryFailureLabel: string | null;
  /** Presente quando o painel permite marcar itens com falha como tratados manualmente. */
  manualResolution: { actionLabel: string; warning: string | null } | null;
  /** Quando true, o serviço tem uma aba "Resultados" própria (GET /panel/insights). */
  hasInsights: boolean;
}

export interface IServiceClient {
  key: string;
  name: string;
}

export interface IServiceDefinition {
  key: string;
  name: string;
  description: string | null;
  capabilities: IServiceCapabilities;
  /** Cliente final por trás do RPA (ex.: BMG). Agrupa a navegação. */
  client: IServiceClient;
  /** Presente quando o serviço recebe importação de planilhas. */
  layout?: { columns: ILayoutColumn[] };
  /** Presente quando o serviço tem painel. */
  panel?: IPanelMeta;
  /** Só para ADMIN: escritórios que contrataram o serviço. */
  offices?: { rpa_code: string; name: string }[];
}
