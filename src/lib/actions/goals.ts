"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { currentMonthKey } from "@/lib/data/goals";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function upsertCurrentGoalAction(values: {
  meta_faturamento: number;
  meta_lucro: number;
  meta_vendas: number;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase.from("goals").upsert(
    {
      owner_id: user.id,
      mes: currentMonthKey(),
      meta_faturamento: values.meta_faturamento,
      meta_lucro: values.meta_lucro,
      meta_vendas: values.meta_vendas,
    },
    { onConflict: "owner_id,mes" }
  );

  if (error) return { error: "Não foi possível salvar as metas do mês." };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}
