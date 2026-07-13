import { listExpenses, getFinancialSummary, getCurrentMonthResults } from "@/lib/data/financial";
import { getGoalForMonth } from "@/lib/data/goals";
import { FinanceiroExplorer } from "@/components/financial/financeiro-explorer";

export const metadata = { title: "Financeiro" };

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    periodo?: string;
    de?: string;
    ate?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const [{ expenses, total, page, totalPages }, summary, currentMonthResults, goal] = await Promise.all([
    listExpenses({
      q: params.q,
      categoria: params.categoria,
      page: params.page ? Number(params.page) : 1,
    }),
    getFinancialSummary(params.periodo, params.de, params.ate),
    getCurrentMonthResults(),
    getGoalForMonth(),
  ]);

  return (
    <FinanceiroExplorer
      expenses={expenses}
      total={total}
      page={page}
      totalPages={totalPages}
      summary={summary}
      goal={goal}
      currentMonthResults={currentMonthResults}
    />
  );
}
