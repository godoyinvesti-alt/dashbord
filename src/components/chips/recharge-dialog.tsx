"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Zap } from "lucide-react";
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
import { rechargeSchema, type RechargeFormValues } from "@/lib/validations/chip";
import { registerRechargeAction } from "@/lib/actions/chips";
import { OPERADORA_LABEL, METODOS_PAGAMENTO_PADRAO } from "@/lib/constants";
import type { Operadora } from "@/lib/types";

export function RegisterRechargeDialog({
  chipId,
  defaultCarrier,
  trigger,
}: {
  chipId: string;
  defaultCarrier: Operadora;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RechargeFormValues>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      recharge_date: new Date().toISOString().slice(0, 10),
      amount: 0,
      carrier: defaultCarrier,
      payment_method: "PIX",
      notes: "",
    },
  });

  function onSubmit(values: RechargeFormValues) {
    startTransition(async () => {
      const result = await registerRechargeAction(chipId, values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Recarga registrada com sucesso.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Zap className="size-3.5" /> Registrar recarga
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar recarga</DialogTitle>
          <DialogDescription>Isso atualiza a data da última recarga e remove o alerta de atraso.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label="Data da recarga" error={errors.recharge_date?.message}>
            <Input type="date" {...register("recharge_date")} />
          </Field>
          <Field label="Valor (R$)" error={errors.amount?.message}>
            <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
          </Field>
          <Field label="Operadora">
            <Controller
              control={control}
              name="carrier"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(OPERADORA_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Forma de pagamento">
            <Controller
              control={control}
              name="payment_method"
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
          <Field label="Observações">
            <Textarea {...register("notes")} rows={2} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Registrar
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
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
