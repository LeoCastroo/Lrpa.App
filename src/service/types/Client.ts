export interface IClientResults {
  windowDays: number | null;
  /** Itens tratados com sucesso por serviço — só serviços com volume. */
  services: Record<string, number>;
  /** Soma por área (chave da categoria) — só áreas com volume. */
  categories: Record<string, number>;
  total: number;
}
