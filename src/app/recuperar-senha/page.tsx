"use client";

import { useActionState } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  return (
    <AuthShell
      title="Recuperar senha"
      description="Enviaremos um link para redefinir sua senha"
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail cadastrado</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com" required />
        </div>
        <FormMessage error={state.error} success={state.success} />
        <SubmitButton pendingText="Enviando...">Enviar link de recuperação</SubmitButton>
      </form>
    </AuthShell>
  );
}
