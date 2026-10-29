export interface OfficeRef {
  rpa_code: string;
  name: string;
}

export interface OfficeMenuGroup {
  key: string;
  label: string;
}

// Escritórios da mesma banca dividem um menu — o seletor de escritório escolhe qual deles. Todo
// escritório fora desta lista tem o próprio menu (nada é agrupado por semelhança de nome).
const SHARED_MENU: Record<string, OfficeMenuGroup> = {
  VEZZI_LAPOLLA: { key: "VEZZI", label: "Vezzi" },
  VEZZI_ENTER: { key: "VEZZI", label: "Vezzi" },
};

/**
 * Em qual menu o ADMIN encontra um escritório. É o que separa o BMG do BLS do BMG do Vezzi: cada
 * menu só mostra os serviços contratados pelos escritórios do seu grupo.
 */
export function officeMenuGroup(office: OfficeRef): OfficeMenuGroup {
  const shared = SHARED_MENU[office.rpa_code];
  if (shared) return shared;
  const label = office.name.replace(/\s+Advogados(\s+Associados)?$/i, "").trim();
  return { key: office.rpa_code, label: label || office.name };
}
