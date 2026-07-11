import { z } from "zod";

export const leadSchema = z.object({
  nome: z.string().min(2, "Informe o nome do lead."),
  whatsapp: z.string().min(10, "Informe um número de WhatsApp válido."),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
  produto_interesse_id: z.string().uuid().optional().or(z.literal("")),
  origem: z.enum(["meta_ads", "tiktok_ads", "google_ads", "organico", "indicacao", "outro"]),
  campaign_id: z.string().uuid().optional().or(z.literal("")),
  creative_id: z.string().uuid().optional().or(z.literal("")),
  agent_id: z.string().uuid().optional().or(z.literal("")),
  chip_id: z.string().uuid().optional().or(z.literal("")),
  funnel_stage_id: z.string().uuid("Selecione uma etapa do funil."),
  temperatura: z.enum(["frio", "morno", "quente", "muito_quente"]),
  valor_esperado: z.number().min(0, "Não pode ser negativo."),
  valor_recebido: z.number().min(0, "Não pode ser negativo."),
  forma_pagamento: z.string().optional().or(z.literal("")),
  status_pagamento: z.enum([
    "nao_enviado",
    "pix_enviado",
    "aguardando_pagamento",
    "pagamento_confirmado",
    "pagamento_parcial",
    "reembolsado",
    "cancelado",
  ]),
  produto_entregue: z.boolean(),
  upsell_oferecido: z.boolean(),
  upsell_comprado: z.boolean(),
  motivo_perda: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
  proximo_followup: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
