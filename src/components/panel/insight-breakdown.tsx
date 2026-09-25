import { formatNumber } from "@/lib/time";
import { IInsightBreakdown } from "@/service/types/Panel";

/** Distribuição ou ranking: barra horizontal com contagem e percentual do total. */
export function InsightBreakdown({ breakdown }: { breakdown: IInsightBreakdown }) {
  if (!breakdown.items.length) {
    return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
  }

  const total = breakdown.items.reduce((sum, i) => sum + i.value, 0);

  return (
    <ul className="flex flex-col gap-2">
      {breakdown.items.map((item, index) => {
        const share = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.key} className="flex items-center gap-3">
            {breakdown.kind === "ranking" && (
              <span className="w-5 shrink-0 text-xs text-muted-foreground text-right">{index + 1}</span>
            )}
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate" title={item.label}>
                  {item.label}
                </span>
                <span className="text-sm tabular-nums shrink-0">
                  {formatNumber(item.value)} <span className="text-xs text-muted-foreground">({share}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary/70" style={{ width: `${share}%` }} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
