import { ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sidebar-closed-groups";

function readClosed(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeClosed(keys: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // sem armazenamento disponível: o menu só não lembra o estado
  }
}

/**
 * Seção de um cliente no menu lateral: o título leva à página do cliente, a seta recolhe a lista
 * de serviços (lembrado entre visitas) e os serviços ficam sob uma linha-guia. Com o menu
 * reduzido a ícones, a lista fica sempre aberta.
 */
export function NavClientGroup({
  groupKey,
  title,
  titleUrl,
  items,
}: {
  groupKey: string;
  title: string;
  titleUrl: string;
  items: { title: string; url: string; icon?: LucideIcon }[];
}) {
  const { pathname } = useLocation();
  const { state, isMobile } = useSidebar();
  const [closed, setClosed] = useState(() => readClosed().includes(groupKey));

  const activeInside = items.some((i) => pathname === i.url || pathname.startsWith(i.url + "/"));
  // Navegar para um serviço de um grupo recolhido reabre o grupo (sem mexer no que foi salvo).
  useEffect(() => {
    if (activeInside) setClosed(false);
  }, [activeInside]);

  const rail = state === "collapsed" && !isMobile;
  const open = rail || !closed;

  function handleOpenChange(next: boolean) {
    setClosed(!next);
    const others = readClosed().filter((k) => k !== groupKey);
    writeClosed(next ? others : [...others, groupKey]);
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <SidebarGroup>
        <div className="flex items-center group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel asChild className="flex-1">
            <Link to={titleUrl} className="hover:text-sidebar-foreground">
              {title}
            </Link>
          </SidebarGroupLabel>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={`${open ? "Recolher" : "Expandir"} ${title}`}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground flex size-6 shrink-0 items-center justify-center rounded"
            >
              <ChevronDown className={cn("size-4 transition-transform", !open && "-rotate-90")} />
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenu className="border-sidebar-border ml-3 w-auto border-l pl-1.5 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:pl-0">
            {items.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                    <Link to={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
