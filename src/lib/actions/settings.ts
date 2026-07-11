"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import type { ActionResult } from "@/lib/actions/leads";
import type { Operadora, PapelUsuario } from "@/lib/types";

export async function updateWorkspaceAction(input: {
  nome: string;
  moeda: string;
  fuso_horario: string;
  meta_faturamento_mensal: number;
}): Promise<ActionResult> {
  if (!input.nome.trim()) return { error: "Informe o nome do negócio." };
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspaces")
    .update({
      nome: input.nome,
      moeda: input.moeda,
      fuso_horario: input.fuso_horario,
      meta_faturamento_mensal: input.meta_faturamento_mensal,
    })
    .eq("id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar as informações do negócio." };
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateChipSettingsAction(input: {
  aviso_recarga_dias: number;
  critico_recarga_dias: number;
  max_incidentes_alerta: number;
  operadora_padrao: Operadora;
  notificacoes_ativas: boolean;
}): Promise<ActionResult> {
  if (input.aviso_recarga_dias >= input.critico_recarga_dias) {
    return { error: "O aviso deve ocorrer antes do prazo crítico." };
  }
  const ctx = await requireContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("settings")
    .update(input)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar as configurações de chips." };
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard/chips");
  return { success: true };
}

export async function updatePaymentMethodsAction(metodos: string[]): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ metodos_pagamento: metodos })
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar as formas de pagamento." };
  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}

export async function updateMemberRoleAction(memberId: string, papel: PapelUsuario): Promise<ActionResult> {
  const ctx = await requireContext();
  if (ctx.papel !== "administrador" && ctx.papel !== "gestor") {
    return { error: "Você não tem permissão para alterar papéis da equipe." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_members")
    .update({ papel })
    .eq("id", memberId)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar o papel do membro." };
  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}
