"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarPlus, Loader2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIPO_FOLLOWUP_LABEL } from "@/lib/constants";
import { createFollowUpAction } from "@/lib/actions/follow-ups";
import type { TipoFollowUp } from "@/lib/types";

export function ScheduleFollowUpDialog({
  leadId,
  onScheduled,
}: {
  leadId: string;
  onScheduled?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoFollowUp>("primeiro_contato");
  const [data, setData] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <CalendarPlus className="size-3.5" /> Agendar follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Agendar follow-up</DialogTitle>
          <DialogDescription>Defina quando retomar contato com este lead.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoFollowUp)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPO_FOLLOWUP_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Data e horário</Label>
            <Input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!data || isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await createFollowUpAction({ leadId, tipo, dataAgendada: data, observacoes });
                if (result.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Follow-up agendado.");
                setOpen(false);
                onScheduled?.();
              })
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Agendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
