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
import {
  contingencyAssetFormSchema,
  type ContingencyAssetFormValues,
} from "@/lib/validations/contingency-asset";
import { createContingencyAssetAction, updateContingencyAssetAction } from "@/lib/actions/contingency-assets";
import { TIPO_ATIVO_LABEL, TIPO_ATIVO_OPCOES, STATUS_CONTINGENCIA_LABEL, STATUS_CONTINGENCIA_OPCOES } from "@/lib/constants";
import type { ContingencyAsset, TipoAtivoContingencia } from "@/lib/types";

function toFormValues(asset?: ContingencyAsset): ContingencyAssetFormValues {
  return {
    nome: asset?.nome ?? "",
    tipo: asset?.tipo ?? "chip",
    identificador: asset?.identificador ?? "",
    status: asset?.status ?? "disponivel",
    responsavel: asset?.responsavel ?? "",
    data_ativacao: asset?.data_ativacao ?? "",
    operacao_vinculada: asset?.operacao_vinculada ?? "",
    observacoes: asset?.observacoes ?? "",
  };
}

export function AssetFormDialog({
  asset,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  asset?: ContingencyAsset;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;
  const isEdit = Boolean(asset);

  const form = useForm<ContingencyAssetFormValues>({
    resolver: zodResolver(contingencyAssetFormSchema),
    defaultValues: toFormValues(asset),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(asset));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: ContingencyAssetFormValues) {
    const result =
      isEdit && asset ? await updateContingencyAssetAction(asset.id, values) : await createContingencyAssetAction(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Ativo atualizado com sucesso." : "Ativo criado com sucesso.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus /> Novo ativo
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar ativo" : "Novo ativo"}</DialogTitle>
          <DialogDescription>
            Preencha os dados do ativo de contingência para acompanhar disponibilidade e uso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Ex.: BM 01 - Operação A" {...form.register("nome")} />
              {form.formState.errors.nome && (
                <p className="text-xs text-destructive">{form.formState.errors.nome.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={form.watch("tipo")}
                onValueChange={(v) => form.setValue("tipo", v as TipoAtivoContingencia)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_ATIVO_OPCOES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_ATIVO_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="identificador">Identificador</Label>
              <Input
                id="identificador"
                placeholder="Ex.: ID, número ou e-mail"
                {...form.register("identificador")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as ContingencyAssetFormValues["status"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_CONTINGENCIA_OPCOES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONTINGENCIA_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_ativacao">Data de ativação</Label>
              <Input id="data_ativacao" type="date" {...form.register("data_ativacao")} />
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
              {isEdit ? "Salvar alterações" : "Criar ativo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
