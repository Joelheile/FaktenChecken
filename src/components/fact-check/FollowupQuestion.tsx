import ReactMarkdown from "react-markdown";
import { FollowupQuestionProps } from "./types";

export const FollowupQuestion = ({
  question,
  answer,
  index,
}: FollowupQuestionProps) => (
  <div className="border border-border rounded-lg bg-card overflow-hidden">
    <div className="px-4 py-2.5 border-b border-border bg-muted/30">
      <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Frage {index + 1}
      </span>
      <p className="font-body text-sm font-medium mt-0.5">{question}</p>
    </div>
    <div className="px-4 py-3">
      <div className="prose prose-sm max-w-none font-body text-muted-foreground [&_p]:leading-relaxed [&_p]:text-sm">
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>
    </div>
  </div>
);
