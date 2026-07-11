"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarRange, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PERIODO_LABEL, PERIODO_OPCOES, type PeriodoPreset } from "@/lib/date-range";
import { cn } from "@/lib/utils";

export function DateRangeFilter({ paramName = "periodo" }: { paramName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const current = (searchParams.get(paramName) as PeriodoPreset) || "hoje";
  const [customFrom, setCustomFrom] = useState(searchParams.get("de") ?? "");
  const [customTo, setCustomTo] = useState(searchParams.get("ate") ?? "");

  function applyPreset(preset: PeriodoPreset) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, preset);
    if (preset !== "personalizado") {
      params.delete("de");
      params.delete("ate");
      router.push(`${pathname}?${params.toString()}`);
      setOpen(false);
    }
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, "personalizado");
    params.set("de", customFrom);
    params.set("ate", customTo);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CalendarRange className="size-4" />
          {PERIODO_LABEL[current] ?? PERIODO_LABEL.hoje}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <div className="flex flex-col">
          {PERIODO_OPCOES.filter((p) => p !== "personalizado").map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={cn(
                "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-accent",
                current === preset && "bg-accent font-medium"
              )}
            >
              {PERIODO_LABEL[preset]}
              {current === preset && <Check className="size-3.5 text-primary" />}
            </button>
          ))}
          <div className="mt-1 border-t pt-2">
            <p className="px-2.5 pb-1.5 text-xs font-medium text-muted-foreground">
              {PERIODO_LABEL.personalizado}
            </p>
            <div className="grid grid-cols-2 gap-2 px-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">De</Label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Até</Label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="px-2.5 pt-2">
              <Button
                size="sm"
                className="w-full"
                disabled={!customFrom || !customTo}
                onClick={applyCustom}
              >
                Aplicar período
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
