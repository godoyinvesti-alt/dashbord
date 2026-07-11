-- ============================================================================
-- X1 Control — Row Level Security
-- Cada usuário só pode acessar dados do(s) workspace(s) ao qual pertence.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Função auxiliar: verifica se o usuário autenticado pertence ao workspace
-- ----------------------------------------------------------------------------
create or replace function is_workspace_member(target_workspace_id uuid)
returns boolean as $$
  select exists (
    select 1 from workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$ language sql stable security definer set search_path = public;

create or replace function current_workspace_role(target_workspace_id uuid)
returns papel_usuario as $$
  select wm.papel from workspace_members wm
  where wm.workspace_id = target_workspace_id
    and wm.user_id = auth.uid()
  limit 1;
$$ language sql stable security definer set search_path = public;

-- ----------------------------------------------------------------------------
-- workspaces
-- ----------------------------------------------------------------------------
alter table workspaces enable row level security;

create policy "membros podem ver o workspace" on workspaces
  for select using (is_workspace_member(id));

create policy "usuarios autenticados podem criar workspace" on workspaces
  for insert with check (auth.uid() is not null);

create policy "administradores podem atualizar o workspace" on workspaces
  for update using (
    is_workspace_member(id) and current_workspace_role(id) in ('administrador', 'gestor')
  );

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;

create policy "usuario ve o proprio perfil" on profiles
  for select using (id = auth.uid());

create policy "usuario ve perfis de membros do mesmo workspace" on profiles
  for select using (
    exists (
      select 1 from workspace_members wm1
      join workspace_members wm2 on wm1.workspace_id = wm2.workspace_id
      where wm1.user_id = auth.uid() and wm2.user_id = profiles.id
    )
  );

create policy "usuario atualiza o proprio perfil" on profiles
  for update using (id = auth.uid());

create policy "usuario insere o proprio perfil" on profiles
  for insert with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- workspace_members
-- ----------------------------------------------------------------------------
alter table workspace_members enable row level security;

create policy "membros veem outros membros do workspace" on workspace_members
  for select using (is_workspace_member(workspace_id));

create policy "usuario pode se tornar membro ao criar workspace" on workspace_members
  for insert with check (user_id = auth.uid());

create policy "administradores gerenciam membros" on workspace_members
  for update using (
    is_workspace_member(workspace_id) and current_workspace_role(workspace_id) in ('administrador', 'gestor')
  );

create policy "administradores removem membros" on workspace_members
  for delete using (
    is_workspace_member(workspace_id) and current_workspace_role(workspace_id) in ('administrador', 'gestor')
  );

-- ----------------------------------------------------------------------------
-- Política genérica para tabelas "padrão" com coluna workspace_id
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array[
    'funnel_stages', 'agents', 'products', 'campaigns', 'ad_sets', 'creatives',
    'chips', 'chip_recharges', 'chip_incidents', 'leads', 'lead_status_history',
    'lead_notes', 'lead_tags', 'follow_ups', 'sales', 'payments', 'expenses',
    'goals', 'notifications', 'settings', 'activity_logs'
  ];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security;', t);

    execute format(
      'create policy "select_workspace_members" on %I for select using (is_workspace_member(workspace_id));',
      t
    );
    execute format(
      'create policy "insert_workspace_members" on %I for insert with check (is_workspace_member(workspace_id));',
      t
    );
    execute format(
      'create policy "update_workspace_members" on %I for update using (is_workspace_member(workspace_id));',
      t
    );
    execute format(
      'create policy "delete_workspace_members" on %I for delete using (is_workspace_member(workspace_id));',
      t
    );
  end loop;
end $$;
