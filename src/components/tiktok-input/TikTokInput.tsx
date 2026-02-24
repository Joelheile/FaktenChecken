import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface TikTokInputProps {
  onSubmit: (url: string, statement?: string) => Promise<void>;
  isLoading: boolean;
}

export const TikTokInput = ({ onSubmit, isLoading }: TikTokInputProps) => {
  const [url, setUrl] = useState("");
  const [statement, setStatement] = useState("");

  const validateTikTokUrl = (input: string): boolean => {
    const standardTiktokRegex =
      /^(https?:\/\/)?(www\.|m\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i;
    const shortTiktokRegex = /^(https?:\/\/)?vm\.tiktok\.com\/\w+/i;
    return standardTiktokRegex.test(input) || shortTiktokRegex.test(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUrl = url.trim();
    const trimmedStatement = statement.trim();

    if (!trimmedUrl && !trimmedStatement) {
      toast.error("Bitte einen TikTok-Link oder eine Aussage eingeben");
      return;
    }

    if (trimmedUrl && !validateTikTokUrl(trimmedUrl)) {
      toast.error(
        "Bitte gib eine gültige TikTok-URL ein (z.B. https://www.tiktok.com/@username/video/1234567890... oder https://vm.tiktok.com/...)",
      );
      return;
    }

    try {
      await onSubmit(trimmedUrl, trimmedStatement || undefined);
    } catch (error) {
      console.error("Error submitting URL:", error);
      toast.error("Fehler bei der Verarbeitung. Bitte versuche es erneut.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto fade-in-up-d1"
    >
      <div className="bg-card border border-border rounded-lg p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tiktok-url"
            className="text-sm font-body font-medium text-foreground"
          >
            TikTok Link
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="tiktok-url"
              placeholder="https://www.tiktok.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 font-body text-sm h-11 md:h-12 border-border focus-visible:ring-foreground/20 placeholder:text-muted-foreground/50"
              disabled={isLoading}
              aria-label="TikTok URL"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 md:h-12 px-6 font-body font-semibold text-sm"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Lädt...
                </>
              ) : (
                "Überprüfen"
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs text-muted-foreground font-body">
              oder
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="statement"
            className="text-sm font-body font-medium text-foreground"
          >
            Aussage prüfen
          </label>
          <Textarea
            id="statement"
            placeholder="Schreibe hier eine Aussage, die du checken willst..."
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="resize-none font-body text-sm min-h-[80px] border-border focus-visible:ring-foreground/20 placeholder:text-muted-foreground/50"
            disabled={isLoading}
            rows={3}
            aria-label="Aussage zum Überprüfen"
          />
        </div>
      </div>
    </form>
  );
};
