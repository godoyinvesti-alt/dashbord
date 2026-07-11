import "server-only";
import { startOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { computeChip, DEFAULT_CHIP_ALERT_THRESHOLDS, type ChipAlertThresholds } from "@/lib/chip-alerts";
import type { Chip, ChipComputed, ChipRecharge, ChipIncident, Settings } from "@/lib/types";

export interface ChipWithRelations extends ChipComputed {
  agente_nome?: string | null;
}

export async function getChipThresholds(workspaceId: string): Promise<ChipAlertThresholds & { max_incidentes_alerta: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const settings = data as Settings | null;
  return {
    aviso_recarga_dias: settings?.aviso_recarga_dias ?? DEFAULT_CHIP_ALERT_THRESHOLDS.aviso_recarga_dias,
    critico_recarga_dias: settings?.critico_recarga_dias ?? DEFAULT_CHIP_ALERT_THRESHOLDS.critico_recarga_dias,
    max_incidentes_alerta: settings?.max_incidentes_alerta ?? 3,
  };
}

export async function listChips(workspaceId: string, includeArchived = false): Promise<ChipWithRelations[]> {
  const supabase = await createClient();
  const thresholds = await getChipThresholds(workspaceId);

  let query = supabase
    .from("chips")
    .select("*, agente:agents(nome)")
    .eq("workspace_id", workspaceId);

  if (!includeArchived) query = query.eq("archived", false);

  const { data } = await query.order("name", { ascending: true });
  const rows = (data as (Chip & { agente: { nome?: string } | null })[]) ?? [];

  return rows.map((c) => ({
    ...computeChip(c, thresholds),
    agente_nome: c.agente?.nome ?? null,
  }));
}

export async function getChipDashboardStats(workspaceId: string) {
  const chips = await listChips(workspaceId);
  const thresholds = await getChipThresholds(workspaceId);

  const total = chips.length;
  const ativos = chips.filter((c) => c.status === "ativo").length;
  const aquecimento = chips.filter((c) => c.status === "em_aquecimento").length;
  const bloqueados = chips.filter((c) => c.status === "bloqueado").length;
  const banidos = chips.filter((c) => c.status === "banido").length;
  const semRecargaMais30 = chips.filter((c) => c.nivel_alerta === "vermelho" || c.nivel_alerta === "vermelho_escuro").length;
  const semResponsavel = chips.filter((c) => !c.assigned_agent_id).length;

  const supabase = await createClient();
  const { count: quedasNoMes } = await supabase
    .from("chip_incidents")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("incident_date", startOfMonth(new Date()).toISOString());

  const precisamAtencao = chips.filter(
    (c) =>
      c.nivel_alerta === "vermelho" ||
      c.nivel_alerta === "vermelho_escuro" ||
      c.status === "bloqueado" ||
      c.status === "banido" ||
      c.incident_count >= thresholds.max_incidentes_alerta ||
      !c.assigned_agent_id ||
      !c.last_recharge_date
  );

  return {
    total,
    ativos,
    aquecimento,
    bloqueados,
    banidos,
    semRecargaMais30,
    semResponsavel,
    quedasNoMes: quedasNoMes ?? 0,
    precisamAtencao,
    chips,
  };
}

export interface ChipTimelineEntry {
  id: string;
  tipo: "recarga" | "incidente";
  data: string;
  detalhe: string;
  extra?: string;
}

export async function getChipTimeline(workspaceId: string, chipId: string): Promise<ChipTimelineEntry[]> {
  const supabase = await createClient();
  const [{ data: recharges }, { data: incidents }] = await Promise.all([
    supabase
      .from("chip_recharges")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("chip_id", chipId)
      .order("recharge_date", { ascending: false }),
    supabase
      .from("chip_incidents")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("chip_id", chipId)
      .order("incident_date", { ascending: false }),
  ]);

  const rechargeEntries: ChipTimelineEntry[] = ((recharges as ChipRecharge[]) ?? []).map((r) => ({
    id: r.id,
    tipo: "recarga",
    data: r.recharge_date,
    detalhe: `Recarga de ${r.amount}`,
    extra: r.payment_method ?? undefined,
  }));

  const incidentEntries: ChipTimelineEntry[] = ((incidents as ChipIncident[]) ?? []).map((i) => ({
    id: i.id,
    tipo: "incidente",
    data: i.incident_date,
    detalhe: i.incident_type,
    extra: i.reason ?? undefined,
  }));

  return [...rechargeEntries, ...incidentEntries].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
}

export async function getChipRecharges(workspaceId: string, chipId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("chip_recharges")
    .select("*, chip:chips(name, phone_number)")
    .eq("workspace_id", workspaceId);
  if (chipId) query = query.eq("chip_id", chipId);
  const { data } = await query.order("recharge_date", { ascending: false }).limit(200);
  return data ?? [];
}

export async function getChipIncidents(workspaceId: string, chipId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("chip_incidents")
    .select("*, chip:chips(name, phone_number)")
    .eq("workspace_id", workspaceId);
  if (chipId) query = query.eq("chip_id", chipId);
  const { data } = await query.order("incident_date", { ascending: false }).limit(200);
  return data ?? [];
}
