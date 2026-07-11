export interface ReportColumn {
  key: string;
  label: string;
}
export interface ReportResult {
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
}

export type ReportId =
  | "vendas_diarias"
  | "vendas_semanais"
  | "vendas_mensais"
  | "vendas_por_produto"
  | "vendas_por_campanha"
  | "vendas_por_criativo"
  | "vendas_por_agente"
  | "vendas_por_chip"
  | "conversao_por_etapa"
  | "recuperacao_followup"
  | "pagamentos_pendentes"
  | "desempenho_upsell"
  | "ltv_cliente"
  | "chip_incidentes"
  | "chip_recargas"
  | "chip_saude";

export const REPORTS: { id: ReportId; label: string; grupo: string }[] = [
  { id: "vendas_diarias", label: "Vendas diárias", grupo: "Vendas" },
  { id: "vendas_semanais", label: "Vendas semanais", grupo: "Vendas" },
  { id: "vendas_mensais", label: "Vendas mensais", grupo: "Vendas" },
  { id: "vendas_por_produto", label: "Vendas por produto", grupo: "Vendas" },
  { id: "vendas_por_campanha", label: "Vendas por campanha", grupo: "Vendas" },
  { id: "vendas_por_criativo", label: "Vendas por criativo", grupo: "Vendas" },
  { id: "vendas_por_agente", label: "Vendas por atendente", grupo: "Vendas" },
  { id: "vendas_por_chip", label: "Vendas por chip", grupo: "Vendas" },
  { id: "conversao_por_etapa", label: "Conversão por etapa do funil", grupo: "Funil" },
  { id: "recuperacao_followup", label: "Recuperação por follow-up", grupo: "Follow-ups" },
  { id: "pagamentos_pendentes", label: "Pagamentos pendentes", grupo: "Financeiro" },
  { id: "desempenho_upsell", label: "Desempenho de upsell", grupo: "Vendas" },
  { id: "ltv_cliente", label: "Valor vitalício do cliente (LTV)", grupo: "Clientes" },
  { id: "chip_incidentes", label: "Incidentes de chips", grupo: "Chips" },
  { id: "chip_recargas", label: "Histórico de recargas", grupo: "Chips" },
  { id: "chip_saude", label: "Status de saúde dos chips", grupo: "Chips" },
];
