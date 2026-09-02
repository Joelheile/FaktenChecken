import { Link } from "react-router-dom";

interface FooterProps {
  onImpressumClick?: () => void;
}

export const Footer = ({ onImpressumClick }: FooterProps) => (
  <footer className="py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-1.5 px-5 text-center font-mono text-[0.7rem] text-muted-foreground/60 leading-relaxed md:px-8">
      <p className="normal-case tracking-normal">
        KI kann Fehler machen. Ergebnisse immer selbst überprüfen.
      </p>
      <Link
        className="rounded px-2 py-1 text-[0.65rem] uppercase tracking-wide transition-colors hover:text-foreground"
        onClick={onImpressumClick}
        to="/impressum"
      >
        Impressum
      </Link>
    </div>
  </footer>
);
