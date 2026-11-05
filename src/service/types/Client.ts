export interface IClientResults {
  windowDays: number | null;
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
  } | null;
}
