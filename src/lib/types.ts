// Tipos de domínio do X1 Control

export type UUID = string;

export type LeadTemperatura = "frio" | "morno" | "quente" | "muito_quente";

export type StatusPagamento =
  | "nao_enviado"
  | "pix_enviado"
  | "aguardando_pagamento"
  | "pagamento_confirmado"
  | "pagamento_parcial"
  | "reembolsado"
  | "cancelado";

export type PapelUsuario =
  | "administrador"
  | "gestor"
  | "atendente"
  | "financeiro"
  | "visualizador";

export type StatusAgente = "ativo" | "inativo" | "ferias";

export type Operadora = "vivo" | "claro" | "tim" | "algar" | "outra";

export type StatusChip =
  | "ativo"
  | "em_aquecimento"
  | "bloqueado"
  | "banido"
  | "em_recuperacao"
  | "desativado";

export type TipoIncidenteChip =
  | "whatsapp_desconectado"
  | "whatsapp_bloqueado"
  | "whatsapp_banido"
  | "numero_sem_sinal"
  | "chip_desativado"
  | "problema_recarga"
  | "outro";

export type StatusProduto = "ativo" | "pausado" | "arquivado";

export type Plataforma =
  | "meta_ads"
  | "tiktok_ads"
  | "google_ads"
  | "organico"
  | "indicacao"
  | "outro";

export type TipoMeta =
  | "faturamento_diario"
  | "faturamento_semanal"
  | "faturamento_mensal"
  | "lucro"
  | "numero_vendas"
  | "ticket_medio"
  | "conversao"
  | "roas"
  | "custo_por_lead"
  | "custo_por_venda"
  | "upsells"
  | "receita_por_produto"
  | "receita_por_agente";

export type StatusMeta =
  | "acima_do_ritmo"
  | "dentro_do_ritmo"
  | "abaixo_do_ritmo"
  | "meta_atingida";

export type CategoriaDespesa =
  | "trafego_pago"
  | "ferramentas"
  | "funcionarios"
  | "comissoes"
  | "plataforma"
  | "reembolsos"
  | "outros";

export type TipoFollowUp =
  | "primeiro_contato"
  | "cobranca_pix"
  | "confirmacao_pagamento"
  | "entrega_produto"
  | "upsell"
  | "recompra"
  | "recuperacao"
  | "outro";

export type StatusFollowUp = "pendente" | "concluido" | "atrasado" | "cancelado";

export type StatusEntrega = "pendente" | "entregue" | "nao_aplicavel";
export type StatusReembolso = "nenhum" | "solicitado" | "reembolsado";

export interface Workspace {
  id: UUID;
  nome: string;
  slug: string;
  moeda: string;
  fuso_horario: string;
  logo_url: string | null;
  meta_faturamento_mensal: number;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID;
  papel: PapelUsuario;
  created_at: string;
}

export interface Profile {
  id: UUID;
  nome: string;
  email: string;
  telefone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FunnelStage {
  id: UUID;
  workspace_id: UUID;
  nome: string;
  ordem: number;
  cor: string;
  padrao: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID | null;
  nome: string;
  email: string;
  whatsapp: string | null;
  papel: PapelUsuario;
  status: StatusAgente;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: UUID;
  workspace_id: UUID;
  nome: string;
  categoria: string | null;
  descricao: string | null;
  preco_principal: number;
  custo: number;
  status: StatusProduto;
  link_entrega: string | null;
  upsells_relacionados: UUID[];
  order_bumps: UUID[];
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: UUID;
  workspace_id: UUID;
  plataforma: Plataforma;
  nome: string;
  data_inicio: string | null;
  data_fim: string | null;
  valor_investido: number;
  created_at: string;
  updated_at: string;
}

export interface AdSet {
  id: UUID;
  workspace_id: UUID;
  campaign_id: UUID;
  nome: string;
  valor_investido: number;
  created_at: string;
  updated_at: string;
}

export interface Creative {
  id: UUID;
  workspace_id: UUID;
  campaign_id: UUID;
  ad_set_id: UUID | null;
  nome: string;
  hook: string | null;
  url_preview: string | null;
  valor_investido: number;
  created_at: string;
  updated_at: string;
}

export interface Chip {
  id: UUID;
  workspace_id: UUID;
  name: string;
  phone_number: string;
  carrier: Operadora;
  activation_date: string | null;
  last_recharge_date: string | null;
  last_recharge_amount: number | null;
  incident_count: number;
  last_incident_date: string | null;
  last_incident_reason: string | null;
  status: StatusChip;
  assigned_agent_id: UUID | null;
  operation_name: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChipRecharge {
  id: UUID;
  workspace_id: UUID;
  chip_id: UUID;
  recharge_date: string;
  amount: number;
  carrier: Operadora;
  payment_method: string | null;
  notes: string | null;
  created_by: UUID | null;
  created_at: string;
}

export interface ChipIncident {
  id: UUID;
  workspace_id: UUID;
  chip_id: UUID;
  incident_type: TipoIncidenteChip;
  incident_date: string;
  reason: string | null;
  description: string | null;
  previous_status: StatusChip | null;
  new_status: StatusChip | null;
  action_taken: string | null;
  created_by: UUID | null;
  created_at: string;
}

export interface Lead {
  id: UUID;
  workspace_id: UUID;
  nome: string;
  whatsapp: string;
  email: string | null;
  data_entrada: string;
  produto_interesse_id: UUID | null;
  origem: Plataforma;
  campaign_id: UUID | null;
  ad_set_id: UUID | null;
  creative_id: UUID | null;
  agent_id: UUID | null;
  chip_id: UUID | null;
  funnel_stage_id: UUID;
  temperatura: LeadTemperatura;
  ultima_interacao: string | null;
  proximo_followup: string | null;
  valor_esperado: number;
  valor_recebido: number;
  forma_pagamento: string | null;
  status_pagamento: StatusPagamento;
  produto_entregue: boolean;
  upsell_oferecido: boolean;
  upsell_comprado: boolean;
  motivo_perda: string | null;
  observacoes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: UUID | null;
}

export interface LeadStatusHistory {
  id: UUID;
  workspace_id: UUID;
  lead_id: UUID;
  funnel_stage_id: UUID;
  funnel_stage_anterior_id: UUID | null;
  observacao: string | null;
  created_by: UUID | null;
  created_at: string;
}

export interface LeadNote {
  id: UUID;
  workspace_id: UUID;
  lead_id: UUID;
  conteudo: string;
  created_by: UUID | null;
  created_at: string;
}

export interface FollowUp {
  id: UUID;
  workspace_id: UUID;
  lead_id: UUID;
  agent_id: UUID | null;
  tipo: TipoFollowUp;
  data_agendada: string;
  status: StatusFollowUp;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: UUID | null;
}

export interface Sale {
  id: UUID;
  workspace_id: UUID;
  lead_id: UUID | null;
  cliente_nome: string;
  product_id: UUID;
  preco_original: number;
  valor_esperado: number;
  valor_recebido: number;
  desconto: number;
  forma_pagamento: string | null;
  data_pagamento: string | null;
  campaign_id: UUID | null;
  creative_id: UUID | null;
  agent_id: UUID | null;
  chip_id: UUID | null;
  upsell: boolean;
  status_reembolso: StatusReembolso;
  status_entrega: StatusEntrega;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: UUID | null;
}

export interface Payment {
  id: UUID;
  workspace_id: UUID;
  sale_id: UUID | null;
  lead_id: UUID | null;
  valor: number;
  metodo: string | null;
  status: StatusPagamento;
  data_pagamento: string | null;
  created_at: string;
}

export interface Expense {
  id: UUID;
  workspace_id: UUID;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  data: string;
  recorrente: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: UUID | null;
}

export interface Goal {
  id: UUID;
  workspace_id: UUID;
  tipo: TipoMeta;
  periodo_inicio: string;
  periodo_fim: string;
  valor_meta: number;
  produto_id: UUID | null;
  agent_id: UUID | null;
  created_at: string;
  updated_at: string;
}

export type TipoNotificacao =
  | "chip_alerta_21"
  | "chip_alerta_30"
  | "chip_critico"
  | "chip_bloqueado"
  | "chip_banido"
  | "chip_incidentes_repetidos"
  | "chip_sem_responsavel"
  | "meta_atrasada"
  | "follow_up_atrasado"
  | "pagamento_pendente"
  | "outro";

export interface Notification {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID | null;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link: string | null;
  created_at: string;
}

export interface Settings {
  id: UUID;
  workspace_id: UUID;
  aviso_recarga_dias: number;
  critico_recarga_dias: number;
  max_incidentes_alerta: number;
  operadora_padrao: Operadora;
  notificacoes_ativas: boolean;
  metodos_pagamento: string[];
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: UUID;
  workspace_id: UUID;
  user_id: UUID | null;
  acao: string;
  entidade: string;
  entidade_id: UUID | null;
  detalhes: Record<string, unknown> | null;
  created_at: string;
}

// ---- Tipos calculados / view models ----

export interface ChipComputed extends Chip {
  dias_desde_recarga: number | null;
  nivel_alerta: "verde" | "amarelo" | "vermelho" | "vermelho_escuro";
}

export interface DateRange {
  from: Date;
  to: Date;
}
