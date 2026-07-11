import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types";

export async function listNotifications(
  workspaceId: string,
  limit = 20
): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const supabase = await createClient();

  const [{ data: notifications }, { count }] = await Promise.all([
    supabase
      .from("notifications")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("lida", false),
  ]);

  return {
    notifications: (notifications as Notification[]) ?? [],
    unreadCount: count ?? 0,
  };
}
