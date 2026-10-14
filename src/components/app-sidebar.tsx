import { KeyRound, LayoutDashboard, ListTodo, Users } from "lucide-react";
import * as React from "react";

import { BrandLogo } from "@/components/brand-logo";
import { NavClientGroup } from "@/components/nav-client-group";
import { NavMain } from "@/components/nav-main";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { groupServicesByClient } from "@/lib/group-by-client";
import { serviceIcon } from "@/lib/service-icons";
import { useServicesStore, useUserStore } from "@/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((s) => s.user);
  const { services, status } = useServicesStore();

  const clientGroups = groupServicesByClient(services);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-3 p-3">
        <BrandLogo
          markClassName="size-7"
          textClassName="text-base tracking-[0.12em] group-data-[collapsible=icon]:hidden"
        />
        {user.office?.name && (
          <div className="border-sidebar-border bg-sidebar-accent/40 rounded-md border px-2.5 py-1.5 group-data-[collapsible=icon]:hidden">
            <span className="text-sidebar-foreground/50 block text-[10px] font-semibold tracking-wider uppercase">
              Escritório
            </span>
            <span className="block truncate text-sm font-medium">{user.office.name}</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={[
            { title: "Início", url: "/", icon: LayoutDashboard },
            { title: "Central de Pendências", url: "/pendencies", icon: ListTodo },
            ...(user.role === "ADMIN"
              ? [{ title: "Usuários", url: "/users", icon: Users }]
              : []),
            ...(user.role === "ADMIN" || user.hasVaultAccess
              ? [{ title: "Cofre de Credenciais", url: "/credentials", icon: KeyRound }]
              : []),
          ]}
        />

        {status === "loading" ? (
          <div className="flex flex-col gap-2 px-2">
            <Skeleton className="h-8 w-full bg-sidebar-accent" />
            <Skeleton className="h-8 w-full bg-sidebar-accent" />
          </div>
        ) : (
          // Uma seção por cliente final (ex.: BMG) — um novo cliente ganha a própria seção
          // automaticamente, sem mudança de código.
          clientGroups.map(({ client, services: clientServices }) => (
            <NavClientGroup
              key={client.key}
              groupKey={client.key}
              title={client.name}
              titleUrl={`/clients/${client.key}`}
              items={clientServices.map((s) => ({
                title: s.name,
                url: `/services/${s.key}`,
                icon: serviceIcon(s.key),
              }))}
            />
          ))
        )}
      </SidebarContent>
    </Sidebar>
  );
}
