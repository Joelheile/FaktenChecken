import { Copy, InfoIcon, Share2 } from "lucide-react";

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
          stimmen. So geht's:
        </p>

        <div className="space-y-4 mt-4">
          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium">Finde ein TikTok-Video</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suche ein Video, dessen Fakten du überprüfen möchtest
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium">Link kopieren</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tippe auf <Share2 className="h-4 w-4 inline mx-1" /> "Teilen"
                und dann auf <Copy className="h-4 w-4 inline mx-1" /> "Link
                kopieren"
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium">Link einfügen</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Füge den Link oben in das Eingabefeld ein und klicke auf
                "Überprüfen"
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-medium">Ergebnisse erhalten</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Die KI analysiert das Video und zeigt dir, welche Aussagen
                stimmen und welche nicht
              </p>
            </div>
          </div>

          <div className="flex">
            <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0">
              5
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
            <span className="font-medium">Tipp:</span> Achte immer darauf, dass
            TikTok-Links mit
            <span className="font-mono text-xs p-1 ml-1 bg-blue-100 dark:bg-blue-800/50 rounded">
              https://www.tiktok.com/@username/video/...
            </span>{" "}
            beginnen.
          </p>
        </div>
      </div>
    </div>
  );
};
