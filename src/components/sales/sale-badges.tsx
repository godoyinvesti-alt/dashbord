import { Badge } from "@/components/ui/badge";
import { STATUS_ENTREGA_LABEL, STATUS_REEMBOLSO_LABEL } from "@/lib/constants";
import type { StatusEntrega, StatusReembolso } from "@/lib/types";

const ENTREGA_COLOR: Record<StatusEntrega, string> = {
  pendente: "soft-warning",
  entregue: "soft-success",
  nao_aplicavel: "secondary",
};

const REEMBOLSO_COLOR: Record<StatusReembolso, string> = {
  nenhum: "secondary",
  solicitado: "soft-warning",
  reembolsado: "soft-destructive",
};

export function StatusEntregaBadge({ value }: { value: StatusEntrega }) {
  return <Badge variant={ENTREGA_COLOR[value] as never}>{STATUS_ENTREGA_LABEL[value]}</Badge>;
}

export function StatusReembolsoBadge({ value }: { value: StatusReembolso }) {
  if (value === "nenhum") return null;
  return <Badge variant={REEMBOLSO_COLOR[value] as never}>{STATUS_REEMBOLSO_LABEL[value]}</Badge>;
}
