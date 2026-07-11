"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap, AlertTriangle, History } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { StatusChipBadge, AlertaRecargaBadge } from "@/components/chips/chip-badges";
import { RegisterRechargeDialog } from "@/components/chips/recharge-dialog";
import { RegisterIncidentDialog } from "@/components/chips/incident-dialog";
import { ChipFormDialog } from "@/components/chips/chip-form-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatBRL, formatDate, formatDateTime, formatPhoneDisplay } from "@/lib/format";
import { mensagemAlertaChip } from "@/lib/chip-alerts";
import { OPERADORA_LABEL, TIPO_INCIDENTE_LABEL } from "@/lib/constants";
import type { ChipWithRelations, ChipTimelineEntry } from "@/lib/data/chips";
import type { Agent } from "@/lib/types";

export function ChipDetailDrawer({
  chip,
  open,
  onOpenChange,
  agents,
  fetchTimeline,
}: {
  chip: ChipWithRelations | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agents: Agent[];
  fetchTimeline: (chipId: string) => Promise<ChipTimelineEntry[]>;
}) {
  const [timeline, setTimeline] = useState<ChipTimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && chip) {
      setLoading(true);
      fetchTimeline(chip.id)
        .then(setTimeline)
        .finally(() => setLoading(false));
    }
  }, [open, chip, fetchTimeline]);

  if (!chip) return null;
  const alerta = mensagemAlertaChip(chip);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle>{chip.name}</SheetTitle>
              <SheetDescription>{formatPhoneDisplay(chip.phone_number)} · {OPERADORA_LABEL[chip.carrier]}</SheetDescription>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusChipBadge value={chip.status} />
              <AlertaRecargaBadge value={chip.nivel_alerta} />
            </div>
          </div>
          {alerta && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              <p>{alerta}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <WhatsAppButton phone={chip.phone_number} />
            <RegisterRechargeDialog chipId={chip.id} defaultCarrier={chip.carrier} />
            <RegisterIncidentDialog chipId={chip.id} currentStatus={chip.status} />
            <ChipFormDialog
              chip={chip}
              agents={agents}
              trigger={<Button size="sm" variant="outline">Editar</Button>}
            />
          </div>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(100svh - 260px)" }}>
          <div className="grid grid-cols-2 gap-3">
            <Info label="Responsável" value={chip.agente_nome ?? "Sem responsável"} />
            <Info label="Operação" value={chip.operation_name ?? "—"} />
            <Info label="Data de ativação" value={formatDate(chip.activation_date)} />
            <Info label="Última recarga" value={chip.last_recharge_date ? formatDate(chip.last_recharge_date) : "Nenhuma recarga registrada"} />
            <Info label="Valor da última recarga" value={chip.last_recharge_amount ? formatBRL(chip.last_recharge_amount) : "—"} />
            <Info label="Quedas registradas" value={String(chip.incident_count)} />
            <Info label="Último incidente" value={chip.last_incident_date ? formatDate(chip.last_incident_date) : "—"} />
            <Info label="Motivo do último incidente" value={chip.last_incident_reason ?? "—"} />
          </div>
          {chip.notes && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Observações</p>
              <p className="rounded-lg bg-muted/50 p-3 text-sm">{chip.notes}</p>
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <History className="size-3.5" /> Histórico
            </p>
            {loading ? (
              <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
            ) : timeline.length === 0 ? (
              <EmptyState icon={History} title="Sem histórico" description="Nenhuma recarga ou incidente registrado ainda." />
            ) : (
              <ol className="space-y-4 border-l pl-4">
                {timeline.map((entry) => (
                  <li key={`${entry.tipo}-${entry.id}`} className="relative">
                    <span
                      className={`absolute -left-[21px] top-1 flex size-4 items-center justify-center rounded-full ${
                        entry.tipo === "recarga" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {entry.tipo === "recarga" ? <Zap className="size-2.5" /> : <AlertTriangle className="size-2.5" />}
                    </span>
                    <p className="text-sm font-medium">
                      {entry.tipo === "recarga"
                        ? `Recarga registrada`
                        : TIPO_INCIDENTE_LABEL[entry.detalhe as keyof typeof TIPO_INCIDENTE_LABEL] ?? entry.detalhe}
                    </p>
                    {entry.extra && <p className="text-xs text-muted-foreground">{entry.extra}</p>}
                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.data)}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}
