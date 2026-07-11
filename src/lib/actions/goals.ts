"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import { goalSchema, type GoalFormValues } from "@/lib/validations/goal";
import type { ActionResult } from "@/lib/actions/leads";

export async function createGoalAction(values: GoalFormValues): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  if (new Date(v.periodo_fim) < new Date(v.periodo_inicio)) {
    return { error: "A data de fim não pode ser anterior à data de início." };
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      workspace_id: ctx.workspace.id,
      tipo: v.tipo,
      periodo_inicio: v.periodo_inicio,
      periodo_fim: v.periodo_fim,
      valor_meta: v.valor_meta,
      produto_id: v.produto_id || null,
      agent_id: v.agent_id || null,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível criar a meta." };

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "meta_criada",
    p_entidade: "goals",
    p_entidade_id: data.id,
  });

  revalidatePath("/dashboard/metas");
  revalidatePath("/dashboard");
  return { success: true, id: data.id };
}

export async function updateGoalAction(id: string, values: GoalFormValues): Promise<ActionResult> {
  const parsed = goalSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase
    .from("goals")
    .update({
      tipo: v.tipo,
      periodo_inicio: v.periodo_inicio,
      periodo_fim: v.periodo_fim,
      valor_meta: v.valor_meta,
      produto_id: v.produto_id || null,
      agent_id: v.agent_id || null,
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar a meta." };

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "meta_alterada",
    p_entidade: "goals",
    p_entidade_id: id,
  });

  revalidatePath("/dashboard/metas");
  revalidatePath("/dashboard");
  return { success: true, id };
}

export async function deleteGoalAction(id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id).eq("workspace_id", ctx.workspace.id);
  if (error) return { error: "Não foi possível excluir a meta." };
  revalidatePath("/dashboard/metas");
  return { success: true };
}
