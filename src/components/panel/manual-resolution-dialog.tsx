import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MIN_REASON_LENGTH = 10;

interface ManualResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  unit: { singular: string; plural: string };
  actionLabel: string;
  /** Alerta específico do serviço (ex.: conferir duplicidade antes de confirmar). */
  warning?: string | null;
  onConfirm: (reason: string) => Promise<void>;
}

const DEFAULT_WARNING =
  "Essa ação é definitiva do lado do robô: uma vez marcado, o item nunca mais será " +
  "reprocessado automaticamente.";

export function ManualResolutionDialog({
  open,
  onOpenChange,
  count,
  unit,
  actionLabel,
  warning,
  onConfirm,
}: ManualResolutionDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_REASON_LENGTH;

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    if (!next) setReason("");
    onOpenChange(next);
  }

  async function handleConfirm() {
    if (!valid) return;
    setSubmitting(true);
    try {
      await onConfirm(trimmed);
      setReason("");
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
          <DialogTitle>{actionLabel}</DialogTitle>
          <DialogDescription>
            {count} {count === 1 ? unit.singular : unit.plural} selecionado(s) será(ão) marcado(s)
            como resolvido(s) manualmente.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="warning">
          <AlertTriangle />
          <AlertDescription>{warning || DEFAULT_WARNING}</AlertDescription>
        </Alert>

        <div className="grid gap-2">
          <Label htmlFor="manual-resolution-reason">Motivo do tratamento manual</Label>
          <Textarea
            id="manual-resolution-reason"
            placeholder="Ex.: Prazo cadastrado incorretamente no sistema de origem. Tratamento realizado manualmente."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            rows={3}
            autoFocus
          />
          {!valid && reason.length > 0 && (
            <p className="text-sm text-destructive">
              Informe pelo menos {MIN_REASON_LENGTH} caracteres.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!valid || submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
