import { trackSourceClicked } from "@/lib/analytics";
import { AlertTriangle, ExternalLink } from "lucide-react";
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
            <ul className="space-y-2">
              {claim.quellen.map((source, i) => {
                const href = safeHttpUrl(source.url);
                if (!href) {
                  return (
                    <li
                      key={`${i}-${source.titel}`}
                      className="rounded-md border border-border bg-muted/40 px-3 py-2 font-body text-sm text-muted-foreground [overflow-wrap:anywhere]"
                    >
                      {source.titel}
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
                      className="group/src flex items-start gap-2.5 rounded-md border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[0.65rem] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-body text-sm font-medium text-primary underline decoration-primary/30 underline-offset-2 group-hover/src:decoration-primary [overflow-wrap:anywhere]">
                          {source.titel}
                        </span>
                        {host && (
                          <span className="mt-0.5 block font-mono text-[0.7rem] text-muted-foreground">
                            {host}
                          </span>
                        )}
                      </span>
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-opacity group-hover/src:opacity-100" />
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
