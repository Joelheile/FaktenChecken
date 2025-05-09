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
import {
  AlertCircle,
  ArrowDown,
  ClipboardCheck,
  Copy,
  HelpCircle,
  Lightbulb,
  Link as LinkIcon,
  Loader2,
  Search,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Toaster position="top-center" />

      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 py-8 md:py-12 px-4 md:px-6">
        <header className="flex flex-col items-center relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100/20 via-transparent to-purple-100/20 rounded-3xl blur-3xl -z-10" />

          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="flex justify-center mb-6 transform transition-transform hover:scale-105 duration-300">
              <img
                src="/schule.png"
                alt="Ernst-Schering-Schule Logo"
                className="h-24 md:h-32 w-auto rounded-xl bg-blue-600 shadow-md p-4"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-4 animate-gradient">
              FaktenChecken
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-center">
              Überprüfe was du auf TikTok siehst und lerne, was wahr ist!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-2xl text-center">
              Ein Bildungstool für Schüler, um kritisches Denken zu fördern.
              Eine Kooperation mit dem Schulsozialarbeiter Stephan Borchardt von
              der Ernst-Schering-Schule.
            </p>
          </div>
        </header>

        {/* Main Input Section - Always visible */}
        <div className="sticky top-4 z-10">
          <Card className="w-full max-w-3xl mx-auto border-none shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-900/90 transition-all duration-300 hover:shadow-blue-200/20">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Video analysieren
              </CardTitle>
              <CardDescription className="text-sm">
                Füge einen TikTok-Link ein, um den Inhalt zu überprüfen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TikTokInput onSubmit={handleSubmit} isLoading={isLoading} />

              {isLoading && progress > 0 && (
                <div className="mt-4 space-y-2 animate-in fade-in">
                  <Progress value={progress} className="h-2 bg-blue-100" />
                  <p className="text-sm text-center text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {getProgressMessage(progress)}
                  </p>
                </div>
              )}

              {error && !isLoading && (
                <Alert
                  variant="destructive"
                  className="mt-4 animate-in fade-in"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fehler</AlertTitle>
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {showExampleTip && !isLoading && !factCheckData && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-sm flex items-start gap-2 animate-in fade-in">
                  <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-400">
                    Tipp: Du kannst TikTok-Links in der App finden, indem du auf
                    "Teilen" und dann "Link kopieren" tippst.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!factCheckData && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-in fade-in">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 transition-all duration-300 hover:shadow-blue-100/20">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-blue-500" />
                  Warum ist Faktencheck wichtig?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">
                  Hey! In TikTok gibt es täglich Millionen neuer Videos - aber
                  nicht alle zeigen die Wahrheit. Mit diesem Tool kannst du
                  herausfinden, ob das, was du siehst, wirklich stimmt.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-12 w-12 mb-3 bg-blue-100 dark:bg-blue-900/70 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 transform transition-transform group-hover:scale-110 duration-300">
                      <HelpCircle className="h-6 w-6" />
                    </div>
                    <h3 className="font-medium text-base md:text-lg mb-2">
                      Warum ist das wichtig?
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      Falsche Informationen können zu falschen Entscheidungen
                      führen. Wenn du weißt, was wahr ist, kannst du bessere
                      Entscheidungen treffen.
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-lg flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-12 w-12 mb-3 bg-purple-100 dark:bg-purple-900/70 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 transform transition-transform group-hover:scale-110 duration-300">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png"
                        alt="ChatGPT Logo"
                        className="h-6 w-6"
                      />
                    </div>
                    <h3 className="font-medium text-base md:text-lg mb-2">
                      So einfach geht's
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      Du kopierst einfach den Link eines TikTok-Videos und
                      unsere KI überprüft, ob die Informationen darin richtig
                      sind.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 transition-all duration-300 hover:shadow-blue-100/20">
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-blue-500" />
                  So findest du den TikTok-Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="bg-blue-500 text-white rounded-full p-2 text-sm font-bold flex items-center justify-center h-8 w-8">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-base">
                        Öffne TikTok und finde das Video
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Suche das Video, das du überprüfen möchtest
                      </p>
                    </div>
                  </div>

                  <ArrowDown className="h-5 w-5 mx-auto text-gray-400" />

                  <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="bg-blue-500 text-white rounded-full p-2 text-sm font-bold flex items-center justify-center h-8 w-8">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-base">
                        Drücke auf "Teilen"
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Tippe auf den <Share2 className="h-4 w-4 inline mx-1" />{" "}
                        Button rechts im Video
                      </p>
                    </div>
                  </div>

                  <ArrowDown className="h-5 w-5 mx-auto text-gray-400" />

                  <div className="flex items-start gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="bg-blue-500 text-white rounded-full p-2 text-sm font-bold flex items-center justify-center h-8 w-8">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-base">
                        Kopiere den Link
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Tippe auf <Copy className="h-4 w-4 inline mx-1" /> "Link
                        kopieren" und füge ihn oben ein
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 border border-blue-100 dark:border-blue-900 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    <span className="font-medium text-base">
                      Hilfreicher Tipp:
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Der Link sollte so aussehen:
                    <span className="font-mono text-xs p-1 mt-1 bg-blue-100 dark:bg-blue-900/50 rounded block break-all">
                      https://www.tiktok.com/@username/video/1234567890...
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <main className="space-y-8 flex flex-col items-center w-full">
          {(factCheckData || isLoading) && (
            <FactCheckResult
              transcript={factCheckData?.transcript || ""}
              factCheck={factCheckData?.factCheck || ""}
              onAskFollowup={handleFollowupQuestion}
              isLoading={isLoading && !factCheckData}
            />
          )}
        </main>

        <Separator className="my-8" />

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 space-y-2 py-4">
          <p>© 2025 FaktenChecken. Alle Rechte vorbehalten.</p>

          <div className="text-xs flex justify-center gap-4 items-center">
            <Link
              to="/impressum"
              className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
              onClick={handleImpressumClick}
            >
              Impressum
            </Link>
            <span>•</span>
            <a
              href="https://www.ernst-schering-schule.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              Ernst-Schering-Schule
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
