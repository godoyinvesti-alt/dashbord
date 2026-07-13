"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import { NavIcon } from "@/components/layout/nav-icon";
import { NAV_SECOES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

const PRIMARY_HREFS = ["/dashboard", "/dashboard/chips", "/dashboard/vendas", "/dashboard/alertas"];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = NAV_SECOES.filter((item) => PRIMARY_HREFS.includes(item.href));
  const rest = NAV_SECOES.filter((item) => !PRIMARY_HREFS.includes(item.href));
  const restActive = rest.some((item) => pathname.startsWith(item.href));

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t bg-background/95 backdrop-blur-sm md:hidden">
        {primary.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <NavIcon name={item.icon} className="size-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
            restActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal className="size-5" />
          Mais
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <VisuallyHidden>
            <SheetTitle>Mais opções</SheetTitle>
          </VisuallyHidden>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {rest.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs font-medium",
                  isActive(item.href) ? "border-primary/40 bg-primary/5 text-primary" : "text-muted-foreground"
                )}
              >
                <NavIcon name={item.icon} className="size-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
