import api from "@/service/api";
import {
  IExecution,
  IInsightSection,
  IPaginated,
  IPanelItem,
  IPanelSummary,
  IServiceDocs,
} from "@/service/types/Panel";

/** Parâmetros aceitos pelas rotas do painel (office só vale para ADMIN). */
export type PanelParams = Record<string, string | number | undefined>;

function clean(params: PanelParams): PanelParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  );
}

async function getSummary(serviceKey: string, params: PanelParams): Promise<IPanelSummary> {
  const { data } = await api.get(`/services/${serviceKey}/panel/summary`, {
    params: clean(params),
  });
  return data;
}

async function getItems(
  serviceKey: string,
  params: PanelParams,
  signal?: AbortSignal
): Promise<IPaginated<IPanelItem>> {
  const { data } = await api.get(`/services/${serviceKey}/panel/items`, {
    params: clean(params),
    signal,
  });
  return data;
}

async function exportItems(serviceKey: string, params: PanelParams): Promise<Blob> {
  const { data } = await api.get(`/services/${serviceKey}/panel/items/export`, {
    params: clean(params),
    responseType: "blob",
  });
  return data;
}

async function getExecutions(
  serviceKey: string,
  params: PanelParams
): Promise<IPaginated<IExecution>> {
  const { data } = await api.get(`/services/${serviceKey}/panel/executions`, {
    params: clean(params),
  });
  return data;
}

async function getOptions(
  serviceKey: string,
  filterKey: string,
  params: PanelParams
): Promise<string[]> {
  const { data } = await api.get(`/services/${serviceKey}/panel/options/${filterKey}`, {
    params: clean(params),
  });
  return data;
}

async function getDocs(serviceKey: string): Promise<IServiceDocs> {
  const { data } = await api.get(`/services/${serviceKey}/docs`);
  return data;
}

async function getInsights(serviceKey: string, params: PanelParams): Promise<IInsightSection[]> {
  const { data } = await api.get(`/services/${serviceKey}/panel/insights`, {
    params: clean(params),
  });
  return data;
}

export interface IResolveManuallyResult {
  resolved: number[];
  failed: { id: number; error: string }[];
}

async function resolveManually(
  serviceKey: string,
  params: PanelParams,
  body: { ids: number[]; reason: string }
): Promise<IResolveManuallyResult> {
  const { data } = await api.post(`/services/${serviceKey}/panel/items/resolve`, body, {
    params: clean(params),
  });
  return data;
}

export default {
  getSummary,
  getItems,
  exportItems,
  getExecutions,
  getOptions,
  getDocs,
  getInsights,
  resolveManually,
};
