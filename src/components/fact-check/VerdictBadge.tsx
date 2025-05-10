import { cn } from "@/lib/utils";
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { VerdictBadgeProps } from "./types";

export const VerdictBadge = ({ verdict, status }: VerdictBadgeProps) => {
  const statusConfig = {
    true: {
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
      textColor: "text-green-800",
      icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />,
      shadow: "shadow-green-200/50",
    },
    false: {
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      textColor: "text-red-800",
      icon: <XCircle className="h-4 w-4 mr-1.5" />,
      shadow: "shadow-red-200/50",
    },
    partial: {
      bgColor: "bg-amber-100",
      borderColor: "border-amber-300",
      textColor: "text-amber-800",
      icon: <HelpCircle className="h-4 w-4 mr-1.5" />,
      shadow: "shadow-amber-200/50",
    },
    unknown: {
      bgColor: "bg-slate-100",
      borderColor: "border-slate-300",
      textColor: "text-slate-800",
      icon: <HelpCircle className="h-4 w-4 mr-1.5" />,
      shadow: "shadow-slate-200/50",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all",
        "hover:scale-105",
        config.bgColor,
        config.borderColor,
        config.textColor,
        config.shadow
      )}
    >
      {config.icon}
      {verdict}
    </span>
  );
};
