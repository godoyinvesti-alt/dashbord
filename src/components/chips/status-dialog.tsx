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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_CHIP_LABEL, STATUS_CHIP_OPCOES } from "@/lib/constants";
import { changeStatusAction } from "@/lib/actions/chips";
import type { StatusChip } from "@/lib/types";

export function StatusDialog({
  chipId,
  currentStatus,
  open,
  onOpenChange,
}: {
  chipId: string;
  currentStatus: StatusChip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [statusNovo, setStatusNovo] = useState<StatusChip>(currentStatus);
  const [observacao, setObservacao] = useState("");

  function submit() {
    startTransition(async () => {
      const result = await changeStatusAction(chipId, { status_novo: statusNovo, observacao });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Status atualizado.");
      onOpenChange(false);
      setObservacao("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar status</DialogTitle>
          <DialogDescription>A mudança fica registrada no histórico do chip.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Novo status</Label>
            <Select value={statusNovo} onValueChange={(v) => setStatusNovo(v as StatusChip)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_CHIP_OPCOES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_CHIP_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Observação (opcional)</Label>
            <Textarea rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
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
