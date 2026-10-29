import { Bot, CheckCircle2, ClipboardList, FileStack, FolderOpen, Wallet, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, kpiValueSize } from "@/lib/utils";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/time";
import { CLASSIFICATION_LABEL } from "@/lib/failure-classification";
import { FailureClassification, IExecution, IPanelSummary } from "@/service/types/Panel";
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
                {execution.failTratativa !== undefined && execution.failAutomacao !== undefined ? (
                  <div className="flex flex-col">
                    <span className="text-warning">
                      {formatNumber(execution.failTratativa)} {CLASSIFICATION_LABEL.tratativa.toLowerCase()}
                    </span>
                    <span className="text-destructive">
                      {formatNumber(execution.failAutomacao)} {CLASSIFICATION_LABEL.automacao.toLowerCase()}
                    </span>
                    {execution.fail - execution.failTratativa - execution.failAutomacao > 0 && (
                      <span className="text-muted-foreground">
                        {formatNumber(execution.fail - execution.failTratativa - execution.failAutomacao)}{" "}
                        {CLASSIFICATION_LABEL.sem_classe.toLowerCase()}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-destructive">
                    {formatNumber(execution.fail)} {unitPlural}
                  </p>
                )}
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

type KpiTone = "neutral" | "ok" | "fail" | "info" | "warn" | "muted";

const KPI_TONES: Record<KpiTone, { chip: string; icon: string; value: string; border: string }> = {
  neutral: {
    chip: "bg-primary/10",
    icon: "text-primary",
    value: "text-foreground",
    border: "border-t-primary/70",
  },
  ok: {
    chip: "bg-success/15",
    icon: "text-success",
    value: "text-success",
    border: "border-t-success/70",
  },
  fail: {
    chip: "bg-destructive/15",
    icon: "text-destructive",
    value: "text-destructive",
    border: "border-t-destructive/70",
  },
  info: {
    chip: "bg-info/15",
    icon: "text-info",
    value: "text-foreground",
    border: "border-t-info/70",
  },
  // Requer Tratativa: a regra de negócio pede ação do escritório.
  warn: {
    chip: "bg-warning/15",
    icon: "text-warning",
    value: "text-warning",
    border: "border-t-warning/70",
  },
  muted: {
    chip: "bg-muted",
    icon: "text-muted-foreground",
    value: "text-foreground",
    border: "border-t-muted-foreground/40",
  },
};

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
  onClick,
}: {
  icon: typeof FileStack;
  label: string;
  value: string;
  hint?: string;
  tone?: KpiTone;
  /** Quando informado, o cartão vira um atalho (ex.: abrir os itens com essa falha). */
  onClick?: () => void;
}) {
  const style = KPI_TONES[tone];
  const card = (
    <Card
      className={cn(
        "py-0 border-t-2 min-w-0 h-full",
        style.border,
        onClick && "transition-colors hover:bg-accent/40"
      )}
    >
      <CardContent className="flex flex-col gap-3 p-5 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-md",
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
  if (!onClick) return card;
  return (
    <button
      type="button"
      onClick={onClick}
      className="block min-w-0 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-ring"
    >
      {card}
    </button>
  );
}

export function KpiCards({
  kpis,
  unitPlural,
  onSelectClass,
}: {
  kpis: IPanelSummary["kpis"];
  unitPlural: string;
  /** Serviços com classificação de falha: abre os itens com falha da classe escolhida. */
  onSelectClass?: (classification: FailureClassification) => void;
}) {
  const rate = kpis.successRate === null ? "—" : `${kpis.successRate.toLocaleString("pt-BR")}%`;
  const unitLabel = unitPlural.charAt(0).toUpperCase() + unitPlural.slice(1);
  const classes = kpis.failClasses;
  // "Sem classificação" só aparece quando existe (registros anteriores à classificação).
  const showUnclassified = Boolean(classes && classes.semClasse > 0);
  const cardCount = 3 + (classes ? 2 + (showUnclassified ? 1 : 0) : 1) + (kpis.amount ? 1 : 0);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4",
        cardCount >= 6 ? "lg:grid-cols-6" : cardCount === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"
      )}
    >
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
      {classes ? (
        <>
          <Kpi
            icon={ClipboardList}
            label={CLASSIFICATION_LABEL.tratativa}
            value={formatNumber(classes.tratativa)}
            hint="O escritório precisa agir"
            tone="warn"
            onClick={onSelectClass ? () => onSelectClass("tratativa") : undefined}
          />
          <Kpi
            icon={Bot}
            label={CLASSIFICATION_LABEL.automacao}
            value={formatNumber(classes.automacao)}
            hint="A LCS acompanha e corrige"
            tone="fail"
            onClick={onSelectClass ? () => onSelectClass("automacao") : undefined}
          />
          {showUnclassified && (
            <Kpi
              icon={XCircle}
              label={CLASSIFICATION_LABEL.sem_classe}
              value={formatNumber(classes.semClasse)}
              hint="Anteriores à classificação"
              tone="muted"
              onClick={onSelectClass ? () => onSelectClass("sem_classe") : undefined}
            />
          )}
        </>
      ) : (
        <Kpi icon={XCircle} label="Com falha" value={formatNumber(kpis.fail)} tone="fail" />
      )}
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
