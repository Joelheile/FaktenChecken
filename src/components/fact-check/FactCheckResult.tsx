import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { ClaimCard } from "./ClaimCard";
import { FactCheckReport, VerdictStatus } from "./types";
import { VERDICT_META, verdictToStatus } from "./utils";
import { VideoEmbed } from "./VideoEmbed";

interface FactCheckResultProps {
  report: FactCheckReport;
  videoId: string | null;
  isLoading: boolean;
}

const TALLY_ORDER: VerdictStatus[] = ["true", "partial", "false", "unknown"];

export const FactCheckResult = ({
  report,
  videoId,
  isLoading,
}: FactCheckResultProps) => {
  const tally = useMemo(() => {
    const counts: Record<VerdictStatus, number> = {
      true: 0,
      false: 0,
      partial: 0,
      unknown: 0,
    };
    for (const claim of report.behauptungen) {
      counts[verdictToStatus(claim.urteil)]++;
    }
    return counts;
  }, [report.behauptungen]);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const status = verdictToStatus(report.gesamturteil);
  const meta = VERDICT_META[status];
  const HeroIcon = meta.icon;
  const claimCount = report.behauptungen.length;
  const presentVerdicts = TALLY_ORDER.filter((s) => tally[s] > 0);
  const showCaution =
    !!report.vorsicht && !/keine\s+auff/i.test(report.vorsicht);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Embedded video */}
      {videoId && <VideoEmbed videoId={videoId} />}

      {/* Verdict + caution, one card */}
      <section
        className={cn(
          "rounded-xl border bg-card p-5 shadow-soft md:p-6",
          meta.border,
        )}
      >
        <div className="flex items-center gap-2.5">
          <HeroIcon
            className={cn("h-5 w-5 shrink-0", meta.text)}
            strokeWidth={2.5}
          />
          <h2
            className={cn(
              "font-display text-xl font-bold leading-tight [text-wrap:balance] sm:text-2xl",
              meta.text,
            )}
          >
            {meta.headline}
          </h2>
        </div>

        <p className="mt-3 font-body text-sm leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">
          {report.fazit}
        </p>

        {showCaution && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-verdict-partial/40 bg-verdict-partial/[0.06] p-3">
            <ShieldAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-verdict-partial"
              strokeWidth={2.5}
            />
            <div className="min-w-0">
              <p className="eyebrow mb-0.5 text-verdict-partial">
                Vorsicht im Video
              </p>
              <p className="font-body text-sm leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">
                {report.vorsicht}
              </p>
            </div>
          </div>
        )}

        {/* Verdict tally */}
        {claimCount > 0 && (
          <div className="mt-5 space-y-2.5 border-t border-border/60 pt-4">
            <div
              className="flex h-1.5 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label="Verteilung der Bewertungen"
            >
              {presentVerdicts.map((s) => (
                <div
                  key={s}
                  className={VERDICT_META[s].solid}
                  style={{ flexGrow: tally[s] }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="font-mono text-xs text-muted-foreground">
                {claimCount} geprüft:
              </span>
              {presentVerdicts.map((s) => {
                const m = VERDICT_META[s];
                return (
                  <span key={s} className={cn("font-mono text-xs", m.text)}>
                    {tally[s]} {m.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Claims */}
      {claimCount > 0 && (
        <section>
          <p className="eyebrow mb-1">Beweisaufnahme</p>
          <h2 className="mb-4 font-display text-lg font-bold">
            Behauptung für Behauptung
          </h2>
          <div className="space-y-3">
            {report.behauptungen.map((claim, index) => (
              <ClaimCard key={index} claim={claim} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
