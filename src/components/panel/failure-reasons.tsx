import { ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/time";
import { IFailureReasonCount } from "@/service/types/Panel";
import { FailureKindBadge } from "./badges";

/** Falhas agrupadas pelo catálogo da documentação; clicar filtra a aba de itens. */
export function FailureReasons({
  reasons,
  onSelect,
}: {
  reasons: IFailureReasonCount[];
  onSelect: (key: string) => void;
}) {
  if (!reasons.length) {
    return <p className="text-sm text-muted-foreground">Nenhuma falha no período.</p>;
  }

  const total = reasons.reduce((sum, r) => sum + r.count, 0);

  return (
    <ul className="flex flex-col divide-y">
      {reasons.map((reason) => {
        const share = Math.round((reason.count / total) * 100);
        return (
          <li key={reason.key}>
            <button
              type="button"
              onClick={() => onSelect(reason.key)}
              className="w-full text-left py-3 flex items-start gap-3 hover:bg-accent/40 rounded-md px-2 -mx-2 transition-colors"
            >
              <div className="min-w-0 flex-1 flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-sm">{reason.title}</span>
                  <FailureKindBadge kind={reason.kind} />
                </div>
                <p className="text-sm text-muted-foreground">{reason.explanation}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">O que fazer:</span> {reason.action}
                </p>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-red-500/70" style={{ width: `${share}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm tabular-nums font-medium">
                  {formatNumber(reason.count)}
                </span>
                <span className="text-xs text-muted-foreground">({share}%)</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
