import { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Download, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { ItemStatusBadge } from "@/components/panel/badges";
import { PanelFilters } from "@/components/panel/panel-filters";
import { PeriodSelect } from "@/components/panel/period-select";
import { ServicePage } from "@/components/service-hub/service-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePeriod } from "@/hooks/use-period";
import { downloadBlob } from "@/lib/download";
import { formatDateTime } from "@/lib/time";
import { IPaginated, IPanelItem } from "@/service/types/Panel";
import { IPanelField, IServiceDefinition } from "@/service/types/Service";

const PAGE_SIZE = 25;
const ALL = "all";

function renderValue(field: IPanelField, value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "datetime") return formatDateTime(String(value));
  if (field.type === "boolean") return value ? "Sim" : "Não";
  if (field.type === "number") return String(value);
  return <span className="block max-w-[280px] truncate" title={String(value)}>{String(value)}</span>;
}

async function errorMessage(error: any, fallback: string): Promise<string> {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.message ?? fallback;
    } catch {
      return fallback;
    }
  }
  return data?.message ?? fallback;
}

function Items({ service, office }: { service: IServiceDefinition; office?: string }) {
  const panel = service.panel!;
  const [params, setParams] = useSearchParams();
  const period = usePeriod();

  const status = params.get("status") ?? ALL;
  const category = params.get("category") ?? ALL;
  const view = params.get("view") === "attempts" ? "attempts" : "current";
  const execution = params.get("execution") ?? undefined;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const filterValues = Object.fromEntries(
    [...params.entries()].filter(([k]) => k.startsWith("f_")).map(([k, v]) => [k.slice(2), v])
  );

  const [data, setData] = useState<IPaginated<IPanelItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const query = {
    office,
    from: period.from,
    to: period.to,
    view,
    status: status !== ALL ? status : undefined,
    category: category !== ALL ? category : undefined,
    execution,
    ...Object.fromEntries(Object.entries(filterValues).map(([k, v]) => [`f_${k}`, v])),
  };
  const queryKey = JSON.stringify(query);

  function update(changes: Record<string, string | undefined>, resetPage = true) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "" || value === ALL) next.delete(key);
      else next.set(key, value);
    }
    if (resetPage) next.delete("page");
    setParams(next);
  }

  function applyFilters(values: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const key of [...next.keys()]) if (key.startsWith("f_")) next.delete(key);
    for (const [key, value] of Object.entries(values)) next.set(`f_${key}`, value);
    next.delete("page");
    setParams(next);
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.panel
      .getItems(service.key, { ...query, page, limit: PAGE_SIZE }, controller.signal)
      .then(setData)
      .catch(async (error) => {
        if (error?.code === "ERR_CANCELED") return;
        toast.error(await errorMessage(error, "Erro ao carregar os itens."));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [service.key, queryKey, page]);

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await api.panel.exportItems(service.key, query);
      downloadBlob(blob, `relatorio-${service.key.toLowerCase()}.xlsx`);
    } catch (error) {
      toast.error(await errorMessage(error, "Não foi possível exportar o relatório."));
    } finally {
      setExporting(false);
    }
  }

  const columns = useMemo<ColumnDef<IPanelItem>[]>(() => {
    const cols: ColumnDef<IPanelItem>[] = panel.fields
      .filter((f) => f.table)
      .map((field) => ({
        id: field.key,
        header: field.label,
        enableSorting: false,
        cell: ({ row }) => renderValue(field, row.original.values[field.key]),
      }));
    cols.push(
      {
        id: "__status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => <ItemStatusBadge success={row.original.success} />,
      },
      {
        id: "__reason",
        header: "Motivo",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.reason ? (
            <span
              className="block max-w-[260px] truncate"
              title={row.original.message ?? undefined}
            >
              {row.original.reason.title}
            </span>
          ) : (
            "—"
          ),
      }
    );
    return cols;
  }, [panel]);

  const pagination: PaginationState = { pageIndex: page - 1, pageSize: PAGE_SIZE };
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    update({ page: String(next.pageIndex + 1) }, false);
  };

  return (
    <div className="flex flex-col gap-3 min-h-[480px]">
      <div className="flex flex-wrap items-center gap-2">
        <PeriodSelect value={period.preset} onChange={period.setPreset} disabled={!!execution} />
        <Select value={status} onValueChange={(v) => update({ status: v })}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os status</SelectItem>
            <SelectItem value="success">Sucesso</SelectItem>
            <SelectItem value="failure">Falha</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => update({ category: v })}>
          <SelectTrigger className="w-60 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os motivos</SelectItem>
            {panel.failureReasons.map((r) => (
              <SelectItem key={r.key} value={r.key}>
                {r.title}
              </SelectItem>
            ))}
            <SelectItem value="outros">Outros motivos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={view} onValueChange={(v) => update({ view: v === "current" ? undefined : v })}>
          <SelectTrigger className="w-56 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Status atual de cada {panel.unit.singular}</SelectItem>
            <SelectItem value="attempts">Todas as tentativas</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Exportar (.xlsx)
          </Button>
        </div>
      </div>

      {execution && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary" className="gap-1">
            Execução #{execution}
            <button type="button" onClick={() => update({ execution: undefined })} aria-label="Remover filtro de execução">
              <X className="size-3" />
            </button>
          </Badge>
          <span className="text-muted-foreground">O período é ignorado ao filtrar por execução.</span>
        </div>
      )}

      {panel.filters.length > 0 && (
        <PanelFilters
          serviceKey={service.key}
          office={office}
          filters={panel.filters}
          values={filterValues}
          onApply={applyFilters}
        />
      )}

      <DataTable
        total={data?.total ?? 0}
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.totalPages ?? 1}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sorting={[]}
        onSortingChange={() => {}}
        isLoading={loading}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ServicePage require="panel">
      {({ service, office }) => <Items service={service} office={office} />}
    </ServicePage>
  );
}
