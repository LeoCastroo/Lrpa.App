import { Search, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import api from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IPanelFilter } from "@/service/types/Service";

const ALL = "__all__";

/**
 * Filtros declarados pelo adaptador do RPA (gerados a partir da API). Texto/número são
 * aplicados no "Buscar"; listas aplicam ao escolher.
 */
export function PanelFilters({
  serviceKey,
  office,
  filters,
  values,
  onApply,
}: {
  serviceKey: string;
  office?: string;
  filters: IPanelFilter[];
  values: Record<string, string>;
  onApply: (values: Record<string, string>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(values);
  const [options, setOptions] = useState<Record<string, string[]>>({});

  useEffect(() => setDraft(values), [JSON.stringify(values)]);

  useEffect(() => {
    for (const filter of filters.filter((f) => f.input === "select")) {
      api.panel
        .getOptions(serviceKey, filter.key, { office })
        .then((list) => setOptions((prev) => ({ ...prev, [filter.key]: list })))
        .catch(() => {});
    }
  }, [serviceKey, office]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    onApply(Object.fromEntries(Object.entries(draft).filter(([, v]) => v.trim() !== "")));
  }

  function clear() {
    setDraft({});
    onApply({});
  }

  const hasValues = Object.values(values).some(Boolean);

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      {filters.map((filter) =>
        filter.input === "select" ? (
          <div key={filter.key} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{filter.label}</span>
            <Select
              value={draft[filter.key] || ALL}
              onValueChange={(v) => {
                const next = { ...draft, [filter.key]: v === ALL ? "" : v };
                setDraft(next);
                onApply(Object.fromEntries(Object.entries(next).filter(([, x]) => x)));
              }}
            >
              <SelectTrigger className="w-52 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {(options[filter.key] ?? []).map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div key={filter.key} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{filter.label}</span>
            <Input
              className="w-44 bg-card"
              type={filter.input === "number" ? "number" : "text"}
              placeholder={filter.placeholder}
              value={draft[filter.key] ?? ""}
              onChange={(e) => setDraft({ ...draft, [filter.key]: e.target.value })}
            />
          </div>
        )
      )}
      <Button type="submit" variant="secondary">
        <Search className="size-4" />
        Buscar
      </Button>
      {hasValues && (
        <Button type="button" variant="ghost" onClick={clear}>
          <X className="size-4" />
          Limpar
        </Button>
      )}
    </form>
  );
}
