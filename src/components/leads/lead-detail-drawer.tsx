"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Calendar,
  Tag as TagIcon,
  Pencil,
  Trash2,
  History,
  StickyNote,
  CalendarClock,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { TemperaturaBadge, StatusPagamentoBadge } from "@/components/leads/lead-badges";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { ScheduleFollowUpDialog } from "@/components/follow-ups/schedule-follow-up-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  formatBRL,
  formatDateTime,
  formatPhoneDisplay,
  formatRelative,
  initials,
} from "@/lib/format";
import { PLATAFORMA_LABEL } from "@/lib/constants";
import {
  addLeadNoteAction,
  deleteLeadAction,
  fetchLeadTimelineAction,
} from "@/lib/actions/leads";
import type { LeadRow } from "@/lib/data/leads";
import type { LeadNote, LeadStatusHistory, FollowUp } from "@/lib/types";
import type { FunnelStage, Product, Campaign, Agent, Chip as ChipType } from "@/lib/types";

export function LeadDetailDrawer({
  lead,
  open,
  onOpenChange,
  onDeleted,
  lookups,
}: {
  lead: LeadRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleted?: () => void;
  lookups: {
    funnelStages: FunnelStage[];
    products: Product[];
    campaigns: Campaign[];
    agents: Agent[];
    chips: ChipType[];
  };
}) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [history, setHistory] = useState<LeadStatusHistory[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && lead) {
      setLoading(true);
      fetchLeadTimelineAction(lead.id)
        .then((data) => {
          setNotes(data.notes);
          setHistory(data.history);
          setFollowUps(data.followUps);
        })
        .finally(() => setLoading(false));
    }
  }, [open, lead]);

  if (!lead) return null;

  function submitNote() {
    if (!noteText.trim() || !lead) return;
    startTransition(async () => {
      const result = await addLeadNoteAction(lead.id, noteText);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNoteText("");
      const data = await fetchLeadTimelineAction(lead.id);
      setNotes(data.notes);
      toast.success("Nota adicionada.");
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start gap-3">
            <Avatar className="size-11">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials(lead.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{lead.nome}</SheetTitle>
              <SheetDescription className="flex items-center gap-1.5">
                {formatPhoneDisplay(lead.whatsapp)}
              </SheetDescription>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <TemperaturaBadge value={lead.temperatura} />
                <StatusPagamentoBadge value={lead.status_pagamento} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <WhatsAppButton phone={lead.whatsapp} />
            <LeadFormDialog
              lead={lead}
              trigger={
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Pencil className="size-3.5" /> Editar
                </Button>
              }
              {...lookups}
            />
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="size-3.5" /> Excluir
                </Button>
              }
              title="Excluir lead"
              description={`Tem certeza que deseja excluir "${lead.nome}"? Essa ação não pode ser desfeita.`}
              destructive
              confirmLabel="Excluir"
              onConfirm={async () => {
                const result = await deleteLeadAction(lead.id);
                if (result.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Lead excluído.");
                onOpenChange(false);
                onDeleted?.();
              }}
            />
          </div>
        </SheetHeader>

        <Tabs defaultValue="geral" className="flex-1 overflow-hidden">
          <TabsList className="mx-4 mt-3 grid w-auto grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="historico">
              <History className="size-3.5" />
            </TabsTrigger>
            <TabsTrigger value="notas">
              <StickyNote className="size-3.5" />
            </TabsTrigger>
            <TabsTrigger value="followups">
              <CalendarClock className="size-3.5" />
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: "calc(100svh - 230px)" }}>
            <TabsContent value="geral" className="space-y-4 pt-4">
              <InfoGrid lead={lead} />
              {lead.observacoes && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Observações</p>
                  <p className="rounded-lg bg-muted/50 p-3 text-sm">{lead.observacoes}</p>
                </div>
              )}
              {lead.tags?.length > 0 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <TagIcon className="size-3" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.tags.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="historico" className="pt-4">
              {loading ? (
                <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
              ) : history.length === 0 ? (
                <EmptyState icon={History} title="Sem histórico" description="Nenhuma mudança de etapa registrada ainda." />
              ) : (
                <ol className="space-y-4 border-l pl-4">
                  {history.map((h) => (
                    <li key={h.id} className="relative">
                      <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
                      <p className="text-sm font-medium">
                        Movido para a etapa
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>

            <TabsContent value="notas" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Escreva uma nota interna sobre este lead..."
                  rows={3}
                />
                <Button size="sm" onClick={submitNote} disabled={isPending || !noteText.trim()}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Adicionar nota
                </Button>
              </div>
              <Separator />
              {loading ? (
                <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
              ) : notes.length === 0 ? (
                <EmptyState icon={StickyNote} title="Nenhuma nota" description="Adicione a primeira nota sobre este lead." />
              ) : (
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg border p-3 text-sm">
                      <p>{n.conteudo}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">{formatRelative(n.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="followups" className="space-y-3 pt-4">
              <ScheduleFollowUpDialog
                leadId={lead.id}
                onScheduled={() => {
                  fetchLeadTimelineAction(lead.id).then((data) => setFollowUps(data.followUps));
                }}
              />
              {loading ? (
                <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
              ) : followUps.length === 0 ? (
                <EmptyState icon={CalendarClock} title="Nenhum follow-up" description="Agende um follow-up para este lead na página Follow-ups." />
              ) : (
                <div className="space-y-2">
                  {followUps.map((f) => (
                    <div key={f.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-medium">{formatDateTime(f.data_agendada)}</p>
                        <p className="text-xs text-muted-foreground">{f.observacoes || "Sem observações"}</p>
                      </div>
                      <Badge variant="secondary">{f.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function InfoGrid({ lead }: { lead: LeadRow }) {
  const items = [
    { label: "E-mail", value: lead.email || "—", icon: Mail },
    { label: "Data de entrada", value: formatDateTime(lead.data_entrada), icon: Calendar },
    { label: "Origem", value: PLATAFORMA_LABEL[lead.origem], icon: Tag },
    { label: "Produto", value: lead.produto_nome || "—", icon: Tag },
    { label: "Campanha", value: lead.campanha_nome || "—", icon: Tag },
    { label: "Atendente", value: lead.agente_nome || "—", icon: Tag },
    { label: "Chip", value: lead.chip_nome || "—", icon: Tag },
    { label: "Etapa atual", value: lead.etapa_nome || "—", icon: Tag },
    { label: "Valor esperado", value: formatBRL(lead.valor_esperado), icon: Tag },
    { label: "Valor recebido", value: formatBRL(lead.valor_recebido), icon: Tag },
    { label: "Última interação", value: formatRelative(lead.ultima_interacao), icon: Tag },
    { label: "Próximo follow-up", value: formatDateTime(lead.proximo_followup), icon: Tag },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="truncate text-sm font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function Tag(props: React.SVGProps<SVGSVGElement>) {
  return <TagIcon {...props} />;
}
