import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  HelpCircle,
  Loader,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface FactCheckResultProps {
  transcript: string;
  factCheck: string;
  onAskFollowup: (question: string) => Promise<void>;
  isLoading: boolean;
}

const FactCheckResult = ({
  transcript,
  factCheck,
  onAskFollowup,
  isLoading,
}: FactCheckResultProps) => {
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

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

  // Check if we have followup questions
  const hasFollowup = factCheck.includes("--- Folgende Frage ---");

  // Determine the overall verdict (WAHR or FALSCH)
  const determineVerdict = (text: string) => {
    const lowerText = text.toLowerCase();

    // More sophisticated logic to determine the verdict
    const falseIndicators = [
      "falsch",
      "nicht korrekt",
      "irreführend",
      "fehlinformation",
    ];
    const trueIndicators = ["korrekt", "richtig", "wahr", "stimmt"];

    // Count occurrences of indicators
    const falseCount = falseIndicators.reduce(
      (count, indicator) => count + (lowerText.split(indicator).length - 1),
      0
    );
    const trueCount = trueIndicators.reduce(
      (count, indicator) => count + (lowerText.split(indicator).length - 1),
      0
    );

    // If there are significantly more false indicators, consider it false
    if (falseCount > trueCount + 1) {
      return "FALSCH";
    }
    // If there are significantly more true indicators, consider it true
    else if (trueCount > falseCount + 1) {
      return "WAHR";
    }
    // Otherwise, look for summary statements that might indicate the final verdict
    else if (
      lowerText.includes("überwiegend falsch") ||
      lowerText.includes("größtenteils falsch") ||
      lowerText.includes("meistens falsch")
    ) {
      return "FALSCH";
    } else if (
      lowerText.includes("überwiegend wahr") ||
      lowerText.includes("größtenteils wahr") ||
      lowerText.includes("meistens wahr")
    ) {
      return "WAHR";
    }
    // Default to showing both perspectives
    else {
      return "TEILS-TEILS";
    }
  };

  // Extract a simplified explanation
  const extractSimpleExplanation = (text: string) => {
    // Split into paragraphs
    const paragraphs = text.split("\n\n");

    // Find summary paragraphs - usually toward the end
    const summaryParagraphs = paragraphs.filter(
      (p) =>
        p.toLowerCase().includes("zusammenfass") ||
        p.toLowerCase().includes("fazit") ||
        p.toLowerCase().includes("insgesamt")
    );

    if (summaryParagraphs.length > 0) {
      // Take the first summary paragraph and simplify if needed
      return summaryParagraphs[0];
    } else {
      // If no summary found, take the first few paragraphs (introductory text)
      return paragraphs.slice(0, 2).join("\n\n");
    }
  };

  // Format the factCheck result with better styling
  const formatFactCheck = (text: string) => {
    // First, split by the followup question delimiter
    const parts = text.split("--- Folgende Frage ---");

    const mainCheck = parts[0].split("\n\n").map((paragraph, idx) => (
      <p
        key={`main-${idx}`}
        className={cn(
          "my-2",
          paragraph.startsWith("---") ? "mt-6 font-semibold" : ""
        )}
      >
        {paragraph}
      </p>
    ));

    // Format any followup sections
    const followups = parts.slice(1).map((followupSection, sectionIdx) => {
      const [question, ...answerParts] = followupSection.trim().split("\n\n");
      const answer = answerParts.join("\n\n");

      return (
        <div
          key={`followup-${sectionIdx}`}
          className="mt-6 pt-4 border-t border-blue-200"
        >
          <div className="bg-blue-50 p-3 rounded-md mb-3">
            <p className="font-medium text-blue-800">
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Frage: {question}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            {answer.split("\n\n").map((paragraph, pIdx) => (
              <p key={`answer-${sectionIdx}-${pIdx}`} className="my-2">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      );
    });

    return (
      <>
        {mainCheck}
        {followups}
      </>
    );
  };

  if (isLoading && (!transcript || !factCheck)) {
    return (
      <div className="w-full max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transkript</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-24" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faktencheck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-5/6 h-8" />
              <Skeleton className="w-4/6 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine the verdict and explanation
  const verdict = determineVerdict(factCheck);
  const simpleExplanation = extractSimpleExplanation(factCheck);

  return (
    <div className="w-full max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transkript</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{transcript}</p>
        </CardContent>
      </Card>

      {/* Verdict Card with big indicator */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Ergebnis des Faktenchecks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center mb-4">
            <div
              className={cn(
                "w-full max-w-sm py-6 rounded-lg font-bold text-3xl flex items-center justify-center mb-4",
                verdict === "WAHR"
                  ? "bg-green-100 text-green-700"
                  : verdict === "FALSCH"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              )}
            >
              {verdict === "WAHR" && <CheckCircle2 className="h-8 w-8 mr-2" />}
              {verdict === "FALSCH" && <XCircle className="h-8 w-8 mr-2" />}
              {verdict}
            </div>
            <div className="text-lg p-4 bg-slate-50 rounded-lg">
              {simpleExplanation}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis (Collapsed initially) */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Ausführliche Faktencheck-Analyse</span>
            {!isLoading && hasFollowup && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                +Folgetragen beantwortet
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {formatFactCheck(factCheck)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Rückfragen an ChatGPT</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="info" className="mb-4">
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              Du kannst weitere Fragen zum Faktencheck stellen. ChatGPT behält
              den Kontext früherer Fragen bei.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleFollowupSubmit} className="space-y-4">
            <Textarea
              placeholder="Stelle eine Frage zu diesem Faktencheck..."
              value={followupQuestion}
              onChange={(e) => setFollowupQuestion(e.target.value)}
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn("transition-all", isMobile ? "w-full" : "")}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Sende...
                  </>
                ) : (
                  "Frage senden"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FactCheckResult;
