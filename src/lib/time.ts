import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const TZ = "America/Sao_Paulo";

export function todayInSaoPaulo(): string {
  return dayjs().tz(TZ).format("YYYY-MM-DD");
}

export function daysAgoInSaoPaulo(days: number): string {
  return dayjs().tz(TZ).subtract(days, "day").format("YYYY-MM-DD");
}

/** Data/hora (ISO em UTC vindo da API) no horário de Brasília. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return dayjs(value).tz(TZ).format("DD/MM/YYYY HH:mm");
}

export function formatDay(day: string): string {
  return dayjs(day).format("DD/MM");
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}min` : `${hours}h`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}
