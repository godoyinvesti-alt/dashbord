import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { NIVEL_ALERTA_COLOR, NIVEL_ALERTA_LABEL } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import type { Alert } from "@/lib/types";

const NIVEL_ORDER: Record<Alert["nivel"], number> = {
  critico: 0,
  importante: 1,
  atencao: 2,
  informativo: 3,
};

export function AttentionSection({ alerts }: { alerts: Alert[] }) {
  const pendentes = alerts
    .filter((a) => !a.resolvido)
    .sort((a, b) => NIVEL_ORDER[a.nivel] - NIVEL_ORDER[b.nivel])
    .slice(0, 6);

  return (
    <Card className="gap-4 py-5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Atenção necessária</CardTitle>
        <CardDescription>Alertas operacionais que precisam da sua ação</CardDescription>
      </CardHeader>
      <CardContent>
        {pendentes.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="Tudo em ordem"
            description="Nenhum alerta pendente no momento."
            className="border-none py-6"
          />
        ) : (
          <div className="divide-y">
            {pendentes.map((alert) => {
              const content = (
                <div className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium leading-snug">{alert.titulo}</p>
                    <p className="text-xs leading-snug text-muted-foreground">{alert.mensagem}</p>
                    <p className="text-[11px] text-muted-foreground/70">{formatRelative(alert.created_at)}</p>
                  </div>
                  <Badge variant={NIVEL_ALERTA_COLOR[alert.nivel] as never} className="shrink-0">
                    {NIVEL_ALERTA_LABEL[alert.nivel]}
                  </Badge>
                </div>
              );
              return alert.link ? (
                <Link key={alert.id} href={alert.link} className="block hover:bg-accent/40">
                  {content}
                </Link>
              ) : (
                <div key={alert.id}>{content}</div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
