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

const getProgressMessage = (progress: number): string => {
  if (progress < 40) {
    return "TikTok Video wird geladen...";
  } else if (progress < 70) {
    return "Transkript wird aus TikTok Video erstellt...";
  } else if (progress < 90) {
    return "Transkript wird von KI ausgewertet...";
  } else {
    return "Ergebnisse werden zusammengestellt...";
  }
};

export const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [factCheckData, setFactCheckData] = useState<FactCheckResponse | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showExampleTip, setShowExampleTip] = useState(false);

  // Show example tip after a few seconds when no action has been taken
  useEffect(() => {
    if (!factCheckData && !isLoading) {
      const timer = setTimeout(() => {
        setShowExampleTip(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [factCheckData, isLoading]);

  const handleSubmit = async (url: string) => {
    setError(null);
    setIsLoading(true);
    setProgress(0);
    setShowExampleTip(false);

    // Track form submission with PostHog
    posthog.capture("tiktok_url_submitted", {
      url_length: url.length,
    });

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 2;
      });
    }, 800);

    try {
      const result = await transcribeAndFactCheck(url);
      clearInterval(progressInterval);
      setProgress(100);
      setFactCheckData(result);
      toast.success("Faktencheck erfolgreich abgeschlossen!");

      // Track successful fact check with PostHog
      posthog.capture("fact_check_completed", {
        success: true,
        transcript_length: result.transcript.length,
      });

      setTimeout(() => {
        setProgress(0);
      }, 1000);
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

      // Track error with PostHog
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

    // Track followup question with PostHog
    posthog.capture("followup_question_asked", {
      question_length: question.length,
    });

    try {
      // Check if this question already exists in the factCheck data (case insensitive)
      const questionExists =
        factCheckData &&
        factCheckData.factCheck
          .toLowerCase()
          .includes(`--- folgende frage ---\n${question.toLowerCase().trim()}`);

      // Only proceed if the question doesn't already exist
      if (!questionExists) {
        const answer = await askFollowupQuestion(question);

        if (factCheckData) {
          // Ensure consistent formatting with a clear separation between question and answer
          const formattedQuestion = question.trim();
          const formattedAnswer = answer.trim();

          setFactCheckData({
            ...factCheckData,
            factCheck:
              factCheckData.factCheck +
              "\n\n--- Folgende Frage ---\n" +
              formattedQuestion +
              "\n\n" +
              formattedAnswer,
          });

          // Track successful followup answer
          posthog.capture("followup_question_answered", {
            success: true,
          });
        }
      } else {
        // If question exists, just notify user
        toast.info("Diese Frage wurde bereits beantwortet.");
      }
    } catch (error) {
      console.error("Error asking followup:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setError(errorMessage);
      toast.error("Fehler bei der Beantwortung der Frage: " + errorMessage);

      // Track error with PostHog
      posthog.capture("followup_question_error", {
        error_message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = () => {
    const exampleUrl =
      "https://www.tiktok.com/@derstandardat/video/7290526239980848417";
    handleSubmit(exampleUrl);

    posthog.capture("example_tiktok_clicked");
  };

  const handleImpressumClick = () => {
    // Track when a user clicks on the Impressum link
    posthog.capture("impressum_click", {
      source: "footer",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Toaster position="top-center" />

      <div className="max-w-5xl mx-auto space-y-8 py-8 md:py-12 px-4 md:px-6">
        <Header />

        <main className="flex flex-col items-center">
          <div className="w-full max-w-xl">
            <TikTokInput onSubmit={handleSubmit} isLoading={isLoading} />

            {showExampleTip && !factCheckData && !isLoading && (
              <ExampleTip onClick={handleExampleClick} />
            )}

            {error && <ErrorAlert message={error} />}

            {progress > 0 && (
              <ProgressIndicator
                progress={progress}
                message={getProgressMessage(progress)}
              />
            )}
          </div>

          {!factCheckData && !isLoading && <AppExplanation />}

          {factCheckData && (
            <div className="w-full max-w-xl mt-6">
              <FactCheckResult
                transcript={factCheckData.transcript}
                factCheck={factCheckData.factCheck}
                onAskFollowup={handleFollowupQuestion}
                isLoading={isLoading}
              />
            </div>
          )}
        </main>

        <Footer onImpressumClick={handleImpressumClick} />
      </div>
    </div>
  );
};
