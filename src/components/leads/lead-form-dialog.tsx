"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadSchema, type LeadFormValues } from "@/lib/validations/lead";
import { createLeadAction, updateLeadAction } from "@/lib/actions/leads";
import {
  LEAD_TEMPERATURA_LABEL,
  STATUS_PAGAMENTO_LABEL,
  PLATAFORMA_LABEL,
  METODOS_PAGAMENTO_PADRAO,
} from "@/lib/constants";
import type { FunnelStage, Product, Campaign, Agent, Chip as ChipType } from "@/lib/types";
import type { LeadRow } from "@/lib/data/leads";

export function LeadFormDialog({
  trigger,
  lead,
  funnelStages,
  products,
  campaigns,
  agents,
  chips,
  defaultStageId,
}: {
  trigger: React.ReactNode;
  lead?: LeadRow;
  funnelStages: FunnelStage[];
  products: Product[];
  campaigns: Campaign[];
  agents: Agent[];
  chips: ChipType[];
  defaultStageId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          nome: lead.nome,
          whatsapp: lead.whatsapp,
          email: lead.email ?? "",
          produto_interesse_id: lead.produto_interesse_id ?? "",
          origem: lead.origem,
          campaign_id: lead.campaign_id ?? "",
          creative_id: lead.creative_id ?? "",
          agent_id: lead.agent_id ?? "",
          chip_id: lead.chip_id ?? "",
          funnel_stage_id: lead.funnel_stage_id,
          temperatura: lead.temperatura,
          valor_esperado: Number(lead.valor_esperado),
          valor_recebido: Number(lead.valor_recebido),
          forma_pagamento: lead.forma_pagamento ?? "",
          status_pagamento: lead.status_pagamento,
          produto_entregue: lead.produto_entregue,
          upsell_oferecido: lead.upsell_oferecido,
          upsell_comprado: lead.upsell_comprado,
          motivo_perda: lead.motivo_perda ?? "",
          observacoes: lead.observacoes ?? "",
          proximo_followup: lead.proximo_followup ? lead.proximo_followup.slice(0, 16) : "",
          tags: lead.tags ?? [],
        }
      : {
          nome: "",
          whatsapp: "",
          email: "",
          produto_interesse_id: "",
          origem: "organico",
          campaign_id: "",
          creative_id: "",
          agent_id: "",
          chip_id: "",
          funnel_stage_id: defaultStageId ?? funnelStages[0]?.id ?? "",
          temperatura: "morno",
          valor_esperado: 0,
          valor_recebido: 0,
          forma_pagamento: "",
          status_pagamento: "nao_enviado",
          produto_entregue: false,
          upsell_oferecido: false,
          upsell_comprado: false,
          motivo_perda: "",
          observacoes: "",
          proximo_followup: "",
          tags: [],
        },
  });

  const tags = watch("tags");

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setValue("tags", [...tags, t]);
    }
    setTagInput("");
  }

  function onSubmit(values: LeadFormValues) {
    startTransition(async () => {
      const result = lead
        ? await updateLeadAction(lead.id, values)
        : await createLeadAction(values);

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(lead ? "Lead atualizado com sucesso." : "Lead criado com sucesso.");
      setOpen(false);
      if (!lead) reset();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? "Editar lead" : "Novo lead"}</DialogTitle>
          <DialogDescription>
            Preencha as informações do lead recebido pelo WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome" error={errors.nome?.message} full>
              <Input {...register("nome")} placeholder="Nome do lead" />
            </Field>
            <Field label="WhatsApp" error={errors.whatsapp?.message}>
              <Input {...register("whatsapp")} placeholder="(11) 99999-9999" />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <Input {...register("email")} placeholder="opcional" />
            </Field>

            <Field label="Produto de interesse">
              <Controller
                control={control}
                name="produto_interesse_id"
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
            <Field label="Origem">
              <Controller
                control={control}
                name="origem"
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

            <Field label="Campanha">
              <Controller
                control={control}
                name="campaign_id"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                    <SelectContent>
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Atendente">
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

            <Field label="Chip utilizado">
              <Controller
                control={control}
                name="chip_id"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {chips.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Etapa do funil" error={errors.funnel_stage_id?.message}>
              <Controller
                control={control}
                name="funnel_stage_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {funnelStages.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Temperatura">
              <Controller
                control={control}
                name="temperatura"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAD_TEMPERATURA_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Status de pagamento">
              <Controller
                control={control}
                name="status_pagamento"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_PAGAMENTO_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Valor esperado (R$)" error={errors.valor_esperado?.message}>
              <Input type="number" step="0.01" {...register("valor_esperado", { valueAsNumber: true })} />
            </Field>
            <Field label="Valor recebido (R$)" error={errors.valor_recebido?.message}>
              <Input type="number" step="0.01" {...register("valor_recebido", { valueAsNumber: true })} />
            </Field>

            <Field label="Forma de pagamento">
              <Controller
                control={control}
                name="forma_pagamento"
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
            <Field label="Próximo follow-up">
              <Input type="datetime-local" {...register("proximo_followup")} />
            </Field>

            <div className="col-span-2 flex flex-wrap gap-6">
              <ToggleField label="Produto entregue" name="produto_entregue" control={control} />
              <ToggleField label="Upsell oferecido" name="upsell_oferecido" control={control} />
              <ToggleField label="Upsell comprado" name="upsell_comprado" control={control} />
            </div>

            <Field label="Motivo da perda (se aplicável)" full>
              <Input {...register("motivo_perda")} placeholder="Ex.: Achou caro, desistiu, etc." />
            </Field>

            <Field label="Tags" full>
              <div className="flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button
                      type="button"
                      onClick={() => setValue("tags", tags.filter((x) => x !== t))}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Adicionar tag e pressionar Enter"
                  className="min-w-32 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </Field>

            <Field label="Observações" full>
              <Textarea {...register("observacoes")} rows={3} placeholder="Anotações internas sobre o lead" />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {lead ? "Salvar alterações" : "Criar lead"}
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

function ToggleField({
  label,
  name,
  control,
}: {
  label: string;
  name: "produto_entregue" | "upsell_oferecido" | "upsell_comprado";
  control: ReturnType<typeof useForm<LeadFormValues>>["control"];
}) {
  return (
    <div className="flex items-center gap-2">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        )}
      />
      <Label className="font-normal">{label}</Label>
    </div>
  );
}

export function NewLeadTrigger() {
  return (
    <Button className="gap-1.5">
      <Plus className="size-4" /> Novo lead
    </Button>
  );
}
