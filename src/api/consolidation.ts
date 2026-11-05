import api from "@/service/api";

export interface ConsolidationOutcome {
  skipped: boolean;
  runId?: string;
  importsSent?: number;
  failures?: number;
}

/** Só ADMIN, só depois das 18h (o backend responde 409 antes disso). */
async function runConsolidation(): Promise<ConsolidationOutcome> {
  const { data } = await api.post("/admin/consolidations/run");
  return data;
}

export default { runConsolidation };
