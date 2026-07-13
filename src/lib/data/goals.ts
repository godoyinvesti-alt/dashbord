import "server-only";
import { startOfMonth } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { Goal } from "@/lib/types";

export function currentMonthKey(date: Date = new Date()): string {
  return startOfMonth(date).toISOString().slice(0, 10);
}

export async function getGoalForMonth(mes: string = currentMonthKey()): Promise<Goal | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("goals").select("*").eq("mes", mes).maybeSingle();
  return (data as Goal) ?? null;
}
