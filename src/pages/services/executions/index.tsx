import { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { ExecutionStateBadge } from "@/components/panel/badges";
import { ServicePage } from "@/components/service-hub/service-page";
import { DataTable } from "@/components/ui/data-table";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/time";
import { IExecution, IPaginated } from "@/service/types/Panel";
import { IServiceDefinition } from "@/service/types/Service";

const PAGE_SIZE = 20;

function Executions({ service, office }: { service: IServiceDefinition; office?: string }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [data, setData] = useState<IPaginated<IExecution> | null>(null);
  const [loading, setLoading] = useState(false);
  const panel = service.panel!;

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.panel
      .getExecutions(service.key, { office, page, limit: PAGE_SIZE })
      .then((result) => active && setData(result))
      .catch((error) =>
        toast.error(error?.response?.data?.message ?? "Erro ao carregar as execuções.")
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.key, office, page]);

  const columns = useMemo<ColumnDef<IExecution>[]>(() => {
    const cols: ColumnDef<IExecution>[] = [
      {
        id: "startedAt",
        header: "Início",
        enableSorting: false,
        cell: ({ row }) => formatDateTime(row.original.startedAt),
      },
      {
        id: "state",
        header: "Situação",
        enableSorting: false,
        cell: ({ row }) => <ExecutionStateBadge state={row.original.state} />,
      },
      {
        id: "duration",
        header: "Duração",
        enableSorting: false,
        cell: ({ row }) => formatDuration(row.original.durationSeconds),
      },
      {
        id: "ok",
        header: "Com sucesso",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="tabular-nums text-green-700 dark:text-green-400">
            {formatNumber(row.original.ok)}
          </span>
        ),
      },
      {
        id: "fail",
        header: "Com falha",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="tabular-nums text-red-700 dark:text-red-400">
            {formatNumber(row.original.fail)}
          </span>
        ),
      },
    ];
    if (panel.secondaryFailureLabel) {
      cols.push({
        id: "secondary",
        header: "Falhas de leitura",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="tabular-nums" title={panel.secondaryFailureLabel ?? undefined}>
            {formatNumber(row.original.secondaryFailures)}
          </span>
        ),
      });
    }
    cols.push({
      id: "error",
      header: "Erro da execução",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.error ? (
          <span className="block max-w-[320px] truncate" title={row.original.error}>
            {row.original.error}
          </span>
        ) : (
          "—"
        ),
    });
    return cols;
  }, [panel]);

  const pagination: PaginationState = { pageIndex: page - 1, pageSize: PAGE_SIZE };
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(next.pageIndex + 1));
    setParams(nextParams);
  };

  function openExecution(execution: IExecution) {
    const next = new URLSearchParams();
    if (office) next.set("office", office);
    next.set("execution", String(execution.id));
    navigate(`/services/${service.key}/items?${next}`);
  }

  return (
    <div className="flex flex-col gap-3 min-h-[480px]">
      <p className="text-sm text-muted-foreground">
        Cada linha é uma rodada do robô. Clique para ver os {panel.unit.plural} processados nela.
      </p>
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
        onRowClick={openExecution}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ServicePage require="panel">
      {({ service, office }) => <Executions service={service} office={office} />}
    </ServicePage>
  );
}
