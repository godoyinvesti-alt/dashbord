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
import { addObservationAction } from "@/lib/actions/chips";

export function ObservationDialog({
  chipId,
  open,
  onOpenChange,
}: {
  chipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [observacao, setObservacao] = useState("");

  function submit() {
    if (!observacao.trim()) {
      toast.error("Escreva uma observação.");
      return;
    }
    startTransition(async () => {
      const result = await addObservationAction(chipId, { observacao });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Observação adicionada.");
      onOpenChange(false);
      setObservacao("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar observação</DialogTitle>
          <DialogDescription>A observação é adicionada ao histórico de anotações do chip.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Observação</Label>
          <Textarea rows={3} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
