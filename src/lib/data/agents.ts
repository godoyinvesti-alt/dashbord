import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Agent } from "@/lib/types";

export interface AgentRow extends Agent {
  chipsAtribuidos: number;
  leadsAtribuidos: number;
  vendas: number;
  faturamento: number;
  taxaConversao: number;
  tempoMedioRespostaHoras: number | null;
  followUpsConcluidos: number;
}

export async function listAgentsWithMetrics(workspaceId: string): Promise<AgentRow[]> {
  const supabase = await createClient();

  const [{ data: agents }, { data: chips }, { data: leads }, { data: sales }, { data: followUps }] = await Promise.all([
    supabase.from("agents").select("*").eq("workspace_id", workspaceId).order("nome"),
    supabase.from("chips").select("assigned_agent_id").eq("workspace_id", workspaceId).eq("archived", false),
    supabase.from("leads").select("agent_id, data_entrada, ultima_interacao").eq("workspace_id", workspaceId),
    supabase.from("sales").select("agent_id, valor_recebido").eq("workspace_id", workspaceId),
    supabase
      .from("follow_ups")
      .select("agent_id")
      .eq("workspace_id", workspaceId)
      .eq("status", "concluido"),
  ]);

  const agentsList = (agents as Agent[]) ?? [];
  const chipsList = chips ?? [];
  const leadsList = leads ?? [];
  const salesList = sales ?? [];
  const followUpsList = followUps ?? [];

  return agentsList.map((a) => {
    const chipsAtribuidos = chipsList.filter((c) => c.assigned_agent_id === a.id).length;
    const agentLeads = leadsList.filter((l) => l.agent_id === a.id);
    const leadsAtribuidos = agentLeads.length;
    const agentSales = salesList.filter((s) => s.agent_id === a.id);
    const vendas = agentSales.length;
    const faturamento = agentSales.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
    const taxaConversao = leadsAtribuidos > 0 ? (vendas / leadsAtribuidos) * 100 : 0;

    const respondidos = agentLeads.filter((l) => l.ultima_interacao);
    const tempoMedioRespostaHoras =
      respondidos.length > 0
        ? respondidos.reduce((sum, l) => {
            const diff =
              new Date(l.ultima_interacao!).getTime() - new Date(l.data_entrada).getTime();
            return sum + Math.max(diff, 0) / (1000 * 60 * 60);
          }, 0) / respondidos.length
        : null;

    const followUpsConcluidos = followUpsList.filter((f) => f.agent_id === a.id).length;

    return {
      ...a,
      chipsAtribuidos,
      leadsAtribuidos,
      vendas,
      faturamento,
      taxaConversao,
      tempoMedioRespostaHoras,
      followUpsConcluidos,
    };
  });
}
