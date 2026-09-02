import { ShieldCheck } from "lucide-react";

export const Header = ({ compact = false }: { compact?: boolean }) => (
  <header className="fade-in-up flex flex-col items-center text-center">
    {!compact && (
      <div className="mb-7 rounded-lg bg-foreground px-3 py-1.5 shadow-soft">
        <img
          alt="Ernst-Schering-Schule"
          className="h-9 md:h-10"
          height={114}
          src="/schule.png"
          width={479}
        />
      </div>
    )}

    <h1 className="font-display font-extrabold text-4xl leading-[1.02] tracking-tight sm:text-5xl">
      TikTok <span className="text-primary">FaktenCheck</span>
    </h1>

    {!compact && (
      <p className="mt-4 max-w-md font-body text-base text-muted-foreground leading-relaxed">
        Stimmt das wirklich, was du auf TikTok gesehen hast? Füg den Link ein,
        wir prüfen die Fakten.
      </p>
    )}

    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <span className="trust-chip">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Quellengeprüft
      </span>
      <span className="trust-chip">KI-Analyse</span>
      <span className="trust-chip">Kostenlos</span>
    </div>
  </header>
);
