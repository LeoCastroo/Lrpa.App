import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_PRESETS, PeriodPreset } from "@/hooks/use-period";

export function PeriodSelect({
  value,
  onChange,
  disabled,
}: {
  value: PeriodPreset;
  onChange: (value: PeriodPreset) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodPreset)} disabled={disabled}>
      <SelectTrigger className="w-48 bg-card">
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
