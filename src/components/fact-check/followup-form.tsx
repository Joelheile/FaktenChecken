import { Loader, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FollowupFormProps } from "./types";

export const FollowupForm = ({
  onSubmit,
  question,
  onChange,
  isSubmitting,
}: FollowupFormProps) => (
  <div className="rounded-lg border border-border border-dashed bg-muted/30 p-5">
    <p className="eyebrow mb-1">Noch Fragen?</p>
    <h3 className="mb-1 font-bold font-display text-base">Frag nach</h3>
    <p className="mb-3 font-body text-muted-foreground text-sm">
      Du willst mehr wissen? Stell eine Frage zur Bewertung.
    </p>
    <form className="space-y-3" onSubmit={onSubmit}>
      <Textarea
        className="min-h-[5rem] resize-none border bg-card font-body text-base placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 sm:text-sm"
        disabled={isSubmitting}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Zum Beispiel: Welches Land hat denn die höchsten Preise?"
        value={question}
      />
      <div className="flex justify-end">
        <Button
          className="min-h-[44px] w-full gap-2 font-body font-semibold text-sm shadow-soft transition-shadow hover:shadow-focus disabled:shadow-soft sm:w-auto"
          disabled={!question.trim() || isSubmitting}
          type="submit"
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
