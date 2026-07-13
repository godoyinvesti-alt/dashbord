"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ExpenseFormDialog } from "@/components/financial/expense-form-dialog";
import { deleteExpenseAction } from "@/lib/actions/expenses";
import type { Expense } from "@/lib/types";

export function ExpenseRowActions({ expense }: { expense: Expense }) {
  const [editOpen, setEditOpen] = useState(false);

  async function handleDelete() {
    const result = await deleteExpenseAction(expense.id);
    if (result.error) toast.error(result.error);
    else toast.success("Despesa excluída.");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil /> Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            }
            title="Excluir despesa?"
            description={`A despesa "${expense.descricao}" será removida permanentemente.`}
            confirmLabel="Excluir"
            destructive
            onConfirm={handleDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <ExpenseFormDialog expense={expense} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
