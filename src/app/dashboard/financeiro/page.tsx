import type { Metadata } from "next";
import { DollarSign, Wallet, Clock, Megaphone, Wrench, Users, CreditCard, Undo2, TrendingUp, PiggyBank, Percent, Gauge } from "lucide-react";

import { requireContext } from "@/lib/workspace";
import { resolvePeriodo } from "@/lib/date-range";
import { getFinancialSummary, listExpenses } from "@/lib/data/financial";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { SelectFilter } from "@/components/shared/select-filter";
import { ExpenseFormDialog, NewExpenseTrigger } from "@/components/financial/expense-form-dialog";
import { ExpensesTable } from "@/components/financial/expenses-table";
import { ExpenseBreakdownChart } from "@/components/financial/expense-breakdown-chart";
import { formatBRL, formatPercent, formatNumber } from "@/lib/format";
import { CATEGORIA_DESPESA_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "Financeiro" };

export default async function FinancialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const ctx = await requireContext();
  const periodo = resolvePeriodo(params.periodo, params.de, params.ate);

  const [summary, expensesResult] = await Promise.all([
    getFinancialSummary(ctx.workspace.id, periodo),
    listExpenses(ctx.workspace.id, {
      categoria: params.categoria,
      page: params.page ? Number(params.page) : 1,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description={`Panorama financeiro da operação — ${periodo.label.toLowerCase()}`}
        actions={
          <>
            <DateRangeFilter />
            <ExpenseFormDialog trigger={<NewExpenseTrigger />} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faturamento bruto" value={formatBRL(summary.grossRevenue)} icon={DollarSign} />
        <StatCard label="Valor recebido" value={formatBRL(summary.amountReceived)} icon={Wallet} tone="success" />
        <StatCard label="Pagamentos pendentes" value={formatBRL(summary.pendingPayments)} icon={Clock} tone="warning" />
        <StatCard label="ROAS" value={`${formatNumber(summary.roas, 2)}x`} icon={Gauge} />
        <StatCard label="Tráfego pago" value={formatBRL(summary.advertisingExpenses)} icon={Megaphone} invertTrendColor />
        <StatCard label="Ferramentas" value={formatBRL(summary.toolExpenses)} icon={Wrench} invertTrendColor />
        <StatCard label="Comissões de equipe" value={formatBRL(summary.teamCommissions)} icon={Users} invertTrendColor />
        <StatCard label="Taxas de pagamento" value={formatBRL(summary.paymentFees)} icon={CreditCard} invertTrendColor />
        <StatCard label="Reembolsos" value={formatBRL(summary.refunds)} icon={Undo2} tone="warning" invertTrendColor />
        <StatCard label="Lucro estimado" value={formatBRL(summary.estimatedProfit)} icon={TrendingUp} tone={summary.estimatedProfit >= 0 ? "success" : "destructive"} />
        <StatCard label="Lucro líquido" value={formatBRL(summary.netProfit)} icon={PiggyBank} tone={summary.netProfit >= 0 ? "success" : "destructive"} />
        <StatCard label="Margem" value={formatPercent(summary.margin)} icon={Percent} />
      </div>

      <ExpenseBreakdownChart summary={summary} />

      <div className="flex flex-wrap items-center gap-2">
        <SelectFilter
          paramName="categoria"
          placeholder="Categoria"
          options={Object.entries(CATEGORIA_DESPESA_LABEL).map(([value, label]) => ({ value, label }))}
        />
      </div>

      <ExpensesTable
        expenses={expensesResult.expenses}
        total={expensesResult.total}
        page={expensesResult.page}
        pageSize={expensesResult.pageSize}
        totalPages={expensesResult.totalPages}
      />
    </div>
  );
}
