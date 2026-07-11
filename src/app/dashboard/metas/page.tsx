import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { listGoalsWithProgress } from "@/lib/data/goals-list";
import { getProducts, getAgents } from "@/lib/data/lookups";

import { PageHeader } from "@/components/dashboard/page-header";
import { GoalFormDialog, NewGoalTrigger } from "@/components/goals/goal-form-dialog";
import { GoalsList } from "@/components/goals/goals-list";

export const metadata: Metadata = { title: "Metas" };

export default async function GoalsPage() {
  const ctx = await requireContext();
  const [goals, products, agents] = await Promise.all([
    listGoalsWithProgress(ctx.workspace.id),
    getProducts(ctx.workspace.id),
    getAgents(ctx.workspace.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas"
        description="Defina e acompanhe metas de faturamento, vendas, conversão e mais"
        actions={<GoalFormDialog trigger={<NewGoalTrigger />} products={products} agents={agents} />}
      />
      <GoalsList goals={goals} products={products} agents={agents} />
    </div>
  );
}
