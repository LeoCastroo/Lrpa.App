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
 * Filtros declarados por LakeDefinition.filters — mesmo padrão de PanelFilters, mas as opções de
 * cada select vêm de GET /lake/options (não /panel/options), já que é uma tabela diferente.
 */
export function LakeFilters({
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
      api.lake
        .getOptions(serviceKey, filter.key, { office })
        .then((list) => {
          const clean = list.filter((o) => o.trim() !== "");
          setOptions((prev) => ({ ...prev, [filter.key]: clean }));
        })
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
    <form onSubmit={submit} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-2">
      {filters.map((filter) =>
        filter.input === "select" ? (
          <div key={filter.key} className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground">{filter.label}</span>
            <Select
              value={draft[filter.key] || ALL}
              onValueChange={(v) => {
                const next = { ...draft, [filter.key]: v === ALL ? "" : v };
                setDraft(next);
                onApply(Object.fromEntries(Object.entries(next).filter(([, x]) => x)));
              }}
            >
              <SelectTrigger className="w-full sm:w-52 bg-card">
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
          <div key={filter.key} className="flex flex-col gap-1 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground">{filter.label}</span>
            <Input
              className="w-full sm:w-44 bg-card"
              type={filter.input === "number" ? "number" : "text"}
              placeholder={filter.placeholder}
              value={draft[filter.key] ?? ""}
              onChange={(e) => setDraft({ ...draft, [filter.key]: e.target.value })}
            />
          </div>
        )
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" variant="secondary" className="flex-1 sm:flex-initial">
          <Search className="size-4" />
          Buscar
        </Button>
        {hasValues && (
          <Button type="button" variant="ghost" onClick={clear} className="flex-1 sm:flex-initial">
            <X className="size-4" />
            Limpar
          </Button>
        )}
      </div>
    </form>
  );
}
