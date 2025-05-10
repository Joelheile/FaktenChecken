import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
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

interface FactCheckResultProps {
  transcript: string;
  factCheck: string;
  onAskFollowup: (question: string) => Promise<void>;
  isLoading: boolean;
}

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
    const processedQuestions = new Set();

    const followups = parts
      .slice(1)
      .map((followupSection, sectionIdx) => {
        const sectionLines = followupSection.trim().split("\n");
        let question = sectionLines[0].trim();

        let answer = "";
        if (sectionLines.length > 1) {
          answer = sectionLines.slice(1).join("\n").trim();
        }

        const questionKey = question.toLowerCase().trim();
        if (processedQuestions.has(questionKey) || !answer) {
          return null;
        }
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

    return followups.length > 0 ? (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Zusätzliche Fragen</h3>
        <div className="space-y-4">{followups}</div>
      </div>
    ) : null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
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

  const { verdict, status } = getOverallVerdict(factCheck, hasFollowup);
  const parsedContent = parseFactCheckContent(factCheck, hasFollowup);
  const claims = parsedContent.filter(
    (item): item is StructuredClaim => item.type === "claim",
  );

  // Get verdict text based on status
  const verdictText = {
    true: "WAHR",
    false: "FALSCH",
    partial: "TEILS-TEILS",
    unknown: "UNBEKANNT",
  }[status];

  // Build a simpler summary
  const summaryText =
    extractSimpleExplanation(factCheck) ||
    "Bitte prüfen Sie die einzelnen Behauptungen für Details.";

  return (
    <div className="mt-4 space-y-6">
      {/* Simple Summary Card */}
      <Card className="p-4 border">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{`# Zusammenfassung: ${verdictText}

${summaryText}`}</ReactMarkdown>
        </div>
      </Card>

      {/* Claims Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Detailbewertung</h2>
        <div className="space-y-4">
          {claims.map((claim, index) => (
            <ClaimCard key={index} claim={claim} index={index} />
          ))}
        </div>
      </div>

      {formatFollowupQuestions(factCheck)}

      <div className="pt-4">
        <TranscriptToggle
          isOpen={isTranscriptOpen}
          onToggle={() => setIsTranscriptOpen(!isTranscriptOpen)}
          transcript={transcript}
        />
      </div>

      <div className="pt-4">
        <FollowupForm
          onSubmit={handleFollowupSubmit}
          question={followupQuestion}
          onChange={setFollowupQuestion}
          isSubmitting={isSubmitting || isLoading}
        />
      </div>
    </div>
  );
};
