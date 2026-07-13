"use client";

import { useActionState, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { updateSettingsAction } from "@/lib/actions/settings";
import { updateProfileAction, type ActionState } from "@/lib/actions/auth";
import type { Settings } from "@/lib/types";

const initialProfileState: ActionState = {};

export function BusinessSettingsForm({
  settings,
  profile,
}: {
  settings: Settings;
  profile: { nome: string; email: string };
}) {
  const [nomeNegocio, setNomeNegocio] = useState(settings.nome_negocio);
  const [isPending, startTransition] = useTransition();
  const [profileState, profileFormAction] = useActionState(updateProfileAction, initialProfileState);

  function handleSave() {
    startTransition(async () => {
      const result = await updateSettingsAction({
        nome_negocio: nomeNegocio,
        dias_aquecimento_padrao: settings.dias_aquecimento_padrao,
        dias_alerta_recarga: settings.dias_alerta_recarga,
        minimo_chips_ativos: settings.minimo_chips_ativos,
        limite_despesas_mensal: settings.limite_despesas_mensal,
        notificacoes_ativas: settings.notificacoes_ativas,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Dados do negócio atualizados com sucesso.");
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Negócio</CardTitle>
          <CardDescription>Nome usado para identificar o seu negócio dentro do painel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome_negocio">Nome do negócio</Label>
            <Input
              id="nome_negocio"
              value={nomeNegocio}
              onChange={(e) => setNomeNegocio(e.target.value)}
              placeholder="Ex.: Minha Operação"
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Nome exibido para você dentro do painel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileFormAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" defaultValue={profile.nome} placeholder="Seu nome" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={profile.email} disabled />
              </div>
            </div>
            <FormMessage error={profileState.error} success={profileState.success} />
            <div className="flex justify-end">
              <SubmitButton className="w-auto" pendingText="Salvando...">
                Salvar
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
