import { AlertTriangle } from "lucide-react";
import { trackSourceClicked } from "@/lib/analytics";
import type { ClaimCardProps } from "./types";
import { safeHttpUrl, verdictToStatus } from "./utils";
import { VerdictBadge } from "./verdict-badge";

const WWW_PREFIX = /^www\./;

const hostname = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(WWW_PREFIX, "");
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
          <span className="mr-1 font-mono text-muted-foreground text-xs">
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

        <blockquote className="border-border border-l-2 pl-3 font-display font-semibold text-[0.95rem] leading-snug [overflow-wrap:anywhere]">
          {claim.behauptung}
        </blockquote>

        {/* Explanation and research, merged into one flow */}
        <div className="space-y-1.5">
          <p className="font-body text-foreground/90 text-sm leading-relaxed [overflow-wrap:anywhere]">
            {claim.erklaerung}
          </p>
          {claim.belege && (
            <p className="font-body text-muted-foreground text-sm leading-relaxed [overflow-wrap:anywhere]">
              <span className="font-medium text-foreground/70">
                Recherche:{" "}
              </span>
              {claim.belege}
            </p>
          )}
        </div>

        {/* Sources */}
        {claim.quellen.length > 0 && (
          <div className="border-border border-t pt-3">
            <p className="eyebrow mb-2">Quellen</p>
            <ul className="space-y-1.5">
              {claim.quellen.map((source, i) => {
                const href = safeHttpUrl(source.url);
                const num = String(i + 1).padStart(2, "0");
                if (!href) {
                  return (
                    <li
                      className="flex gap-2 font-body text-muted-foreground text-sm [overflow-wrap:anywhere]"
                      key={`${source.titel}|${source.url}`}
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
                  <li key={`${source.titel}|${source.url}`}>
                    <a
                      className="group/src flex gap-2 font-body text-sm"
                      href={href}
                      onClick={() =>
                        trackSourceClicked({
                          url: href,
                          title: source.titel,
                          verdict: claim.urteil,
                          claimIndex: index,
                        })
                      }
                      rel="noopener noreferrer"
                      target="_blank"
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
