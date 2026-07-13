import { Badge } from "@/components/ui/badge";

export function FormaPagamentoBadge({ forma }: { forma: string | null }) {
  if (!forma) return <span className="text-xs text-muted-foreground">—</span>;
  return <Badge variant="secondary">{forma}</Badge>;
}
