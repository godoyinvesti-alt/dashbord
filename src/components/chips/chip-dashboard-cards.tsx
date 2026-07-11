import { Smartphone, CheckCircle2, Flame, Ban, ShieldAlert, AlertTriangle, UserX, Zap } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { formatNumber } from "@/lib/format";

export function ChipDashboardCards({
  stats,
}: {
  stats: {
    total: number;
    ativos: number;
    aquecimento: number;
    bloqueados: number;
    banidos: number;
    semRecargaMais30: number;
    semResponsavel: number;
    quedasNoMes: number;
  };
}) {
  const items = [
    { label: "Total de chips", value: stats.total, icon: Smartphone },
    { label: "Chips ativos", value: stats.ativos, icon: CheckCircle2, tone: "success" as const },
    { label: "Em aquecimento", value: stats.aquecimento, icon: Flame, tone: "info" as const },
    { label: "Bloqueados", value: stats.bloqueados, icon: ShieldAlert, tone: "destructive" as const },
    { label: "Banidos", value: stats.banidos, icon: Ban, tone: "destructive" as const },
    { label: "Sem recarga há +30 dias", value: stats.semRecargaMais30, icon: AlertTriangle, tone: "warning" as const },
    { label: "Sem responsável", value: stats.semResponsavel, icon: UserX, tone: "warning" as const },
    { label: "Quedas no mês", value: stats.quedasNoMes, icon: Zap, tone: "warning" as const },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={formatNumber(item.value)}
          icon={item.icon}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
