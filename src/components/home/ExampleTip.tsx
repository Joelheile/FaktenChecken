interface ExampleTipProps {
  onClick: () => void;
}

export const ExampleTip = ({ onClick }: ExampleTipProps) => (
  <div className="mt-4 text-center fade-in">
    <p className="font-body text-sm text-muted-foreground">
      Nicht sicher, wo anfangen?{" "}
      <button
        onClick={onClick}
        className="font-medium text-foreground underline underline-offset-2 hover:no-underline transition-colors"
      >
        Beispiel ausprobieren
      </button>
    </p>
  </div>
);
