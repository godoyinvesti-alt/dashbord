"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppButton } from "@/components/leads/whatsapp-button";
import { RegisterPaymentDialog } from "@/components/follow-ups/register-payment-dialog";
import { formatBRL, formatPhoneDisplay, formatRelative } from "@/lib/format";
import { registerResponseAction } from "@/lib/actions/follow-ups";
import type { LeadOpportunityRow } from "@/lib/data/follow-up-center";

export function OpportunityRowItem({ item }: { item: LeadOpportunityRow }) {
  const [isPending, startTransition] = useTransition();
  const pendente = Math.max(item.valor_esperado - item.valor_recebido, 0);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{item.nome}</p>
          {pendente > 0 && <Badge variant="soft-warning">{formatBRL(pendente)} em aberto</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatPhoneDisplay(item.whatsapp)} · {item.produto_nome ?? "Produto não definido"}
        </p>
        <p className="text-xs text-muted-foreground">
          Última interação: {formatRelative(item.ultima_interacao)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <WhatsAppButton phone={item.whatsapp} size="sm" />
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await registerResponseAction(item.id);
              if (result.error) toast.error(result.error);
              else toast.success("Resposta registrada.");
            })
          }
        >
          <MessageSquareText className="size-3.5" /> Registrar resposta
        </Button>
        <RegisterPaymentDialog leadId={item.id} valorSugerido={pendente || item.valor_esperado} />
      </div>
    </div>
  );
}
