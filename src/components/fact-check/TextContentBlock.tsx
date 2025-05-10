import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface TextContentBlockProps {
  content: string;
  index: number;
}

export const TextContentBlock = ({ content, index }: TextContentBlockProps) => {
  return (
    <Card className="mb-6 border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="prose prose-sm max-w-none">{children}</p>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
};
