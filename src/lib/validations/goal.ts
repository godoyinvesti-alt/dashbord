import { z } from "zod";

export const goalSchema = z.object({
  tipo: z.enum([
    "faturamento_diario",
    "faturamento_semanal",
    "faturamento_mensal",
    "lucro",
    "numero_vendas",
    "ticket_medio",
    "conversao",
    "roas",
    "custo_por_lead",
    "custo_por_venda",
    "upsells",
    "receita_por_produto",
    "receita_por_agente",
  ]),
  periodo_inicio: z.string().min(1, "Informe a data de início."),
  periodo_fim: z.string().min(1, "Informe a data de fim."),
  valor_meta: z.number().positive("Informe um valor maior que zero."),
  produto_id: z.string().optional().or(z.literal("")),
  agent_id: z.string().optional().or(z.literal("")),
});

export type GoalFormValues = z.infer<typeof goalSchema>;
