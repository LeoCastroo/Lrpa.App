import api from "@/service/api";
import { IClientResults } from "@/service/types/Client";

/** `office` (rpa_code) só vale para o ADMIN: restringe os números a um escritório. */
async function getResults(clientKey: string, office?: string): Promise<IClientResults> {
  const { data } = await api.get(`/clients/${encodeURIComponent(clientKey)}/results`, {
    params: office ? { office } : undefined,
  });
  return data;
}

export default { getResults };
