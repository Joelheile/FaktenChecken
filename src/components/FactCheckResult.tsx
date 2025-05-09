
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FactCheckResultProps {
  transcript: string;
  factCheck: string;
  onAskFollowup: (question: string) => Promise<void>;
  isLoading: boolean;
}

const FactCheckResult = ({ 
  transcript, 
  factCheck, 
  onAskFollowup,
  isLoading 
}: FactCheckResultProps) => {
  const [followupQuestion, setFollowupQuestion] = useState("");

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupQuestion.trim()) return;
    
    await onAskFollowup(followupQuestion);
    setFollowupQuestion("");
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transkript</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{transcript}</p>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Faktencheck</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{factCheck}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Rückfragen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFollowupSubmit} className="space-y-4">
            <Textarea 
              placeholder="Stelle eine Frage zu diesem Faktencheck..." 
              value={followupQuestion}
              onChange={(e) => setFollowupQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sende..." : "Frage senden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FactCheckResult;
