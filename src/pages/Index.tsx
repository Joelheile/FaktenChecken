import ApiKeyInfo from "@/components/ApiKeyInput";
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
import {
  askFollowupQuestion,
  FactCheckResponse,
  transcribeAndFactCheck,
} from "@/services/api";
import { AlertCircle, ArrowDown, HelpCircle } from "lucide-react";
import { useState } from "react";
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupQuestion = async (question: string) => {
    setError(null);
    setIsLoading(true);
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
      }
    } catch (error) {
      console.error("Error asking followup:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setError(errorMessage);
      toast.error("Fehler bei der Beantwortung der Frage: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressMessage = (progress: number) => {
    if (progress < 20) {
      return "Sende TikTok URL an Apify...";
    } else if (progress < 40) {
      return "Starte Apify Actor zur Transkript-Extraktion...";
    } else if (progress < 60) {
      return "Transkript wird von Apify abgerufen...";
    } else if (progress < 80) {
      return "Faktencheck wird mit ChatGPT durchgeführt...";
    } else {
      return "Ergebnisse werden zusammengestellt...";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-white to-blue-50">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=80"
              alt="TikTok Faktencheck Logo"
              className="h-20 w-auto rounded-lg shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            TikTok Faktencheck
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Überprüfe was du auf TikTok siehst und lerne, was wahr ist!
          </p>
        </header>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">
              Wie funktioniert die Anwendung?
            </CardTitle>
            <CardDescription className="text-base">
              Die Technologie hinter dem Faktencheck
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Diese Anwendung nutzt zwei KI-Technologien, um TikTok-Videos zu
              überprüfen:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center text-center">
                <img
                  src="https://apify.com/img/favicon/apple-touch-icon.png"
                  alt="Apify Logo"
                  className="h-10 w-10 mb-2"
                />
                <h3 className="font-medium text-lg mb-2">Apify Transkript</h3>
                <p>
                  Apify extrahiert den Text aus TikTok-Videos, damit wir
                  verstehen können, was gesagt wird.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg flex flex-col items-center text-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png"
                  alt="ChatGPT Logo"
                  className="h-10 w-10 mb-2"
                />
                <h3 className="font-medium text-lg mb-2">
                  ChatGPT Faktencheck
                </h3>
                <p>
                  ChatGPT analysiert den Text und prüft die Fakten gegen
                  verlässliche Quellen.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 border border-amber-100 rounded-lg bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="font-medium">Information:</span>
              </div>
              <p>
                Diese Anwendung verwendet vorkonfigurierte API-Schlüssel aus
                Umgebungsvariablen. Der Administrator muss die .env-Datei mit
                gültigen Werten für VITE_APIFY_API_TOKEN und VITE_OPENAI_API_KEY
                konfiguriert haben.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">
              So findest du den TikTok-Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-2 text-blue-700 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-medium">
                    Öffne TikTok und finde das Video
                  </h3>
                  <p className="text-muted-foreground">
                    Suche das Video, das du überprüfen möchtest
                  </p>
                </div>
              </div>

              <ArrowDown className="h-6 w-6 mx-auto text-gray-400" />

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-2 text-blue-700 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Drücke auf "Teilen"</h3>
                  <p className="text-muted-foreground">
                    Tippe auf den Pfeil-Button rechts im Video
                  </p>
                </div>
              </div>

              <ArrowDown className="h-6 w-6 mx-auto text-gray-400" />

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-2 text-blue-700 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Kopiere den Link</h3>
                  <p className="text-muted-foreground">
                    Tippe auf "Link kopieren" und füge ihn hier ein
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 border border-blue-100 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Hilfreicher Tipp:</span>
              </div>
              <p>
                Der Link sollte so aussehen:
                https://www.tiktok.com/@username/video/1234567890...
              </p>
            </div>
          </CardContent>
        </Card>

        <main className="space-y-8 flex flex-col items-center">
          <ApiKeyInfo />

          <Card className="w-full max-w-xl border-none shadow-lg bg-white">
            <CardHeader>
              <CardTitle>Video analysieren</CardTitle>
              <CardDescription>
                Füge einen TikTok-Link ein, um den Inhalt zu überprüfen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TikTokInput onSubmit={handleSubmit} isLoading={isLoading} />

              {isLoading && progress > 0 && (
                <div className="mt-4 space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {getProgressMessage(progress)}
                  </p>
                </div>
              )}

              {error && !isLoading && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fehler</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
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

        <Separator className="my-8" />

        <footer className="text-center text-sm text-muted-foreground mt-10 space-y-2">
          <p>© 2025 TikTok Faktencheck. Alle Rechte vorbehalten.</p>
          <p className="text-xs">
            Ein Bildungstool für Schüler, um kritisches Denken zu fördern.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
