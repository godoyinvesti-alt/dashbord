import { z } from "zod";

export const productSchema = z.object({
  nome: z.string().min(2, "Informe o nome do produto."),
  categoria: z.string().optional().or(z.literal("")),
  descricao: z.string().optional().or(z.literal("")),
  preco_principal: z.number().min(0, "Não pode ser negativo."),
  custo: z.number().min(0, "Não pode ser negativo."),
  status: z.enum(["ativo", "pausado", "arquivado"]),
  link_entrega: z.string().optional().or(z.literal("")),
  upsells_relacionados: z.array(z.string()),
  order_bumps: z.array(z.string()),
});

export type ProductFormValues = z.infer<typeof productSchema>;
