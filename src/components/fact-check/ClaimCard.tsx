import ReactMarkdown from "react-markdown";
import { StructuredClaim } from "./types";
import { VerdictBadge } from "./VerdictBadge";

interface ClaimCardProps {
  claim: StructuredClaim;
  index: number;
}

const VERDICT_TEXT: Record<string, string> = {
  true: "WAHR",
  false: "FALSCH",
  partial: "TEILS-TEILS",
  unknown: "UNBEKANNT",
};

const cleanMarkdown = (text: string): string => text.replace(/\*\*/g, "");

export const ClaimCard = ({ claim, index }: ClaimCardProps) => (
  <div
    className="border border-border rounded-lg bg-card overflow-hidden fade-in-up"
    style={{ animationDelay: `${index * 0.08}s` }}
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/30">
      <h3 className="font-display font-semibold text-sm">
        {cleanMarkdown(claim.label)}
      </h3>
      <VerdictBadge
        verdict={VERDICT_TEXT[claim.status] ?? "UNBEKANNT"}
        status={claim.status}
      />
    </div>

    <div className="px-4 py-3 space-y-2">
      <p className="font-body text-sm font-medium leading-relaxed">
        {cleanMarkdown(claim.content)}
      </p>

      <div className="prose prose-sm max-w-none font-body text-muted-foreground [&_p]:leading-relaxed [&_p]:text-sm">
        <ReactMarkdown>{cleanMarkdown(claim.explanation)}</ReactMarkdown>
      </div>
    </div>
  </div>
);
