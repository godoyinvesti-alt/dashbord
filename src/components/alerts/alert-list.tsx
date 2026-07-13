"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCheck, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { NIVEL_ALERTA_COLOR, NIVEL_ALERTA_LABEL } from "@/lib/constants";
import {
  markAlertReadAction,
  markAllAlertsReadAction,
  resolveAlertAction,
  reopenAlertAction,
} from "@/lib/actions/alerts";
import type { Alert, NivelAlerta } from "@/lib/types";

const NIVEL_FILTROS: { value: NivelAlerta | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "informativo", label: "Informativo" },
  { value: "atencao", label: "Atenção" },
  { value: "importante", label: "Importante" },
  { value: "critico", label: "Crítico" },
];

export function AlertList({ alerts }: { alerts: Alert[] }) {
  const [filtro, setFiltro] = useState<NivelAlerta | "todos">("todos");
  const [mostrarResolvidos, setMostrarResolvidos] = useState(false);
  const [isPending, startTransition] = useTransition();

  const unreadCount = alerts.filter((a) => !a.lido).length;

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (!mostrarResolvidos && a.resolvido) return false;
      if (filtro !== "todos" && a.nivel !== filtro) return false;
      return true;
    });
  }, [alerts, filtro, mostrarResolvidos]);

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markAlertReadAction(id);
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAlertsReadAction();
      toast.success("Todos os alertas foram marcados como lidos.");
    });
  }

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveAlertAction(id);
      toast.success("Alerta marcado como resolvido.");
    });
  }

  function handleReopen(id: string) {
    startTransition(async () => {
      await reopenAlertAction(id);
      toast.success("Alerta reaberto.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {NIVEL_FILTROS.map((f) => (
            <Button
              key={f.value}
              type="button"
              size="sm"
              variant={filtro === f.value ? "default" : "outline"}
              onClick={() => setFiltro(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => setMostrarResolvidos((v) => !v)}>
            {mostrarResolvidos ? "Ocultar resolvidos" : "Mostrar resolvidos"}
          </Button>
          {unreadCount > 0 && (
            <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={handleMarkAllRead}>
              <CheckCheck /> Marcar tudo como lido
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-14 text-center text-sm text-muted-foreground">
          Nenhum alerta encontrado para este filtro.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const body = (
              <Card
                className={cn(
                  "py-4 transition-colors",
                  !alert.lido && "border-primary/40 bg-primary/[0.03]"
                )}
              >
                <CardContent className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={NIVEL_ALERTA_COLOR[alert.nivel] as never}>
                      {NIVEL_ALERTA_LABEL[alert.nivel]}
                    </Badge>
                    {alert.resolvido && (
                      <Badge variant="soft-success">
                        <CheckCircle2 className="size-3" /> Resolvido
                      </Badge>
                    )}
                    {!alert.lido && <span className="size-2 rounded-full bg-primary" title="Não lido" />}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatRelative(alert.created_at)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium leading-snug">{alert.titulo}</p>
                    <p className="text-sm text-muted-foreground">{alert.mensagem}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {!alert.lido && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMarkRead(alert.id);
                        }}
                      >
                        Marcar como lido
                      </Button>
                    )}
                    {alert.resolvido ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReopen(alert.id);
                        }}
                      >
                        <RotateCcw /> Reabrir
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResolve(alert.id);
                        }}
                      >
                        <CheckCircle2 /> Marcar como resolvido
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );

            return alert.link ? (
              <Link key={alert.id} href={alert.link} className="block">
                {body}
              </Link>
            ) : (
              <div key={alert.id}>{body}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
