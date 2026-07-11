"use client";

import { toast } from "sonner";
import { Pencil, Trash2, UserCog } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AgentFormDialog } from "@/components/agents/agent-form-dialog";
import { formatBRL, formatNumber, formatPercent, initials } from "@/lib/format";
import { PAPEL_LABEL, STATUS_AGENTE_LABEL } from "@/lib/constants";
import { deleteAgentAction } from "@/lib/actions/agents";
import type { AgentRow } from "@/lib/data/agents";

export function AgentsGrid({ agents }: { agents: AgentRow[] }) {
  if (agents.length === 0) {
    return (
      <EmptyState
        icon={UserCog}
        title="Nenhum atendente cadastrado"
        description="Adicione os membros da sua equipe para acompanhar o desempenho individual."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <Card key={agent.id} className="py-5">
          <CardHeader className="flex-row items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/10 text-primary">{initials(agent.nome)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{agent.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{agent.email}</p>
              </div>
            </div>
            <Badge variant={agent.status === "ativo" ? "soft-success" : "secondary"}>
              {STATUS_AGENTE_LABEL[agent.status]}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="outline">{PAPEL_LABEL[agent.papel]}</Badge>
            <Separator />
            <div className="grid grid-cols-3 gap-2 text-center">
              <Metric label="Chips" value={formatNumber(agent.chipsAtribuidos)} />
              <Metric label="Leads" value={formatNumber(agent.leadsAtribuidos)} />
              <Metric label="Vendas" value={formatNumber(agent.vendas)} />
              <Metric label="Faturamento" value={formatBRL(agent.faturamento)} />
              <Metric label="Conversão" value={formatPercent(agent.taxaConversao)} />
              <Metric
                label="Tempo resp."
                value={agent.tempoMedioRespostaHoras !== null ? `${formatNumber(agent.tempoMedioRespostaHoras, 1)}h` : "—"}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {formatNumber(agent.followUpsConcluidos)} follow-ups concluídos
            </p>
            <div className="flex justify-between gap-2 pt-1">
              <AgentFormDialog
                agent={agent}
                trigger={
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5">
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                }
              />
              <ConfirmDialog
                trigger={
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                }
                title="Remover atendente"
                description={`Remover "${agent.nome}"? Atendentes vinculados a leads, vendas ou chips não podem ser removidos.`}
                destructive
                confirmLabel="Remover"
                onConfirm={async () => {
                  const result = await deleteAgentAction(agent.id);
                  if (result.error) toast.error(result.error);
                  else toast.success("Atendente removido.");
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}
