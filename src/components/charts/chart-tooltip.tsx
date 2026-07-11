"use client";

interface TooltipPayloadItem {
  name?: string | number;
  value?: number | string;
  color?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  formatter?: (value: number, name: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="min-w-36 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label !== undefined && (
        <p className="mb-1.5 font-medium text-popover-foreground">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              {item.name}
            </span>
            <span className="font-medium tabular-nums text-popover-foreground">
              {formatter && typeof item.value === "number"
                ? formatter(item.value, String(item.name))
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
