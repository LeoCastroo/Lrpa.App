"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  OnChangeFn,
  PaginationState,
  SortingState,
  TableMeta,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Skeleton } from "./skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  isLoading?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (rows: TData[]) => void;
  onRowClick?: (row: TData) => void;
  total?: number;
  selectedCount?: number;
  classname?: string;
  meta?: TableMeta<TData>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  isLoading,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  onRowClick,
  total,
  selectedCount,
  classname,
  meta,
}: DataTableProps<TData, TValue>) {
  const [internalRowSelection, setInternalRowSelection] = useState<Record<string, boolean>>({});
  const rowSelection = controlledRowSelection ?? internalRowSelection;

  const selectionColumn: ColumnDef<TData, TValue> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      </div>
    ),
    enableSorting: false,
  };

  const resolvedColumns = enableRowSelection ? [selectionColumn, ...columns] : columns;

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    pageCount,
    state: { pagination, rowSelection, sorting },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange,
    onSortingChange,
    meta,
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      if (controlledRowSelection === undefined) {
        setInternalRowSelection(next);
      }
      if (onRowSelectionChange) {
        const selected = data.filter((_, i) => next[String(i)]);
        onRowSelectionChange(selected);
      }
    },
    manualPagination: true,
    manualSorting: true,
    enableRowSelection,
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        className={cn(
          "bg-card text-card-foreground rounded-md shadow-sm border flex-1 min-h-0 flex flex-col overflow-hidden",
          classname
        )}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <Table className="bg-card">
            <TableHeader className="sticky top-0 z-10 bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();

                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              canSort ? "flex cursor-pointer select-none items-center gap-1" : ""
                            }
                            onClick={
                              canSort ? header.column.getToggleSortingHandler() : undefined
                            }
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <span className="text-muted-foreground">
                                {sorted === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : sorted === "desc" ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronsUpDown className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pagination.pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {resolvedColumns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-7 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className={onRowClick && "cursor-pointer"}
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={resolvedColumns.length} className="h-24 text-center">
                    Nenhum resultado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="shrink-0 flex items-center justify-between px-2 py-2 border-t">
          {(selectedCount ?? table.getFilteredSelectedRowModel().rows.length) > 0 ? (
            <span className="text-sm text-muted-foreground">
              {selectedCount ?? table.getFilteredSelectedRowModel().rows.length} selecionado(s)
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">{total} registro(s) no total</span>
          )}

          <span className="text-sm text-muted-foreground ml-auto mr-4 select-none">
            Página {pagination.pageIndex + 1} de {pageCount}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
