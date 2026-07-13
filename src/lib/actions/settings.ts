"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { settingsFormSchema, type SettingsFormValues } from "@/lib/validations/settings";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

function revalidateSettings() {
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
}

export async function updateSettingsAction(values: SettingsFormValues): Promise<ActionResult> {
  const parsed = settingsFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const v = parsed.data;
  const { error } = await supabase
    .from("settings")
    .update({
      nome_negocio: v.nome_negocio,
      dias_aquecimento_padrao: v.dias_aquecimento_padrao,
      dias_alerta_recarga: v.dias_alerta_recarga,
      minimo_chips_ativos: v.minimo_chips_ativos,
      limite_despesas_mensal: v.limite_despesas_mensal ?? null,
      notificacoes_ativas: v.notificacoes_ativas,
    })
    .eq("owner_id", user.id);

  if (error) return { error: "Não foi possível salvar as configurações." };

  revalidateSettings();
  return { success: true };
}

export async function updateThemeAction(tema: "light" | "dark" | "system"): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase.from("settings").update({ tema }).eq("owner_id", user.id);
  if (error) return { error: "Não foi possível salvar o tema." };

  revalidateSettings();
  return { success: true };
}
