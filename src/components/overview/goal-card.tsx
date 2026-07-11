import { Target, TrendingUp, TrendingDown, CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { STATUS_META_LABEL, STATUS_META_COLOR } from "@/lib/constants";
import type { MetaMensalContexto } from "@/lib/data/goals";
import { GoalCalculatorDialog } from "@/components/overview/goal-calculator-dialog";

export function GoalCard({ ctx }: { ctx: MetaMensalContexto }) {
  const { metaValor, faturamentoAtual, resultado } = ctx;
  const pct = Math.min(Math.max(resultado.percentualConcluido, 0), 100);

  if (metaValor <= 0) {
    return (
      <Card className="border-dashed py-6">
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">Defina sua meta mensal de faturamento</p>
            <p className="text-sm text-muted-foreground">
              Configure uma meta em Metas ou nas Configurações do workspace para acompanhar seu progresso.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressColor =
    resultado.status === "meta_atingida"
      ? "bg-success"
      : resultado.status === "acima_do_ritmo"
      ? "bg-success"
      : resultado.status === "dentro_do_ritmo"
      ? "bg-info"
      : "bg-destructive";

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="size-4.5" />
              </span>
              <p className="text-sm font-semibold">Meta mensal de faturamento</p>
              <Badge variant={STATUS_META_COLOR[resultado.status] as never}>
                {STATUS_META_LABEL[resultado.status]}
              </Badge>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-semibold tabular-nums tracking-tight">
                {formatBRL(faturamentoAtual)}
              </span>
              <span className="text-sm text-muted-foreground">
                de {formatBRL(metaValor)} · {pct.toFixed(0)}%
              </span>
            </div>

            <Progress value={pct} indicatorClassName={progressColor} className="h-2.5" />

            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Você atingiu <span className="font-medium text-foreground">{pct.toFixed(0)}%</span> da sua meta mensal.
              </p>
              {resultado.valorRestante > 0 ? (
                <>
                  <p>
                    Faltam <span className="font-medium text-foreground">{formatBRL(resultado.valorRestante)}</span> para atingir a meta.
                  </p>
                  <p>
                    Você precisa faturar{" "}
                    <span className="font-medium text-foreground">{formatBRL(resultado.faturamentoDiarioNecessario)}</span>{" "}
                    por dia até o fim do mês ({resultado.vendasDiariasNecessarias.toFixed(1)} vendas/dia).
                  </p>
                </>
              ) : (
                <p className="font-medium text-success">Meta mensal atingida! 🎉</p>
              )}
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 rounded-xl bg-muted/40 p-4 lg:w-72">
            <MiniStat
              icon={CalendarDays}
              label="Dias restantes"
              value={String(resultado.diasRestantesMes)}
            />
            <MiniStat
              icon={resultado.ritmoDiferenca >= 0 ? TrendingUp : TrendingDown}
              label="Ritmo vs. esperado"
              value={formatBRL(resultado.ritmoDiferenca)}
              tone={resultado.ritmoDiferenca >= 0 ? "success" : "destructive"}
            />
            <div className="col-span-2 space-y-2 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">Projeção de fechamento do mês</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <ProjecaoItem label="Conservador" value={resultado.projecaoConservadora} />
                <ProjecaoItem label="Ritmo atual" value={resultado.projecaoAtual} destaque />
                <ProjecaoItem label="Otimista" value={resultado.projecaoOtimista} />
              </div>
            </div>
            <div className="col-span-2">
              <GoalCalculatorDialog />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "success" | "destructive";
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-[11px]">{label}</span>
      </div>
      <p
        className={`text-sm font-semibold tabular-nums ${
          tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProjecaoItem({
  label,
  value,
  destaque,
}: {
  label: string;
  value: number;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-1 py-1.5 ${destaque ? "bg-primary/10" : ""}`}
    >
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs font-semibold tabular-nums ${destaque ? "text-primary" : ""}`}>
        {formatBRL(value)}
      </p>
    </div>
  );
}
