-- ============================================================================
-- X1 Control — Funções de negócio e triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Cria um workspace, torna o usuário atual administrador e inicializa
-- etapas de funil padrão + configurações padrão.
-- ----------------------------------------------------------------------------
create or replace function create_workspace_with_owner(p_nome text, p_slug text)
returns uuid as $$
declare
  v_workspace_id uuid;
  v_stage_names text[] := array[
    'Lead recebido', 'Primeira mensagem enviada', 'Lead respondeu',
    'Apresentação enviada', 'Oferta apresentada', 'PIX enviado',
    'Aguardando pagamento', 'Pagamento confirmado', 'Produto entregue',
    'Upsell oferecido', 'Upsell comprado'
  ];
  v_name text;
  v_ordem integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;

  insert into workspaces (nome, slug) values (p_nome, p_slug)
  returning id into v_workspace_id;

  insert into workspace_members (workspace_id, user_id, papel)
  values (v_workspace_id, auth.uid(), 'administrador');

  foreach v_name in array v_stage_names loop
    insert into funnel_stages (workspace_id, nome, ordem, padrao)
    values (v_workspace_id, v_name, v_ordem, true);
    v_ordem := v_ordem + 1;
  end loop;

  insert into settings (workspace_id) values (v_workspace_id);

  return v_workspace_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ----------------------------------------------------------------------------
-- Ao registrar uma recarga, atualiza o chip e remove o alerta de atraso
-- ----------------------------------------------------------------------------
create or replace function handle_chip_recharge()
returns trigger as $$
begin
  update chips
  set last_recharge_date = new.recharge_date,
      last_recharge_amount = new.amount
  where id = new.chip_id
    and (last_recharge_date is null or new.recharge_date >= last_recharge_date);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_chip_recharge_after_insert
  after insert on chip_recharges
  for each row execute function handle_chip_recharge();

-- ----------------------------------------------------------------------------
-- Ao registrar um incidente, incrementa o contador de quedas do chip e
-- aplica o novo status quando informado
-- ----------------------------------------------------------------------------
create or replace function handle_chip_incident()
returns trigger as $$
begin
  update chips
  set incident_count = incident_count + 1,
      last_incident_date = new.incident_date::date,
      last_incident_reason = coalesce(new.reason, last_incident_reason),
      status = coalesce(new.new_status, status)
  where id = new.chip_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_chip_incident_after_insert
  after insert on chip_incidents
  for each row execute function handle_chip_incident();

-- ----------------------------------------------------------------------------
-- Ao mover um lead de etapa, registra o histórico automaticamente
-- ----------------------------------------------------------------------------
create or replace function handle_lead_stage_change()
returns trigger as $$
begin
  if tg_op = 'UPDATE' and new.funnel_stage_id is distinct from old.funnel_stage_id then
    insert into lead_status_history (workspace_id, lead_id, funnel_stage_id, funnel_stage_anterior_id, created_by)
    values (new.workspace_id, new.id, new.funnel_stage_id, old.funnel_stage_id, auth.uid());
  elsif tg_op = 'INSERT' then
    insert into lead_status_history (workspace_id, lead_id, funnel_stage_id, funnel_stage_anterior_id, created_by)
    values (new.workspace_id, new.id, new.funnel_stage_id, null, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_lead_stage_change
  after insert or update on leads
  for each row execute function handle_lead_stage_change();

-- ----------------------------------------------------------------------------
-- Registro de log de atividades (chamado explicitamente pela aplicação
-- via RPC para manter mensagens legíveis em português)
-- ----------------------------------------------------------------------------
create or replace function log_activity(
  p_workspace_id uuid,
  p_acao text,
  p_entidade text,
  p_entidade_id uuid,
  p_detalhes jsonb default null
) returns void as $$
begin
  insert into activity_logs (workspace_id, user_id, acao, entidade, entidade_id, detalhes)
  values (p_workspace_id, auth.uid(), p_acao, p_entidade, p_entidade_id, p_detalhes);
end;
$$ language plpgsql security definer set search_path = public;
