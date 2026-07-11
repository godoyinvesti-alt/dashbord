import type {
  LeadTemperatura,
  StatusPagamento,
  PapelUsuario,
  Operadora,
  StatusChip,
  TipoIncidenteChip,
  StatusProduto,
  Plataforma,
  TipoMeta,
  StatusMeta,
  CategoriaDespesa,
  TipoFollowUp,
  StatusFollowUp,
  StatusEntrega,
  StatusReembolso,
  StatusAgente,
} from "./types";

export const APP_NAME = "X1 Control";

export const LEAD_TEMPERATURA_LABEL: Record<LeadTemperatura, string> = {
  frio: "Frio",
  morno: "Morno",
  quente: "Quente",
  muito_quente: "Muito quente",
};

export const LEAD_TEMPERATURA_COLOR: Record<LeadTemperatura, string> = {
  frio: "soft-info",
  morno: "soft-warning",
  quente: "soft-destructive",
  muito_quente: "destructive",
};

export const STATUS_PAGAMENTO_LABEL: Record<StatusPagamento, string> = {
  nao_enviado: "Não enviado",
  pix_enviado: "PIX enviado",
  aguardando_pagamento: "Aguardando pagamento",
  pagamento_confirmado: "Pagamento confirmado",
  pagamento_parcial: "Pagamento parcial",
  reembolsado: "Reembolsado",
  cancelado: "Cancelado",
};

export const STATUS_PAGAMENTO_COLOR: Record<StatusPagamento, string> = {
  nao_enviado: "secondary",
  pix_enviado: "soft-info",
  aguardando_pagamento: "soft-warning",
  pagamento_confirmado: "soft-success",
  pagamento_parcial: "soft-warning",
  reembolsado: "soft-destructive",
  cancelado: "soft-destructive",
};

export const PAPEL_LABEL: Record<PapelUsuario, string> = {
  administrador: "Administrador",
  gestor: "Gestor",
  atendente: "Atendente",
  financeiro: "Financeiro",
  visualizador: "Visualizador",
};

export const STATUS_AGENTE_LABEL: Record<StatusAgente, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  ferias: "Férias",
};

export const OPERADORA_LABEL: Record<Operadora, string> = {
  vivo: "Vivo",
  claro: "Claro",
  tim: "TIM",
  algar: "Algar",
  outra: "Outra",
};

export const STATUS_CHIP_LABEL: Record<StatusChip, string> = {
  ativo: "Ativo",
  em_aquecimento: "Em aquecimento",
  bloqueado: "Bloqueado",
  banido: "Banido",
  em_recuperacao: "Em recuperação",
  desativado: "Desativado",
};

export const STATUS_CHIP_COLOR: Record<StatusChip, string> = {
  ativo: "soft-success",
  em_aquecimento: "soft-info",
  bloqueado: "soft-destructive",
  banido: "destructive",
  em_recuperacao: "soft-warning",
  desativado: "secondary",
};

export const TIPO_INCIDENTE_LABEL: Record<TipoIncidenteChip, string> = {
  whatsapp_desconectado: "WhatsApp desconectado",
  whatsapp_bloqueado: "WhatsApp bloqueado",
  whatsapp_banido: "WhatsApp banido",
  numero_sem_sinal: "Número sem sinal",
  chip_desativado: "Chip desativado",
  problema_recarga: "Problema com recarga",
  outro: "Outro",
};

export const STATUS_PRODUTO_LABEL: Record<StatusProduto, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  arquivado: "Arquivado",
};

export const STATUS_PRODUTO_COLOR: Record<StatusProduto, string> = {
  ativo: "soft-success",
  pausado: "soft-warning",
  arquivado: "secondary",
};

export const PLATAFORMA_LABEL: Record<Plataforma, string> = {
  meta_ads: "Meta Ads",
  tiktok_ads: "TikTok Ads",
  google_ads: "Google Ads",
  organico: "Orgânico",
  indicacao: "Indicação",
  outro: "Outro",
};

export const TIPO_META_LABEL: Record<TipoMeta, string> = {
  faturamento_diario: "Faturamento diário",
  faturamento_semanal: "Faturamento semanal",
  faturamento_mensal: "Faturamento mensal",
  lucro: "Lucro",
  numero_vendas: "Número de vendas",
  ticket_medio: "Ticket médio",
  conversao: "Conversão",
  roas: "ROAS",
  custo_por_lead: "Custo por lead",
  custo_por_venda: "Custo por venda",
  upsells: "Upsells",
  receita_por_produto: "Receita por produto",
  receita_por_agente: "Receita por agente",
};

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

export const CATEGORIA_DESPESA_LABEL: Record<CategoriaDespesa, string> = {
  trafego_pago: "Tráfego pago",
  ferramentas: "Ferramentas",
  funcionarios: "Funcionários",
  comissoes: "Comissões",
  plataforma: "Plataforma",
  reembolsos: "Reembolsos",
  outros: "Outros",
};

export const TIPO_FOLLOWUP_LABEL: Record<TipoFollowUp, string> = {
  primeiro_contato: "Primeiro contato",
  cobranca_pix: "Cobrança de PIX",
  confirmacao_pagamento: "Confirmação de pagamento",
  entrega_produto: "Entrega de produto",
  upsell: "Upsell",
  recompra: "Recompra",
  recuperacao: "Recuperação",
  outro: "Outro",
};

export const STATUS_FOLLOWUP_LABEL: Record<StatusFollowUp, string> = {
  pendente: "Pendente",
  concluido: "Concluído",
  atrasado: "Atrasado",
  cancelado: "Cancelado",
};

export const STATUS_FOLLOWUP_COLOR: Record<StatusFollowUp, string> = {
  pendente: "soft-info",
  concluido: "soft-success",
  atrasado: "soft-destructive",
  cancelado: "secondary",
};

export const STATUS_ENTREGA_LABEL: Record<StatusEntrega, string> = {
  pendente: "Pendente",
  entregue: "Entregue",
  nao_aplicavel: "Não aplicável",
};

export const STATUS_REEMBOLSO_LABEL: Record<StatusReembolso, string> = {
  nenhum: "Nenhum",
  solicitado: "Solicitado",
  reembolsado: "Reembolsado",
};

export const FUNIL_ETAPAS_PADRAO = [
  "Lead recebido",
  "Primeira mensagem enviada",
  "Lead respondeu",
  "Apresentação enviada",
  "Oferta apresentada",
  "PIX enviado",
  "Aguardando pagamento",
  "Pagamento confirmado",
  "Produto entregue",
  "Upsell oferecido",
  "Upsell comprado",
];

export const METODOS_PAGAMENTO_PADRAO = [
  "PIX",
  "Cartão de crédito",
  "Boleto",
  "Dinheiro",
  "Transferência",
];

export const NAV_SECOES = [
  { href: "/dashboard", label: "Visão Geral", icon: "LayoutDashboard" },
  { href: "/dashboard/leads", label: "Leads", icon: "Users" },
  { href: "/dashboard/funil", label: "Funil de Vendas", icon: "Filter" },
  { href: "/dashboard/vendas", label: "Vendas", icon: "ShoppingCart" },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: "CalendarClock" },
  { href: "/dashboard/produtos", label: "Produtos", icon: "Package" },
  { href: "/dashboard/campanhas", label: "Campanhas", icon: "Megaphone" },
  { href: "/dashboard/criativos", label: "Criativos", icon: "Image" },
  { href: "/dashboard/metas", label: "Metas", icon: "Target" },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: "Wallet" },
  { href: "/dashboard/chips", label: "Chips e Números", icon: "Smartphone" },
  { href: "/dashboard/atendentes", label: "Atendentes", icon: "UserCog" },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: "FileBarChart" },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: "Settings" },
] as const;

export const RECHARGE_WARNING_DAYS_DEFAULT = 21;
export const RECHARGE_CRITICAL_DAYS_DEFAULT = 30;
export const INCIDENT_ALERT_COUNT_DEFAULT = 3;
