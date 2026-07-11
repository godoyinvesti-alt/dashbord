import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FunnelStage } from "@/lib/types";

export interface FunnelStageMetric {
  stage: FunnelStage;
  leadsNaEtapa: number;
  leadsAcumulados: number;
  valorNaEtapa: number;
  taxaConversao: number | null;
  taxaAbandono: number | null;
}

export async function getFunnelMetrics(workspaceId: string): Promise<FunnelStageMetric[]> {
  const supabase = await createClient();

  const [{ data: stages }, { data: leads }] = await Promise.all([
    supabase
      .from("funnel_stages")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("ordem", { ascending: true }),
    supabase
      .from("leads")
      .select("funnel_stage_id, valor_esperado")
      .eq("workspace_id", workspaceId),
  ]);

  const stagesList = (stages as FunnelStage[]) ?? [];
  const leadsList = (leads as { funnel_stage_id: string; valor_esperado: number }[]) ?? [];

  const countByStage = new Map<string, number>();
  const valueByStage = new Map<string, number>();
  for (const l of leadsList) {
    countByStage.set(l.funnel_stage_id, (countByStage.get(l.funnel_stage_id) ?? 0) + 1);
    valueByStage.set(l.funnel_stage_id, (valueByStage.get(l.funnel_stage_id) ?? 0) + Number(l.valor_esperado ?? 0));
  }

  const totalLeads = leadsList.length;

  const metrics: FunnelStageMetric[] = [];
  let acumuladoRestante = totalLeads;

  stagesList.forEach((stage, idx) => {
    const leadsNaEtapa = countByStage.get(stage.id) ?? 0;
    const leadsAcumulados = acumuladoRestante;
    acumuladoRestante -= leadsNaEtapa;

    metrics.push({
      stage,
      leadsNaEtapa,
      leadsAcumulados,
      valorNaEtapa: valueByStage.get(stage.id) ?? 0,
      taxaConversao: null,
      taxaAbandono: null,
    });

    if (idx > 0) {
      const prev = metrics[idx - 1];
      prev.taxaConversao =
        prev.leadsAcumulados > 0 ? (leadsAcumulados / prev.leadsAcumulados) * 100 : null;
      prev.taxaAbandono = prev.taxaConversao !== null ? 100 - prev.taxaConversao : null;
    }
  });

  return metrics;
}
