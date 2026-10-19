import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // Classes extras do cabeçalho e das células de uma coluna (ex.: coluna que absorve a sobra de largura).
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}
