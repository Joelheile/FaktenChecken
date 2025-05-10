import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Info, Loader } from "lucide-react";
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
      className="w-full max-w-xl space-y-3 md:space-y-5"
    >
      <div className="flex flex-col gap-1 md:gap-2">
        <label htmlFor="tiktok-url" className="text-xs md:text-sm font-medium">
          TikTok URL eingeben:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="tiktok-url"
            placeholder="https://www.tiktok.com/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 text-xs md:text-sm h-9 md:h-10"
            disabled={isLoading}
            aria-label="TikTok URL"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="h-9 md:h-10 text-xs md:text-sm px-3 md:px-4"
          >
            {isLoading ? (
              <>
                <Loader className="mr-1 md:mr-2 h-3 md:h-4 w-3 md:w-4 animate-spin" />
                <span>Lädt...</span>
              </>
            ) : (
              "Überprüfen"
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1 md:gap-2">
        <div className="flex items-center gap-1">
          <label
            htmlFor="statement"
            className="text-xs md:text-sm font-medium flex items-center gap-1"
          >
            Aussage zum Überprüfen:
          </label>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>
              Du kannst entweder eine TikTok URL oder eine Aussage eingeben
              (oder beides)
            </span>
          </div>
        </div>
        <Textarea
          id="statement"
          placeholder="Gib eine Aussage ein, die du überprüfen möchtest..."
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="resize-none text-xs md:text-sm min-h-[80px]"
          disabled={isLoading}
          rows={3}
          aria-label="Aussage zum Überprüfen"
        />
      </div>
    </form>
  );
};
