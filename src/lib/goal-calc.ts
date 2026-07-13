import { getDaysInMonth, getDate } from "date-fns";

export type StatusMeta = "acima_do_ritmo" | "dentro_do_ritmo" | "abaixo_do_ritmo" | "meta_atingida";

export interface MetaResultado {
  percentualConcluido: number;
  valorRestante: number;
  diasRestantesMes: number;
  mediaDiariaNecessaria: number;
  projecaoFimDoMes: number;
  status: StatusMeta;
}

export function calcularMeta(
  metaValor: number,
  valorAtual: number,
  dataReferencia: Date = new Date()
): MetaResultado {
  const totalDiasMes = getDaysInMonth(dataReferencia);
  const diaAtual = getDate(dataReferencia);
  const diasRestantesMes = Math.max(totalDiasMes - diaAtual, 0);

  const percentualConcluido = metaValor > 0 ? (valorAtual / metaValor) * 100 : 0;
  const valorRestante = Math.max(metaValor - valorAtual, 0);

  const mediaDiariaAtual = diaAtual > 0 ? valorAtual / diaAtual : 0;
  const projecaoFimDoMes = mediaDiariaAtual * totalDiasMes;

  const mediaDiariaNecessaria = diasRestantesMes > 0 ? valorRestante / diasRestantesMes : valorRestante;

  const esperadoAteHoje = (metaValor / totalDiasMes) * diaAtual;
  const diferenca = valorAtual - esperadoAteHoje;

  let status: StatusMeta;
  if (percentualConcluido >= 100) {
    status = "meta_atingida";
  } else if (diferenca > metaValor * 0.02) {
    status = "acima_do_ritmo";
  } else if (diferenca < -metaValor * 0.02) {
    status = "abaixo_do_ritmo";
  } else {
    status = "dentro_do_ritmo";
  }

  return {
    percentualConcluido,
    valorRestante,
    diasRestantesMes,
    mediaDiariaNecessaria,
    projecaoFimDoMes,
    status,
  };
}

export const STATUS_META_LABEL: Record<StatusMeta, string> = {
  acima_do_ritmo: "Acima do ritmo",
  dentro_do_ritmo: "Dentro do ritmo",
  abaixo_do_ritmo: "Abaixo do ritmo",
  meta_atingida: "Meta atingida",
};

export const STATUS_META_COLOR: Record<StatusMeta, string> = {
  acima_do_ritmo: "soft-success",
  dentro_do_ritmo: "soft-info",
  abaixo_do_ritmo: "soft-destructive",
  meta_atingida: "success",
};
