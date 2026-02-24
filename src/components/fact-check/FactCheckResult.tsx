import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ClaimCard } from "./ClaimCard";
import { FollowupForm } from "./FollowupForm";
import { FollowupQuestion } from "./FollowupQuestion";
import { TranscriptToggle } from "./TranscriptToggle";
import { StructuredClaim } from "./types";
import {
  extractSimpleExplanation,
  getOverallVerdict,
  parseFactCheckContent,
} from "./utils";
import { VerdictBadge } from "./VerdictBadge";

interface FactCheckResultProps {
  transcript: string;
  factCheck: string;
  onAskFollowup: (question: string) => Promise<void>;
  isLoading: boolean;
}

const VERDICT_LABEL: Record<string, string> = {
  true: "WAHR",
  false: "FALSCH",
  partial: "TEILS-TEILS",
  unknown: "UNBEKANNT",
};

export const FactCheckResult = ({
  transcript,
  factCheck,
  onAskFollowup,
  isLoading,
}: FactCheckResultProps) => {
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const hasFollowup = factCheck.includes("--- Folgende Frage ---");

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

  const formatFollowupQuestions = (text: string) => {
    if (!hasFollowup) return null;

    const parts = text.split("--- Folgende Frage ---");
    const processedQuestions = new Set<string>();

    const followups = parts
      .slice(1)
      .map((followupSection, sectionIdx) => {
        const sectionLines = followupSection.trim().split("\n");
        const question = sectionLines[0].trim();
        const answer =
          sectionLines.length > 1
            ? sectionLines.slice(1).join("\n").trim()
            : "";

        const questionKey = question.toLowerCase().trim();
        if (processedQuestions.has(questionKey) || !answer) return null;
        processedQuestions.add(questionKey);

        return (
          <FollowupQuestion
            key={`followup-${sectionIdx}`}
            question={question}
            answer={answer}
            index={sectionIdx}
          />
        );
      })
      .filter(Boolean);

    if (followups.length === 0) return null;

    return (
      <div>
        <h3 className="font-display text-base font-bold mb-3">
          Zusätzliche Fragen
        </h3>
        <div className="space-y-3">{followups}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3 mt-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (!factCheck) {
    return (
      <Alert className="my-4">
        <AlertDescription>
          Noch keine Faktenprüfung durchgeführt. Gib einen TikTok-Link ein, um
          zu beginnen.
        </AlertDescription>
      </Alert>
    );
  }

  const { status } = getOverallVerdict(factCheck, hasFollowup);
  const parsedContent = parseFactCheckContent(factCheck, hasFollowup);
  const claims = parsedContent.filter(
    (item): item is StructuredClaim => item.type === "claim",
  );

  const summaryText =
    extractSimpleExplanation(factCheck) ||
    "Bitte prüfen Sie die einzelnen Behauptungen für Details.";

  return (
    <div className="mt-6 space-y-6 fade-in-up">
      {/* Summary */}
      <div className="border border-border rounded-lg bg-card p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold">Zusammenfassung</h2>
          <VerdictBadge
            verdict={VERDICT_LABEL[status] ?? "UNBEKANNT"}
            status={status}
          />
        </div>
        <div className="prose prose-sm max-w-none font-body text-muted-foreground [&_p]:leading-relaxed [&_p]:text-sm">
          <ReactMarkdown>{summaryText}</ReactMarkdown>
        </div>
      </div>

      {/* Claims */}
      <div>
        <h2 className="font-display text-lg font-bold mb-3">Detailbewertung</h2>
        <div className="space-y-3">
          {claims.map((claim, index) => (
            <ClaimCard key={index} claim={claim} index={index} />
          ))}
        </div>
      </div>

      {formatFollowupQuestions(factCheck)}

      <TranscriptToggle
        isOpen={isTranscriptOpen}
        onToggle={() => setIsTranscriptOpen(!isTranscriptOpen)}
        transcript={transcript}
      />

      <FollowupForm
        onSubmit={handleFollowupSubmit}
        question={followupQuestion}
        onChange={setFollowupQuestion}
        isSubmitting={isSubmitting || isLoading}
      />
    </div>
  );
};
