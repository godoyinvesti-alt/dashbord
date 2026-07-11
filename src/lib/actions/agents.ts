"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import { agentSchema, type AgentFormValues } from "@/lib/validations/agent";
import type { ActionResult } from "@/lib/actions/leads";

export async function createAgentAction(values: AgentFormValues): Promise<ActionResult> {
  const parsed = agentSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { data, error } = await supabase
    .from("agents")
    .insert({
      workspace_id: ctx.workspace.id,
      nome: v.nome,
      email: v.email,
      whatsapp: v.whatsapp || null,
      papel: v.papel,
      status: v.status,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível adicionar o atendente." };
  revalidatePath("/dashboard/atendentes");
  return { success: true, id: data.id };
}

export async function updateAgentAction(id: string, values: AgentFormValues): Promise<ActionResult> {
  const parsed = agentSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase
    .from("agents")
    .update({
      nome: v.nome,
      email: v.email,
      whatsapp: v.whatsapp || null,
      papel: v.papel,
      status: v.status,
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar o atendente." };
  revalidatePath("/dashboard/atendentes");
  return { success: true, id };
}

export async function deleteAgentAction(id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("agents").delete().eq("id", id).eq("workspace_id", ctx.workspace.id);
  if (error) return { error: "Não é possível remover um atendente vinculado a leads, vendas ou chips." };
  revalidatePath("/dashboard/atendentes");
  return { success: true };
}
