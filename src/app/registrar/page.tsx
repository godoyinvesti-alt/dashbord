"use client";

import { useActionState } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = {};

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <AuthShell
      title="Criar sua conta"
      description="Comece a organizar suas vendas por WhatsApp"
      footer={
        <span className="text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </span>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" name="nome" placeholder="Seu nome" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" name="senha" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmarSenha">Confirmar senha</Label>
          <Input id="confirmarSenha" name="confirmarSenha" type="password" autoComplete="new-password" placeholder="Repita a senha" required />
        </div>
        <FormMessage error={state.error} success={state.success} />
        <SubmitButton pendingText="Criando conta...">Criar conta</SubmitButton>
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
        </p>
      </form>
    </AuthShell>
  );
}
