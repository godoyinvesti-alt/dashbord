"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWorkspaceAction } from "@/lib/actions/settings";
import type { Workspace } from "@/lib/types";

export function BusinessForm({ workspace }: { workspace: Workspace }) {
  const [nome, setNome] = useState(workspace.nome);
  const [moeda, setMoeda] = useState(workspace.moeda);
  const [fusoHorario, setFusoHorario] = useState(workspace.fuso_horario);
  const [meta, setMeta] = useState(String(workspace.meta_faturamento_mensal));
  const [isPending, startTransition] = useTransition();

  function onSubmit() {
    startTransition(async () => {
      const result = await updateWorkspaceAction({
        nome,
        moeda,
        fuso_horario: fusoHorario,
        meta_faturamento_mensal: Number(meta) || 0,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Informações do negócio atualizadas.");
    });
  }

  return (
    <Card className="py-5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Informações do negócio</CardTitle>
        <CardDescription>Dados gerais do seu workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nome do negócio</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Meta mensal de faturamento (R$)</Label>
            <Input type="number" step="0.01" value={meta} onChange={(e) => setMeta(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Moeda</Label>
            <Select value={moeda} onValueChange={setMoeda}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real brasileiro (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fuso horário</Label>
            <Select value={fusoHorario} onValueChange={setFusoHorario}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">América/São Paulo (Brasília)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={onSubmit} disabled={isPending} className="w-fit">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Salvar alterações
        </Button>
      </CardContent>
    </Card>
  );
}
