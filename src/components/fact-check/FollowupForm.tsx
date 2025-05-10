import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader, SendIcon } from "lucide-react";
import { FollowupFormProps } from "./types";

export const FollowupForm = ({
  onSubmit,
  question,
  onChange,
  isSubmitting,
}: FollowupFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        placeholder="Stelle eine Frage zur Bewertung..."
        value={question}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-24 resize-none bg-white border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400"
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        disabled={!question.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Frage wird beantwortet...
          </>
        ) : (
          <>
            <SendIcon className="h-4 w-4" />
            Frage stellen
          </>
        )}
      </Button>
    </form>
  );
};
