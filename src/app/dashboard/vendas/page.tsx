import type { Metadata } from "next";
import { ShoppingCart, DollarSign, Ticket, Undo2 } from "lucide-react";

import { requireContext } from "@/lib/workspace";
import { listSales, getSalesSummary } from "@/lib/data/sales";
import { getWorkspaceLookups } from "@/lib/data/lookups";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchInput } from "@/components/shared/search-input";
import { SelectFilter } from "@/components/shared/select-filter";
import { SaleFormDialog, NewSaleTrigger } from "@/components/sales/sale-form-dialog";
import { SalesExplorer } from "@/components/sales/sales-explorer";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
import { STATUS_ENTREGA_LABEL, STATUS_REEMBOLSO_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Vendas" };

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const ctx = await requireContext();
  const lookups = await getWorkspaceLookups(ctx.workspace.id);

  const [result, summary] = await Promise.all([
    listSales(ctx.workspace.id, {
      q: params.q,
      statusEntrega: params.entrega as never,
      statusReembolso: params.reembolso as never,
      agentId: params.agente,
      page: params.page ? Number(params.page) : 1,
    }),
    getSalesSummary(ctx.workspace.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendas"
        description="Todas as vendas realizadas pela sua operação de WhatsApp"
        actions={<SaleFormDialog trigger={<NewSaleTrigger />} {...lookups} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de vendas" value={formatNumber(summary.totalVendas)} icon={ShoppingCart} />
        <StatCard label="Faturamento" value={formatBRL(summary.faturamento)} icon={DollarSign} tone="success" />
        <StatCard label="Ticket médio" value={formatBRL(summary.ticketMedio)} icon={Ticket} />
        <StatCard label="Taxa de reembolso" value={formatPercent(summary.taxaReembolso)} icon={Undo2} tone="warning" invertTrendColor />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Buscar por cliente..." className="w-full sm:w-64" />
        <SelectFilter
          paramName="entrega"
          placeholder="Status de entrega"
          options={Object.entries(STATUS_ENTREGA_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <SelectFilter
          paramName="reembolso"
          placeholder="Status de reembolso"
          options={Object.entries(STATUS_REEMBOLSO_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <SelectFilter
          paramName="agente"
          placeholder="Atendente"
          options={lookups.agents.map((a) => ({ value: a.id, label: a.nome }))}
        />
      </div>

      <SalesExplorer
        sales={result.sales}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        lookups={lookups}
      />
    </div>
  );
}
