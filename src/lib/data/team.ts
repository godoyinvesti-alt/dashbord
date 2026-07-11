import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PapelUsuario } from "@/lib/types";

export interface TeamMemberRow {
  id: string;
  user_id: string;
  papel: PapelUsuario;
  nome: string;
  email: string;
  created_at: string;
}

export async function listWorkspaceMembers(workspaceId: string): Promise<TeamMemberRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("id, user_id, papel, created_at, profile:profiles(nome, email)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  return ((data ?? []) as unknown as { id: string; user_id: string; papel: PapelUsuario; created_at: string; profile: { nome: string; email: string } | null }[]).map(
    (m) => ({
      id: m.id,
      user_id: m.user_id,
      papel: m.papel,
      nome: m.profile?.nome ?? "Usuário",
      email: m.profile?.email ?? "",
      created_at: m.created_at,
    })
  );
}
