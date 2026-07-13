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
import { expenseFormSchema, type ExpenseFormValues } from "@/lib/validations/expense";
import { createExpenseAction, updateExpenseAction } from "@/lib/actions/expenses";
import { CATEGORIA_DESPESA_LABEL, CATEGORIA_DESPESA_OPCOES } from "@/lib/constants";
import type { Expense } from "@/lib/types";

function toFormValues(expense?: Expense): ExpenseFormValues {
  return {
    descricao: expense?.descricao ?? "",
    valor: expense?.valor ?? 0,
    categoria: expense?.categoria ?? "outros",
    data: expense?.data ?? new Date().toISOString().slice(0, 10),
    operacao_vinculada: expense?.operacao_vinculada ?? "",
    observacoes: expense?.observacoes ?? "",
  };
}

export function ExpenseFormDialog({
  expense,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  expense?: Expense;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;
  const isEdit = Boolean(expense);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: toFormValues(expense),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(expense));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: ExpenseFormValues) {
    const result =
      isEdit && expense ? await updateExpenseAction(expense.id, values) : await createExpenseAction(values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Despesa atualizada com sucesso." : "Despesa criada com sucesso.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus /> Nova despesa
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          <DialogDescription>
            Registre despesas para acompanhar o resultado financeiro do negócio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" placeholder="Ex.: Anúncios Meta Ads" {...form.register("descricao")} />
              {form.formState.errors.descricao && (
                <p className="text-xs text-destructive">{form.formState.errors.descricao.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min={0}
                {...form.register("valor", { valueAsNumber: true })}
              />
              {form.formState.errors.valor && (
                <p className="text-xs text-destructive">{form.formState.errors.valor.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" {...form.register("data")} />
              {form.formState.errors.data && (
                <p className="text-xs text-destructive">{form.formState.errors.data.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Categoria</Label>
              <Select
                value={form.watch("categoria")}
                onValueChange={(v) => form.setValue("categoria", v as ExpenseFormValues["categoria"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIA_DESPESA_OPCOES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORIA_DESPESA_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="operacao_vinculada">Operação vinculada</Label>
              <Input
                id="operacao_vinculada"
                placeholder="Ex.: Operação A"
                {...form.register("operacao_vinculada")}
              />
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
              {isEdit ? "Salvar alterações" : "Criar despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
