import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { checkToken, getNewToken } from "@/service/authentication";
import { useServicesStore } from "@/store";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateLayout({
  children,
}: React.PropsWithChildren & { title: string }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fetchServices = useServicesStore((s) => s.fetch);

  useEffect(() => {
    const authenticated = checkToken();
    const refreshToken = localStorage.getItem("refresh_token");

    if (!authenticated && !refreshToken) {
      return setIsLoading(false);
    }

    if (authenticated) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    if (!authenticated && refreshToken) {
      getNewToken()
        .then((data) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("refresh_token", data.refresh_token);
          setIsAuthenticated(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, []);

  // Garante que os serviços (sidebar/permissões) sejam hidratados também em
  // reload direto de uma URL profunda.
  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated, fetchServices]);

  if (isLoading) {
    return <></>;
  }

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <SidebarProvider className="h-svh">
      <AppSidebar variant="inset" collapsible="icon" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-foreground" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
