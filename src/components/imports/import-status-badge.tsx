import { Badge } from "@/components/ui/badge";
import { importStatusConfig } from "@/lib/import-status";
import { ImportStatus } from "@/service/types/Import";

export function ImportStatusBadge({ status }: { status: ImportStatus }) {
  const config = importStatusConfig[status];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  return <Badge className={config.className}>{config.label}</Badge>;
}
