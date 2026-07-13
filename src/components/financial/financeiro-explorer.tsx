import { Receipt, Wallet, TrendingUp, Percent } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchInput } from "@/components/shared/search-input";
import { SelectFilter } from "@/components/shared/select-filter";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExpenseFormDialog } from "@/components/financial/expense-form-dialog";
import { ExpenseRowActions } from "@/components/financial/expense-row-actions";
import { ExpenseBreakdownChart } from "@/components/financial/expense-breakdown-chart";
import { GoalProgressPanel } from "@/components/financial/goal-progress-panel";
import { CATEGORIA_DESPESA_LABEL, CATEGORIA_DESPESA_OPCOES } from "@/lib/constants";
import { formatBRL, formatDate, formatPercent } from "@/lib/format";
import type { Expense, Goal } from "@/lib/types";
import type { FinancialSummary, CurrentMonthResults } from "@/lib/data/financial";

export function FinanceiroExplorer({
  expenses,
  total,
  page,
  totalPages,
  summary,
  goal,
  currentMonthResults,
}: {
  expenses: Expense[];
  total: number;
  page: number;
  totalPages: number;
  summary: FinancialSummary;
  goal: Goal | null;
  currentMonthResults: CurrentMonthResults;
}) {
  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Acompanhe receitas, despesas e o resultado financeiro do negócio."
        actions={<DateRangeFilter />}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Faturamento" value={formatBRL(summary.faturamento)} icon={Wallet} tone="info" />
        <StatCard label="Despesas" value={formatBRL(summary.despesas)} icon={Receipt} tone="warning" />
        <StatCard
          label="Lucro líquido"
          value={formatBRL(summary.lucroLiquido)}
          icon={TrendingUp}
          tone={summary.lucroLiquido >= 0 ? "success" : "destructive"}
        />
        <StatCard
          label="Margem de lucro"
          value={formatPercent(summary.margemLucro)}
          icon={Percent}
          tone={summary.margemLucro >= 0 ? "success" : "destructive"}
        />
      </div>

      <GoalProgressPanel goal={goal} results={currentMonthResults} />

      <div className="mb-6">
        <ExpenseBreakdownChart data={summary.despesasPorCategoria} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Despesas</h2>
        <ExpenseFormDialog />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Buscar por descrição ou operação..." className="w-full sm:w-72" />
        <SelectFilter
          paramName="categoria"
          placeholder="Categoria"
          options={CATEGORIA_DESPESA_OPCOES.map((c) => ({ value: c, label: CATEGORIA_DESPESA_LABEL[c] }))}
        />
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma despesa encontrada"
          description="Cadastre sua primeira despesa para acompanhar o resultado financeiro."
          action={<ExpenseFormDialog />}
        />
      ) : (
        <>
          {/* Desktop: tabela */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <p className="font-medium">{expense.descricao}</p>
                      {expense.observacoes && (
                        <p className="max-w-64 truncate text-xs text-muted-foreground">{expense.observacoes}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{CATEGORIA_DESPESA_LABEL[expense.categoria]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(expense.data)}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{formatBRL(expense.valor)}</TableCell>
                    <TableCell className="text-sm">{expense.operacao_vinculada || "—"}</TableCell>
                    <TableCell>
                      <ExpenseRowActions expense={expense} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-4">
              <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={20} />
            </div>
          </Card>

          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {expenses.map((expense) => (
              <Card key={expense.id} className="py-4">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{expense.descricao}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(expense.data)}</p>
                    </div>
                    <ExpenseRowActions expense={expense} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{CATEGORIA_DESPESA_LABEL[expense.categoria]}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>Valor: {formatBRL(expense.valor)}</p>
                    <p>Operação: {expense.operacao_vinculada || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={20} />
          </div>
        </>
      )}
    </div>
  );
}
