"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettingsAction } from "@/lib/actions/settings";
import type { Settings } from "@/lib/types";

export function ChipAlertSettingsForm({ settings }: { settings: Settings }) {
  const [diasAquecimento, setDiasAquecimento] = useState(settings.dias_aquecimento_padrao);
  const [diasAlertaRecarga, setDiasAlertaRecarga] = useState(settings.dias_alerta_recarga);
  const [minimoChipsAtivos, setMinimoChipsAtivos] = useState(settings.minimo_chips_ativos);
  const [limiteDespesas, setLimiteDespesas] = useState<number | "">(
    settings.limite_despesas_mensal ?? ""
  );
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateSettingsAction({
        nome_negocio: settings.nome_negocio,
        dias_aquecimento_padrao: diasAquecimento,
        dias_alerta_recarga: diasAlertaRecarga,
        minimo_chips_ativos: minimoChipsAtivos,
        limite_despesas_mensal: limiteDespesas === "" ? null : limiteDespesas,
        notificacoes_ativas: settings.notificacoes_ativas,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Configurações de chips e alertas atualizadas.");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chips e alertas</CardTitle>
        <CardDescription>
          Defina os padrões usados para calcular aquecimento, alertas de recarga e o número mínimo de
          chips ativos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dias_aquecimento_padrao">Meta padrão de dias de aquecimento</Label>
            <Input
              id="dias_aquecimento_padrao"
              type="number"
              min={1}
              value={diasAquecimento}
              onChange={(e) => setDiasAquecimento(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dias_alerta_recarga">Dias sem recarga para alertar</Label>
            <Input
              id="dias_alerta_recarga"
              type="number"
              min={1}
              value={diasAlertaRecarga}
              onChange={(e) => setDiasAlertaRecarga(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minimo_chips_ativos">Mínimo de chips ativos</Label>
            <Input
              id="minimo_chips_ativos"
              type="number"
              min={0}
              value={minimoChipsAtivos}
              onChange={(e) => setMinimoChipsAtivos(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="limite_despesas_mensal">Limite de despesas mensais (R$)</Label>
            <Input
              id="limite_despesas_mensal"
              type="number"
              min={0}
              step="0.01"
              value={limiteDespesas}
              onChange={(e) => setLimiteDespesas(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Opcional"
            />
          </div>
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
