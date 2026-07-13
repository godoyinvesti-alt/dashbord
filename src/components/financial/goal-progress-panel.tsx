import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { calcularMeta, STATUS_META_COLOR, STATUS_META_LABEL } from "@/lib/goal-calc";
import { formatBRL, formatNumber } from "@/lib/format";
import type { Goal } from "@/lib/types";
import type { CurrentMonthResults } from "@/lib/data/financial";
import { cn } from "@/lib/utils";

function MetaCard({
  titulo,
  metaValor,
  valorAtual,
  formatter,
}: {
  titulo: string;
  metaValor: number;
  valorAtual: number;
  formatter: (v: number) => string;
}) {
  if (!metaValor) {
    return (
      <Card className="gap-3 py-5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{titulo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{formatter(valorAtual)}</p>
          <p className="text-xs text-muted-foreground">
            Nenhuma meta definida para este mês.{" "}
            <Link href="/dashboard/configuracoes" className="inline-flex items-center gap-0.5 text-primary hover:underline">
              Configure suas metas mensais em Configurações
              <ArrowRight className="size-3" />
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  const resultado = calcularMeta(metaValor, valorAtual);

  return (
    <Card className="gap-3 py-5">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-semibold">{titulo}</CardTitle>
        <Badge variant={STATUS_META_COLOR[resultado.status] as never}>
          {STATUS_META_LABEL[resultado.status]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{formatter(valorAtual)}</p>
            <p className="text-xs text-muted-foreground">meta {formatter(metaValor)}</p>
          </div>
          <Progress value={Math.min(resultado.percentualConcluido, 100)} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {formatNumber(resultado.percentualConcluido, 1)}% da meta concluída
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <p>Falta: {formatter(resultado.valorRestante)}</p>
          <p>Dias restantes: {formatNumber(resultado.diasRestantesMes)}</p>
          <p>Média diária necessária: {formatter(resultado.mediaDiariaNecessaria)}</p>
          <p>Projeção fim do mês: {formatter(resultado.projecaoFimDoMes)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalProgressPanel({
  goal,
  results,
}: {
  goal: Goal | null;
  results: CurrentMonthResults;
}) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2">
        <Target className="size-4 text-muted-foreground" />
        <h2 className={cn("text-sm font-semibold")}>Progresso das metas do mês</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetaCard
          titulo="Faturamento"
          metaValor={goal?.meta_faturamento ?? 0}
          valorAtual={results.faturamento}
          formatter={formatBRL}
        />
        <MetaCard
          titulo="Lucro"
          metaValor={goal?.meta_lucro ?? 0}
          valorAtual={results.lucro}
          formatter={formatBRL}
        />
        <MetaCard
          titulo="Vendas"
          metaValor={goal?.meta_vendas ?? 0}
          valorAtual={results.numeroVendas}
          formatter={(v) => formatNumber(v)}
        />
      </div>
    </div>
  );
}
