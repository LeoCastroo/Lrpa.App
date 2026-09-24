import { AlertTriangle, CheckCircle2, FileStack, FolderOpen, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof FileStack;
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "fail";
}) {
  const color =
    tone === "ok"
      ? "text-green-700 dark:text-green-400"
      : tone === "fail"
        ? "text-red-700 dark:text-red-400"
        : "";
  return (
    <Card>
      <CardContent className="pt-6 flex items-start gap-3">
        <Icon className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-medium tabular-nums ${color}`}>{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Kpi
        icon={FileStack}
        label={`${unitPlural.charAt(0).toUpperCase()}${unitPlural.slice(1)} no período`}
        value={formatNumber(kpis.total)}
        hint="status da tentativa mais recente"
      />
      <Kpi
        icon={CheckCircle2}
        label="Com sucesso"
        value={formatNumber(kpis.ok)}
        hint={`taxa de sucesso: ${rate}`}
        tone="ok"
      />
      <Kpi icon={XCircle} label="Com falha" value={formatNumber(kpis.fail)} tone="fail" />
      <Kpi icon={FolderOpen} label="Processos" value={formatNumber(kpis.processes)} />
      {kpis.secondaryFailures && kpis.secondaryFailures.attempts > 0 && (
        <div className="col-span-2 lg:col-span-4">
          <Card>
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-amber-600" />
              <p className="text-sm">
                <span className="font-medium">{kpis.secondaryFailures.label}:</span>{" "}
                {formatNumber(kpis.secondaryFailures.attempts)} tentativa(s) em{" "}
                {formatNumber(kpis.secondaryFailures.processes)} processo(s). Esses processos são
                verificados de novo nas próximas execuções.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
