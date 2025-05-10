import { Copy, Globe, InfoIcon, Share2 } from "lucide-react";

type InfoBoxProps = {
  title: string;
  children: React.ReactNode;
  variant: "blue" | "purple" | "green";
  icon?: React.ReactNode;
};

const InfoBox = ({ title, children, variant, icon }: InfoBoxProps) => {
  const bgColorMap = {
    blue: "bg-blue-50 dark:bg-blue-900/30",
    purple: "bg-purple-50 dark:bg-purple-900/30",
    green: "bg-green-50 dark:bg-green-900/30",
  };

  const textColorMap = {
    blue: "text-blue-700 dark:text-blue-300",
    purple: "text-purple-700 dark:text-purple-300",
    green: "text-green-700 dark:text-green-300",
  };

  return (
    <div className={`${bgColorMap[variant]} p-4 rounded-lg mb-4`}>
      <div className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <h3 className={`font-medium ${textColorMap[variant]}`}>{title}</h3>
      </div>
      <p className={`text-sm ${textColorMap[variant]} mt-1`}>{children}</p>
    </div>
  );
};

type StepProps = {
  number: number;
  title: string;
  children: React.ReactNode;
};

const Step = ({ number, title, children }: StepProps) => (
  <div className="flex">
    <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
      {number}
    </div>
    <div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>
    </div>
  </div>
);

export const AppExplanation = () => {
  return (
    <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 my-8">
      <div className="flex items-center mb-4">
        <InfoIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold">So funktioniert FaktenChecken</h2>
      </div>

      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          Mit FaktenChecken kannst du prüfen, ob Informationen in TikTok-Videos
          stimmen oder bestimmte Aussagen faktenbasiert sind. Du hast zwei
          Möglichkeiten:
        </p>

        <InfoBox title="Option 1: TikTok-Video prüfen" variant="blue">
          Gib einfach einen TikTok-Link ein, um den Inhalt zu überprüfen.
        </InfoBox>

        <InfoBox title="Option 2: Aussage prüfen" variant="purple">
          Gib eine beliebige Aussage ein, die du überprüfen möchtest, auch ohne
          Video.
        </InfoBox>

        <InfoBox
          title="Mit tagesaktuellen Informationen"
          variant="green"
          icon={
            <Globe className="h-5 w-5 text-green-700 dark:text-green-300" />
          }
        >
          Unsere KI durchsucht das Internet nach den neuesten Fakten, um auch
          tagesaktuelle Behauptungen richtig einordnen zu können.
        </InfoBox>

        <div className="space-y-4 mt-4">
          <Step number={1} title="Video oder Aussage auswählen">
            Entscheide, ob du ein TikTok-Video oder eine eigene Aussage
            überprüfen möchtest
          </Step>

          <Step number={2} title="Eingabe vornehmen">
            Bei TikToks: Tippe auf <Share2 className="h-4 w-4 inline mx-1" />{" "}
            "Teilen" und dann auf <Copy className="h-4 w-4 inline mx-1" /> "Link
            kopieren"
            <br />
            Bei Aussagen: Gib einfach den Text in das untere Feld ein
          </Step>

          <Step number={3} title="Überprüfen starten">
            Klicke auf "Überprüfen" und warte auf die Analyse
          </Step>

          <Step number={4} title="KI recherchiert im Web">
            Die KI sucht im Internet nach den aktuellsten Informationen zum
            Thema
          </Step>

          <Step number={5} title="Ergebnisse erhalten">
            Die KI analysiert alle Informationen und zeigt dir, was wahr und was
            falsch ist
          </Step>

          <Step number={6} title="Fragen stellen">
            Du kannst Nachfragen stellen, um mehr über bestimmte Fakten zu
            erfahren
          </Step>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Tipp:</span> Du kannst sowohl einen
            TikTok-Link als auch eine Aussage gleichzeitig eingeben, um einen
            direkten Faktencheck zur Aussage im Kontext des Videos zu erhalten.
          </p>
        </div>
      </div>
    </div>
  );
};
