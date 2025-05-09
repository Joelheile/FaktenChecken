
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
    
    // Einfache Validierung für TikTok-URLs
    if (!url.includes("tiktok.com")) {
      toast.error("Bitte geben Sie eine gültige TikTok-URL ein");
      return;
    }
    
    try {
      await onSubmit(url);
    } catch (error) {
      console.error("Error submitting URL:", error);
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
            placeholder="https://www.tiktok.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Prüfe..." : "Prüfen"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TikTokInput;
