import { ArrowRight, Loader } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TikTokInputProps {
  isLoading: boolean;
  onSubmit: (url: string, statement?: string) => Promise<void>;
}

type InputMode = "empty" | "link" | "link-invalid" | "statement";

const STANDARD_TIKTOK =
  /^(https?:\/\/)?(www\.|m\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i;
const SHORT_TIKTOK = /^(https?:\/\/)?(vm|vt)\.tiktok\.com\/\w+/i;

const isValidTikTokUrl = (input: string): boolean =>
  STANDARD_TIKTOK.test(input) || SHORT_TIKTOK.test(input);

const TIKTOK_HOST = /tiktok\.com/i;
const HTTP_PREFIX = /^https?:\/\//i;
const WHITESPACE = /\s/;

const looksLikeUrl = (input: string): boolean =>
  TIKTOK_HOST.test(input) ||
  (HTTP_PREFIX.test(input) && !WHITESPACE.test(input));

const SUBMIT_LABELS: Record<InputMode, string> = {
  empty: "Überprüfen",
  link: "TikTok prüfen",
  "link-invalid": "Überprüfen",
  statement: "Aussage überprüfen",
};

const FRAME_CLASSES: Record<InputMode, string> = {
  empty: "border-border ring-primary/20",
  link: "border-primary ring-1 ring-primary/30",
  "link-invalid": "border-destructive/40 ring-destructive/20",
  statement: "border-primary ring-1 ring-primary/30",
};

const detectMode = (raw: string): InputMode => {
  const value = raw.trim();
  if (!value) {
    return "empty";
  }
  if (looksLikeUrl(value)) {
    return isValidTikTokUrl(value) ? "link" : "link-invalid";
  }
  return "statement";
};

export const TikTokInput = ({ onSubmit, isLoading }: TikTokInputProps) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mode = detectMode(text);
  const submitLabel = SUBMIT_LABELS[mode];

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    autoGrow();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = text.trim();

    if (mode === "empty") {
      toast.error("Bitte einen TikTok-Link oder eine Aussage eingeben");
      return;
    }
    if (mode === "link-invalid") {
      toast.error("Das sieht nach einem Link aus, aber nicht nach TikTok");
      return;
    }

    try {
      if (mode === "link") {
        await onSubmit(value, undefined);
      } else {
        await onSubmit("", value);
      }
    } catch (error) {
      console.error("Error submitting input:", error);
      toast.error("Fehler bei der Verarbeitung. Bitte versuche es erneut.");
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div
        className={cn(
          "rounded-xl border bg-card p-4 shadow-soft transition-all focus-within:shadow-soft-lg focus-within:ring-1",
          FRAME_CLASSES[mode]
        )}
      >
        <textarea
          aria-label="TikTok-Link oder Aussage"
          className="min-h-[2.75rem] w-full resize-none bg-transparent px-2 py-2 font-body text-base text-foreground leading-relaxed outline-none placeholder:text-muted-foreground/55 disabled:cursor-not-allowed sm:text-[0.95rem]"
          disabled={isLoading}
          onChange={handleChange}
          placeholder="TikTok-Link oder Aussage eingeben…"
          ref={textareaRef}
          rows={1}
          spellCheck={false}
          value={text}
        />

        <div className="mt-2 flex justify-end">
          <Button
            className="h-10 shrink-0 justify-center rounded-lg bg-primary px-5 font-body font-semibold text-primary-foreground text-sm shadow-none transition-transform hover:bg-primary active:scale-[0.98] sm:h-9 sm:text-[0.8rem]"
            disabled={mode === "empty" || isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Prüft…
              </>
            ) : (
              <>
                {submitLabel}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center font-body text-foreground/70 text-xs">
        KI kann Fehler machen. Ergebnisse immer selbst überprüfen. Dies ist
        keine rechtliche, medizinische oder finanzielle Beratung.
      </p>
    </form>
  );
};
