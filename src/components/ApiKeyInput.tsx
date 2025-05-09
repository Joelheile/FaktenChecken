
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setApifyApiToken, setOpenaiApiKey } from "@/services/api";
import { toast } from "sonner";

const ApiKeyInput = () => {
  const [apifyToken, setApifyToken] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const handleSaveKeys = () => {
    if (apifyToken) {
      setApifyApiToken(apifyToken);
      toast.success("Apify API-Token gespeichert");
    }
    
    if (openaiKey) {
      setOpenaiApiKey(openaiKey);
      toast.success("OpenAI API-Schlüssel gespeichert");
    }
    
    if (!apifyToken && !openaiKey) {
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
            <label htmlFor="apify-token" className="text-sm font-medium block mb-1">
              Apify API Token (optional)
            </label>
            <Input
              id="apify-token"
              type="password"
              value={apifyToken}
              onChange={(e) => setApifyToken(e.target.value)}
              placeholder="Apify API Token"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ohne API-Token wird ein Demo-Transkript verwendet
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
