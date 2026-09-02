import { Footer } from "@/components/home/Footer";
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
    posthog.capture("404_error", { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background bg-dots">
      <div className="flex flex-1 items-center justify-center px-5 text-center">
        <p className="eyebrow mb-2">Fehler 404</p>
        <h1 className="mb-3 font-display text-8xl font-extrabold leading-none text-primary">
          404
        </h1>
        <p className="mb-8 font-body text-base text-muted-foreground">
          Die von dir gesuchte Seite existiert leider nicht.
        </p>
        <Link
          to="/"
          className="inline-flex items-center rounded-md border-2 border-foreground bg-primary px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-hard-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          onClick={() =>
            posthog.capture("back_to_home_click", { source: "404_page" })
          }
        >
          Zurück zur Startseite
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
