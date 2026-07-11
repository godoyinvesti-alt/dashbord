"use client";

import { Wallet, Clock, Gift, Repeat, MessageCircleOff, HandCoins } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatBRL, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function OpportunityPanel({
  total,
  categorias,
  onSelect,
}: {
  total: number;
  categorias: { id: string; label: string; count: number; icon: "clock" | "pix" | "upsell" | "recompra" | "semresposta" }[];
  onSelect: (id: string) => void;
}) {
  const icons = {
    clock: Clock,
    pix: HandCoins,
    upsell: Gift,
    recompra: Repeat,
    semresposta: MessageCircleOff,
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent py-5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="size-4.5" />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold">Dinheiro na Mesa</CardTitle>
            <CardDescription>Oportunidades que ainda podem virar receita</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-3xl font-semibold tabular-nums tracking-tight">
          {formatBRL(total)}
          <span className="ml-2 text-sm font-normal text-muted-foreground">em oportunidades abertas</span>
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {categorias.map((c) => {
            const Icon = icons[c.icon];
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <Icon className="size-4 text-primary" />
                <p className="text-lg font-semibold tabular-nums">{formatNumber(c.count)}</p>
                <p className="text-xs leading-tight text-muted-foreground">{c.label}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
