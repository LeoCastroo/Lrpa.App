import api from "@/service/api";
import { IClientResults } from "@/service/types/Client";

async function getResults(clientKey: string): Promise<IClientResults> {
  const { data } = await api.get(`/clients/${encodeURIComponent(clientKey)}/results`);
  return data;
}

export default { getResults };
