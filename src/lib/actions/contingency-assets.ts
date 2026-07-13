"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  contingencyAssetFormSchema,
  contingencyStatusChangeFormSchema,
  type ContingencyAssetFormValues,
} from "@/lib/validations/contingency-asset";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function revalidateContingencyAssets() {
  revalidatePath("/dashboard/contingencia");
  revalidatePath("/dashboard");
}

export async function createContingencyAssetAction(
  values: ContingencyAssetFormValues
): Promise<ActionResult> {
  const parsed = contingencyAssetFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const v = parsed.data;
  const { error } = await supabase.from("contingency_assets").insert({
    owner_id: user.id,
    nome: v.nome,
    tipo: v.tipo,
    identificador: v.identificador || null,
    status: v.status,
    responsavel: v.responsavel || null,
    data_ativacao: v.data_ativacao || null,
    operacao_vinculada: v.operacao_vinculada || null,
    observacoes: v.observacoes || null,
  });

  if (error) return { error: "Não foi possível criar o ativo." };

  revalidateContingencyAssets();
  return { success: true };
}

export async function updateContingencyAssetAction(
  id: string,
  values: ContingencyAssetFormValues
): Promise<ActionResult> {
  const parsed = contingencyAssetFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const v = parsed.data;
  const { error } = await supabase
    .from("contingency_assets")
    .update({
      nome: v.nome,
      tipo: v.tipo,
      identificador: v.identificador || null,
      status: v.status,
      responsavel: v.responsavel || null,
      data_ativacao: v.data_ativacao || null,
      operacao_vinculada: v.operacao_vinculada || null,
      observacoes: v.observacoes || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar o ativo." };

  revalidateContingencyAssets();
  return { success: true };
}

export async function deleteContingencyAssetAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("contingency_assets").delete().eq("id", id);
  if (error) return { error: "Não foi possível excluir o ativo." };
  revalidateContingencyAssets();
  return { success: true };
}

export async function changeContingencyStatusAction(
  id: string,
  values: unknown
): Promise<ActionResult> {
  const parsed = contingencyStatusChangeFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contingency_assets")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) return { error: "Não foi possível alterar o status." };
  revalidateContingencyAssets();
  return { success: true };
}
