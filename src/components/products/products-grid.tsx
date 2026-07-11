"use client";

import { toast } from "sonner";
import { Pencil, Trash2, Package, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
import { STATUS_PRODUTO_LABEL, STATUS_PRODUTO_COLOR } from "@/lib/constants";
import { deleteProductAction } from "@/lib/actions/products";
import type { Product } from "@/lib/types";
import type { ProductRow } from "@/lib/data/products";

export function ProductsGrid({ products }: { products: ProductRow[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum produto cadastrado"
        description="Cadastre os produtos digitais que você vende pelo WhatsApp."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="py-5">
          <CardHeader className="flex-row items-start justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{product.nome}</p>
              <p className="text-xs text-muted-foreground">{product.categoria || "Sem categoria"}</p>
            </div>
            <Badge variant={STATUS_PRODUTO_COLOR[product.status] as never}>
              {STATUS_PRODUTO_LABEL[product.status]}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-semibold tabular-nums">{formatBRL(product.preco_principal)}</span>
              <span className="text-xs text-muted-foreground">custo {formatBRL(product.custo)}</span>
            </div>
            {product.descricao && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{product.descricao}</p>
            )}
            {product.link_entrega && (
              <a
                href={product.link_entrega}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="size-3" /> Link de entrega
              </a>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-center">
              <Metric label="Vendas" value={formatNumber(product.numeroVendas)} />
              <Metric label="Faturamento" value={formatBRL(product.faturamento)} />
              <Metric label="Ticket médio" value={formatBRL(product.ticketMedio)} />
              <Metric label="Conversão" value={formatPercent(product.taxaConversao)} />
            </div>
            <div className="flex justify-between gap-2 pt-1">
              <ProductFormDialog
                product={product}
                allProducts={products}
                trigger={
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5">
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                }
              />
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                }
                title="Excluir produto"
                description={`Excluir "${product.nome}"? Produtos vinculados a vendas não podem ser excluídos.`}
                destructive
                confirmLabel="Excluir"
                onConfirm={async () => {
                  const result = await deleteProductAction(product.id);
                  if (result.error) toast.error(result.error);
                  else toast.success("Produto excluído.");
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export type { Product };
