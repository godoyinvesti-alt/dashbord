"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspaceAction, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = {};

export function OnboardingForm() {
  const [state, formAction] = useActionState(createWorkspaceAction, initialState);

  return (
    <AuthShell
      title="Vamos criar seu workspace"
      description="Esse será o espaço da sua operação de vendas no WhatsApp"
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do seu negócio</Label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="nome"
              name="nome"
              placeholder="Ex.: Studio Digital Vendas"
              className="pl-9"
              required
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Você poderá convidar sua equipe e alterar essas informações depois em Configurações.
          </p>
        </div>
        <FormMessage error={state.error} success={state.success} />
        <SubmitButton pendingText="Criando workspace...">Criar workspace</SubmitButton>
      </form>
    </AuthShell>
  );
}
