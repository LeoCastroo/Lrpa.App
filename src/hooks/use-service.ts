import { useParams } from "react-router-dom";
import { useServicesStore } from "@/store";
import { IServiceDefinition } from "@/service/types/Service";

export interface UseServiceResult {
  serviceKey?: string;
  service?: IServiceDefinition;
  isLoading: boolean;
  notFound: boolean;
}

// Resolve :serviceKey da rota contra os serviços permitidos (services store).
// A autorização real permanece no backend (404); isto é apenas guard de UX.
export function useService(): UseServiceResult {
  const { serviceKey } = useParams();
  const { services, status } = useServicesStore();

  if (status !== "loaded") {
    return { serviceKey, isLoading: true, notFound: false };
  }

  const service = services.find((s) => s.key === serviceKey);
  return { serviceKey, service, isLoading: false, notFound: !service };
}
