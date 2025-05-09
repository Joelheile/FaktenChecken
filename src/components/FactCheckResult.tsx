import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
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

// Define an interface for structured claims
interface StructuredClaim {
  type: "claim";
  label: string;
  content: string;
  verdict: string;
  explanation: string;
  status: "true" | "false" | "partial" | "unknown";
}

// Define an interface for regular text
interface TextContent {
  type: "text";
  content: string;
}

// Combined content type
type ContentItem = StructuredClaim | TextContent;

const FactCheckResult = ({
  transcript,
  factCheck,
  onAskFollowup,
  isLoading,
}: FactCheckResultProps) => {
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
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
    const processedQuestions = new Set();
    const followups = parts
      .slice(1)
      .map((followupSection, sectionIdx) => {
        // Handle case where there might not be a newline after the question
        const sectionLines = followupSection.trim().split("\n");
        let question = sectionLines[0].trim();

        // The rest of the content is the answer, regardless of format
        let answer = "";
        if (sectionLines.length > 1) {
          answer = sectionLines.slice(1).join("\n").trim();
        }

        // Skip duplicate questions (case insensitive)
        const questionKey = question.toLowerCase().trim();
        if (processedQuestions.has(questionKey) || !answer) {
          return null;
        }
        processedQuestions.add(questionKey);

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
      })
      .filter(Boolean); // Remove null entries (duplicates)

    return followups.length > 0 ? followups : null;
  };

  // Parse the factCheck content to extract structured claims
  const parseFactCheckContent = (text: string): ContentItem[] => {
    const result: ContentItem[] = [];

    // First check if there's a summary section and extract it for special handling
    let summaryContent = "";
    const summaryMatch = text.match(/\*\*Zusammenfassung:\*\*(.*?)(?:\n\n|$)/s);
    if (summaryMatch) {
      summaryContent = summaryMatch[0].trim();
      // Remove summary from text to avoid duplicate processing
      text = text.replace(summaryMatch[0], "").trim();
    }

    // Check if this is a single block of markdown content with embedded claims, verdicts, and explanations
    if (text.includes("**Bewertung:**") && text.includes("**Warum:**")) {
      // Process text with embedded formatting
      try {
        // Extract structured claims from markdown
        let remainingText = text;
        let claimNumber = 1;

        // Find all claim blocks using regex pattern for the full claim structure
        const claimPattern =
          /(?:Behauptung\s*\d*\s*:)?\s*\*\*([^*]+)\*\*\s*Bewertung:\*\*\s*([^*]+)\s*\*\*Warum:\*\*\s*([^*]+)/g;
        let claimMatch;

        while ((claimMatch = claimPattern.exec(text)) !== null) {
          const [fullMatch, claimContent, verdict, explanation] = claimMatch;

          // Determine the claim status
          let status: "true" | "false" | "partial" | "unknown" = "unknown";
          const lowerVerdict = verdict.toLowerCase().trim();

          if (
            lowerVerdict.includes("wahr") &&
            !lowerVerdict.includes("falsch")
          ) {
            status = "true";
          } else if (lowerVerdict.includes("falsch")) {
            status = "false";
          } else if (lowerVerdict.includes("teils")) {
            status = "partial";
          }

          // Add the claim to results
          result.push({
            type: "claim",
            label: `Behauptung ${claimNumber}:`,
            content: claimContent.trim(),
            verdict: verdict.trim(),
            explanation: explanation.trim(),
            status,
          });

          claimNumber++;

          // Remove processed claim from remaining text
          remainingText = remainingText.replace(fullMatch, "");
        }

        // Handle individual claim sections that might not match the pattern above
        if (result.length === 0) {
          // Try to extract claims one by one
          const claimLabels = text.match(/Behauptung\s*\d+\s*:/g) || [];

          claimLabels.forEach((label, index) => {
            const labelIndex = text.indexOf(label);
            const nextLabelIndex =
              index < claimLabels.length - 1
                ? text.indexOf(claimLabels[index + 1])
                : text.length;

            const claimSection = text
              .substring(labelIndex, nextLabelIndex)
              .trim();

            // Extract verdict
            const verdictMatch = claimSection.match(
              /\*\*Bewertung:\*\*\s*([^*]+)/
            );
            const verdict = verdictMatch ? verdictMatch[1].trim() : "";

            // Extract explanation
            const explanationMatch = claimSection.match(
              /\*\*Warum:\*\*\s*([^*]+)/
            );
            const explanation = explanationMatch
              ? explanationMatch[1].trim()
              : "";

            // Extract claim content (everything before verdict)
            let claimContent = claimSection.replace(label, "").trim();
            if (verdictMatch) {
              claimContent = claimContent
                .substring(0, claimContent.indexOf("**Bewertung:**"))
                .trim();
            }

            // Remove any remaining asterisks
            claimContent = claimContent.replace(/\*\*/g, "").trim();

            // Determine status
            let status: "true" | "false" | "partial" | "unknown" = "unknown";
            const lowerVerdict = verdict.toLowerCase();

            if (
              lowerVerdict.includes("wahr") &&
              !lowerVerdict.includes("falsch")
            ) {
              status = "true";
            } else if (lowerVerdict.includes("falsch")) {
              status = "false";
            } else if (lowerVerdict.includes("teils")) {
              status = "partial";
            }

            // Add claim to results
            result.push({
              type: "claim",
              label: label,
              content: claimContent,
              verdict: verdict,
              explanation: explanation || "Keine Erklärung verfügbar.",
              status,
            });
          });
        }

        // Process any remaining text
        if (remainingText.trim() !== "") {
          result.push({
            type: "text",
            content: remainingText.trim(),
          });
        }
      } catch (e) {
        console.error("Error parsing claims:", e);
        // Fallback: add the entire text as a single content item
        result.push({
          type: "text",
          content: text,
        });
      }
    } else {
      // If not in markdown format, try parsing by paragraphs
      const paragraphs = text.split("\n\n");

      // Regular expression to find claim patterns
      const claimPattern = /Behauptung\s*(\d+)?\s*:/i;
      const verdictPattern = /Bewertung\s*:/i;
      const explanationPattern = /Warum\s*:/i;

      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim();
        if (paragraph === "") continue;

        // Check if this paragraph is a claim
        if (claimPattern.test(paragraph)) {
          const claimMatch = paragraph.match(claimPattern);
          const claimLabel = claimMatch ? claimMatch[0] : "Behauptung:";
          const claimContent = paragraph.replace(claimPattern, "").trim();

          // Look ahead for verdict
          let verdict = "";
          let explanation = "";
          let status: "true" | "false" | "partial" | "unknown" = "unknown";

          // Check next paragraph for verdict
          if (
            i + 1 < paragraphs.length &&
            verdictPattern.test(paragraphs[i + 1])
          ) {
            verdict = paragraphs[i + 1].replace(verdictPattern, "").trim();
            i++; // Move to verdict paragraph

            // Check next paragraph for explanation
            if (
              i + 1 < paragraphs.length &&
              explanationPattern.test(paragraphs[i + 1])
            ) {
              explanation = paragraphs[i + 1]
                .replace(explanationPattern, "")
                .trim();
              i++; // Move to explanation paragraph
            }
          }

          // Determine status from verdict
          const lowerVerdict = verdict.toLowerCase();
          if (
            lowerVerdict.includes("wahr") &&
            !lowerVerdict.includes("falsch")
          ) {
            status = "true";
          } else if (lowerVerdict.includes("falsch")) {
            status = "false";
          } else if (lowerVerdict.includes("teils")) {
            status = "partial";
          }

          // Add claim to results
          result.push({
            type: "claim",
            label: claimLabel,
            content: claimContent,
            verdict: verdict,
            explanation: explanation || "Keine Erklärung verfügbar.",
            status,
          });
        } else {
          // Regular text paragraph
          result.push({
            type: "text",
            content: paragraph,
          });
        }
      }
    }

    // If we have a summary content, process it and add to the end
    if (summaryContent) {
      // Extract verdict from summary if available
      let summaryVerdict = "";
      let summaryExplanation = "";
      let status: "true" | "false" | "partial" | "unknown" = "unknown";

      // Extract verdict pattern
      const summaryVerdictMatch = summaryContent.match(
        /\*\*Ergebnis:\*\*\s*([^*\n]+)/
      );
      if (summaryVerdictMatch) {
        summaryVerdict = summaryVerdictMatch[1].trim();

        // Determine status from verdict
        const lowerVerdict = summaryVerdict.toLowerCase();
        if (lowerVerdict.includes("wahr") && !lowerVerdict.includes("falsch")) {
          status = "true";
        } else if (lowerVerdict.includes("falsch")) {
          status = "false";
        } else if (lowerVerdict.includes("teils")) {
          status = "partial";
        }
      }

      // Extract simple explanation if available
      const summaryExplanationMatch = summaryContent.match(
        /\*\*Einfach erklärt:\*\*\s*([^*\n]+)/
      );
      if (summaryExplanationMatch) {
        summaryExplanation = summaryExplanationMatch[1].trim();
      }

      // Add the summary as a special claim
      result.push({
        type: "claim",
        label: "Zusammenfassung:",
        content: summaryExplanation || "Zusammenfassung des Faktenchecks",
        verdict: summaryVerdict,
        explanation: summaryExplanation || "",
        status,
      });
    }

    // If no results, add the entire text as a fallback
    if (result.length === 0) {
      result.push({
        type: "text",
        content: text,
      });
    }

    return result;
  };

  // Render a claim with proper styling
  const renderClaim = (claim: StructuredClaim, index: number) => {
    // Determine the appropriate styling based on the verdict
    const bgColorClass =
      claim.status === "true"
        ? "bg-green-50 border-green-200"
        : claim.status === "false"
          ? "bg-red-50 border-red-200"
          : claim.status === "partial"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-blue-50 border-blue-200";

    const textColorClass =
      claim.status === "true"
        ? "text-green-800"
        : claim.status === "false"
          ? "text-red-800"
          : claim.status === "partial"
            ? "text-yellow-800"
            : "text-blue-800";

    return (
      <div
        key={`claim-${index}`}
        className={`border rounded-md p-3 mb-4 ${bgColorClass} ${textColorClass}`}
      >
        <div className="font-bold mb-1">{claim.label}</div>
        <div className="mb-2">{claim.content}</div>
        <div className="font-bold mb-1">Bewertung:</div>
        <div className="mb-2 font-semibold">{claim.verdict}</div>
        <div className="font-bold mb-1">Warum:</div>
        <div>{claim.explanation}</div>
      </div>
    );
  };

  // Render text content
  const renderTextContent = (textContent: TextContent, index: number) => {
    return (
      <p
        key={`text-${index}`}
        className="mb-4 text-sm md:text-base text-slate-600"
      >
        {textContent.content}
      </p>
    );
  };

  // Check if transcript is empty
  const isEmptyTranscript = !transcript || transcript.trim().length < 5;

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

  // Parse fact check content
  const parsedContent = parseFactCheckContent(mainFactCheck);

  return (
    <div className="w-full max-w-xl space-y-4 md:space-y-6">
      <Card>
        <CardHeader
          className="pb-2 md:pb-6 cursor-pointer"
          onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
        >
          <CardTitle className="text-lg md:text-xl flex justify-between items-center">
            <span>Transkript</span>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                isTranscriptOpen ? "transform rotate-180" : ""
              }`}
            />
          </CardTitle>
        </CardHeader>
        {isTranscriptOpen && (
          <CardContent>
            {isEmptyTranscript ? (
              <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-gray-50 rounded-lg">
                <XCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-xl md:text-2xl font-bold text-red-500 text-center mb-2">
                  Kein Transkript vorhanden
                </p>
                <p className="text-sm md:text-base text-gray-600 text-center">
                  Es gibt keinen Text im Video, der ausgewertet werden kann.
                </p>
              </div>
            ) : (
              <p className="text-xs md:text-sm">{transcript}</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Verdict Card with big indicator */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2 md:pb-6">
          <CardTitle className="flex items-center gap-1 md:gap-2 text-lg md:text-xl">
            <div className="flex flex-col">
              <span>Ergebnis des KI Faktenchecks</span>
              <p className="text-xs md:text-sm text-gray-500">
                (kann Fehler enthalten, da es automatisch erstellt wird)
              </p>
            </div>
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
            <div className="text-base md:text-lg p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg shadow-sm">
              <p>{simpleExplanation}</p>
            </div>
          </div>

          <div className="mt-4 md:mt-6 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-800">
                Analyse des Videos
              </h2>

              <div className="space-y-4 md:space-y-6">
                {parsedContent.map((item, index) =>
                  item.type === "claim"
                    ? renderClaim(item, index)
                    : renderTextContent(item, index)
                )}
              </div>
            </div>
          </div>

          {followupQuestions}

          {!isEmptyTranscript && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FactCheckResult;
