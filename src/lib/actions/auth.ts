"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ActionState {
  error?: string;
  success?: string;
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");
  const redirectTo = String(formData.get("redirect") || "/dashboard");

  if (!email || !senha) {
    return { error: "Preencha e-mail e senha para continuar." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { error: "E-mail ou senha inválidos. Tente novamente." };
  }

  redirect(redirectTo || "/dashboard");
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");
  const confirmarSenha = String(formData.get("confirmarSenha") || "");

  if (!nome || !email || !senha) {
    return { error: "Preencha todos os campos obrigatórios." };
  }
  if (senha.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmarSenha) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Este e-mail já está cadastrado. Faça login." };
    }
    return { error: "Não foi possível concluir o cadastro. Tente novamente." };
  }

  if (data.session) {
    redirect("/onboarding");
  }

  return {
    success:
      "Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/redefinir-senha`,
  });

  return {
    success:
      "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
  };
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const senha = String(formData.get("senha") || "");
  const confirmarSenha = String(formData.get("confirmarSenha") || "");

  if (senha.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmarSenha) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) {
    return { error: "Não foi possível redefinir a senha. Solicite um novo link." };
  }

  redirect("/dashboard");
}

export async function createWorkspaceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) {
    return { error: "Informe o nome do seu negócio." };
  }

  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .concat(`-${Math.random().toString(36).slice(2, 7)}`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_workspace_with_owner", {
    p_nome: nome,
    p_slug: slug,
  });

  if (error) {
    return { error: "Não foi possível criar seu workspace. Tente novamente." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nome = String(formData.get("nome") || "").trim();
  const telefone = String(formData.get("telefone") || "").trim();

  if (!nome) {
    return { error: "O nome não pode ficar em branco." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase
    .from("profiles")
    .update({ nome, telefone: telefone || null })
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível atualizar o perfil." };
  }

  revalidatePath("/dashboard/configuracoes");
  return { success: "Perfil atualizado com sucesso." };
}
