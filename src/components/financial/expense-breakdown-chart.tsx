"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

import { ChartCard } from "@/components/charts/chart-card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { CATEGORIA_DESPESA_LABEL, CATEGORIA_DESPESA_OPCOES } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import type { CategoriaDespesa } from "@/lib/types";

const CATEGORIA_COR: Record<CategoriaDespesa, string> = Object.fromEntries(
  CATEGORIA_DESPESA_OPCOES.map((categoria, index) => [categoria, `var(--chart-${index + 1})`])
) as Record<CategoriaDespesa, string>;

export function ExpenseBreakdownChart({
  data,
}: {
  data: { categoria: CategoriaDespesa; total: number }[];
}) {
  const chartData = [...data]
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      categoria: CATEGORIA_DESPESA_LABEL[item.categoria],
      categoriaRaw: item.categoria,
      total: item.total,
    }));

  return (
    <ChartCard
      title="Despesas por categoria"
      description="Distribuição das despesas no período selecionado"
      height={Math.max(chartData.length * 42, 120)}
    >
      {chartData.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Nenhuma despesa registrada no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="categoria"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              content={<ChartTooltip formatter={(value) => formatBRL(value)} />}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {chartData.map((entry) => (
                <Cell key={entry.categoriaRaw} fill={CATEGORIA_COR[entry.categoriaRaw]} />
              ))}
              <LabelList
                dataKey="total"
                position="right"
                formatter={(value: string | number | boolean | null | undefined) =>
                  typeof value === "number" ? formatBRL(value) : ""
                }
                style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
