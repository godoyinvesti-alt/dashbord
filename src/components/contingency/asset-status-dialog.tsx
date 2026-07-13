"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_CONTINGENCIA_LABEL, STATUS_CONTINGENCIA_OPCOES } from "@/lib/constants";
import { changeContingencyStatusAction } from "@/lib/actions/contingency-assets";
import type { StatusContingencia } from "@/lib/types";

export function AssetStatusDialog({
  assetId,
  currentStatus,
  open,
  onOpenChange,
}: {
  assetId: string;
  currentStatus: StatusContingencia;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<StatusContingencia>(currentStatus);

  function submit() {
    startTransition(async () => {
      const result = await changeContingencyStatusAction(assetId, { status });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Status atualizado.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar status</DialogTitle>
          <DialogDescription>Atualize a disponibilidade deste ativo de contingência.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Novo status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusContingencia)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_CONTINGENCIA_OPCOES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_CONTINGENCIA_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
