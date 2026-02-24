import { Link } from "react-router-dom";

interface FooterProps {
  onImpressumClick: () => void;
}

export const Footer = ({ onImpressumClick }: FooterProps) => (
  <footer className="border-t border-border py-3">
    <div className="max-w-2xl mx-auto px-5 md:px-8 flex items-center justify-between text-xs font-body text-muted-foreground">
      <span>© {new Date().getFullYear()} TikTok FaktenCheck · Ernst-Schering-Schule</span>
      <Link
        to="/impressum"
        onClick={onImpressumClick}
        className="hover:text-foreground transition-colors"
      >
        Impressum
      </Link>
    </div>
  </footer>
);
