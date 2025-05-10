import { Copy, Globe, InfoIcon, Share2 } from "lucide-react";

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

        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-blue-700 dark:text-blue-300">
            Option 1: TikTok-Video prüfen
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Gib einfach einen TikTok-Link ein, um den Inhalt zu überprüfen.
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-purple-700 dark:text-purple-300">
            Option 2: Aussage prüfen
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
            Gib eine beliebige Aussage ein, die du überprüfen möchtest, auch
            ohne Video.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-green-700 dark:text-green-300 mr-2" />
            <h3 className="font-medium text-green-700 dark:text-green-300">
              Mit tagesaktuellen Informationen
            </h3>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Unsere KI durchsucht das Internet nach den neuesten Fakten, um auch
            tagesaktuelle Behauptungen richtig einordnen zu können.
          </p>
        </div>

        <div className="space-y-4 mt-4">
          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium">Video oder Aussage auswählen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Entscheide, ob du ein TikTok-Video oder eine eigene Aussage
                überprüfen möchtest
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium">Eingabe vornehmen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bei TikToks: Tippe auf{" "}
                <Share2 className="h-4 w-4 inline mx-1" /> "Teilen" und dann auf{" "}
                <Copy className="h-4 w-4 inline mx-1" /> "Link kopieren"
                <br />
                Bei Aussagen: Gib einfach den Text in das untere Feld ein
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium">Überprüfen starten</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Klicke auf "Überprüfen" und warte auf die Analyse
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-medium">KI recherchiert im Web</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Die KI sucht im Internet nach den aktuellsten Informationen zum
                Thema
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              5
            </div>
            <div>
              <h3 className="font-medium">Ergebnisse erhalten</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Die KI analysiert alle Informationen und zeigt dir, was wahr und
                was falsch ist
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              6
            </div>
            <div>
              <h3 className="font-medium">Fragen stellen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Du kannst Nachfragen stellen, um mehr über bestimmte Fakten zu
                erfahren
              </p>
            </div>
          </div>
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
