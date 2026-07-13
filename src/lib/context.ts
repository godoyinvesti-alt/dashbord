import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Settings } from "@/lib/types";

export interface AppContext {
  userId: string;
  profile: Profile;
  settings: Settings;
}

export async function requireContext(): Promise<AppContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("settings").select("*").eq("owner_id", user.id).single(),
  ]);

  if (!profile || !settings) {
    redirect("/login");
  }

  return {
    userId: user.id,
    profile: profile as Profile,
    settings: settings as Settings,
  };
}
