"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saleSchema, type SaleFormValues } from "@/lib/validations/sale";
import { createSaleAction, updateSaleAction } from "@/lib/actions/sales";
import {
  STATUS_ENTREGA_LABEL,
  STATUS_REEMBOLSO_LABEL,
  METODOS_PAGAMENTO_PADRAO,
} from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import type { Product, Campaign, Agent, Chip as ChipType } from "@/lib/types";
import type { SaleRow } from "@/lib/data/sales";

export function SaleFormDialog({
  trigger,
  sale,
  products,
  campaigns,
  agents,
  chips,
}: {
  trigger: React.ReactNode;
  sale?: SaleRow;
  products: Product[];
  campaigns: Campaign[];
  agents: Agent[];
  chips: ChipType[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: sale
      ? {
          cliente_nome: sale.cliente_nome,
          product_id: sale.product_id,
          preco_original: Number(sale.preco_original),
          valor_esperado: Number(sale.valor_esperado),
          valor_recebido: Number(sale.valor_recebido),
          desconto: Number(sale.desconto),
          forma_pagamento: sale.forma_pagamento ?? "",
          data_pagamento: sale.data_pagamento ? sale.data_pagamento.slice(0, 16) : "",
          campaign_id: sale.campaign_id ?? "",
          creative_id: sale.creative_id ?? "",
          agent_id: sale.agent_id ?? "",
          chip_id: sale.chip_id ?? "",
          upsell: sale.upsell,
          status_reembolso: sale.status_reembolso,
          status_entrega: sale.status_entrega,
          observacoes: sale.observacoes ?? "",
        }
      : {
          cliente_nome: "",
          product_id: products[0]?.id ?? "",
          preco_original: 0,
          valor_esperado: 0,
          valor_recebido: 0,
          desconto: 0,
          forma_pagamento: "PIX",
          data_pagamento: new Date().toISOString().slice(0, 16),
          campaign_id: "",
          creative_id: "",
          agent_id: "",
          chip_id: "",
          upsell: false,
          status_reembolso: "nenhum",
          status_entrega: "pendente",
          observacoes: "",
        },
  });

  const valorEsperado = watch("valor_esperado");
  const valorRecebido = watch("valor_recebido");
  const contribuicao = (Number(valorRecebido) || 0) - (Number(valorEsperado) || 0);

  function onSubmit(values: SaleFormValues) {
    startTransition(async () => {
      const result = sale ? await updateSaleAction(sale.id, values) : await createSaleAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(sale ? "Venda atualizada." : "Venda registrada.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{sale ? "Editar venda" : "Registrar venda"}</DialogTitle>
          <DialogDescription>
            O valor recebido pode ser diferente do valor esperado — a diferença é calculada automaticamente como contribuição adicional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cliente" error={errors.cliente_nome?.message} full>
              <Input {...register("cliente_nome")} placeholder="Nome do cliente" />
            </Field>

            <Field label="Produto" error={errors.product_id?.message} full>
              <Controller
                control={control}
                name="product_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => {
                    field.onChange(v);
                    const p = products.find((x) => x.id === v);
                    if (p && !sale) {
                      setValue("preco_original", Number(p.preco_principal));
                      setValue("valor_esperado", Number(p.preco_principal));
                      setValue("valor_recebido", Number(p.preco_principal));
                    }
                  }}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Preço original (R$)" error={errors.preco_original?.message}>
              <Input type="number" step="0.01" {...register("preco_original", { valueAsNumber: true })} />
            </Field>
            <Field label="Desconto (R$)" error={errors.desconto?.message}>
              <Input type="number" step="0.01" {...register("desconto", { valueAsNumber: true })} />
            </Field>

            <Field label="Valor esperado (R$)" error={errors.valor_esperado?.message}>
              <Input type="number" step="0.01" {...register("valor_esperado", { valueAsNumber: true })} />
            </Field>
            <Field label="Valor recebido (R$)" error={errors.valor_recebido?.message}>
              <Input type="number" step="0.01" {...register("valor_recebido", { valueAsNumber: true })} />
            </Field>

            {contribuicao !== 0 && (
              <div className="col-span-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
                Contribuição adicional calculada:{" "}
                <span className={contribuicao > 0 ? "font-medium text-success" : "font-medium text-destructive"}>
                  {formatBRL(contribuicao)}
                </span>
              </div>
            )}

            <Field label="Forma de pagamento">
              <Controller
                control={control}
                name="forma_pagamento"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {METODOS_PAGAMENTO_PADRAO.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Data do pagamento">
              <Input type="datetime-local" {...register("data_pagamento")} />
            </Field>

            <Field label="Campanha">
              <Controller
                control={control}
                name="campaign_id"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Atendente">
              <Controller
                control={control}
                name="agent_id"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Chip utilizado">
              <Controller
                control={control}
                name="chip_id"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {chips.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <div className="flex items-end gap-2 pb-1.5">
              <Controller
                control={control}
                name="upsell"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
              <Label className="font-normal">Venda de upsell</Label>
            </div>

            <Field label="Status de entrega">
              <Controller
                control={control}
                name="status_entrega"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_ENTREGA_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Status de reembolso">
              <Controller
                control={control}
                name="status_reembolso"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_REEMBOLSO_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Observações" full>
              <Textarea {...register("observacoes")} rows={2} />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {sale ? "Salvar alterações" : "Registrar venda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
  full,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function NewSaleTrigger() {
  return (
    <Button className="gap-1.5">
      <Plus className="size-4" /> Registrar venda
    </Button>
  );
}
