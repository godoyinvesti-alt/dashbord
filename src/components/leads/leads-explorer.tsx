"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, Trash2, ArrowRightLeft, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { TemperaturaBadge, StatusPagamentoBadge } from "@/components/leads/lead-badges";
import { LeadDetailDrawer } from "@/components/leads/lead-detail-drawer";
import { formatBRL, formatDate, formatPhoneDisplay, initials } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import { bulkDeleteLeadsAction, bulkUpdateLeadsStageAction } from "@/lib/actions/leads";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LeadRow } from "@/lib/data/leads";
import type { FunnelStage, Product, Campaign, Agent, Chip as ChipType } from "@/lib/types";

export function LeadsExplorer({
  leads,
  total,
  page,
  pageSize,
  totalPages,
  lookups,
}: {
  leads: LeadRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lookups: {
    funnelStages: FunnelStage[];
    products: Product[];
    campaigns: Campaign[];
    agents: Agent[];
    chips: ChipType[];
  };
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeLead, setActiveLead] = useState<LeadRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [moveStageId, setMoveStageId] = useState("");

  const allSelected = leads.length > 0 && selected.size === leads.length;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(leads.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function exportCsv() {
    const csv = toCsv(
      leads.map((l) => ({
        Nome: l.nome,
        WhatsApp: formatPhoneDisplay(l.whatsapp),
        "E-mail": l.email ?? "",
        "Data de entrada": formatDate(l.data_entrada),
        Produto: l.produto_nome ?? "",
        Origem: l.origem,
        Etapa: l.etapa_nome ?? "",
        Temperatura: l.temperatura,
        "Status de pagamento": l.status_pagamento,
        "Valor esperado": l.valor_esperado,
        "Valor recebido": l.valor_recebido,
        Atendente: l.agente_nome ?? "",
      }))
    );
    downloadCsv(`leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum lead encontrado"
        description="Ajuste os filtros ou cadastre um novo lead para começar a gerenciar sua operação."
      />
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
          <span className="text-xs font-medium">{selected.size} selecionado(s)</span>
          <Select value={moveStageId} onValueChange={setMoveStageId}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Mover para etapa..." />
            </SelectTrigger>
            <SelectContent>
              {lookups.funnelStages.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            disabled={!moveStageId || isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await bulkUpdateLeadsStageAction(Array.from(selected), moveStageId);
                if (result.error) toast.error(result.error);
                else {
                  toast.success("Leads movidos com sucesso.");
                  setSelected(new Set());
                }
              })
            }
            className="gap-1.5"
          >
            <ArrowRightLeft className="size-3.5" /> Mover
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="size-3.5" /> Excluir selecionados
              </Button>
            }
            title="Excluir leads selecionados"
            description={`Tem certeza que deseja excluir ${selected.size} lead(s)? Essa ação não pode ser desfeita.`}
            destructive
            confirmLabel="Excluir"
            onConfirm={async () => {
              const result = await bulkDeleteLeadsAction(Array.from(selected));
              if (result.error) toast.error(result.error);
              else {
                toast.success("Leads excluídos.");
                setSelected(new Set());
              }
            }}
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCsv}>
          <Download className="size-3.5" /> Exportar CSV
        </Button>
      </div>

      {/* Tabela — desktop */}
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-9">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Temperatura</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Valor esperado</TableHead>
              <TableHead>Atendente</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => {
                  setActiveLead(lead);
                  setDrawerOpen(true);
                }}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggleOne(lead.id)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-[11px] text-primary">
                        {initials(lead.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="max-w-40 truncate text-sm font-medium">{lead.nome}</p>
                      <p className="text-xs text-muted-foreground">{formatPhoneDisplay(lead.whatsapp)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{lead.produto_nome ?? "—"}</TableCell>
                <TableCell>
                  <span className="text-sm">{lead.etapa_nome ?? "—"}</span>
                </TableCell>
                <TableCell><TemperaturaBadge value={lead.temperatura} /></TableCell>
                <TableCell><StatusPagamentoBadge value={lead.status_pagamento} /></TableCell>
                <TableCell className="text-sm tabular-nums">{formatBRL(lead.valor_esperado)}</TableCell>
                <TableCell className="text-sm">{lead.agente_nome ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(lead.data_entrada)}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <WhatsAppButton phone={lead.whatsapp} showLabel={false} size="icon" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={pageSize} />
      </div>

      {/* Cards — mobile */}
      <div className="space-y-3 md:hidden">
        {leads.map((lead) => (
          <button
            key={lead.id}
            onClick={() => {
              setActiveLead(lead);
              setDrawerOpen(true);
            }}
            className="w-full rounded-xl border bg-card p-4 text-left shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {initials(lead.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{lead.nome}</p>
                  <p className="text-xs text-muted-foreground">{formatPhoneDisplay(lead.whatsapp)}</p>
                </div>
              </div>
              <WhatsAppButton phone={lead.whatsapp} showLabel={false} size="icon" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <TemperaturaBadge value={lead.temperatura} />
              <StatusPagamentoBadge value={lead.status_pagamento} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{lead.etapa_nome ?? "—"}</span>
              <span className="font-medium text-foreground">{formatBRL(lead.valor_esperado)}</span>
            </div>
          </button>
        ))}
        <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={pageSize} />
      </div>

      <LeadDetailDrawer
        lead={activeLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        lookups={lookups}
        onDeleted={() => setActiveLead(null)}
      />
    </div>
  );
}
