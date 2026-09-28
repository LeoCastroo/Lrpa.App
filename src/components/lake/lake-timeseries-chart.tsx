import { useLayoutEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/time";
import { ILakeTimeseries } from "@/service/types/Lake";

const BAR_AREA_HEIGHT = 128; // = h-32, altura das barras (sem o rótulo do mês embaixo)
const LABEL_HEIGHT = 16;
const GAP_PX = 4; // = gap-1
const MIN_BAR_PX = 6;
const MAX_BAR_PX = 28;

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${m}/${year.slice(2)}`;
}

/** Arredonda pra cima num número "redondo" (1/2/5 × potência de 10), pra rótulo de eixo legível. */
function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const normalized = value / base;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * base;
}

/** Barras por mês (o lake é uma série histórica de anos, não dias — granularidade mensal). */
export function LakeTimeseriesChart({ timeseries }: { timeseries: ILakeTimeseries }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Mede a largura disponível pra decidir o tamanho da barra: com poucos meses, a barra cresce
  // pra ocupar o espaço (em vez de ficar um punhado de barrinhas coladas à esquerda); com muitos
  // meses, cai no mínimo e rola horizontalmente — nunca as duas coisas ao mesmo tempo.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    observer.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  if (!timeseries.months.length) {
    return <p className="text-sm text-muted-foreground">Sem dados.</p>;
  }

  const totals = timeseries.months.map((_, i) => timeseries.series.reduce((sum, s) => sum + s.values[i], 0));
  const rawMax = Math.max(1, ...totals);
  const axisMax = niceCeil(rawMax);
  const labelEvery = timeseries.months.length > 14 ? Math.ceil(timeseries.months.length / 12) : 1;

  const barWidth =
    containerWidth > 0
      ? Math.min(MAX_BAR_PX, Math.max(MIN_BAR_PX, containerWidth / timeseries.months.length - GAP_PX))
      : MAX_BAR_PX;

  return (
    <div className="flex gap-2 w-full min-w-0">
      <div
        className="flex flex-col justify-between shrink-0 w-10 text-right text-[10px] text-muted-foreground tabular-nums"
        style={{ height: BAR_AREA_HEIGHT }}
      >
        <span>{formatNumber(axisMax)}</span>
        <span>{formatNumber(Math.round(axisMax / 2))}</span>
        <span>0</span>
      </div>

      {/* w-full min-w-0 no scroll interno é essencial: sem eles, um flex item cresce para caber
          o conteúdo (120 meses de barras) em vez de respeitar a largura do pai, e overflow-x-auto
          nunca chega a rolar — o excesso só fica cortado (bug clássico de min-width:auto do
          flexbox). A barra em si usa largura calculada (px fixo), não flex-1: flex-1 com muitos
          itens força o container a crescer do mesmo jeito. */}
      <div className="relative flex-1 min-w-0">
        <div
          className="absolute top-0 left-0 right-0 flex flex-col justify-between pointer-events-none"
          style={{ height: BAR_AREA_HEIGHT }}
        >
          <div className="border-t border-border" />
          <div className="border-t border-border/60" />
          <div className="border-t border-border" />
        </div>

        <div ref={containerRef} className="flex items-start gap-1 w-full min-w-0 overflow-x-auto">
          {timeseries.months.map((month, index) => {
            const tooltip = `${formatMonth(month)} — ${timeseries.series
              .map((s) => `${s.label}: ${formatNumber(s.values[index])}`)
              .join(", ")}`;
            return (
              <div
                key={month}
                className="shrink-0 flex flex-col items-center gap-1"
                style={{ width: barWidth }}
                title={tooltip}
              >
                <div className="w-full flex flex-col justify-end" style={{ height: BAR_AREA_HEIGHT }}>
                  <div
                    className="w-full bg-primary/70 rounded-t-sm"
                    style={{ height: `${(totals[index] / axisMax) * 100}%` }}
                  />
                </div>
                <span
                  className="text-[9px] text-muted-foreground whitespace-nowrap"
                  style={{ height: LABEL_HEIGHT }}
                >
                  {index % labelEvery === 0 ? formatMonth(month) : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
