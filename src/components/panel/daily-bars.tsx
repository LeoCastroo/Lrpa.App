import { formatDay, formatNumber } from "@/lib/time";
import { IPanelSummary } from "@/service/types/Panel";

/** Barras empilhadas por dia (sucesso/falha), sem biblioteca de gráficos. */
export function DailyBars({ daily }: { daily: IPanelSummary["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.ok + d.fail));
  const labelEvery = daily.length > 14 ? Math.ceil(daily.length / 10) : 1;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-1 h-40">
        {daily.map((d, index) => (
          <div
            key={d.day}
            className="flex-1 min-w-0 flex flex-col items-center gap-1"
            title={`${formatDay(d.day)} — ${formatNumber(d.ok)} com sucesso, ${formatNumber(d.fail)} com falha`}
          >
            <div className="w-full h-32 flex flex-col justify-end">
              {d.fail > 0 && (
                <div
                  className="w-full bg-red-500/70 rounded-t-sm"
                  style={{ height: `${(d.fail / max) * 100}%` }}
                />
              )}
              {d.ok > 0 && (
                <div
                  className={`w-full bg-green-600/70 ${d.fail > 0 ? "" : "rounded-t-sm"}`}
                  style={{ height: `${(d.ok / max) * 100}%` }}
                />
              )}
            </div>
            <span className="text-[10px] text-muted-foreground h-3">
              {index % labelEvery === 0 ? formatDay(d.day) : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-green-600/70" /> Sucesso
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-red-500/70" /> Falha
        </span>
      </div>
    </div>
  );
}
