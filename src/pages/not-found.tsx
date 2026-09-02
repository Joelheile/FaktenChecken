import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Footer } from "@/components/home/footer";
import { posthog } from "@/lib/posthog";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    posthog.capture("404_error", { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background bg-dots">
      <div className="flex flex-1 items-center justify-center px-5 text-center">
        <p className="eyebrow mb-2">Fehler 404</p>
        <h1 className="mb-3 font-display font-extrabold text-8xl text-primary leading-none">
          404
        </h1>
        <p className="mb-8 font-body text-base text-muted-foreground">
          Die von dir gesuchte Seite existiert leider nicht.
        </p>
        <Link
          className="inline-flex items-center rounded-md border-2 border-foreground bg-primary px-5 py-2.5 font-bold font-mono text-primary-foreground text-sm uppercase tracking-wide shadow-hard-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          onClick={() =>
            posthog.capture("back_to_home_click", { source: "404_page" })
          }
          to="/"
        >
          Zurück zur Startseite
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
