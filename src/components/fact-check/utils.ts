import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  type LucideIcon,
  XCircle,
} from "lucide-react";
import type { Verdict, VerdictStatus } from "./types";

const VERDICT_STATUS: Record<Verdict, VerdictStatus> = {
  wahr: "true",
  falsch: "false",
  teils_teils: "partial",
  nicht_pruefbar: "unknown",
};

export const verdictToStatus = (verdict: Verdict): VerdictStatus =>
  VERDICT_STATUS[verdict] ?? "unknown";

export interface VerdictMeta {
  /** Border colour class */
  border: string;
  /** Soft fill class for pills */
  fill: string;
  /** Sentence label used in the hero verdict, e.g. "Das stimmt" */
  headline: string;
  icon: LucideIcon;
  /** Short pill label, e.g. "Wahr" */
  label: string;
  /** Solid background class for the colour rail */
  solid: string;
  /** Foreground colour class for icon + text */
  text: string;
  /** Very soft tint for the hero card background */
  tint: string;
}

export const VERDICT_META: Record<VerdictStatus, VerdictMeta> = {
  true: {
    label: "Wahr",
    headline: "Das stimmt",
    icon: CheckCircle2,
    text: "text-verdict-true",
    border: "border-verdict-true",
    fill: "bg-verdict-true/10",
    solid: "bg-verdict-true",
    tint: "bg-verdict-true/[0.06]",
  },
  false: {
    label: "Falsch",
    headline: "Das stimmt nicht",
    icon: XCircle,
    text: "text-verdict-false",
    border: "border-verdict-false",
    fill: "bg-verdict-false/10",
    solid: "bg-verdict-false",
    tint: "bg-verdict-false/[0.06]",
  },
  partial: {
    label: "Teils wahr",
    headline: "Teils wahr, teils nicht",
    icon: AlertTriangle,
    text: "text-verdict-partial",
    border: "border-verdict-partial",
    fill: "bg-verdict-partial/10",
    solid: "bg-verdict-partial",
    tint: "bg-verdict-partial/[0.06]",
  },
  unknown: {
    label: "Nicht prüfbar",
    headline: "Lässt sich nicht prüfen",
    icon: HelpCircle,
    text: "text-verdict-unknown",
    border: "border-verdict-unknown",
    fill: "bg-verdict-unknown/10",
    solid: "bg-verdict-unknown",
    tint: "bg-muted/40",
  },
};

/**
 * Source URLs come from the model and could be prompt-injected into a
 * `javascript:` or `data:` URI that runs script when clicked. Allow only
 * http(s); return null for anything else so the caller can drop the link.
 */
export const safeHttpUrl = (url: string): string | null => {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};
