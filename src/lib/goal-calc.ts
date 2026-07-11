import { getDaysInMonth, getDate, differenceInCalendarDays } from "date-fns";
import type { StatusMeta } from "./types";

export interface MetaMensalInput {
  metaValor: number;
  faturamentoAtual: number;
  dataReferencia: Date;
  faturamentoMedioDiario: number;
}

export interface MetaMensalResultado {
  percentualConcluido: number;
  valorRestante: number;
  diasRestantesMes: number;
  faturamentoEsperadoAteHoje: number;
  ritmoDiferenca: number;
  faturamentoDiarioNecessario: number;
  vendasDiariasNecessarias: number;
  projecaoConservadora: number;
  projecaoAtual: number;
  projecaoOtimista: number;
  status: StatusMeta;
}

export function calcularMetaMensal(
  input: MetaMensalInput,
  ticketMedio: number
): MetaMensalResultado {
  const { metaValor, faturamentoAtual, dataReferencia, faturamentoMedioDiario } = input;

  const totalDiasMes = getDaysInMonth(dataReferencia);
  const diaAtual = getDate(dataReferencia);
  const diasRestantesMes = Math.max(totalDiasMes - diaAtual, 0);

  const percentualConcluido = metaValor > 0 ? (faturamentoAtual / metaValor) * 100 : 0;
  const valorRestante = Math.max(metaValor - faturamentoAtual, 0);

  const faturamentoEsperadoAteHoje = (metaValor / totalDiasMes) * diaAtual;
  const ritmoDiferenca = faturamentoAtual - faturamentoEsperadoAteHoje;

  const faturamentoDiarioNecessario =
    diasRestantesMes > 0 ? valorRestante / diasRestantesMes : valorRestante > 0 ? valorRestante : 0;

  const vendasDiariasNecessarias =
    ticketMedio > 0 ? faturamentoDiarioNecessario / ticketMedio : 0;

  const projecaoAtual = faturamentoMedioDiario * totalDiasMes;
  const projecaoConservadora = faturamentoMedioDiario * 0.8 * totalDiasMes;
  const projecaoOtimista = faturamentoMedioDiario * 1.2 * totalDiasMes;

  let status: StatusMeta;
  if (percentualConcluido >= 100) {
    status = "meta_atingida";
  } else if (ritmoDiferenca > metaValor * 0.02) {
    status = "acima_do_ritmo";
  } else if (ritmoDiferenca < -metaValor * 0.02) {
    status = "abaixo_do_ritmo";
  } else {
    status = "dentro_do_ritmo";
  }

  return {
    percentualConcluido,
    valorRestante,
    diasRestantesMes,
    faturamentoEsperadoAteHoje,
    ritmoDiferenca,
    faturamentoDiarioNecessario,
    vendasDiariasNecessarias,
    projecaoConservadora,
    projecaoAtual,
    projecaoOtimista,
    status,
  };
}

export interface CalculadoraMetaInput {
  metaFaturamento: number;
  ticketMedio: number;
  taxaConversao: number; // percentual, ex: 3 = 3%
  custoMedioPorLead: number;
  diasDisponiveis: number;
  custoPrincipal?: number; // custo do produto, opcional para lucro
}

export interface CalculadoraMetaResultado {
  vendasNecessarias: number;
  leadsNecessarios: number;
  investimentoEstimado: number;
  vendasPorDia: number;
  leadsPorDia: number;
  faturamentoPorDia: number;
  lucroEstimado: number;
}

export function calcularMetaReversa(
  input: CalculadoraMetaInput
): CalculadoraMetaResultado {
  const {
    metaFaturamento,
    ticketMedio,
    taxaConversao,
    custoMedioPorLead,
    diasDisponiveis,
    custoPrincipal = 0,
  } = input;

  const vendasNecessarias = ticketMedio > 0 ? metaFaturamento / ticketMedio : 0;
  const conversaoDecimal = taxaConversao / 100;
  const leadsNecessarios = conversaoDecimal > 0 ? vendasNecessarias / conversaoDecimal : 0;
  const investimentoEstimado = leadsNecessarios * custoMedioPorLead;

  const dias = diasDisponiveis > 0 ? diasDisponiveis : 1;
  const vendasPorDia = vendasNecessarias / dias;
  const leadsPorDia = leadsNecessarios / dias;
  const faturamentoPorDia = metaFaturamento / dias;

  const custoTotalProduto = vendasNecessarias * custoPrincipal;
  const lucroEstimado = metaFaturamento - investimentoEstimado - custoTotalProduto;

  return {
    vendasNecessarias,
    leadsNecessarios,
    investimentoEstimado,
    vendasPorDia,
    leadsPorDia,
    faturamentoPorDia,
    lucroEstimado,
  };
}

export function calcularStatusMetaGenerica(
  valorAtual: number,
  valorMeta: number,
  periodoInicio: Date,
  periodoFim: Date,
  dataReferencia: Date = new Date()
): { percentual: number; status: StatusMeta; restante: number } {
  const percentual = valorMeta > 0 ? (valorAtual / valorMeta) * 100 : 0;
  const restante = Math.max(valorMeta - valorAtual, 0);

  const totalDias = Math.max(differenceInCalendarDays(periodoFim, periodoInicio), 1);
  const diasDecorridos = Math.min(
    Math.max(differenceInCalendarDays(dataReferencia, periodoInicio), 0),
    totalDias
  );
  const esperado = (valorMeta / totalDias) * diasDecorridos;
  const diferenca = valorAtual - esperado;

  let status: StatusMeta;
  if (percentual >= 100) status = "meta_atingida";
  else if (diferenca > valorMeta * 0.02) status = "acima_do_ritmo";
  else if (diferenca < -valorMeta * 0.02) status = "abaixo_do_ritmo";
  else status = "dentro_do_ritmo";

  return { percentual, status, restante };
}
