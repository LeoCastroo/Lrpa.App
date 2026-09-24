import { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Sao_Paulo";
const START = 8;
const END = 18;

export interface UploadWindow {
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
}

function compute(): UploadWindow {
  const hour = dayjs().tz(TZ).hour();
  return {
    isOpen: hour >= START && hour < END,
    opensAt: "08:00",
    closesAt: "18:00",
  };
}

// Janela client-side apenas para UX. O backend é a autoridade (responde 409).
export function useUploadWindow(): UploadWindow {
  const [state, setState] = useState<UploadWindow>(compute);

  useEffect(() => {
    const timer = setInterval(() => setState(compute()), 30000);
    return () => clearInterval(timer);
  }, []);

  return state;
}
