import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

export function StatCard({
  label,
  value,
  icon: Icon,
  changePercent,
  changeLabel,
  invertTrendColor = false,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  changePercent?: number | null;
  changeLabel?: string;
  invertTrendColor?: boolean;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
  hint?: string;
}) {
  const isPositive = (changePercent ?? 0) > 0;
  const isNeutral = !changePercent || changePercent === 0;

  const positiveIsGood = !invertTrendColor;
  const goodColor = "text-success";
  const badColor = "text-destructive";

  const trendColor = isNeutral
    ? "text-muted-foreground"
    : isPositive
    ? positiveIsGood
      ? goodColor
      : badColor
    : positiveIsGood
    ? badColor
    : goodColor;

  const toneRing: Record<string, string> = {
    default: "",
    success: "ring-1 ring-success/20",
    warning: "ring-1 ring-warning/30",
    destructive: "ring-1 ring-destructive/20",
    info: "ring-1 ring-info/20",
  };

  return (
    <Card className={cn("gap-3 py-5", toneRing[tone])}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {changePercent !== undefined && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              {isNeutral ? (
                <Minus className="size-3" />
              ) : isPositive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              <span>{formatPercent(Math.abs(changePercent ?? 0))}</span>
              <span className="font-normal text-muted-foreground">
                {changeLabel ?? "vs. período anterior"}
              </span>
            </div>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
