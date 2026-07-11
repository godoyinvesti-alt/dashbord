import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  description,
  children,
  className,
  actions,
  height = 280,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  height?: number;
}) {
  return (
    <Card className={cn("gap-4 py-5", className)}>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions}
      </CardHeader>
      <CardContent style={{ height }}>{children}</CardContent>
    </Card>
  );
}
