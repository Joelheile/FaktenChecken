import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => (
  <div className="mt-4 flex items-start gap-3 border border-verdict-false/20 bg-verdict-false/5 rounded-lg p-4 fade-in">
    <AlertCircle className="h-4 w-4 text-verdict-false mt-0.5 shrink-0" />
    <p className="font-body text-sm text-verdict-false">{message}</p>
  </div>
);
