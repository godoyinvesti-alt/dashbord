"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ lida: true })
    .eq("id", notificationId);
  revalidatePath("/dashboard", "layout");
}

export async function markAllNotificationsReadAction(workspaceId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ lida: true })
    .eq("workspace_id", workspaceId)
    .eq("lida", false);
  revalidatePath("/dashboard", "layout");
}
