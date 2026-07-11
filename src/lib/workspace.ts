import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Workspace, PapelUsuario, Profile } from "@/lib/types";

export const WORKSPACE_COOKIE = "x1_workspace_id";

export interface CurrentContext {
  userId: string;
  profile: Profile;
  workspace: Workspace;
  papel: PapelUsuario;
  workspaces: { id: string; nome: string }[];
}

/**
 * Recupera o usuário autenticado, seu perfil e o workspace ativo.
 * Redireciona para /login se não autenticado, ou /onboarding se o
 * usuário ainda não pertence a nenhum workspace.
 */
export async function requireContext(): Promise<CurrentContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, papel, workspaces(id, nome, slug, moeda, fuso_horario, logo_url, meta_faturamento_mensal, created_at, updated_at)")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  const cookieStore = await cookies();
  const preferredId = cookieStore.get(WORKSPACE_COOKIE)?.value;

  type MembershipRow = {
    workspace_id: string;
    papel: PapelUsuario;
    workspaces: unknown;
  };

  const rows = memberships as unknown as MembershipRow[];
  const active =
    rows.find((m) => m.workspace_id === preferredId) ?? rows[0];

  const workspace = (
    Array.isArray(active.workspaces) ? active.workspaces[0] : active.workspaces
  ) as Workspace;

  return {
    userId: user.id,
    profile: (profile as Profile) ?? {
      id: user.id,
      nome: user.email?.split("@")[0] ?? "Usuário",
      email: user.email ?? "",
      telefone: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    workspace,
    papel: active.papel,
    workspaces: rows.map((m) => {
      const w = (Array.isArray(m.workspaces) ? m.workspaces[0] : m.workspaces) as Workspace;
      return { id: w.id, nome: w.nome };
    }),
  };
}
