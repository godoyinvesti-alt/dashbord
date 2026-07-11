"use client";

import { useActionState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = {};

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <AuthShell
      title="Definir nova senha"
      description="Escolha uma nova senha para sua conta"
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="senha">Nova senha</Label>
          <Input id="senha" name="senha" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
          <Input id="confirmarSenha" name="confirmarSenha" type="password" autoComplete="new-password" placeholder="Repita a senha" required />
        </div>
        <FormMessage error={state.error} success={state.success} />
        <SubmitButton pendingText="Salvando...">Salvar nova senha</SubmitButton>
      </form>
    </AuthShell>
  );
}
