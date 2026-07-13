import { z } from "zod";
import { STATUS_CHIP_OPCOES } from "@/lib/constants";

export const chipFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe um nome para o chip."),
  numero: z.string().trim().min(1, "Informe o número do chip."),
  operadora: z.enum(["vivo", "claro", "tim", "oi", "algar", "outra"]),
  status: z.enum(STATUS_CHIP_OPCOES as [string, ...string[]]),
  data_ativacao: z.string().optional().nullable(),
  data_inicio_aquecimento: z.string().optional().nullable(),
  meta_dias_aquecimento: z.number().int().min(1, "Informe ao menos 1 dia."),
  responsavel: z.string().trim().optional().nullable(),
  operacao_vinculada: z.string().trim().optional().nullable(),
  observacoes: z.string().trim().optional().nullable(),
});

export type ChipFormValues = z.infer<typeof chipFormSchema>;

export const rechargeFormSchema = z.object({
  data: z.string().min(1, "Informe a data da recarga."),
  valor: z.coerce.number().min(0, "O valor não pode ser negativo."),
  observacoes: z.string().trim().optional().nullable(),
});

export const banFormSchema = z.object({
  data: z.string().min(1, "Informe a data do banimento."),
  motivo: z.string().trim().optional().nullable(),
  plataforma: z.string().trim().optional().nullable(),
  observacoes: z.string().trim().optional().nullable(),
});

export const recoveryFormSchema = z.object({
  ban_id: z.string().min(1, "Selecione o banimento a ser recuperado."),
  data_recuperacao: z.string().min(1, "Informe a data da recuperação."),
  observacoes: z.string().trim().optional().nullable(),
});

export const statusChangeFormSchema = z.object({
  status_novo: z.enum(STATUS_CHIP_OPCOES as [string, ...string[]]),
  observacao: z.string().trim().optional().nullable(),
});

export const observationFormSchema = z.object({
  observacao: z.string().trim().min(1, "Escreva uma observação."),
});
