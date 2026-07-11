"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import type { ActionResult } from "@/lib/actions/leads";

export async function createProductAction(values: ProductFormValues): Promise<ActionResult> {
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { data, error } = await supabase
    .from("products")
    .insert({
      workspace_id: ctx.workspace.id,
      nome: v.nome,
      categoria: v.categoria || null,
      descricao: v.descricao || null,
      preco_principal: v.preco_principal,
      custo: v.custo,
      status: v.status,
      link_entrega: v.link_entrega || null,
      upsells_relacionados: v.upsells_relacionados,
      order_bumps: v.order_bumps,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível criar o produto." };
  revalidatePath("/dashboard/produtos");
  return { success: true, id: data.id };
}

export async function updateProductAction(id: string, values: ProductFormValues): Promise<ActionResult> {
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase
    .from("products")
    .update({
      nome: v.nome,
      categoria: v.categoria || null,
      descricao: v.descricao || null,
      preco_principal: v.preco_principal,
      custo: v.custo,
      status: v.status,
      link_entrega: v.link_entrega || null,
      upsells_relacionados: v.upsells_relacionados,
      order_bumps: v.order_bumps,
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar o produto." };
  revalidatePath("/dashboard/produtos");
  return { success: true, id };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id).eq("workspace_id", ctx.workspace.id);
  if (error) return { error: "Não é possível excluir um produto vinculado a leads ou vendas. Arquive-o em vez de excluir." };
  revalidatePath("/dashboard/produtos");
  return { success: true };
}
