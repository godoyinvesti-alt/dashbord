"use client";

import { toast } from "sonner";
import { Pencil, Trash2, Receipt, Repeat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ExpenseFormDialog } from "@/components/financial/expense-form-dialog";
import { formatBRL, formatDate } from "@/lib/format";
import { CATEGORIA_DESPESA_LABEL } from "@/lib/constants";
import { deleteExpenseAction } from "@/lib/actions/expenses";
import type { Expense } from "@/lib/types";

export function ExpensesTable({
  expenses,
  total,
  page,
  pageSize,
  totalPages,
}: {
  expenses: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Nenhuma despesa registrada"
        description="Registre despesas manuais como tráfego pago, ferramentas e comissões."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Recorrente</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="max-w-56 truncate text-sm font-medium">{e.descricao}</TableCell>
              <TableCell><Badge variant="outline">{CATEGORIA_DESPESA_LABEL[e.categoria]}</Badge></TableCell>
              <TableCell className="text-sm tabular-nums">{formatBRL(e.valor)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(e.data)}</TableCell>
              <TableCell>
                {e.recorrente && (
                  <Badge variant="soft-info" className="gap-1">
                    <Repeat className="size-3" /> Recorrente
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <ExpenseFormDialog
                    expense={e}
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
                    title="Excluir despesa"
                    description={`Excluir "${e.descricao}"?`}
                    destructive
                    confirmLabel="Excluir"
                    onConfirm={async () => {
                      const result = await deleteExpenseAction(e.id);
                      if (result.error) toast.error(result.error);
                      else toast.success("Despesa excluída.");
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
  );
}
