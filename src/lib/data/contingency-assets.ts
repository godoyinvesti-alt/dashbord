import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ContingencyAsset } from "@/lib/types";

const PAGE_SIZE = 20;

export interface ListContingencyAssetsOptions {
  q?: string;
  tipo?: string;
  status?: string;
  page?: number;
}

export async function listContingencyAssets(options: ListContingencyAssetsOptions = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { assets: [] as ContingencyAsset[], total: 0, page: 1, totalPages: 1 };

  const page = options.page && options.page > 0 ? options.page : 1;

  let query = supabase.from("contingency_assets").select("*", { count: "exact" });
  if (options.q) {
    query = query.or(
      `nome.ilike.%${options.q}%,identificador.ilike.%${options.q}%,responsavel.ilike.%${options.q}%`
    );
  }
  if (options.tipo) {
    query = query.eq("tipo", options.tipo);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  }
  query = query.order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count } = await query;

  const total = count ?? 0;
  return {
    assets: (data as ContingencyAsset[]) ?? [],
    total,
    page,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
  };
}

export interface ContingencyAssetCounts {
  total: number;
  porTipo: Record<string, number>;
  porStatus: Record<string, number>;
}

export async function getContingencyAssetCounts(): Promise<ContingencyAssetCounts> {
  const supabase = await createClient();
  const { data } = await supabase.from("contingency_assets").select("tipo, status");
  const rows = (data as Pick<ContingencyAsset, "tipo" | "status">[]) ?? [];

  const porTipo: Record<string, number> = {};
  const porStatus: Record<string, number> = {};
  for (const row of rows) {
    porTipo[row.tipo] = (porTipo[row.tipo] ?? 0) + 1;
    porStatus[row.status] = (porStatus[row.status] ?? 0) + 1;
  }

  return { total: rows.length, porTipo, porStatus };
}
