import { PaginationState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { UploadWindowBanner } from "@/components/imports/upload-window-banner";
import { ServicePage } from "@/components/service-hub/service-page";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IImport } from "@/service/types/Import";
import { IServiceDefinition } from "@/service/types/Service";
import { columns } from "./columns";

const STATUS_OPTIONS = [
  { v: "all", l: "Todos os status" },
  { v: "RECEIVED", l: "Aguardando consolidação" },
  { v: "SENT", l: "Enviada ao RPA" },
  { v: "REPLACED", l: "Substituída" },
  { v: "REJECTED", l: "Com erro" },
  { v: "CANCELLED", l: "Cancelada" },
];

const PERIOD_OPTIONS = [
  { v: "all", l: "Qualquer período" },
  { v: "today", l: "Hoje" },
  { v: "7d", l: "Últimos 7 dias" },
  { v: "30d", l: "Últimos 30 dias" },
];

function ImportList({ service }: { service: IServiceDefinition }) {
  const navigate = useNavigate();
  const serviceKey = service.key;

  const [imports, setImports] = useState<IImport[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("all");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  // Reset ao trocar de serviço (a mesma página atende todos os serviços).
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setStatus("all");
    setPeriod("all");
  }, [serviceKey]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    api.imports
      .getImports({
        serviceKey,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        status: status !== "all" ? status : undefined,
        period,
        signal: controller.signal,
      })
      .then((res) => {
        setImports(res.data);
        setTotal(res.total);
        setPageCount(res.totalPages);
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
        toast.error(error?.response?.data?.message ?? "Erro ao carregar importações.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [serviceKey, pagination, sorting, status, period]);

  return (
    <div className="flex flex-col gap-3 min-h-[480px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-muted-foreground">Importações enviadas pelo seu escritório.</p>
        <Button onClick={() => navigate(`/services/${serviceKey}/imports/new`)}>
          <Plus className="size-4" />
          Nova importação
        </Button>
      </div>

      <UploadWindowBanner compact />

      <div className="flex flex-wrap gap-2">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="w-56 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.v} value={o.v}>
                {o.l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={period}
          onValueChange={(v) => {
            setPeriod(v);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="w-48 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={o.v} value={o.v}>
                {o.l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        total={total}
        columns={columns}
        data={imports}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/services/${serviceKey}/imports/${row.id}`)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ServicePage require="import">{({ service }) => <ImportList service={service} />}</ServicePage>
  );
}
