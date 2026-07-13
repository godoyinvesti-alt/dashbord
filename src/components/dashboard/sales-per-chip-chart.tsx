"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Smartphone } from "lucide-react";
import { formatBRL } from "@/lib/format";

export function SalesPerChipChart({
  data,
}: {
  data: { nome: string; vendas: number; receita: number }[];
}) {
  if (data.length === 0) {
    return (
      <ChartCard title="Vendas por chip" description="Receita por chip no período selecionado">
        <EmptyState
          icon={Smartphone}
          title="Sem vendas vinculadas a chips"
          description="Registre vendas informando o chip responsável para ver este gráfico."
          className="h-full justify-center border-none py-0"
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Vendas por chip" description="Receita por chip no período selecionado">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            type="number"
            tickFormatter={(v) => formatBRL(v).replace("R$", "").trim()}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            className="fill-muted-foreground"
          />
          <YAxis
            type="category"
            dataKey="nome"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={110}
            className="fill-muted-foreground"
          />
          <Tooltip content={<ChartTooltip formatter={(value) => formatBRL(value)} />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="receita" name="Receita" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
