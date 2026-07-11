import type { Metadata } from "next";
import Link from "next/link";
import { Kanban } from "lucide-react";

import { requireContext } from "@/lib/workspace";
import { listLeads } from "@/lib/data/leads";
import { getWorkspaceLookups } from "@/lib/data/lookups";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { LeadsFilters } from "@/components/leads/leads-filters";
import { LeadsExplorer } from "@/components/leads/leads-explorer";
import { LeadFormDialog, NewLeadTrigger } from "@/components/leads/lead-form-dialog";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const ctx = await requireContext();
  const lookups = await getWorkspaceLookups(ctx.workspace.id);

  const result = await listLeads(ctx.workspace.id, {
    q: params.q,
    funnelStageId: params.stage,
    temperatura: params.temperatura as never,
    statusPagamento: params.pagamento as never,
    agentId: params.agente,
    origem: params.origem,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Gerencie todos os leads recebidos pelo WhatsApp"
        actions={
          <>
            <Button variant="outline" asChild className="gap-1.5">
              <Link href="/dashboard/funil">
                <Kanban className="size-4" /> Ver Kanban
              </Link>
            </Button>
            <LeadFormDialog trigger={<NewLeadTrigger />} {...lookups} />
          </>
        }
      />

      <LeadsFilters funnelStages={lookups.funnelStages} agents={lookups.agents} />

      <LeadsExplorer
        leads={result.leads}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        lookups={lookups}
      />
    </div>
  );
}
