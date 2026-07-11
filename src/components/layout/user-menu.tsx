"use client";

import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { logoutAction } from "@/lib/actions/auth";

export function UserMenu({
  nome,
  email,
}: {
  nome: string;
  email: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
        <Avatar className="size-8">
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
            {initials(nome)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 text-left lg:block">
          <p className="truncate text-xs font-medium text-sidebar-foreground">{nome}</p>
          <p className="truncate text-[11px] text-sidebar-foreground/50">{email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/configuracoes?aba=perfil">
            <UserRound /> Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/configuracoes">
            <Settings /> Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <button type="submit" className="w-full">
            <DropdownMenuItem variant="destructive" asChild>
              <span>
                <LogOut /> Sair da conta
              </span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
