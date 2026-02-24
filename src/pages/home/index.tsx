import { FactCheckResult } from "@/components/fact-check";
import {
  AppExplanation,
  ErrorAlert,
  ExampleTip,
  Footer,
  Header,
  ProgressIndicator,
} from "@/components/home";
import { TikTokInput } from "@/components/tiktok-input";
import { posthog } from "@/lib/posthog";
import {
  askFollowupQuestion,
  FactCheckResponse,
  transcribeAndFactCheck,
} from "@/services/api";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

const getProgressMessage = (
  progress: number,
  hasStatement: boolean,
  hasUrl: boolean,
): string => {
  if (!hasUrl && hasStatement) {
    if (progress < 30) return "Aussage wird aufbereitet...";
    if (progress < 60) return "Internet wird nach aktuellen Fakten durchsucht...";
    if (progress < 85) return "Fakten werden von KI ausgewertet...";
    return "Ergebnisse werden zusammengestellt...";
  }

  if (progress < 30) return "TikTok Video wird geladen...";
  if (progress < 50) return "Transkript wird aus TikTok Video erstellt...";
  if (progress < 70) return "Internet wird nach aktuellen Fakten durchsucht...";
  if (progress < 90)
    return hasStatement
      ? "Transkript und Aussage werden von KI ausgewertet..."
      : "Transkript wird von KI ausgewertet...";
  return "Ergebnisse werden zusammengestellt...";
};

export const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [factCheckData, setFactCheckData] = useState<FactCheckResponse | null>(
    null,
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showExampleTip, setShowExampleTip] = useState(false);
  const [hasStatement, setHasStatement] = useState(false);
  const [hasUrl, setHasUrl] = useState(false);

  useEffect(() => {
    if (!factCheckData && !isLoading) {
      const timer = setTimeout(() => setShowExampleTip(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [factCheckData, isLoading]);

  const handleSubmit = async (url: string, statement?: string) => {
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setShowExampleTip(false);
    setHasStatement(!!statement);
    setHasUrl(!!url);

    posthog.capture("tiktok_url_submitted", {
      url_length: url?.length || 0,
      has_statement: !!statement,
      has_url: !!url,
      has_only_statement: !url && !!statement,
    });

    const progressStep = !url && statement ? 5 : 2;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + progressStep;
      });
    }, 800);

    try {
      const result = await transcribeAndFactCheck(url, statement);
      clearInterval(progressInterval);
      setProgress(100);
      setFactCheckData(result);
      toast.success("Faktencheck erfolgreich abgeschlossen!");

      posthog.capture("fact_check_completed", {
        success: true,
        transcript_length: result.transcript?.length || 0,
        had_statement: !!statement,
        had_url: !!url,
      });

      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error("Error during fact check:", error);

      let errorMessage = "Unbekannter Fehler";
      let errorType = "";

      if (error instanceof Error) {
        errorMessage = error.message;
        errorType = error.name === "ApiError" ? (error as any).type : "";
      }

      setError(errorMessage);
      toast.error("Fehler beim Faktencheck: " + errorMessage);

      posthog.capture("fact_check_error", {
        error_message: errorMessage,
        error_type: errorType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupQuestion = async (question: string) => {
    setError(null);
    setIsLoading(true);

    posthog.capture("followup_question_asked", {
      question_length: question.length,
    });

    try {
      const questionExists =
        factCheckData &&
        factCheckData.factCheck
          .toLowerCase()
          .includes(`--- folgende frage ---\n${question.toLowerCase().trim()}`);

      if (!questionExists) {
        const answer = await askFollowupQuestion(question);

        if (factCheckData) {
          setFactCheckData({
            ...factCheckData,
            factCheck:
              factCheckData.factCheck +
              "\n\n--- Folgende Frage ---\n" +
              question.trim() +
              "\n\n" +
              answer.trim(),
          });

          posthog.capture("followup_question_answered", { success: true });
        }
      } else {
        toast.info("Diese Frage wurde bereits beantwortet.");
      }
    } catch (error) {
      console.error("Error asking followup:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setError(errorMessage);
      toast.error("Fehler bei der Beantwortung der Frage: " + errorMessage);

      posthog.capture("followup_question_error", {
        error_message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = () => {
    handleSubmit(
      "https://www.tiktok.com/@derstandardat/video/7290526239980848417",
      undefined,
    );
    posthog.capture("example_tiktok_clicked");
  };

  const handleImpressumClick = () => {
    posthog.capture("impressum_click", { source: "footer" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-center" />

      <div className="flex-1 max-w-2xl w-full mx-auto px-5 md:px-8 py-10 md:py-16">
        <Header />

        <main className="mt-10 flex flex-col items-center">
          <TikTokInput onSubmit={handleSubmit} isLoading={isLoading} />

          {showExampleTip && !factCheckData && !isLoading && (
            <ExampleTip onClick={handleExampleClick} />
          )}

          {error && (
            <div className="w-full max-w-lg">
              <ErrorAlert message={error} />
            </div>
          )}

          {progress > 0 && (
            <ProgressIndicator
              progress={progress}
              message={getProgressMessage(progress, hasStatement, hasUrl)}
            />
          )}

          {!factCheckData && !isLoading && <AppExplanation />}

          {factCheckData && (
            <div className="w-full max-w-lg mt-6">
              <FactCheckResult
                transcript={factCheckData.transcript}
                factCheck={factCheckData.factCheck}
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
