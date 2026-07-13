import type {
  Operadora,
  StatusChip,
  TipoAtivoContingencia,
  StatusContingencia,
  CategoriaDespesa,
  NivelAlerta,
  TipoAlerta,
} from "./types";

export const APP_NAME = "Controle X1";

export const OPERADORA_LABEL: Record<Operadora, string> = {
  vivo: "Vivo",
  claro: "Claro",
  tim: "TIM",
  oi: "Oi",
  algar: "Algar",
  outra: "Outra",
};

export const STATUS_CHIP_LABEL: Record<StatusChip, string> = {
  novo: "Novo",
  em_aquecimento: "Em aquecimento",
  aquecido: "Aquecido",
  ativo: "Ativo",
  em_observacao: "Em observação",
  instavel: "Instável",
  banido: "Banido",
  em_recuperacao: "Em recuperação",
  inativo: "Inativo",
  descartado: "Descartado",
};

export const STATUS_CHIP_COLOR: Record<StatusChip, string> = {
  novo: "secondary",
  em_aquecimento: "soft-info",
  aquecido: "soft-success",
  ativo: "success",
  em_observacao: "soft-warning",
  instavel: "soft-warning",
  banido: "destructive",
  em_recuperacao: "soft-destructive",
  inativo: "secondary",
  descartado: "secondary",
};

export const STATUS_CHIP_OPCOES: StatusChip[] = [
  "novo",
  "em_aquecimento",
  "aquecido",
  "ativo",
  "em_observacao",
  "instavel",
  "banido",
  "em_recuperacao",
  "inativo",
  "descartado",
];

export const TIPO_ATIVO_LABEL: Record<TipoAtivoContingencia, string> = {
  chip: "Chip",
  whatsapp: "Número de WhatsApp",
  dispositivo: "Dispositivo",
  perfil_facebook: "Perfil do Facebook",
  business_manager: "Business Manager",
  conta_anuncio: "Conta de anúncio",
  pagina: "Página",
  pixel: "Pixel",
  dominio: "Domínio",
  conta_instagram: "Conta do Instagram",
  email: "E-mail",
};

export const TIPO_ATIVO_OPCOES: TipoAtivoContingencia[] = [
  "chip",
  "whatsapp",
  "dispositivo",
  "perfil_facebook",
  "business_manager",
  "conta_anuncio",
  "pagina",
  "pixel",
  "dominio",
  "conta_instagram",
  "email",
];

export const STATUS_CONTINGENCIA_LABEL: Record<StatusContingencia, string> = {
  disponivel: "Disponível",
  em_preparacao: "Em preparação",
  em_uso: "Em uso",
  em_observacao: "Em observação",
  restrito: "Restrito",
  banido: "Banido",
  inativo: "Inativo",
};

export const STATUS_CONTINGENCIA_COLOR: Record<StatusContingencia, string> = {
  disponivel: "soft-success",
  em_preparacao: "soft-info",
  em_uso: "success",
  em_observacao: "soft-warning",
  restrito: "soft-warning",
  banido: "destructive",
  inativo: "secondary",
};

export const STATUS_CONTINGENCIA_OPCOES: StatusContingencia[] = [
  "disponivel",
  "em_preparacao",
  "em_uso",
  "em_observacao",
  "restrito",
  "banido",
  "inativo",
];

export const CATEGORIA_DESPESA_LABEL: Record<CategoriaDespesa, string> = {
  trafego_pago: "Tráfego pago",
  ferramentas: "Ferramentas",
  chips: "Chips",
  recargas: "Recargas",
  funcionarios: "Funcionários",
  comissoes: "Comissões",
  outros: "Outros",
};

export const CATEGORIA_DESPESA_OPCOES: CategoriaDespesa[] = [
  "trafego_pago",
  "ferramentas",
  "chips",
  "recargas",
  "funcionarios",
  "comissoes",
  "outros",
];

export const NIVEL_ALERTA_LABEL: Record<NivelAlerta, string> = {
  informativo: "Informativo",
  atencao: "Atenção",
  importante: "Importante",
  critico: "Crítico",
};

export const NIVEL_ALERTA_COLOR: Record<NivelAlerta, string> = {
  informativo: "soft-info",
  atencao: "soft-warning",
  importante: "soft-destructive",
  critico: "destructive",
};

export const TIPO_ALERTA_LABEL: Record<TipoAlerta, string> = {
  chip_sem_recarga: "Chip sem recarga",
  chip_aquecimento_completo: "Aquecimento concluído",
  chip_banido: "Chip banido",
  chip_banimentos_repetidos: "Banimentos repetidos",
  chips_ativos_baixo: "Poucos chips ativos",
  meta_atrasada: "Meta atrasada",
  despesas_acima_limite: "Despesas acima do limite",
};

export const FORMAS_PAGAMENTO_PADRAO = [
  "PIX",
  "Cartão de crédito",
  "Cartão de débito",
  "Boleto",
  "Dinheiro",
  "Transferência",
  "Outro",
];

export const NAV_SECOES = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/chips", label: "Chips", icon: "Smartphone" },
  { href: "/dashboard/contingencia", label: "Contingência", icon: "ShieldCheck" },
  { href: "/dashboard/vendas", label: "Vendas", icon: "ShoppingCart" },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: "Wallet" },
  { href: "/dashboard/alertas", label: "Alertas", icon: "Bell" },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: "Settings" },
] as const;

export const RECHARGE_ALERT_DAYS_DEFAULT = 30;
export const WARMING_DAYS_DEFAULT = 21;
export const MIN_ACTIVE_CHIPS_DEFAULT = 3;
