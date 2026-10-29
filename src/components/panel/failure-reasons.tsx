import { ChevronRight } from "lucide-react";
import {
  CLASSIFICATION_BAR,
  CLASSIFICATION_LABEL,
  CLASSIFICATION_ORDER,
  classCount,
} from "@/lib/failure-classification";
import { formatNumber } from "@/lib/time";
import { IFailureReasonCount } from "@/service/types/Panel";
import { FailureKindBadge } from "./badges";

/**
 * Falhas agrupadas pelo catálogo da documentação; clicar filtra a aba de itens. Em serviços que
 * classificam as falhas, a barra de cada motivo mostra como ele se divide entre "Requer
 * Tratativa" e "Falha da Automação".
 */
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
        const parts = reason.classes
          ? CLASSIFICATION_ORDER.map((key) => ({ key, value: classCount(reason.classes!, key) })).filter(
              (p) => p.value > 0
            )
          : [];
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
                {parts.length > 0 && (
                  <p className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {parts.map((part) => (
                      <span key={part.key} className="flex items-center gap-1">
                        <span className={`size-2 rounded-full ${CLASSIFICATION_BAR[part.key]}`} />
                        {CLASSIFICATION_LABEL[part.key]}: {formatNumber(part.value)}
                      </span>
                    ))}
                  </p>
                )}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full flex" style={{ width: `${share}%` }}>
                    {parts.length > 0 ? (
                      parts.map((part) => (
                        <div
                          key={part.key}
                          className={`h-full ${CLASSIFICATION_BAR[part.key]}`}
                          style={{ width: `${(part.value / reason.count) * 100}%` }}
                        />
                      ))
                    ) : (
                      <div className="h-full w-full bg-destructive/70" />
                    )}
                  </div>
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
