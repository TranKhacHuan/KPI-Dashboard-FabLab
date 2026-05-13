import { LayoutDashboard, ListChecks, CheckCircle2, BarChart3, Users, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/store/app-store";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const currentUser = useAppStore((s) => s.users.find((u) => u.id === s.currentUserId));
  if (!currentUser) return null;

  const isActive = (p: string) => pathname === p;

  const memberItems = [
    { title: "Tổng quan", url: "/", icon: LayoutDashboard },
    { title: "Task của tôi", url: "/my-tasks", icon: ListChecks },
  ];
  const leaderItems = [
    { title: "Tổng quan", url: "/", icon: LayoutDashboard },
    { title: "Task của tôi", url: "/my-tasks", icon: ListChecks },
    { title: "Duyệt task", url: "/approvals", icon: CheckCircle2 },
    { title: "Giao việc", url: "/assign", icon: Users },
  ];
  const managerItems = [
    { title: "Tổng quan", url: "/", icon: LayoutDashboard },
    { title: "Báo cáo", url: "/reports", icon: BarChart3 },
  ];



  const items =
    currentUser.role === "manager" ? managerItems : currentUser.role === "leader" ? leaderItems : memberItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display text-base font-bold text-sidebar-foreground">TaskBoard</span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                EIU - FABLAB
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
