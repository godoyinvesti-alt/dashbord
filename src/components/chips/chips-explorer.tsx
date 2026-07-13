import Link from "next/link";
import { Smartphone } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { SelectFilter } from "@/components/shared/select-filter";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ChipFormDialog } from "@/components/chips/chip-form-dialog";
import { ChipRowActions } from "@/components/chips/chip-row-actions";
import { StatusChipBadge, OperadoraBadge, NivelAlertaBadge } from "@/components/chips/chip-badges";
import { NIVEL_ALERTA_ROW_CLASS } from "@/lib/chip-calc";
import { STATUS_CHIP_LABEL, STATUS_CHIP_OPCOES } from "@/lib/constants";
import { formatDate, formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChipComputed } from "@/lib/types";

export function ChipsExplorer({
  chips,
  total,
  page,
  totalPages,
  diasAquecimentoPadrao,
}: {
  chips: ChipComputed[];
  total: number;
  page: number;
  totalPages: number;
  diasAquecimentoPadrao: number;
}) {
  return (
    <div>
      <PageHeader
        title="Chips"
        description="Gerencie chips, acompanhe aquecimento, recargas e banimentos."
        actions={<ChipFormDialog diasAquecimentoPadrao={diasAquecimentoPadrao} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Buscar por nome, número ou responsável..." className="w-full sm:w-72" />
        <SelectFilter
          paramName="status"
          placeholder="Status"
          options={STATUS_CHIP_OPCOES.map((s) => ({ value: s, label: STATUS_CHIP_LABEL[s] }))}
        />
      </div>

      {chips.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="Nenhum chip encontrado"
          description="Cadastre seu primeiro chip para começar a acompanhar aquecimento e recargas."
          action={<ChipFormDialog diasAquecimentoPadrao={diasAquecimentoPadrao} />}
        />
      ) : (
        <>
          {/* Desktop: tabela */}
          <Card className="hidden py-0 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chip</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aquecimento</TableHead>
                  <TableHead>Recarga</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {chips.map((chip) => (
                  <TableRow key={chip.id} className={cn(NIVEL_ALERTA_ROW_CLASS[chip.nivel_alerta_recarga])}>
                    <TableCell>
                      <Link href={`/dashboard/chips/${chip.id}`} className="block">
                        <p className="font-medium hover:underline">{chip.nome}</p>
                        <p className="text-xs text-muted-foreground">{chip.numero}</p>
                      </Link>
                      <div className="mt-1">
                        <OperadoraBadge operadora={chip.operadora} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusChipBadge status={chip.status} />
                    </TableCell>
                    <TableCell className="min-w-36">
                      {chip.progresso_aquecimento !== null ? (
                        <div className="space-y-1">
                          <Progress value={chip.progresso_aquecimento} className="h-1.5" />
                          <p className="text-xs text-muted-foreground">
                            {chip.dias_aquecido}/{chip.meta_dias_aquecimento} dias
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-xs">{formatDate(chip.data_ultima_recarga)}</p>
                        <NivelAlertaBadge nivel={chip.nivel_alerta_recarga} />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{chip.responsavel || "—"}</TableCell>
                    <TableCell className="text-sm">{chip.operacao_vinculada || "—"}</TableCell>
                    <TableCell>
                      <ChipRowActions chip={chip} diasAquecimentoPadrao={diasAquecimentoPadrao} />
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
            {chips.map((chip) => (
              <Card key={chip.id} className={cn("py-4", NIVEL_ALERTA_ROW_CLASS[chip.nivel_alerta_recarga])}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/dashboard/chips/${chip.id}`} className="min-w-0">
                      <p className="truncate font-medium hover:underline">{chip.nome}</p>
                      <p className="text-xs text-muted-foreground">{chip.numero}</p>
                    </Link>
                    <ChipRowActions chip={chip} diasAquecimentoPadrao={diasAquecimentoPadrao} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusChipBadge status={chip.status} />
                    <OperadoraBadge operadora={chip.operadora} />
                    <NivelAlertaBadge nivel={chip.nivel_alerta_recarga} />
                  </div>
                  {chip.progresso_aquecimento !== null && (
                    <div className="space-y-1">
                      <Progress value={chip.progresso_aquecimento} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        Aquecimento: {chip.dias_aquecido}/{chip.meta_dias_aquecimento} dias
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <p>Última recarga: {formatDate(chip.data_ultima_recarga)}</p>
                    <p>Valor: {chip.valor_ultima_recarga ? formatBRL(chip.valor_ultima_recarga) : "—"}</p>
                    <p>Responsável: {chip.responsavel || "—"}</p>
                    <p>Operação: {chip.operacao_vinculada || "—"}</p>
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
