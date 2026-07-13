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
import { SaleFormDialog } from "@/components/sales/sale-form-dialog";
import { deleteSaleAction } from "@/lib/actions/sales";
import type { ChipSelectOption } from "@/lib/data/sales";
import type { Sale } from "@/lib/types";

type DialogKind = "edit" | null;

export function SaleRowActions({ sale, chips }: { sale: Sale; chips: ChipSelectOption[] }) {
  const [dialog, setDialog] = useState<DialogKind>(null);

  async function handleDelete() {
    const result = await deleteSaleAction(sale.id);
    if (result.error) toast.error(result.error);
    else toast.success("Venda excluída.");
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
          <DropdownMenuItem onClick={() => setDialog("edit")}>
            <Pencil /> Editar venda
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 /> Excluir venda
              </DropdownMenuItem>
            }
            title="Excluir venda?"
            description={`A venda de "${sale.produto}" será removida permanentemente.`}
            confirmLabel="Excluir"
            destructive
            onConfirm={handleDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <SaleFormDialog
        sale={sale}
        chips={chips}
        open={dialog === "edit"}
        onOpenChange={() => setDialog(null)}
      />
    </>
  );
}
