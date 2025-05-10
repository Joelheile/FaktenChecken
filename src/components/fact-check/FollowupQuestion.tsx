import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FollowupQuestionProps } from "./types";

export const FollowupQuestion = ({
  question,
  answer,
  index,
}: FollowupQuestionProps) => {
  return (
    <Card className="border-2 border-blue-200 shadow-md overflow-hidden">
      <CardHeader className="bg-blue-50 pb-2">
        <CardTitle className="text-sm md:text-base flex items-center text-blue-800">
          <MessageCircle className="h-4 md:h-5 w-4 md:w-5 mr-2" />
          Frage: {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 bg-gradient-to-b from-blue-50/30 to-white">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="prose prose-sm max-w-none">{children}</p>
            ),
          }}
        >
          {answer}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
};
