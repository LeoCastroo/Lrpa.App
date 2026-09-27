import { formatNumber } from "@/lib/time";
import { ILakeTimeseries } from "@/service/types/Lake";

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${m}/${year.slice(2)}`;
}

/** Barras por mês (o lake é uma série histórica de anos, não dias — granularidade mensal). */
export function LakeTimeseriesChart({ timeseries }: { timeseries: ILakeTimeseries }) {
  if (!timeseries.months.length) {
    return <p className="text-sm text-muted-foreground">Sem dados.</p>;
  }

  const totals = timeseries.months.map((_, i) => timeseries.series.reduce((sum, s) => sum + s.values[i], 0));
  const max = Math.max(1, ...totals);
  const labelEvery = timeseries.months.length > 14 ? Math.ceil(timeseries.months.length / 12) : 1;

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      {/* w-full min-w-0 aqui é essencial: sem eles, um flex item cresce para caber o conteúdo
          (120 meses de barras) em vez de respeitar a largura do pai, e overflow-x-auto nunca
          chega a rolar — o excesso só fica cortado (bug clássico de min-width:auto do flexbox). */}
      <div className="flex items-end gap-1 h-40 w-full min-w-0 overflow-x-auto">
        {timeseries.months.map((month, index) => {
          const tooltip = `${formatMonth(month)} — ${timeseries.series
            .map((s) => `${s.label}: ${formatNumber(s.values[index])}`)
            .join(", ")}`;
          return (
            <div key={month} className="w-3 shrink-0 flex flex-col items-center gap-1" title={tooltip}>
              <div className="w-full h-32 flex flex-col justify-end">
                <div
                  className="w-full bg-primary/70 rounded-t-sm"
                  style={{ height: `${(totals[index] / max) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground h-3 whitespace-nowrap">
                {index % labelEvery === 0 ? formatMonth(month) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
