import ReactMarkdown from "react-markdown";

interface TextContentBlockProps {
  content: string;
  index: number;
}

export const TextContentBlock = ({ content }: TextContentBlockProps) => (
  <div className="border border-border rounded-lg bg-card p-4">
    <div className="prose prose-sm max-w-none font-body text-muted-foreground [&_p]:leading-relaxed [&_p]:text-sm">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  </div>
);
