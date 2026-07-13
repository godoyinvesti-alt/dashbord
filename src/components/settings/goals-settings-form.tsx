"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertCurrentGoalAction } from "@/lib/actions/goals";
import type { Goal } from "@/lib/types";

export function GoalsSettingsForm({ goal }: { goal: Goal | null }) {
  const [metaFaturamento, setMetaFaturamento] = useState(goal?.meta_faturamento ?? 0);
  const [metaLucro, setMetaLucro] = useState(goal?.meta_lucro ?? 0);
  const [metaVendas, setMetaVendas] = useState(goal?.meta_vendas ?? 0);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await upsertCurrentGoalAction({
        meta_faturamento: metaFaturamento,
        meta_lucro: metaLucro,
        meta_vendas: metaVendas,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Metas do mês atual atualizadas.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas do mês atual</CardTitle>
        <CardDescription>
          Essas metas se aplicam apenas ao mês corrente e são usadas para acompanhar o desempenho no
          dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="meta_faturamento">Meta de faturamento (R$)</Label>
            <Input
              id="meta_faturamento"
              type="number"
              min={0}
              step="0.01"
              value={metaFaturamento}
              onChange={(e) => setMetaFaturamento(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta_lucro">Meta de lucro (R$)</Label>
            <Input
              id="meta_lucro"
              type="number"
              min={0}
              step="0.01"
              value={metaLucro}
              onChange={(e) => setMetaLucro(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meta_vendas">Meta de vendas (unid.)</Label>
            <Input
              id="meta_vendas"
              type="number"
              min={0}
              value={metaVendas}
              onChange={(e) => setMetaVendas(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
