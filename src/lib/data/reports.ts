import "server-only";
import { createClient } from "@/lib/supabase/server";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getFunnelMetrics } from "@/lib/data/funnel";
import { getChipThresholds } from "@/lib/data/chips";
import { computeChip } from "@/lib/chip-alerts";
import { formatBRL, formatDate, formatPercent } from "@/lib/format";
import { STATUS_CHIP_LABEL, STATUS_PAGAMENTO_LABEL, TIPO_INCIDENTE_LABEL, OPERADORA_LABEL } from "@/lib/constants";
import { NIVEL_ALERTA_LABEL } from "@/lib/chip-alerts";
import type { Chip } from "@/lib/types";
import type { ReportId, ReportResult } from "@/lib/reports-registry";

export async function getReport(workspaceId: string, id: ReportId): Promise<ReportResult> {
  const supabase = await createClient();

  switch (id) {
    case "vendas_diarias":
    case "vendas_semanais":
    case "vendas_mensais": {
      const { data } = await supabase
        .from("sales")
        .select("data_pagamento, valor_recebido")
        .eq("workspace_id", workspaceId)
        .not("data_pagamento", "is", null);

      const groupFn =
        id === "vendas_diarias"
          ? (d: Date) => format(d, "dd/MM/yyyy", { locale: ptBR })
          : id === "vendas_semanais"
          ? (d: Date) => `Semana de ${format(startOfWeek(d, { weekStartsOn: 1 }), "dd/MM/yyyy", { locale: ptBR })}`
          : (d: Date) => format(startOfMonth(d), "MMMM/yyyy", { locale: ptBR });

      const map = new Map<string, { vendas: number; faturamento: number }>();
      for (const s of data ?? []) {
        const key = groupFn(new Date(s.data_pagamento));
        const entry = map.get(key) ?? { vendas: 0, faturamento: 0 };
        entry.vendas += 1;
        entry.faturamento += Number(s.valor_recebido ?? 0);
        map.set(key, entry);
      }
      return {
        columns: [
          { key: "periodo", label: "Período" },
          { key: "vendas", label: "Vendas" },
          { key: "faturamento", label: "Faturamento" },
        ],
        rows: Array.from(map.entries()).map(([periodo, v]) => ({
          periodo,
          vendas: v.vendas,
          faturamento: formatBRL(v.faturamento),
        })),
      };
    }

    case "vendas_por_produto": {
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido, produto:products(nome)")
        .eq("workspace_id", workspaceId);
      return groupAndFormat(
        (data ?? []) as { valor_recebido: number; produto: { nome?: string } | null }[],
        (r) => r.produto?.nome ?? "Sem produto",
        (r) => Number(r.valor_recebido ?? 0),
        "Produto"
      );
    }

    case "vendas_por_campanha": {
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido, campanha:campaigns(nome)")
        .eq("workspace_id", workspaceId);
      return groupAndFormat(
        (data ?? []) as { valor_recebido: number; campanha: { nome?: string } | null }[],
        (r) => r.campanha?.nome ?? "Sem campanha",
        (r) => Number(r.valor_recebido ?? 0),
        "Campanha"
      );
    }

    case "vendas_por_criativo": {
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido, criativo:creatives(nome)")
        .eq("workspace_id", workspaceId);
      return groupAndFormat(
        (data ?? []) as { valor_recebido: number; criativo: { nome?: string } | null }[],
        (r) => r.criativo?.nome ?? "Sem criativo",
        (r) => Number(r.valor_recebido ?? 0),
        "Criativo"
      );
    }

    case "vendas_por_agente": {
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido, agente:agents(nome)")
        .eq("workspace_id", workspaceId);
      return groupAndFormat(
        (data ?? []) as { valor_recebido: number; agente: { nome?: string } | null }[],
        (r) => r.agente?.nome ?? "Sem atendente",
        (r) => Number(r.valor_recebido ?? 0),
        "Atendente"
      );
    }

    case "vendas_por_chip": {
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido, chip:chips(name)")
        .eq("workspace_id", workspaceId);
      return groupAndFormat(
        (data ?? []) as { valor_recebido: number; chip: { name?: string } | null }[],
        (r) => r.chip?.name ?? "Sem chip",
        (r) => Number(r.valor_recebido ?? 0),
        "Chip"
      );
    }

    case "conversao_por_etapa": {
      const metrics = await getFunnelMetrics(workspaceId);
      return {
        columns: [
          { key: "etapa", label: "Etapa" },
          { key: "leads", label: "Leads acumulados" },
          { key: "conversao", label: "Conversão para próxima etapa" },
          { key: "valor", label: "Valor na etapa" },
        ],
        rows: metrics.map((m) => ({
          etapa: m.stage.nome,
          leads: m.leadsAcumulados,
          conversao: m.taxaConversao !== null ? formatPercent(m.taxaConversao) : "—",
          valor: formatBRL(m.valorNaEtapa),
        })),
      };
    }

    case "recuperacao_followup": {
      const { data } = await supabase
        .from("follow_ups")
        .select("tipo, status")
        .eq("workspace_id", workspaceId);
      const rows = data ?? [];
      const byTipo = new Map<string, { total: number; concluidos: number }>();
      for (const f of rows) {
        const entry = byTipo.get(f.tipo) ?? { total: 0, concluidos: 0 };
        entry.total += 1;
        if (f.status === "concluido") entry.concluidos += 1;
        byTipo.set(f.tipo, entry);
      }
      return {
        columns: [
          { key: "tipo", label: "Tipo de follow-up" },
          { key: "total", label: "Total" },
          { key: "concluidos", label: "Concluídos" },
          { key: "taxa", label: "Taxa de recuperação" },
        ],
        rows: Array.from(byTipo.entries()).map(([tipo, v]) => ({
          tipo,
          total: v.total,
          concluidos: v.concluidos,
          taxa: formatPercent(v.total > 0 ? (v.concluidos / v.total) * 100 : 0),
        })),
      };
    }

    case "pagamentos_pendentes": {
      const { data } = await supabase
        .from("leads")
        .select("nome, whatsapp, valor_esperado, valor_recebido, status_pagamento")
        .eq("workspace_id", workspaceId)
        .in("status_pagamento", ["pix_enviado", "aguardando_pagamento", "pagamento_parcial"]);
      return {
        columns: [
          { key: "nome", label: "Lead" },
          { key: "whatsapp", label: "WhatsApp" },
          { key: "status", label: "Status" },
          { key: "pendente", label: "Valor pendente" },
        ],
        rows: (data ?? []).map((l) => ({
          nome: l.nome,
          whatsapp: l.whatsapp,
          status: STATUS_PAGAMENTO_LABEL[l.status_pagamento as keyof typeof STATUS_PAGAMENTO_LABEL],
          pendente: formatBRL(Math.max(Number(l.valor_esperado ?? 0) - Number(l.valor_recebido ?? 0), 0)),
        })),
      };
    }

    case "desempenho_upsell": {
      const { data } = await supabase
        .from("sales")
        .select("valor_recebido, upsell, produto:products(nome)")
        .eq("workspace_id", workspaceId)
        .eq("upsell", true);
      return groupAndFormat(
        (data ?? []) as { valor_recebido: number; produto: { nome?: string } | null }[],
        (r) => r.produto?.nome ?? "Sem produto",
        (r) => Number(r.valor_recebido ?? 0),
        "Produto (upsell)"
      );
    }

    case "ltv_cliente": {
      const { data } = await supabase
        .from("sales")
        .select("cliente_nome, valor_recebido")
        .eq("workspace_id", workspaceId);
      const map = new Map<string, { compras: number; total: number }>();
      for (const s of data ?? []) {
        const entry = map.get(s.cliente_nome) ?? { compras: 0, total: 0 };
        entry.compras += 1;
        entry.total += Number(s.valor_recebido ?? 0);
        map.set(s.cliente_nome, entry);
      }
      return {
        columns: [
          { key: "cliente", label: "Cliente" },
          { key: "compras", label: "Nº de compras" },
          { key: "ltv", label: "Valor total (LTV)" },
        ],
        rows: Array.from(map.entries())
          .sort((a, b) => b[1].total - a[1].total)
          .map(([cliente, v]) => ({ cliente, compras: v.compras, ltv: formatBRL(v.total) })),
      };
    }

    case "chip_incidentes": {
      const { data } = await supabase
        .from("chip_incidents")
        .select("incident_date, incident_type, reason, chip:chips(name)")
        .eq("workspace_id", workspaceId)
        .order("incident_date", { ascending: false });
      return {
        columns: [
          { key: "data", label: "Data" },
          { key: "chip", label: "Chip" },
          { key: "tipo", label: "Tipo" },
          { key: "motivo", label: "Motivo" },
        ],
        rows: ((data ?? []) as { incident_date: string; incident_type: string; reason: string | null; chip: { name?: string } | null }[]).map((i) => ({
          data: formatDate(i.incident_date),
          chip: i.chip?.name ?? "—",
          tipo: TIPO_INCIDENTE_LABEL[i.incident_type as keyof typeof TIPO_INCIDENTE_LABEL] ?? i.incident_type,
          motivo: i.reason ?? "—",
        })),
      };
    }

    case "chip_recargas": {
      const { data } = await supabase
        .from("chip_recharges")
        .select("recharge_date, amount, carrier, chip:chips(name)")
        .eq("workspace_id", workspaceId)
        .order("recharge_date", { ascending: false });
      return {
        columns: [
          { key: "data", label: "Data" },
          { key: "chip", label: "Chip" },
          { key: "operadora", label: "Operadora" },
          { key: "valor", label: "Valor" },
        ],
        rows: ((data ?? []) as { recharge_date: string; amount: number; carrier: string; chip: { name?: string } | null }[]).map((r) => ({
          data: formatDate(r.recharge_date),
          chip: r.chip?.name ?? "—",
          operadora: OPERADORA_LABEL[r.carrier as keyof typeof OPERADORA_LABEL],
          valor: formatBRL(r.amount),
        })),
      };
    }

    case "chip_saude": {
      const thresholds = await getChipThresholds(workspaceId);
      const { data } = await supabase.from("chips").select("*").eq("workspace_id", workspaceId).eq("archived", false);
      const chips = ((data as Chip[]) ?? []).map((c) => computeChip(c, thresholds));
      return {
        columns: [
          { key: "chip", label: "Chip" },
          { key: "status", label: "Status" },
          { key: "alerta", label: "Nível de alerta" },
          { key: "dias", label: "Dias sem recarga" },
          { key: "quedas", label: "Quedas" },
        ],
        rows: chips.map((c) => ({
          chip: c.name,
          status: STATUS_CHIP_LABEL[c.status],
          alerta: NIVEL_ALERTA_LABEL[c.nivel_alerta],
          dias: c.dias_desde_recarga ?? "Nunca recarregado",
          quedas: c.incident_count,
        })),
      };
    }

    default:
      return { columns: [], rows: [] };
  }
}

function groupAndFormat<T>(
  rows: T[],
  keyFn: (row: T) => string,
  valueFn: (row: T) => number,
  labelKey: string
): ReportResult {
  const map = new Map<string, { count: number; total: number }>();
  for (const r of rows) {
    const key = keyFn(r);
    const entry = map.get(key) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += valueFn(r);
    map.set(key, entry);
  }
  return {
    columns: [
      { key: "nome", label: labelKey },
      { key: "vendas", label: "Vendas" },
      { key: "faturamento", label: "Faturamento" },
    ],
    rows: Array.from(map.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([nome, v]) => ({ nome, vendas: v.count, faturamento: formatBRL(v.total) })),
  };
}
