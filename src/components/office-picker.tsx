import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OfficeState } from "@/hooks/use-office";

/** Some sozinho para CLIENT (que não escolhe escritório). */
export function OfficePicker({ officeState }: { officeState: OfficeState }) {
  if (!officeState.isAdmin) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Escritório</span>
      <Select value={officeState.office ?? ""} onValueChange={officeState.setOffice}>
        <SelectTrigger className="w-56 bg-card">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {officeState.offices.map((o) => (
            <SelectItem key={o.rpa_code} value={o.rpa_code}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
