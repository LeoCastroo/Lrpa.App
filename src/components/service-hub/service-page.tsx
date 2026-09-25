import { ReactNode, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOffice, OfficeState } from "@/hooks/use-office";
import { useService } from "@/hooks/use-service";
import { cn } from "@/lib/utils";
import { IServiceCapabilities, IServiceDefinition } from "@/service/types/Service";

type TabKey = "overview" | "results" | "items" | "executions" | "docs" | "imports";

interface TabDef {
  key: TabKey;
  label: (service: IServiceDefinition) => string;
  visible: (service: IServiceDefinition, isAdmin: boolean) => boolean;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const TABS: TabDef[] = [
  { key: "overview", label: () => "Visão geral", visible: (s) => s.capabilities.panel },
  {
    key: "results",
    label: () => "Resultados",
    visible: (s) => s.capabilities.panel && Boolean(s.panel?.hasInsights),
  },
  {
    key: "items",
    label: (s) => capitalize(s.panel?.unit.plural ?? "Itens"),
    visible: (s) => s.capabilities.panel,
  },
  { key: "executions", label: () => "Execuções", visible: (s) => s.capabilities.panel },
  { key: "docs", label: () => "Documentação", visible: (s) => s.capabilities.docs },
  {
    key: "imports",
    label: () => "Importações",
    visible: (s, isAdmin) => s.capabilities.import && !isAdmin,
  },
];

/** Primeira aba disponível para o serviço (usada pela rota /services/:key). */
export function defaultTab(service: IServiceDefinition, isAdmin: boolean): TabKey | null {
  return TABS.find((t) => t.visible(service, isAdmin))?.key ?? null;
}

/** Mantém escritório e período ao trocar de aba. */
function carriedSearch(search: string): string {
  const current = new URLSearchParams(search);
  const next = new URLSearchParams();
  for (const key of ["office", "period"]) {
    const value = current.get(key);
    if (value) next.set(key, value);
  }
  const text = next.toString();
  return text ? `?${text}` : "";
}

function HubHeader({ service, officeState }: { service: IServiceDefinition; officeState: OfficeState }) {
  const { pathname, search } = useLocation();
  const tabs = TABS.filter((t) => t.visible(service, officeState.isAdmin));
  const suffix = carriedSearch(search);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl">{service.name}</h1>
          {service.description && (
            <p className="text-sm text-muted-foreground">{service.description}</p>
          )}
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

      <nav className="flex gap-1 border-b overflow-x-auto">
        {tabs.map((tab) => {
          const url = `/services/${service.key}/${tab.key}`;
          const active = pathname === url || pathname.startsWith(`${url}/`);
          return (
            <Link
              key={tab.key}
              to={`${url}${suffix}`}
              className={cn(
                "px-3 py-2 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors",
                active
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label(service)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function HubSkeleton() {
  return (
    <div className="container mx-auto py-2 flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/**
 * Página-base de uma aba do serviço: resolve o serviço da rota, checa a capacidade exigida,
 * o escritório (ADMIN escolhe) e renderiza cabeçalho + abas + conteúdo.
 */
export function ServicePage({
  require,
  children,
}: {
  require: keyof IServiceCapabilities;
  children: (ctx: { service: IServiceDefinition; office?: string }) => ReactNode;
}) {
  const { service, isLoading, notFound } = useService();
  const officeState = useOffice(service);
  const { search } = useLocation();

  useEffect(() => {
    if (notFound) toast.error("Você não tem acesso a este serviço.");
  }, [notFound]);

  if (isLoading) return <HubSkeleton />;
  if (notFound || !service) return <Navigate to="/" replace />;

  const allowed =
    service.capabilities[require] && !(require === "import" && officeState.isAdmin);
  if (!allowed) return <Navigate to={`/services/${service.key}${search}`} replace />;

  return (
    <div className="container mx-auto py-2 flex flex-col gap-4">
      <HubHeader service={service} officeState={officeState} />
      {officeState.ready ? (
        children({ service, office: officeState.office })
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {officeState.offices.length
              ? "Selecione um escritório para ver os dados."
              : "Nenhum escritório contratou este serviço."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
