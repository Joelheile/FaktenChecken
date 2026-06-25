import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export interface TikTokInputProps {
  onSubmit: (url: string, statement?: string) => Promise<void>;
  isLoading: boolean;
}

type InputMode = "empty" | "link" | "link-invalid" | "statement";

const STANDARD_TIKTOK =
  /^(https?:\/\/)?(www\.|m\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i;
const SHORT_TIKTOK = /^(https?:\/\/)?(vm|vt)\.tiktok\.com\/\w+/i;

const isValidTikTokUrl = (input: string): boolean =>
  STANDARD_TIKTOK.test(input) || SHORT_TIKTOK.test(input);

const looksLikeUrl = (input: string): boolean =>
  /tiktok\.com/i.test(input) ||
  (/^https?:\/\//i.test(input) && !/\s/.test(input));

const detectMode = (raw: string): InputMode => {
  const value = raw.trim();
  if (!value) return "empty";
  if (looksLikeUrl(value))
    return isValidTikTokUrl(value) ? "link" : "link-invalid";
  return "statement";
};

export const TikTokInput = ({ onSubmit, isLoading }: TikTokInputProps) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mode = detectMode(text);
  const submitLabel =
    mode === "link"
      ? "TikTok prüfen"
      : mode === "statement"
        ? "Aussage überprüfen"
        : "Überprüfen";

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
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
      if (mode === "link") await onSubmit(value, undefined);
      else await onSubmit("", value);
    } catch (error) {
      console.error("Error submitting input:", error);
      toast.error("Fehler bei der Verarbeitung. Bitte versuche es erneut.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "rounded-xl border bg-card p-4 shadow-soft transition-all focus-within:shadow-soft-lg focus-within:ring-1",
          mode === "link-invalid"
            ? "border-destructive/40 ring-destructive/20"
            : mode === "link" || mode === "statement"
              ? "border-primary ring-1 ring-primary/30"
              : "border-border ring-primary/20",
        )}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          disabled={isLoading}
          rows={1}
          spellCheck={false}
          aria-label="TikTok-Link oder Aussage"
          placeholder="TikTok-Link oder Aussage eingeben…"
          className="min-h-[2.75rem] w-full resize-none bg-transparent px-2 py-2 font-body text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/55 disabled:cursor-not-allowed sm:text-[0.95rem]"
        />

        <div className="mt-2 flex justify-end">
          <Button
            type="submit"
            disabled={mode === "empty" || isLoading}
            className="h-10 shrink-0 justify-center rounded-lg bg-primary px-5 font-body text-sm font-semibold text-primary-foreground shadow-none transition-transform hover:bg-primary active:scale-[0.98] sm:h-9 sm:text-[0.8rem]"
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

      <p className="mt-3 text-center font-body text-xs text-foreground/70">
        KI kann Fehler machen. Ergebnisse immer selbst überprüfen. Dies ist
        keine rechtliche, medizinische oder finanzielle Beratung.
      </p>
    </form>
  );
};
