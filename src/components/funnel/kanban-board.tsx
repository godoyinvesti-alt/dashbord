"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TemperaturaBadge, StatusPagamentoBadge } from "@/components/leads/lead-badges";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { formatBRL, formatRelative, initials } from "@/lib/format";
import { moveLeadStageAction } from "@/lib/actions/leads";
import { cn } from "@/lib/utils";
import type { FunnelStage } from "@/lib/types";
import type { LeadRow } from "@/lib/data/leads";

export function KanbanBoard({
  stages,
  initialLeads,
}: {
  stages: FunnelStage[];
  initialLeads: LeadRow[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const grouped = useMemo(() => {
    const map = new Map<string, LeadRow[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const lead of leads) {
      const arr = map.get(lead.funnel_stage_id);
      if (arr) arr.push(lead);
    }
    return map;
  }, [leads, stages]);

  const activeLead = leads.find((l) => l.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const newStageId = String(over.id);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.funnel_stage_id === newStageId) return;

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, funnel_stage_id: newStageId } : l))
    );

    startTransition(async () => {
      const result = await moveLeadStageAction(leadId, newStageId);
      if (result.error) {
        toast.error(result.error);
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, funnel_stage_id: lead.funnel_stage_id } : l))
        );
      }
    });
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {stages.map((stage) => (
          <KanbanColumn key={stage.id} stage={stage} leads={grouped.get(stage.id) ?? []} />
        ))}
      </div>
      <DragOverlay>
        {activeLead && <LeadCard lead={activeLead} dragging />}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ stage, leads }: { stage: FunnelStage; leads: LeadRow[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = leads.reduce((sum, l) => sum + Number(l.valor_esperado ?? 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors",
        isOver && "border-primary bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-2.5 rounded-t-xl">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2 shrink-0 rounded-full" style={{ background: stage.cor }} />
          <p className="truncate text-sm font-semibold">{stage.nome}</p>
        </div>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2 scrollbar-thin" style={{ maxHeight: "calc(100svh - 340px)", minHeight: 120 }}>
        {leads.map((lead) => (
          <DraggableLeadCard key={lead.id} lead={lead} />
        ))}
        {leads.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">Nenhum lead nesta etapa</p>
        )}
      </div>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        Total: <span className="font-medium text-foreground">{formatBRL(total)}</span>
      </div>
    </div>
  );
}

function DraggableLeadCard({ lead }: { lead: LeadRow }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="touch-none"
    >
      <LeadCard lead={lead} />
    </div>
  );
}

function LeadCard({ lead, dragging }: { lead: LeadRow; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "cursor-grab select-none space-y-2 rounded-lg border bg-card p-2.5 shadow-sm active:cursor-grabbing",
        dragging && "rotate-2 shadow-lg"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
              {initials(lead.nome)}
            </AvatarFallback>
          </Avatar>
          <p className="truncate text-xs font-medium">{lead.nome}</p>
        </div>
        <WhatsAppButton phone={lead.whatsapp} showLabel={false} size="icon" variant="ghost" className="size-6" />
      </div>
      <p className="text-[11px] text-muted-foreground">{lead.produto_nome ?? "Produto não definido"}</p>
      <div className="flex flex-wrap gap-1">
        <TemperaturaBadge value={lead.temperatura} />
        <StatusPagamentoBadge value={lead.status_pagamento} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{lead.agente_nome ?? "Sem atendente"}</span>
        <span className="font-medium text-foreground">{formatBRL(lead.valor_esperado)}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">Última interação: {formatRelative(lead.ultima_interacao)}</p>
    </div>
  );
}
