import {
  Users,
  MessageCircle,
  ShoppingCart,
  Percent,
  DollarSign,
  Wallet,
  Ticket,
  Megaphone,
  UserPlus,
  ReceiptText,
  TrendingUp,
  Gauge,
  Clock,
  CircleDollarSign,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
import { percentChange } from "@/lib/date-range";
import type { OverviewMetrics } from "@/lib/data/overview";

export function StatGrid({
  atual,
  anterior,
}: {
  atual: OverviewMetrics;
  anterior: OverviewMetrics;
}) {
  const items = [
    {
      label: "Leads recebidos",
      value: formatNumber(atual.leadsRecebidos),
      change: percentChange(atual.leadsRecebidos, anterior.leadsRecebidos),
      icon: Users,
    },
    {
      label: "Conversas iniciadas",
      value: formatNumber(atual.conversasIniciadas),
      change: percentChange(atual.conversasIniciadas, anterior.conversasIniciadas),
      icon: MessageCircle,
    },
    {
      label: "Vendas realizadas",
      value: formatNumber(atual.vendasRealizadas),
      change: percentChange(atual.vendasRealizadas, anterior.vendasRealizadas),
      icon: ShoppingCart,
    },
    {
      label: "Taxa de conversão",
      value: formatPercent(atual.taxaConversao),
      change: percentChange(atual.taxaConversao, anterior.taxaConversao),
      icon: Percent,
    },
    {
      label: "Faturamento",
      value: formatBRL(atual.faturamento),
      change: percentChange(atual.faturamento, anterior.faturamento),
      icon: DollarSign,
      tone: "success" as const,
    },
    {
      label: "Valor recebido",
      value: formatBRL(atual.valorRecebido),
      change: percentChange(atual.valorRecebido, anterior.valorRecebido),
      icon: Wallet,
      tone: "success" as const,
    },
    {
      label: "Ticket médio",
      value: formatBRL(atual.ticketMedio),
      change: percentChange(atual.ticketMedio, anterior.ticketMedio),
      icon: Ticket,
    },
    {
      label: "Investimento em anúncios",
      value: formatBRL(atual.investimentoAnuncios),
      change: percentChange(atual.investimentoAnuncios, anterior.investimentoAnuncios),
      icon: Megaphone,
      invertTrendColor: true,
    },
    {
      label: "Custo por lead",
      value: formatBRL(atual.custoPorLead),
      change: percentChange(atual.custoPorLead, anterior.custoPorLead),
      icon: UserPlus,
      invertTrendColor: true,
    },
    {
      label: "Custo por venda",
      value: formatBRL(atual.custoPorVenda),
      change: percentChange(atual.custoPorVenda, anterior.custoPorVenda),
      icon: ReceiptText,
      invertTrendColor: true,
    },
    {
      label: "Lucro estimado",
      value: formatBRL(atual.lucroEstimado),
      change: percentChange(atual.lucroEstimado, anterior.lucroEstimado),
      icon: TrendingUp,
      tone: (atual.lucroEstimado >= 0 ? "success" : "destructive") as "success" | "destructive",
    },
    {
      label: "ROAS",
      value: `${formatNumber(atual.roas, 2)}x`,
      change: percentChange(atual.roas, anterior.roas),
      icon: Gauge,
    },
    {
      label: "Pagamentos pendentes",
      value: formatNumber(atual.pagamentosPendentes),
      change: percentChange(atual.pagamentosPendentes, anterior.pagamentosPendentes),
      icon: Clock,
      tone: "warning" as const,
      invertTrendColor: true,
    },
    {
      label: "Valor potencial em aberto",
      value: formatBRL(atual.valorPotencialAberto),
      change: percentChange(atual.valorPotencialAberto, anterior.valorPotencialAberto),
      icon: CircleDollarSign,
      tone: "warning" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          changePercent={item.change ?? undefined}
          invertTrendColor={item.invertTrendColor}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
