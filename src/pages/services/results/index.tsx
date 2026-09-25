import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/api";
import { InsightBreakdown } from "@/components/panel/insight-breakdown";
import { InsightMetricCard } from "@/components/panel/insight-metric-card";
import { InsightTimeseriesChart } from "@/components/panel/insight-timeseries-chart";
import { PeriodSelect } from "@/components/panel/period-select";
import { ServicePage } from "@/components/service-hub/service-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePeriod } from "@/hooks/use-period";
import { IInsightSection } from "@/service/types/Panel";
import { IServiceDefinition } from "@/service/types/Service";

function Results({ service, office }: { service: IServiceDefinition; office?: string }) {
  const period = usePeriod();
  const [sections, setSections] = useState<IInsightSection[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.panel
      .getInsights(service.key, { office, from: period.from, to: period.to })
      .then((data) => active && setSections(data))
      .catch((error) =>
        toast.error(error?.response?.data?.message ?? "Erro ao carregar os resultados.")
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.key, office, period.from, period.to]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Indicadores de {period.label.toLowerCase()} (horário de Brasília).
        </p>
        <PeriodSelect value={period.preset} onChange={period.setPreset} />
      </div>

      {loading && !sections ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-56" />
        </div>
      ) : !sections?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Este serviço ainda não tem indicadores próprios configurados.
          </CardContent>
        </Card>
      ) : (
        sections.map((section) => (
          <div key={section.key} className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-medium">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>

            {section.metrics.length > 0 && (
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {section.metrics.map((m) => (
                  <InsightMetricCard key={m.key} metric={m} />
                ))}
              </div>
            )}

            {(section.breakdowns.length > 0 || section.timeseries.length > 0) && (
              <div className="grid gap-4 lg:grid-cols-2">
                {section.breakdowns.map((b) => (
                  <Card key={b.key}>
                    <CardHeader>
                      <CardTitle className="text-base">{b.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InsightBreakdown breakdown={b} />
                    </CardContent>
                  </Card>
                ))}
                {section.timeseries.map((t) => (
                  <Card key={t.key} className={section.breakdowns.length % 2 === 1 ? "lg:col-span-2" : undefined}>
                    <CardHeader>
                      <CardTitle className="text-base">{t.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InsightTimeseriesChart timeseries={t} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ServicePage require="panel">
      {({ service, office }) => <Results service={service} office={office} />}
    </ServicePage>
  );
}
