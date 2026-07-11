"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateChipSettingsAction } from "@/lib/actions/settings";
import type { Settings } from "@/lib/types";

const CANAIS = [
  { id: "chips", label: "Alertas de chips (recarga, bloqueio, banimento, incidentes)" },
  { id: "followups", label: "Follow-ups atrasados" },
  { id: "pagamentos", label: "Pagamentos pendentes" },
  { id: "metas", label: "Progresso de metas" },
];

export function NotificationPreferencesForm({ settings }: { settings: Settings }) {
  const [ativo, setAtivo] = useState(settings.notificacoes_ativas);
  const [isPending, startTransition] = useTransition();

  function toggle(value: boolean) {
    setAtivo(value);
    startTransition(async () => {
      const result = await updateChipSettingsAction({
        aviso_recarga_dias: settings.aviso_recarga_dias,
        critico_recarga_dias: settings.critico_recarga_dias,
        max_incidentes_alerta: settings.max_incidentes_alerta,
        operadora_padrao: settings.operadora_padrao,
        notificacoes_ativas: value,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Preferências de notificação atualizadas.");
    });
  }

  return (
    <Card className="py-5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="size-4.5" />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold">Notificações</CardTitle>
            <CardDescription>Controle os alertas gerados automaticamente pela plataforma.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Switch checked={ativo} onCheckedChange={toggle} disabled={isPending} />
          <Label className="font-normal">Ativar notificações automáticas</Label>
          {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </div>
        <Separator />
        <div className="space-y-2 opacity-90">
          {CANAIS.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <Switch checked={ativo} disabled />
              <Label className="font-normal text-muted-foreground">{c.label}</Label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Os limites de dias e incidentes para os alertas de chip são configurados na aba &ldquo;Chips&rdquo;.
        </p>
      </CardContent>
    </Card>
  );
}
