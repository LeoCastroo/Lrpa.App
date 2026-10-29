import type { FailureClassification, IClassCounts } from "@/service/types/Panel";

/**
 * Rótulos e cores da classificação de falha gravada pelo robô. Um lugar só, para a tabela, os
 * cartões e os gráficos falarem do mesmo jeito:
 *  - Requer Tratativa (âmbar): a regra de negócio pede ação do escritório;
 *  - Falha da Automação (vermelho): bug ou infraestrutura — quem age é a LCS;
 *  - Sem classificação (cinza): registro anterior à classificação.
 */
export const CLASSIFICATION_LABEL: Record<FailureClassification, string> = {
  tratativa: "Requer Tratativa",
  automacao: "Falha da Automação",
  sem_classe: "Sem classificação",
};

export const CLASSIFICATION_HINT: Record<FailureClassification, string> = {
  tratativa: "A regra de negócio pede uma ação do escritório (ex.: documento faltando, cadastro incompleto).",
  automacao: "Falha técnica do robô ou dos sistemas — a LCS acompanha e corrige.",
  sem_classe: "Registro anterior à classificação das falhas.",
};

/** Barras empilhadas (gráfico diário, motivos). */
export const CLASSIFICATION_BAR: Record<FailureClassification, string> = {
  tratativa: "bg-warning/70",
  automacao: "bg-destructive/70",
  sem_classe: "bg-muted-foreground/40",
};

/** Ordem de empilhamento e de legenda: o que o escritório precisa tratar vem primeiro. */
export const CLASSIFICATION_ORDER: FailureClassification[] = ["tratativa", "automacao", "sem_classe"];

export function classCount(classes: IClassCounts, key: FailureClassification): number {
  return key === "tratativa" ? classes.tratativa : key === "automacao" ? classes.automacao : classes.semClasse;
}
