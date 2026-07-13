import { differenceInCalendarDays, addDays } from "date-fns";
import type { Chip, ChipComputed, NivelAlertaChip } from "./types";

export interface ChipCalcSettings {
  dias_alerta_recarga: number;
  dias_aquecimento_padrao: number;
}

export const DEFAULT_CHIP_CALC_SETTINGS: ChipCalcSettings = {
  dias_alerta_recarga: 30,
  dias_aquecimento_padrao: 21,
};

export function diasDesdeRecarga(
  dataUltimaRecarga: string | null,
  now: Date = new Date()
): number | null {
  if (!dataUltimaRecarga) return null;
  return differenceInCalendarDays(now, new Date(dataUltimaRecarga));
}

export function diasAquecido(
  dataInicioAquecimento: string | null,
  now: Date = new Date()
): number | null {
  if (!dataInicioAquecimento) return null;
  return Math.max(differenceInCalendarDays(now, new Date(dataInicioAquecimento)), 0);
}

export function progressoAquecimento(
  dias: number | null,
  metaDias: number
): number | null {
  if (dias === null || metaDias <= 0) return null;
  return Math.min((dias / metaDias) * 100, 100);
}

export function proximaRecargaRecomendada(
  dataUltimaRecarga: string | null,
  diasAlertaRecarga: number
): string | null {
  if (!dataUltimaRecarga) return null;
  return addDays(new Date(dataUltimaRecarga), diasAlertaRecarga).toISOString();
}

export function nivelAlertaRecarga(
  dias: number | null,
  diasAlertaRecarga: number
): NivelAlertaChip {
  if (dias === null) return "vermelho_escuro";
  if (dias > diasAlertaRecarga) return "vermelho";
  if (dias >= diasAlertaRecarga - 9) return "amarelo";
  return "verde";
}

export function computeChip(
  chip: Chip,
  quantidadeBanimentos: number,
  settings: ChipCalcSettings = DEFAULT_CHIP_CALC_SETTINGS,
  now: Date = new Date()
): ChipComputed {
  const metaDias = chip.meta_dias_aquecimento || settings.dias_aquecimento_padrao;
  const diasQuente = diasAquecido(chip.data_inicio_aquecimento, now);
  const diasRecarga = diasDesdeRecarga(chip.data_ultima_recarga, now);

  return {
    ...chip,
    dias_aquecido: diasQuente,
    progresso_aquecimento: progressoAquecimento(diasQuente, metaDias),
    dias_desde_recarga: diasRecarga,
    proxima_recarga_recomendada: proximaRecargaRecomendada(
      chip.data_ultima_recarga,
      settings.dias_alerta_recarga
    ),
    nivel_alerta_recarga: nivelAlertaRecarga(diasRecarga, settings.dias_alerta_recarga),
    quantidade_banimentos: quantidadeBanimentos,
  };
}

export const NIVEL_ALERTA_LABEL: Record<NivelAlertaChip, string> = {
  verde: "Em dia",
  amarelo: "Atenção",
  vermelho: "Atrasado",
  vermelho_escuro: "Sem recarga",
};

export const NIVEL_ALERTA_BADGE_VARIANT: Record<NivelAlertaChip, string> = {
  verde: "soft-success",
  amarelo: "soft-warning",
  vermelho: "destructive",
  vermelho_escuro: "destructive",
};

export const NIVEL_ALERTA_ROW_CLASS: Record<NivelAlertaChip, string> = {
  verde: "",
  amarelo: "bg-warning/5",
  vermelho: "bg-destructive/5",
  vermelho_escuro: "bg-destructive/10",
};

export function mensagemAlertaRecarga(chip: ChipComputed): string | null {
  if (chip.dias_desde_recarga === null) {
    return "Nenhuma recarga registrada para este chip.";
  }
  if (chip.nivel_alerta_recarga === "vermelho") {
    return `Chip há mais de 30 dias sem recarga (última recarga há ${chip.dias_desde_recarga} dias).`;
  }
  if (chip.nivel_alerta_recarga === "amarelo") {
    return `Última recarga há ${chip.dias_desde_recarga} dias. Programe uma nova recarga em breve.`;
  }
  return null;
}
