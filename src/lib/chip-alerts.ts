import { differenceInCalendarDays } from "date-fns";
import type { Chip, ChipComputed } from "./types";

export type NivelAlertaChip = "verde" | "amarelo" | "vermelho" | "vermelho_escuro";

export interface ChipAlertThresholds {
  aviso_recarga_dias: number;
  critico_recarga_dias: number;
}

export const DEFAULT_CHIP_ALERT_THRESHOLDS: ChipAlertThresholds = {
  aviso_recarga_dias: 21,
  critico_recarga_dias: 30,
};

/**
 * Calcula dias desde a última recarga usando o fuso America/Sao_Paulo.
 * A data "agora" já deve ser passada convertida para o fuso correto pelo chamador
 * quando necessário; aqui comparamos apenas datas de calendário.
 */
export function diasDesdeUltimaRecarga(
  lastRechargeDate: string | null,
  now: Date = new Date()
): number | null {
  if (!lastRechargeDate) return null;
  return differenceInCalendarDays(now, new Date(lastRechargeDate));
}

export function nivelAlertaChip(
  diasDesde: number | null,
  thresholds: ChipAlertThresholds = DEFAULT_CHIP_ALERT_THRESHOLDS
): NivelAlertaChip {
  if (diasDesde === null) return "vermelho_escuro";
  if (diasDesde > thresholds.critico_recarga_dias) return "vermelho";
  if (diasDesde >= thresholds.aviso_recarga_dias) return "amarelo";
  return "verde";
}

export function computeChip(
  chip: Chip,
  thresholds: ChipAlertThresholds = DEFAULT_CHIP_ALERT_THRESHOLDS,
  now: Date = new Date()
): ChipComputed {
  const dias = diasDesdeUltimaRecarga(chip.last_recharge_date, now);
  return {
    ...chip,
    dias_desde_recarga: dias,
    nivel_alerta: nivelAlertaChip(dias, thresholds),
  };
}

export function mensagemAlertaChip(chip: ChipComputed): string | null {
  if (chip.dias_desde_recarga === null) {
    return "Nenhuma recarga registrada. Classificado como prioridade alta.";
  }
  if (chip.nivel_alerta === "vermelho") {
    return `Chip há mais de ${DEFAULT_CHIP_ALERT_THRESHOLDS.critico_recarga_dias} dias sem recarga. Última recarga há ${chip.dias_desde_recarga} dias. Atenção: realize uma nova recarga para evitar o cancelamento da linha.`;
  }
  if (chip.nivel_alerta === "amarelo") {
    return `Última recarga há ${chip.dias_desde_recarga} dias. Programe uma recarga em breve.`;
  }
  return null;
}

export const NIVEL_ALERTA_LABEL: Record<NivelAlertaChip, string> = {
  verde: "Em dia",
  amarelo: "Atenção",
  vermelho: "Atrasado",
  vermelho_escuro: "Crítico",
};

export const NIVEL_ALERTA_BADGE_VARIANT: Record<NivelAlertaChip, string> = {
  verde: "soft-success",
  amarelo: "soft-warning",
  vermelho: "soft-destructive",
  vermelho_escuro: "destructive",
};

export const NIVEL_ALERTA_ROW_CLASS: Record<NivelAlertaChip, string> = {
  verde: "",
  amarelo: "bg-warning/5",
  vermelho: "bg-destructive/5",
  vermelho_escuro: "bg-destructive/10",
};
