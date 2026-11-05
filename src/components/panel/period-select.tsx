import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_PRESETS, PeriodPreset } from "@/hooks/use-period";
import { cn } from "@/lib/utils";

export function PeriodSelect({
  value,
  onChange,
  disabled,
  className,
  allowed,
}: {
  value: PeriodPreset;
  onChange: (value: PeriodPreset) => void;
  disabled?: boolean;
  className?: string;
  /** Restringe os períodos oferecidos (padrão: todos). */
  allowed?: readonly PeriodPreset[];
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodPreset)} disabled={disabled}>
      <SelectTrigger className={cn("w-48 bg-card", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_PRESETS.filter((p) => !allowed || allowed.includes(p.value)).map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
