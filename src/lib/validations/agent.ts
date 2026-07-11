import { z } from "zod";

export const agentSchema = z.object({
  nome: z.string().min(2, "Informe o nome do atendente."),
  email: z.string().email("E-mail inválido."),
  whatsapp: z.string().optional().or(z.literal("")),
  papel: z.enum(["administrador", "gestor", "atendente", "financeiro", "visualizador"]),
  status: z.enum(["ativo", "inativo", "ferias"]),
});

export type AgentFormValues = z.infer<typeof agentSchema>;
