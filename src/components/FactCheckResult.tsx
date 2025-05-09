
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader, MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const isMobile = useIsMobile();

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
        <p key={idx} className={cn(
          "my-2", 
          paragraph.startsWith('---') ? 'mt-6 font-semibold' : '',
          paragraph.includes('Folgende Frage') ? 'mt-6 bg-blue-50 p-2 rounded-md' : ''
        )}>
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
          <CardTitle className="flex items-center gap-2">
            <span>Faktencheck</span>
            {!isLoading && factCheck.includes("Folgende Frage") && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                +Folgetrage beantwortet
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {formatFactCheck(factCheck)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Rückfragen</span>
          </CardTitle>
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
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "transition-all",
                  isMobile ? "w-full" : ""
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> 
                    Sende...
                  </>
                ) : "Frage senden"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FactCheckResult;
