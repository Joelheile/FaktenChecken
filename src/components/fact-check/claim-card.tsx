import { trackSourceClicked } from "@/lib/analytics";
import { AlertTriangle } from "lucide-react";
import { ClaimCardProps } from "./types";
import { safeHttpUrl, verdictToStatus } from "./utils";
import { VerdictBadge } from "./VerdictBadge";

const hostname = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

export const ClaimCard = ({ claim, index }: ClaimCardProps) => {
  const status = verdictToStatus(claim.urteil);

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4 sm:px-5">
      <div className="min-w-0 space-y-3">
        {/* Verdict + manipulation, combined on top */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <VerdictBadge status={status} />
          {claim.manipulation && (
            <span className="verdict-pill border border-verdict-partial bg-verdict-partial/10 px-2.5 py-1 text-[0.7rem] text-verdict-partial">
              <AlertTriangle
                className="h-3.5 w-3.5 shrink-0"
                strokeWidth={2.5}
              />
              <span className="[overflow-wrap:anywhere]">
                {claim.manipulation}
              </span>
            </span>
          )}
        </div>

        <blockquote className="border-l-2 border-border pl-3 font-display text-[0.95rem] font-semibold leading-snug [overflow-wrap:anywhere]">
          {claim.behauptung}
        </blockquote>

        {/* Explanation and research, merged into one flow */}
        <div className="space-y-1.5">
          <p className="font-body text-sm leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">
            {claim.erklaerung}
          </p>
          {claim.belege && (
            <p className="font-body text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
              <span className="font-medium text-foreground/70">
                Recherche:{" "}
              </span>
              {claim.belege}
            </p>
          )}
        </div>

        {/* Sources */}
        {claim.quellen.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="eyebrow mb-2">Quellen</p>
            <ul className="space-y-1.5">
              {claim.quellen.map((source, i) => {
                const href = safeHttpUrl(source.url);
                const num = String(i + 1).padStart(2, "0");
                if (!href) {
                  return (
                    <li
                      key={`${i}-${source.titel}`}
                      className="flex gap-2 font-body text-sm text-muted-foreground [overflow-wrap:anywhere]"
                    >
                      <span className="font-mono text-[0.7rem] text-muted-foreground/70">
                        {num}
                      </span>
                      <span className="min-w-0 flex-1">{source.titel}</span>
                    </li>
                  );
                }
                const host = hostname(href);
                return (
                  <li key={`${i}-${source.titel}`}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackSourceClicked({
                          url: href,
                          title: source.titel,
                          verdict: claim.urteil,
                          claimIndex: index,
                        })
                      }
                      className="group/src flex gap-2 font-body text-sm"
                    >
                      <span className="font-mono text-[0.7rem] text-muted-foreground/70">
                        {num}
                      </span>
                      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                        <span className="text-primary underline decoration-primary/30 underline-offset-2 group-hover/src:decoration-primary">
                          {source.titel}
                        </span>
                        {host && (
                          <span className="ml-1.5 font-mono text-[0.7rem] text-muted-foreground">
                            {host}
                          </span>
                        )}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
