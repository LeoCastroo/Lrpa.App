import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/time";
import { IClientResults } from "@/service/types/Client";

interface BarItem {
  key: string;
  label: string;
  hours: number;
}

const TOP_SERVICES = 6;

function toItems(values: Record<string, number>, names: Record<string, string>): BarItem[] {
  return Object.entries(values)
    .filter(([, hours]) => hours > 0)
    .map(([key, hours]) => ({ key, label: names[key] ?? key, hours }))
    .sort((a, b) => b.hours - a.hours);
}

function Bars({ items, total, ranked }: { items: BarItem[]; total: number; ranked?: boolean }) {
  const max = items[0]?.hours ?? 0;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => {
        const share = total > 0 ? Math.round((item.hours / total) * 100) : 0;
        const width = max > 0 ? Math.max(2, (item.hours / max) * 100) : 0;
        return (
          <li key={item.key} className="flex items-center gap-3">
            {ranked && (
              <span className="w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{index + 1}</span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm" title={item.label}>
                  {item.label}
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  ≈ {formatNumber(Math.round(item.hours))} h{" "}
                  <span className="text-xs font-normal text-muted-foreground">({share}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-sm bg-muted">
                <div className="h-full rounded-sm bg-chart-1" style={{ width: `${width}%` }} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Gráficos da página do cliente a partir das horas devolvidas (estimativa): por área de atuação e
 * os serviços que mais devolvem tempo. Só lado positivo; sem horas calculadas, não aparece.
 */
export function ClientCharts({
  results,
  categoryNames,
  serviceNames,
}: {
  results: IClientResults;
  categoryNames: Record<string, string>;
  serviceNames: Record<string, string>;
}) {
  const effort = results.effort;
  if (!effort || effort.hours <= 0) return null;

  const byCategory = toItems(effort.categories, categoryNames);
  const byService = toItems(effort.services, serviceNames).slice(0, TOP_SERVICES);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base">Horas devolvidas por área</CardTitle>
          <p className="text-sm text-muted-foreground">Onde o tempo da equipe mais foi poupado.</p>
        </CardHeader>
        <CardContent>
          <Bars items={byCategory} total={effort.hours} />
        </CardContent>
      </Card>
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base">Serviços que mais devolvem tempo</CardTitle>
          <p className="text-sm text-muted-foreground">Os {byService.length} com maior volume de horas.</p>
        </CardHeader>
        <CardContent>
          <Bars items={byService} total={effort.hours} ranked />
        </CardContent>
      </Card>
    </div>
  );
}
