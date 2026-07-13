"use client";

import { useMemo } from "react";
import { ShoppingCart, DollarSign, Wallet, Receipt, Ticket } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { SearchInput } from "@/components/shared/search-input";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SaleFormDialog } from "@/components/sales/sale-form-dialog";
import { SaleRowActions } from "@/components/sales/sale-row-actions";
import { FormaPagamentoBadge } from "@/components/sales/sale-badges";
import { formatDate, formatBRL } from "@/lib/format";
import type { ChipSelectOption, SalesSummary } from "@/lib/data/sales";
import type { Sale } from "@/lib/types";

export function SalesExplorer({
  sales,
  total,
  page,
  totalPages,
  summary,
  chips,
}: {
  sales: Sale[];
  total: number;
  page: number;
  totalPages: number;
  summary: SalesSummary;
  chips: ChipSelectOption[];
}) {
  const chipNomeById = useMemo(() => new Map(chips.map((c) => [c.id, c.nome])), [chips]);

  return (
    <div>
      <PageHeader
        title="Vendas"
        description="Registre vendas rapidamente e acompanhe o faturamento do período."
        actions={<SaleFormDialog chips={chips} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Buscar por produto, cliente ou vendedor..." className="w-full sm:w-72" />
        <DateRangeFilter />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Faturamento bruto" value={formatBRL(summary.faturamentoBruto)} icon={DollarSign} />
        <StatCard label="Faturamento líquido" value={formatBRL(summary.faturamentoLiquido)} icon={Wallet} />
        <StatCard label="Total de vendas" value={String(summary.totalVendas)} icon={Receipt} />
        <StatCard label="Ticket médio" value={formatBRL(summary.ticketMedio)} icon={Ticket} />
      </div>

      {sales.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma venda encontrada"
          description="Registre sua primeira venda para começar a acompanhar o faturamento."
          action={<SaleFormDialog chips={chips} />}
        />
      ) : (
        <>
          {/* Desktop: tabela */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Chip</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="whitespace-nowrap text-sm">{formatDate(sale.data)}</TableCell>
                    <TableCell>
                      <p className="font-medium">{sale.produto}</p>
                      {sale.vendedor && <p className="text-xs text-muted-foreground">Vendedor: {sale.vendedor}</p>}
                    </TableCell>
                    <TableCell className="text-sm">{sale.cliente || "—"}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{formatBRL(sale.valor_recebido)}</TableCell>
                    <TableCell className="text-sm">
                      {sale.chip_id ? chipNomeById.get(sale.chip_id) ?? "—" : "—"}
                    </TableCell>
                    <TableCell>
                      <FormaPagamentoBadge forma={sale.forma_pagamento} />
                    </TableCell>
                    <TableCell>
                      <SaleRowActions sale={sale} chips={chips} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-4">
              <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={20} />
            </div>
          </Card>

          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {sales.map((sale) => (
              <Card key={sale.id} className="py-4">
                <CardContent className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{sale.produto}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(sale.data)}</p>
                    </div>
                    <SaleRowActions sale={sale} chips={chips} />
                  </div>
                  <p className="text-lg font-semibold tabular-nums">{formatBRL(sale.valor_recebido)}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <FormaPagamentoBadge forma={sale.forma_pagamento} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>Cliente: {sale.cliente || "—"}</p>
                    <p>Chip: {sale.chip_id ? chipNomeById.get(sale.chip_id) ?? "—" : "—"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={20} />
          </div>
        </>
      )}
    </div>
  );
}
