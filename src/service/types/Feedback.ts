export type FeedbackType = "SUGGESTION" | "BUG" | "IDEA" | "OTHER";

export interface ICreateFeedbackInput {
  type: FeedbackType;
  message: string;
  /** Rota da tela em que o usuário estava (só o caminho). */
  page?: string;
}

export interface IFeedbackEntry {
  id: string;
  type: FeedbackType;
  message: string;
  page: string | null;
  created_at: string;
  user: { id: string; name: string; email: string };
  /** null quando quem enviou é ADMIN (não pertence a um escritório). */
  office: { name: string; rpa_code: string } | null;
}

export interface IListFeedbackResponse {
  data: IFeedbackEntry[];
  total: number;
  page: number;
  totalPages: number;
  /** Escritórios que já enviaram algo — opções do filtro. */
  offices: { name: string; rpa_code: string }[];
}
