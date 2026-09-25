import { CheckCircle2, FileStack, FolderOpen, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/time";
import { IExecution, IPanelSummary } from "@/service/types/Panel";
import { ExecutionStateBadge } from "./badges";

export function LastExecutionCard({
  execution,
  unitPlural,
  onOpen,
}: {
  execution: IExecution | null;
  unitPlural: string;
  onOpen: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Última execução</CardTitle>
        {execution && <ExecutionStateBadge state={execution.state} />}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!execution ? (
          <p className="text-sm text-muted-foreground">Nenhuma execução encontrada.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p>{formatDateTime(execution.startedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duração</p>
                <p>{formatDuration(execution.durationSeconds)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Com sucesso</p>
                <p className="text-green-700 dark:text-green-400">
                  {formatNumber(execution.ok)} {unitPlural}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Com falha</p>
                <p className="text-red-700 dark:text-red-400">
                  {formatNumber(execution.fail)} {unitPlural}
                </p>
              </div>
            </div>
            {execution.error && (
              <p className="rounded-md bg-red-500/10 p-2 text-sm text-red-700 dark:text-red-400">
                {execution.error}
              </p>
            )}
            {execution.durationSeconds === null && execution.state !== "running" && (
              <p className="text-xs text-muted-foreground">
                Duração disponível apenas para execuções registradas a partir desta versão.
              </p>
            )}
          </>
        )}
        <div>
          <Button variant="outline" size="sm" onClick={onOpen}>
            Ver execuções
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type KpiTone = "neutral" | "ok" | "fail" | "info";

const KPI_TONES: Record<KpiTone, { chip: string; icon: string; value: string; border: string }> = {
  neutral: {
    chip: "bg-primary/10",
    icon: "text-primary",
    value: "text-foreground",
    border: "border-l-primary/70",
  },
  ok: {
    chip: "bg-green-500/15",
    icon: "text-green-700 dark:text-green-400",
    value: "text-green-700 dark:text-green-400",
    border: "border-l-green-500/70",
  },
  fail: {
    chip: "bg-red-500/15",
    icon: "text-red-700 dark:text-red-400",
    value: "text-red-700 dark:text-red-400",
    border: "border-l-red-500/70",
  },
  info: {
    chip: "bg-violet-500/15",
    icon: "text-violet-700 dark:text-violet-400",
    value: "text-foreground",
    border: "border-l-violet-500/70",
  },
};

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: typeof FileStack;
  label: string;
  value: string;
  hint?: string;
  tone?: KpiTone;
}) {
  const style = KPI_TONES[tone];
  return (
    <Card className={cn("py-0 border-l-4", style.border)}>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              style.chip
            )}
          >
            <Icon className={cn("size-5", style.icon)} />
          </span>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className={cn("text-3xl font-semibold tabular-nums leading-none", style.value)}>
            {value}
          </span>
          {/* Altura reservada mesmo sem hint, para as 4 cartas ficarem com a mesma altura. */}
          <span className="h-4 text-xs text-muted-foreground">{hint}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiCards({
  kpis,
  unitPlural,
}: {
  kpis: IPanelSummary["kpis"];
  unitPlural: string;
}) {
  const rate = kpis.successRate === null ? "—" : `${kpis.successRate.toLocaleString("pt-BR")}%`;
  const unitLabel = unitPlural.charAt(0).toUpperCase() + unitPlural.slice(1);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Kpi
        icon={FileStack}
        label={`${unitLabel} no período`}
        value={formatNumber(kpis.total)}
        hint="Status da tentativa mais recente"
      />
      <Kpi
        icon={CheckCircle2}
        label="Com sucesso"
        value={formatNumber(kpis.ok)}
        hint={`Taxa de sucesso: ${rate}`}
        tone="ok"
      />
      <Kpi icon={XCircle} label="Com falha" value={formatNumber(kpis.fail)} tone="fail" />
      <Kpi icon={FolderOpen} label="Processos" value={formatNumber(kpis.processes)} tone="info" />
    </div>
  );
}
