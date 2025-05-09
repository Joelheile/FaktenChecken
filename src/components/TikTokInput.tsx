import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TikTokInputProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

const TikTokInput = ({ onSubmit, isLoading }: TikTokInputProps) => {
  const [url, setUrl] = useState("");
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Bitte einen TikTok-Link eingeben");
      return;
    }

    // Validierung für TikTok-URLs
    const tiktokRegex =
      /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i;
    if (!tiktokRegex.test(url)) {
      toast.error(
        "Bitte gib eine gültige TikTok-URL ein (Format: https://www.tiktok.com/@username/video/1234567890...)"
      );
      return;
    }

    try {
      await onSubmit(url);
    } catch (error) {
      console.error("Error submitting URL:", error);
      toast.error(
        "Fehler bei der Verarbeitung des Videos. Bitte versuche es erneut."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl space-y-2 md:space-y-4"
    >
      <div className="flex flex-col gap-1 md:gap-2">
        <label htmlFor="tiktok-url" className="text-xs md:text-sm font-medium">
          TikTok URL eingeben:
        </label>
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            id="tiktok-url"
            placeholder="https://www.tiktok.com/@username/video/1234567890..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 text-xs md:text-sm h-8 md:h-10"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-4"
          >
            {isLoading ? (
              <>
                <Loader className="mr-1 md:mr-2 h-3 md:h-4 w-3 md:w-4 animate-spin" />
                <span>Lädt...</span>
              </>
            ) : (
              "Prüfen"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TikTokInput;
