import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { StatusChipBadge, AlertaRecargaBadge } from "@/components/chips/chip-badges";
import { formatPhoneDisplay } from "@/lib/format";
import { mensagemAlertaChip } from "@/lib/chip-alerts";
import type { ChipWithRelations } from "@/lib/data/chips";

export function ChipAttentionSection({ chips }: { chips: ChipWithRelations[] }) {
  if (chips.length === 0) return null;

  return (
    <Card className="border-warning/30 py-5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-warning/15 text-warning-foreground">
            <AlertTriangle className="size-4.5" />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold">Chips que precisam de atenção</CardTitle>
            <CardDescription>{chips.length} chip(s) com pendências que exigem ação</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {chips.map((chip) => (
            <div key={chip.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{chip.name}</p>
                <p className="text-xs text-muted-foreground">{formatPhoneDisplay(chip.phone_number)}</p>
                <p className="mt-0.5 truncate text-xs text-destructive">{mensagemAlertaChip(chip) ?? "Verificar cadastro"}</p>
                <div className="mt-1 flex gap-1">
                  <StatusChipBadge value={chip.status} />
                  <AlertaRecargaBadge value={chip.nivel_alerta} />
                </div>
              </div>
              <WhatsAppButton phone={chip.phone_number} showLabel={false} size="icon" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
