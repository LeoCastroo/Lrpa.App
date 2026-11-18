import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IValidationError } from "@/service/types/Import";

const MAX_SHOWN = 50;

interface Props {
  errors: IValidationError[];
  variant?: "error" | "warning";
}

export function ValidationErrorsTable({ errors, variant = "error" }: Props) {
  const shown = errors.slice(0, MAX_SHOWN);
  const remaining = errors.length - shown.length;
  const isWarning = variant === "warning";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {isWarning ? "Linhas que não serão enviadas ao robô" : "Erros de validação"}
        </span>
        <Badge variant={isWarning ? "secondary" : "destructive"}>{errors.length}</Badge>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Linha</TableHead>
              <TableHead>Coluna</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>{isWarning ? "Processo" : "Valor encontrado"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((e, i) => (
              <TableRow key={`${e.row}-${e.column}-${i}`}>
                <TableCell className="font-mono">{e.row}</TableCell>
                <TableCell>
                  <code className="text-xs">{e.column}</code>
                </TableCell>
                <TableCell className="text-sm">{e.message}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {e.value ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {remaining > 0 && (
        <p className="text-sm text-muted-foreground">
          {isWarning
            ? `… e mais ${remaining} linha(s) fora do envio.`
            : `… e mais ${remaining} erro(s). Corrija os listados e reenvie.`}
        </p>
      )}
    </div>
  );
}
