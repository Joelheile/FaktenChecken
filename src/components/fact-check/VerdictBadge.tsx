import { cn } from "@/lib/utils";
import { VerdictBadgeProps } from "./types";

const STATUS_STYLES = {
  true: "bg-verdict-true/10 text-verdict-true border-verdict-true/20",
  false: "bg-verdict-false/10 text-verdict-false border-verdict-false/20",
  partial: "bg-verdict-partial/10 text-verdict-partial border-verdict-partial/20",
  unknown: "bg-verdict-unknown/10 text-verdict-unknown border-verdict-unknown/20",
} as const;

export const VerdictBadge = ({ verdict, status }: VerdictBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-body font-semibold border",
      STATUS_STYLES[status],
    )}
  >
    {verdict}
  </span>
);
