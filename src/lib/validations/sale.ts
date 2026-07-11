import { z } from "zod";

export const saleSchema = z.object({
  cliente_nome: z.string().min(2, "Informe o nome do cliente."),
  product_id: z.string().uuid("Selecione um produto."),
  preco_original: z.number().min(0, "Não pode ser negativo."),
  valor_esperado: z.number().min(0, "Não pode ser negativo."),
  valor_recebido: z.number().min(0, "Não pode ser negativo."),
  desconto: z.number().min(0, "Não pode ser negativo."),
  forma_pagamento: z.string().optional().or(z.literal("")),
  data_pagamento: z.string().optional().or(z.literal("")),
  campaign_id: z.string().uuid().optional().or(z.literal("")),
  creative_id: z.string().uuid().optional().or(z.literal("")),
  agent_id: z.string().uuid().optional().or(z.literal("")),
  chip_id: z.string().uuid().optional().or(z.literal("")),
  upsell: z.boolean(),
  status_reembolso: z.enum(["nenhum", "solicitado", "reembolsado"]),
  status_entrega: z.enum(["pendente", "entregue", "nao_aplicavel"]),
  observacoes: z.string().optional().or(z.literal("")),
});

export type SaleFormValues = z.infer<typeof saleSchema>;
