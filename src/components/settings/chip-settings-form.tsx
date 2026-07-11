"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateChipSettingsAction } from "@/lib/actions/settings";
import { OPERADORA_LABEL } from "@/lib/constants";
import type { Settings } from "@/lib/types";

export function ChipSettingsForm({ settings }: { settings: Settings }) {
  const [aviso, setAviso] = useState(String(settings.aviso_recarga_dias));
  const [critico, setCritico] = useState(String(settings.critico_recarga_dias));
  const [maxIncidentes, setMaxIncidentes] = useState(String(settings.max_incidentes_alerta));
  const [operadora, setOperadora] = useState(settings.operadora_padrao);
  const [notificacoes, setNotificacoes] = useState(settings.notificacoes_ativas);
  const [isPending, startTransition] = useTransition();

  function onSubmit() {
    startTransition(async () => {
      const result = await updateChipSettingsAction({
        aviso_recarga_dias: Number(aviso) || 21,
        critico_recarga_dias: Number(critico) || 30,
        max_incidentes_alerta: Number(maxIncidentes) || 3,
        operadora_padrao: operadora,
        notificacoes_ativas: notificacoes,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Configurações de chips atualizadas.");
    });
  }

  return (
    <Card className="py-5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Regras de alerta de chips</CardTitle>
        <CardDescription>
          Defina os prazos usados para colorir e notificar chips sem recarga.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Aviso após X dias sem recarga</Label>
            <Input type="number" value={aviso} onChange={(e) => setAviso(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Crítico após X dias sem recarga</Label>
            <Input type="number" value={critico} onChange={(e) => setCritico(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Máximo de incidentes antes do alerta</Label>
            <Input type="number" value={maxIncidentes} onChange={(e) => setMaxIncidentes(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Operadora padrão</Label>
            <Select value={operadora} onValueChange={(v) => setOperadora(v as never)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(OPERADORA_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={notificacoes} onCheckedChange={setNotificacoes} />
          <Label className="font-normal">Ativar notificações automáticas de chips</Label>
        </div>
        <Button onClick={onSubmit} disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Salvar alterações
        </Button>
      </CardContent>
    </Card>
  );
}
