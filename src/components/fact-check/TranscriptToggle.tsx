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
  <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex min-h-[48px] w-full items-center justify-between gap-2 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50 active:bg-muted/60"
    >
      <span className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="eyebrow">Original-Transkript</span>
      </span>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>

    {isOpen && (
      <div className="border-t border-border p-3">
        <pre className="max-h-80 max-w-full overflow-auto whitespace-pre-wrap rounded bg-muted/20 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
          {transcript}
        </pre>
      </div>
    )}
  </div>
);
