import api from "@/service/api";
import { IPendenciesResponse } from "@/service/types/Pendencies";

async function getPendencies(office?: string): Promise<IPendenciesResponse> {
  const { data } = await api.get(`/pendencies`, { params: office ? { office } : undefined });
  return data;
}

export default { getPendencies };
