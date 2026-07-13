import { Badge } from "@/components/ui/badge";
import { STATUS_CONTINGENCIA_LABEL, STATUS_CONTINGENCIA_COLOR, TIPO_ATIVO_LABEL } from "@/lib/constants";
import type { StatusContingencia, TipoAtivoContingencia } from "@/lib/types";

export function StatusContingenciaBadge({ status }: { status: StatusContingencia }) {
  return (
    <Badge variant={STATUS_CONTINGENCIA_COLOR[status] as never}>
      {STATUS_CONTINGENCIA_LABEL[status]}
    </Badge>
  );
}

export function TipoAtivoBadge({ tipo }: { tipo: TipoAtivoContingencia }) {
  return <Badge variant="secondary">{TIPO_ATIVO_LABEL[tipo]}</Badge>;
}
