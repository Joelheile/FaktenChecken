import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  Link2,
  Loader,
  MessageSquareQuote,
} from "lucide-react";
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
  const canSubmit = mode === "link" || mode === "statement";

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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto fade-in-up-d1"
    >
      <div
        className={cn(
          "rounded-2xl border bg-card p-3 shadow-soft transition-shadow focus-within:shadow-soft-lg",
          mode === "link-invalid" ? "border-destructive/40" : "border-border",
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
          placeholder="TikTok-Link einfügen oder eine Aussage eingeben…"
          className="w-full resize-none rounded-xl bg-transparent px-3 py-3 font-body text-[0.95rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/55 disabled:opacity-60"
        />

        <div className="mt-1 flex items-center justify-between gap-3 pl-1">
          <ModeHint mode={mode} />
          <Button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="h-11 shrink-0 rounded-xl px-5 font-body text-sm font-semibold shadow-none transition-transform active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Prüft…
              </>
            ) : (
              <>
                Überprüfen
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center font-body text-xs text-muted-foreground">
        KI kann Fehler machen. Ergebnisse immer selbst überprüfen. Dies ist
        keine rechtliche, medizinische oder finanzielle Beratung.
      </p>
    </form>
  );
};

const ModeHint = ({ mode }: { mode: InputMode }) => {
  if (mode === "link") {
    return (
      <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-primary">
        <Link2 className="h-3.5 w-3.5" />
        TikTok-Link erkannt
      </span>
    );
  }
  if (mode === "statement") {
    return (
      <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-primary">
        <MessageSquareQuote className="h-3.5 w-3.5" />
        Aussage wird geprüft
      </span>
    );
  }
  if (mode === "link-invalid") {
    return (
      <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-destructive">
        <AlertCircle className="h-3.5 w-3.5" />
        Kein gültiger TikTok-Link
      </span>
    );
  }
  return <span aria-hidden />;
};
