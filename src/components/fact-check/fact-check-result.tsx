import { ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ClaimCard } from "./claim-card";
import type { FactCheckReport, VerdictStatus } from "./types";
import { VERDICT_META, verdictToStatus } from "./utils";
import { VideoEmbed } from "./video-embed";

const NO_CAUTION = /keine\s+auff/i;

interface FactCheckResultProps {
  isLoading: boolean;
  report: FactCheckReport;
  videoId: string | null;
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
  const showCaution = !!report.vorsicht && !NO_CAUTION.test(report.vorsicht);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Embedded video */}
      {videoId && <VideoEmbed videoId={videoId} />}

      {/* Verdict + caution, one card */}
      <section
        className={cn(
          "rounded-xl border bg-card p-5 shadow-soft md:p-6",
          meta.border
        )}
      >
        <div className="flex items-center gap-2.5">
          <HeroIcon
            className={cn("h-5 w-5 shrink-0", meta.text)}
            strokeWidth={2.5}
          />
          <h2
            className={cn(
              "font-bold font-display text-xl leading-tight [text-wrap:balance] sm:text-2xl",
              meta.text
            )}
          >
            {meta.headline}
          </h2>
        </div>

        <p className="mt-3 font-body text-foreground/90 text-sm leading-relaxed [overflow-wrap:anywhere]">
          {report.fazit}
        </p>

        {showCaution && (
          <div className="mt-4 flex items-start gap-2.5 border-verdict-partial/50 border-l-2 pl-3">
            <ShieldAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-verdict-partial"
              strokeWidth={2.5}
            />
            <div className="min-w-0">
              <p className="eyebrow mb-0.5 text-verdict-partial">
                Vorsicht im Video
              </p>
              <p className="font-body text-foreground/90 text-sm leading-relaxed [overflow-wrap:anywhere]">
                {report.vorsicht}
              </p>
            </div>
          </div>
        )}

        {/* Verdict tally */}
        {claimCount > 0 && (
          <div className="mt-5 space-y-2.5 border-border/60 border-t pt-4">
            <div
              aria-label="Verteilung der Bewertungen"
              className="flex h-1.5 overflow-hidden rounded-full bg-muted"
              role="img"
            >
              {presentVerdicts.map((s) => (
                <div
                  className={VERDICT_META[s].solid}
                  key={s}
                  style={{ flexGrow: tally[s] }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="font-mono text-muted-foreground text-xs">
                {claimCount} geprüft:
              </span>
              {presentVerdicts.map((s) => {
                const m = VERDICT_META[s];
                return (
                  <span className={cn("font-mono text-xs", m.text)} key={s}>
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
          <h2 className="mb-4 font-bold font-display text-lg">
            Behauptung für Behauptung
          </h2>
          <div className="space-y-3">
            {report.behauptungen.map((claim, index) => (
              <ClaimCard claim={claim} index={index} key={claim.behauptung} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
