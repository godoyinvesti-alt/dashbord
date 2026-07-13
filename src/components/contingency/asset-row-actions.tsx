"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, ShieldCheck, Trash2 } from "lucide-react";
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
import { AssetFormDialog } from "@/components/contingency/asset-form-dialog";
import { AssetStatusDialog } from "@/components/contingency/asset-status-dialog";
import { deleteContingencyAssetAction } from "@/lib/actions/contingency-assets";
import type { ContingencyAsset } from "@/lib/types";

type DialogKind = "edit" | "status" | null;

export function AssetRowActions({ asset }: { asset: ContingencyAsset }) {
  const [dialog, setDialog] = useState<DialogKind>(null);

  async function handleDelete() {
    const result = await deleteContingencyAssetAction(asset.id);
    if (result.error) toast.error(result.error);
    else toast.success("Ativo excluído.");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setDialog("edit")}>
            <Pencil /> Editar ativo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("status")}>
            <ShieldCheck /> Alterar status
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 /> Excluir ativo
              </DropdownMenuItem>
            }
            title="Excluir ativo?"
            description={`O ativo "${asset.nome}" será removido permanentemente.`}
            confirmLabel="Excluir"
            destructive
            onConfirm={handleDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <AssetFormDialog asset={asset} open={dialog === "edit"} onOpenChange={() => setDialog(null)} />
      <AssetStatusDialog
        assetId={asset.id}
        currentStatus={asset.status}
        open={dialog === "status"}
        onOpenChange={() => setDialog(null)}
      />
    </>
  );
}
