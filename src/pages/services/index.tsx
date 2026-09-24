import { Navigate, useLocation } from "react-router-dom";
import { defaultTab } from "@/components/service-hub/service-page";
import { Skeleton } from "@/components/ui/skeleton";
import { useService } from "@/hooks/use-service";
import { useUserStore } from "@/store";

/** /services/:serviceKey → primeira aba disponível para o serviço. */
export default function Page() {
  const { service, isLoading, notFound } = useService();
  const isAdmin = useUserStore((s) => s.user.role) === "ADMIN";
  const { search } = useLocation();

  if (isLoading) {
    return (
      <div className="container mx-auto py-2">
        <Skeleton className="h-8 w-64 mb-3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const tab = service && !notFound ? defaultTab(service, isAdmin) : null;
  if (!service || !tab) return <Navigate to="/" replace />;

  return <Navigate to={`/services/${service.key}/${tab}${search}`} replace />;
}
