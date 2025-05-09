
import { useState } from "react";
import { transcribeAndFactCheck, askFollowupQuestion, FactCheckResponse } from "@/services/api";
import TikTokInput from "@/components/TikTokInput";
import FactCheckResult from "@/components/FactCheckResult";
import ApiKeyInput from "@/components/ApiKeyInput";
import { Toaster } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [factCheckData, setFactCheckData] = useState<FactCheckResponse | null>(null);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 800);
    
    try {
      const result = await transcribeAndFactCheck(url);
      clearInterval(progressInterval);
      setProgress(100);
      setFactCheckData(result);
      toast.success("Faktencheck erfolgreich abgeschlossen!");
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      console.error("Error during fact check:", error);
      toast.error("Fehler beim Faktencheck: " + (error instanceof Error ? error.message : "Unbekannter Fehler"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupQuestion = async (question: string) => {
    setIsLoading(true);
    try {
      const answer = await askFollowupQuestion(question);
      
      // Aktualisiere den Faktencheck mit der Antwort auf die Folgetrage
      if (factCheckData) {
        setFactCheckData({
          ...factCheckData,
          factCheck: factCheckData.factCheck + "\n\n--- Folgende Frage ---\n\n" + question + "\n\n" + answer
        });
      }
    } catch (error) {
      console.error("Error asking followup:", error);
      toast.error("Fehler bei der Beantwortung der Frage: " + (error instanceof Error ? error.message : "Unbekannter Fehler"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">TikTok Faktencheck</h1>
          <p className="text-muted-foreground">
            Prüfe die Fakten in TikTok-Videos mit KI-gestützter Analyse
          </p>
        </header>

        <main className="space-y-8 flex flex-col items-center">
          <ApiKeyInput />
          
          <Card className="w-full max-w-xl">
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
                    {progress < 30 ? "Transkript wird abgerufen..." : 
                     progress < 70 ? "Faktencheck wird durchgeführt..." : 
                     "Ergebnisse werden zusammengestellt..."}
                  </p>
                </div>
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
        
        <footer className="text-center text-sm text-muted-foreground mt-10">
          <p>© 2025 TikTok Faktencheck. Alle Rechte vorbehalten.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
