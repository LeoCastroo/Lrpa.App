import { formatDay, formatNumber } from "@/lib/time";
import { IInsightTimeseries } from "@/service/types/Panel";

const SERIES_COLORS = [
  "bg-primary/70",
  "bg-amber-500/70",
  "bg-violet-500/70",
  "bg-red-500/70",
  "bg-cyan-500/70",
];

/** Barras empilhadas por dia, com 1 ou mais séries nomeadas (generaliza o DailyBars sucesso/falha). */
export function InsightTimeseriesChart({ timeseries }: { timeseries: IInsightTimeseries }) {
  const totals = timeseries.days.map((_, dayIndex) =>
    timeseries.series.reduce((sum, s) => sum + s.values[dayIndex], 0)
  );
  const max = Math.max(1, ...totals);
  const labelEvery = timeseries.days.length > 14 ? Math.ceil(timeseries.days.length / 10) : 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-1 h-40">
        {timeseries.days.map((day, dayIndex) => {
          const dayTotal = totals[dayIndex];
          const tooltip = `${formatDay(day)} — ${timeseries.series
            .map((s) => `${s.label}: ${formatNumber(s.values[dayIndex])}`)
            .join(", ")}`;
          return (
            <div
              key={day}
              className="flex-1 min-w-0 flex flex-col items-center gap-1"
              title={tooltip}
            >
              <div className="w-full h-32 flex flex-col justify-end">
                {dayTotal > 0 &&
                  timeseries.series.map((s, seriesIndex) => {
                    const value = s.values[dayIndex];
                    if (value <= 0) return null;
                    const isTopmost =
                      seriesIndex ===
                      timeseries.series.length -
                        1 -
                        [...timeseries.series].reverse().findIndex((x) => x.values[dayIndex] > 0);
                    return (
                      <div
                        key={s.key}
                        className={`w-full ${SERIES_COLORS[seriesIndex % SERIES_COLORS.length]} ${
                          isTopmost ? "rounded-t-sm" : ""
                        }`}
                        style={{ height: `${(value / max) * 100}%` }}
                      />
                    );
                  })}
              </div>
              <span className="text-[10px] text-muted-foreground h-3">
                {dayIndex % labelEvery === 0 ? formatDay(day) : ""}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {timeseries.series.map((s, index) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className={`size-2.5 rounded-sm ${SERIES_COLORS[index % SERIES_COLORS.length]}`} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
