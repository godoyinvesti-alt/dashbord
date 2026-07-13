import { requireContext } from "@/lib/context";
import { getGoalForMonth } from "@/lib/data/goals";
import { PageHeader } from "@/components/dashboard/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const ctx = await requireContext();
  const goal = await getGoalForMonth();

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Ajuste as preferências do seu negócio, dos alertas de chips e das metas mensais."
      />
      <SettingsTabs
        settings={ctx.settings}
        profile={{ nome: ctx.profile.nome, email: ctx.profile.email }}
        goal={goal}
      />
    </div>
  );
}
