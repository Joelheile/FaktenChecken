import { trackSourceClicked } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { ClaimCardProps } from "./types";
import { safeHttpUrl, VERDICT_META, verdictToStatus } from "./utils";
import { VerdictBadge } from "./VerdictBadge";

export const ClaimCard = ({ claim, index }: ClaimCardProps) => {
  const status = verdictToStatus(claim.urteil);
  const meta = VERDICT_META[status];
  const Icon = meta.icon;

  return (
    <div
      className="fade-in-up relative overflow-hidden rounded-lg border bg-card pl-1.5 shadow-soft transition-shadow hover:shadow-soft-lg"
      style={{ animationDelay: `${0.06 * index}s` }}
    >
      {/* Coloured status rail */}
      <div className={cn("absolute inset-y-0 left-0 w-1.5", meta.solid)} />

      <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
        {/* Icon medallion */}
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
            meta.fill,
            meta.border,
            meta.text,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h3 className="flex items-baseline gap-2 font-display text-base font-semibold leading-snug">
              <span className="font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="[overflow-wrap:anywhere]">
                {claim.behauptung}
              </span>
            </h3>
            <div className="shrink-0">
              <VerdictBadge status={status} />
            </div>
          </div>

          <p className="font-body text-[0.95rem] leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">
            {claim.erklaerung}
          </p>

          {claim.belege && (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
              <p className="eyebrow mb-1">Was die Recherche zeigt</p>
              <p className="font-body text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                {claim.belege}
              </p>
            </div>
          )}

          {claim.manipulation && (
            <span className="verdict-pill border border-verdict-partial bg-verdict-partial/10 px-2.5 py-1 text-[0.7rem] text-verdict-partial">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              <span className="[overflow-wrap:anywhere]">
                {claim.manipulation}
              </span>
            </span>
          )}

          {claim.quellen.length > 0 && (
            <div className="border-t border-border pt-2">
              <p className="eyebrow mb-1">Quellen</p>
              <ul className="-mx-2">
                {claim.quellen.map((source, i) => {
                  const href = safeHttpUrl(source.url);
                  if (!href) {
                    return (
                      <li
                        key={`${i}-${source.titel}`}
                        className="px-2 py-2 font-body text-sm text-muted-foreground [overflow-wrap:anywhere]"
                      >
                        {source.titel}
                      </li>
                    );
                  }
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
                        className="group/src flex min-h-[44px] items-center gap-2 rounded-md px-2 py-2 font-body text-sm text-primary transition-colors hover:bg-primary/5 active:bg-primary/10"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0 opacity-70 transition-opacity group-hover/src:opacity-100" />
                        <span className="underline decoration-primary/30 underline-offset-2 group-hover/src:decoration-primary [overflow-wrap:anywhere]">
                          {source.titel}
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
    </div>
  );
};
