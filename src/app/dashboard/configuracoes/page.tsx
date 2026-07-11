import { Suspense } from "react";
import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { listWorkspaceMembers } from "@/lib/data/team";
import { createClient } from "@/lib/supabase/server";

import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import type { Settings } from "@/lib/types";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const ctx = await requireContext();
  const supabase = await createClient();

  const [{ data: settingsRow }, members] = await Promise.all([
    supabase.from("settings").select("*").eq("workspace_id", ctx.workspace.id).maybeSingle(),
    listWorkspaceMembers(ctx.workspace.id),
  ]);

  const settings = (settingsRow as Settings | null) ?? {
    id: "",
    workspace_id: ctx.workspace.id,
    aviso_recarga_dias: 21,
    critico_recarga_dias: 30,
    max_incidentes_alerta: 3,
    operadora_padrao: "vivo",
    notificacoes_ativas: true,
    metodos_pagamento: ["PIX", "Cartão de crédito", "Boleto", "Dinheiro", "Transferência"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Personalize o funcionamento do seu workspace" />
      <Suspense fallback={null}>
        <SettingsTabs
          profile={ctx.profile}
          workspace={ctx.workspace}
          settings={settings}
          members={members}
          papel={ctx.papel}
        />
      </Suspense>
    </div>
  );
}
