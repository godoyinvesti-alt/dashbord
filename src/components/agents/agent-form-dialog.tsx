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
import { agentSchema, type AgentFormValues } from "@/lib/validations/agent";
import { createAgentAction, updateAgentAction } from "@/lib/actions/agents";
import { PAPEL_LABEL, STATUS_AGENTE_LABEL } from "@/lib/constants";
import type { Agent } from "@/lib/types";

export function AgentFormDialog({
  trigger,
  agent,
}: {
  trigger: React.ReactNode;
  agent?: Agent;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: agent
      ? {
          nome: agent.nome,
          email: agent.email,
          whatsapp: agent.whatsapp ?? "",
          papel: agent.papel,
          status: agent.status,
        }
      : { nome: "", email: "", whatsapp: "", papel: "atendente", status: "ativo" },
  });

  function onSubmit(values: AgentFormValues) {
    startTransition(async () => {
      const result = agent ? await updateAgentAction(agent.id, values) : await createAgentAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(agent ? "Atendente atualizado." : "Atendente adicionado.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent ? "Editar atendente" : "Novo atendente"}</DialogTitle>
          <DialogDescription>Gerencie os membros da sua equipe de vendas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome" error={errors.nome?.message} full>
              <Input {...register("nome")} placeholder="Nome completo" />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <Input {...register("email")} placeholder="email@empresa.com" />
            </Field>
            <Field label="WhatsApp">
              <Input {...register("whatsapp")} placeholder="(11) 99999-9999" />
            </Field>
            <Field label="Função">
              <Controller
                control={control}
                name="papel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAPEL_LABEL).map(([k, v]) => (
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
                      {Object.entries(STATUS_AGENTE_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {agent ? "Salvar alterações" : "Adicionar atendente"}
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

export function NewAgentTrigger() {
  return (
    <Button className="gap-1.5">
      <Plus className="size-4" /> Novo atendente
    </Button>
  );
}
