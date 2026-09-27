import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/api";
import { LakeBreakdown } from "@/components/lake/lake-breakdown";
import { LakeMetricCard } from "@/components/lake/lake-metric-card";
import { LakeTimeseriesChart } from "@/components/lake/lake-timeseries-chart";
import { ServicePage } from "@/components/service-hub/service-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/time";
import { apiErrorMessage } from "@/lib/password-policy";
import { ILakeFreshness, ILakeSection } from "@/service/types/Lake";
import { IServiceDefinition } from "@/service/types/Service";

function Jurimetria({ service, office }: { service: IServiceDefinition; office?: string }) {
  const [sections, setSections] = useState<ILakeSection[] | null>(null);
  const [freshness, setFreshness] = useState<ILakeFreshness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api.lake.getSummary(service.key, { office }),
      api.lake.getFreshness(service.key, { office }),
    ])
      .then(([summary, fresh]) => {
        if (!active) return;
        setSections(summary);
        setFreshness(fresh);
      })
      .catch((error) => toast.error(apiErrorMessage(error, "Erro ao carregar a jurimetria.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [service.key, office]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {freshness?.refreshed_at
          ? `Dados de ${formatDateTime(freshness.refreshed_at)} — ${freshness.processos.toLocaleString("pt-BR")} processo(s).`
          : "Carregando a última atualização…"}
      </p>

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
            Ainda não há dados suficientes para a jurimetria.
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
                  <LakeMetricCard key={m.key} metric={m} />
                ))}
              </div>
            )}

            {(section.breakdowns.length > 0 || section.timeseries.length > 0) && (
              <div className="grid gap-4 lg:grid-cols-2">
                {section.breakdowns.map((b) => (
                  <Card key={b.key} className="min-w-0">
                    <CardHeader>
                      <CardTitle className="text-base">{b.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LakeBreakdown breakdown={b} />
                    </CardContent>
                  </Card>
                ))}
                {section.timeseries.map((t) => (
                  <Card
                    key={t.key}
                    // min-w-0: sem isso, um grid item cresce para caber o conteúdo do gráfico (o
                    // lake tem até ~10 anos de meses) em vez de respeitar a largura da coluna, e o
                    // overflow-x-auto do LakeTimeseriesChart nunca chega a valer (mesmo bug de
                    // min-width:auto do flexbox, só que na fronteira do grid).
                    className={`min-w-0 ${section.breakdowns.length % 2 === 1 ? "lg:col-span-2" : ""}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{t.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LakeTimeseriesChart timeseries={t} />
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
    <ServicePage require="lake">
      {({ service, office }) => <Jurimetria service={service} office={office} />}
    </ServicePage>
  );
}
