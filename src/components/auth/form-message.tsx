import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        error && "border-destructive/30 bg-destructive/10 text-destructive",
        success && "border-success/30 bg-success/10 text-success"
      )}
      role="alert"
    >
      {error ? (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{error || success}</span>
    </div>
  );
}
