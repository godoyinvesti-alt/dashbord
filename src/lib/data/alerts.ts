import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Alert } from "@/lib/types";

export async function listAlerts(options?: { onlyUnresolved?: boolean }) {
  const supabase = await createClient();
  let query = supabase.from("alerts").select("*").order("created_at", { ascending: false });
  if (options?.onlyUnresolved) {
    query = query.eq("resolvido", false);
  }
  const { data } = await query;
  const alerts = (data as Alert[]) ?? [];
  const unreadCount = alerts.filter((a) => !a.lido).length;
  return { alerts, unreadCount };
}
