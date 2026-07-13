import Link from "next/link";
import { ArrowLeft, CalendarClock, Banknote, Ban as BanIcon, History } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatusChipBadge, NivelAlertaBadge } from "@/components/chips/chip-badges";
import { ChipRowActions } from "@/components/chips/chip-row-actions";
import { STATUS_CHIP_LABEL } from "@/lib/constants";
import { formatBRL, formatDate, formatDateTime } from "@/lib/format";
import type { ChipDetail } from "@/lib/data/chips";

export function ChipDetailView({ detail, diasAquecimentoPadrao }: { detail: ChipDetail; diasAquecimentoPadrao: number }) {
  const { chip, recharges, bans, statusHistory } = detail;

  return (
    <div>
      <Link
        href="/dashboard/chips"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar para chips
      </Link>

      <PageHeader
        title={chip.nome}
        description={`${chip.numero} · ${chip.operadora.toUpperCase()}`}
        actions={<ChipRowActions chip={chip} bans={bans} diasAquecimentoPadrao={diasAquecimentoPadrao} showDetailLink={false} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusChipBadge status={chip.status} />
        <NivelAlertaBadge nivel={chip.nivel_alerta_recarga} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Progresso de aquecimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chip.progresso_aquecimento !== null ? (
              <>
                <Progress value={chip.progresso_aquecimento} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {chip.dias_aquecido} de {chip.meta_dias_aquecimento} dias ({chip.progresso_aquecimento.toFixed(0)}%)
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Este chip ainda não iniciou o aquecimento.</p>
            )}
            <div className="grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-4">
              <Info label="Ativação" value={formatDate(chip.data_ativacao)} />
              <Info label="Início aquecimento" value={formatDate(chip.data_inicio_aquecimento)} />
              <Info label="Última recarga" value={formatDate(chip.data_ultima_recarga)} />
              <Info
                label="Próxima recarga recomendada"
                value={chip.proxima_recarga_recomendada ? formatDate(chip.proxima_recarga_recomendada) : "—"}
              />
              <Info label="Dias desde recarga" value={chip.dias_desde_recarga?.toString() ?? "—"} />
              <Info label="Quedas" value={String(chip.quantidade_quedas)} />
              <Info label="Banimentos" value={String(chip.quantidade_banimentos)} />
              <Info label="Responsável" value={chip.responsavel || "—"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operação vinculada</span>
              <span className="font-medium">{chip.operacao_vinculada || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última recarga (valor)</span>
              <span className="font-medium">
                {chip.valor_ultima_recarga !== null ? formatBRL(chip.valor_ultima_recarga) : "—"}
              </span>
            </div>
            {chip.observacoes && (
              <div className="border-t pt-2">
                <p className="mb-1 text-xs text-muted-foreground">Observações</p>
                <p className="whitespace-pre-line text-sm">{chip.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Banknote className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Histórico de recargas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recharges.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma recarga registrada.</p>
            ) : (
              recharges.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b pb-2 text-sm last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{formatDate(r.data)}</p>
                    {r.observacoes && <p className="text-xs text-muted-foreground">{r.observacoes}</p>}
                  </div>
                  <span className="font-medium tabular-nums">{formatBRL(r.valor)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <BanIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Histórico de banimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bans.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum banimento registrado.</p>
            ) : (
              bans.map((b) => (
                <div key={b.id} className="border-b pb-2 text-sm last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{formatDate(b.data)}</p>
                    <Badge variant={b.foi_recuperado ? "soft-success" : "soft-destructive"}>
                      {b.foi_recuperado ? "Recuperado" : "Não recuperado"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[b.plataforma, b.motivo].filter(Boolean).join(" · ") || "Sem detalhes"}
                  </p>
                  {b.foi_recuperado && b.data_recuperacao && (
                    <p className="text-xs text-muted-foreground">Recuperado em {formatDate(b.data_recuperacao)}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <History className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Histórico de status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma alteração de status registrada.</p>
            ) : (
              statusHistory.map((h) => (
                <div key={h.id} className="border-b pb-2 text-sm last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5">
                    {h.status_anterior && (
                      <span className="text-xs text-muted-foreground">{STATUS_CHIP_LABEL[h.status_anterior]} →</span>
                    )}
                    <span className="font-medium">{STATUS_CHIP_LABEL[h.status_novo]}</span>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="size-3" /> {formatDateTime(h.created_at)}
                  </p>
                  {h.observacao && <p className="text-xs text-muted-foreground">{h.observacao}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
