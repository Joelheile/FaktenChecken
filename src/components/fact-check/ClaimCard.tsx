import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ClaimCardProps } from "./types";
import { VerdictBadge } from "./VerdictBadge";

export const ClaimCard = ({ claim, index }: ClaimCardProps) => {
  const themeConfig = {
    true: {
      cardBorder: "border-green-200",
      headerBg: "bg-green-50",
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      contentBg: "bg-green-50/50",
    },
    false: {
      cardBorder: "border-red-200",
      headerBg: "bg-red-50",
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      contentBg: "bg-red-50/50",
    },
    partial: {
      cardBorder: "border-amber-200",
      headerBg: "bg-amber-50",
      icon: <HelpCircle className="h-5 w-5 text-amber-600" />,
      contentBg: "bg-amber-50/50",
    },
    unknown: {
      cardBorder: "border-slate-200",
      headerBg: "bg-slate-50",
      icon: <HelpCircle className="h-5 w-5 text-slate-500" />,
      contentBg: "bg-slate-50/50",
    },
  };

  const theme = themeConfig[claim.status];

  return (
    <Card
      className={cn(
        "mb-6 overflow-hidden shadow-md border-2",
        theme.cardBorder
      )}
    >
      <CardHeader className={cn("pb-2", theme.headerBg)}>
        <CardTitle className="text-sm md:text-base flex justify-between items-center">
          <span className="flex items-center gap-2">
            {theme.icon}
            {claim.label || `Behauptung ${index + 1}`}
          </span>
          <VerdictBadge verdict={claim.verdict} status={claim.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("pt-4 text-sm", theme.contentBg)}>
        <div className="bg-white/80 p-3 rounded-md mb-3 font-medium border-l-4 border-gray-300">
          {claim.content}
        </div>
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="prose prose-sm max-w-none">{children}</p>
            ),
          }}
        >
          {claim.explanation}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
};
