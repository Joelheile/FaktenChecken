import { posthog } from "@/lib/posthog";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );

    posthog.capture("404_error", {
      path: location.pathname,
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center p-6 max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            404
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-4 md:mb-6">
            Seite nicht gefunden
          </p>
          <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">
            Die von dir gesuchte Seite existiert leider nicht.
          </p>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() =>
              posthog.capture("back_to_home_click", { source: "404_page" })
            }
          >
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
