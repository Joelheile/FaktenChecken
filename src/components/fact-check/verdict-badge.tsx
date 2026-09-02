import { cn } from "@/lib/utils";
import { VerdictBadgeProps } from "./types";
import { VERDICT_META } from "./utils";

export const VerdictBadge = ({ status, size = "sm" }: VerdictBadgeProps) => {
  const meta = VERDICT_META[status];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "verdict-pill border",
        meta.text,
        meta.border,
        meta.fill,
        size === "lg"
          ? "gap-2 px-4 py-1.5 text-sm shadow-soft"
          : "px-2.5 py-1 text-[0.7rem]",
      )}
    >
      <Icon
        className={cn(size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")}
        strokeWidth={2.5}
      />
      {meta.label}
    </span>
  );
};
