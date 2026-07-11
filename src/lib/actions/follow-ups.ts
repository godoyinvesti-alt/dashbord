"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import type { ActionResult } from "@/lib/actions/leads";
import type { TipoFollowUp } from "@/lib/types";

export async function createFollowUpAction(input: {
  leadId: string;
  tipo: TipoFollowUp;
  dataAgendada: string;
  agentId?: string;
  observacoes?: string;
}): Promise<ActionResult> {
  if (!input.dataAgendada) return { error: "Selecione a data do follow-up." };
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase.from("follow_ups").insert({
    workspace_id: ctx.workspace.id,
    lead_id: input.leadId,
    agent_id: input.agentId || null,
    tipo: input.tipo,
    data_agendada: input.dataAgendada,
    observacoes: input.observacoes || null,
    created_by: ctx.userId,
  });

  if (error) return { error: "Não foi possível agendar o follow-up." };

  await supabase
    .from("leads")
    .update({ proximo_followup: input.dataAgendada })
    .eq("id", input.leadId)
    .eq("workspace_id", ctx.workspace.id);

  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function markFollowUpDoneAction(followUpId: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "concluido" })
    .eq("id", followUpId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível concluir o follow-up." };

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "follow_up_concluido",
    p_entidade: "follow_ups",
    p_entidade_id: followUpId,
  });

  revalidatePath("/dashboard/follow-ups");
  return { success: true };
}

export async function cancelFollowUpAction(followUpId: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "cancelado" })
    .eq("id", followUpId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível cancelar o follow-up." };
  revalidatePath("/dashboard/follow-ups");
  return { success: true };
}

export async function rescheduleFollowUpAction(
  followUpId: string,
  novaData: string
): Promise<ActionResult> {
  if (!novaData) return { error: "Selecione a nova data." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ data_agendada: novaData, status: "pendente" })
    .eq("id", followUpId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível reagendar o follow-up." };
  revalidatePath("/dashboard/follow-ups");
  return { success: true };
}

export async function registerResponseAction(leadId: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ ultima_interacao: new Date().toISOString() })
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível registrar a resposta." };
  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function registerPaymentFromLeadAction(
  leadId: string,
  valorRecebido: number,
  formaPagamento: string
): Promise<ActionResult> {
  if (valorRecebido < 0) return { error: "O valor recebido não pode ser negativo." };
  const ctx = await requireContext();
  const supabase = await createClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("workspace_id", ctx.workspace.id)
    .single();

  if (!lead) return { error: "Lead não encontrado." };

  const { error: leadError } = await supabase
    .from("leads")
    .update({
      status_pagamento: "pagamento_confirmado",
      valor_recebido: valorRecebido,
      forma_pagamento: formaPagamento,
      ultima_interacao: new Date().toISOString(),
    })
    .eq("id", leadId);

  if (leadError) return { error: "Não foi possível registrar o pagamento." };

  if (lead.produto_interesse_id) {
    await supabase.from("sales").insert({
      workspace_id: ctx.workspace.id,
      lead_id: leadId,
      cliente_nome: lead.nome,
      product_id: lead.produto_interesse_id,
      preco_original: lead.valor_esperado,
      valor_esperado: lead.valor_esperado,
      valor_recebido: valorRecebido,
      forma_pagamento: formaPagamento,
      data_pagamento: new Date().toISOString(),
      campaign_id: lead.campaign_id,
      creative_id: lead.creative_id,
      agent_id: lead.agent_id,
      chip_id: lead.chip_id,
      created_by: ctx.userId,
    });
  }

  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard");
  return { success: true };
}
