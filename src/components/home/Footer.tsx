import { Link } from "react-router-dom";

interface FooterProps {
  onImpressumClick?: () => void;
}

export const Footer = ({ onImpressumClick }: FooterProps) => (
  <footer className="border-t-2 border-foreground py-4">
    <div className="mx-auto max-w-2xl px-5 font-mono text-[0.7rem] leading-relaxed text-muted-foreground md:px-8">
      <p className="mb-3 normal-case tracking-normal">
        KI kann Fehler machen. Ergebnisse immer selbst überprüfen. Dies ist
        keine rechtliche, medizinische oder finanzielle Beratung.
      </p>
    </div>
    <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground md:px-8">
      <span>© {new Date().getFullYear()} TikTok FaktenCheck</span>
      <Link
        to="/impressum"
        onClick={onImpressumClick}
        className="font-bold transition-colors hover:text-foreground"
      >
        Impressum
      </Link>
    </div>
  </footer>
);
