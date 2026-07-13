"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { expenseFormSchema, type ExpenseFormValues } from "@/lib/validations/expense";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function revalidateFinanceiro() {
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
}

export async function createExpenseAction(values: ExpenseFormValues): Promise<ActionResult> {
  const parsed = expenseFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const v = parsed.data;
  const { error } = await supabase.from("expenses").insert({
    owner_id: user.id,
    descricao: v.descricao,
    valor: v.valor,
    categoria: v.categoria,
    data: v.data,
    operacao_vinculada: v.operacao_vinculada || null,
    observacoes: v.observacoes || null,
  });

  if (error) return { error: "Não foi possível criar a despesa." };

  revalidateFinanceiro();
  return { success: true };
}

export async function updateExpenseAction(id: string, values: ExpenseFormValues): Promise<ActionResult> {
  const parsed = expenseFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const v = parsed.data;
  const { error } = await supabase
    .from("expenses")
    .update({
      descricao: v.descricao,
      valor: v.valor,
      categoria: v.categoria,
      data: v.data,
      operacao_vinculada: v.operacao_vinculada || null,
      observacoes: v.observacoes || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar a despesa." };

  revalidateFinanceiro();
  return { success: true };
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: "Não foi possível excluir a despesa." };
  revalidateFinanceiro();
  return { success: true };
}
