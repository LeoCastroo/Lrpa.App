import { IServiceClient, IServiceDefinition } from "@/service/types/Service";

export interface ClientGroup {
  client: IServiceClient;
  services: IServiceDefinition[];
}

/**
 * Agrupa os serviços por cliente final (ex.: BMG), na ordem em que cada cliente aparece
 * pela primeira vez na lista. Com um único cliente hoje, isso vira uma seção só —
 * quando um novo cliente for cadastrado, uma nova seção aparece sozinha.
 */
export function groupServicesByClient(services: IServiceDefinition[]): ClientGroup[] {
  const groups = new Map<string, ClientGroup>();
  for (const service of services) {
    const existing = groups.get(service.client.key);
    if (existing) {
      existing.services.push(service);
    } else {
      groups.set(service.client.key, { client: service.client, services: [service] });
    }
  }
  return [...groups.values()];
}
