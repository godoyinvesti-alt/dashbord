import { requireContext } from "@/lib/context";
import { generateAlerts } from "@/lib/alerts/generate";
import { listAlerts } from "@/lib/data/alerts";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireContext();
  await generateAlerts();
  const { alerts, unreadCount } = await listAlerts();

  return (
    <AppShell
      nomeNegocio={ctx.settings.nome_negocio}
      profile={{ nome: ctx.profile.nome, email: ctx.profile.email }}
      alerts={alerts}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
