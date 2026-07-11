"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import { leadSchema, type LeadFormValues } from "@/lib/validations/lead";
import { normalizePhone } from "@/lib/format";
import { getLeadHistory, getLeadNotes } from "@/lib/data/leads";
import { getFollowUpsForLead } from "@/lib/data/follow-ups";

export interface ActionResult {
  error?: string;
  success?: boolean;
  id?: string;
}

function cleanUuid(v?: string) {
  return v ? v : null;
}

export async function createLeadAction(values: LeadFormValues): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.data ? "Dados inválidos." : parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: ctx.workspace.id,
      nome: v.nome,
      whatsapp: normalizePhone(v.whatsapp),
      email: v.email || null,
      produto_interesse_id: cleanUuid(v.produto_interesse_id),
      origem: v.origem,
      campaign_id: cleanUuid(v.campaign_id),
      creative_id: cleanUuid(v.creative_id),
      agent_id: cleanUuid(v.agent_id),
      chip_id: cleanUuid(v.chip_id),
      funnel_stage_id: v.funnel_stage_id,
      temperatura: v.temperatura,
      valor_esperado: v.valor_esperado,
      valor_recebido: v.valor_recebido,
      forma_pagamento: v.forma_pagamento || null,
      status_pagamento: v.status_pagamento,
      produto_entregue: v.produto_entregue,
      upsell_oferecido: v.upsell_oferecido,
      upsell_comprado: v.upsell_comprado,
      motivo_perda: v.motivo_perda || null,
      observacoes: v.observacoes || null,
      proximo_followup: v.proximo_followup || null,
      tags: v.tags,
      created_by: ctx.userId,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Não foi possível criar o lead. Tente novamente." };
  }

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "lead_criado",
    p_entidade: "leads",
    p_entidade_id: data.id,
    p_detalhes: { nome: v.nome },
  });

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { success: true, id: data.id };
}

export async function updateLeadAction(leadId: string, values: LeadFormValues): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase
    .from("leads")
    .update({
      nome: v.nome,
      whatsapp: normalizePhone(v.whatsapp),
      email: v.email || null,
      produto_interesse_id: cleanUuid(v.produto_interesse_id),
      origem: v.origem,
      campaign_id: cleanUuid(v.campaign_id),
      creative_id: cleanUuid(v.creative_id),
      agent_id: cleanUuid(v.agent_id),
      chip_id: cleanUuid(v.chip_id),
      funnel_stage_id: v.funnel_stage_id,
      temperatura: v.temperatura,
      valor_esperado: v.valor_esperado,
      valor_recebido: v.valor_recebido,
      forma_pagamento: v.forma_pagamento || null,
      status_pagamento: v.status_pagamento,
      produto_entregue: v.produto_entregue,
      upsell_oferecido: v.upsell_oferecido,
      upsell_comprado: v.upsell_comprado,
      motivo_perda: v.motivo_perda || null,
      observacoes: v.observacoes || null,
      proximo_followup: v.proximo_followup || null,
      tags: v.tags,
      ultima_interacao: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) {
    return { error: "Não foi possível atualizar o lead." };
  }

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "lead_atualizado",
    p_entidade: "leads",
    p_entidade_id: leadId,
  });

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { success: true, id: leadId };
}

export async function deleteLeadAction(leadId: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível excluir o lead." };

  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function bulkDeleteLeadsAction(leadIds: string[]): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .delete()
    .in("id", leadIds)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível excluir os leads selecionados." };
  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function bulkUpdateLeadsStageAction(
  leadIds: string[],
  funnelStageId: string
): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ funnel_stage_id: funnelStageId })
    .in("id", leadIds)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível mover os leads selecionados." };
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/funil");
  return { success: true };
}

export async function moveLeadStageAction(
  leadId: string,
  funnelStageId: string
): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ funnel_stage_id: funnelStageId })
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível mover o lead." };

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/funil");
  return { success: true };
}

export async function addLeadNoteAction(leadId: string, conteudo: string): Promise<ActionResult> {
  if (!conteudo.trim()) return { error: "A nota não pode ficar em branco." };
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase.from("lead_notes").insert({
    workspace_id: ctx.workspace.id,
    lead_id: leadId,
    conteudo,
    created_by: ctx.userId,
  });

  if (error) return { error: "Não foi possível salvar a nota." };
  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function fetchLeadTimelineAction(leadId: string) {
  const ctx = await requireContext();
  const [notes, history, followUps] = await Promise.all([
    getLeadNotes(ctx.workspace.id, leadId),
    getLeadHistory(ctx.workspace.id, leadId),
    getFollowUpsForLead(ctx.workspace.id, leadId),
  ]);
  return { notes, history, followUps };
}
