import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/time";
import { cn } from "@/lib/utils";
import { IClientResults } from "@/service/types/Client";

interface BarItem {
  key: string;
  label: string;
  hours: number;
}

const INITIAL_SERVICES = 8;

function toItems(values: Record<string, number>, names: Record<string, string>): BarItem[] {
  return Object.entries(values)
    .filter(([, hours]) => hours > 0)
    .map(([key, hours]) => ({ key, label: names[key] ?? key, hours }))
    .sort((a, b) => b.hours - a.hours);
}

function Bars({ items, total }: { items: BarItem[]; total: number }) {
  const max = items[0]?.hours ?? 0;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const share = total > 0 ? Math.round((item.hours / total) * 100) : 0;
        const width = max > 0 ? Math.max(2, (item.hours / max) * 100) : 0;
        return (
          <li key={item.key} className="flex min-w-0 flex-col gap-1">
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
          </li>
        );
      })}
    </ul>
  );
}

type Timeline = NonNullable<IClientResults["timeline"]>;

/** Teto "redondo" do eixo (1, 2, 2,5, 5 x 10^n) para as barras não encostarem no topo. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return ([1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= value) ?? value);
}

function dayMonth(isoDay: string): string {
  const [, month, day] = isoDay.split("-");
  return `${day}/${month}`;
}

function TimelineChart({ timeline }: { timeline: Timeline }) {
  const buckets = timeline.buckets;
  const top = niceMax(Math.max(...buckets.flatMap((b) => [b.hours, b.previousHours])));
  const pct = (hours: number) => `${Math.max(hours > 0 ? 1 : 0, (hours / top) * 100)}%`;
  const ticks = [top, top / 2, 0];
  // Com muitas barras os números por cima se atropelam: ficam só no tooltip.
  const showValues = buckets.length <= 7;
  const unit = timeline.bucketDays === 1 ? "Dia" : `Bloco de ${timeline.bucketDays} dias a partir de`;

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-chart-1" /> Período selecionado
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-sm bg-muted-foreground/30" /> Período anterior
        </span>
      </div>
      <div className="flex gap-2">
        <div className="flex h-48 w-10 shrink-0 flex-col justify-between text-right text-xs tabular-nums text-muted-foreground">
          {ticks.map((tick) => (
            <span key={tick} className="leading-none">
              {formatNumber(Math.round(tick))}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-48 border-b">
            {[0, 50].map((from) => (
              <div key={from} className="absolute inset-x-0 border-t border-dashed" style={{ bottom: `${from}%` }} />
            ))}
            <div className="absolute inset-x-0 top-0 border-t border-dashed" />
            <div className="absolute inset-0 flex items-end">
              {buckets.map((bucket) => (
                <div key={bucket.start} className="flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 px-0.5">
                  <div
                    className="w-full max-w-7 rounded-t-sm bg-muted-foreground/30"
                    style={{ height: pct(bucket.previousHours) }}
                    title={`Período anterior: ≈ ${formatNumber(Math.round(bucket.previousHours))} h`}
                  />
                  <div className="relative flex h-full w-full max-w-7 items-end">
                    <div
                      className="relative w-full rounded-t-sm bg-chart-1"
                      style={{ height: pct(bucket.hours) }}
                      title={`${unit} ${dayMonth(bucket.start)}: ≈ ${formatNumber(Math.round(bucket.hours))} h`}
                    >
                      {showValues && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium tabular-nums">
                          {formatNumber(Math.round(bucket.hours))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex">
            {buckets.map((bucket, index) => (
              <span
                key={bucket.start}
                className={cn(
                  "min-w-0 flex-1 text-center text-xs text-muted-foreground",
                  buckets.length > 7 && index % 2 === 1 && "max-sm:invisible"
                )}
              >
                {dayMonth(bucket.start)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ServicesTable({
  items,
  results,
}: {
  items: BarItem[];
  results: IClientResults;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, INITIAL_SERVICES);
  const minutes = results.effort?.minutesPerItem ?? {};

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-right">Itens</TableHead>
              <TableHead className="text-right">Min/item</TableHead>
              <TableHead className="text-right">Horas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((item) => (
              <TableRow key={item.key}>
                <TableCell className="whitespace-normal">{item.label}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(results.services[item.key] ?? 0)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{minutes[item.key] ?? "—"}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatNumber(Math.round(item.hours))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {items.length > INITIAL_SERVICES && (
        <Button variant="ghost" size="sm" className="mt-3 w-fit" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Mostrar menos" : `Ver todos os ${items.length} serviços`}
        </Button>
      )}
    </>
  );
}

/**
 * Gráficos e tabela da página do cliente a partir das horas devolvidas (estimativa): por área de
 * atuação e por serviço, com o tempo por item usado na conta. Só lado positivo; sem horas
 * calculadas, não aparece.
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
  const byService = toItems(effort.services, serviceNames);

  const timeline = results.timeline;

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("grid gap-4", timeline && "lg:grid-cols-2")}>
        {timeline && (
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="text-base">Horas devolvidas no período</CardTitle>
              <p className="text-sm text-muted-foreground">
                {timeline.bucketDays === 1
                  ? "Uma barra por dia, comparada ao período anterior."
                  : `Cada barra reúne ${timeline.bucketDays} dias (data de início embaixo), comparada ao período anterior.`}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <TimelineChart timeline={timeline} />
            </CardContent>
          </Card>
        )}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Horas devolvidas por área</CardTitle>
            <p className="text-sm text-muted-foreground">Onde o tempo da equipe mais foi poupado.</p>
          </CardHeader>
          <CardContent>
            <Bars items={byCategory} total={effort.hours} />
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base">Serviços que mais devolvem tempo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Itens com sucesso multiplicados pelo tempo médio de cada tarefa manual.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col">
          <ServicesTable items={byService} results={results} />
        </CardContent>
      </Card>

      <details className="group rounded-lg border bg-card px-5 py-3 text-sm">
        <summary className="cursor-pointer select-none font-medium">Como calculamos as horas</summary>
        <p className="mt-3 max-w-prose text-muted-foreground">
          Para cada serviço, multiplicamos os itens tratados com sucesso pelo tempo médio que uma pessoa
          levaria para fazer a mesma tarefa à mão. Somamos tudo e dividimos por 8 horas para chegar aos dias
          úteis. Os tempos da tabela são valores iniciais e conservadores, e podem ser ajustados junto com o
          escritório para refletir a rotina real.
        </p>
      </details>
    </div>
  );
}
