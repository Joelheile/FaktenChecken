import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TextContentBlockProps {
  content: string;
  index: number;
}

export const TextContentBlock = ({ content, index }: TextContentBlockProps) => {
  return (
    <Card className="mb-6 border border-blue-100 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-blue-50/40 p-4 border-b border-blue-100 flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800">
            Zusätzliche Information
          </span>
        </div>
        <div className="p-4 bg-gradient-to-b from-blue-50/20 to-white">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="prose prose-sm max-w-none text-gray-700">
                  {children}
                </p>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};
