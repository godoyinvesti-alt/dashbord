import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { listAgentsWithMetrics } from "@/lib/data/agents";

import { PageHeader } from "@/components/dashboard/page-header";
import { AgentFormDialog, NewAgentTrigger } from "@/components/agents/agent-form-dialog";
import { AgentsGrid } from "@/components/agents/agents-grid";

export const metadata: Metadata = { title: "Atendentes" };

export default async function AgentsPage() {
  const ctx = await requireContext();
  const agents = await listAgentsWithMetrics(ctx.workspace.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atendentes"
        description="Gerencie sua equipe e acompanhe o desempenho individual"
        actions={<AgentFormDialog trigger={<NewAgentTrigger />} />}
      />
      <AgentsGrid agents={agents} />
    </div>
  );
}
