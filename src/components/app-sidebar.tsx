import {
  CalendarClock,
  FileDown,
  FileSpreadsheet,
  FileUp,
  Gavel,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  MailCheck,
  ReceiptText,
  Scale,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { BrandMark } from "@/components/brand-logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { groupServicesByClient } from "@/lib/group-by-client";
import { useServicesStore, useUserStore } from "@/store";

// Novos serviços ganham um ícone padrão sem precisar de código novo.
const iconByKey: Record<string, LucideIcon> = {
  BMG_UPDATES_BATCH: ListChecks,
  BMG_WORKFLOWS_BATCH: Workflow,
  BMG_MESSAGES_READ: MailCheck,
  BMG_DOWNLOAD_DOCUMENTS: FileDown,
  BMG_REGISTER_LAW_SUIT: Scale,
  BMG_UPLOAD_DOCUMENTS: FileUp,
  BMG_UPDATES_DEFENSE: Gavel,
  BMG_UPDATES_AUDIENCES: CalendarClock,
  MERCANTIL_REGISTER_LAW_SUIT: Scale,
  MERCANTIL_UPDATES: Gavel,
  MERCANTIL_UPLOAD_DOCUMENTS: FileUp,
  MERCANTIL_REFUNDS: ReceiptText,
  MERCANTIL_BATCH_UPDATES: ListChecks,
  INTER_REGISTER_LAW_SUIT: Scale,
  INTER_UPLOAD_DOCUMENTS: FileUp,
  INTER_REFUNDS: ReceiptText,
  INTER_TASKS: ListTodo,
  INTER_UPDATES: ListChecks,
  INTER_APPEAL_TASKS: Gavel,
};

function serviceIcon(key: string): LucideIcon {
  return iconByKey[key] ?? FileSpreadsheet;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUserStore((s) => s.user);
  const { services, status } = useServicesStore();

  const clientGroups = groupServicesByClient(services);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <BrandMark className="size-8" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.office?.name ?? "LRPA"}</span>
            <span className="font-display truncate text-xs tracking-wide text-muted-foreground">
              LRPA
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={[
            { title: "Início", url: "/", icon: LayoutDashboard },
            { title: "Central de Pendências", url: "/pendencies", icon: ListTodo },
          ]}
        />

        {status === "loading" ? (
          <div className="flex flex-col gap-2 px-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          // Uma seção por cliente final (ex.: BMG) — um novo cliente ganha a própria seção
          // automaticamente, sem mudança de código.
          clientGroups.map(({ client, services: clientServices }) => (
            <NavMain
              key={client.key}
              title={client.name}
              items={clientServices.map((s) => ({
                title: s.name,
                url: `/services/${s.key}`,
                icon: serviceIcon(s.key),
              }))}
            />
          ))
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{ avatar: "", email: user.email, name: user.name }} />
      </SidebarFooter>
    </Sidebar>
  );
}
