"use client";

import { useState } from "react";
import { CalendarClock, AlarmClockOff, CalendarDays, MessageCircleOff, HandCoins, Gift, Repeat } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/dashboard/empty-state";
import { OpportunityPanel } from "@/components/follow-ups/opportunity-panel";
import { FollowUpRowItem } from "@/components/follow-ups/follow-up-row";
import { OpportunityRowItem } from "@/components/follow-ups/opportunity-row";
import type { FollowUpRow } from "@/lib/data/follow-ups";
import type { LeadOpportunityRow } from "@/lib/data/follow-up-center";

export function FollowUpCenter({
  hoje,
  atrasados,
  proximos,
  semResposta,
  pixSemPagamento,
  semUpsell,
  recompra,
  valorPotencial,
}: {
  hoje: FollowUpRow[];
  atrasados: FollowUpRow[];
  proximos: FollowUpRow[];
  semResposta: LeadOpportunityRow[];
  pixSemPagamento: LeadOpportunityRow[];
  semUpsell: LeadOpportunityRow[];
  recompra: LeadOpportunityRow[];
  valorPotencial: number;
}) {
  const [tab, setTab] = useState("hoje");

  return (
    <div className="space-y-6">
      <OpportunityPanel
        total={valorPotencial}
        onSelect={setTab}
        categorias={[
          { id: "atrasados", label: "Follow-ups atrasados", count: atrasados.length, icon: "clock" },
          { id: "pix", label: "PIX sem pagamento", count: pixSemPagamento.length, icon: "pix" },
          { id: "upsell", label: "Sem oferta de upsell", count: semUpsell.length, icon: "upsell" },
          { id: "recompra", label: "Aptos para recompra", count: recompra.length, icon: "recompra" },
          { id: "semresposta", label: "Leads sem resposta", count: semResposta.length, icon: "semresposta" },
        ]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="hoje" className="gap-1.5"><CalendarClock className="size-3.5" /> Hoje ({hoje.length})</TabsTrigger>
          <TabsTrigger value="atrasados" className="gap-1.5"><AlarmClockOff className="size-3.5" /> Atrasados ({atrasados.length})</TabsTrigger>
          <TabsTrigger value="proximos" className="gap-1.5"><CalendarDays className="size-3.5" /> Próximos ({proximos.length})</TabsTrigger>
          <TabsTrigger value="semresposta" className="gap-1.5"><MessageCircleOff className="size-3.5" /> Sem resposta ({semResposta.length})</TabsTrigger>
          <TabsTrigger value="pix" className="gap-1.5"><HandCoins className="size-3.5" /> PIX sem pagamento ({pixSemPagamento.length})</TabsTrigger>
          <TabsTrigger value="upsell" className="gap-1.5"><Gift className="size-3.5" /> Sem upsell ({semUpsell.length})</TabsTrigger>
          <TabsTrigger value="recompra" className="gap-1.5"><Repeat className="size-3.5" /> Recompra ({recompra.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje" className="space-y-2 pt-4">
          {hoje.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nenhum follow-up para hoje" description="Você está em dia com os follow-ups de hoje." />
          ) : (
            hoje.map((f) => <FollowUpRowItem key={f.id} item={f} />)
          )}
        </TabsContent>
        <TabsContent value="atrasados" className="space-y-2 pt-4">
          {atrasados.length === 0 ? (
            <EmptyState icon={AlarmClockOff} title="Nenhum follow-up atrasado" description="Ótimo trabalho mantendo tudo em dia!" />
          ) : (
            atrasados.map((f) => <FollowUpRowItem key={f.id} item={f} />)
          )}
        </TabsContent>
        <TabsContent value="proximos" className="space-y-2 pt-4">
          {proximos.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Nenhum follow-up agendado" description="Agende follow-ups a partir da página de Leads." />
          ) : (
            proximos.map((f) => <FollowUpRowItem key={f.id} item={f} />)
          )}
        </TabsContent>
        <TabsContent value="semresposta" className="space-y-2 pt-4">
          {semResposta.length === 0 ? (
            <EmptyState icon={MessageCircleOff} title="Nenhum lead sem resposta" description="Todos os leads já tiveram alguma interação registrada." />
          ) : (
            semResposta.map((l) => <OpportunityRowItem key={l.id} item={l} />)
          )}
        </TabsContent>
        <TabsContent value="pix" className="space-y-2 pt-4">
          {pixSemPagamento.length === 0 ? (
            <EmptyState icon={HandCoins} title="Nenhum PIX pendente" description="Todos os PIX enviados foram confirmados." />
          ) : (
            pixSemPagamento.map((l) => <OpportunityRowItem key={l.id} item={l} />)
          )}
        </TabsContent>
        <TabsContent value="upsell" className="space-y-2 pt-4">
          {semUpsell.length === 0 ? (
            <EmptyState icon={Gift} title="Nenhuma oportunidade de upsell" description="Todos os clientes já receberam uma oferta de upsell." />
          ) : (
            semUpsell.map((l) => <OpportunityRowItem key={l.id} item={l} />)
          )}
        </TabsContent>
        <TabsContent value="recompra" className="space-y-2 pt-4">
          {recompra.length === 0 ? (
            <EmptyState icon={Repeat} title="Nenhum cliente apto no momento" description="Clientes que já compraram aparecerão aqui como oportunidades de recompra." />
          ) : (
            recompra.map((l) => <OpportunityRowItem key={l.id} item={l} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
