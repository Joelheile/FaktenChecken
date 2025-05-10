import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert = ({ message }: ErrorAlertProps) => (
  <Alert className="mt-4 bg-red-50 border-red-200">
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertTitle className="text-red-800">Fehler</AlertTitle>
    <AlertDescription className="text-red-700">{message}</AlertDescription>
  </Alert>
);
