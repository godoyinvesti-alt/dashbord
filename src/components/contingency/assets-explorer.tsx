import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { SelectFilter } from "@/components/shared/select-filter";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssetFormDialog } from "@/components/contingency/asset-form-dialog";
import { AssetRowActions } from "@/components/contingency/asset-row-actions";
import { StatusContingenciaBadge, TipoAtivoBadge } from "@/components/contingency/asset-badges";
import { TIPO_ATIVO_LABEL, TIPO_ATIVO_OPCOES, STATUS_CONTINGENCIA_LABEL, STATUS_CONTINGENCIA_OPCOES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { ContingencyAsset } from "@/lib/types";

export function AssetsExplorer({
  assets,
  total,
  page,
  totalPages,
}: {
  assets: ContingencyAsset[];
  total: number;
  page: number;
  totalPages: number;
}) {
  return (
    <div>
      <PageHeader
        title="Contingência"
        description="Gerencie os ativos de contingência: chips, números, dispositivos, perfis, BMs, contas de anúncio e mais."
        actions={<AssetFormDialog />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Buscar por nome, identificador ou responsável..." className="w-full sm:w-72" />
        <SelectFilter
          paramName="tipo"
          placeholder="Tipo"
          options={TIPO_ATIVO_OPCOES.map((t) => ({ value: t, label: TIPO_ATIVO_LABEL[t] }))}
        />
        <SelectFilter
          paramName="status"
          placeholder="Status"
          options={STATUS_CONTINGENCIA_OPCOES.map((s) => ({ value: s, label: STATUS_CONTINGENCIA_LABEL[s] }))}
        />
      </div>

      {assets.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhum ativo encontrado"
          description="Cadastre seu primeiro ativo de contingência para começar a organizar chips, contas e perfis reserva."
          action={<AssetFormDialog />}
        />
      ) : (
        <>
          {/* Desktop: tabela */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ativação</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <p className="font-medium">{asset.nome}</p>
                      <p className="text-xs text-muted-foreground">{asset.identificador || "—"}</p>
                    </TableCell>
                    <TableCell>
                      <TipoAtivoBadge tipo={asset.tipo} />
                    </TableCell>
                    <TableCell>
                      <StatusContingenciaBadge status={asset.status} />
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(asset.data_ativacao)}</TableCell>
                    <TableCell className="text-sm">{asset.responsavel || "—"}</TableCell>
                    <TableCell className="text-sm">{asset.operacao_vinculada || "—"}</TableCell>
                    <TableCell>
                      <AssetRowActions asset={asset} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="px-4">
              <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={20} />
            </div>
          </Card>

          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {assets.map((asset) => (
              <Card key={asset.id} className="py-4">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{asset.nome}</p>
                      <p className="text-xs text-muted-foreground">{asset.identificador || "—"}</p>
                    </div>
                    <AssetRowActions asset={asset} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <TipoAtivoBadge tipo={asset.tipo} />
                    <StatusContingenciaBadge status={asset.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>Ativação: {formatDate(asset.data_ativacao)}</p>
                    <p>Responsável: {asset.responsavel || "—"}</p>
                    <p>Operação: {asset.operacao_vinculada || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <PaginationControls page={page} totalPages={totalPages} totalItems={total} pageSize={20} />
          </div>
        </>
      )}
    </div>
  );
}
