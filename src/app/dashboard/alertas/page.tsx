import { Bell } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AlertList } from "@/components/alerts/alert-list";
import { listAlerts } from "@/lib/data/alerts";

export const metadata = { title: "Alertas" };

export default async function AlertasPage() {
  const { alerts } = await listAlerts();

  return (
    <div>
      <PageHeader
        title="Alertas"
        description="Acompanhe os alertas operacionais gerados automaticamente: aquecimento, recargas, banimentos e metas."
      />

      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhum alerta no momento"
          description="Quando o sistema identificar situações que exigem atenção, elas aparecerão aqui."
        />
      ) : (
        <AlertList alerts={alerts} />
      )}
    </div>
  );
}
