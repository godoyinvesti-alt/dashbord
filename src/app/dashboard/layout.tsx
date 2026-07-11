import { requireContext } from "@/lib/workspace";
import { listNotifications } from "@/lib/data/notifications";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireContext();
  const { notifications, unreadCount } = await listNotifications(ctx.workspace.id);

  return (
    <AppShell
      workspace={{ id: ctx.workspace.id, nome: ctx.workspace.nome }}
      workspaces={ctx.workspaces}
      profile={{ nome: ctx.profile.nome, email: ctx.profile.email }}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
