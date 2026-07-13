import "server-only";
import { startOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { computeChip } from "@/lib/chip-calc";
import { calcularMeta } from "@/lib/goal-calc";
import type { Chip, Settings, TipoAlerta } from "@/lib/types";

interface NovoAlerta {
  tipo: TipoAlerta;
  nivel: "informativo" | "atencao" | "importante" | "critico";
  titulo: string;
  mensagem: string;
  entidade_tipo?: string;
  entidade_id?: string;
  link?: string;
}

const REPEATED_BANS_THRESHOLD = 3;

export async function generateAlerts(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: settingsRow } = await supabase
    .from("settings")
    .select("*")
    .eq("owner_id", user.id)
    .single();
  const settings = settingsRow as Settings | null;
  if (!settings || !settings.notificacoes_ativas) return;

  const [{ data: chipsData }, { data: existingAlerts }, { data: banCounts }] = await Promise.all([
    supabase.from("chips").select("*"),
    supabase.from("alerts").select("tipo, entidade_id").eq("owner_id", user.id).eq("resolvido", false),
    supabase.from("chip_bans").select("chip_id"),
  ]);

  const chips = (chipsData as Chip[]) ?? [];
  const banCountByChip = new Map<string, number>();
  for (const row of (banCounts as { chip_id: string }[]) ?? []) {
    banCountByChip.set(row.chip_id, (banCountByChip.get(row.chip_id) ?? 0) + 1);
  }

  const open = new Set(
    ((existingAlerts as { tipo: string; entidade_id: string | null }[]) ?? []).map(
      (a) => `${a.tipo}:${a.entidade_id ?? ""}`
    )
  );

  const novos: NovoAlerta[] = [];

  for (const chip of chips) {
    const computed = computeChip(chip, banCountByChip.get(chip.id) ?? 0, {
      dias_alerta_recarga: settings.dias_alerta_recarga,
      dias_aquecimento_padrao: settings.dias_aquecimento_padrao,
    });

    if (
      computed.nivel_alerta_recarga === "vermelho" &&
      chip.status !== "inativo" &&
      chip.status !== "descartado" &&
      !open.has(`chip_sem_recarga:${chip.id}`)
    ) {
      novos.push({
        tipo: "chip_sem_recarga",
        nivel: "critico",
        titulo: `Chip ${chip.nome} sem recarga há mais de ${settings.dias_alerta_recarga} dias`,
        mensagem: `Última recarga há ${computed.dias_desde_recarga} dias. Registre uma nova recarga para evitar o cancelamento da linha.`,
        entidade_tipo: "chip",
        entidade_id: chip.id,
        link: `/dashboard/chips/${chip.id}`,
      });
    }

    if (
      chip.status === "em_aquecimento" &&
      computed.progresso_aquecimento !== null &&
      computed.progresso_aquecimento >= 100 &&
      !open.has(`chip_aquecimento_completo:${chip.id}`)
    ) {
      novos.push({
        tipo: "chip_aquecimento_completo",
        nivel: "informativo",
        titulo: `Aquecimento do chip ${chip.nome} concluído`,
        mensagem: `O chip atingiu a meta de ${chip.meta_dias_aquecimento} dias de aquecimento. Considere alterar o status para "Aquecido".`,
        entidade_tipo: "chip",
        entidade_id: chip.id,
        link: `/dashboard/chips/${chip.id}`,
      });
    }

    if (chip.status === "banido" && !open.has(`chip_banido:${chip.id}`)) {
      novos.push({
        tipo: "chip_banido",
        nivel: "importante",
        titulo: `Chip ${chip.nome} banido`,
        mensagem: "Verifique o histórico de banimentos e avalie a recuperação ou substituição do chip.",
        entidade_tipo: "chip",
        entidade_id: chip.id,
        link: `/dashboard/chips/${chip.id}`,
      });
    }

    const bans = banCountByChip.get(chip.id) ?? 0;
    if (bans >= REPEATED_BANS_THRESHOLD && !open.has(`chip_banimentos_repetidos:${chip.id}`)) {
      novos.push({
        tipo: "chip_banimentos_repetidos",
        nivel: "importante",
        titulo: `Chip ${chip.nome} com banimentos repetidos`,
        mensagem: `Este chip já foi banido ${bans} vezes. Avalie descartá-lo ou revisar o processo de aquecimento.`,
        entidade_tipo: "chip",
        entidade_id: chip.id,
        link: `/dashboard/chips/${chip.id}`,
      });
    }
  }

  const activeCount = chips.filter((c) => c.status === "ativo").length;
  if (activeCount < settings.minimo_chips_ativos && !open.has("chips_ativos_baixo:")) {
    novos.push({
      tipo: "chips_ativos_baixo",
      nivel: "atencao",
      titulo: "Número de chips ativos abaixo do mínimo",
      mensagem: `Você tem ${activeCount} chip(s) ativo(s), abaixo do mínimo configurado de ${settings.minimo_chips_ativos}.`,
      link: "/dashboard/chips",
    });
  }

  const mesAtual = startOfMonth(new Date()).toISOString().slice(0, 10);
  const [{ data: salesData }, { data: expensesData }, { data: goalRow }] = await Promise.all([
    supabase.from("sales").select("valor_recebido, taxas, reembolso").gte("data", mesAtual),
    supabase.from("expenses").select("valor").gte("data", mesAtual),
    supabase.from("goals").select("meta_faturamento").eq("mes", mesAtual).maybeSingle(),
  ]);
  const faturamentoMes = ((salesData as { valor_recebido: number }[]) ?? []).reduce(
    (sum, s) => sum + Number(s.valor_recebido),
    0
  );
  const despesasMes = ((expensesData as { valor: number }[]) ?? []).reduce(
    (sum, e) => sum + Number(e.valor),
    0
  );

  const metaFaturamento = (goalRow as { meta_faturamento: number } | null)?.meta_faturamento ?? 0;
  if (metaFaturamento > 0) {
    const resultado = calcularMeta(metaFaturamento, faturamentoMes);
    if (resultado.status === "abaixo_do_ritmo" && !open.has("meta_atrasada:")) {
      novos.push({
        tipo: "meta_atrasada",
        nivel: "atencao",
        titulo: "Meta de faturamento abaixo do ritmo esperado",
        mensagem: `O faturamento do mês está abaixo do ritmo necessário para atingir a meta de ${metaFaturamento}.`,
        link: "/dashboard/financeiro",
      });
    }
  }

  if (settings.limite_despesas_mensal && despesasMes > settings.limite_despesas_mensal && !open.has("despesas_acima_limite:")) {
    novos.push({
      tipo: "despesas_acima_limite",
      nivel: "importante",
      titulo: "Despesas do mês acima do limite configurado",
      mensagem: `As despesas já somam ${despesasMes.toFixed(2)}, acima do limite de ${settings.limite_despesas_mensal}.`,
      link: "/dashboard/financeiro",
    });
  }

  if (novos.length > 0) {
    await supabase.from("alerts").insert(
      novos.map((n) => ({
        owner_id: user.id,
        tipo: n.tipo,
        nivel: n.nivel,
        titulo: n.titulo,
        mensagem: n.mensagem,
        entidade_tipo: n.entidade_tipo ?? null,
        entidade_id: n.entidade_id ?? null,
        link: n.link ?? null,
      }))
    );
  }
}
