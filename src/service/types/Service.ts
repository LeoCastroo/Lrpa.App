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
  type: "text" | "number" | "datetime" | "boolean";
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
}

export interface IServiceDefinition {
  key: string;
  name: string;
  description: string | null;
  capabilities: IServiceCapabilities;
  /** Presente quando o serviço recebe importação de planilhas. */
  layout?: { columns: ILayoutColumn[] };
  /** Presente quando o serviço tem painel. */
  panel?: IPanelMeta;
  /** Só para ADMIN: escritórios que contrataram o serviço. */
  offices?: { rpa_code: string; name: string }[];
}
