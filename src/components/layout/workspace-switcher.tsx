"use client";

import { ChevronsUpDown, Check, Building2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { switchWorkspaceAction } from "@/lib/actions/workspace";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({
  current,
  workspaces,
  collapsed = false,
}: {
  current: { id: string; nome: string };
  workspaces: { id: string; nome: string }[];
  collapsed?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-2.5 py-2 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          collapsed && "justify-center px-2"
        )}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Building2 className="size-3.5" />
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground">
              {current.nome}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-foreground/50" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Espaços de trabalho</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((w) => (
          <form action={switchWorkspaceAction} key={w.id}>
            <input type="hidden" name="workspaceId" value={w.id} />
            <button type="submit" className="w-full">
              <DropdownMenuItem asChild>
                <span className="flex items-center justify-between">
                  {w.nome}
                  {w.id === current.id && <Check className="size-4 text-primary" />}
                </span>
              </DropdownMenuItem>
            </button>
          </form>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
