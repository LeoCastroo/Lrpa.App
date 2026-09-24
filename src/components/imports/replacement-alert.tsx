import dayjs from "dayjs";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IImport } from "@/service/types/Import";

export function ReplacementAlert({ todaysImport }: { todaysImport: IImport | null }) {
  if (todaysImport) {
    const time = dayjs(todaysImport.created_at).format("HH:mm");
    return (
      <Alert variant="warning">
        <AlertTriangle />
        <AlertTitle>Atenção: o envio de hoje será substituído</AlertTitle>
        <AlertDescription>
          Já existe uma planilha enviada hoje por {todaysImport.created_by_name} às{" "}
          {time} ({todaysImport.row_count} linha(s)). Ao enviar uma nova planilha, a
          anterior será descartada e apenas a nova será enviada ao RPA às 18h.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <Info />
      <AlertDescription>
        Apenas uma planilha por dia é considerada. Se você enviar mais de uma, somente
        a última enviada até as 18h será processada.
      </AlertDescription>
    </Alert>
  );
}
