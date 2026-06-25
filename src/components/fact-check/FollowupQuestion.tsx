import ReactMarkdown from "react-markdown";
import { FollowupQuestionProps } from "./types";

export const FollowupQuestion = ({
  question,
  answer,
  index,
}: FollowupQuestionProps) => (
  <div className="overflow-hidden rounded-lg border bg-card shadow-soft">
    <div className="border-b border-border bg-muted/40 px-4 py-2.5">
      <span className="eyebrow">Frage {String(index + 1).padStart(2, "0")}</span>
      <p className="mt-1 font-body text-sm font-medium [overflow-wrap:anywhere]">
        {question}
      </p>
    </div>
    <div className="px-4 py-3">
      <div className="prose prose-sm max-w-none break-words font-body text-muted-foreground [&_a]:text-primary [&_a]:underline [&_p]:text-sm [&_p]:leading-relaxed">
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>
    </div>
  </div>
);
