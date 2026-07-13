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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerRechargeAction } from "@/lib/actions/chips";

export function RechargeDialog({
  chipId,
  open,
  onOpenChange,
}: {
  chipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [valor, setValor] = useState("");
  const [observacoes, setObservacoes] = useState("");

  function submit() {
    startTransition(async () => {
      const result = await registerRechargeAction(chipId, { data, valor: Number(valor || 0), observacoes });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Recarga registrada.");
      onOpenChange(false);
      setValor("");
      setObservacoes("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar recarga</DialogTitle>
          <DialogDescription>Atualiza a data e o valor da última recarga do chip.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
