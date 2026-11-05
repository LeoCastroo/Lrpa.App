import { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FEEDBACK_TYPES, feedbackTypeLabel } from "@/lib/feedback-types";
import { apiErrorMessage } from "@/lib/password-policy";
import { formatDateTime } from "@/lib/time";
import { FeedbackType, IFeedbackEntry, IListFeedbackResponse } from "@/service/types/Feedback";
import { useUserStore } from "@/store";

const PAGE_SIZE = 25;
const ALL = "all";

const typeVariant: Record<FeedbackType, "danger" | "info" | "success" | "outline"> = {
  BUG: "danger",
  SUGGESTION: "info",
  IDEA: "success",
  OTHER: "outline",
};

export default function Page() {
  const isAdmin = useUserStore((s) => s.user.role) === "ADMIN";
  const [params, setParams] = useSearchParams();
  const type = params.get("type") ?? ALL;
  const office = params.get("office") ?? ALL;
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [data, setData] = useState<IListFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    api.feedback
      .listFeedback({
        page,
        limit: PAGE_SIZE,
        type: type !== ALL ? type : undefined,
        office: office !== ALL ? office : undefined,
      })
      .then(setData)
      .catch((error) => toast.error(apiErrorMessage(error, "Erro ao carregar os feedbacks.")))
      .finally(() => setLoading(false));
  }, [isAdmin, page, type, office]);

  function update(changes: Record<string, string | undefined>, resetPage = true) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "" || value === ALL) next.delete(key);
      else next.set(key, value);
    }
    if (resetPage) next.delete("page");
    setParams(next);
  }

  const columns = useMemo<ColumnDef<IFeedbackEntry>[]>(
    () => [
      {
        id: "created_at",
        header: "Enviado em",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{formatDateTime(row.original.created_at)}</span>
        ),
      },
      {
        id: "type",
        header: "Assunto",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={typeVariant[row.original.type] ?? "outline"}>
            {feedbackTypeLabel(row.original.type)}
          </Badge>
        ),
      },
      {
        id: "user",
        header: "Enviado por",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.user.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.user.email}</span>
          </div>
        ),
      },
      {
        id: "office",
        header: "Escritório",
        enableSorting: false,
        cell: ({ row }) => row.original.office?.name ?? "—",
      },
      {
        id: "page",
        header: "Tela",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.page ? (
            <code className="text-xs text-muted-foreground">{row.original.page}</code>
          ) : (
            "—"
          ),
      },
      {
        id: "message",
        header: "Mensagem",
        enableSorting: false,
        cell: ({ row }) => (
          <p className="min-w-64 max-w-xl whitespace-pre-wrap break-words">{row.original.message}</p>
        ),
      },
    ],
    []
  );

  const pagination: PaginationState = { pageIndex: page - 1, pageSize: PAGE_SIZE };
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    update({ page: String(next.pageIndex + 1) }, false);
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="container mx-auto py-2 flex flex-col gap-4">
      <PageHeader
        title="Sugestões e bugs"
        description="O que os usuários enviaram pelo botão Feedback. Quem envia só recebe a confirmação de envio."
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Select value={type} onValueChange={(v) => update({ type: v })}>
            <SelectTrigger className="w-full sm:w-48 bg-card">
              <SelectValue placeholder="Todos os assuntos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os assuntos</SelectItem>
              {FEEDBACK_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={office} onValueChange={(v) => update({ office: v })}>
            <SelectTrigger className="w-full sm:w-56 bg-card">
              <SelectValue placeholder="Todos os escritórios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os escritórios</SelectItem>
              {(data?.offices ?? []).map((o) => (
                <SelectItem key={o.rpa_code} value={o.rpa_code}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Envios</CardTitle>
          <CardDescription>Do mais recente para o mais antigo.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <DataTable
            storageKey="feedback"
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
        </CardContent>
      </Card>
    </div>
  );
}
