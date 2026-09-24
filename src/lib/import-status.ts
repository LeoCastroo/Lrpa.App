import { ImportStatus } from "@/service/types/Import";

export const importStatusConfig: Record<
  ImportStatus,
  { label: string; className: string }
> = {
  RECEIVED: {
    label: "Aguardando consolidação",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-transparent",
  },
  SENT: {
    label: "Enviada ao RPA",
    className: "bg-green-500/15 text-green-700 dark:text-green-400 border-transparent",
  },
  REPLACED: {
    label: "Substituída",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-transparent",
  },
  REJECTED: {
    label: "Com erro",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-transparent",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "bg-muted text-muted-foreground border-transparent",
  },
};
