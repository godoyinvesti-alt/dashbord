import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { whatsappLink, formatPhoneDisplay } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WhatsAppButton({
  phone,
  message,
  size = "sm",
  variant = "outline",
  showLabel = true,
  className,
}: {
  phone: string;
  message?: string;
  size?: "sm" | "default" | "icon";
  variant?: "outline" | "ghost" | "default" | "secondary";
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <Button
      asChild
      size={size}
      variant={variant}
      className={cn(showLabel && "gap-1.5", className)}
    >
      <a
        href={whatsappLink(phone, message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={`Abrir WhatsApp: ${formatPhoneDisplay(phone)}`}
      >
        <MessageCircle className="size-3.5 text-success" />
        {showLabel && "WhatsApp"}
      </a>
    </Button>
  );
}
