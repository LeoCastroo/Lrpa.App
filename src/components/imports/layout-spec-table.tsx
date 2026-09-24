import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ILayoutColumn } from "@/service/types/Service";

export function LayoutSpecTable({ columns }: { columns: ILayoutColumn[] }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Coluna</TableHead>
            <TableHead>Obrigatória</TableHead>
            <TableHead>Descrição / Exemplo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {columns.map((c) => (
            <TableRow key={c.header}>
              <TableCell>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{c.header}</code>
              </TableCell>
              <TableCell>
                {c.required ? (
                  <Badge>Obrigatória</Badge>
                ) : (
                  <Badge variant="outline">Opcional</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {c.description}
                {c.example ? ` (ex.: ${c.example})` : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
