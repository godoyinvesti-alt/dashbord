import { z } from "zod";
import { TIPO_ATIVO_OPCOES, STATUS_CONTINGENCIA_OPCOES } from "@/lib/constants";

export const contingencyAssetFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe um nome para o ativo."),
  tipo: z.enum(TIPO_ATIVO_OPCOES as [string, ...string[]]),
  identificador: z.string().trim().optional().nullable(),
  status: z.enum(STATUS_CONTINGENCIA_OPCOES as [string, ...string[]]),
  responsavel: z.string().trim().optional().nullable(),
  data_ativacao: z.string().optional().nullable(),
  operacao_vinculada: z.string().trim().optional().nullable(),
  observacoes: z.string().trim().optional().nullable(),
});

export type ContingencyAssetFormValues = z.infer<typeof contingencyAssetFormSchema>;

export const contingencyStatusChangeFormSchema = z.object({
  status: z.enum(STATUS_CONTINGENCIA_OPCOES as [string, ...string[]]),
});
