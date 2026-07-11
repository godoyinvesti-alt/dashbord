import { z } from "zod";

export const expenseSchema = z.object({
  descricao: z.string().min(2, "Informe a descrição da despesa."),
  categoria: z.enum(["trafego_pago", "ferramentas", "funcionarios", "comissoes", "plataforma", "reembolsos", "outros"]),
  valor: z.number().positive("Informe um valor maior que zero."),
  data: z.string().min(1, "Informe a data."),
  recorrente: z.boolean(),
  observacoes: z.string().optional().or(z.literal("")),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
