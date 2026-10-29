import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { officeMenuGroup } from "@/lib/office-menu-group";
import { IServiceDefinition } from "@/service/types/Service";
import { useUserStore } from "@/store";

export interface OfficeState {
  isAdmin: boolean;
  /** rpa_code do escritório escolhido (só ADMIN; CLIENT usa o escritório do token). */
  office?: string;
  offices: { rpa_code: string; name: string }[];
  setOffice: (code: string) => void;
  /** Pronto para consultar (CLIENT sempre; ADMIN depois de escolher o escritório). */
  ready: boolean;
}

/** Escritório do painel. Para o ADMIN fica na URL (?office=) e o primeiro é pré-selecionado. */
export function useOffice(service?: IServiceDefinition): OfficeState {
  const isAdmin = useUserStore((s) => s.user.role) === "ADMIN";
  const [params, setParams] = useSearchParams();
  const officeParam = params.get("office") ?? undefined;
  const allOffices = service?.offices ?? [];

  // O seletor oferece só os escritórios do menu em que o ADMIN está (o menu "Vezzi" nunca oferece
  // o BLS). Sem escritório na URL, ou com um que o serviço não tem, vale a lista toda.
  const current = allOffices.find((o) => o.rpa_code === officeParam);
  const offices = current
    ? allOffices.filter((o) => officeMenuGroup(o).key === officeMenuGroup(current).key)
    : allOffices;

  useEffect(() => {
    if (isAdmin && !officeParam && offices.length) {
      const next = new URLSearchParams(params);
      next.set("office", offices[0].rpa_code);
      setParams(next, { replace: true });
    }
  }, [isAdmin, officeParam, offices.length]);

  function setOffice(code: string) {
    const next = new URLSearchParams(params);
    next.set("office", code);
    next.delete("page");
    setParams(next);
  }

  return {
    isAdmin,
    office: isAdmin ? officeParam : undefined,
    offices,
    setOffice,
    ready: !isAdmin || Boolean(officeParam),
  };
}
