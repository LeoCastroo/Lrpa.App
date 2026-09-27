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
}: {
  value: PeriodPreset;
  onChange: (value: PeriodPreset) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodPreset)} disabled={disabled}>
      <SelectTrigger className={cn("w-48 bg-card", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_PRESETS.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
