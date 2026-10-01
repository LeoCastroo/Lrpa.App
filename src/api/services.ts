import api from "@/service/api";
import { IServiceDefinition } from "@/service/types/Service";

async function getServices(): Promise<IServiceDefinition[]> {
  const { data } = await api.get(`/services`);
  return data;
}

async function getTemplate(serviceKey: string, office?: string): Promise<Blob> {
  const { data } = await api.get(`/services/${serviceKey}/template`, {
    params: { office },
    responseType: "blob",
  });
  return data;
}

export default { getServices, getTemplate };
