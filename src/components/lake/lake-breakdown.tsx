import { formatNumber } from "@/lib/time";
import { ILakeBreakdown } from "@/service/types/Lake";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/** Distribuição/ranking do lake: barra horizontal com contagem, % do total e métrica extra opcional. */
export function LakeBreakdown({ breakdown }: { breakdown: ILakeBreakdown }) {
  if (!breakdown.items.length) {
    return <p className="text-sm text-muted-foreground">Sem dados.</p>;
  }

  const total = breakdown.items.reduce((sum, i) => sum + i.value, 0);

  return (
    <ul className="flex flex-col gap-2">
      {breakdown.items.map((item, index) => {
        const share = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <li key={item.key} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-xs text-muted-foreground text-right">{index + 1}</span>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate" title={item.label}>
                  {item.label}
                </span>
                <span className="text-sm tabular-nums shrink-0 flex items-center gap-1">
                  {formatNumber(item.value)} <span className="text-xs text-muted-foreground">({share}%)</span>
                  {item.extra != null && (
                    <span className="text-xs text-muted-foreground">
                      · {currencyFormatter.format(item.extra)}
                    </span>
                  )}
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
