import { IServiceClient, IServiceDefinition } from "@/service/types/Service";

export interface ClientGroup {
  client: IServiceClient;
  services: IServiceDefinition[];
}

// Seções que devem aparecer antes das demais na sidebar/Home, nesta ordem — CITE-SE tem
// destaque próprio (ver cite-se-client.ts) mesmo sendo, na prática, um produto do cliente BMG.
// Qualquer client.key fora desta lista mantém a ordem de primeira aparição normal, depois destes.
const PINNED_CLIENT_ORDER = ["CITE_SE"];

/**
 * Agrupa os serviços por cliente final (ex.: BMG), na ordem em que cada cliente aparece
 * pela primeira vez na lista — exceto os fixados em PINNED_CLIENT_ORDER, que vêm sempre
 * primeiro. Com um único cliente "normal" hoje, isso vira uma seção só — quando um novo
 * cliente for cadastrado, uma nova seção aparece sozinha.
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

  const pinned = PINNED_CLIENT_ORDER.map((key) => groups.get(key)).filter(
    (g): g is ClientGroup => g !== undefined
  );
  const rest = [...groups.values()].filter((g) => !PINNED_CLIENT_ORDER.includes(g.client.key));
  return [...pinned, ...rest];
}
