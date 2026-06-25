import { Skeleton } from "@/components/ui/skeleton";
import { trackTranscriptOpened } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Lightbulb, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { ClaimCard } from "./ClaimCard";
import { FollowupForm } from "./FollowupForm";
import { FollowupQuestion } from "./FollowupQuestion";
import { TranscriptToggle } from "./TranscriptToggle";
import { FactCheckReport, Followup, VerdictStatus } from "./types";
import { VERDICT_META, verdictToStatus } from "./utils";
import { VerdictBadge } from "./VerdictBadge";

interface FactCheckResultProps {
  transcript: string;
  report: FactCheckReport;
  followups: Followup[];
  onAskFollowup: (question: string) => Promise<void>;
  isLoading: boolean;
}

const TALLY_ORDER: VerdictStatus[] = ["true", "partial", "false", "unknown"];

export const FactCheckResult = ({
  transcript,
  report,
  followups,
  onAskFollowup,
  isLoading,
}: FactCheckResultProps) => {
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

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

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      await onAskFollowup(followupQuestion);
      setFollowupQuestion("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && followups.length === 0) {
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

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Hero verdict */}
      <section
        className={cn(
          "fade-in-up overflow-hidden rounded-lg border-2 shadow-soft-lg",
          meta.border,
          meta.tint,
        )}
      >
        <div className="flex items-start gap-3.5 p-5 sm:gap-4 md:p-6">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-card sm:h-14 sm:w-14",
              meta.border,
              meta.text,
            )}
          >
            <HeroIcon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.5} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="eyebrow">Das Urteil</p>
            <h2
              className={cn(
                "font-display text-[1.6rem] font-bold leading-[1.1] [text-wrap:balance] sm:text-3xl",
                meta.text,
              )}
            >
              {meta.headline}
            </h2>
            <div className="mt-2.5">
              <VerdictBadge status={status} size="lg" />
            </div>
          </div>
        </div>

        <p className="px-5 pb-5 font-body text-[0.975rem] leading-relaxed text-foreground/90 [overflow-wrap:anywhere] sm:text-base md:px-6 md:pb-6">
          {report.fazit}
        </p>

        {/* Verdict scoreboard */}
        {claimCount > 0 && (
          <div className="space-y-2.5 border-t border-border/60 bg-card/50 px-5 py-3.5 md:px-6">
            <div className="flex items-center justify-between gap-2">
              <span className="eyebrow">
                {claimCount} {claimCount === 1 ? "Behauptung" : "Behauptungen"}{" "}
                geprüft
              </span>
            </div>
            {/* Proportion bar */}
            <div
              className="flex h-2 overflow-hidden rounded-full bg-muted"
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
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {presentVerdicts.map((s) => {
                const m = VERDICT_META[s];
                return (
                  <span
                    key={s}
                    className={cn(
                      "inline-flex items-center gap-1.5 font-mono text-xs",
                      m.text,
                    )}
                  >
                    <span
                      className={cn("h-2.5 w-2.5 rounded-full", m.solid)}
                      aria-hidden
                    />
                    {tally[s]} {m.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Vorsicht */}
      {report.vorsicht && (
        <section className="fade-in-up flex items-start gap-3 rounded-lg border border-verdict-partial/50 bg-verdict-partial/[0.06] p-4 md:p-5">
          <ShieldAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-verdict-partial"
            strokeWidth={2.5}
          />
          <div className="min-w-0">
            <p className="eyebrow mb-1">Vorsicht bei diesem Video</p>
            <p className="font-body text-sm leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">
              {report.vorsicht}
            </p>
          </div>
        </section>
      )}

      {/* Claims */}
      {claimCount > 0 && (
        <section>
          <p className="eyebrow mb-1">Beweisaufnahme</p>
          <h2 className="mb-4 font-display text-xl font-bold">
            Behauptung für Behauptung
          </h2>
          <div className="space-y-3">
            {report.behauptungen.map((claim, index) => (
              <ClaimCard key={index} claim={claim} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Self-check tip */}
      {report.selbst_pruefen && (
        <section className="flex items-start gap-3 rounded-lg border border-primary/40 bg-accent p-4 md:p-5">
          <Lightbulb
            className="mt-0.5 h-5 w-5 shrink-0 text-primary"
            strokeWidth={2.5}
          />
          <div className="min-w-0">
            <p className="eyebrow mb-1">Selbst nachprüfen</p>
            <p className="font-body text-sm leading-relaxed text-accent-foreground [overflow-wrap:anywhere]">
              {report.selbst_pruefen}
            </p>
          </div>
        </section>
      )}

      {/* Followups */}
      {followups.length > 0 && (
        <section>
          <p className="eyebrow mb-1">Nachgehakt</p>
          <h3 className="mb-3 font-display text-lg font-bold">
            Zusätzliche Fragen
          </h3>
          <div className="space-y-3">
            {followups.map((followup, index) => (
              <FollowupQuestion
                key={index}
                question={followup.question}
                answer={followup.answer}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Followup form */}
      <FollowupForm
        onSubmit={handleFollowupSubmit}
        question={followupQuestion}
        onChange={setFollowupQuestion}
        isSubmitting={isSubmitting || isLoading}
      />

      {/* Transcript at the very bottom */}
      <TranscriptToggle
        isOpen={isTranscriptOpen}
        onToggle={() => {
          if (!isTranscriptOpen) trackTranscriptOpened();
          setIsTranscriptOpen(!isTranscriptOpen);
        }}
        transcript={transcript}
      />
    </div>
  );
};
