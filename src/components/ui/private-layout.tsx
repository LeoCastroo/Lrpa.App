import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { checkToken, getNewToken } from "@/service/authentication";
import { useServicesStore } from "@/store";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

type SessionState = "checking" | "ok" | "anonymous" | "expired" | "offline";

export default function PrivateLayout({
  children,
}: React.PropsWithChildren & { title: string }) {
  const [state, setState] = useState<SessionState>("checking");
  const [attempt, setAttempt] = useState(0);
  const fetchServices = useServicesStore((s) => s.fetch);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (checkToken()) {
      setState("ok");
      return;
    }
    if (!refreshToken) {
      setState("anonymous");
      return;
    }

    setState("checking");
    getNewToken()
      .then((data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refresh_token", data.refresh_token);
        setState("ok");
      })
      .catch((error) => {
        // Sem resposta = API/rede fora; não derruba a sessão por isso.
        if (!error?.response) {
          setState("offline");
          return;
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user-storage");
        setState("expired");
      });
  }, [attempt]);

  const isAuthenticated = state === "ok";

  // Garante que os serviços (sidebar/permissões) sejam hidratados também em
  // reload direto de uma URL profunda.
  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
    }
  }, [isAuthenticated, fetchServices]);

  if (state === "checking") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg">Não foi possível conectar ao servidor.</p>
        <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
        <Button onClick={() => setAttempt((n) => n + 1)}>Tentar novamente</Button>
      </div>
    );
  }

  if (state === "expired") {
    return <Navigate to={"/login?sessao=expirada"} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={"/login"} replace />;
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
