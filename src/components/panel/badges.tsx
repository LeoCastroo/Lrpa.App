import { Badge } from "@/components/ui/badge";
import { ExecutionState } from "@/service/types/Panel";
import { FailureKind } from "@/service/types/Service";

type BadgeVariant = "info" | "success" | "danger" | "warning";

const executionConfig: Record<ExecutionState, { label: string; variant: BadgeVariant }> = {
  running: { label: "Em andamento", variant: "info" },
  success: { label: "Concluída", variant: "success" },
  failed: { label: "Falhou", variant: "danger" },
  interrupted: { label: "Interrompida", variant: "warning" },
};

export function ExecutionStateBadge({ state }: { state: ExecutionState }) {
  const config = executionConfig[state];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// "Correção no robô" fica fora da escala padrão (info/warning/success/danger) de propósito: é
// uma categoria própria (falha de código, não do usuário) — não uma severidade.
const kindConfig: Record<FailureKind, { label: string; className?: string; variant?: BadgeVariant }> = {
  temporaria: { label: "Temporária", variant: "info" },
  permanente: { label: "Ação manual", variant: "warning" },
  correcao: {
    label: "Correção no robô",
    className: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-transparent",
  },
};

export function FailureKindBadge({ kind }: { kind: FailureKind | null }) {
  if (!kind) return <Badge variant="outline">Não catalogado</Badge>;
  const config = kindConfig[kind];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

export function ItemStatusBadge({ success }: { success: boolean }) {
  return <Badge variant={success ? "success" : "danger"}>{success ? "Sucesso" : "Falha"}</Badge>;
}
