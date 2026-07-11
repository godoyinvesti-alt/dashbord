"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ChartCard } from "@/components/charts/chart-card";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatBRL } from "@/lib/format";
import type { SerieDia } from "@/lib/data/overview";

export function RevenueChart({ serie }: { serie: SerieDia[] }) {
  const data = serie.map((d) => ({
    ...d,
    label: format(new Date(`${d.data}T12:00:00`), "dd/MM", { locale: ptBR }),
  }));

  return (
    <ChartCard title="Faturamento por dia" description="Valor recebido em vendas confirmadas">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillFaturamento" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            minTickGap={24}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(v) => new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v)}
          />
          <Tooltip
            content={<ChartTooltip formatter={(v) => formatBRL(v)} />}
            cursor={{ stroke: "var(--border)" }}
          />
          <Area
            type="monotone"
            dataKey="faturamento"
            name="Faturamento"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#fillFaturamento)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
