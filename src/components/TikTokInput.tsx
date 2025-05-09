
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader, Copy, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TikTokInputProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

const TikTokInput = ({ onSubmit, isLoading }: TikTokInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Bitte einen TikTok-Link eingeben");
      return;
    }
    
    // Validierung für TikTok-URLs
    const tiktokRegex = /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i;
    if (!tiktokRegex.test(url)) {
      toast.error("Bitte geben Sie eine gültige TikTok-URL ein (Format: https://www.tiktok.com/@username/video/1234567890...)");
      return;
    }
    
    try {
      await onSubmit(url);
    } catch (error) {
      console.error("Error submitting URL:", error);
      toast.error("Fehler bei der Verarbeitung des Videos. Bitte versuchen Sie es erneut.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="tiktok-url" className="text-sm font-medium">
          TikTok URL eingeben:
        </label>
        <div className="flex gap-2">
          <Input
            id="tiktok-url"
            placeholder="https://www.tiktok.com/@username/video/1234567890..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Lädt...
              </>
            ) : "Prüfen"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TikTokInput;
