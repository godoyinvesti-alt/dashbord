import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Logo({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Radar className="size-4.5" />
      </span>
      {!iconOnly && <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>}
    </div>
  );
}
