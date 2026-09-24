import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { ImportStatusBadge } from "@/components/imports/import-status-badge";
import { IImport } from "@/service/types/Import";

export const columns: ColumnDef<IImport>[] = [
  {
    accessorKey: "created_at",
    header: "Enviado em",
    cell: ({ row }) => dayjs(row.original.created_at).format("DD/MM/YYYY HH:mm"),
  },
  {
    accessorKey: "file_name",
    header: "Arquivo",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block max-w-[220px] truncate">{row.original.file_name}</span>
    ),
  },
  {
    accessorKey: "created_by_name",
    header: "Enviado por",
    enableSorting: false,
  },
  {
    accessorKey: "row_count",
    header: "Linhas",
    enableSorting: false,
    cell: ({ row }) => <div className="text-right tabular-nums">{row.original.row_count}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <ImportStatusBadge status={row.original.status} />,
  },
];
