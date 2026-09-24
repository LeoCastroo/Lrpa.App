import { Badge } from "@/components/ui/badge";
import { ExecutionState } from "@/service/types/Panel";
import { FailureKind } from "@/service/types/Service";

const executionConfig: Record<ExecutionState, { label: string; className: string }> = {
  running: {
    label: "Em andamento",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent",
  },
  success: {
    label: "Concluída",
    className: "bg-green-500/15 text-green-700 dark:text-green-400 border-transparent",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-transparent",
  },
  interrupted: {
    label: "Interrompida",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent",
  },
};

export function ExecutionStateBadge({ state }: { state: ExecutionState }) {
  const config = executionConfig[state];
  return <Badge className={config.className}>{config.label}</Badge>;
}

const kindConfig: Record<FailureKind, { label: string; className: string }> = {
  temporaria: {
    label: "Temporária",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-transparent",
  },
  permanente: {
    label: "Ação manual",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent",
  },
  correcao: {
    label: "Correção no robô",
    className: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-transparent",
  },
};

export function FailureKindBadge({ kind }: { kind: FailureKind | null }) {
  if (!kind) return <Badge variant="outline">Não catalogado</Badge>;
  const config = kindConfig[kind];
  return <Badge className={config.className}>{config.label}</Badge>;
}

export function ItemStatusBadge({ success }: { success: boolean }) {
  return success ? (
    <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border-transparent">
      Sucesso
    </Badge>
  ) : (
    <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-transparent">
      Falha
    </Badge>
  );
}
