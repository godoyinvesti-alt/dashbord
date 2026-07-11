"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle } from "lucide-react";
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
import { incidentSchema, type IncidentFormValues } from "@/lib/validations/chip";
import { registerIncidentAction } from "@/lib/actions/chips";
import { TIPO_INCIDENTE_LABEL, STATUS_CHIP_LABEL } from "@/lib/constants";
import type { StatusChip } from "@/lib/types";

export function RegisterIncidentDialog({
  chipId,
  currentStatus,
  trigger,
}: {
  chipId: string;
  currentStatus: StatusChip;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      incident_date: new Date().toISOString().slice(0, 16),
      incident_type: "whatsapp_desconectado",
      reason: "",
      description: "",
      new_status: currentStatus,
      action_taken: "",
    },
  });

  function onSubmit(values: IncidentFormValues) {
    startTransition(async () => {
      const result = await registerIncidentAction(chipId, values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Incidente registrado.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
            <AlertTriangle className="size-3.5" /> Registrar queda
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar queda / incidente</DialogTitle>
          <DialogDescription>Isso aumenta o contador de quedas do chip.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label="Data e hora" error={errors.incident_date?.message}>
            <Input type="datetime-local" {...register("incident_date")} />
          </Field>
          <Field label="Tipo de incidente">
            <Controller
              control={control}
              name="incident_type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_INCIDENTE_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Motivo">
            <Input {...register("reason")} placeholder="Motivo resumido" />
          </Field>
          <Field label="Descrição">
            <Textarea {...register("description")} rows={2} />
          </Field>
          <Field label="Novo status do chip">
            <Controller
              control={control}
              name="new_status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CHIP_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Ação tomada">
            <Input {...register("action_taken")} placeholder="Ex.: Chip colocado em recuperação" />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
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
