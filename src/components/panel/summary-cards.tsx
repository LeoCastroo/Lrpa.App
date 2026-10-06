import { CheckCircle2, FileStack, FolderOpen, Wallet, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, kpiValueSize } from "@/lib/utils";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/time";
import { IExecution, IPanelSummary } from "@/service/types/Panel";
import { ExecutionStateBadge } from "./badges";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

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
                <p className="text-success">
                  {formatNumber(execution.ok)} {unitPlural}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Com falha</p>
                <p className="text-destructive">
                  {formatNumber(execution.fail)} {unitPlural}
                </p>
              </div>
            </div>
            {execution.error && (
              <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
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
    chip: "bg-success/15",
    icon: "text-success",
    value: "text-success",
    border: "border-l-success/70",
  },
  fail: {
    chip: "bg-destructive/15",
    icon: "text-destructive",
    value: "text-destructive",
    border: "border-l-destructive/70",
  },
  info: {
    chip: "bg-info/15",
    icon: "text-info",
    value: "text-foreground",
    border: "border-l-info/70",
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
    <Card className={cn("py-0 border-l-4 min-w-0", style.border)}>
      <CardContent className="flex flex-col gap-3 p-5 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
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
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={cn(
              "font-semibold tabular-nums leading-none truncate",
              kpiValueSize(value),
              style.value
            )}
            title={value}
          >
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
    <div className={cn("grid grid-cols-2 gap-4", kpis.amount ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
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
      {kpis.amount && (
        <Kpi
          icon={Wallet}
          label={kpis.amount.label}
          value={currencyFormatter.format(kpis.amount.total)}
        />
      )}
    </div>
  );
}
