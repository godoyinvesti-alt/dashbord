-- ============================================================================
-- Controle X1 — Row Level Security
-- Cada usuário só acessa os próprios dados (owner_id = auth.uid()).
-- ============================================================================

alter table profiles enable row level security;
alter table settings enable row level security;
alter table chips enable row level security;
alter table chip_recharges enable row level security;
alter table chip_bans enable row level security;
alter table chip_status_history enable row level security;
alter table contingency_assets enable row level security;
alter table sales enable row level security;
alter table expenses enable row level security;
alter table goals enable row level security;
alter table alerts enable row level security;

-- profiles: usuário só vê/edita o próprio perfil
create policy "profiles_select_own" on profiles for select using (id = auth.uid());
create policy "profiles_update_own" on profiles for update using (id = auth.uid());

-- settings
create policy "settings_select_own" on settings for select using (owner_id = auth.uid());
create policy "settings_insert_own" on settings for insert with check (owner_id = auth.uid());
create policy "settings_update_own" on settings for update using (owner_id = auth.uid());
create policy "settings_delete_own" on settings for delete using (owner_id = auth.uid());

-- chips
create policy "chips_select_own" on chips for select using (owner_id = auth.uid());
create policy "chips_insert_own" on chips for insert with check (owner_id = auth.uid());
create policy "chips_update_own" on chips for update using (owner_id = auth.uid());
create policy "chips_delete_own" on chips for delete using (owner_id = auth.uid());

-- chip_recharges
create policy "chip_recharges_select_own" on chip_recharges for select using (owner_id = auth.uid());
create policy "chip_recharges_insert_own" on chip_recharges for insert with check (owner_id = auth.uid());
create policy "chip_recharges_update_own" on chip_recharges for update using (owner_id = auth.uid());
create policy "chip_recharges_delete_own" on chip_recharges for delete using (owner_id = auth.uid());

-- chip_bans
create policy "chip_bans_select_own" on chip_bans for select using (owner_id = auth.uid());
create policy "chip_bans_insert_own" on chip_bans for insert with check (owner_id = auth.uid());
create policy "chip_bans_update_own" on chip_bans for update using (owner_id = auth.uid());
create policy "chip_bans_delete_own" on chip_bans for delete using (owner_id = auth.uid());

-- chip_status_history
create policy "chip_status_history_select_own" on chip_status_history for select using (owner_id = auth.uid());
create policy "chip_status_history_insert_own" on chip_status_history for insert with check (owner_id = auth.uid());
create policy "chip_status_history_delete_own" on chip_status_history for delete using (owner_id = auth.uid());

-- contingency_assets
create policy "contingency_assets_select_own" on contingency_assets for select using (owner_id = auth.uid());
create policy "contingency_assets_insert_own" on contingency_assets for insert with check (owner_id = auth.uid());
create policy "contingency_assets_update_own" on contingency_assets for update using (owner_id = auth.uid());
create policy "contingency_assets_delete_own" on contingency_assets for delete using (owner_id = auth.uid());

-- sales
create policy "sales_select_own" on sales for select using (owner_id = auth.uid());
create policy "sales_insert_own" on sales for insert with check (owner_id = auth.uid());
create policy "sales_update_own" on sales for update using (owner_id = auth.uid());
create policy "sales_delete_own" on sales for delete using (owner_id = auth.uid());

-- expenses
create policy "expenses_select_own" on expenses for select using (owner_id = auth.uid());
create policy "expenses_insert_own" on expenses for insert with check (owner_id = auth.uid());
create policy "expenses_update_own" on expenses for update using (owner_id = auth.uid());
create policy "expenses_delete_own" on expenses for delete using (owner_id = auth.uid());

-- goals
create policy "goals_select_own" on goals for select using (owner_id = auth.uid());
create policy "goals_insert_own" on goals for insert with check (owner_id = auth.uid());
create policy "goals_update_own" on goals for update using (owner_id = auth.uid());
create policy "goals_delete_own" on goals for delete using (owner_id = auth.uid());

-- alerts
create policy "alerts_select_own" on alerts for select using (owner_id = auth.uid());
create policy "alerts_insert_own" on alerts for insert with check (owner_id = auth.uid());
create policy "alerts_update_own" on alerts for update using (owner_id = auth.uid());
create policy "alerts_delete_own" on alerts for delete using (owner_id = auth.uid());
