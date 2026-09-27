import { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Download, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { LakeFilters } from "@/components/lake/lake-filters";
import { ServicePage } from "@/components/service-hub/service-page";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/password-policy";
import { downloadBlob } from "@/lib/download";
import { ILakeProcesso } from "@/service/types/Lake";
import { IPanelField, IServiceDefinition } from "@/service/types/Service";

const PAGE_SIZE = 25;

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function renderValue(field: IPanelField, value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "currency") return currencyFormatter.format(Number(value));
  if (field.type === "number") return String(value);
  return (
    <span className="block max-w-[260px] truncate" title={String(value)}>
      {String(value)}
    </span>
  );
}

function Processos({ service, office }: { service: IServiceDefinition; office?: string }) {
  const lake = service.lake!;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const searchTerm = params.get("q") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const filterValues = Object.fromEntries(
    [...params.entries()].filter(([k]) => k.startsWith("f_")).map(([k, v]) => [k.slice(2), v])
  );

  const [data, setData] = useState<{ data: ILakeProcesso[]; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchTerm);

  const body = useMemo(
    () => ({
      search: searchTerm || undefined,
      filters: filterValues,
      page,
      limit: PAGE_SIZE,
    }),
    [searchTerm, JSON.stringify(filterValues), page]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.lake
      .search(service.key, { office }, body)
      .then((result) => active && setData(result))
      .catch((error) => toast.error(apiErrorMessage(error, "Erro ao buscar os processos.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.key, office, JSON.stringify(body)]);

  function update(changes: Record<string, string | undefined>, resetPage = true) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (!value) next.delete(key);
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

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await api.lake.exportProcessos(service.key, { office }, {
        search: searchTerm || undefined,
        filters: filterValues,
      });
      downloadBlob(blob, `processos-${service.key.toLowerCase()}.xlsx`);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Não foi possível exportar."));
    } finally {
      setExporting(false);
    }
  }

  const columns = useMemo<ColumnDef<ILakeProcesso>[]>(
    () =>
      lake.fields
        .filter((f) => f.table)
        .map((field) => ({
          id: field.key,
          header: field.label,
          enableSorting: false,
          cell: ({ row }) => renderValue(field, row.original[field.key]),
        })),
    [lake.fields]
  );

  const pagination: PaginationState = { pageIndex: page - 1, pageSize: PAGE_SIZE };
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    update({ page: String(next.pageIndex + 1) }, false);
  };

  return (
    <div className="flex flex-col gap-3 min-h-[480px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: searchDraft || undefined });
        }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <Input
          className="w-full sm:max-w-sm bg-card"
          placeholder="Buscar por CNJ, NPC, parte, advogado ou OAB…"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
        />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 sm:flex-initial">
            Buscar
          </Button>
          <Button type="button" variant="outline" onClick={handleExport} disabled={exporting} className="flex-1 sm:flex-initial">
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Exportar (.xlsx)
          </Button>
        </div>
      </form>

      {lake.filters.length > 0 && (
        <LakeFilters
          serviceKey={service.key}
          office={office}
          filters={lake.filters}
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
        onRowClick={(row) => navigate(`/services/${service.key}/processos/${row.id}`)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ServicePage require="lake">
      {({ service, office }) => <Processos service={service} office={office} />}
    </ServicePage>
  );
}
