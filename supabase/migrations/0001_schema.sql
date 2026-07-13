-- ============================================================================
-- Controle X1 — Esquema inicial do banco de dados
-- ============================================================================
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tipos enumerados
-- ----------------------------------------------------------------------------
create type operadora as enum ('vivo', 'claro', 'tim', 'oi', 'algar', 'outra');

create type status_chip as enum (
  'novo', 'em_aquecimento', 'aquecido', 'ativo', 'em_observacao',
  'instavel', 'banido', 'em_recuperacao', 'inativo', 'descartado'
);

create type tipo_ativo_contingencia as enum (
  'chip', 'whatsapp', 'dispositivo', 'perfil_facebook', 'business_manager',
  'conta_anuncio', 'pagina', 'pixel', 'dominio', 'conta_instagram', 'email'
);

create type status_contingencia as enum (
  'disponivel', 'em_preparacao', 'em_uso', 'em_observacao', 'restrito', 'banido', 'inativo'
);

create type categoria_despesa as enum (
  'trafego_pago', 'ferramentas', 'chips', 'recargas', 'funcionarios', 'comissoes', 'outros'
);

create type nivel_alerta as enum ('informativo', 'atencao', 'importante', 'critico');

create type tipo_alerta as enum (
  'chip_sem_recarga', 'chip_aquecimento_completo', 'chip_banido',
  'chip_banimentos_repetidos', 'chips_ativos_baixo', 'meta_atrasada',
  'despesas_acima_limite'
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
-- profiles (espelha auth.users)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- settings (uma linha por usuário)
-- ----------------------------------------------------------------------------
create table settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  nome_negocio text not null default 'Meu negócio',
  tema text not null default 'system',
  dias_aquecimento_padrao integer not null default 21,
  dias_alerta_recarga integer not null default 30,
  minimo_chips_ativos integer not null default 3,
  limite_despesas_mensal numeric(14,2),
  notificacoes_ativas boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated_at before update on settings
  for each row execute function set_updated_at();

-- Cria profile + settings automaticamente quando um usuário se cadastra
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)), new.email);

  insert into public.settings (owner_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- chips
-- ----------------------------------------------------------------------------
create table chips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  numero text not null,
  operadora operadora not null default 'vivo',
  data_ativacao date,
  data_inicio_aquecimento date,
  meta_dias_aquecimento integer not null default 21,
  data_ultima_recarga date,
  valor_ultima_recarga numeric(10,2),
  quantidade_quedas integer not null default 0,
  status status_chip not null default 'novo',
  responsavel text,
  operacao_vinculada text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_chips_updated_at before update on chips
  for each row execute function set_updated_at();
create index idx_chips_owner on chips(owner_id);
create index idx_chips_status on chips(owner_id, status);

create table chip_recharges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  chip_id uuid not null references chips(id) on delete cascade,
  data date not null default current_date,
  valor numeric(10,2) not null default 0 check (valor >= 0),
  observacoes text,
  created_at timestamptz not null default now()
);
create index idx_chip_recharges_chip on chip_recharges(chip_id, data desc);

create table chip_bans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  chip_id uuid not null references chips(id) on delete cascade,
  data date not null default current_date,
  motivo text,
  plataforma text,
  foi_recuperado boolean not null default false,
  data_recuperacao date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_chip_bans_updated_at before update on chip_bans
  for each row execute function set_updated_at();
create index idx_chip_bans_chip on chip_bans(chip_id, data desc);

create table chip_status_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  chip_id uuid not null references chips(id) on delete cascade,
  status_anterior status_chip,
  status_novo status_chip not null,
  observacao text,
  created_at timestamptz not null default now()
);
create index idx_chip_status_history_chip on chip_status_history(chip_id, created_at desc);

-- ----------------------------------------------------------------------------
-- contingency_assets
-- ----------------------------------------------------------------------------
create table contingency_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tipo tipo_ativo_contingencia not null,
  identificador text,
  status status_contingencia not null default 'disponivel',
  responsavel text,
  data_ativacao date,
  operacao_vinculada text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_contingency_assets_updated_at before update on contingency_assets
  for each row execute function set_updated_at();
create index idx_contingency_assets_owner on contingency_assets(owner_id);
create index idx_contingency_assets_tipo on contingency_assets(owner_id, tipo);

-- ----------------------------------------------------------------------------
-- sales
-- ----------------------------------------------------------------------------
create table sales (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  data date not null default current_date,
  valor_recebido numeric(14,2) not null default 0 check (valor_recebido >= 0),
  produto text not null,
  cliente text,
  chip_id uuid references chips(id) on delete set null,
  vendedor text,
  origem_lead text,
  forma_pagamento text,
  taxas numeric(14,2) not null default 0,
  reembolso numeric(14,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_sales_updated_at before update on sales
  for each row execute function set_updated_at();
create index idx_sales_owner on sales(owner_id, data desc);
create index idx_sales_chip on sales(chip_id);

-- ----------------------------------------------------------------------------
-- expenses
-- ----------------------------------------------------------------------------
create table expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  descricao text not null,
  valor numeric(14,2) not null default 0 check (valor >= 0),
  categoria categoria_despesa not null default 'outros',
  data date not null default current_date,
  operacao_vinculada text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_expenses_updated_at before update on expenses
  for each row execute function set_updated_at();
create index idx_expenses_owner on expenses(owner_id, data desc);

-- ----------------------------------------------------------------------------
-- goals (metas mensais)
-- ----------------------------------------------------------------------------
create table goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  mes date not null,
  meta_faturamento numeric(14,2) not null default 0,
  meta_lucro numeric(14,2) not null default 0,
  meta_vendas integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, mes)
);
create trigger trg_goals_updated_at before update on goals
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- alerts
-- ----------------------------------------------------------------------------
create table alerts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  tipo tipo_alerta not null,
  nivel nivel_alerta not null default 'informativo',
  titulo text not null,
  mensagem text not null,
  entidade_tipo text,
  entidade_id uuid,
  link text,
  lido boolean not null default false,
  resolvido boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_alerts_owner on alerts(owner_id, created_at desc);
create index idx_alerts_owner_unresolved on alerts(owner_id, resolvido) where resolvido = false;
