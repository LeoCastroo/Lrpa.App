import { AppSidebar } from "@/components/app-sidebar";
import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { checkToken, getNewToken } from "@/service/authentication";
import { useServicesStore, useUserStore } from "@/store";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

type SessionState = "checking" | "ok" | "anonymous" | "expired" | "offline";

export default function PrivateLayout({
  children,
  title,
}: React.PropsWithChildren & { title: string }) {
  const [state, setState] = useState<SessionState>("checking");
  const [attempt, setAttempt] = useState(0);
  const fetchServices = useServicesStore((s) => s.fetch);
  const services = useServicesStore((s) => s.services);
  const user = useUserStore((s) => s.user);

  // As rotas de serviço e de cliente têm um título genérico ("Visão geral", "Itens", "Cliente"):
  // o que identifica a tela é o nome do serviço/cliente, que vem do endereço.
  const { serviceKey, clientKey } = useParams();
  const service = serviceKey ? services.find((s) => s.key === serviceKey) : undefined;
  const client = clientKey ? services.find((s) => s.client.key === clientKey)?.client : undefined;
  const headerTitle = service?.name ?? client?.name ?? title;
  const section = service ? title : undefined;
  useDocumentTitle(section ? `${headerTitle} · ${section}` : headerTitle);

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
      <AppSidebar variant="sidebar" collapsible="icon" />
      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card px-4 transition-[width,height] ease-linear">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="-ml-1 text-foreground" />
            <Separator orientation="vertical" className="h-5" />
            <span className="truncate text-sm font-medium">{headerTitle}</span>
            {section && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="truncate text-sm text-muted-foreground">{section}</span>
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <NavUser user={{ avatar: "", email: user.email, name: user.name }} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-h-0 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
