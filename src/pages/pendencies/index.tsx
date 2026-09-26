import { AlertTriangle, CircleCheck, FileWarning, ListTodo, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/time";
import { IPendenciesResponse } from "@/service/types/Pendencies";
import { useServicesStore, useUserStore } from "@/store";

const robotKindConfig: Record<string, { label: string; className: string }> = {
  robo_parado: {
    label: "Parado",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent",
  },
  robo_falhando: {
    label: "Falhando",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-transparent",
  },
  robo_travado: {
    label: "Travado",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-transparent",
  },
};

function RobotKindBadge({ kind }: { kind: string }) {
  const config = robotKindConfig[kind] ?? { label: kind, className: "" };
  return <Badge className={config.className}>{config.label}</Badge>;
}

/** ADMIN escolhe o escritório (união dos escritórios de todos os serviços carregados). */
function useOfficePicker() {
  const isAdmin = useUserStore((s) => s.user.role) === "ADMIN";
  const { services } = useServicesStore();
  const [params, setParams] = useSearchParams();
  const officeParam = params.get("office") ?? undefined;

  const offices = Array.from(
    new Map(
      services.flatMap((s) => s.offices ?? []).map((o) => [o.rpa_code, o])
    ).values()
  );

  useEffect(() => {
    if (isAdmin && !officeParam && offices.length) {
      const next = new URLSearchParams(params);
      next.set("office", offices[0].rpa_code);
      setParams(next, { replace: true });
    }
  }, [isAdmin, officeParam, offices.length]);

  return {
    isAdmin,
    office: isAdmin ? officeParam : undefined,
    offices,
    setOffice: (code: string) => {
      const next = new URLSearchParams(params);
      next.set("office", code);
      setParams(next);
    },
    ready: !isAdmin || Boolean(officeParam),
  };
}

export default function Page() {
  const officeState = useOfficePicker();
  const [data, setData] = useState<IPendenciesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!officeState.ready) return;
    let active = true;
    setLoading(true);
    setError(false);
    api.pendencies
      .getPendencies(officeState.office)
      .then((result) => active && setData(result))
      .catch((err) => {
        if (!active) return;
        setError(true);
        toast.error(err?.response?.data?.message ?? "Erro ao carregar as pendências.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [officeState.office, officeState.ready]);

  const totalPendencies =
    (data?.items.length ?? 0) + (data?.robots.length ?? 0) + (data?.rejectedImports.length ?? 0);

  return (
    <div className="container mx-auto py-2 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl">Central de Pendências</h1>
          <p className="text-sm text-muted-foreground">
            O que precisa da sua atenção em todos os serviços, num só lugar.
          </p>
        </div>
        {officeState.isAdmin && (
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
        )}
      </div>

      {!officeState.ready ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Selecione um escritório para ver as pendências.
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Não foi possível carregar as pendências agora.
          </CardContent>
        </Card>
      ) : totalPendencies === 0 ? (
        <Card>
          <CardContent className="py-10 flex flex-col items-center gap-2 text-center text-muted-foreground">
            <CircleCheck className="size-8 text-green-600 dark:text-green-500" />
            <p className="text-foreground font-medium">Tudo em dia</p>
            <p className="text-sm">Nenhuma pendência encontrada nos serviços deste escritório.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {data!.robots.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <Wrench className="size-4" /> Robôs com problema
              </h2>
              <div className="flex flex-col gap-3">
                {data!.robots.map((r, i) => (
                  <Card key={i}>
                    <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <RobotKindBadge kind={r.kind} />
                          <span className="font-medium">{r.service_name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.message}</p>
                      </div>
                      <Button asChild variant="outline" size="sm" className="w-fit shrink-0">
                        <Link to={r.link}>Ver execuções</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {data!.items.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <ListTodo className="size-4" /> Itens que precisam de atenção
              </h2>
              <Card>
                <CardContent className="p-0 divide-y">
                  {data!.items.map((item) => (
                    <Link
                      key={item.service_key}
                      to={`/services/${item.service_key}/items?status=failure&period=90d`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
                    >
                      <span>{item.service_name}</span>
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent">
                        {item.count} {item.count === 1 ? item.unit_plural.slice(0, -1) : item.unit_plural}
                      </Badge>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </section>
          )}

          {data!.rejectedImports.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <FileWarning className="size-4" /> Importações rejeitadas
              </h2>
              <Card>
                <CardContent className="p-0 divide-y">
                  {data!.rejectedImports.map((imp) => (
                    <Link
                      key={imp.id}
                      to={`/services/${imp.service_key}/imports/${imp.id}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span>
                          {imp.service_name} · {imp.file_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(imp.created_at)}
                        </span>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        <AlertTriangle className="size-3" /> {imp.error_count} erro(s)
                      </Badge>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
