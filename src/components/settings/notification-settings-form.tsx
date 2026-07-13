"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettingsAction } from "@/lib/actions/settings";
import type { Settings } from "@/lib/types";

export function NotificationSettingsForm({ settings }: { settings: Settings }) {
  const [ativas, setAtivas] = useState(settings.notificacoes_ativas);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateSettingsAction({
        nome_negocio: settings.nome_negocio,
        dias_aquecimento_padrao: settings.dias_aquecimento_padrao,
        dias_alerta_recarga: settings.dias_alerta_recarga,
        minimo_chips_ativos: settings.minimo_chips_ativos,
        limite_despesas_mensal: settings.limite_despesas_mensal,
        notificacoes_ativas: ativas,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Preferências de notificação atualizadas.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>
          Controla a geração de alertas automáticos: chips sem recarga, aquecimento concluído,
          banimentos, poucos chips ativos, metas atrasadas e despesas acima do limite.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Alertas ativos</p>
            <p className="text-xs text-muted-foreground">
              Quando desativado, o sistema deixa de gerar novos alertas automáticos.
            </p>
          </div>
          <Switch checked={ativas} onCheckedChange={setAtivas} />
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
