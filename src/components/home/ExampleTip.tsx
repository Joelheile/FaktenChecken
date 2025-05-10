import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

interface ExampleTipProps {
  onClick: () => void;
}

export const ExampleTip = ({ onClick }: ExampleTipProps) => (
  <Alert className="mt-8 bg-amber-50 border-amber-200">
    <Lightbulb className="h-4 w-4 text-amber-600" />
    <AlertTitle className="text-amber-800">Tipp</AlertTitle>
    <AlertDescription className="text-amber-700">
      Füge die URL eines TikTok-Videos ein, um zu sehen, ob die darin gemachten
      Behauptungen stimmen.
      <button
        onClick={onClick}
        className="block mt-1 text-sm text-amber-600 hover:text-amber-800 underline"
      >
        Beispiel-TikTok ausprobieren
      </button>
    </AlertDescription>
  </Alert>
);
