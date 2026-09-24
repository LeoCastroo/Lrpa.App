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

/** Período do painel (datas de Brasília), guardado na URL como ?period=. */
export function usePeriod() {
  const [params, setParams] = useSearchParams();
  const preset =
    PERIOD_PRESETS.find((p) => p.value === params.get("period")) ?? DEFAULT_PRESET;

  function setPreset(value: PeriodPreset) {
    const next = new URLSearchParams(params);
    next.set("period", value);
    next.delete("page");
    setParams(next);
  }

  return {
    preset: preset.value as PeriodPreset,
    label: preset.label,
    from: daysAgoInSaoPaulo(preset.days - 1),
    to: todayInSaoPaulo(),
    setPreset,
  };
}
