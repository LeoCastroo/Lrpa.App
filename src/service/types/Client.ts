export interface IClientResults {
  /** Tamanho do período consultado, em dias. */
  windowDays: number | null;
  /** Último dia (YYYY-MM-DD) coberto pelos números; null sem histórico. */
  until: string | null;
  /** Itens tratados com sucesso por serviço — só serviços com volume. */
  services: Record<string, number>;
  /** Soma por área (chave da categoria) — só áreas com volume. */
  categories: Record<string, number>;
  total: number;
  /** Horas de trabalho manual evitadas (estimativa); null quando nenhum serviço tem estimativa. */
  effort: {
    hours: number;
    /** As mesmas horas em dias úteis de 8h. */
    workdays: number;
    services: Record<string, number>;
    categories: Record<string, number>;
    /** Minutos de trabalho manual por item usados na conta, por serviço. */
    minutesPerItem: Record<string, number>;
  } | null;
  /** Horas devolvidas ao longo do período contra o período anterior; null sem histórico diário. */
  timeline: {
    /** Dias reunidos em cada barra. */
    bucketDays: number;
    /** Do mais antigo para o mais recente. */
    buckets: { start: string; hours: number; previousHours: number }[];
    currentHours: number;
    previousHours: number;
    /** Variação % contra o período anterior; null sem base de comparação. */
    trendPct: number | null;
  } | null;
}
