"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { chipFormSchema, type ChipFormValues } from "@/lib/validations/chip";
import { createChipAction, updateChipAction } from "@/lib/actions/chips";
import { OPERADORA_LABEL, STATUS_CHIP_LABEL, STATUS_CHIP_OPCOES } from "@/lib/constants";
import type { Chip, Operadora } from "@/lib/types";

function toFormValues(chip?: Chip, diasAquecimentoPadrao = 21): ChipFormValues {
  return {
    nome: chip?.nome ?? "",
    numero: chip?.numero ?? "",
    operadora: chip?.operadora ?? "vivo",
    status: chip?.status ?? "novo",
    data_ativacao: chip?.data_ativacao ?? "",
    data_inicio_aquecimento: chip?.data_inicio_aquecimento ?? "",
    meta_dias_aquecimento: chip?.meta_dias_aquecimento ?? diasAquecimentoPadrao,
    responsavel: chip?.responsavel ?? "",
    operacao_vinculada: chip?.operacao_vinculada ?? "",
    observacoes: chip?.observacoes ?? "",
  };
}

export function ChipFormDialog({
  chip,
  diasAquecimentoPadrao = 21,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  chip?: Chip;
  diasAquecimentoPadrao?: number;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;
  const isEdit = Boolean(chip);

  const form = useForm<ChipFormValues>({
    resolver: zodResolver(chipFormSchema),
    defaultValues: toFormValues(chip, diasAquecimentoPadrao),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(chip, diasAquecimentoPadrao));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: ChipFormValues) {
    const result = isEdit && chip ? await updateChipAction(chip.id, values) : await createChipAction(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Chip atualizado com sucesso." : "Chip criado com sucesso.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus /> Novo chip
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar chip" : "Novo chip"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do chip para acompanhar aquecimento, recargas e status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Ex.: Chip 01 - Vendas" {...form.register("nome")} />
              {form.formState.errors.nome && (
                <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero">Número</Label>
              <Input id="numero" placeholder="(11) 91234-5678" {...form.register("numero")} />
              {form.formState.errors.numero && (
                <p className="text-xs text-destructive">{form.formState.errors.numero.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Operadora</Label>
              <Select
                value={form.watch("operadora")}
                onValueChange={(v) => form.setValue("operadora", v as Operadora)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OPERADORA_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as ChipFormValues["status"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_CHIP_OPCOES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CHIP_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meta_dias_aquecimento">Meta de dias de aquecimento</Label>
              <Input
                id="meta_dias_aquecimento"
                type="number"
                min={1}
                {...form.register("meta_dias_aquecimento", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_ativacao">Data de ativação</Label>
              <Input id="data_ativacao" type="date" {...form.register("data_ativacao")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_inicio_aquecimento">Início do aquecimento</Label>
              <Input
                id="data_inicio_aquecimento"
                type="date"
                {...form.register("data_inicio_aquecimento")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input id="responsavel" placeholder="Nome do responsável" {...form.register("responsavel")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="operacao_vinculada">Operação vinculada</Label>
              <Input id="operacao_vinculada" placeholder="Ex.: Operação A" {...form.register("operacao_vinculada")} />
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
              {isEdit ? "Salvar alterações" : "Criar chip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
