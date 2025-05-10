import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  progress: number;
  message: string;
}

export const ProgressIndicator = ({
  progress,
  message,
}: ProgressIndicatorProps) => (
  <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-sm border p-4 md:p-6 mt-4">
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{message}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  </div>
);
