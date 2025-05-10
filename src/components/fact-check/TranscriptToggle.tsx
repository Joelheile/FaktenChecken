import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, FileText } from "lucide-react";

interface TranscriptToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  transcript: string;
}

export const TranscriptToggle = ({
  isOpen,
  onToggle,
  transcript,
}: TranscriptToggleProps) => {
  return (
    <div className="border border-gray-200 rounded-md mb-4">
      <div className="p-3 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2 text-gray-600" />
          <span className="font-medium">TikTok Transkript</span>
        </div>
        <Button
          variant="outline"
          onClick={onToggle}
          className="h-8 px-2 border-gray-300"
          size="sm"
        >
          <span className="mr-1">{isOpen ? "Ausblenden" : "Anzeigen"}</span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", {
              "transform rotate-180": isOpen,
            })}
          />
        </Button>
      </div>
      {isOpen && (
        <div className="p-3">
          <pre className="text-sm whitespace-pre-wrap bg-white p-3 border border-gray-200 rounded-md overflow-auto max-h-80">
            {transcript}
          </pre>
        </div>
      )}
    </div>
  );
};
