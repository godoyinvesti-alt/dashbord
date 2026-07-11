"use client";

import { useActionState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { updateProfileAction, type ActionState } from "@/lib/actions/auth";
import type { Profile } from "@/lib/types";

const initialState: ActionState = {};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <Card className="py-5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Meu perfil</CardTitle>
        <CardDescription>Suas informações pessoais na plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" defaultValue={profile.nome} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" defaultValue={profile.telefone ?? ""} placeholder="(11) 99999-9999" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>E-mail</Label>
              <Input value={profile.email} disabled />
            </div>
          </div>
          <FormMessage error={state.error} success={state.success} />
          <SubmitButton pendingText="Salvando..." className="w-fit">Salvar perfil</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
