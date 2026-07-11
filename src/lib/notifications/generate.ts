import "server-only";
import { createClient } from "@/lib/supabase/server";
import { computeChip } from "@/lib/chip-alerts";
import { getChipThresholds } from "@/lib/data/chips";
import { formatBRL } from "@/lib/format";
import type { Chip, Notification, TipoNotificacao } from "@/lib/types";

async function hasRecentNotification(
  workspaceId: string,
  tipo: TipoNotificacao,
  link: string,
  hoursWindow = 20
) {
  const supabase = await createClient();
  const since = new Date(Date.now() - hoursWindow * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("tipo", tipo)
    .eq("link", link)
    .gte("created_at", since);
  return (count ?? 0) > 0;
}

async function pushNotification(
  workspaceId: string,
  tipo: TipoNotificacao,
  titulo: string,
  mensagem: string,
  link: string
) {
  const alreadySent = await hasRecentNotification(workspaceId, tipo, link);
  if (alreadySent) return;
  const supabase = await createClient();
  await supabase.from("notifications").insert({
    workspace_id: workspaceId,
    tipo,
    titulo,
    mensagem,
    link,
  } satisfies Partial<Notification>);
}

async function processChipNotifications(
  workspaceId: string,
  chip: Chip,
  thresholds: Awaited<ReturnType<typeof getChipThresholds>>
) {
  const computed = computeChip(chip, thresholds);
  const link = `/dashboard/chips`;

  if (computed.dias_desde_recarga !== null) {
    if (computed.nivel_alerta === "vermelho") {
      await pushNotification(
        workspaceId,
        "chip_alerta_30",
        "Chip crítico sem recarga",
        `Urgente: o chip ${chip.name} está há ${computed.dias_desde_recarga} dias sem recarga.`,
        link
      );
    } else if (computed.nivel_alerta === "amarelo") {
      await pushNotification(
        workspaceId,
        "chip_alerta_21",
        "Chip próximo do prazo de recarga",
        `Atenção: o chip ${chip.name} está há ${computed.dias_desde_recarga} dias sem recarga.`,
        link
      );
    }
  }

  if (chip.status === "bloqueado") {
    await pushNotification(
      workspaceId,
      "chip_bloqueado",
      "Chip bloqueado",
      `O número ${chip.name} foi marcado como bloqueado.`,
      link
    );
  }
  if (chip.status === "banido") {
    await pushNotification(
      workspaceId,
      "chip_banido",
      "Chip banido",
      `O número ${chip.name} foi marcado como banido.`,
      link
    );
  }
  if (chip.incident_count >= thresholds.max_incidentes_alerta) {
    await pushNotification(
      workspaceId,
      "chip_incidentes_repetidos",
      "Chip com incidentes repetidos",
      `O chip ${chip.name} já registrou ${chip.incident_count} incidentes.`,
      link
    );
  }
  if (!chip.assigned_agent_id) {
    await pushNotification(
      workspaceId,
      "chip_sem_responsavel",
      "Chip sem responsável",
      `O chip ${chip.name} não possui um atendente responsável.`,
      link
    );
  }
}

async function checkFollowUpsAndPayments(workspaceId: string) {
  const supabase = await createClient();

  const { count: followUpsAtrasados } = await supabase
    .from("follow_ups")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "pendente")
    .lt("data_agendada", new Date().toISOString());

  if ((followUpsAtrasados ?? 0) > 0) {
    await pushNotification(
      workspaceId,
      "follow_up_atrasado",
      "Follow-ups atrasados",
      `Você possui ${followUpsAtrasados} follow-up(s) atrasado(s).`,
      "/dashboard/follow-ups"
    );
  }

  const { data: pendentes } = await supabase
    .from("leads")
    .select("valor_esperado, valor_recebido")
    .eq("workspace_id", workspaceId)
    .in("status_pagamento", ["pix_enviado", "aguardando_pagamento", "pagamento_parcial"]);

  const valorPendente = (pendentes ?? []).reduce(
    (sum, l) => sum + Math.max(Number(l.valor_esperado ?? 0) - Number(l.valor_recebido ?? 0), 0),
    0
  );
  if (valorPendente > 0) {
    await pushNotification(
      workspaceId,
      "pagamento_pendente",
      "Pagamentos pendentes",
      `Existem ${formatBRL(valorPendente)} em pagamentos pendentes.`,
      "/dashboard/follow-ups"
    );
  }
}

/**
 * Gera notificações do sistema com base em regras de negócio.
 * Executado sob demanda (a cada carregamento da Visão Geral) já que o
 * ambiente não possui um worker agendado — usa uma janela de
 * deduplicação de ~20h por tipo+link para evitar spam de notificações.
 */
export async function generateSystemNotifications(workspaceId: string) {
  const supabase = await createClient();
  const thresholds = await getChipThresholds(workspaceId);

  const { data: chips } = await supabase
    .from("chips")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("archived", false);

  await Promise.all([
    ...((chips as Chip[]) ?? []).map((chip) => processChipNotifications(workspaceId, chip, thresholds)),
    checkFollowUpsAndPayments(workspaceId),
  ]);
}
