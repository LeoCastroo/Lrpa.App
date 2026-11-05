import { useSearchParams } from "react-router-dom";
import { daysAgoInSaoPaulo, todayInSaoPaulo } from "@/lib/time";

export const PERIOD_PRESETS = [
  { value: "today", label: "Hoje", days: 1 },
  { value: "7d", label: "Últimos 7 dias", days: 7 },
  { value: "30d", label: "Últimos 30 dias", days: 30 },
  { value: "90d", label: "Últimos 90 dias", days: 90 },
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number]["value"];

const DEFAULT_PRESET = PERIOD_PRESETS[1];

/**
 * Período do painel (datas de Brasília), guardado na URL como ?period=. Cada tela pode restringir
 * os períodos oferecidos (`allowed`) e escolher o padrão (`defaultValue`).
 */
export function usePeriod(options?: { allowed?: readonly PeriodPreset[]; defaultValue?: PeriodPreset }) {
  const [params, setParams] = useSearchParams();
  const candidates = PERIOD_PRESETS.filter((p) => !options?.allowed || options.allowed.includes(p.value));
  const fallback = candidates.find((p) => p.value === options?.defaultValue) ?? candidates[0] ?? DEFAULT_PRESET;
  const preset = candidates.find((p) => p.value === params.get("period")) ?? fallback;

  function setPreset(value: PeriodPreset) {
    const next = new URLSearchParams(params);
    next.set("period", value);
    next.delete("page");
    setParams(next);
  }

  return {
    preset: preset.value as PeriodPreset,
    label: preset.label,
    days: preset.days as number,
    from: daysAgoInSaoPaulo(preset.days - 1),
    to: todayInSaoPaulo(),
    setPreset,
  };
}
