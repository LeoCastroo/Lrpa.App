export type ImportStatus =
  | "RECEIVED"
  | "SENT"
  | "REPLACED"
  | "REJECTED"
  | "CANCELLED";

export interface IValidationError {
  row: number;
  column: string;
  message: string;
  value?: string | null;
}

export interface IImport {
  id: string;
  id_service: string;
  reference_date: string;
  status: ImportStatus;
  file_name: string;
  file_size: number;
  row_count: number;
  created_by: string;
  created_by_name: string;
  consolidated_at: string | null;
  created_at: string;
  validation_errors?: IValidationError[] | null;
}

export interface IImportListResponse {
  data: IImport[];
  total: number;
  page: number;
  totalPages: number;
  todays_import: IImport | null;
}
