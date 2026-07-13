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
import { registerBanAction } from "@/lib/actions/chips";

export function BanDialog({
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
  const [motivo, setMotivo] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [observacoes, setObservacoes] = useState("");

  function submit() {
    startTransition(async () => {
      const result = await registerBanAction(chipId, { data, motivo, plataforma, observacoes });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Banimento registrado. O status do chip foi atualizado.");
      onOpenChange(false);
      setMotivo("");
      setPlataforma("");
      setObservacoes("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar banimento</DialogTitle>
          <DialogDescription>
            Cria um registro no histórico de banimentos e move o chip para o status &quot;Banido&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Plataforma</Label>
              <Input
                placeholder="Ex.: WhatsApp"
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Motivo</Label>
            <Input placeholder="Ex.: Spam detectado" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
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
          <Button variant="destructive" onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Registrar banimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
