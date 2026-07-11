"use client";

import { toast } from "sonner";
import { Pencil, Trash2, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CampaignFormDialog } from "@/components/campaigns/campaign-form-dialog";
import { formatBRL, formatDate, formatNumber, formatPercent } from "@/lib/format";
import { PLATAFORMA_LABEL } from "@/lib/constants";
import { deleteCampaignAction } from "@/lib/actions/campaigns";
import type { CampaignRow } from "@/lib/data/campaigns";

export function CampaignsTable({ campaigns }: { campaigns: CampaignRow[] }) {
  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="Nenhuma campanha cadastrada"
        description="Cadastre suas campanhas de tráfego pago ou orgânico para acompanhar o desempenho."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campanha</TableHead>
            <TableHead>Plataforma</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Investido</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Vendas</TableHead>
            <TableHead>CPL</TableHead>
            <TableHead>CPA</TableHead>
            <TableHead>Conversão</TableHead>
            <TableHead>ROAS</TableHead>
            <TableHead>Lucro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="max-w-40 truncate text-sm font-medium">{c.nome}</TableCell>
              <TableCell><Badge variant="outline">{PLATAFORMA_LABEL[c.plataforma]}</Badge></TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {c.data_inicio ? formatDate(c.data_inicio) : "—"} – {c.data_fim ? formatDate(c.data_fim) : "—"}
              </TableCell>
              <TableCell className="text-sm tabular-nums">{formatBRL(c.valor_investido)}</TableCell>
              <TableCell className="text-sm tabular-nums">{formatNumber(c.leads)}</TableCell>
              <TableCell className="text-sm tabular-nums">{formatNumber(c.vendas)}</TableCell>
              <TableCell className="text-sm tabular-nums">{formatBRL(c.cpl)}</TableCell>
              <TableCell className="text-sm tabular-nums">{formatBRL(c.cpa)}</TableCell>
              <TableCell className="text-sm tabular-nums">{formatPercent(c.conversao)}</TableCell>
              <TableCell className="text-sm tabular-nums">{formatNumber(c.roas, 2)}x</TableCell>
              <TableCell className={`text-sm tabular-nums font-medium ${c.lucro >= 0 ? "text-success" : "text-destructive"}`}>
                {formatBRL(c.lucro)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <CampaignFormDialog
                    campaign={c}
                    trigger={
                      <Button size="icon" variant="ghost" className="size-7">
                        <Pencil className="size-3.5" />
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    trigger={
                      <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    }
                    title="Excluir campanha"
                    description={`Excluir "${c.nome}"?`}
                    destructive
                    confirmLabel="Excluir"
                    onConfirm={async () => {
                      const result = await deleteCampaignAction(c.id);
                      if (result.error) toast.error(result.error);
                      else toast.success("Campanha excluída.");
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
