-- ============================================================================
-- Controle X1 — Funções de negócio (RPC)
-- Executam com os privilégios de quem chama (security invoker), então a RLS
-- de cada tabela continua sendo aplicada normalmente.
-- ============================================================================

-- Registra uma recarga e atualiza o chip em uma única transação.
create or replace function record_chip_recharge(
  p_chip_id uuid,
  p_data date,
  p_valor numeric,
  p_observacoes text
)
returns void as $$
declare
  v_owner uuid := auth.uid();
begin
  insert into chip_recharges (owner_id, chip_id, data, valor, observacoes)
  values (v_owner, p_chip_id, p_data, p_valor, p_observacoes);

  update chips
    set data_ultima_recarga = p_data,
        valor_ultima_recarga = p_valor
    where id = p_chip_id and owner_id = v_owner
      and (data_ultima_recarga is null or p_data >= data_ultima_recarga);
end;
$$ language plpgsql security invoker;

-- Altera o status de um chip e registra o histórico.
create or replace function record_chip_status_change(
  p_chip_id uuid,
  p_status_novo status_chip,
  p_observacao text
)
returns void as $$
declare
  v_owner uuid := auth.uid();
  v_status_anterior status_chip;
begin
  select status into v_status_anterior from chips where id = p_chip_id and owner_id = v_owner;

  update chips set status = p_status_novo where id = p_chip_id and owner_id = v_owner;

  insert into chip_status_history (owner_id, chip_id, status_anterior, status_novo, observacao)
  values (v_owner, p_chip_id, v_status_anterior, p_status_novo, p_observacao);
end;
$$ language plpgsql security invoker;

-- Registra um banimento: cria o histórico e atualiza o status do chip.
create or replace function record_chip_ban(
  p_chip_id uuid,
  p_data date,
  p_motivo text,
  p_plataforma text,
  p_observacoes text
)
returns void as $$
declare
  v_owner uuid := auth.uid();
  v_status_anterior status_chip;
begin
  insert into chip_bans (owner_id, chip_id, data, motivo, plataforma, observacoes)
  values (v_owner, p_chip_id, p_data, p_motivo, p_plataforma, p_observacoes);

  select status into v_status_anterior from chips where id = p_chip_id and owner_id = v_owner;

  update chips set status = 'banido' where id = p_chip_id and owner_id = v_owner;

  insert into chip_status_history (owner_id, chip_id, status_anterior, status_novo, observacao)
  values (v_owner, p_chip_id, v_status_anterior, 'banido', 'Banimento registrado automaticamente');
end;
$$ language plpgsql security invoker;

-- Registra a recuperação de um banimento e move o chip para "em_recuperacao".
create or replace function record_chip_recovery(
  p_ban_id uuid,
  p_data_recuperacao date,
  p_observacoes text
)
returns void as $$
declare
  v_owner uuid := auth.uid();
  v_chip_id uuid;
  v_status_anterior status_chip;
begin
  update chip_bans
    set foi_recuperado = true,
        data_recuperacao = p_data_recuperacao,
        observacoes = coalesce(p_observacoes, observacoes)
    where id = p_ban_id and owner_id = v_owner
    returning chip_id into v_chip_id;

  if v_chip_id is not null then
    select status into v_status_anterior from chips where id = v_chip_id and owner_id = v_owner;

    update chips set status = 'em_recuperacao' where id = v_chip_id and owner_id = v_owner;

    insert into chip_status_history (owner_id, chip_id, status_anterior, status_novo, observacao)
    values (v_owner, v_chip_id, v_status_anterior, 'em_recuperacao', 'Recuperação de banimento registrada');
  end if;
end;
$$ language plpgsql security invoker;
