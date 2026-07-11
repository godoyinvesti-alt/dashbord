"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";

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
import { rescheduleFollowUpAction } from "@/lib/actions/follow-ups";

export function RescheduleDialog({ followUpId }: { followUpId: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 justify-start">
          <CalendarClock className="size-3.5" /> Reagendar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reagendar follow-up</DialogTitle>
          <DialogDescription>Escolha uma nova data e horário.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Nova data</Label>
          <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <DialogFooter>
          <Button
            disabled={!value || isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await rescheduleFollowUpAction(followUpId, value);
                if (result.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success("Follow-up reagendado.");
                setOpen(false);
              })
            }
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
