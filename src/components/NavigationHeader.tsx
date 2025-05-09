import { posthog } from "@/lib/posthog";
import { Link } from "react-router-dom";

const NavigationHeader = () => {
  const handleImpressumClick = () => {
    // Track when a user clicks on the Impressum link
    posthog.capture("impressum_click", {
      source: "header",
    });
  };

  return (
    <nav className="w-full py-4 px-6 bg-white shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-blue-600">
          FaktenChecken
        </Link>

        <div className="flex space-x-4">
          <Link
            to="/impressum"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            onClick={handleImpressumClick}
          >
            Impressum
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationHeader;
