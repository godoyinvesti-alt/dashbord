"use client";

import { toast } from "sonner";
import { Pencil, Trash2, Target } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { formatDate } from "@/lib/format";
import { formatGoalValue } from "@/lib/goal-format";
import { TIPO_META_LABEL, STATUS_META_LABEL, STATUS_META_COLOR } from "@/lib/constants";
import { deleteGoalAction } from "@/lib/actions/goals";
import type { GoalRow } from "@/lib/data/goals-list";
import type { Product, Agent } from "@/lib/types";

export function GoalsList({
  goals,
  products,
  agents,
}: {
  goals: GoalRow[];
  products: Product[];
  agents: Agent[];
}) {
  if (goals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Nenhuma meta cadastrada"
        description="Crie metas de faturamento, vendas, conversão e mais para acompanhar seu progresso."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => {
        const pct = Math.min(Math.max(goal.percentual, 0), 100);
        const progressColor =
          goal.status === "meta_atingida" || goal.status === "acima_do_ritmo"
            ? "bg-success"
            : goal.status === "dentro_do_ritmo"
            ? "bg-info"
            : "bg-destructive";

        return (
          <Card key={goal.id} className="py-5">
            <CardHeader className="flex-row items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{TIPO_META_LABEL[goal.tipo]}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(goal.periodo_inicio)} – {formatDate(goal.periodo_fim)}
                  {goal.produto_nome && ` · ${goal.produto_nome}`}
                  {goal.agente_nome && ` · ${goal.agente_nome}`}
                </p>
              </div>
              <Badge variant={STATUS_META_COLOR[goal.status] as never}>{STATUS_META_LABEL[goal.status]}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-semibold tabular-nums">{formatGoalValue(goal.tipo, goal.valorAtual)}</span>
                <span className="text-xs text-muted-foreground">
                  de {formatGoalValue(goal.tipo, goal.valor_meta)}
                </span>
              </div>
              <Progress value={pct} indicatorClassName={progressColor} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{pct.toFixed(0)}% concluído</span>
                {goal.restante > 0 && <span>Faltam {formatGoalValue(goal.tipo, goal.restante)}</span>}
              </div>
              <div className="flex justify-between gap-2 pt-1">
                <GoalFormDialog
                  goal={goal}
                  products={products}
                  agents={agents}
                  trigger={
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5">
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                  }
                />
                <ConfirmDialog
                  trigger={
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                  title="Excluir meta"
                  description="Tem certeza que deseja excluir esta meta?"
                  destructive
                  confirmLabel="Excluir"
                  onConfirm={async () => {
                    const result = await deleteGoalAction(goal.id);
                    if (result.error) toast.error(result.error);
                    else toast.success("Meta excluída.");
                  }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
