export interface ICredentialSummary {
  id: string;
  client_key: string;
  clientName: string;
  system: string;
  username: string;
  status: "ACTIVE" | "INACTIVE";
  notes: string | null;
  updated_at: string | null;
  updatedBy: { id: string; name: string } | null;
}

export interface IListCredentialsResponse {
  data: ICredentialSummary[];
  total: number;
  page: number;
  totalPages: number;
  /** Sempre vindo do backend (derivado das permissões do usuário) — nunca hardcoded no front. */
  availableClients: { key: string; name: string }[];
}

export interface ICreateCredentialInput {
  client_key: string;
  system: string;
  username: string;
  password: string;
  notes?: string;
}

export interface IUpdateCredentialInput {
  system?: string;
  username?: string;
  /** Vazio/ausente = mantém a senha atual. */
  password?: string;
  status?: "ACTIVE" | "INACTIVE";
  notes?: string;
  acknowledged?: boolean;
}

export interface ICredentialAuditEntry {
  id: string;
  action: "CREATE" | "UPDATE" | "VIEW_PASSWORD";
  changed_fields: string[];
  actor: { id: string; name: string };
  created_at: string;
}
