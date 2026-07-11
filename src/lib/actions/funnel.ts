"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import type { ActionResult } from "@/lib/actions/leads";

export async function createFunnelStageAction(nome: string, cor: string): Promise<ActionResult> {
  if (!nome.trim()) return { error: "Informe o nome da etapa." };
  const ctx = await requireContext();
  const supabase = await createClient();

  const { count } = await supabase
    .from("funnel_stages")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", ctx.workspace.id);

  const { error } = await supabase.from("funnel_stages").insert({
    workspace_id: ctx.workspace.id,
    nome,
    cor,
    ordem: count ?? 0,
  });

  if (error) return { error: "Não foi possível criar a etapa." };
  revalidatePath("/dashboard/funil");
  return { success: true };
}

export async function updateFunnelStageAction(
  id: string,
  values: { nome: string; cor: string }
): Promise<ActionResult> {
  if (!values.nome.trim()) return { error: "Informe o nome da etapa." };
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("funnel_stages")
    .update({ nome: values.nome, cor: values.cor })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar a etapa." };
  revalidatePath("/dashboard/funil");
  return { success: true };
}

export async function deleteFunnelStageAction(id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();

  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", ctx.workspace.id)
    .eq("funnel_stage_id", id);

  if ((count ?? 0) > 0) {
    return { error: "Não é possível remover uma etapa que possui leads. Mova os leads para outra etapa primeiro." };
  }

  const { error } = await supabase
    .from("funnel_stages")
    .delete()
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível remover a etapa." };
  revalidatePath("/dashboard/funil");
  return { success: true };
}

export async function reorderFunnelStagesAction(
  ordered: { id: string; ordem: number }[]
): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();

  await Promise.all(
    ordered.map((item) =>
      supabase
        .from("funnel_stages")
        .update({ ordem: item.ordem })
        .eq("id", item.id)
        .eq("workspace_id", ctx.workspace.id)
    )
  );

  revalidatePath("/dashboard/funil");
  return { success: true };
}
