import {
  FileDown,
  FileSpreadsheet,
  LayoutDashboard,
  ListChecks,
  MailCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useServicesStore, useUserStore } from "@/store";

// Novos serviços ganham um ícone padrão sem precisar de código novo.
const iconByKey: Record<string, LucideIcon> = {
  BMG_UPDATES_BATCH: ListChecks,
  BMG_WORKFLOWS_BATCH: Workflow,
  BMG_MESSAGES_READ: MailCheck,
  BMG_DOWNLOAD_DOCUMENTS: FileDown,
};

function serviceIcon(key: string): LucideIcon {
  return iconByKey[key] ?? FileSpreadsheet;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((s) => s.user);
  const { services, status } = useServicesStore();

  const serviceItems = services.map((s) => ({
    title: s.name,
    url: `/services/${s.key}`,
    icon: serviceIcon(s.key),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <FileSpreadsheet className="size-4 shrink-0" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.office?.name ?? "LCS"}</span>
            <span className="truncate text-xs text-muted-foreground">LCS RPA</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={[{ title: "Início", url: "/", icon: LayoutDashboard }]} />

        {status === "loading" ? (
          <div className="flex flex-col gap-2 px-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : serviceItems.length ? (
          <NavMain title="Serviços" items={serviceItems} />
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{ avatar: "", email: user.email, name: user.name }} />
      </SidebarFooter>
    </Sidebar>
  );
}
