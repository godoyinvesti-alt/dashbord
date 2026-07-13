import { z } from "zod";

export const saleFormSchema = z.object({
  data: z.string().min(1, "Informe a data da venda."),
  valor_recebido: z.number().min(0, "O valor não pode ser negativo."),
  produto: z.string().trim().min(1, "Informe o produto vendido."),
  cliente: z.string().trim().optional().nullable(),
  chip_id: z.string().trim().optional().nullable(),
  vendedor: z.string().trim().optional().nullable(),
  origem_lead: z.string().trim().optional().nullable(),
  forma_pagamento: z.string().trim().optional().nullable(),
  taxas: z.number().min(0, "As taxas não podem ser negativas."),
  reembolso: z.number().min(0, "O reembolso não pode ser negativo."),
  observacoes: z.string().trim().optional().nullable(),
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;
