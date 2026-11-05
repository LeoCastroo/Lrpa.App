import api from "@/service/api";
import { IClientResults } from "@/service/types/Client";

/**
 * `office` (rpa_code) só vale para o ADMIN: restringe os números a um escritório. `days` é o
 * período (7, 30 ou 90; fora disso o servidor usa 30).
 */
async function getResults(clientKey: string, office?: string, days?: number): Promise<IClientResults> {
  const { data } = await api.get(`/clients/${encodeURIComponent(clientKey)}/results`, {
    params: { ...(office ? { office } : {}), ...(days ? { days } : {}) },
  });
  return data;
}

export default { getResults };
