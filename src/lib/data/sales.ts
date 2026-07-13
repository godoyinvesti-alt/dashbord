import "server-only";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { resolvePeriodo } from "@/lib/date-range";
import type { Sale } from "@/lib/types";

const PAGE_SIZE = 20;

export interface ListSalesOptions {
  q?: string;
  page?: number;
  periodo?: string;
  de?: string;
  ate?: string;
}

export async function listSales(options: ListSalesOptions = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { sales: [] as Sale[], total: 0, page: 1, totalPages: 1 };

  const page = options.page && options.page > 0 ? options.page : 1;
  const periodo = resolvePeriodo(options.periodo, options.de, options.ate);
  const fromStr = format(periodo.from, "yyyy-MM-dd");
  const toStr = format(periodo.to, "yyyy-MM-dd");

  let query = supabase.from("sales").select("*", { count: "exact" });
  if (options.q) {
    query = query.or(
      `produto.ilike.%${options.q}%,cliente.ilike.%${options.q}%,vendedor.ilike.%${options.q}%`
    );
  }
  query = query
    .gte("data", fromStr)
    .lte("data", toStr)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count } = await query;

  const sales = (data as Sale[]) ?? [];
  const total = count ?? 0;
  return { sales, total, page, totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1) };
}

export interface SalesSummary {
  faturamentoBruto: number;
  faturamentoLiquido: number;
  totalVendas: number;
  ticketMedio: number;
  vendasPorChip: { chipId: string; chipNome: string; quantidade: number; receita: number }[];
}

export async function getSalesSummary(periodo?: string, de?: string, ate?: string): Promise<SalesSummary> {
  const supabase = await createClient();
  const resolved = resolvePeriodo(periodo, de, ate);
  const fromStr = format(resolved.from, "yyyy-MM-dd");
  const toStr = format(resolved.to, "yyyy-MM-dd");

  const { data } = await supabase
    .from("sales")
    .select("valor_recebido, taxas, reembolso, chip_id")
    .gte("data", fromStr)
    .lte("data", toStr);

  const sales = (data as Pick<Sale, "valor_recebido" | "taxas" | "reembolso" | "chip_id">[]) ?? [];

  const faturamentoBruto = sales.reduce((sum, s) => sum + (s.valor_recebido ?? 0), 0);
  const faturamentoLiquido = sales.reduce(
    (sum, s) => sum + (s.valor_recebido ?? 0) - (s.taxas ?? 0) - (s.reembolso ?? 0),
    0
  );
  const totalVendas = sales.length;
  const ticketMedio = totalVendas > 0 ? faturamentoBruto / totalVendas : 0;

  const porChip = new Map<string, { quantidade: number; receita: number }>();
  for (const s of sales) {
    if (!s.chip_id) continue;
    const entry = porChip.get(s.chip_id) ?? { quantidade: 0, receita: 0 };
    entry.quantidade += 1;
    entry.receita += s.valor_recebido ?? 0;
    porChip.set(s.chip_id, entry);
  }

  let vendasPorChip: SalesSummary["vendasPorChip"] = [];
  if (porChip.size > 0) {
    const { data: chips } = await supabase
      .from("chips")
      .select("id, nome")
      .in("id", Array.from(porChip.keys()));
    const chipNomeById = new Map(((chips as { id: string; nome: string }[]) ?? []).map((c) => [c.id, c.nome]));
    vendasPorChip = Array.from(porChip.entries())
      .map(([chipId, v]) => ({
        chipId,
        chipNome: chipNomeById.get(chipId) ?? "—",
        quantidade: v.quantidade,
        receita: v.receita,
      }))
      .sort((a, b) => b.receita - a.receita);
  }

  return { faturamentoBruto, faturamentoLiquido, totalVendas, ticketMedio, vendasPorChip };
}

export interface ChipSelectOption {
  id: string;
  nome: string;
  numero: string;
}

export async function listChipsForSelect(): Promise<ChipSelectOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("chips").select("id, nome, numero").order("nome", { ascending: true });
  return (data as ChipSelectOption[]) ?? [];
}
