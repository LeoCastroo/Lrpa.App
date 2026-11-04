import { Loader2, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FEEDBACK_TYPES } from "@/lib/feedback-types";
import { apiErrorMessage } from "@/lib/password-policy";
import { FeedbackType } from "@/service/types/Feedback";

const MIN_LENGTH = 5;
const MAX_LENGTH = 4000;

/**
 * Envio de sugestão, bug ou ideia, disponível em qualquer tela. Quem envia só recebe a
 * confirmação — quem lê é o ADMIN. A tela de origem vai junto automaticamente.
 */
export function FeedbackDialog() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("SUGGESTION");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function reset() {
    setType("SUGGESTION");
    setMessage("");
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (message.trim().length < MIN_LENGTH) {
      setError("Descreva um pouco mais.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await api.feedback.createFeedback({ type, message: message.trim(), page: pathname });
      toast.success("Enviado com sucesso. Obrigado por ajudar a melhorar o LRPA!");
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Não foi possível enviar. Tente novamente."));
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Fechar sem enviar descarta o rascunho: não fica texto esquecido para a próxima vez.
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Enviar feedback" className="gap-2">
          <MessageSquarePlus className="size-4" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Enviar feedback</DialogTitle>
            <DialogDescription>
              Conte uma sugestão, um problema ou uma ideia. A equipe lê tudo o que chega.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Field>
              <FieldLabel>Assunto</FieldLabel>
              <Select value={type} onValueChange={(v) => setType(v as FeedbackType)}>
                <SelectTrigger className="w-full bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {FEEDBACK_TYPES.find((t) => t.value === type)?.hint}
              </p>
            </Field>
            <Field>
              <FieldLabel htmlFor="feedback-message">Mensagem</FieldLabel>
              <Textarea
                id="feedback-message"
                rows={5}
                maxLength={MAX_LENGTH}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(null);
                }}
                placeholder={
                  type === "BUG"
                    ? "O que aconteceu, o que você esperava e em qual tela."
                    : "Descreva com o máximo de detalhes que puder."
                }
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </Field>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={sending}>
              {sending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {sending ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
