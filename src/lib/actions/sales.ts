"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { saleFormSchema, type SaleFormValues } from "@/lib/validations/sale";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function revalidateSales() {
  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard");
}

export async function createSaleAction(values: SaleFormValues): Promise<ActionResult> {
  const parsed = saleFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const v = parsed.data;
  const { error } = await supabase.from("sales").insert({
    owner_id: user.id,
    data: v.data,
    valor_recebido: v.valor_recebido,
    produto: v.produto,
    cliente: v.cliente || null,
    chip_id: v.chip_id || null,
    vendedor: v.vendedor || null,
    origem_lead: v.origem_lead || null,
    forma_pagamento: v.forma_pagamento || null,
    taxas: v.taxas,
    reembolso: v.reembolso,
    observacoes: v.observacoes || null,
  });

  if (error) return { error: "Não foi possível registrar a venda." };

  revalidateSales();
  return { success: true };
}

export async function updateSaleAction(id: string, values: SaleFormValues): Promise<ActionResult> {
  const parsed = saleFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const v = parsed.data;
  const { error } = await supabase
    .from("sales")
    .update({
      data: v.data,
      valor_recebido: v.valor_recebido,
      produto: v.produto,
      cliente: v.cliente || null,
      chip_id: v.chip_id || null,
      vendedor: v.vendedor || null,
      origem_lead: v.origem_lead || null,
      forma_pagamento: v.forma_pagamento || null,
      taxas: v.taxas,
      reembolso: v.reembolso,
      observacoes: v.observacoes || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar a venda." };

  revalidateSales();
  return { success: true };
}

export async function deleteSaleAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().eq("id", id);
  if (error) return { error: "Não foi possível excluir a venda." };
  revalidateSales();
  return { success: true };
}
