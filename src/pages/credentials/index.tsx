import { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { CredentialAuditDialog } from "@/components/credentials/credential-audit-dialog";
import { CredentialDialog } from "@/components/credentials/credential-dialog";
import { RevealPasswordCell } from "@/components/credentials/reveal-password-cell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiErrorMessage } from "@/lib/password-policy";
import { formatDateTime } from "@/lib/time";
import { ICredentialSummary, IListCredentialsResponse } from "@/service/types/Credential";
import { useUserStore } from "@/store";

const PAGE_SIZE = 25;
const ALL = "all";

export default function Page() {
  const currentUser = useUserStore((s) => s.user);
  const [params, setParams] = useSearchParams();
  const clientKey = params.get("client") ?? ALL;
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [data, setData] = useState<IListCredentialsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditTarget, setAuditTarget] = useState<ICredentialSummary | null>(null);

  function load() {
    setLoading(true);
    api.credentials
      .listCredentials({
        page,
        limit: PAGE_SIZE,
        client_key: clientKey !== ALL ? clientKey : undefined,
      })
      .then(setData)
      .catch((error) => toast.error(apiErrorMessage(error, "Erro ao carregar as credenciais.")))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [page, clientKey]);

  function update(changes: Record<string, string | undefined>, resetPage = true) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === "" || value === ALL) next.delete(key);
      else next.set(key, value);
    }
    if (resetPage) next.delete("page");
    setParams(next);
  }

  const columns = useMemo<ColumnDef<ICredentialSummary>[]>(
    () => [
      {
        id: "clientName",
        header: "Cliente",
        enableSorting: false,
        cell: ({ row }) => row.original.clientName,
      },
      {
        id: "system",
        header: "Sistema",
        enableSorting: false,
        cell: ({ row }) => row.original.system,
      },
      {
        id: "username",
        header: "Usuário/Login",
        enableSorting: false,
        cell: ({ row }) => row.original.username,
      },
      {
        id: "password",
        header: "Senha",
        enableSorting: false,
        cell: ({ row }) => <RevealPasswordCell credentialId={row.original.id} />,
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => (
          <Badge variant={row.original.status === "ACTIVE" ? "default" : "outline"}>
            {row.original.status === "ACTIVE" ? "Ativo" : "Inativo"}
          </Badge>
        ),
      },
      {
        id: "updated_at",
        header: "Última alteração",
        enableSorting: false,
        cell: ({ row }) => formatDateTime(row.original.updated_at),
      },
      {
        id: "updatedBy",
        header: "Alterado por",
        enableSorting: false,
        cell: ({ row }) => row.original.updatedBy?.name ?? "—",
      },
      {
        id: "__actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="text-sm text-primary underline underline-offset-2 hover:no-underline"
              onClick={() => setAuditTarget(row.original)}
            >
              Ver histórico
            </button>
            <CredentialDialog
              mode="edit"
              availableClients={data?.availableClients ?? []}
              credential={row.original}
              onSaved={load}
            />
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const pagination: PaginationState = { pageIndex: page - 1, pageSize: PAGE_SIZE };
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    update({ page: String(next.pageIndex + 1) }, false);
  };

  if (currentUser.role !== "ADMIN" && !currentUser.hasVaultAccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-2 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl">Cofre de Credenciais</h1>
          <p className="text-sm text-muted-foreground">
            Credenciais usadas pelos robôs para logar nos sistemas externos dos clientes.
            Alterações aqui não atualizam nenhum robô automaticamente.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Select value={clientKey} onValueChange={(v) => update({ client: v })}>
            <SelectTrigger className="w-full sm:w-56 bg-card">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os clientes</SelectItem>
              {(data?.availableClients ?? []).map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CredentialDialog
            mode="create"
            availableClients={data?.availableClients ?? []}
            onSaved={load}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credenciais</CardTitle>
          <CardDescription>
            Senhas ficam ocultas por padrão — revele só quando precisar; a ação fica registrada no
            histórico.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>

      {auditTarget && (
        <CredentialAuditDialog
          open={!!auditTarget}
          onOpenChange={(open) => !open && setAuditTarget(null)}
          credentialId={auditTarget.id}
          clientName={auditTarget.clientName}
          system={auditTarget.system}
        />
      )}
    </div>
  );
}
