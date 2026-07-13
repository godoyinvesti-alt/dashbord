"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  chipFormSchema,
  rechargeFormSchema,
  banFormSchema,
  recoveryFormSchema,
  statusChangeFormSchema,
  observationFormSchema,
  type ChipFormValues,
} from "@/lib/validations/chip";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function revalidateChips(id?: string) {
  revalidatePath("/dashboard/chips");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/dashboard/chips/${id}`);
}

export async function createChipAction(values: ChipFormValues): Promise<ActionResult> {
  const parsed = chipFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const v = parsed.data;
  const { error } = await supabase.from("chips").insert({
    owner_id: user.id,
    nome: v.nome,
    numero: v.numero,
    operadora: v.operadora,
    status: v.status,
    data_ativacao: v.data_ativacao || null,
    data_inicio_aquecimento: v.data_inicio_aquecimento || null,
    meta_dias_aquecimento: v.meta_dias_aquecimento,
    responsavel: v.responsavel || null,
    operacao_vinculada: v.operacao_vinculada || null,
    observacoes: v.observacoes || null,
  });

  if (error) return { error: "Não foi possível criar o chip." };

  revalidateChips();
  return { success: true };
}

export async function updateChipAction(id: string, values: ChipFormValues): Promise<ActionResult> {
  const parsed = chipFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { data: current } = await supabase.from("chips").select("status").eq("id", id).single();

  const v = parsed.data;
  const { error } = await supabase
    .from("chips")
    .update({
      nome: v.nome,
      numero: v.numero,
      operadora: v.operadora,
      status: v.status,
      data_ativacao: v.data_ativacao || null,
      data_inicio_aquecimento: v.data_inicio_aquecimento || null,
      meta_dias_aquecimento: v.meta_dias_aquecimento,
      responsavel: v.responsavel || null,
      operacao_vinculada: v.operacao_vinculada || null,
      observacoes: v.observacoes || null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível atualizar o chip." };

  if (current && current.status !== v.status) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("chip_status_history").insert({
      owner_id: user?.id,
      chip_id: id,
      status_anterior: current.status,
      status_novo: v.status,
      observacao: "Status alterado via edição do chip",
    });
  }

  revalidateChips(id);
  return { success: true };
}

export async function deleteChipAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("chips").delete().eq("id", id);
  if (error) return { error: "Não foi possível excluir o chip." };
  revalidateChips();
  return { success: true };
}

export async function registerRechargeAction(
  chipId: string,
  values: unknown
): Promise<ActionResult> {
  const parsed = rechargeFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_chip_recharge", {
    p_chip_id: chipId,
    p_data: parsed.data.data,
    p_valor: parsed.data.valor,
    p_observacoes: parsed.data.observacoes || null,
  });

  if (error) return { error: "Não foi possível registrar a recarga." };
  revalidateChips(chipId);
  return { success: true };
}

export async function changeStatusAction(chipId: string, values: unknown): Promise<ActionResult> {
  const parsed = statusChangeFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_chip_status_change", {
    p_chip_id: chipId,
    p_status_novo: parsed.data.status_novo,
    p_observacao: parsed.data.observacao || null,
  });

  if (error) return { error: "Não foi possível alterar o status." };
  revalidateChips(chipId);
  return { success: true };
}

export async function registerBanAction(chipId: string, values: unknown): Promise<ActionResult> {
  const parsed = banFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_chip_ban", {
    p_chip_id: chipId,
    p_data: parsed.data.data,
    p_motivo: parsed.data.motivo || null,
    p_plataforma: parsed.data.plataforma || null,
    p_observacoes: parsed.data.observacoes || null,
  });

  if (error) return { error: "Não foi possível registrar o banimento." };
  revalidateChips(chipId);
  return { success: true };
}

export async function registerRecoveryAction(values: unknown): Promise<ActionResult> {
  const parsed = recoveryFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { data: ban } = await supabase
    .from("chip_bans")
    .select("chip_id")
    .eq("id", parsed.data.ban_id)
    .single();

  const { error } = await supabase.rpc("record_chip_recovery", {
    p_ban_id: parsed.data.ban_id,
    p_data_recuperacao: parsed.data.data_recuperacao,
    p_observacoes: parsed.data.observacoes || null,
  });

  if (error) return { error: "Não foi possível registrar a recuperação." };
  revalidateChips(ban?.chip_id);
  return { success: true };
}

export async function addObservationAction(chipId: string, values: unknown): Promise<ActionResult> {
  const parsed = observationFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { data: chip } = await supabase.from("chips").select("observacoes").eq("id", chipId).single();
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  const novaObservacao = `[${dataAtual}] ${parsed.data.observacao}`;
  const observacoes = chip?.observacoes ? `${chip.observacoes}\n${novaObservacao}` : novaObservacao;

  const { error } = await supabase.from("chips").update({ observacoes }).eq("id", chipId);
  if (error) return { error: "Não foi possível adicionar a observação." };

  revalidateChips(chipId);
  return { success: true };
}
