import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";

const ApiKeyInfo = () => {
  const [envVars, setEnvVars] = useState({
    apify: false,
    openai: false,
  });

  useEffect(() => {
    const apifyConfigured = Boolean(import.meta.env.VITE_APIFY_API_TOKEN);
    const openaiConfigured = Boolean(import.meta.env.VITE_OPENAI_API_KEY);

    setEnvVars({
      apify: apifyConfigured,
      openai: openaiConfigured,
    });

    console.log("Environment variables status:", {
      apify: apifyConfigured ? "Configured" : "Missing",
      openai: openaiConfigured ? "Configured" : "Missing",
    });
  }, []);

  const allConfigured = envVars.apify && envVars.openai;

  return (
    <Card className="w-full max-w-xl mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          <span>
            API-Schlüssel Status {allConfigured ? "(✓ Konfiguriert)" : ""}
          </span>
        </CardTitle>
        <CardDescription>
          Die Anwendung verwendet vorkonfigurierte API-Schlüssel aus
          Umgebungsvariablen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!allConfigured && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Achtung: API-Schlüssel fehlen</AlertTitle>
            <AlertDescription>
              Einige API-Schlüssel wurden nicht in der .env-Datei konfiguriert.
              {!envVars.apify && !envVars.openai
                ? " Apify und OpenAI API-Schlüssel fehlen."
                : !envVars.apify
                  ? " Apify API-Schlüssel fehlt."
                  : " OpenAI API-Schlüssel fehlt."}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://apify.com/img/favicon/apple-touch-icon.png"
                alt="Apify Logo"
                className="h-6 w-6"
              />
              <span className="font-medium">Apify Status:</span>
              <span
                className={envVars.apify ? "text-green-600" : "text-red-600"}
              >
                {envVars.apify ? "✓ Konfiguriert" : "✗ Nicht konfiguriert"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Wird verwendet, um Transkripte aus TikTok-Videos zu extrahieren.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png"
                alt="OpenAI Logo"
                className="h-6 w-6"
              />
              <span className="font-medium">OpenAI Status:</span>
              <span
                className={envVars.openai ? "text-green-600" : "text-red-600"}
              >
                {envVars.openai ? "✓ Konfiguriert" : "✗ Nicht konfiguriert"}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Wird verwendet, um Faktenchecks der Transkripte durchzuführen.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInfo;
