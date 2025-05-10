import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ClaimCard } from "./ClaimCard";
import { FollowupForm } from "./FollowupForm";
import { FollowupQuestion } from "./FollowupQuestion";
import { TextContentBlock } from "./TextContentBlock";
import { TranscriptToggle } from "./TranscriptToggle";
import { VerdictBadge } from "./VerdictBadge";
import { StructuredClaim, VerdictStatus } from "./types";
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
      <div className="mt-6 space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2">
          Zusätzliche Fragen
        </h3>
        {followups}
      </div>
    ) : null;
  };

  const renderContent = () => {
    const parsedContent = parseFactCheckContent(factCheck, hasFollowup);
    const claims = parsedContent.filter(
      (item): item is StructuredClaim => item.type === "claim"
    );
    const textBlocks = parsedContent.filter((item) => item.type === "text");

    if (claims.length === 0) {
      return (
        <div className="space-y-4">
          {textBlocks.map((item, index) => (
            <TextContentBlock
              key={index}
              content={(item as any).content}
              index={index}
            />
          ))}
        </div>
      );
    }

    const getVerdictIcon = (status: VerdictStatus) => {
      switch (status) {
        case "true":
          return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        case "false":
          return <XCircle className="h-5 w-5 text-red-600" />;
        default:
          return <HelpCircle className="h-5 w-5 text-amber-600" />;
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100 flex items-center space-x-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Wahr</div>
              <div className="text-sm text-green-700">
                Korrekte Behauptungen
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100 flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <div className="font-medium text-red-800">Falsch</div>
              <div className="text-sm text-red-700">
                Inkorrekte Behauptungen
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg shadow-sm border border-amber-100 flex items-center space-x-3">
            <HelpCircle className="h-8 w-8 text-amber-600" />
            <div>
              <div className="font-medium text-amber-800">Teilweise wahr</div>
              <div className="text-sm text-amber-700">
                Gemischte Behauptungen
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg shadow-sm border border-slate-100 flex items-center space-x-3">
            <HelpCircle className="h-8 w-8 text-slate-500" />
            <div>
              <div className="font-medium text-slate-800">Unbekannt</div>
              <div className="text-sm text-slate-700">Nicht verifizierbar</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {claims.map((claim, index) => (
            <ClaimCard key={index} claim={claim} index={index} />
          ))}
        </div>

        {textBlocks.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">
              Zusätzliche Informationen
            </h3>
            {textBlocks.map((item, index) => (
              <TextContentBlock
                key={`text-${index}`}
                content={(item as any).content}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
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
  const simpleExplanation = extractSimpleExplanation(factCheck);

  return (
    <div className="mt-4 md:mt-6 space-y-6 md:space-y-8">
      <Card className="border-2 border-blue-200 shadow-md overflow-hidden">
        <CardHeader className="bg-blue-50 pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-blue-800">Zusammenfassung</span>
            <VerdictBadge verdict={verdict} status={status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gradient-to-b from-blue-50/50 to-white pt-4">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="prose prose-sm max-w-none">{children}</p>
              ),
            }}
          >
            {simpleExplanation}
          </ReactMarkdown>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          Detailbewertung
        </h3>
        {renderContent()}
      </div>

      {formatFollowupQuestions(factCheck)}

      <Card className="border border-blue-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-blue-50 pb-3">
          <CardTitle className="text-blue-800 text-lg">
            Stelle eine Frage
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <FollowupForm
            onSubmit={handleFollowupSubmit}
            question={followupQuestion}
            onChange={setFollowupQuestion}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      <TranscriptToggle
        isOpen={isTranscriptOpen}
        onToggle={() => setIsTranscriptOpen(!isTranscriptOpen)}
        transcript={transcript}
      />
    </div>
  );
};
