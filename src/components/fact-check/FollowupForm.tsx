import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader, SendIcon } from "lucide-react";
import { FollowupFormProps } from "./types";

export const FollowupForm = ({
  onSubmit,
  question,
  onChange,
  isSubmitting,
}: FollowupFormProps) => (
  <div className="border border-border rounded-lg p-4">
    <h3 className="font-display font-bold text-sm mb-3">Stelle eine Frage</h3>
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        placeholder="Stelle eine Frage zur Bewertung..."
        value={question}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-20 resize-none font-body text-sm border-border focus-visible:ring-foreground/20 placeholder:text-muted-foreground/50"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          className="font-body font-semibold text-sm"
          disabled={!question.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Wird bearbeitet...
            </>
          ) : (
            <>
              <SendIcon className="h-4 w-4 mr-2" />
              Frage stellen
            </>
          )}
        </Button>
      </div>
    </form>
  </div>
);
