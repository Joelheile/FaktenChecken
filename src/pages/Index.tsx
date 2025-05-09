import FactCheckResult from "@/components/FactCheckResult";
import TikTokInput from "@/components/TikTokInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { posthog } from "@/lib/posthog";
import {
  askFollowupQuestion,
  FactCheckResponse,
  transcribeAndFactCheck,
} from "@/services/api";
import { AlertCircle, ArrowDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [factCheckData, setFactCheckData] = useState<FactCheckResponse | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);

  const handleSubmit = async (url: string) => {
    setError(null);
    setIsLoading(true);
    setProgress(0);

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
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setError(errorMessage);
      toast.error("Fehler beim Faktencheck: " + errorMessage);

      // Track error with PostHog
      posthog.capture("fact_check_error", {
        error_message: errorMessage,
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
      const answer = await askFollowupQuestion(question);

      if (factCheckData) {
        setFactCheckData({
          ...factCheckData,
          factCheck:
            factCheckData.factCheck +
            "\n\n--- Folgende Frage ---\n\n" +
            question +
            "\n\n" +
            answer,
        });

        // Track successful followup answer
        posthog.capture("followup_question_answered", {
          success: true,
        });
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

  const getProgressMessage = (progress: number) => {
    if (progress < 60) {
      return "Transkript wird aus TikTok Video erstellt...";
    } else if (progress < 80) {
      return "Transkript wird von KI ausgewertet...";
    } else {
      return "Ergebnisse werden zusammengestellt...";
    }
  };

  const handleImpressumClick = () => {
    // Track when a user clicks on the Impressum link
    posthog.capture("impressum_click", {
      source: "footer",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 py-6 md:py-8 px-4">
        <header className="text-center space-y-3 md:space-y-4">
          <div className="flex justify-center mb-3 md:mb-4">
            <img
              src="/schule.png"
              alt="Ernst-Schering-Schule Logo"
              className="h-20 md:h-28 w-auto rounded-lg bg-gray-400 p-3 md:p-4"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            FaktenChecken
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Überprüfe was du auf TikTok siehst und lerne, was wahr ist!
          </p>
          <p className="text-xs text-muted-foreground mt-1 md:mt-2 px-4">
            Ein Bildungstool für Schüler, um kritisches Denken zu fördern. Eine
            Kooperation mit dem Schulsozialarbeiter Stephan Borchardt von der
            Ernst-Schering-Schule.
          </p>
        </header>

        {!factCheckData && !isLoading && (
          <>
            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-xl md:text-2xl">
                  Warum ist Faktencheck wichtig?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <p className="text-base md:text-lg">
                  Hey! In TikTok gibt es täglich Millionen neuer Videos - aber
                  nicht alle zeigen die Wahrheit. Mit diesem Tool kannst du
                  herausfinden, ob das, was du siehst, wirklich stimmt.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-3 md:mt-4">
                  <div className="bg-blue-50 p-3 md:p-4 rounded-lg flex flex-col items-center text-center">
                    <div className="h-10 w-10 mb-2 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <HelpCircle className="h-5 md:h-6 w-5 md:w-6" />
                    </div>
                    <h3 className="font-medium text-base md:text-lg mb-1 md:mb-2">
                      Warum ist das wichtig?
                    </h3>
                    <p className="text-sm md:text-base">
                      Falsche Informationen können zu falschen Entscheidungen
                      führen. Wenn du weißt, was wahr ist, kannst du bessere
                      Entscheidungen treffen.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-3 md:p-4 rounded-lg flex flex-col items-center text-center">
                    <div className="h-10 w-10 mb-2 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png"
                        alt="ChatGPT Logo"
                        className="h-5 md:h-6 w-5 md:w-6"
                      />
                    </div>
                    <h3 className="font-medium text-base md:text-lg mb-1 md:mb-2">
                      So einfach geht's
                    </h3>
                    <p className="text-sm md:text-base">
                      Du kopierst einfach den Link eines TikTok-Videos und
                      unsere KI überprüft, ob die Informationen darin richtig
                      sind.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-xl md:text-2xl">
                  So findest du den TikTok-Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-blue-100 rounded-full p-2 text-blue-700 font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-sm md:text-base">
                        Öffne TikTok und finde das Video
                      </h3>
                      <p className="text-muted-foreground text-xs md:text-sm">
                        Suche das Video, das du überprüfen möchtest
                      </p>
                    </div>
                  </div>

                  <ArrowDown className="h-5 w-5 mx-auto text-gray-400" />

                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-blue-100 rounded-full p-2 text-blue-700 font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-sm md:text-base">
                        Drücke auf "Teilen"
                      </h3>
                      <p className="text-muted-foreground text-xs md:text-sm">
                        Tippe auf den Pfeil-Button rechts im Video
                      </p>
                    </div>
                  </div>

                  <ArrowDown className="h-5 w-5 mx-auto text-gray-400" />

                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-blue-100 rounded-full p-2 text-blue-700 font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-sm md:text-base">
                        Kopiere den Link
                      </h3>
                      <p className="text-muted-foreground text-xs md:text-sm">
                        Tippe auf "Link kopieren" und füge ihn hier ein
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-6 p-3 md:p-4 border border-blue-100 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                    <HelpCircle className="h-4 md:h-5 w-4 md:w-5 text-blue-600" />
                    <span className="font-medium text-sm md:text-base">
                      Hilfreicher Tipp:
                    </span>
                  </div>
                  <p className="text-xs md:text-sm">
                    Der Link sollte so aussehen:
                    https://www.tiktok.com/@username/video/1234567890...
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <main className="space-y-6 md:space-y-8 flex flex-col items-center">
          <Card className="w-full max-w-xl border-none shadow-lg bg-white">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-xl md:text-2xl">
                Video analysieren
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Füge einen TikTok-Link ein, um den Inhalt zu überprüfen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TikTokInput onSubmit={handleSubmit} isLoading={isLoading} />

              {isLoading && progress > 0 && (
                <div className="mt-4 space-y-2">
                  <Progress value={progress} className="h-1.5 md:h-2" />
                  <p className="text-xs md:text-sm text-center text-muted-foreground">
                    {getProgressMessage(progress)}
                  </p>
                </div>
              )}

              {error && !isLoading && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fehler</AlertTitle>
                  <AlertDescription className="text-xs md:text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {(factCheckData || isLoading) && (
            <FactCheckResult
              transcript={factCheckData?.transcript || ""}
              factCheck={factCheckData?.factCheck || ""}
              onAskFollowup={handleFollowupQuestion}
              isLoading={isLoading && !factCheckData}
            />
          )}
        </main>

        <Separator className="my-4 md:my-8" />

        <footer className="text-center text-xs md:text-sm text-muted-foreground mt-6 md:mt-10 space-y-1 md:space-y-2">
          <p>© 2025 FaktenChecken. Alle Rechte vorbehalten.</p>

          <p className="text-xs mt-1 md:mt-2">
            <Link
              to="/impressum"
              className="text-blue-600 hover:underline"
              onClick={handleImpressumClick}
            >
              Impressum
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
