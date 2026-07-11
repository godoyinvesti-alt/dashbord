-- ============================================================================
-- X1 Control — Esquema inicial do banco de dados
-- ============================================================================
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tipos enumerados
-- ----------------------------------------------------------------------------
create type papel_usuario as enum ('administrador', 'gestor', 'atendente', 'financeiro', 'visualizador');
create type status_agente as enum ('ativo', 'inativo', 'ferias');
create type lead_temperatura as enum ('frio', 'morno', 'quente', 'muito_quente');
create type status_pagamento as enum (
  'nao_enviado', 'pix_enviado', 'aguardando_pagamento', 'pagamento_confirmado',
  'pagamento_parcial', 'reembolsado', 'cancelado'
);
create type operadora as enum ('vivo', 'claro', 'tim', 'algar', 'outra');
create type status_chip as enum ('ativo', 'em_aquecimento', 'bloqueado', 'banido', 'em_recuperacao', 'desativado');
create type tipo_incidente_chip as enum (
  'whatsapp_desconectado', 'whatsapp_bloqueado', 'whatsapp_banido',
  'numero_sem_sinal', 'chip_desativado', 'problema_recarga', 'outro'
);
create type status_produto as enum ('ativo', 'pausado', 'arquivado');
create type plataforma as enum ('meta_ads', 'tiktok_ads', 'google_ads', 'organico', 'indicacao', 'outro');
create type tipo_meta as enum (
  'faturamento_diario', 'faturamento_semanal', 'faturamento_mensal', 'lucro',
  'numero_vendas', 'ticket_medio', 'conversao', 'roas', 'custo_por_lead',
  'custo_por_venda', 'upsells', 'receita_por_produto', 'receita_por_agente'
);
create type categoria_despesa as enum (
  'trafego_pago', 'ferramentas', 'funcionarios', 'comissoes', 'plataforma', 'reembolsos', 'outros'
);
create type tipo_followup as enum (
  'primeiro_contato', 'cobranca_pix', 'confirmacao_pagamento', 'entrega_produto',
  'upsell', 'recompra', 'recuperacao', 'outro'
);
create type status_followup as enum ('pendente', 'concluido', 'atrasado', 'cancelado');
create type status_entrega as enum ('pendente', 'entregue', 'nao_aplicavel');
create type status_reembolso as enum ('nenhum', 'solicitado', 'reembolsado');
create type tipo_notificacao as enum (
  'chip_alerta_21', 'chip_alerta_30', 'chip_critico', 'chip_bloqueado', 'chip_banido',
  'chip_incidentes_repetidos', 'chip_sem_responsavel', 'meta_atrasada',
  'follow_up_atrasado', 'pagamento_pendente', 'outro'
);

-- ----------------------------------------------------------------------------
-- Função utilitária para updated_at
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- workspaces
-- ----------------------------------------------------------------------------
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  moeda text not null default 'BRL',
  fuso_horario text not null default 'America/Sao_Paulo',
  logo_url text,
  meta_faturamento_mensal numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_workspaces_updated_at before update on workspaces
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- profiles (espelha auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Cria o profile automaticamente quando um usuário se cadastra
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- workspace_members
-- ----------------------------------------------------------------------------
create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel papel_usuario not null default 'administrador',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

-- ----------------------------------------------------------------------------
-- funnel_stages
-- ----------------------------------------------------------------------------
create table funnel_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  nome text not null,
  ordem integer not null default 0,
  cor text not null default '#6366f1',
  padrao boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_funnel_stages_updated_at before update on funnel_stages
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- agents (atendentes)
-- ----------------------------------------------------------------------------
create table agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  nome text not null,
  email text not null,
  whatsapp text,
  papel papel_usuario not null default 'atendente',
  status status_agente not null default 'ativo',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_agents_updated_at before update on agents
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  nome text not null,
  categoria text,
  descricao text,
  preco_principal numeric(14,2) not null default 0,
  custo numeric(14,2) not null default 0,
  status status_produto not null default 'ativo',
  link_entrega text,
  upsells_relacionados uuid[] not null default '{}',
  order_bumps uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- campaigns / ad_sets / creatives
-- ----------------------------------------------------------------------------
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  plataforma plataforma not null default 'meta_ads',
  nome text not null,
  data_inicio date,
  data_fim date,
  valor_investido numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_campaigns_updated_at before update on campaigns
  for each row execute function set_updated_at();

create table ad_sets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  nome text not null,
  valor_investido numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_ad_sets_updated_at before update on ad_sets
  for each row execute function set_updated_at();

create table creatives (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  ad_set_id uuid references ad_sets(id) on delete set null,
  nome text not null,
  hook text,
  url_preview text,
  valor_investido numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_creatives_updated_at before update on creatives
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- chips e números
-- ----------------------------------------------------------------------------
create table chips (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  phone_number text not null,
  carrier operadora not null default 'vivo',
  activation_date date,
  last_recharge_date date,
  last_recharge_amount numeric(10,2),
  incident_count integer not null default 0,
  last_incident_date date,
  last_incident_reason text,
  status status_chip not null default 'em_aquecimento',
  assigned_agent_id uuid references agents(id) on delete set null,
  operation_name text,
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, phone_number)
);
create trigger trg_chips_updated_at before update on chips
  for each row execute function set_updated_at();

create table chip_recharges (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  chip_id uuid not null references chips(id) on delete cascade,
  recharge_date date not null default current_date,
  amount numeric(10,2) not null check (amount >= 0),
  carrier operadora not null,
  payment_method text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table chip_incidents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  chip_id uuid not null references chips(id) on delete cascade,
  incident_type tipo_incidente_chip not null,
  incident_date timestamptz not null default now(),
  reason text,
  description text,
  previous_status status_chip,
  new_status status_chip,
  action_taken text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- leads
-- ----------------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  nome text not null,
  whatsapp text not null,
  email text,
  data_entrada timestamptz not null default now(),
  produto_interesse_id uuid references products(id) on delete set null,
  origem plataforma not null default 'organico',
  campaign_id uuid references campaigns(id) on delete set null,
  ad_set_id uuid references ad_sets(id) on delete set null,
  creative_id uuid references creatives(id) on delete set null,
  agent_id uuid references agents(id) on delete set null,
  chip_id uuid references chips(id) on delete set null,
  funnel_stage_id uuid not null references funnel_stages(id),
  temperatura lead_temperatura not null default 'morno',
  ultima_interacao timestamptz,
  proximo_followup timestamptz,
  valor_esperado numeric(14,2) not null default 0,
  valor_recebido numeric(14,2) not null default 0,
  forma_pagamento text,
  status_pagamento status_pagamento not null default 'nao_enviado',
  produto_entregue boolean not null default false,
  upsell_oferecido boolean not null default false,
  upsell_comprado boolean not null default false,
  motivo_perda text,
  observacoes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
create trigger trg_leads_updated_at before update on leads
  for each row execute function set_updated_at();
create index idx_leads_workspace on leads(workspace_id);
create index idx_leads_stage on leads(funnel_stage_id);
create index idx_leads_agent on leads(agent_id);

create table lead_status_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  funnel_stage_id uuid not null references funnel_stages(id),
  funnel_stage_anterior_id uuid references funnel_stages(id),
  observacao text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table lead_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  conteudo text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table lead_tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  nome text not null,
  cor text not null default '#6366f1',
  created_at timestamptz not null default now(),
  unique (workspace_id, nome)
);

-- ----------------------------------------------------------------------------
-- follow_ups
-- ----------------------------------------------------------------------------
create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  agent_id uuid references agents(id) on delete set null,
  tipo tipo_followup not null default 'primeiro_contato',
  data_agendada timestamptz not null default now(),
  status status_followup not null default 'pendente',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
create trigger trg_follow_ups_updated_at before update on follow_ups
  for each row execute function set_updated_at();
create index idx_follow_ups_workspace on follow_ups(workspace_id);
create index idx_follow_ups_data on follow_ups(data_agendada);

-- ----------------------------------------------------------------------------
-- sales
-- ----------------------------------------------------------------------------
create table sales (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  cliente_nome text not null,
  product_id uuid not null references products(id),
  preco_original numeric(14,2) not null default 0,
  valor_esperado numeric(14,2) not null default 0,
  valor_recebido numeric(14,2) not null default 0 check (valor_recebido >= 0),
  contribuicao_adicional numeric(14,2) generated always as (valor_recebido - valor_esperado) stored,
  desconto numeric(14,2) not null default 0,
  forma_pagamento text,
  data_pagamento timestamptz,
  campaign_id uuid references campaigns(id) on delete set null,
  creative_id uuid references creatives(id) on delete set null,
  agent_id uuid references agents(id) on delete set null,
  chip_id uuid references chips(id) on delete set null,
  upsell boolean not null default false,
  status_reembolso status_reembolso not null default 'nenhum',
  status_entrega status_entrega not null default 'pendente',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
create trigger trg_sales_updated_at before update on sales
  for each row execute function set_updated_at();
create index idx_sales_workspace on sales(workspace_id);
create index idx_sales_data_pagamento on sales(data_pagamento);

create table payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  sale_id uuid references sales(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  valor numeric(14,2) not null default 0,
  metodo text,
  status status_pagamento not null default 'aguardando_pagamento',
  data_pagamento timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- expenses
-- ----------------------------------------------------------------------------
create table expenses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  descricao text not null,
  categoria categoria_despesa not null default 'outros',
  valor numeric(14,2) not null default 0,
  data date not null default current_date,
  recorrente boolean not null default false,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);
create trigger trg_expenses_updated_at before update on expenses
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- goals
-- ----------------------------------------------------------------------------
create table goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  tipo tipo_meta not null,
  periodo_inicio date not null,
  periodo_fim date not null,
  valor_meta numeric(14,2) not null default 0,
  produto_id uuid references products(id) on delete set null,
  agent_id uuid references agents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_goals_updated_at before update on goals
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  tipo tipo_notificacao not null default 'outro',
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);
create index idx_notifications_workspace on notifications(workspace_id);

-- ----------------------------------------------------------------------------
-- settings
-- ----------------------------------------------------------------------------
create table settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references workspaces(id) on delete cascade,
  aviso_recarga_dias integer not null default 21,
  critico_recarga_dias integer not null default 30,
  max_incidentes_alerta integer not null default 3,
  operadora_padrao operadora not null default 'vivo',
  notificacoes_ativas boolean not null default true,
  metodos_pagamento text[] not null default array['PIX','Cartão de crédito','Boleto','Dinheiro','Transferência'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated_at before update on settings
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- activity_logs
-- ----------------------------------------------------------------------------
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  acao text not null,
  entidade text not null,
  entidade_id uuid,
  detalhes jsonb,
  created_at timestamptz not null default now()
);
create index idx_activity_logs_workspace on activity_logs(workspace_id, created_at desc);
