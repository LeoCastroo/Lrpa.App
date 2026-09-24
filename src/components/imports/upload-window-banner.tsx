import { Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUploadWindow } from "@/hooks/use-upload-window";

export function UploadWindowBanner({ compact = false }: { compact?: boolean }) {
  const { isOpen, opensAt, closesAt } = useUploadWindow();

  if (isOpen) {
    return (
      <Alert>
        <Clock />
        {!compact && <AlertTitle>Envios abertos</AlertTitle>}
        <AlertDescription>
          Você pode enviar planilhas até as {closesAt} (horário de Brasília).
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <Clock />
      {!compact && <AlertTitle>Envios encerrados</AlertTitle>}
      <AlertDescription>
        O horário para envio de planilhas é das {opensAt} às {closesAt} (horário de
        Brasília). A importação de hoje já foi consolidada e enviada ao RPA.
      </AlertDescription>
    </Alert>
  );
}
