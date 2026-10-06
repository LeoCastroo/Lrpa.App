import { type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  title,
  titleUrl,
}: {
  title?: string;
  /** Quando informado, o título da seção vira um link (ex.: página do cliente). */
  titleUrl?: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      {title &&
        (titleUrl ? (
          <SidebarGroupLabel asChild>
            <Link to={titleUrl} className="hover:text-sidebar-foreground">
              {title}
            </Link>
          </SidebarGroupLabel>
        ) : (
          <SidebarGroupLabel>{title}</SidebarGroupLabel>
        ))}
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            item.url === "/"
              ? pathname === "/"
              : pathname === item.url || pathname.startsWith(item.url + "/");
          return (
            <SidebarMenuItem key={item.title}>
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
    </SidebarGroup>
  );
}
