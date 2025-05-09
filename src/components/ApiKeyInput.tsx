
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setTiktokApiKey, setOpenaiApiKey } from "@/services/api";
import { toast } from "sonner";

const ApiKeyInput = () => {
  const [tiktokKey, setTiktokKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const handleSaveKeys = () => {
    if (tiktokKey) {
      setTiktokApiKey(tiktokKey);
      toast.success("TikTok API-Schlüssel gespeichert");
    }
    
    if (openaiKey) {
      setOpenaiApiKey(openaiKey);
      toast.success("OpenAI API-Schlüssel gespeichert");
    }
    
    if (!tiktokKey && !openaiKey) {
      toast.error("Bitte mindestens einen API-Schlüssel eingeben");
    }
  };

  return (
    <Card className="w-full max-w-xl mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>API-Schlüssel</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? "Verbergen" : "Anzeigen"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={isVisible ? "block" : "hidden"}>
        <div className="space-y-4">
          <div>
            <label htmlFor="tiktok-api" className="text-sm font-medium block mb-1">
              TikTok API Schlüssel (optional)
            </label>
            <Input
              id="tiktok-api"
              type="password"
              value={tiktokKey}
              onChange={(e) => setTiktokKey(e.target.value)}
              placeholder="TikTok API Schlüssel"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ohne API-Schlüssel wird ein Demo-Transkript verwendet
            </p>
          </div>
          
          <div>
            <label htmlFor="openai-api" className="text-sm font-medium block mb-1">
              OpenAI API Schlüssel (optional)
            </label>
            <Input
              id="openai-api"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="OpenAI API Schlüssel"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ohne API-Schlüssel wird ein Demo-Faktencheck verwendet
            </p>
          </div>
          
          <Button onClick={handleSaveKeys}>Speichern</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
