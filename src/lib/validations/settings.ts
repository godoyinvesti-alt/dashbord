import { z } from "zod";

export const settingsFormSchema = z.object({
  nome_negocio: z.string().trim().min(1, "Informe o nome do negócio."),
  dias_aquecimento_padrao: z.number().int().min(1, "Informe ao menos 1 dia."),
  dias_alerta_recarga: z.number().int().min(1, "Informe ao menos 1 dia."),
  minimo_chips_ativos: z.number().int().min(0, "O valor não pode ser negativo."),
  limite_despesas_mensal: z
    .number()
    .min(0, "O valor não pode ser negativo.")
    .nullable()
    .optional(),
  notificacoes_ativas: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
