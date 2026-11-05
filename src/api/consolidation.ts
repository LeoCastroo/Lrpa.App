import api from "@/service/api";

export interface ServiceConsolidationOutcome {
  /** Importações entregues ao RPA agora. */
  importsSent: number;
  /** Nada aguardando consolidação para este serviço/escritório. */
  nothingPending: boolean;
}

/** Só ADMIN, a qualquer hora: consolida as pendentes de UM serviço de UM escritório. */
async function consolidateService(
  serviceKey: string,
  office?: string
): Promise<ServiceConsolidationOutcome> {
  const { data } = await api.post(`/services/${serviceKey}/consolidate`, null, {
    params: { office },
  });
  return data;
}

export default { consolidateService };
