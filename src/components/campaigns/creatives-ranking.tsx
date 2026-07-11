"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Image as ImageIcon, Trophy } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CreativeFormDialog } from "@/components/campaigns/creative-form-dialog";
import { formatBRL, formatNumber, formatPercent } from "@/lib/format";
import { deleteCreativeAction } from "@/lib/actions/campaigns";
import type { CreativeRow } from "@/lib/data/creatives";
import type { Campaign } from "@/lib/types";

const CRITERIOS = [
  { value: "vendas", label: "Mais vendas" },
  { value: "conversao", label: "Maior conversão" },
  { value: "custoPorVenda", label: "Menor custo por venda" },
  { value: "faturamento", label: "Maior faturamento" },
  { value: "lucro", label: "Maior lucro" },
  { value: "ticketMedio", label: "Melhor ticket médio" },
  { value: "qualidadeLead", label: "Melhor qualidade de lead" },
] as const;

type Criterio = (typeof CRITERIOS)[number]["value"];

export function CreativesRanking({
  creatives,
  campaigns,
}: {
  creatives: CreativeRow[];
  campaigns: Campaign[];
}) {
  const [criterio, setCriterio] = useState<Criterio>("vendas");

  const sorted = useMemo(() => {
    const list = [...creatives];
    list.sort((a, b) => {
      if (criterio === "custoPorVenda") {
        const aVal = a.custoPorVenda || Infinity;
        const bVal = b.custoPorVenda || Infinity;
        return aVal - bVal;
      }
      return b[criterio] - a[criterio];
    });
    return list;
  }, [creatives, criterio]);

  if (creatives.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="Nenhum criativo cadastrado"
        description="Cadastre os criativos usados em suas campanhas para acompanhar o ranking de performance."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="size-4 text-primary" />
        <span className="text-sm font-medium">Ranking por:</span>
        <Select value={criterio} onValueChange={(v) => setCriterio(v as Criterio)}>
          <SelectTrigger size="sm" className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CRITERIOS.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Criativo</TableHead>
              <TableHead>Campanha</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Vendas</TableHead>
              <TableHead>Conversão</TableHead>
              <TableHead>Custo/venda</TableHead>
              <TableHead>Faturamento</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead>Qualidade do lead</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c, idx) => (
              <TableRow key={c.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {idx === 0 ? <Badge variant="soft-success">1º</Badge> : idx + 1}
                </TableCell>
                <TableCell className="max-w-40 truncate text-sm font-medium">
                  {c.nome}
                  {c.hook && <p className="truncate text-xs font-normal text-muted-foreground">{c.hook}</p>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.campanha_nome ?? "—"}</TableCell>
                <TableCell className="text-sm tabular-nums">{formatNumber(c.leads)}</TableCell>
                <TableCell className="text-sm tabular-nums">{formatNumber(c.vendas)}</TableCell>
                <TableCell className="text-sm tabular-nums">{formatPercent(c.conversao)}</TableCell>
                <TableCell className="text-sm tabular-nums">{formatBRL(c.custoPorVenda)}</TableCell>
                <TableCell className="text-sm tabular-nums">{formatBRL(c.faturamento)}</TableCell>
                <TableCell className={`text-sm tabular-nums ${c.lucro >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatBRL(c.lucro)}
                </TableCell>
                <TableCell className="text-sm tabular-nums">{formatPercent(c.qualidadeLead)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CreativeFormDialog
                      creative={c}
                      campaigns={campaigns}
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
                      title="Excluir criativo"
                      description={`Excluir "${c.nome}"?`}
                      destructive
                      confirmLabel="Excluir"
                      onConfirm={async () => {
                        const result = await deleteCreativeAction(c.id);
                        if (result.error) toast.error(result.error);
                        else toast.success("Criativo excluído.");
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
