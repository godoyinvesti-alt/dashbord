"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter, Package, ArrowRight } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/settings/profile-form";
import { BusinessForm } from "@/components/settings/business-form";
import { ChipSettingsForm } from "@/components/settings/chip-settings-form";
import { PaymentMethodsForm } from "@/components/settings/payment-methods-form";
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form";
import { TeamTable } from "@/components/settings/team-table";
import type { Profile, Workspace, Settings, PapelUsuario } from "@/lib/types";
import type { TeamMemberRow } from "@/lib/data/team";

export function SettingsTabs({
  profile,
  workspace,
  settings,
  members,
  papel,
}: {
  profile: Profile;
  workspace: Workspace;
  settings: Settings;
  members: TeamMemberRow[];
  papel: PapelUsuario;
}) {
  const searchParams = useSearchParams();
  const aba = searchParams.get("aba") ?? "perfil";
  const canManage = papel === "administrador" || papel === "gestor";

  return (
    <Tabs defaultValue={aba}>
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="perfil">Perfil</TabsTrigger>
        <TabsTrigger value="negocio">Negócio</TabsTrigger>
        <TabsTrigger value="funil">Funil e produtos</TabsTrigger>
        <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        <TabsTrigger value="chips">Chips</TabsTrigger>
        <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        <TabsTrigger value="equipe">Equipe</TabsTrigger>
      </TabsList>

      <TabsContent value="perfil" className="pt-4">
        <ProfileForm profile={profile} />
      </TabsContent>

      <TabsContent value="negocio" className="pt-4">
        <BusinessForm workspace={workspace} />
      </TabsContent>

      <TabsContent value="funil" className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
        <ShortcutCard
          icon={Filter}
          title="Etapas do funil"
          description="Renomeie, reordene, adicione ou remova as etapas do seu funil de vendas."
          href="/dashboard/funil"
        />
        <ShortcutCard
          icon={Package}
          title="Produtos"
          description="Gerencie os produtos, upsells e order bumps vendidos na sua operação."
          href="/dashboard/produtos"
        />
      </TabsContent>

      <TabsContent value="pagamentos" className="pt-4">
        <PaymentMethodsForm metodos={settings.metodos_pagamento} />
      </TabsContent>

      <TabsContent value="chips" className="pt-4">
        <ChipSettingsForm settings={settings} />
      </TabsContent>

      <TabsContent value="notificacoes" className="pt-4">
        <NotificationPreferencesForm settings={settings} />
      </TabsContent>

      <TabsContent value="equipe" className="pt-4">
        <TeamTable members={members} canManage={canManage} />
      </TabsContent>
    </Tabs>
  );
}

function ShortcutCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="py-5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </span>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href={href}>
            Acessar <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
