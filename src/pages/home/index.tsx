import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FactCheckResult } from "@/components/fact-check/fact-check-result";
import { Footer } from "@/components/home/footer";
import { Header } from "@/components/home/header";
import { ProgressIndicator } from "@/components/home/progress-indicator";
import { TikTokInput } from "@/components/tiktok-input/tiktok-input";
import {
  trackFactCheckCompleted,
  trackFactCheckError,
  trackFactCheckSubmitted,
  trackImpressumClicked,
} from "@/lib/analytics";
import {
  ApiError,
  type FactCheckResponse,
  transcribeAndFactCheck,
} from "@/services/api";

export const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [factCheckData, setFactCheckData] = useState<FactCheckResponse | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const handleSubmit = async (
    url: string,
    statement?: string,
    source: "manual" | "example" = "manual"
  ) => {
    setIsLoading(true);
    setProgress(0);

    const hasUrl = !!url;
    setProgressMessage(
      hasUrl
        ? "TikTok Video wird geladen..."
        : "Faktencheck wird vorbereitet..."
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
          default:
            break;
        }
      });
      clearInterval(creep);
      setProgress(100);
      setFactCheckData(result);
      toast.success("Faktencheck erfolgreich abgeschlossen!");

      trackFactCheckCompleted({
        report: result.report,
        transcriptLength: result.transcript.length,
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
        errorType = error instanceof ApiError ? error.type : "";
      }

      toast.error(errorMessage);

      trackFactCheckError(errorMessage, errorType);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFactCheckData(null);
    setProgress(0);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background bg-dots [padding-left:env(safe-area-inset-left)] [padding-right:env(safe-area-inset-right)]">
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8 md:py-16">
        {!factCheckData && <Header compact={isLoading} />}

        <main className="mt-10 flex flex-col">
          {progress > 0 && (
            <ProgressIndicator message={progressMessage} progress={progress} />
          )}

          {!factCheckData && (
            <TikTokInput isLoading={isLoading} onSubmit={handleSubmit} />
          )}

          {factCheckData && (
            <div className="w-full">
              <button
                className="mb-6 inline-flex items-center gap-1.5 font-body font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                onClick={handleReset}
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
                Neue Prüfung
              </button>
              <FactCheckResult
                isLoading={isLoading}
                report={factCheckData.report}
                videoId={factCheckData.videoId}
              />
            </div>
          )}
        </main>
      </div>

      <Footer onImpressumClick={trackImpressumClicked} />
    </div>
  );
};
