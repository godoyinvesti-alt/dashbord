"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import { expenseSchema, type ExpenseFormValues } from "@/lib/validations/expense";
import type { ActionResult } from "@/lib/actions/leads";

export async function createExpenseAction(values: ExpenseFormValues): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      workspace_id: ctx.workspace.id,
      descricao: v.descricao,
      categoria: v.categoria,
      valor: v.valor,
      data: v.data,
      recorrente: v.recorrente,
      observacoes: v.observacoes || null,
      created_by: ctx.userId,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível registrar a despesa." };

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "despesa_criada",
    p_entidade: "expenses",
    p_entidade_id: data.id,
  });

  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
  return { success: true, id: data.id };
}

export async function updateExpenseAction(id: string, values: ExpenseFormValues): Promise<ActionResult> {
  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase
    .from("expenses")
    .update({
      descricao: v.descricao,
      categoria: v.categoria,
      valor: v.valor,
      data: v.data,
      recorrente: v.recorrente,
      observacoes: v.observacoes || null,
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar a despesa." };
  revalidatePath("/dashboard/financeiro");
  return { success: true, id };
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id).eq("workspace_id", ctx.workspace.id);
  if (error) return { error: "Não foi possível excluir a despesa." };
  revalidatePath("/dashboard/financeiro");
  return { success: true };
}
