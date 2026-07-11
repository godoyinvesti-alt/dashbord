"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, ChevronRight } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/utils";
import { NAV_SECOES } from "@/lib/constants";
import type { Notification } from "@/lib/types";

const COLLAPSE_KEY = "x1-sidebar-collapsed";

export function AppShell({
  children,
  workspace,
  workspaces,
  profile,
  notifications,
  unreadCount,
}: {
  children: React.ReactNode;
  workspace: { id: string; nome: string };
  workspaces: { id: string; nome: string }[];
  profile: { nome: string; email: string };
  notifications: Notification[];
  unreadCount: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    if (stored) setCollapsed(stored === "1");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, prev ? "0" : "1");
      return !prev;
    });
  }

  const currentSection = NAV_SECOES.slice()
    .reverse()
    .find((item) =>
      item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)
    );

  return (
    <div className="flex min-h-svh bg-muted/30">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 md:flex",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div className={cn("flex h-16 items-center gap-2 px-4", collapsed && "justify-center px-2")}>
          <Logo iconOnly={collapsed} className="text-sidebar-foreground [&_span:last-child]:text-sidebar-foreground" />
        </div>
        <div className={cn("px-3 pb-3", collapsed && "px-2")}>
          <WorkspaceSwitcher current={workspace} workspaces={workspaces} collapsed={collapsed} />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
          <SidebarNav collapsed={collapsed} />
        </div>
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="w-full justify-center text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : (
              <>
                <PanelLeftClose className="size-4" /> Recolher menu
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Drawer mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground [&_svg]:text-inherit">
          <VisuallyHidden>
            <SheetTitle>Menu de navegação</SheetTitle>
          </VisuallyHidden>
          <div className="flex h-16 items-center gap-2 px-4">
            <Logo className="text-sidebar-foreground [&_span:last-child]:text-sidebar-foreground" />
          </div>
          <div className="px-3 pb-3">
            <WorkspaceSwitcher current={workspace} workspaces={workspaces} />
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Conteúdo principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <nav className="hidden min-w-0 flex-1 items-center gap-1.5 text-sm text-muted-foreground md:flex">
            <Link href="/dashboard" className="hover:text-foreground">
              {workspace.nome}
            </Link>
            {currentSection && currentSection.href !== "/dashboard" && (
              <>
                <ChevronRight className="size-3.5" />
                <span className="truncate font-medium text-foreground">
                  {currentSection.label}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              workspaceId={workspace.id}
            />
            <UserMenu nome={profile.nome} email={profile.email} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
