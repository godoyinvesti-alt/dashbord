"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CircleDollarSign, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METODOS_PAGAMENTO_PADRAO } from "@/lib/constants";
import { registerPaymentFromLeadAction } from "@/lib/actions/follow-ups";

export function RegisterPaymentDialog({
  leadId,
  valorSugerido,
}: {
  leadId: string;
  valorSugerido: number;
}) {
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState(String(valorSugerido || 0));
  const [metodo, setMetodo] = useState("PIX");
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 justify-start">
          <CircleDollarSign className="size-3.5" /> Registrar pagamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            Confirme o valor recebido. Isso atualizará o lead e criará uma venda.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Valor recebido (R$)</Label>
            <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Forma de pagamento</Label>
            <Select value={metodo} onValueChange={setMetodo}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {METODOS_PAGAMENTO_PADRAO.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await registerPaymentFromLeadAction(leadId, Number(valor), metodo);
                if (result.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Pagamento registrado com sucesso.");
                setOpen(false);
              })
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Confirmar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
