"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, initials } from "@/lib/format";
import { PAPEL_LABEL } from "@/lib/constants";
import { updateMemberRoleAction } from "@/lib/actions/settings";
import type { TeamMemberRow } from "@/lib/data/team";
import type { PapelUsuario } from "@/lib/types";

export function TeamTable({ members, canManage }: { members: TeamMemberRow[]; canManage: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="py-5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Permissões da equipe</CardTitle>
        <CardDescription>Membros com acesso a este workspace e seus papéis.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials(m.nome)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{m.nome}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <Select
                        value={m.papel}
                        disabled={isPending}
                        onValueChange={(v) =>
                          startTransition(async () => {
                            const result = await updateMemberRoleAction(m.id, v as PapelUsuario);
                            if (result.error) toast.error(result.error);
                            else toast.success("Papel atualizado.");
                          })
                        }
                      >
                        <SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(PAPEL_LABEL).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{PAPEL_LABEL[m.papel]}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(m.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
