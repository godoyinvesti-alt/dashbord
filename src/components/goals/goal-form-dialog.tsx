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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { goalSchema, type GoalFormValues } from "@/lib/validations/goal";
import { createGoalAction, updateGoalAction } from "@/lib/actions/goals";
import { TIPO_META_LABEL } from "@/lib/constants";
import type { Goal, Product, Agent } from "@/lib/types";

export function GoalFormDialog({
  trigger,
  goal,
  products,
  agents,
}: {
  trigger: React.ReactNode;
  goal?: Goal;
  products: Product[];
  agents: Agent[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: goal
      ? {
          tipo: goal.tipo,
          periodo_inicio: goal.periodo_inicio,
          periodo_fim: goal.periodo_fim,
          valor_meta: Number(goal.valor_meta),
          produto_id: goal.produto_id ?? "",
          agent_id: goal.agent_id ?? "",
        }
      : {
          tipo: "faturamento_mensal",
          periodo_inicio: new Date().toISOString().slice(0, 10),
          periodo_fim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
          valor_meta: 0,
          produto_id: "",
          agent_id: "",
        },
  });

  const tipo = watch("tipo");

  function onSubmit(values: GoalFormValues) {
    startTransition(async () => {
      const result = goal ? await updateGoalAction(goal.id, values) : await createGoalAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(goal ? "Meta atualizada." : "Meta criada.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? "Editar meta" : "Nova meta"}</DialogTitle>
          <DialogDescription>Defina metas para acompanhar o desempenho da sua operação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de meta" full>
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPO_META_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {tipo === "receita_por_produto" && (
              <Field label="Produto" full>
                <Controller
                  control={control}
                  name="produto_id"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}

            {tipo === "receita_por_agente" && (
              <Field label="Atendente" full>
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
            )}

            <Field label="Início do período" error={errors.periodo_inicio?.message}>
              <Input type="date" {...register("periodo_inicio")} />
            </Field>
            <Field label="Fim do período" error={errors.periodo_fim?.message}>
              <Input type="date" {...register("periodo_fim")} />
            </Field>
            <Field label="Valor da meta" error={errors.valor_meta?.message} full>
              <Input type="number" step="0.01" {...register("valor_meta", { valueAsNumber: true })} />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {goal ? "Salvar alterações" : "Criar meta"}
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

export function NewGoalTrigger() {
  return (
    <Button className="gap-1.5">
      <Plus className="size-4" /> Nova meta
    </Button>
  );
}
