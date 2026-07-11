"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { RescheduleDialog } from "@/components/follow-ups/reschedule-dialog";
import { RegisterPaymentDialog } from "@/components/follow-ups/register-payment-dialog";
import { formatDateTime, formatPhoneDisplay } from "@/lib/format";
import { TIPO_FOLLOWUP_LABEL, STATUS_FOLLOWUP_LABEL, STATUS_FOLLOWUP_COLOR } from "@/lib/constants";
import { markFollowUpDoneAction, cancelFollowUpAction, registerResponseAction } from "@/lib/actions/follow-ups";
import type { FollowUpRow } from "@/lib/data/follow-ups";

export function FollowUpRowItem({ item }: { item: FollowUpRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{item.lead_nome}</p>
          <Badge variant="outline">{TIPO_FOLLOWUP_LABEL[item.tipo]}</Badge>
          <Badge variant={STATUS_FOLLOWUP_COLOR[item.status] as never}>
            {STATUS_FOLLOWUP_LABEL[item.status]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatPhoneDisplay(item.lead_whatsapp ?? "")} · {item.lead_produto ?? "Produto não definido"} · {item.lead_etapa ?? "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          Agendado para <span className="font-medium text-foreground">{formatDateTime(item.data_agendada)}</span>
          {item.agente_nome && <> · Atendente: {item.agente_nome}</>}
        </p>
        {item.observacoes && <p className="text-xs italic text-muted-foreground">&ldquo;{item.observacoes}&rdquo;</p>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <WhatsAppButton phone={item.lead_whatsapp ?? ""} size="sm" />
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await registerResponseAction(item.lead_id);
              if (result.error) toast.error(result.error);
              else toast.success("Resposta registrada.");
            })
          }
        >
          <MessageSquareText className="size-3.5" /> Registrar resposta
        </Button>
        <RegisterPaymentDialog leadId={item.lead_id} valorSugerido={0} />
        <RescheduleDialog followUpId={item.id} />
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-success hover:text-success"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await markFollowUpDoneAction(item.id);
              if (result.error) toast.error(result.error);
              else toast.success("Follow-up concluído.");
            })
          }
        >
          <CheckCircle2 className="size-3.5" /> Concluir
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await cancelFollowUpAction(item.id);
              if (result.error) toast.error(result.error);
              else toast.success("Follow-up cancelado.");
            })
          }
        >
          <XCircle className="size-3.5" /> Cancelar
        </Button>
      </div>
    </div>
  );
}
