import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { titleIfTruncated } from "@/lib/truncated-title";

export function NavMain({
  items,
  title,
}: {
  title?: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const { pathname } = useLocation();
  const { state, isMobile } = useSidebar();
  const rail = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            item.url === "/"
              ? pathname === "/"
              : pathname === item.url || pathname.startsWith(item.url + "/");
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                <Link
                  to={item.url}
                  onMouseEnter={(e) => !rail && titleIfTruncated(e.currentTarget, item.title)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
