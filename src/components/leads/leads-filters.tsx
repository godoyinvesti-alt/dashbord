import { SearchInput } from "@/components/shared/search-input";
import { SelectFilter } from "@/components/shared/select-filter";
import {
  LEAD_TEMPERATURA_LABEL,
  STATUS_PAGAMENTO_LABEL,
  PLATAFORMA_LABEL,
} from "@/lib/constants";
import type { FunnelStage, Agent } from "@/lib/types";

export function LeadsFilters({
  funnelStages,
  agents,
}: {
  funnelStages: FunnelStage[];
  agents: Agent[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput placeholder="Buscar por nome, WhatsApp ou e-mail..." className="w-full sm:w-64" />
      <SelectFilter
        paramName="stage"
        placeholder="Etapa"
        options={funnelStages.map((s) => ({ value: s.id, label: s.nome }))}
      />
      <SelectFilter
        paramName="temperatura"
        placeholder="Temperatura"
        options={Object.entries(LEAD_TEMPERATURA_LABEL).map(([value, label]) => ({ value, label }))}
      />
      <SelectFilter
        paramName="pagamento"
        placeholder="Pagamento"
        options={Object.entries(STATUS_PAGAMENTO_LABEL).map(([value, label]) => ({ value, label }))}
      />
      <SelectFilter
        paramName="origem"
        placeholder="Origem"
        options={Object.entries(PLATAFORMA_LABEL).map(([value, label]) => ({ value, label }))}
      />
      <SelectFilter
        paramName="agente"
        placeholder="Atendente"
        options={agents.map((a) => ({ value: a.id, label: a.nome }))}
      />
    </div>
  );
}
