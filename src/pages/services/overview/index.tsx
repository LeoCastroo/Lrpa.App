import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { DailyBars } from "@/components/panel/daily-bars";
import { FailureReasons } from "@/components/panel/failure-reasons";
import { PeriodSelect } from "@/components/panel/period-select";
import { KpiCards, LastExecutionCard } from "@/components/panel/summary-cards";
import { ServicePage } from "@/components/service-hub/service-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeriod } from "@/hooks/use-period";
import { IPanelSummary } from "@/service/types/Panel";
import { IServiceDefinition } from "@/service/types/Service";

function Overview({ service, office }: { service: IServiceDefinition; office?: string }) {
  const navigate = useNavigate();
  const period = usePeriod();
  const [summary, setSummary] = useState<IPanelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const unit = service.panel!.unit;

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.panel
      .getSummary(service.key, { office, from: period.from, to: period.to })
      .then((data) => active && setSummary(data))
      .catch((error) =>
        toast.error(error?.response?.data?.message ?? "Erro ao carregar o painel.")
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.key, office, period.from, period.to]);

  function link(tab: string, extra: Record<string, string> = {}) {
    const params = new URLSearchParams();
    if (office) params.set("office", office);
    params.set("period", period.preset);
    for (const [key, value] of Object.entries(extra)) params.set(key, value);
    return `/services/${service.key}/${tab}?${params}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Indicadores de {period.label.toLowerCase()} (horário de Brasília).
        </p>
        <PeriodSelect value={period.preset} onChange={period.setPreset} />
      </div>

      {loading && !summary ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-56" />
        </div>
      ) : (
        summary && (
          <>
            <KpiCards kpis={summary.kpis} unitPlural={unit.plural} />

            <div className="grid gap-4 lg:grid-cols-3">
              <LastExecutionCard
                execution={summary.lastExecution}
                unitPlural={unit.plural}
                onOpen={() => navigate(link("executions"))}
              />
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    {unit.plural.charAt(0).toUpperCase() + unit.plural.slice(1)} por dia
                  </CardTitle>
                  <CardDescription>Status da tentativa mais recente de cada {unit.singular}.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DailyBars daily={summary.daily} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Falhas por motivo</CardTitle>
                <CardDescription>
                  Clique em um motivo para ver os {unit.plural} com essa falha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FailureReasons
                  reasons={summary.failuresByReason}
                  onSelect={(key) =>
                    navigate(link("items", { status: "failure", category: key }))
                  }
                />
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ServicePage require="panel">
      {({ service, office }) => <Overview service={service} office={office} />}
    </ServicePage>
  );
}
