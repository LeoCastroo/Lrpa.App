import api from "@/service/api";
import { IImport, IImportListResponse } from "@/service/types/Import";

interface ListParams {
  serviceKey: string;
  page?: number;
  limit?: number;
  status?: string;
  period?: string;
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

async function getImport(serviceKey: string, id: string): Promise<IImport> {
  const { data } = await api.get(`/services/${serviceKey}/imports/${id}`);
  return data;
}

async function createImport(serviceKey: string, file: File): Promise<IImport> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post(`/services/${serviceKey}/imports`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

async function getImportFile(serviceKey: string, id: string): Promise<Blob> {
  const { data } = await api.get(`/services/${serviceKey}/imports/${id}/file`, {
    responseType: "blob",
  });
  return data;
}

export default { getImports, getImport, createImport, getImportFile };
