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
  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-5">
    <p className="eyebrow mb-1">Noch Fragen?</p>
    <h3 className="mb-1 font-display text-base font-bold">Frag nach</h3>
    <p className="mb-3 font-body text-sm text-muted-foreground">
      Du willst mehr wissen? Stell eine Frage zur Bewertung.
    </p>
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea
        placeholder="Zum Beispiel: Welches Land hat denn die höchsten Preise?"
        value={question}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[5rem] resize-none border bg-card font-body text-base placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 sm:text-sm"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          className="min-h-[44px] w-full gap-2 font-body text-sm font-semibold shadow-soft transition-shadow hover:shadow-focus disabled:shadow-soft sm:w-auto"
          disabled={!question.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Wird bearbeitet...
            </>
          ) : (
            <>
              <SendIcon className="h-4 w-4" />
              Frage stellen
            </>
          )}
        </Button>
      </div>
    </form>
  </div>
);
