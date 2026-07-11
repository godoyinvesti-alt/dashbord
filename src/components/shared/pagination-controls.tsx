"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  }

  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t px-1 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Mostrando <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> de{" "}
        <span className="font-medium text-foreground">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          asChild={page > 1}
          disabled={page <= 1}
        >
          {page > 1 ? (
            <Link href={hrefFor(page - 1)}>
              <ChevronLeft className="size-4" /> Anterior
            </Link>
          ) : (
            <span>
              <ChevronLeft className="size-4" /> Anterior
            </span>
          )}
        </Button>
        <span className="px-2 text-xs text-muted-foreground">
          Página {page} de {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          asChild={page < totalPages}
          disabled={page >= totalPages}
        >
          {page < totalPages ? (
            <Link href={hrefFor(page + 1)}>
              Próxima <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span>
              Próxima <ChevronRight className="size-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
