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
import { creativeSchema, type CreativeFormValues } from "@/lib/validations/campaign";
import { createCreativeAction, updateCreativeAction } from "@/lib/actions/campaigns";
import type { Campaign, Creative } from "@/lib/types";

export function CreativeFormDialog({
  trigger,
  creative,
  campaigns,
}: {
  trigger: React.ReactNode;
  creative?: Creative;
  campaigns: Campaign[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreativeFormValues>({
    resolver: zodResolver(creativeSchema),
    defaultValues: creative
      ? {
          campaign_id: creative.campaign_id,
          ad_set_id: creative.ad_set_id ?? "",
          nome: creative.nome,
          hook: creative.hook ?? "",
          url_preview: creative.url_preview ?? "",
          valor_investido: Number(creative.valor_investido),
        }
      : {
          campaign_id: campaigns[0]?.id ?? "",
          ad_set_id: "",
          nome: "",
          hook: "",
          url_preview: "",
          valor_investido: 0,
        },
  });

  function onSubmit(values: CreativeFormValues) {
    startTransition(async () => {
      const result = creative
        ? await updateCreativeAction(creative.id, values)
        : await createCreativeAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(creative ? "Criativo atualizado." : "Criativo criado.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{creative ? "Editar criativo" : "Novo criativo"}</DialogTitle>
          <DialogDescription>Cadastre os criativos usados em suas campanhas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Campanha" error={errors.campaign_id?.message} full>
              <Controller
                control={control}
                name="campaign_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Nome do criativo" error={errors.nome?.message} full>
              <Input {...register("nome")} placeholder="Ex.: Criativo 04 - Depoimento" />
            </Field>
            <Field label="Hook" full>
              <Input {...register("hook")} placeholder="Frase de abertura do criativo" />
            </Field>
            <Field label="Investimento (R$)">
              <Input type="number" step="0.01" {...register("valor_investido", { valueAsNumber: true })} />
            </Field>
            <Field label="Link de preview">
              <Input {...register("url_preview")} placeholder="https://..." />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {creative ? "Salvar alterações" : "Criar criativo"}
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

export function NewCreativeTrigger() {
  return (
    <Button className="gap-1.5">
      <Plus className="size-4" /> Novo criativo
    </Button>
  );
}
