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

type ApiStatus = {
  apify: boolean;
  openai: boolean;
};

type ApiInfo = {
  name: string;
  logo: string;
  description: string;
};

const ApiStatusBadge = ({ isConfigured }: { isConfigured: boolean }) => (
  <span className={isConfigured ? "text-green-600" : "text-red-600"}>
    {isConfigured ? "✓ Konfiguriert" : "✗ Nicht konfiguriert"}
  </span>
);

const ApiStatusItem = ({
  name,
  logo,
  description,
  isConfigured,
}: ApiInfo & { isConfigured: boolean }) => (
  <div className="p-4 bg-slate-50 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <img src={logo} alt={`${name} Logo`} className="h-6 w-6" />
      <span className="font-medium">{name} Status:</span>
      <ApiStatusBadge isConfigured={isConfigured} />
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

const ApiKeyInfo = () => {
  const [envVars, setEnvVars] = useState<ApiStatus>({
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
  }, []);

  const allConfigured = envVars.apify && envVars.openai;

  const getMissingKeysMessage = () => {
    if (!envVars.apify && !envVars.openai)
      return " Apify und OpenAI API-Schlüssel fehlen.";
    if (!envVars.apify) return " Apify API-Schlüssel fehlt.";
    return " OpenAI API-Schlüssel fehlt.";
  };

  const apiInfos: ApiInfo[] = [
    {
      name: "Apify",
      logo: "https://apify.com/img/favicon/apple-touch-icon.png",
      description:
        "Wird verwendet, um Transkripte aus TikTok-Videos zu extrahieren.",
    },
    {
      name: "OpenAI",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png",
      description:
        "Wird verwendet, um Faktenchecks der Transkripte durchzuführen.",
    },
  ];

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
              {getMissingKeysMessage()}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <ApiStatusItem {...apiInfos[0]} isConfigured={envVars.apify} />
          <ApiStatusItem {...apiInfos[1]} isConfigured={envVars.openai} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInfo;
