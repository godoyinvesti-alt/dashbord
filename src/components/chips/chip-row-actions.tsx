"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Banknote,
  Ban,
  ShieldCheck,
  RefreshCcw,
  MessageSquarePlus,
  Trash2,
} from "lucide-react";
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
import { ChipFormDialog } from "@/components/chips/chip-form-dialog";
import { RechargeDialog } from "@/components/chips/recharge-dialog";
import { BanDialog } from "@/components/chips/ban-dialog";
import { RecoveryDialog } from "@/components/chips/recovery-dialog";
import { StatusDialog } from "@/components/chips/status-dialog";
import { ObservationDialog } from "@/components/chips/observation-dialog";
import { deleteChipAction } from "@/lib/actions/chips";
import type { Chip, ChipBan } from "@/lib/types";

type DialogKind = "edit" | "recharge" | "ban" | "recovery" | "status" | "observation" | null;

export function ChipRowActions({
  chip,
  bans = [],
  diasAquecimentoPadrao = 21,
  showDetailLink = true,
}: {
  chip: Chip;
  bans?: ChipBan[];
  diasAquecimentoPadrao?: number;
  showDetailLink?: boolean;
}) {
  const [dialog, setDialog] = useState<DialogKind>(null);

  async function handleDelete() {
    const result = await deleteChipAction(chip.id);
    if (result.error) toast.error(result.error);
    else toast.success("Chip excluído.");
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
          {showDetailLink && (
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/chips/${chip.id}`}>
                <Eye /> Ver detalhes
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setDialog("edit")}>
            <Pencil /> Editar chip
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialog("recharge")}>
            <Banknote /> Registrar recarga
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("status")}>
            <ShieldCheck /> Alterar status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("ban")} variant="destructive">
            <Ban /> Registrar banimento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("recovery")}>
            <RefreshCcw /> Registrar recuperação
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("observation")}>
            <MessageSquarePlus /> Adicionar observação
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 /> Excluir chip
              </DropdownMenuItem>
            }
            title="Excluir chip?"
            description={`O chip "${chip.nome}" e todo o seu histórico serão removidos permanentemente.`}
            confirmLabel="Excluir"
            destructive
            onConfirm={handleDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <ChipFormDialog
        chip={chip}
        diasAquecimentoPadrao={diasAquecimentoPadrao}
        open={dialog === "edit"}
        onOpenChange={() => setDialog(null)}
      />
      <RechargeDialog chipId={chip.id} open={dialog === "recharge"} onOpenChange={() => setDialog(null)} />
      <BanDialog chipId={chip.id} open={dialog === "ban"} onOpenChange={() => setDialog(null)} />
      <RecoveryDialog bans={bans} open={dialog === "recovery"} onOpenChange={() => setDialog(null)} />
      <StatusDialog
        chipId={chip.id}
        currentStatus={chip.status}
        open={dialog === "status"}
        onOpenChange={() => setDialog(null)}
      />
      <ObservationDialog chipId={chip.id} open={dialog === "observation"} onOpenChange={() => setDialog(null)} />
    </>
  );
}
