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
import type { Alert } from "@/lib/types";
import { NIVEL_ALERTA_COLOR } from "@/lib/constants";
import { markAllAlertsReadAction, markAlertReadAction } from "@/lib/actions/alerts";
import { cn } from "@/lib/utils";

export function AlertsBell({
  alerts,
  unreadCount,
}: {
  alerts: Alert[];
  unreadCount: number;
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
          <span className="sr-only">Alertas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold">Alertas</p>
          {unreadCount > 0 && (
            <button
              disabled={isPending}
              onClick={() => startTransition(() => markAllAlertsReadAction())}
              className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" />
              Marcar tudo como lido
            </button>
          )}
        </div>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Inbox className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhum alerta por aqui.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="flex flex-col divide-y">
              {alerts.slice(0, 15).map((a) => {
                const content = (
                  <div
                    className={cn(
                      "flex flex-col gap-1 px-3 py-2.5 text-sm transition-colors hover:bg-accent",
                      !a.lido && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-snug">{a.titulo}</p>
                      <Badge variant={NIVEL_ALERTA_COLOR[a.nivel] as never} className="shrink-0">
                        {a.nivel}
                      </Badge>
                    </div>
                    <p className="text-xs leading-snug text-muted-foreground">{a.mensagem}</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {formatRelative(a.created_at)}
                    </p>
                  </div>
                );

                return (
                  <div
                    key={a.id}
                    onClick={() => {
                      if (!a.lido) startTransition(() => markAlertReadAction(a.id));
                    }}
                  >
                    {a.link ? <Link href={a.link}>{content}</Link> : content}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/dashboard/alertas">Ver todos os alertas</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
