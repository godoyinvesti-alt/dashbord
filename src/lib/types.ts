// Tipos de domínio do Controle X1

export type UUID = string;

export type Operadora = "vivo" | "claro" | "tim" | "oi" | "algar" | "outra";

export type StatusChip =
  | "novo"
  | "em_aquecimento"
  | "aquecido"
  | "ativo"
  | "em_observacao"
  | "instavel"
  | "banido"
  | "em_recuperacao"
  | "inativo"
  | "descartado";

export type TipoAtivoContingencia =
  | "chip"
  | "whatsapp"
  | "dispositivo"
  | "perfil_facebook"
  | "business_manager"
  | "conta_anuncio"
  | "pagina"
  | "pixel"
  | "dominio"
  | "conta_instagram"
  | "email";

export type StatusContingencia =
  | "disponivel"
  | "em_preparacao"
  | "em_uso"
  | "em_observacao"
  | "restrito"
  | "banido"
  | "inativo";

export type CategoriaDespesa =
  | "trafego_pago"
  | "ferramentas"
  | "chips"
  | "recargas"
  | "funcionarios"
  | "comissoes"
  | "outros";

export type NivelAlerta = "informativo" | "atencao" | "importante" | "critico";

export type TipoAlerta =
  | "chip_sem_recarga"
  | "chip_aquecimento_completo"
  | "chip_banido"
  | "chip_banimentos_repetidos"
  | "chips_ativos_baixo"
  | "meta_atrasada"
  | "despesas_acima_limite";

export interface Profile {
  id: UUID;
  nome: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: UUID;
  owner_id: UUID;
  nome_negocio: string;
  tema: "light" | "dark" | "system";
  dias_aquecimento_padrao: number;
  dias_alerta_recarga: number;
  minimo_chips_ativos: number;
  limite_despesas_mensal: number | null;
  notificacoes_ativas: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chip {
  id: UUID;
  owner_id: UUID;
  nome: string;
  numero: string;
  operadora: Operadora;
  data_ativacao: string | null;
  data_inicio_aquecimento: string | null;
  meta_dias_aquecimento: number;
  data_ultima_recarga: string | null;
  valor_ultima_recarga: number | null;
  quantidade_quedas: number;
  status: StatusChip;
  responsavel: string | null;
  operacao_vinculada: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChipRecharge {
  id: UUID;
  owner_id: UUID;
  chip_id: UUID;
  data: string;
  valor: number;
  observacoes: string | null;
  created_at: string;
}

export interface ChipBan {
  id: UUID;
  owner_id: UUID;
  chip_id: UUID;
  data: string;
  motivo: string | null;
  plataforma: string | null;
  foi_recuperado: boolean;
  data_recuperacao: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChipStatusHistory {
  id: UUID;
  owner_id: UUID;
  chip_id: UUID;
  status_anterior: StatusChip | null;
  status_novo: StatusChip;
  observacao: string | null;
  created_at: string;
}

export interface ContingencyAsset {
  id: UUID;
  owner_id: UUID;
  nome: string;
  tipo: TipoAtivoContingencia;
  identificador: string | null;
  status: StatusContingencia;
  responsavel: string | null;
  data_ativacao: string | null;
  operacao_vinculada: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: UUID;
  owner_id: UUID;
  data: string;
  valor_recebido: number;
  produto: string;
  cliente: string | null;
  chip_id: UUID | null;
  vendedor: string | null;
  origem_lead: string | null;
  forma_pagamento: string | null;
  taxas: number;
  reembolso: number;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: UUID;
  owner_id: UUID;
  descricao: string;
  valor: number;
  categoria: CategoriaDespesa;
  data: string;
  operacao_vinculada: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: UUID;
  owner_id: UUID;
  mes: string;
  meta_faturamento: number;
  meta_lucro: number;
  meta_vendas: number;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: UUID;
  owner_id: UUID;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  titulo: string;
  mensagem: string;
  entidade_tipo: string | null;
  entidade_id: UUID | null;
  link: string | null;
  lido: boolean;
  resolvido: boolean;
  created_at: string;
}

// ---- Tipos calculados / view models ----

export type NivelAlertaChip = "verde" | "amarelo" | "vermelho" | "vermelho_escuro";

export interface ChipComputed extends Chip {
  dias_aquecido: number | null;
  progresso_aquecimento: number | null;
  dias_desde_recarga: number | null;
  proxima_recarga_recomendada: string | null;
  nivel_alerta_recarga: NivelAlertaChip;
  quantidade_banimentos: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}
