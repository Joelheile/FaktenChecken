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
    <div className="border border-gray-200 rounded-md p-4 mb-4">
      <h3 className="font-medium text-lg mb-3">Stelle eine Frage</h3>
      <form onSubmit={onSubmit} className="space-y-3">
        <Textarea
          placeholder="Stelle eine Frage zur Bewertung..."
          value={question}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-24 resize-none border-gray-300"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!question.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                <span>Wird bearbeitet...</span>
              </>
            ) : (
              <>
                <SendIcon className="h-4 w-4 mr-2" />
                <span>Frage stellen</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
