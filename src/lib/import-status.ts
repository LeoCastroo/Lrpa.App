import { ImportStatus } from "@/service/types/Import";
import { badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";

export const importStatusConfig: Record<
  ImportStatus,
  { label: string; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  RECEIVED: { label: "Aguardando consolidação", variant: "info" },
  SENT: { label: "Enviada ao RPA", variant: "success" },
  REPLACED: { label: "Substituída", variant: "warning" },
  REJECTED: { label: "Com erro", variant: "danger" },
  CANCELLED: { label: "Cancelada", variant: "secondary" },
};
