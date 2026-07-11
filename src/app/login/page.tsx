"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = {};

function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="senha">Senha</Label>
          <Link href="/recuperar-senha" className="text-xs text-primary hover:underline">
            Esqueceu a senha?
          </Link>
        </div>
        <Input id="senha" name="senha" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </div>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton pendingText="Entrando...">Entrar</SubmitButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar na sua conta"
      description="Acesse o painel do X1 Control"
      footer={
        <span className="text-muted-foreground">
          Ainda não tem uma conta?{" "}
          <Link href="/registrar" className="font-medium text-primary hover:underline">
            Criar conta grátis
          </Link>
        </span>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
