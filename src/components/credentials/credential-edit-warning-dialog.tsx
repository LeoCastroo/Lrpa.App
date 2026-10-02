import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CredentialEditWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function CredentialEditWarningDialog({
  open,
  onOpenChange,
  onConfirm,
}: CredentialEditWarningDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    if (!next) setAcknowledged(false);
    onOpenChange(next);
  }

  async function handleConfirm() {
    if (!acknowledged) return;
    setSubmitting(true);
    try {
      await onConfirm();
      setAcknowledged(false);
      onOpenChange(false);
    } catch {
      // erro já reportado (toast) por quem chamou — mantém o modal aberto para nova tentativa
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Isso pode afetar o robô deste cliente</DialogTitle>
          <DialogDescription>
            Você está alterando o usuário/login ou a senha desta credencial.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="warning">
          <AlertTriangle />
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                A senha pode ficar temporariamente bloqueada no sistema externo até a troca ser
                concluída, impedindo o robô de logar.
              </li>
              <li>
                Trocar o usuário/login também pode mudar permissões, perfil ou layout no sistema
                externo, o que pode impactar a automação.
              </li>
              <li>Se o login mudar, avise o responsável pelo RPA deste cliente.</li>
              <li>
                Nesta primeira versão, esta alteração <strong>não atualiza automaticamente</strong>{" "}
                nenhum robô em execução — a atualização no RPA precisa ser feita separadamente.
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={acknowledged}
            onCheckedChange={(value) => setAcknowledged(!!value)}
            disabled={submitting}
            className="mt-0.5"
          />
          Estou ciente dos impactos descritos acima e quero prosseguir.
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!acknowledged || submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Confirmar e salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
