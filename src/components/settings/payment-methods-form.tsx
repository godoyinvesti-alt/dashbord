"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updatePaymentMethodsAction } from "@/lib/actions/settings";

export function PaymentMethodsForm({ metodos }: { metodos: string[] }) {
  const [list, setList] = useState(metodos);
  const [novo, setNovo] = useState("");
  const [isPending, startTransition] = useTransition();

  function persist(next: string[]) {
    setList(next);
    startTransition(async () => {
      const result = await updatePaymentMethodsAction(next);
      if (result.error) toast.error(result.error);
    });
  }

  function addMethod() {
    const value = novo.trim();
    if (!value || list.includes(value)) return;
    persist([...list, value]);
    setNovo("");
  }

  return (
    <Card className="py-5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Formas de pagamento</CardTitle>
        <CardDescription>Métodos disponíveis para registrar vendas e recargas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {list.map((m) => (
            <Badge key={m} variant="secondary" className="gap-1.5 py-1.5">
              {m}
              <button onClick={() => persist(list.filter((x) => x !== m))} disabled={isPending}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma forma de pagamento cadastrada.</p>}
        </div>
        <div className="flex gap-2">
          <Input
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            placeholder="Ex.: Boleto, Cartão, PIX..."
            onKeyDown={(e) => e.key === "Enter" && addMethod()}
          />
          <Button onClick={addMethod} disabled={isPending || !novo.trim()} variant="outline" className="shrink-0 gap-1.5">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
