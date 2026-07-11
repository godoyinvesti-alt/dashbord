import { Badge } from "@/components/ui/badge";
import { STATUS_CHIP_LABEL, STATUS_CHIP_COLOR } from "@/lib/constants";
import { NIVEL_ALERTA_LABEL, NIVEL_ALERTA_BADGE_VARIANT, type NivelAlertaChip } from "@/lib/chip-alerts";
import type { StatusChip } from "@/lib/types";

export function StatusChipBadge({ value }: { value: StatusChip }) {
  return <Badge variant={STATUS_CHIP_COLOR[value] as never}>{STATUS_CHIP_LABEL[value]}</Badge>;
}

export function AlertaRecargaBadge({ value }: { value: NivelAlertaChip }) {
  return <Badge variant={NIVEL_ALERTA_BADGE_VARIANT[value] as never}>{NIVEL_ALERTA_LABEL[value]}</Badge>;
}
