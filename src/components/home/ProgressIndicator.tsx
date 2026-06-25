interface ProgressIndicatorProps {
  progress: number;
  message: string;
}

export const ProgressIndicator = ({
  progress,
  message,
}: ProgressIndicatorProps) => (
  <div className="fade-in mb-6 w-full">
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <span className="font-mono text-xs leading-relaxed text-foreground">
          <span className="mr-1 inline-block animate-pulse text-primary">
            ▸
          </span>
          {message}
        </span>
        <span className="font-mono text-sm font-bold tabular-nums text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-border bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);
