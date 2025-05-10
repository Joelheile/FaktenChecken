import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gray-50 pb-2">
        <Button
          variant="ghost"
          onClick={onToggle}
          className="w-full flex justify-between items-center py-2 text-gray-700 hover:text-gray-900"
        >
          <span className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Transkript {isOpen ? "ausblenden" : "anzeigen"}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", {
              "transform rotate-180": isOpen,
            })}
          />
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent className="bg-gray-50/50 pt-4">
          <div className="p-3 bg-white rounded-md text-sm whitespace-pre-wrap border border-gray-100 shadow-sm max-h-60 overflow-y-auto">
            {transcript}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
