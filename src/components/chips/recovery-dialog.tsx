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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { registerRecoveryAction } from "@/lib/actions/chips";
import type { ChipBan } from "@/lib/types";

export function RecoveryDialog({
  bans,
  open,
  onOpenChange,
}: {
  bans: ChipBan[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const pendentes = bans.filter((b) => !b.foi_recuperado);
  const [banId, setBanId] = useState(pendentes[0]?.id ?? "");
  const [dataRecuperacao, setDataRecuperacao] = useState(new Date().toISOString().slice(0, 10));
  const [observacoes, setObservacoes] = useState("");

  function submit() {
    if (!banId) {
      toast.error("Selecione o banimento a ser recuperado.");
      return;
    }
    startTransition(async () => {
      const result = await registerRecoveryAction({ ban_id: banId, data_recuperacao: dataRecuperacao, observacoes });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Recuperação registrada. O chip foi movido para \"Em recuperação\".");
      onOpenChange(false);
      setObservacoes("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar recuperação</DialogTitle>
          <DialogDescription>Marca um banimento como recuperado e atualiza o status do chip.</DialogDescription>
        </DialogHeader>
        {pendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Não há banimentos pendentes de recuperação.</p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Banimento</Label>
              <Select value={banId} onValueChange={setBanId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pendentes.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {formatDate(b.data)} {b.motivo ? `— ${b.motivo}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data da recuperação</Label>
              <Input type="date" value={dataRecuperacao} onChange={(e) => setDataRecuperacao(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending || pendentes.length === 0}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Registrar recuperação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
