"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import { saleSchema, type SaleFormValues } from "@/lib/validations/sale";
import type { ActionResult } from "@/lib/actions/leads";

function cleanUuid(v?: string) {
  return v ? v : null;
}

export async function createSaleAction(values: SaleFormValues): Promise<ActionResult> {
  const parsed = saleSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { data, error } = await supabase
    .from("sales")
    .insert({
      workspace_id: ctx.workspace.id,
      cliente_nome: v.cliente_nome,
      product_id: v.product_id,
      preco_original: v.preco_original,
      valor_esperado: v.valor_esperado,
      valor_recebido: v.valor_recebido,
      desconto: v.desconto,
      forma_pagamento: v.forma_pagamento || null,
      data_pagamento: v.data_pagamento || null,
      campaign_id: cleanUuid(v.campaign_id),
      creative_id: cleanUuid(v.creative_id),
      agent_id: cleanUuid(v.agent_id),
      chip_id: cleanUuid(v.chip_id),
      upsell: v.upsell,
      status_reembolso: v.status_reembolso,
      status_entrega: v.status_entrega,
      observacoes: v.observacoes || null,
      created_by: ctx.userId,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível registrar a venda." };

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "venda_registrada",
    p_entidade: "sales",
    p_entidade_id: data.id,
  });

  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/financeiro");
  return { success: true, id: data.id };
}

export async function updateSaleAction(saleId: string, values: SaleFormValues): Promise<ActionResult> {
  const parsed = saleSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase
    .from("sales")
    .update({
      cliente_nome: v.cliente_nome,
      product_id: v.product_id,
      preco_original: v.preco_original,
      valor_esperado: v.valor_esperado,
      valor_recebido: v.valor_recebido,
      desconto: v.desconto,
      forma_pagamento: v.forma_pagamento || null,
      data_pagamento: v.data_pagamento || null,
      campaign_id: cleanUuid(v.campaign_id),
      creative_id: cleanUuid(v.creative_id),
      agent_id: cleanUuid(v.agent_id),
      chip_id: cleanUuid(v.chip_id),
      upsell: v.upsell,
      status_reembolso: v.status_reembolso,
      status_entrega: v.status_entrega,
      observacoes: v.observacoes || null,
    })
    .eq("id", saleId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar a venda." };

  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/financeiro");
  return { success: true, id: saleId };
}

export async function deleteSaleAction(saleId: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", saleId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível excluir a venda." };
  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard/financeiro");
  return { success: true };
}
