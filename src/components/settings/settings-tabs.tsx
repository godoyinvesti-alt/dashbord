"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessSettingsForm } from "@/components/settings/business-settings-form";
import { ThemeSettingsForm } from "@/components/settings/theme-settings-form";
import { ChipAlertSettingsForm } from "@/components/settings/chip-alert-settings-form";
import { GoalsSettingsForm } from "@/components/settings/goals-settings-form";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import type { Goal, Settings } from "@/lib/types";

export function SettingsTabs({
  settings,
  profile,
  goal,
}: {
  settings: Settings;
  profile: { nome: string; email: string };
  goal: Goal | null;
}) {
  return (
    <Tabs defaultValue="negocio">
      <TabsList>
        <TabsTrigger value="negocio">Negócio</TabsTrigger>
        <TabsTrigger value="chips">Chips e alertas</TabsTrigger>
        <TabsTrigger value="metas">Metas</TabsTrigger>
        <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
      </TabsList>
      <TabsContent value="negocio" className="space-y-4">
        <BusinessSettingsForm settings={settings} profile={profile} />
        <ThemeSettingsForm />
      </TabsContent>
      <TabsContent value="chips">
        <ChipAlertSettingsForm settings={settings} />
      </TabsContent>
      <TabsContent value="metas">
        <GoalsSettingsForm goal={goal} />
      </TabsContent>
      <TabsContent value="notificacoes">
        <NotificationSettingsForm settings={settings} />
      </TabsContent>
    </Tabs>
  );
}
