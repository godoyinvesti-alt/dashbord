import { Badge } from "@/components/ui/badge";
import { STATUS_CHIP_LABEL, STATUS_CHIP_COLOR, OPERADORA_LABEL } from "@/lib/constants";
import { NIVEL_ALERTA_LABEL, NIVEL_ALERTA_BADGE_VARIANT } from "@/lib/chip-calc";
import type { StatusChip, Operadora, NivelAlertaChip } from "@/lib/types";

export function StatusChipBadge({ status }: { status: StatusChip }) {
  return <Badge variant={STATUS_CHIP_COLOR[status] as never}>{STATUS_CHIP_LABEL[status]}</Badge>;
}

export function OperadoraBadge({ operadora }: { operadora: Operadora }) {
  return <Badge variant="secondary">{OPERADORA_LABEL[operadora]}</Badge>;
}

export function NivelAlertaBadge({ nivel }: { nivel: NivelAlertaChip }) {
  if (nivel === "verde") return null;
  return (
    <Badge variant={NIVEL_ALERTA_BADGE_VARIANT[nivel] as never}>{NIVEL_ALERTA_LABEL[nivel]}</Badge>
  );
}
