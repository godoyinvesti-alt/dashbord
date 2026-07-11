import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export interface ProductRow extends Product {
  numeroVendas: number;
  faturamento: number;
  ticketMedio: number;
  taxaConversao: number;
  taxaReembolso: number;
}

export async function listProductsWithMetrics(workspaceId: string): Promise<ProductRow[]> {
  const supabase = await createClient();

  const [{ data: products }, { data: sales }, { data: leads }] = await Promise.all([
    supabase.from("products").select("*").eq("workspace_id", workspaceId).order("nome"),
    supabase
      .from("sales")
      .select("product_id, valor_recebido, status_reembolso")
      .eq("workspace_id", workspaceId),
    supabase
      .from("leads")
      .select("produto_interesse_id")
      .eq("workspace_id", workspaceId)
      .not("produto_interesse_id", "is", null),
  ]);

  const productsList = (products as Product[]) ?? [];
  const salesList = sales ?? [];
  const leadsList = leads ?? [];

  const leadsByProduct = new Map<string, number>();
  for (const l of leadsList) {
    if (!l.produto_interesse_id) continue;
    leadsByProduct.set(l.produto_interesse_id, (leadsByProduct.get(l.produto_interesse_id) ?? 0) + 1);
  }

  return productsList.map((p) => {
    const productSales = salesList.filter((s) => s.product_id === p.id);
    const numeroVendas = productSales.length;
    const faturamento = productSales.reduce((sum, s) => sum + Number(s.valor_recebido ?? 0), 0);
    const ticketMedio = numeroVendas > 0 ? faturamento / numeroVendas : 0;
    const reembolsos = productSales.filter((s) => s.status_reembolso === "reembolsado").length;
    const taxaReembolso = numeroVendas > 0 ? (reembolsos / numeroVendas) * 100 : 0;
    const leadsProduto = leadsByProduct.get(p.id) ?? 0;
    const taxaConversao = leadsProduto > 0 ? (numeroVendas / leadsProduto) * 100 : 0;

    return { ...p, numeroVendas, faturamento, ticketMedio, taxaConversao, taxaReembolso };
  });
}
