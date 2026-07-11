"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { calcularMetaReversa, type CalculadoraMetaResultado } from "@/lib/goal-calc";
import { formatBRL, formatNumber } from "@/lib/format";

const schema = z.object({
  metaFaturamento: z.number().positive("Informe um valor maior que zero."),
  ticketMedio: z.number().positive("Informe um valor maior que zero."),
  taxaConversao: z.number().positive("Informe um valor maior que zero.").max(100, "Máximo de 100%."),
  custoMedioPorLead: z.number().min(0, "Não pode ser negativo."),
  diasDisponiveis: z.number().int().positive("Informe ao menos 1 dia."),
});

type FormValues = z.infer<typeof schema>;

export function GoalCalculatorDialog() {
  const [resultado, setResultado] = useState<CalculadoraMetaResultado | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      metaFaturamento: 30000,
      ticketMedio: 97,
      taxaConversao: 5,
      custoMedioPorLead: 4,
      diasDisponiveis: 30,
    },
  });

  function onSubmit(values: FormValues) {
    setResultado(calcularMetaReversa(values));
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Calculator className="size-4" />
          Calculadora de Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Calculadora de Meta</DialogTitle>
          <DialogDescription>
            Descubra quantas vendas, leads e investimento você precisa para bater sua meta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Field label="Meta de faturamento" error={errors.metaFaturamento?.message}>
            <Input type="number" step="0.01" {...register("metaFaturamento", { valueAsNumber: true })} />
          </Field>
          <Field label="Ticket médio" error={errors.ticketMedio?.message}>
            <Input type="number" step="0.01" {...register("ticketMedio", { valueAsNumber: true })} />
          </Field>
          <Field label="Taxa de conversão (%)" error={errors.taxaConversao?.message}>
            <Input type="number" step="0.01" {...register("taxaConversao", { valueAsNumber: true })} />
          </Field>
          <Field label="Custo médio por lead" error={errors.custoMedioPorLead?.message}>
            <Input type="number" step="0.01" {...register("custoMedioPorLead", { valueAsNumber: true })} />
          </Field>
          <Field label="Dias disponíveis" error={errors.diasDisponiveis?.message} full>
            <Input type="number" {...register("diasDisponiveis", { valueAsNumber: true })} />
          </Field>

          <div className="col-span-2">
            <Button type="submit" className="w-full">Calcular</Button>
          </div>
        </form>

        {resultado && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Resultado label="Vendas necessárias" value={formatNumber(resultado.vendasNecessarias, 1)} />
              <Resultado label="Leads necessários" value={formatNumber(resultado.leadsNecessarios, 0)} />
              <Resultado label="Investimento estimado" value={formatBRL(resultado.investimentoEstimado)} />
              <Resultado label="Lucro estimado" value={formatBRL(resultado.lucroEstimado)} tone={resultado.lucroEstimado >= 0 ? "success" : "destructive"} />
              <Resultado label="Vendas por dia" value={formatNumber(resultado.vendasPorDia, 2)} />
              <Resultado label="Leads por dia" value={formatNumber(resultado.leadsPorDia, 1)} />
              <Resultado label="Faturamento por dia" value={formatBRL(resultado.faturamentoPorDia)} full />
            </div>
          </>
        )}
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

function Resultado({
  label,
  value,
  tone,
  full,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
  full?: boolean;
}) {
  return (
    <div className={`rounded-lg bg-muted/50 p-3 ${full ? "col-span-2" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-base font-semibold tabular-nums ${
          tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
