import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/time";
import { cn, kpiValueSize } from "@/lib/utils";
import { IClientResults } from "@/service/types/Client";

function Stat({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: "success" | "primary";
}) {
  return (
    <Card
      className={cn(
        "min-w-0 border-t-2 py-0",
        tone === "success" ? "border-t-success" : "border-t-primary"
      )}
    >
      <CardContent className="flex min-w-0 flex-col gap-3 p-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-md [&>svg]:size-5",
              tone === "success" ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
            )}
          >
            {icon}
          </span>
          <span className="truncate text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="min-w-0">
          <p className={cn("font-semibold tabular-nums tracking-tight", kpiValueSize(value))}>{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Faixa de números da página do cliente: volume tratado e, quando há estimativa de tempo manual,
 * as horas e os dias úteis de trabalho devolvidos à equipe. Só mostra o lado positivo.
 */
export function ClientKpis({ results, windowLabel }: { results: IClientResults; windowLabel: string }) {
  if (results.total <= 0) return null;
  const effort = results.effort;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Stat
        tone="success"
        icon={<CheckCircle2 />}
        label="Itens processados"
        value={formatNumber(results.total)}
        hint={`com sucesso ${windowLabel}`}
      />
      {effort && (
        <>
          <Stat
            tone="primary"
            icon={<Clock />}
            label="Horas devolvidas à equipe"
            value={`≈ ${formatNumber(Math.round(effort.hours))} h`}
            hint="estimativa pelo tempo médio da tarefa manual"
          />
          <Stat
            tone="primary"
            icon={<CalendarDays />}
            label="Dias úteis de trabalho"
            value={`≈ ${formatNumber(Math.round(effort.workdays))}`}
            hint="equivalente em jornadas de 8 horas"
          />
        </>
      )}
    </div>
  );
}
