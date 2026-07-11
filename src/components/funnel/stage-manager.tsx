"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Plus, Pencil, Trash2, Settings2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  createFunnelStageAction,
  updateFunnelStageAction,
  deleteFunnelStageAction,
  reorderFunnelStagesAction,
} from "@/lib/actions/funnel";
import type { FunnelStage } from "@/lib/types";

const CORES = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#e87ba4", "#eb6834"];

export function StageManagerDialog({ stages }: { stages: FunnelStage[] }) {
  const [open, setOpen] = useState(false);
  const [ordered, setOrdered] = useState(stages);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<FunnelStage | null>(null);
  const [newName, setNewName] = useState("");

  function move(index: number, direction: -1 | 1) {
    const next = [...ordered];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrdered(next);
    startTransition(async () => {
      await reorderFunnelStagesAction(next.map((s, i) => ({ id: s.id, ordem: i })));
    });
  }

  function addStage() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const result = await createFunnelStageAction(newName, CORES[ordered.length % CORES.length]);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Etapa criada.");
      setNewName("");
      setOpen(false);
      setTimeout(() => setOpen(true), 0);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <Settings2 className="size-4" /> Personalizar etapas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Etapas do funil</DialogTitle>
          <DialogDescription>
            Renomeie, reordene, adicione ou remova etapas do seu funil de vendas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {ordered.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-2 rounded-lg border p-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: stage.cor }} />
              {editing?.id === stage.id ? (
                <Input
                  autoFocus
                  defaultValue={stage.nome}
                  className="h-8 flex-1"
                  onBlur={(e) => {
                    startTransition(async () => {
                      await updateFunnelStageAction(stage.id, { nome: e.target.value, cor: stage.cor });
                      setEditing(null);
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  }}
                />
              ) : (
                <span className="flex-1 truncate text-sm">{stage.nome}</span>
              )}
              <div className="flex items-center gap-0.5">
                <Button size="icon" variant="ghost" className="size-7" disabled={idx === 0 || isPending} onClick={() => move(idx, -1)}>
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="size-7" disabled={idx === ordered.length - 1 || isPending} onClick={() => move(idx, 1)}>
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(stage)}>
                  <Pencil className="size-3.5" />
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                  title="Remover etapa"
                  description={`Remover a etapa "${stage.nome}"? Isso só é possível se não houver leads nela.`}
                  destructive
                  confirmLabel="Remover"
                  onConfirm={async () => {
                    const result = await deleteFunnelStageAction(stage.id);
                    if (result.error) {
                      toast.error(result.error);
                      return;
                    }
                    setOrdered((prev) => prev.filter((s) => s.id !== stage.id));
                    toast.success("Etapa removida.");
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t pt-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nova etapa..."
            onKeyDown={(e) => e.key === "Enter" && addStage()}
          />
          <Button onClick={addStage} disabled={isPending || !newName.trim()} className="gap-1.5 shrink-0">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Adicionar
          </Button>
        </div>

        <DialogFooter>
          <Label className="text-xs text-muted-foreground">
            As alterações são salvas automaticamente.
          </Label>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
