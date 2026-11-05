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
import { CSSProperties, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Skeleton } from "./skeleton";

const MIN_COLUMN_WIDTH = 60;
const MAX_COLUMN_WIDTH = 900;
const STORAGE_PREFIX = "lrpa:table-widths:";

type ColumnWidths = Record<string, number>;

function loadWidths(storageKey?: string): ColumnWidths {
  if (!storageKey) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + storageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => typeof v === "number" && Number.isFinite(v))
    ) as ColumnWidths;
  } catch {
    return {};
  }
}

function saveWidths(storageKey: string | undefined, widths: ColumnWidths) {
  if (!storageKey) return;
  try {
    if (Object.keys(widths).length === 0) window.localStorage.removeItem(STORAGE_PREFIX + storageKey);
    else window.localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(widths));
  } catch {
    // Sem armazenamento (janela privada, dados bloqueados): a tabela segue funcionando, só não lembra.
  }
}

/** Largura definida pelo usuário: trava a coluna nesse tamanho (conteúdo maior é cortado com "…"). */
function widthStyle(width: number | undefined): CSSProperties | undefined {
  return width === undefined ? undefined : { width, minWidth: width, maxWidth: width };
}

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
  /**
   * Identifica a tabela para lembrar, no navegador, as larguras de coluna que o usuário ajustou.
   * Sem ela, o ajuste vale só enquanto a tela está aberta.
   */
  storageKey?: string;
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
  storageKey,
}: DataTableProps<TData, TValue>) {
  const [widths, setWidths] = useState<ColumnWidths>(() => loadWidths(storageKey));
  const loadedKey = useRef(storageKey);

  // Trocou de tabela (ex.: outro serviço): carrega as larguras daquela.
  useEffect(() => {
    if (loadedKey.current === storageKey) return;
    loadedKey.current = storageKey;
    setWidths(loadWidths(storageKey));
  }, [storageKey]);

  // Grava depois que o usuário para de arrastar (evita escrever a cada pixel).
  useEffect(() => {
    if (loadedKey.current !== storageKey) return;
    const timer = window.setTimeout(() => saveWidths(storageKey, widths), 300);
    return () => window.clearTimeout(timer);
  }, [widths, storageKey]);

  function startResize(event: ReactPointerEvent<HTMLElement>, columnId: string) {
    const header = event.currentTarget.closest("th");
    if (!header) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = header.getBoundingClientRect().width;
    handle.setPointerCapture(event.pointerId);

    const onMove = (moveEvent: PointerEvent) => {
      const next = Math.min(
        MAX_COLUMN_WIDTH,
        Math.max(MIN_COLUMN_WIDTH, Math.round(startWidth + moveEvent.clientX - startX))
      );
      setWidths((prev) => (prev[columnId] === next ? prev : { ...prev, [columnId]: next }));
    };
    const onEnd = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  }

  function resetColumn(columnId: string) {
    setWidths((prev) => {
      if (!(columnId in prev)) return prev;
      const { [columnId]: _removed, ...rest } = prev;
      return rest;
    });
  }

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
    enableResizing: false,
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
          "bg-card text-card-foreground rounded-lg border flex-1 min-h-0 flex flex-col overflow-hidden",
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
                      <TableHead
                        key={header.id}
                        className={cn("relative", header.column.columnDef.meta?.className)}
                        style={widthStyle(widths[header.column.id])}
                      >
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
                        {!header.isPlaceholder && header.column.getCanResize() && (
                          <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label="Ajustar largura da coluna (clique duplo restaura)"
                            title="Arraste para ajustar a largura. Clique duplo restaura."
                            className="group/resize absolute right-0 top-0 flex h-full w-3 cursor-col-resize touch-none select-none items-center justify-center"
                            onPointerDown={(event) => startResize(event, header.column.id)}
                            onDoubleClick={() => resetColumn(header.column.id)}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <span className="h-4 w-px bg-border transition-colors group-hover/resize:h-full group-hover/resize:w-0.5 group-hover/resize:bg-primary/60" />
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
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.columnDef.meta?.className,
                          widths[cell.column.id] !== undefined && "overflow-hidden text-ellipsis"
                        )}
                        style={widthStyle(widths[cell.column.id])}
                      >
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

          {Object.keys(widths).length > 0 && (
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setWidths({})}>
              Restaurar colunas
            </Button>
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
