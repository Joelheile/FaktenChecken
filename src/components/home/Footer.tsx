import { Link } from "react-router-dom";

interface FooterProps {
  onImpressumClick: () => void;
}

export const Footer = ({ onImpressumClick }: FooterProps) => (
  <footer className="mt-12 pt-4 border-t border-gray-200">
    <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
      <div className="mb-2 md:mb-0">
        © {new Date().getFullYear()} Fakten-checken.de
      </div>
      <div className="flex space-x-4">
        <Link
          to="/impressum"
          onClick={onImpressumClick}
          className="hover:text-gray-800 transition-colors"
        >
          Impressum
        </Link>
      </div>
    </div>
  </footer>
);
