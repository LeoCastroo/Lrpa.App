import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/time";
import { ILakeMetric } from "@/service/types/Lake";

// "notation: compact" (ex.: "R$ 72,5 mi") em vez do valor cheio: um card de KPI de largura fixa
// não tem espaço para "R$ 72.466.756,39" ao lado de outros 3 cards numa grade de 2 colunas no
// celular — e a casa decimal exata não ajuda a leitura de um total, só o valor cheio na ficha do
// processo precisa de precisão.
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatValue(metric: ILakeMetric): string {
  if (metric.format === "percent") return `${metric.value.toLocaleString("pt-BR")}%`;
  if (metric.format === "currency") return currencyFormatter.format(metric.value);
  return formatNumber(metric.value);
}

export function LakeMetricCard({ metric }: { metric: ILakeMetric }) {
  return (
    <Card className="py-0 min-w-0">
      <CardContent className="flex flex-col gap-2 p-5 min-w-0">
        <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
        <span
          className="text-2xl sm:text-3xl font-semibold tabular-nums leading-none truncate"
          title={metric.format === "currency" ? String(metric.value) : undefined}
        >
          {formatValue(metric)}
        </span>
      </CardContent>
    </Card>
  );
}
