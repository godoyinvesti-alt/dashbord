import "server-only";
import { createClient } from "@/lib/supabase/server";
import { computeChip } from "@/lib/chip-calc";
import type { Chip, ChipBan, ChipComputed, ChipRecharge, ChipStatusHistory, Settings } from "@/lib/types";

const PAGE_SIZE = 20;

export interface ListChipsOptions {
  q?: string;
  status?: string;
  page?: number;
}

async function getSettingsForCalc(ownerId: string): Promise<Pick<Settings, "dias_alerta_recarga" | "dias_aquecimento_padrao">> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("dias_alerta_recarga, dias_aquecimento_padrao")
    .eq("owner_id", ownerId)
    .single();
  return (data as Settings) ?? { dias_alerta_recarga: 30, dias_aquecimento_padrao: 21 };
}

export async function listChips(options: ListChipsOptions = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { chips: [] as ChipComputed[], total: 0, page: 1, totalPages: 1 };

  const page = options.page && options.page > 0 ? options.page : 1;

  let query = supabase.from("chips").select("*", { count: "exact" });
  if (options.q) {
    query = query.or(`nome.ilike.%${options.q}%,numero.ilike.%${options.q}%,responsavel.ilike.%${options.q}%`);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  }
  query = query.order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const [{ data, count }, settings, { data: bans }] = await Promise.all([
    query,
    getSettingsForCalc(user.id),
    supabase.from("chip_bans").select("chip_id"),
  ]);

  const banCountByChip = new Map<string, number>();
  for (const row of (bans as { chip_id: string }[]) ?? []) {
    banCountByChip.set(row.chip_id, (banCountByChip.get(row.chip_id) ?? 0) + 1);
  }

  const chips = ((data as Chip[]) ?? []).map((chip) =>
    computeChip(chip, banCountByChip.get(chip.id) ?? 0, settings)
  );

  const total = count ?? 0;
  return { chips, total, page, totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1) };
}

export async function listAllChipsForSelect(): Promise<Chip[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("chips").select("*").order("nome", { ascending: true });
  return (data as Chip[]) ?? [];
}

export interface ChipDetail {
  chip: ChipComputed;
  recharges: ChipRecharge[];
  bans: ChipBan[];
  statusHistory: ChipStatusHistory[];
}

export async function getChipDetail(id: string): Promise<ChipDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: chipData }, { data: recharges }, { data: bans }, { data: statusHistory }, settings] =
    await Promise.all([
      supabase.from("chips").select("*").eq("id", id).single(),
      supabase.from("chip_recharges").select("*").eq("chip_id", id).order("data", { ascending: false }),
      supabase.from("chip_bans").select("*").eq("chip_id", id).order("data", { ascending: false }),
      supabase
        .from("chip_status_history")
        .select("*")
        .eq("chip_id", id)
        .order("created_at", { ascending: false }),
      getSettingsForCalc(user.id),
    ]);

  if (!chipData) return null;

  const bansTyped = (bans as ChipBan[]) ?? [];
  const chip = computeChip(chipData as Chip, bansTyped.length, settings);

  return {
    chip,
    recharges: (recharges as ChipRecharge[]) ?? [],
    bans: bansTyped,
    statusHistory: (statusHistory as ChipStatusHistory[]) ?? [],
  };
}

export interface ChipDashboardCounts {
  total: number;
  ativos: number;
  emAquecimento: number;
  banidos: number;
  semRecarga: number;
  porStatus: Record<string, number>;
}

export async function getChipDashboardCounts(): Promise<ChipDashboardCounts> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const settings = user ? await getSettingsForCalc(user.id) : { dias_alerta_recarga: 30, dias_aquecimento_padrao: 21 };

  const { data } = await supabase.from("chips").select("*");
  const chips = (data as Chip[]) ?? [];

  const porStatus: Record<string, number> = {};
  let semRecarga = 0;
  for (const chip of chips) {
    porStatus[chip.status] = (porStatus[chip.status] ?? 0) + 1;
    const computed = computeChip(chip, 0, settings);
    if (computed.nivel_alerta_recarga === "vermelho" || computed.nivel_alerta_recarga === "vermelho_escuro") {
      semRecarga += 1;
    }
  }

  return {
    total: chips.length,
    ativos: porStatus["ativo"] ?? 0,
    emAquecimento: porStatus["em_aquecimento"] ?? 0,
    banidos: porStatus["banido"] ?? 0,
    semRecarga,
    porStatus,
  };
}
