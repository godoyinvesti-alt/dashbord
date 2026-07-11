"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import { campaignSchema, creativeSchema, type CampaignFormValues, type CreativeFormValues } from "@/lib/validations/campaign";
import type { ActionResult } from "@/lib/actions/leads";

export async function createCampaignAction(values: CampaignFormValues): Promise<ActionResult> {
  const parsed = campaignSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      workspace_id: ctx.workspace.id,
      plataforma: v.plataforma,
      nome: v.nome,
      data_inicio: v.data_inicio || null,
      data_fim: v.data_fim || null,
      valor_investido: v.valor_investido,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível criar a campanha." };
  revalidatePath("/dashboard/campanhas");
  return { success: true, id: data.id };
}

export async function updateCampaignAction(id: string, values: CampaignFormValues): Promise<ActionResult> {
  const parsed = campaignSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase
    .from("campaigns")
    .update({
      plataforma: v.plataforma,
      nome: v.nome,
      data_inicio: v.data_inicio || null,
      data_fim: v.data_fim || null,
      valor_investido: v.valor_investido,
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar a campanha." };
  revalidatePath("/dashboard/campanhas");
  return { success: true, id };
}

export async function deleteCampaignAction(id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id).eq("workspace_id", ctx.workspace.id);
  if (error) return { error: "Não foi possível excluir a campanha." };
  revalidatePath("/dashboard/campanhas");
  return { success: true };
}

export async function createCreativeAction(values: CreativeFormValues): Promise<ActionResult> {
  const parsed = creativeSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { data, error } = await supabase
    .from("creatives")
    .insert({
      workspace_id: ctx.workspace.id,
      campaign_id: v.campaign_id,
      ad_set_id: v.ad_set_id || null,
      nome: v.nome,
      hook: v.hook || null,
      url_preview: v.url_preview || null,
      valor_investido: v.valor_investido,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível criar o criativo." };
  revalidatePath("/dashboard/criativos");
  return { success: true, id: data.id };
}

export async function updateCreativeAction(id: string, values: CreativeFormValues): Promise<ActionResult> {
  const parsed = creativeSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase
    .from("creatives")
    .update({
      campaign_id: v.campaign_id,
      ad_set_id: v.ad_set_id || null,
      nome: v.nome,
      hook: v.hook || null,
      url_preview: v.url_preview || null,
      valor_investido: v.valor_investido,
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar o criativo." };
  revalidatePath("/dashboard/criativos");
  return { success: true, id };
}

export async function deleteCreativeAction(id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("creatives").delete().eq("id", id).eq("workspace_id", ctx.workspace.id);
  if (error) return { error: "Não foi possível excluir o criativo." };
  revalidatePath("/dashboard/criativos");
  return { success: true };
}
