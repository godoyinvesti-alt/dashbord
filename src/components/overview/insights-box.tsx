import Link from "next/link";
import { Sparkles, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/data/insights";

const ICONS = {
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

const COLORS = {
  destructive: "text-destructive bg-destructive/10",
  warning: "text-warning-foreground bg-warning/15",
  info: "text-info bg-info/10",
  success: "text-success bg-success/10",
};

export function InsightsBox({ insights }: { insights: Insight[] }) {
  return (
    <Card className="py-5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          O que precisa da sua atenção hoje?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {insights.map((insight) => {
            const Icon = ICONS[insight.tipo];
            const item = (
              <div className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", COLORS[insight.tipo])}>
                  <Icon className="size-3.5" />
                </span>
                <p className="pt-1 text-sm leading-snug">{insight.mensagem}</p>
              </div>
            );
            return (
              <li key={insight.id}>
                {insight.link ? <Link href={insight.link}>{item}</Link> : item}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
