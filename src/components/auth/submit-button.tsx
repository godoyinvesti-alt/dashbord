"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  pendingText,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={cn("w-full", className)}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? pendingText ?? "Enviando..." : children}
    </Button>
  );
}
