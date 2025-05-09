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
import ReactMarkdown from "react-markdown";

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

    // Check for explicit verdict in Markdown format first
    if (text.includes("**Ergebnis:** WAHR")) {
      return "WAHR";
    } else if (text.includes("**Ergebnis:** FALSCH")) {
      return "FALSCH";
    } else if (text.includes("**Ergebnis:** TEILS-TEILS")) {
      return "TEILS-TEILS";
    }

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
    // Look for Markdown formatted summary
    const match = text.match(/\*\*Einfach erklärt:\*\*\s*(.+?)(\n|$)/);
    if (match && match[1]) {
      return match[1].trim();
    }

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

  // Format the factCheck result with better styling for follow-up questions
  const formatFollowupQuestions = (text: string) => {
    if (!hasFollowup) return null;

    // First, split by the followup question delimiter
    const parts = text.split("--- Folgende Frage ---");

    // We only want the followup parts, not the main check
    const followups = parts.slice(1).map((followupSection, sectionIdx) => {
      const [question, ...answerParts] = followupSection.trim().split("\n\n");
      const answer = answerParts.join("\n\n");

      return (
        <div
          key={`followup-${sectionIdx}`}
          className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-blue-200"
        >
          <div className="bg-blue-50 p-2 md:p-3 rounded-md mb-2 md:mb-3">
            <p className="font-medium text-blue-800 text-sm md:text-base">
              <MessageCircle className="h-3 md:h-4 w-3 md:w-4 inline mr-1 md:mr-2" />
              Frage: {question}
            </p>
          </div>
          <div className="bg-gray-50 p-2 md:p-3 rounded-md">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p
                    className="prose prose-sm max-w-none my-1 md:my-2 text-xs md:text-sm"
                    {...props}
                  />
                ),
              }}
            >
              {answer}
            </ReactMarkdown>
          </div>
        </div>
      );
    });

    return followups.length > 0 ? followups : null;
  };

  if (isLoading && (!transcript || !factCheck)) {
    return (
      <div className="w-full max-w-xl space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Transkript</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-16 md:h-24" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Faktencheck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 md:space-y-2">
              <Skeleton className="w-full h-6 md:h-8" />
              <Skeleton className="w-5/6 h-6 md:h-8" />
              <Skeleton className="w-4/6 h-6 md:h-8" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine the verdict and explanation
  const verdict = determineVerdict(factCheck);
  const simpleExplanation = extractSimpleExplanation(factCheck);

  // For followup questions, we want to separate them from the main factCheck
  const mainFactCheck = factCheck.split("--- Folgende Frage ---")[0];
  const followupQuestions = formatFollowupQuestions(factCheck);

  return (
    <div className="w-full max-w-xl space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-2 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Transkript</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs md:text-sm">{transcript}</p>
        </CardContent>
      </Card>

      {/* Verdict Card with big indicator */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2 md:pb-6">
          <CardTitle className="flex items-center gap-1 md:gap-2 text-lg md:text-xl">
            <span>Ergebnis des Faktenchecks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center mb-3 md:mb-4">
            <div
              className={cn(
                "w-full max-w-sm py-4 md:py-6 rounded-lg font-bold text-xl md:text-3xl flex items-center justify-center mb-3 md:mb-4",
                verdict === "WAHR"
                  ? "bg-green-100 text-green-700"
                  : verdict === "FALSCH"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              )}
            >
              {verdict === "WAHR" && (
                <CheckCircle2 className="h-6 md:h-8 w-6 md:w-8 mr-1 md:mr-2" />
              )}
              {verdict === "FALSCH" && (
                <XCircle className="h-6 md:h-8 w-6 md:w-8 mr-1 md:mr-2" />
              )}
              {verdict}
            </div>
            <div className="text-base md:text-lg p-3 md:p-4 bg-slate-50 rounded-lg">
              <p>{simpleExplanation}</p>
            </div>
          </div>

          <div className="mt-4 md:mt-6 rounded-lg">
            <details>
              <summary className="cursor-pointer text-sm md:text-base font-medium p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                Vollständige Analyse anzeigen
              </summary>
              <div className="mt-2 md:mt-3 p-2 md:p-3 bg-slate-50 rounded-lg text-xs md:text-sm">
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p
                        className="mt-2 md:mt-3 prose-sm max-w-none"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="mt-2 md:mt-3 list-disc pl-4 md:pl-5"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mt-1 md:mt-2" {...props} />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-base md:text-lg font-bold mt-3 md:mt-4 mb-1 md:mb-2"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-sm md:text-base font-bold mt-3 md:mt-4 mb-1 md:mb-2"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-sm md:text-base font-semibold mt-2 md:mt-3 mb-1 md:mb-2"
                        {...props}
                      />
                    ),
                  }}
                >
                  {mainFactCheck}
                </ReactMarkdown>
              </div>
            </details>
          </div>

          {followupQuestions}

          <form onSubmit={handleFollowupSubmit} className="mt-5 md:mt-6">
            <div className="space-y-2 md:space-y-3">
              <p className="text-sm md:text-base font-medium flex items-center">
                <HelpCircle className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                Stelle eine Frage zu diesem Video
              </p>
              <Textarea
                placeholder="Zum Beispiel: Was bedeutet...? Ist es wahr, dass...?"
                value={followupQuestion}
                onChange={(e) => setFollowupQuestion(e.target.value)}
                rows={3}
                className="w-full min-h-24 p-2 md:p-3 text-xs md:text-sm"
              />
              <Button
                type="submit"
                disabled={isSubmitting || !followupQuestion.trim()}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2 animate-spin" />
                    Frage wird beantwortet...
                  </>
                ) : (
                  "Frage stellen"
                )}
              </Button>
              <Alert className="bg-blue-50 border-blue-100 mt-2 md:mt-3">
                <AlertDescription className="text-xs md:text-sm text-blue-700">
                  Du kannst mehrere Fragen stellen, um mehr über das Thema zu
                  erfahren.
                </AlertDescription>
              </Alert>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FactCheckResult;
