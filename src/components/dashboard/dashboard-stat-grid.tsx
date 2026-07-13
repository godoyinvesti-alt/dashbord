import {
  Wallet,
  CalendarDays,
  TrendingUp,
  ShoppingCart,
  Receipt,
  CreditCard,
  Smartphone,
  Flame,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatBRL, formatNumber } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/data/dashboard";

export function DashboardStatGrid({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      <StatCard label="Faturamento hoje" value={formatBRL(metrics.faturamentoHoje)} icon={CalendarDays} />
      <StatCard label="Faturamento no mês" value={formatBRL(metrics.faturamentoMes)} icon={Wallet} />
      <StatCard
        label="Lucro no mês"
        value={formatBRL(metrics.lucroMes)}
        icon={TrendingUp}
        tone={metrics.lucroMes >= 0 ? "success" : "destructive"}
      />
      <StatCard label="Total de vendas" value={formatNumber(metrics.totalVendas)} icon={ShoppingCart} />
      <StatCard label="Ticket médio" value={formatBRL(metrics.ticketMedio)} icon={Receipt} />
      <StatCard label="Gastos" value={formatBRL(metrics.gastos)} icon={CreditCard} />
      <StatCard label="Chips ativos" value={formatNumber(metrics.chipsAtivos)} icon={Smartphone} tone="success" />
      <StatCard label="Chips em aquecimento" value={formatNumber(metrics.chipsEmAquecimento)} icon={Flame} tone="info" />
      <StatCard label="Chips banidos" value={formatNumber(metrics.chipsBanidos)} icon={Ban} tone="destructive" />
      <StatCard
        label="Chips sem recarga"
        value={formatNumber(metrics.chipsSemRecarga)}
        icon={AlertTriangle}
        tone={metrics.chipsSemRecarga > 0 ? "warning" : "default"}
      />
    </div>
  );
}
