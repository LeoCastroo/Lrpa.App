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

interface Props {
  serviceKey: string;
  /** rpa_code do escritório selecionado (o ADMIN sempre escolhe um). */
  office?: string;
  /** Chamado depois que a consolidação entregou algo, para a lista recarregar. */
  onDone?: () => void;
}

/**
 * Só ADMIN. Entrega ao RPA, a qualquer hora, as planilhas aguardando consolidação deste serviço
 * neste escritório. Não consome a consolidação das 18h: o que sobrar continua indo nela.
 */
export function RunConsolidationButton({ serviceKey, office, onDone }: Props) {
  const isAdmin = useUserStore((s) => s.user.role) === "ADMIN";
  const [open, setOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  if (!isAdmin) return null;

  async function handleConfirm() {
    setIsRunning(true);
    try {
      const outcome = await api.consolidation.consolidateService(serviceKey, office);
      setOpen(false);
      if (outcome.nothingPending) {
        toast.info("Não há planilhas aguardando consolidação para este serviço.");
        return;
      }
      toast.success(
        `${outcome.importsSent} importação(ões) consolidada(s) e disponível(is) para o RPA.`
      );
      onDone?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Erro ao consolidar. Tente novamente.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} disabled={!office}>
        <Send className="size-4" />
        Consolidar agora
      </Button>

      <Dialog open={open} onOpenChange={(v) => !isRunning && setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consolidar agora?</DialogTitle>
            <DialogDescription>
              A planilha aguardando consolidação deste serviço, neste escritório, é entregue ao
              robô agora e substitui os dados que estavam na fila dele. Outros serviços e
              escritórios não são afetados, e a consolidação das 18h continua valendo para o que
              ainda estiver pendente. Se o robô já estiver rodando, ele pode pegar a fila antiga.
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
