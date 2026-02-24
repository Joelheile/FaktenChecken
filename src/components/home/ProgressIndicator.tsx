interface ProgressIndicatorProps {
  progress: number;
  message: string;
}

export const ProgressIndicator = ({
  progress,
  message,
}: ProgressIndicatorProps) => (
  <div className="w-full max-w-lg mx-auto mt-4 fade-in">
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-body text-sm text-muted-foreground">{message}</span>
        <span className="font-body text-xs font-medium text-foreground tabular-nums">
          {progress}%
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);
