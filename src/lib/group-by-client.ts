import { officeMenuGroup } from "@/lib/office-menu-group";
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

/** Seção do menu/Home: um cliente inteiro ou, para o ADMIN, o cliente de um grupo de escritórios. */
export interface MenuGroup extends ClientGroup {
  /** Única entre as seções (também chave do "recolhido" no menu). */
  key: string;
  /** "BMG", ou "BMG · Vezzi" quando o cliente aparece separado por escritório. */
  title: string;
  /** Só nas seções separadas por escritório: grupo de escritórios e os rpa_code que ele cobre. */
  officeGroup?: { key: string; codes: string[] };
}

interface OfficeSplit {
  key: string;
  label: string;
  codes: string[];
  services: IServiceDefinition[];
}

// Só o ADMIN recebe `offices`, então CLIENT nunca é separado (enxerga um escritório só).
// Serviço que nenhum escritório contratou não entra em nenhuma seção separada — não há dado a ver.
function splitByOfficeGroup(services: IServiceDefinition[]): OfficeSplit[] {
  const groups = new Map<string, OfficeSplit>();
  for (const service of services) {
    for (const office of service.offices ?? []) {
      const { key, label } = officeMenuGroup(office);
      let group = groups.get(key);
      if (!group) {
        group = { key, label, codes: [], services: [] };
        groups.set(key, group);
      }
      if (!group.codes.includes(office.rpa_code)) group.codes.push(office.rpa_code);
      if (!group.services.includes(service)) group.services.push(service);
    }
  }
  // O escritório com mais serviços vem primeiro (no BMG, o BLS), depois por nome.
  return [...groups.values()].sort(
    (a, b) => b.services.length - a.services.length || a.label.localeCompare(b.label, "pt-BR")
  );
}

/**
 * Seções do menu lateral e da Home. Igual a `groupServicesByClient`, exceto quando mais de um
 * grupo de escritórios contrata o mesmo cliente (visão do ADMIN): aí o cliente vira uma seção por
 * grupo ("BMG · BLS", "BMG · Vezzi"…), cada uma só com o que aquele grupo contratou. Cliente de
 * um grupo só continua com o nome e a seção de sempre.
 */
export function groupServicesForMenu(services: IServiceDefinition[]): MenuGroup[] {
  return groupServicesByClient(services).flatMap(({ client, services: clientServices }) => {
    const split = splitByOfficeGroup(clientServices);
    if (split.length <= 1) {
      return [{ client, key: client.key, title: client.name, services: clientServices }];
    }
    return split.map((group) => ({
      client,
      key: `${client.key}:${group.key}`,
      title: `${client.name} · ${group.label}`,
      services: group.services,
      officeGroup: { key: group.key, codes: group.codes },
    }));
  });
}

/** Página do cliente da seção (a separada por escritório leva o grupo em `?menu=`). */
export function menuGroupUrl(group: MenuGroup): string {
  const base = `/clients/${group.client.key}`;
  return group.officeGroup ? `${base}?menu=${encodeURIComponent(group.officeGroup.key)}` : base;
}

/** Escritório com que o serviço abre dentro da seção — nenhum fora das seções separadas. */
export function menuServiceOffice(service: IServiceDefinition, group: MenuGroup): string | undefined {
  const codes = group.officeGroup?.codes;
  if (!codes) return undefined;
  return service.offices?.find((o) => codes.includes(o.rpa_code))?.rpa_code;
}
