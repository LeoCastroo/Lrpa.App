import api from "@/service/api";
import { IPaginated } from "@/service/types/Panel";
import {
  ILakeFreshness,
  ILakeProcesso,
  ILakeProcessoDetail,
  ILakeSearchParams,
  ILakeSection,
} from "@/service/types/Lake";

/** Parâmetros aceitos pelas rotas do lake (office só vale para ADMIN). */
export type LakeParams = Record<string, string | undefined>;

function clean(params: LakeParams): LakeParams {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

async function getSummary(serviceKey: string, params: LakeParams): Promise<ILakeSection[]> {
  const { data } = await api.get(`/services/${serviceKey}/lake/summary`, { params: clean(params) });
  return data;
}

async function search(
  serviceKey: string,
  params: LakeParams,
  body: ILakeSearchParams
): Promise<IPaginated<ILakeProcesso>> {
  const { data } = await api.post(`/services/${serviceKey}/lake/processos/search`, body, {
    params: clean(params),
  });
  return data;
}

async function exportProcessos(
  serviceKey: string,
  params: LakeParams,
  body: ILakeSearchParams
): Promise<Blob> {
  const { data } = await api.post(`/services/${serviceKey}/lake/processos/export`, body, {
    params: clean(params),
    responseType: "blob",
  });
  return data;
}

async function getProcesso(
  serviceKey: string,
  id: number,
  params: LakeParams
): Promise<ILakeProcessoDetail> {
  const { data } = await api.get(`/services/${serviceKey}/lake/processos/${id}`, {
    params: clean(params),
  });
  return data;
}

async function getOptions(serviceKey: string, filterKey: string, params: LakeParams): Promise<string[]> {
  const { data } = await api.get(`/services/${serviceKey}/lake/options/${filterKey}`, {
    params: clean(params),
  });
  return data;
}

async function getFreshness(serviceKey: string, params: LakeParams): Promise<ILakeFreshness> {
  const { data } = await api.get(`/services/${serviceKey}/lake/freshness`, { params: clean(params) });
  return data;
}

export default { getSummary, search, exportProcessos, getProcesso, getOptions, getFreshness };
