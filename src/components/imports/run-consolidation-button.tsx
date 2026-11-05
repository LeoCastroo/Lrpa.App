import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
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
} from "@/components/ui/dialog";
import { useUserStore } from "@/store";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Sao_Paulo";
const UPLOAD_WINDOW_END = 18;

interface Props {
  /** Chamado depois que a consolidação entregou algo, para a lista recarregar. */
  onDone?: () => void;
}

/**
 * Dispara a consolidação das planilhas pendentes (a mesma das 18h05). Só aparece para ADMIN.
 * O backend é a autoridade: antes das 18h responde 409 e, se o dia já está consolidado, devolve
 * `skipped`. A consolidação entrega TODAS as importações pendentes, de todos os escritórios.
 */
export function RunConsolidationButton({ onDone }: Props) {
  const isAdmin = useUserStore((s) => s.user.role) === "ADMIN";
  const [open, setOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  if (!isAdmin) return null;

  const beforeCutoff = dayjs().tz(TZ).hour() < UPLOAD_WINDOW_END;

  async function handleConfirm() {
    setIsRunning(true);
    try {
      const outcome = await api.consolidation.runConsolidation();
      setOpen(false);
      if (outcome.skipped) {
        toast.info(
          "A consolidação de hoje já foi concluída (ou está em andamento). Novas planilhas entram amanhã às 18h."
        );
        return;
      }
      if (outcome.failures) {
        toast.error(
          `${outcome.importsSent ?? 0} importação(ões) entregue(s) e ${outcome.failures} com falha. Veja o detalhe na lista.`
        );
      } else {
        toast.success(`Consolidação concluída: ${outcome.importsSent ?? 0} importação(ões) enviada(s) ao RPA.`);
      }
      onDone?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Erro ao consolidar. Tente novamente.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={beforeCutoff}
        title={beforeCutoff ? "Disponível a partir das 18h (horário de Brasília)." : undefined}
      >
        <Send className="size-4" />
        Consolidar agora
      </Button>

      <Dialog open={open} onOpenChange={(v) => !isRunning && setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consolidar e enviar ao RPA agora?</DialogTitle>
            <DialogDescription>
              Isso entrega ao robô todas as planilhas aguardando consolidação, de todos os
              escritórios e serviços, e não só as desta tela. Depois que o dia é consolidado, as
              planilhas enviadas em seguida só entram na consolidação do dia seguinte.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isRunning}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={isRunning}>
              {isRunning && <Loader2 className="size-4 animate-spin" />}
              Consolidar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
