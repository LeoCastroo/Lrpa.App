import api from "@/service/api";
import {
  IExecution,
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

export default { getSummary, getItems, exportItems, getExecutions, getOptions, getDocs };
