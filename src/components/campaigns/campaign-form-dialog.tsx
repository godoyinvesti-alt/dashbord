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
import { campaignSchema, type CampaignFormValues } from "@/lib/validations/campaign";
import { createCampaignAction, updateCampaignAction } from "@/lib/actions/campaigns";
import { PLATAFORMA_LABEL } from "@/lib/constants";
import type { Campaign } from "@/lib/types";

export function CampaignFormDialog({
  trigger,
  campaign,
}: {
  trigger: React.ReactNode;
  campaign?: Campaign;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: campaign
      ? {
          plataforma: campaign.plataforma,
          nome: campaign.nome,
          data_inicio: campaign.data_inicio ?? "",
          data_fim: campaign.data_fim ?? "",
          valor_investido: Number(campaign.valor_investido),
        }
      : {
          plataforma: "meta_ads",
          nome: "",
          data_inicio: "",
          data_fim: "",
          valor_investido: 0,
        },
  });

  function onSubmit(values: CampaignFormValues) {
    startTransition(async () => {
      const result = campaign
        ? await updateCampaignAction(campaign.id, values)
        : await createCampaignAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(campaign ? "Campanha atualizada." : "Campanha criada.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{campaign ? "Editar campanha" : "Nova campanha"}</DialogTitle>
          <DialogDescription>Cadastre as campanhas de tráfego usadas para gerar leads.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome" error={errors.nome?.message} full>
              <Input {...register("nome")} placeholder="Nome da campanha" />
            </Field>
            <Field label="Plataforma">
              <Controller
                control={control}
                name="plataforma"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PLATAFORMA_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Investimento (R$)" error={errors.valor_investido?.message}>
              <Input type="number" step="0.01" {...register("valor_investido", { valueAsNumber: true })} />
            </Field>
            <Field label="Data de início">
              <Input type="date" {...register("data_inicio")} />
            </Field>
            <Field label="Data de fim">
              <Input type="date" {...register("data_fim")} />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {campaign ? "Salvar alterações" : "Criar campanha"}
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

export function NewCampaignTrigger() {
  return (
    <Button className="gap-1.5">
      <Plus className="size-4" /> Nova campanha
    </Button>
  );
}
