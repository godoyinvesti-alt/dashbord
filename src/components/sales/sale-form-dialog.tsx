"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Plus, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saleFormSchema, type SaleFormValues } from "@/lib/validations/sale";
import { createSaleAction, updateSaleAction } from "@/lib/actions/sales";
import { FORMAS_PAGAMENTO_PADRAO } from "@/lib/constants";
import type { ChipSelectOption } from "@/lib/data/sales";
import type { Sale } from "@/lib/types";

const SEM_CHIP = "sem_chip";

function toFormValues(sale?: Sale): SaleFormValues {
  return {
    data: sale?.data ?? format(new Date(), "yyyy-MM-dd"),
    valor_recebido: sale?.valor_recebido ?? 0,
    produto: sale?.produto ?? "",
    cliente: sale?.cliente ?? "",
    chip_id: sale?.chip_id ?? "",
    vendedor: sale?.vendedor ?? "",
    origem_lead: sale?.origem_lead ?? "",
    forma_pagamento: sale?.forma_pagamento ?? "",
    taxas: sale?.taxas ?? 0,
    reembolso: sale?.reembolso ?? 0,
    observacoes: sale?.observacoes ?? "",
  };
}

export function SaleFormDialog({
  sale,
  chips,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  sale?: Sale;
  chips: ChipSelectOption[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;
  const isEdit = Boolean(sale);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: toFormValues(sale),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(sale));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: SaleFormValues) {
    const result = isEdit && sale ? await updateSaleAction(sale.id, values) : await createSaleAction(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Venda atualizada com sucesso." : "Venda registrada com sucesso.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus /> Registrar venda
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar venda" : "Registrar venda"}</DialogTitle>
          <DialogDescription>
            Preencha os dados da venda. Os campos essenciais vêm primeiro para um lançamento rápido.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" autoFocus {...form.register("data")} />
              {form.formState.errors.data && (
                <p className="text-xs text-destructive">{form.formState.errors.data.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valor_recebido">Valor recebido</Label>
              <Input
                id="valor_recebido"
                type="number"
                step="0.01"
                min={0}
                inputMode="decimal"
                placeholder="0,00"
                {...form.register("valor_recebido", { valueAsNumber: true })}
              />
              {form.formState.errors.valor_recebido && (
                <p className="text-xs text-destructive">{form.formState.errors.valor_recebido.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="produto">Produto</Label>
              <Input id="produto" placeholder="Ex.: Curso de tráfego pago" {...form.register("produto")} />
              {form.formState.errors.produto && (
                <p className="text-xs text-destructive">{form.formState.errors.produto.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="cliente">Cliente</Label>
              <Input id="cliente" placeholder="Nome do cliente" {...form.register("cliente")} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Chip responsável</Label>
              <Select
                value={form.watch("chip_id") || SEM_CHIP}
                onValueChange={(v) => form.setValue("chip_id", v === SEM_CHIP ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um chip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_CHIP}>Sem chip vinculado</SelectItem>
                  {chips.map((chip) => (
                    <SelectItem key={chip.id} value={chip.id}>
                      {chip.nome} ({chip.numero})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendedor">Vendedor</Label>
              <Input id="vendedor" placeholder="Nome do vendedor" {...form.register("vendedor")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="origem_lead">Origem do lead</Label>
              <Input id="origem_lead" placeholder="Ex.: Instagram, indicação..." {...form.register("origem_lead")} />
            </div>
            <div className="space-y-1.5">
              <Label>Forma de pagamento</Label>
              <Select
                value={form.watch("forma_pagamento") || ""}
                onValueChange={(v) => form.setValue("forma_pagamento", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO_PADRAO.map((forma) => (
                    <SelectItem key={forma} value={forma}>
                      {forma}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxas">Taxas</Label>
              <Input
                id="taxas"
                type="number"
                step="0.01"
                min={0}
                inputMode="decimal"
                placeholder="0,00"
                {...form.register("taxas", { valueAsNumber: true })}
              />
              {form.formState.errors.taxas && (
                <p className="text-xs text-destructive">{form.formState.errors.taxas.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reembolso">Reembolso</Label>
              <Input
                id="reembolso"
                type="number"
                step="0.01"
                min={0}
                inputMode="decimal"
                placeholder="0,00"
                {...form.register("reembolso", { valueAsNumber: true })}
              />
              {form.formState.errors.reembolso && (
                <p className="text-xs text-destructive">{form.formState.errors.reembolso.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" rows={3} {...form.register("observacoes")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Salvar alterações" : "Registrar venda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
