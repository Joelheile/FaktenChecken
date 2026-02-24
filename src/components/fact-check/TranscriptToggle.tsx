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
}: TranscriptToggleProps) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-display font-semibold text-sm">
          TikTok Transkript
        </span>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>

    {isOpen && (
      <div className="p-3 border-t border-border">
        <pre className="font-body text-sm whitespace-pre-wrap bg-muted/20 rounded p-3 overflow-auto max-h-80 leading-relaxed text-muted-foreground">
          {transcript}
        </pre>
      </div>
    )}
  </div>
);
