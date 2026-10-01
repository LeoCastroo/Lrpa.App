import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useUserStore } from "@/store";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Sao_Paulo";
const START = 8;
const END = 18;

export interface UploadWindow {
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
  /** true quando isOpen=true só porque é ADMIN (fora do horário normal) — ajuda o texto exibido. */
  isAdminBypass: boolean;
}

function compute(): boolean {
  const hour = dayjs().tz(TZ).hour();
  return hour >= START && hour < END;
}

// Janela client-side apenas para UX. O backend é a autoridade (responde 409) — e lá o ADMIN já
// não fica preso a ela (é uma ação pontual/de suporte, não o volume do escritório durante o
// expediente), então o hook também libera aqui pra não mostrar um bloqueio que não existe.
export function useUploadWindow(): UploadWindow {
  const isAdmin = useUserStore((s) => s.user.role) === "ADMIN";
  const [isOpenByHour, setIsOpenByHour] = useState(compute);

  useEffect(() => {
    const timer = setInterval(() => setIsOpenByHour(compute()), 30000);
    return () => clearInterval(timer);
  }, []);

  return {
    isOpen: isAdmin || isOpenByHour,
    opensAt: "08:00",
    closesAt: "18:00",
    isAdminBypass: isAdmin && !isOpenByHour,
  };
}
