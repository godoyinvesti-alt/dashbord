"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markAlertReadAction(id: string) {
  const supabase = await createClient();
  await supabase.from("alerts").update({ lido: true }).eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alertas");
}

export async function markAllAlertsReadAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("alerts").update({ lido: true }).eq("owner_id", user.id).eq("lido", false);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alertas");
}

export async function resolveAlertAction(id: string) {
  const supabase = await createClient();
  await supabase.from("alerts").update({ resolvido: true, lido: true }).eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alertas");
}

export async function reopenAlertAction(id: string) {
  const supabase = await createClient();
  await supabase.from("alerts").update({ resolvido: false }).eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alertas");
}
