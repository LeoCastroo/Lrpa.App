import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiErrorMessage } from "@/lib/password-policy";
import { formatDateTime } from "@/lib/time";
import { ICredentialAuditEntry } from "@/service/types/Credential";

const FIELD_LABELS: Record<string, string> = {
  system: "sistema",
  username: "usuário/login",
  password: "senha",
  status: "status",
  notes: "observações",
};

function describeFields(fields: string[]) {
  if (!fields.length) return "";
  return ` (${fields.map((f) => FIELD_LABELS[f] ?? f).join(", ")})`;
}

function formatAuditSentence(entry: ICredentialAuditEntry, clientName: string, system: string) {
  const when = formatDateTime(entry.created_at as unknown as string);
  const base = `do sistema ${system} do cliente ${clientName} em ${when}`;

  if (entry.action === "CREATE") {
    return `${entry.actor.name} criou a credencial ${base}.`;
  }
  if (entry.action === "VIEW_PASSWORD") {
    return `${entry.actor.name} revelou a senha da credencial ${base}.`;
  }
  return `${entry.actor.name} alterou a credencial ${base}${describeFields(entry.changed_fields)}.`;
}

interface CredentialAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentialId: string;
  clientName: string;
  system: string;
}

export function CredentialAuditDialog({
  open,
  onOpenChange,
  credentialId,
  clientName,
  system,
}: CredentialAuditDialogProps) {
  const [entries, setEntries] = useState<ICredentialAuditEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setEntries(null);
    api.credentials
      .listAudit(credentialId)
      .then(setEntries)
      .catch((error) => toast.error(apiErrorMessage(error, "Erro ao carregar o histórico.")))
      .finally(() => setLoading(false));
  }, [open, credentialId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Histórico da credencial</DialogTitle>
          <DialogDescription>
            {system} — {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {loading ? (
            <>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </>
          ) : !entries?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum evento registrado ainda.
            </p>
          ) : (
            entries.map((entry) => (
              <p key={entry.id} className="text-sm border-b pb-2 last:border-b-0">
                {formatAuditSentence(entry, clientName, system)}
              </p>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
