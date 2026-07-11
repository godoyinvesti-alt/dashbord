import { Thermometer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  LEAD_TEMPERATURA_LABEL,
  LEAD_TEMPERATURA_COLOR,
  STATUS_PAGAMENTO_LABEL,
  STATUS_PAGAMENTO_COLOR,
} from "@/lib/constants";
import type { LeadTemperatura, StatusPagamento } from "@/lib/types";

export function TemperaturaBadge({ value }: { value: LeadTemperatura }) {
  return (
    <Badge variant={LEAD_TEMPERATURA_COLOR[value] as never} className="gap-1">
      <Thermometer className="size-3" />
      {LEAD_TEMPERATURA_LABEL[value]}
    </Badge>
  );
}

export function StatusPagamentoBadge({ value }: { value: StatusPagamento }) {
  return (
    <Badge variant={STATUS_PAGAMENTO_COLOR[value] as never}>
      {STATUS_PAGAMENTO_LABEL[value]}
    </Badge>
  );
}
