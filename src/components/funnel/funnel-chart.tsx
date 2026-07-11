import { ArrowDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
import type { FunnelStageMetric } from "@/lib/data/funnel";

export function FunnelChart({ metrics }: { metrics: FunnelStageMetric[] }) {
  const maxCount = Math.max(...metrics.map((m) => m.leadsAcumulados), 1);

  return (
    <Card className="py-5">
      <CardContent className="space-y-1">
        {metrics.map((m, idx) => {
          const widthPct = Math.max((m.leadsAcumulados / maxCount) * 100, 4);
          return (
            <div key={m.stage.id}>
              <div className="flex items-center gap-4 py-2">
                <div className="w-40 shrink-0 text-sm font-medium">{m.stage.nome}</div>
                <div className="min-w-0 flex-1">
                  <div
                    className="flex h-9 items-center justify-between rounded-md px-3 text-xs font-medium text-white transition-all"
                    style={{
                      width: `${widthPct}%`,
                      background: m.stage.cor || "var(--chart-1)",
                      minWidth: "72px",
                    }}
                  >
                    <span className="tabular-nums">{formatNumber(m.leadsAcumulados)} leads</span>
                  </div>
                </div>
                <div className="w-32 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                  {formatBRL(m.valorNaEtapa)}
                </div>
              </div>
              {idx < metrics.length - 1 && (
                <div className="ml-40 flex items-center gap-2 py-0.5 pl-3 text-xs text-muted-foreground">
                  <ArrowDown className="size-3" />
                  {m.taxaConversao !== null ? (
                    <>
                      <span className="font-medium text-success">
                        {formatPercent(m.taxaConversao)} avançam
                      </span>
                      <span>·</span>
                      <span className="text-destructive">
                        {formatPercent(m.taxaAbandono ?? 0)} de queda
                      </span>
                    </>
                  ) : (
                    <span>Sem dados suficientes</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
