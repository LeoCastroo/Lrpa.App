import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/time";
import { IInsightMetric } from "@/service/types/Panel";

/**
 * Card de métrica de resultado específico do RPA — igual em estrutura ao KpiCards genérico, mas
 * cada um traz sua própria frase de valor (headline) em vez de um rótulo fixo de status.
 */
export function InsightMetricCard({ metric }: { metric: IInsightMetric }) {
  const value =
    metric.format === "percent" ? `${metric.value.toLocaleString("pt-BR")}%` : formatNumber(metric.value);

  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-2 p-5">
        <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tabular-nums leading-none">{value}</span>
          {metric.percentOf != null && (
            <span className="text-sm text-muted-foreground">({metric.percentOf}%)</span>
          )}
        </div>
        {metric.headline && <p className="text-sm text-muted-foreground">{metric.headline}</p>}
      </CardContent>
    </Card>
  );
}
