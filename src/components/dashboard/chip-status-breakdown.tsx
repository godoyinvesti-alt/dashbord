import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { STATUS_CHIP_LABEL, STATUS_CHIP_OPCOES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { StatusChip } from "@/lib/types";

const BAR_COLOR: Record<StatusChip, string> = {
  novo: "bg-muted-foreground/40",
  em_aquecimento: "bg-info",
  aquecido: "bg-success/70",
  ativo: "bg-success",
  em_observacao: "bg-warning",
  instavel: "bg-warning",
  banido: "bg-destructive",
  em_recuperacao: "bg-destructive/60",
  inativo: "bg-muted-foreground/30",
  descartado: "bg-muted-foreground/20",
};

export function ChipStatusBreakdown({ data }: { data: { status: StatusChip; total: number }[] }) {
  const totals = new Map(data.map((d) => [d.status, d.total]));
  const max = Math.max(...data.map((d) => d.total), 1);
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <Card className="gap-4 py-5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Status dos chips</CardTitle>
        <CardDescription>{total} chip(s) cadastrados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {STATUS_CHIP_OPCOES.filter((s) => (totals.get(s) ?? 0) > 0).map((status) => {
          const value = totals.get(status) ?? 0;
          return (
            <div key={status} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{STATUS_CHIP_LABEL[status]}</span>
                <span className="font-medium tabular-nums">{value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", BAR_COLOR[status])}
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
        {total === 0 && <p className="text-sm text-muted-foreground">Nenhum chip cadastrado ainda.</p>}
      </CardContent>
    </Card>
  );
}
