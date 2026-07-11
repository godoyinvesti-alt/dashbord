"use client";

import { useState } from "react";
import { AlertTriangle, Smartphone } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { StatusChipBadge, AlertaRecargaBadge } from "@/components/chips/chip-badges";
import { RegisterRechargeDialog } from "@/components/chips/recharge-dialog";
import { RegisterIncidentDialog } from "@/components/chips/incident-dialog";
import { ChipDetailDrawer } from "@/components/chips/chip-detail-drawer";
import { formatDate, formatPhoneDisplay, formatNumber } from "@/lib/format";
import { OPERADORA_LABEL } from "@/lib/constants";
import { NIVEL_ALERTA_ROW_CLASS, mensagemAlertaChip } from "@/lib/chip-alerts";
import { fetchChipTimelineAction } from "@/lib/actions/chips";
import { cn } from "@/lib/utils";
import type { ChipWithRelations } from "@/lib/data/chips";
import type { Agent } from "@/lib/types";

export function ChipsExplorer({
  chips,
  agents,
}: {
  chips: ChipWithRelations[];
  agents: Agent[];
}) {
  const [activeChip, setActiveChip] = useState<ChipWithRelations | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (chips.length === 0) {
    return (
      <EmptyState
        icon={Smartphone}
        title="Nenhum chip cadastrado"
        description="Adicione seus chips e números de WhatsApp para começar a monitorar recargas e incidentes."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chip</TableHead>
            <TableHead>Operadora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última recarga</TableHead>
            <TableHead>Alerta</TableHead>
            <TableHead>Quedas</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chips.map((chip) => {
            const mensagem = mensagemAlertaChip(chip);
            return (
              <TableRow
                key={chip.id}
                className={cn("cursor-pointer", NIVEL_ALERTA_ROW_CLASS[chip.nivel_alerta])}
                onClick={() => {
                  setActiveChip(chip);
                  setDrawerOpen(true);
                }}
              >
                <TableCell>
                  <p className="text-sm font-medium">{chip.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPhoneDisplay(chip.phone_number)}</p>
                </TableCell>
                <TableCell className="text-sm">{OPERADORA_LABEL[chip.carrier]}</TableCell>
                <TableCell><StatusChipBadge value={chip.status} /></TableCell>
                <TableCell className="text-sm">
                  {chip.last_recharge_date ? (
                    <>
                      {formatDate(chip.last_recharge_date)}
                      <p className="text-xs text-muted-foreground">
                        há {chip.dias_desde_recarga} dia{chip.dias_desde_recarga === 1 ? "" : "s"}
                      </p>
                    </>
                  ) : (
                    <span className="text-destructive">Nenhuma recarga registrada</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <AlertaRecargaBadge value={chip.nivel_alerta} />
                    {mensagem && (
                      <span title={mensagem}>
                        <AlertTriangle className="size-3.5 text-destructive" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm tabular-nums">{formatNumber(chip.incident_count)}</TableCell>
                <TableCell className="text-sm">
                  {chip.agente_nome ?? <span className="text-warning-foreground">Sem responsável</span>}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1.5">
                    <WhatsAppButton phone={chip.phone_number} showLabel={false} size="icon" />
                    <RegisterRechargeDialog
                      chipId={chip.id}
                      defaultCarrier={chip.carrier}
                      trigger={
                        <Button size="icon" variant="ghost" className="size-7">
                          <span className="sr-only">Registrar recarga</span>⚡
                        </Button>
                      }
                    />
                    <RegisterIncidentDialog
                      chipId={chip.id}
                      currentStatus={chip.status}
                      trigger={
                        <Button size="icon" variant="ghost" className="size-7 text-destructive">
                          <AlertTriangle className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ChipDetailDrawer
        chip={activeChip}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        agents={agents}
        fetchTimeline={fetchChipTimelineAction}
      />
    </div>
  );
}
