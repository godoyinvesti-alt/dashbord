"use client";

import { toast } from "sonner";
import { Download, Pencil, Trash2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SaleFormDialog } from "@/components/sales/sale-form-dialog";
import { StatusEntregaBadge, StatusReembolsoBadge } from "@/components/sales/sale-badges";
import { formatBRL, formatDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import { deleteSaleAction } from "@/lib/actions/sales";
import type { SaleRow } from "@/lib/data/sales";
import type { Product, Campaign, Agent, Chip as ChipType } from "@/lib/types";

export function SalesExplorer({
  sales,
  total,
  page,
  pageSize,
  totalPages,
  lookups,
}: {
  sales: SaleRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lookups: { products: Product[]; campaigns: Campaign[]; agents: Agent[]; chips: ChipType[] };
}) {
  function exportCsv() {
    const csv = toCsv(
      sales.map((s) => ({
        Cliente: s.cliente_nome,
        Produto: s.produto_nome ?? "",
        "Preço original": s.preco_original,
        "Valor esperado": s.valor_esperado,
        "Valor recebido": s.valor_recebido,
        "Contribuição adicional": s.contribuicao_adicional,
        Desconto: s.desconto,
        "Forma de pagamento": s.forma_pagamento ?? "",
        "Data de pagamento": s.data_pagamento ? formatDate(s.data_pagamento) : "",
        Campanha: s.campanha_nome ?? "",
        Atendente: s.agente_nome ?? "",
        Chip: s.chip_nome ?? "",
        Upsell: s.upsell ? "Sim" : "Não",
        "Status de entrega": s.status_entrega,
        "Status de reembolso": s.status_reembolso,
      }))
    );
    downloadCsv(`vendas-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  if (sales.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Nenhuma venda registrada"
        description="Registre sua primeira venda ou ajuste os filtros aplicados."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCsv}>
          <Download className="size-3.5" /> Exportar CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Valor esperado</TableHead>
              <TableHead>Valor recebido</TableHead>
              <TableHead>Contrib. adicional</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Reembolso</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="max-w-40 truncate text-sm font-medium">{sale.cliente_nome}</TableCell>
                <TableCell className="text-sm">
                  {sale.produto_nome}
                  {sale.upsell && <Badge variant="soft-info" className="ml-1.5">Upsell</Badge>}
                </TableCell>
                <TableCell className="text-sm tabular-nums">{formatBRL(sale.valor_esperado)}</TableCell>
                <TableCell className="text-sm tabular-nums font-medium">{formatBRL(sale.valor_recebido)}</TableCell>
                <TableCell className="text-sm tabular-nums">
                  {sale.contribuicao_adicional !== 0 ? (
                    <span className={sale.contribuicao_adicional! > 0 ? "text-success" : "text-destructive"}>
                      {formatBRL(sale.contribuicao_adicional)}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-sm">{sale.forma_pagamento ?? "—"}</TableCell>
                <TableCell><StatusEntregaBadge value={sale.status_entrega} /></TableCell>
                <TableCell>{sale.status_reembolso !== "nenhum" && <StatusReembolsoBadge value={sale.status_reembolso} />}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(sale.data_pagamento)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <SaleFormDialog
                      sale={sale}
                      {...lookups}
                      trigger={
                        <Button size="icon" variant="ghost" className="size-7">
                          <Pencil className="size-3.5" />
                        </Button>
                      }
                    />
                    <ConfirmDialog
                      trigger={
                        <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                      title="Excluir venda"
                      description={`Excluir a venda de "${sale.cliente_nome}"? Essa ação não pode ser desfeita.`}
                      destructive
                      confirmLabel="Excluir"
                      onConfirm={async () => {
                        const result = await deleteSaleAction(sale.id);
                        if (result.error) toast.error(result.error);
                        else toast.success("Venda excluída.");
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={pageSize} />
      </div>
    </div>
  );
}
