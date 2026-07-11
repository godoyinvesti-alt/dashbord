"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Inbox } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";
import type { Notification } from "@/lib/types";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

export function NotificationBell({
  notifications,
  unreadCount,
  workspaceId,
}: {
  notifications: Notification[];
  unreadCount: number;
  workspaceId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold">Notificações</p>
          {unreadCount > 0 && (
            <button
              disabled={isPending}
              onClick={() =>
                startTransition(() => markAllNotificationsReadAction(workspaceId))
              }
              className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" />
              Marcar tudo como lido
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Inbox className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação por aqui.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="flex flex-col divide-y">
              {notifications.map((n) => {
                const content = (
                  <div
                    className={cn(
                      "flex flex-col gap-1 px-3 py-2.5 text-sm transition-colors hover:bg-accent",
                      !n.lida && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-snug">{n.titulo}</p>
                      {!n.lida && (
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs leading-snug text-muted-foreground">
                      {n.mensagem}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {formatRelative(n.created_at)}
                    </p>
                  </div>
                );

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.lida) startTransition(() => markNotificationReadAction(n.id));
                    }}
                  >
                    {n.link ? (
                      <Link href={n.link}>{content}</Link>
                    ) : (
                      content
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/dashboard/configuracoes?aba=notificacoes">
              Preferências de notificação
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationBadgeStatic({ count }: { count: number }) {
  return <Badge variant="soft-destructive">{count}</Badge>;
}
