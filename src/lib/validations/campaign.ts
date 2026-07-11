import { z } from "zod";

export const campaignSchema = z.object({
  plataforma: z.enum(["meta_ads", "tiktok_ads", "google_ads", "organico", "indicacao", "outro"]),
  nome: z.string().min(2, "Informe o nome da campanha."),
  data_inicio: z.string().optional().or(z.literal("")),
  data_fim: z.string().optional().or(z.literal("")),
  valor_investido: z.number().min(0, "Não pode ser negativo."),
});
export type CampaignFormValues = z.infer<typeof campaignSchema>;

export const creativeSchema = z.object({
  campaign_id: z.string().uuid("Selecione uma campanha."),
  ad_set_id: z.string().optional().or(z.literal("")),
  nome: z.string().min(2, "Informe o nome do criativo."),
  hook: z.string().optional().or(z.literal("")),
  url_preview: z.string().optional().or(z.literal("")),
  valor_investido: z.number().min(0, "Não pode ser negativo."),
});
export type CreativeFormValues = z.infer<typeof creativeSchema>;
