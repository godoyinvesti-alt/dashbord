import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FunnelStage, Product, Campaign, AdSet, Creative, Agent, Chip } from "@/lib/types";

export async function getFunnelStages(workspaceId: string): Promise<FunnelStage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("funnel_stages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("ordem", { ascending: true });
  return (data as FunnelStage[]) ?? [];
}

export async function getProducts(workspaceId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("nome", { ascending: true });
  return (data as Product[]) ?? [];
}

export async function getCampaigns(workspaceId: string): Promise<Campaign[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("nome", { ascending: true });
  return (data as Campaign[]) ?? [];
}

export async function getAdSets(workspaceId: string, campaignId?: string): Promise<AdSet[]> {
  const supabase = await createClient();
  let query = supabase.from("ad_sets").select("*").eq("workspace_id", workspaceId);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  const { data } = await query.order("nome", { ascending: true });
  return (data as AdSet[]) ?? [];
}

export async function getCreatives(workspaceId: string, campaignId?: string): Promise<Creative[]> {
  const supabase = await createClient();
  let query = supabase.from("creatives").select("*").eq("workspace_id", workspaceId);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  const { data } = await query.order("nome", { ascending: true });
  return (data as Creative[]) ?? [];
}

export async function getAgents(workspaceId: string): Promise<Agent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("nome", { ascending: true });
  return (data as Agent[]) ?? [];
}

export async function getChips(workspaceId: string): Promise<Chip[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chips")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("archived", false)
    .order("name", { ascending: true });
  return (data as Chip[]) ?? [];
}

export interface WorkspaceLookups {
  funnelStages: FunnelStage[];
  products: Product[];
  campaigns: Campaign[];
  agents: Agent[];
  chips: Chip[];
}

export async function getWorkspaceLookups(workspaceId: string): Promise<WorkspaceLookups> {
  const [funnelStages, products, campaigns, agents, chips] = await Promise.all([
    getFunnelStages(workspaceId),
    getProducts(workspaceId),
    getCampaigns(workspaceId),
    getAgents(workspaceId),
    getChips(workspaceId),
  ]);
  return { funnelStages, products, campaigns, agents, chips };
}
