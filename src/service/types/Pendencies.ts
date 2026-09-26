export interface IRejectedImportSummary {
  id: string;
  service_key: string;
  service_name: string;
  file_name: string;
  created_at: string;
  error_count: number;
}

export interface IPendingItemsSummary {
  service_key: string;
  service_name: string;
  unit_plural: string;
  count: number;
}

export interface IRobotAlert {
  service_key: string;
  service_name: string;
  kind: string;
  title: string;
  message: string;
  link: string;
}

export interface IPendenciesResponse {
  office: { rpa_code: string; name: string };
  items: IPendingItemsSummary[];
  robots: IRobotAlert[];
  rejectedImports: IRejectedImportSummary[];
}
