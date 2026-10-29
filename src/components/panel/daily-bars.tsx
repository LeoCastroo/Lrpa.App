import {
  CLASSIFICATION_BAR,
  CLASSIFICATION_LABEL,
  CLASSIFICATION_ORDER,
  classCount,
} from "@/lib/failure-classification";
import { formatDay, formatNumber } from "@/lib/time";
import { IPanelSummary } from "@/service/types/Panel";

type Day = IPanelSummary["daily"][number];

interface Segment {
  key: string;
  value: number;
  className: string;
}

/** Fatias de um dia, de cima para baixo: falhas (por classe, quando houver) e, embaixo, sucesso. */
function segmentsOf(day: Day, classified: boolean): Segment[] {
  const ok: Segment = { key: "ok", value: day.ok, className: "bg-success/70" };
  if (!classified || !day.failClasses) {
    return [{ key: "fail", value: day.fail, className: "bg-destructive/70" }, ok];
  }
  const failures = [...CLASSIFICATION_ORDER].reverse().map((key) => ({
    key,
    value: classCount(day.failClasses!, key),
    className: CLASSIFICATION_BAR[key],
  }));
  return [...failures, ok];
}

function dayTitle(day: Day, classified: boolean): string {
  const base = `${formatDay(day.day)} — ${formatNumber(day.ok)} com sucesso`;
  if (!classified || !day.failClasses) return `${base}, ${formatNumber(day.fail)} com falha`;
  const parts = CLASSIFICATION_ORDER.map((key) => ({ key, value: classCount(day.failClasses!, key) }))
    .filter((p) => p.value > 0)
    .map((p) => `${formatNumber(p.value)} ${CLASSIFICATION_LABEL[p.key].toLowerCase()}`);
  return [base, ...parts].join(", ");
}

/**
 * Barras empilhadas por dia, sem biblioteca de gráficos. Em serviços que classificam as falhas, o
 * topo da barra separa "Requer Tratativa" (âmbar) de "Falha da Automação" (vermelho); nos demais,
 * é uma falha só.
 */
export function DailyBars({ daily }: { daily: IPanelSummary["daily"] }) {
  const classified = daily.some((d) => d.failClasses !== undefined);
  const max = Math.max(1, ...daily.map((d) => d.ok + d.fail));
  const labelEvery = daily.length > 14 ? Math.ceil(daily.length / 10) : 1;
  const hasUnclassified = daily.some((d) => (d.failClasses?.semClasse ?? 0) > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-1 h-40">
        {daily.map((d, index) => {
          const segments = segmentsOf(d, classified).filter((s) => s.value > 0);
          return (
            <div
              key={d.day}
              className="flex-1 min-w-0 flex flex-col items-center gap-1"
              title={dayTitle(d, classified)}
            >
              <div className="w-full h-32 flex flex-col justify-end">
                {segments.map((segment, i) => (
                  <div
                    key={segment.key}
                    className={`w-full ${segment.className} ${i === 0 ? "rounded-t-sm" : ""}`}
                    style={{ height: `${(segment.value / max) * 100}%` }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground h-3">
                {index % labelEvery === 0 ? formatDay(d.day) : ""}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-success/70" /> Sucesso
        </span>
        {classified ? (
          <>
            <span className="flex items-center gap-1">
              <span className={`size-2.5 rounded-sm ${CLASSIFICATION_BAR.tratativa}`} />{" "}
              {CLASSIFICATION_LABEL.tratativa}
            </span>
            <span className="flex items-center gap-1">
              <span className={`size-2.5 rounded-sm ${CLASSIFICATION_BAR.automacao}`} />{" "}
              {CLASSIFICATION_LABEL.automacao}
            </span>
            {hasUnclassified && (
              <span className="flex items-center gap-1">
                <span className={`size-2.5 rounded-sm ${CLASSIFICATION_BAR.sem_classe}`} />{" "}
                {CLASSIFICATION_LABEL.sem_classe}
              </span>
            )}
          </>
        ) : (
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-sm bg-destructive/70" /> Falha
          </span>
        )}
      </div>
    </div>
  );
}
