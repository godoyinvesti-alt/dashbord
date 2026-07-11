import "server-only";
import { createClient } from "@/lib/supabase/server";
import { computeChip, DEFAULT_CHIP_ALERT_THRESHOLDS } from "@/lib/chip-alerts";
import { formatBRL } from "@/lib/format";
import type { Chip, Settings } from "@/lib/types";

export interface Insight {
  id: string;
  mensagem: string;
  tipo: "destructive" | "warning" | "info" | "success";
  link?: string;
}

export async function getInsights(
  workspaceId: string,
  metaRestante?: number
): Promise<Insight[]> {
  const supabase = await createClient();
  const insights: Insight[] = [];

  const [
    { count: followUpsAtrasados },
    { data: leadsPendentes },
    { data: chips },
    { data: settingsRow },
    { data: creatives },
  ] = await Promise.all([
    supabase
      .from("follow_ups")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "pendente")
      .lt("data_agendada", new Date().toISOString()),
    supabase
      .from("leads")
      .select("valor_esperado, valor_recebido")
      .eq("workspace_id", workspaceId)
      .in("status_pagamento", ["pix_enviado", "aguardando_pagamento", "pagamento_parcial"]),
    supabase.from("chips").select("*").eq("workspace_id", workspaceId).eq("archived", false),
    supabase.from("settings").select("*").eq("workspace_id", workspaceId).maybeSingle(),
    supabase
      .from("creatives")
      .select("id, nome, valor_investido, leads:leads(count), sales:sales(count)")
      .eq("workspace_id", workspaceId)
      .limit(20),
  ]);

  if ((followUpsAtrasados ?? 0) > 0) {
    insights.push({
      id: "followups-atrasados",
      mensagem: `Você possui ${followUpsAtrasados} follow-up${
        followUpsAtrasados === 1 ? "" : "s"
      } atrasado${followUpsAtrasados === 1 ? "" : "s"}.`,
      tipo: "destructive",
      link: "/dashboard/follow-ups",
    });
  }

  const valorPendente = (leadsPendentes ?? []).reduce(
    (sum, l) => sum + Math.max(Number(l.valor_esperado ?? 0) - Number(l.valor_recebido ?? 0), 0),
    0
  );
  if (valorPendente > 0) {
    insights.push({
      id: "pagamentos-pendentes",
      mensagem: `Existem ${formatBRL(valorPendente)} em pagamentos pendentes.`,
      tipo: "warning",
      link: "/dashboard/follow-ups",
    });
  }

  const settings = settingsRow as Settings | null;
  const thresholds = settings
    ? {
        aviso_recarga_dias: settings.aviso_recarga_dias,
        critico_recarga_dias: settings.critico_recarga_dias,
      }
    : DEFAULT_CHIP_ALERT_THRESHOLDS;

  const chipsComputed = ((chips as Chip[]) ?? []).map((c) => computeChip(c, thresholds));
  const chipCritico = chipsComputed
    .filter((c) => c.nivel_alerta === "vermelho" || c.nivel_alerta === "vermelho_escuro")
    .sort((a, b) => (b.dias_desde_recarga ?? 999) - (a.dias_desde_recarga ?? 999))[0];

  if (chipCritico) {
    insights.push({
      id: "chip-critico",
      mensagem:
        chipCritico.dias_desde_recarga === null
          ? `O chip ${chipCritico.name} nunca recebeu uma recarga registrada.`
          : `O chip ${chipCritico.name} está há ${chipCritico.dias_desde_recarga} dias sem recarga.`,
      tipo: "destructive",
      link: "/dashboard/chips",
    });
  }

  type CreativeRow = {
    id: string;
    nome: string;
    leads: { count: number }[] | null;
    sales: { count: number }[] | null;
  };
  const creativesRows = (creatives as unknown as CreativeRow[]) ?? [];
  const piorCriativo = creativesRows
    .map((c) => ({
      nome: c.nome,
      leads: c.leads?.[0]?.count ?? 0,
      vendas: c.sales?.[0]?.count ?? 0,
    }))
    .filter((c) => c.leads >= 20)
    .sort((a, b) => a.vendas / a.leads - b.vendas / b.leads)[0];

  if (piorCriativo) {
    insights.push({
      id: "criativo-fraco",
      mensagem: `O criativo ${piorCriativo.nome} gerou ${piorCriativo.leads} leads e apenas ${piorCriativo.vendas} venda${piorCriativo.vendas === 1 ? "" : "s"}.`,
      tipo: "warning",
      link: "/dashboard/criativos",
    });
  }

  if (metaRestante && metaRestante > 0) {
    insights.push({
      id: "meta-restante",
      mensagem: `Faltam ${formatBRL(metaRestante)} para atingir sua meta mensal.`,
      tipo: "info",
      link: "/dashboard",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "tudo-certo",
      mensagem: "Tudo em ordem por aqui! Nenhum ponto crítico identificado hoje.",
      tipo: "success",
    });
  }

  return insights;
}
