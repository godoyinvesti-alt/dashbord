"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireContext } from "@/lib/workspace";
import {
  chipSchema,
  rechargeSchema,
  incidentSchema,
  type ChipFormValues,
  type RechargeFormValues,
  type IncidentFormValues,
} from "@/lib/validations/chip";
import type { ActionResult } from "@/lib/actions/leads";
import { getChipTimeline } from "@/lib/data/chips";

export async function createChipAction(values: ChipFormValues): Promise<ActionResult> {
  const parsed = chipSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { count } = await supabase
    .from("chips")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", ctx.workspace.id)
    .eq("phone_number", v.phone_number);

  if ((count ?? 0) > 0) {
    return { error: "Já existe um chip cadastrado com este número neste workspace." };
  }

  const { data, error } = await supabase
    .from("chips")
    .insert({
      workspace_id: ctx.workspace.id,
      name: v.name,
      phone_number: v.phone_number,
      carrier: v.carrier,
      activation_date: v.activation_date || null,
      status: v.status,
      assigned_agent_id: v.assigned_agent_id || null,
      operation_name: v.operation_name || null,
      notes: v.notes || null,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível criar o chip." };

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "chip_criado",
    p_entidade: "chips",
    p_entidade_id: data.id,
    p_detalhes: { nome: v.name },
  });

  revalidatePath("/dashboard/chips");
  return { success: true, id: data.id };
}

export async function updateChipAction(id: string, values: ChipFormValues): Promise<ActionResult> {
  const parsed = chipSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { count } = await supabase
    .from("chips")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", ctx.workspace.id)
    .eq("phone_number", v.phone_number)
    .neq("id", id);

  if ((count ?? 0) > 0) {
    return { error: "Já existe outro chip cadastrado com este número neste workspace." };
  }

  const { data: current } = await supabase.from("chips").select("status, assigned_agent_id").eq("id", id).single();

  const { error } = await supabase
    .from("chips")
    .update({
      name: v.name,
      phone_number: v.phone_number,
      carrier: v.carrier,
      activation_date: v.activation_date || null,
      status: v.status,
      assigned_agent_id: v.assigned_agent_id || null,
      operation_name: v.operation_name || null,
      notes: v.notes || null,
    })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível atualizar o chip." };

  if (current?.status && current.status !== v.status) {
    await supabase.rpc("log_activity", {
      p_workspace_id: ctx.workspace.id,
      p_acao: "chip_status_alterado",
      p_entidade: "chips",
      p_entidade_id: id,
      p_detalhes: { de: current.status, para: v.status },
    });
  }
  if (current && current.assigned_agent_id !== (v.assigned_agent_id || null)) {
    await supabase.rpc("log_activity", {
      p_workspace_id: ctx.workspace.id,
      p_acao: "chip_responsavel_transferido",
      p_entidade: "chips",
      p_entidade_id: id,
    });
  }

  revalidatePath("/dashboard/chips");
  return { success: true, id };
}

export async function archiveChipAction(id: string): Promise<ActionResult> {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("chips")
    .update({ archived: true })
    .eq("id", id)
    .eq("workspace_id", ctx.workspace.id);

  if (error) return { error: "Não foi possível arquivar o chip." };
  revalidatePath("/dashboard/chips");
  return { success: true };
}

export async function registerRechargeAction(
  chipId: string,
  values: RechargeFormValues
): Promise<ActionResult> {
  const parsed = rechargeSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { error } = await supabase.from("chip_recharges").insert({
    workspace_id: ctx.workspace.id,
    chip_id: chipId,
    recharge_date: v.recharge_date,
    amount: v.amount,
    carrier: v.carrier,
    payment_method: v.payment_method || null,
    notes: v.notes || null,
    created_by: ctx.userId,
  });

  if (error) return { error: "Não foi possível registrar a recarga." };

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "chip_recarregado",
    p_entidade: "chips",
    p_entidade_id: chipId,
    p_detalhes: { valor: v.amount },
  });

  revalidatePath("/dashboard/chips");
  return { success: true };
}

export async function registerIncidentAction(
  chipId: string,
  values: IncidentFormValues
): Promise<ActionResult> {
  const parsed = incidentSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const ctx = await requireContext();
  const supabase = await createClient();
  const v = parsed.data;

  const { data: chip } = await supabase.from("chips").select("status").eq("id", chipId).single();

  const { error } = await supabase.from("chip_incidents").insert({
    workspace_id: ctx.workspace.id,
    chip_id: chipId,
    incident_type: v.incident_type,
    incident_date: v.incident_date,
    reason: v.reason || null,
    description: v.description || null,
    previous_status: chip?.status ?? null,
    new_status: v.new_status,
    action_taken: v.action_taken || null,
    created_by: ctx.userId,
  });

  if (error) return { error: "Não foi possível registrar o incidente." };

  await supabase.rpc("log_activity", {
    p_workspace_id: ctx.workspace.id,
    p_acao: "chip_incidente_registrado",
    p_entidade: "chips",
    p_entidade_id: chipId,
    p_detalhes: { tipo: v.incident_type },
  });

  revalidatePath("/dashboard/chips");
  return { success: true };
}

export async function fetchChipTimelineAction(chipId: string) {
  const ctx = await requireContext();
  return getChipTimeline(ctx.workspace.id, chipId);
}
