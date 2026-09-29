import api from "@/service/api";
import { IImport, IImportListResponse } from "@/service/types/Import";

interface ListParams {
  serviceKey: string;
  /** rpa_code do escritório (só ADMIN — CLIENT usa sempre o escritório do próprio token). */
  office?: string;
  page?: number;
  limit?: number;
  status?: string;
  period?: string;
  sort?: string;
  sortDir?: "asc" | "desc";
  signal?: AbortSignal;
}

async function getImports(params: ListParams): Promise<IImportListResponse> {
  const { serviceKey, signal, ...query } = params;
  const { data } = await api.get(`/services/${serviceKey}/imports`, {
    params: query,
    signal,
  });
  return data;
}

async function getImport(serviceKey: string, id: string, office?: string): Promise<IImport> {
  const { data } = await api.get(`/services/${serviceKey}/imports/${id}`, {
    params: { office },
  });
  return data;
}

async function createImport(serviceKey: string, file: File, office?: string): Promise<IImport> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post(`/services/${serviceKey}/imports`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    params: { office },
  });
  return data;
}

async function getImportFile(serviceKey: string, id: string, office?: string): Promise<Blob> {
  const { data } = await api.get(`/services/${serviceKey}/imports/${id}/file`, {
    params: { office },
    responseType: "blob",
  });
  return data;
}

export default { getImports, getImport, createImport, getImportFile };
