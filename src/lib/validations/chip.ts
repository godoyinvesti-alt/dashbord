import { z } from "zod";

export const chipSchema = z.object({
  name: z.string().min(2, "Informe o nome do chip."),
  phone_number: z.string().min(10, "Informe um número de telefone válido."),
  carrier: z.enum(["vivo", "claro", "tim", "algar", "outra"]),
  activation_date: z.string().optional().or(z.literal("")),
  status: z.enum(["ativo", "em_aquecimento", "bloqueado", "banido", "em_recuperacao", "desativado"]),
  assigned_agent_id: z.string().optional().or(z.literal("")),
  operation_name: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
export type ChipFormValues = z.infer<typeof chipSchema>;

export const rechargeSchema = z.object({
  recharge_date: z.string().min(1, "Informe a data da recarga."),
  amount: z.number().min(0, "O valor não pode ser negativo."),
  carrier: z.enum(["vivo", "claro", "tim", "algar", "outra"]),
  payment_method: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
export type RechargeFormValues = z.infer<typeof rechargeSchema>;

export const incidentSchema = z.object({
  incident_date: z.string().min(1, "Informe a data do incidente."),
  incident_type: z.enum([
    "whatsapp_desconectado",
    "whatsapp_bloqueado",
    "whatsapp_banido",
    "numero_sem_sinal",
    "chip_desativado",
    "problema_recarga",
    "outro",
  ]),
  reason: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  new_status: z.enum(["ativo", "em_aquecimento", "bloqueado", "banido", "em_recuperacao", "desativado"]),
  action_taken: z.string().optional().or(z.literal("")),
});
export type IncidentFormValues = z.infer<typeof incidentSchema>;
