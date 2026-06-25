import { FactCheckResult, Followup } from "@/components/fact-check";
import {
  AppExplanation,
  ErrorAlert,
  Footer,
  Header,
  ProgressIndicator,
} from "@/components/home";
import { TikTokInput } from "@/components/tiktok-input";
import {
  trackFactCheckCompleted,
  trackFactCheckError,
  trackFactCheckSubmitted,
  trackFollowupAnswered,
  trackFollowupAsked,
  trackFollowupError,
  trackImpressumClicked,
} from "@/lib/analytics";
import {
  askFollowupQuestion,
  FactCheckResponse,
  transcribeAndFactCheck,
} from "@/services/api";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [factCheckData, setFactCheckData] = useState<FactCheckResponse | null>(
    null,
  );
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    url: string,
    statement?: string,
    source: "manual" | "example" = "manual",
  ) => {
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setFollowups([]);

    const hasUrl = !!url;
    setProgressMessage(
      hasUrl
        ? "TikTok Video wird geladen..."
        : "Faktencheck wird vorbereitet...",
    );

    trackFactCheckSubmitted({ url, statement, source });
    const startedAt = Date.now();

    // The transcript fetch and the model run expose no sub-progress, so creep
    // gently toward a moving cap while they run. The cap rises once the model
    // starts analyzing; the bar jumps to 100 when the real result arrives.
    let creepCap = hasUrl ? 28 : 8;
    const creep = setInterval(() => {
      setProgress((prev) => (prev < creepCap ? prev + 1 : prev));
    }, 300);

    try {
      const result = await transcribeAndFactCheck(url, statement, (event) => {
        switch (event.stage) {
          case "transcript":
            setProgressMessage("Transkript wird aus TikTok Video erstellt...");
            break;
          case "analyzing":
            creepCap = hasUrl ? 90 : 85;
            setProgressMessage("Internet wird nach Fakten durchsucht...");
            break;
        }
      });
      clearInterval(creep);
      setProgress(100);
      setFactCheckData(result);
      toast.success("Faktencheck erfolgreich abgeschlossen!");

      trackFactCheckCompleted({
        report: result.report,
        transcriptLength: result.transcript?.length ?? 0,
        durationMs: Date.now() - startedAt,
      });

      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      clearInterval(creep);
      setProgress(0);
      console.error("Error during fact check:", error);

      let errorMessage = "Unbekannter Fehler";
      let errorType = "";

      if (error instanceof Error) {
        errorMessage = error.message;
        errorType =
          error.name === "ApiError"
            ? (error as Error & { type?: string }).type
            : "";
      }

      setError(errorMessage);
      toast.error("Fehler beim Faktencheck: " + errorMessage);

      trackFactCheckError(errorMessage, errorType);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupQuestion = async (question: string) => {
    setError(null);
    setIsLoading(true);

    trackFollowupAsked(question);

    try {
      const answer = await askFollowupQuestion(question);
      setFollowups((prev) => [...prev, { question: question.trim(), answer }]);
      trackFollowupAnswered(question, answer);
    } catch (error) {
      console.error("Error asking followup:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setError(errorMessage);
      toast.error("Fehler bei der Beantwortung der Frage: " + errorMessage);

      trackFollowupError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpressumClick = () => {
    trackImpressumClicked();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background bg-dots">
      <Toaster position="top-center" />

      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8 md:py-16">
        <Header />

        <main className="mt-10 flex flex-col">
          <TikTokInput onSubmit={handleSubmit} isLoading={isLoading} />

          {error && <ErrorAlert message={error} />}

          {progress > 0 && (
            <ProgressIndicator progress={progress} message={progressMessage} />
          )}

          {!factCheckData && !isLoading && <AppExplanation />}

          {factCheckData && (
            <div className="mt-8 w-full">
              <FactCheckResult
                transcript={factCheckData.transcript}
                report={factCheckData.report}
                followups={followups}
                onAskFollowup={handleFollowupQuestion}
                isLoading={isLoading}
              />
            </div>
          )}
        </main>
      </div>

      <Footer onImpressumClick={handleImpressumClick} />
    </div>
  );
};
