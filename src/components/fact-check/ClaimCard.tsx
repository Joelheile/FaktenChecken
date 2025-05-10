import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ClaimCardProps } from "./types";

export const ClaimCard = ({ claim, index }: ClaimCardProps) => {
  // Simple configuration for verdict status
  const statusConfig = {
    true: {
      border: "border-green-200",
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      text: "WAHR",
    },
    false: {
      border: "border-red-200",
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      text: "FALSCH",
    },
    partial: {
      border: "border-amber-200",
      icon: <HelpCircle className="h-5 w-5 text-amber-600" />,
      text: "TEILS-TEILS",
    },
    unknown: {
      border: "border-gray-200",
      icon: <HelpCircle className="h-5 w-5 text-gray-500" />,
      text: "UNBEKANNT",
    },
  };

  const config = statusConfig[claim.status];

  // Extract claim number if available
  const claimNumber = parseInt(
    claim.label?.match(/\d+/)?.[0] || (index + 1).toString(),
  );

  // Format the full content in markdown for reliable display
  const markdownContent = `
## Behauptung ${claimNumber}

${claim.content}

### Bewertung: ${config.text}

${claim.explanation}
`;

  return (
    <Card className={cn("p-4 border mb-4", config.border)}>
      <div className="flex items-center mb-2 text-sm font-medium">
        <span className="flex items-center gap-1">
          {config.icon}
          <span>Bewertung: {config.text}</span>
        </span>
      </div>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </Card>
  );
};
