import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => (
  <div className="fade-in mt-4 flex items-start gap-3 rounded-lg border-2 border-verdict-false bg-verdict-false/[0.07] p-4">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-verdict-false" />
    <div>
      <p className="eyebrow text-verdict-false">Fehler</p>
      <p className="mt-0.5 font-body text-sm text-verdict-false">{message}</p>
    </div>
  </div>
);
