
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupQuestion.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAskFollowup(followupQuestion);
      setFollowupQuestion("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the factCheck result with better styling
  const formatFactCheck = (text: string) => {
    return text
      .split('\n\n')
      .map((paragraph, idx) => (
        <p key={idx} className={`my-2 ${paragraph.startsWith('---') ? 'mt-6 font-semibold' : ''}`}>
          {paragraph}
        </p>
      ));
  };

  if (isLoading && (!transcript || !factCheck)) {
    return (
      <div className="w-full max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transkript</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-24" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Faktencheck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-5/6 h-8" />
              <Skeleton className="w-4/6 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="prose prose-sm max-w-none">
            {formatFactCheck(factCheck)}
          </div>
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
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                  Sende...
                </>
              ) : "Frage senden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FactCheckResult;
