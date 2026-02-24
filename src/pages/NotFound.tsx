import { posthog } from "@/lib/posthog";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    posthog.capture("404_error", { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-5">
        <h1 className="font-display text-6xl font-bold text-primary mb-3">404</h1>
        <p className="font-body text-base text-muted-foreground mb-6">
          Die von dir gesuchte Seite existiert leider nicht.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-5 py-2.5 font-body font-semibold text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          onClick={() => posthog.capture("back_to_home_click", { source: "404_page" })}
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
