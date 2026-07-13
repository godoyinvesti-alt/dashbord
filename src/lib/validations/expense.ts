import { z } from "zod";
import { CATEGORIA_DESPESA_OPCOES } from "@/lib/constants";

export const expenseFormSchema = z.object({
  descricao: z.string().trim().min(1, "Informe uma descrição para a despesa."),
  valor: z.number().min(0, "O valor não pode ser negativo."),
  categoria: z.enum(CATEGORIA_DESPESA_OPCOES as [string, ...string[]]),
  data: z.string().min(1, "Informe a data da despesa."),
  operacao_vinculada: z.string().trim().optional().nullable(),
  observacoes: z.string().trim().optional().nullable(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
