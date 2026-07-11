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
import { expenseSchema, type ExpenseFormValues } from "@/lib/validations/expense";
import { createExpenseAction, updateExpenseAction } from "@/lib/actions/expenses";
import { CATEGORIA_DESPESA_LABEL } from "@/lib/constants";
import type { Expense } from "@/lib/types";

export function ExpenseFormDialog({
  trigger,
  expense,
}: {
  trigger: React.ReactNode;
  expense?: Expense;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          descricao: expense.descricao,
          categoria: expense.categoria,
          valor: Number(expense.valor),
          data: expense.data,
          recorrente: expense.recorrente,
          observacoes: expense.observacoes ?? "",
        }
      : {
          descricao: "",
          categoria: "trafego_pago",
          valor: 0,
          data: new Date().toISOString().slice(0, 10),
          recorrente: false,
          observacoes: "",
        },
  });

  function onSubmit(values: ExpenseFormValues) {
    startTransition(async () => {
      const result = expense
        ? await updateExpenseAction(expense.id, values)
        : await createExpenseAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(expense ? "Despesa atualizada." : "Despesa registrada.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          <DialogDescription>Registre despesas manuais da sua operação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Descrição" error={errors.descricao?.message} full>
              <Input {...register("descricao")} placeholder="Ex.: Anúncios Meta Ads" />
            </Field>
            <Field label="Categoria">
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIA_DESPESA_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Valor (R$)" error={errors.valor?.message}>
              <Input type="number" step="0.01" {...register("valor", { valueAsNumber: true })} />
            </Field>
            <Field label="Data" error={errors.data?.message}>
              <Input type="date" {...register("data")} />
            </Field>
            <div className="flex items-center gap-2 pb-1.5">
              <Controller
                control={control}
                name="recorrente"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
              <Label className="font-normal">Despesa recorrente</Label>
            </div>
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
              {expense ? "Salvar alterações" : "Registrar despesa"}
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

export function NewExpenseTrigger() {
  return (
    <Button variant="outline" className="gap-1.5">
      <Plus className="size-4" /> Nova despesa
    </Button>
  );
}
