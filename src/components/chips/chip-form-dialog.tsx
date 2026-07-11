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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chipSchema, type ChipFormValues } from "@/lib/validations/chip";
import { createChipAction, updateChipAction } from "@/lib/actions/chips";
import { OPERADORA_LABEL, STATUS_CHIP_LABEL } from "@/lib/constants";
import type { Chip, Agent } from "@/lib/types";

export function ChipFormDialog({
  trigger,
  chip,
  agents,
}: {
  trigger: React.ReactNode;
  chip?: Chip;
  agents: Agent[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChipFormValues>({
    resolver: zodResolver(chipSchema),
    defaultValues: chip
      ? {
          name: chip.name,
          phone_number: chip.phone_number,
          carrier: chip.carrier,
          activation_date: chip.activation_date ?? "",
          status: chip.status,
          assigned_agent_id: chip.assigned_agent_id ?? "",
          operation_name: chip.operation_name ?? "",
          notes: chip.notes ?? "",
        }
      : {
          name: "",
          phone_number: "",
          carrier: "vivo",
          activation_date: new Date().toISOString().slice(0, 10),
          status: "em_aquecimento",
          assigned_agent_id: "",
          operation_name: "",
          notes: "",
        },
  });

  function onSubmit(values: ChipFormValues) {
    startTransition(async () => {
      const result = chip ? await updateChipAction(chip.id, values) : await createChipAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(chip ? "Chip atualizado." : "Chip adicionado.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chip ? "Editar chip" : "Adicionar chip"}</DialogTitle>
          <DialogDescription>Cadastre os chips e números de WhatsApp usados na operação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome do chip" error={errors.name?.message}>
              <Input {...register("name")} placeholder="Ex.: Vendas 01" />
            </Field>
            <Field label="Número do telefone" error={errors.phone_number?.message}>
              <Input {...register("phone_number")} placeholder="(11) 99999-9999" />
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
            <Field label="Status">
              <Controller
                control={control}
                name="status"
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
            <Field label="Data de ativação">
              <Input type="date" {...register("activation_date")} />
            </Field>
            <Field label="Atendente responsável">
              <Controller
                control={control}
                name="assigned_agent_id"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                    <SelectContent>
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Produto ou operação" full>
              <Input {...register("operation_name")} placeholder="Ex.: Vendas do produto X" />
            </Field>
            <Field label="Observações" full>
              <Textarea {...register("notes")} rows={2} />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {chip ? "Salvar alterações" : "Adicionar chip"}
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

export function NewChipTrigger() {
  return (
    <Button className="gap-1.5">
      <Plus className="size-4" /> Adicionar chip
    </Button>
  );
}
