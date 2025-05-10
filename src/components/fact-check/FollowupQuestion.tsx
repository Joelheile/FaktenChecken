import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { FollowupQuestionProps } from "./types";

export const FollowupQuestion = ({
  question,
  answer,
  index,
}: FollowupQuestionProps) => {
  // Format as Markdown for more reliable rendering
  const markdownContent = `
## Frage ${index + 1}
${question}

### Antwort
${answer}
`;

  return (
    <Card className="p-4 border border-gray-200 mb-4">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </Card>
  );
};
