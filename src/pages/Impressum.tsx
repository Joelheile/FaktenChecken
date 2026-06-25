import { Footer } from "@/components/home/Footer";
import { posthog } from "@/lib/posthog";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const Impressum = () => {
  useEffect(() => {
    posthog.capture("impressum_page_viewed");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background bg-dots">
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8 md:py-16">
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          onClick={() =>
            posthog.capture("back_to_home_click", { source: "impressum_page" })
          }
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>

        <p className="eyebrow mb-1">Rechtliches</p>
        <h1 className="mb-6 font-display text-4xl font-extrabold">Impressum</h1>
        <div className="mb-8 h-0.5 w-full bg-foreground" />

        <div className="space-y-6 font-body text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-1">
              Angaben gemäß § 5 TMG
            </h2>
            <p>Joel Heil Escobar</p>
            <p>Dörnbergweg 2</p>
            <p>34587 Felsberg</p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-1">
              Kontakt
            </h2>
            <p>Telefon: +49 171 5871414</p>
            <p>E-Mail: joel@cinoramic.io</p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-1">
              Umsatzsteuer-ID
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:
            </p>
            <p>DE366514999</p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-1">
              Kooperation
            </h2>
            <p>
              Dies ist eine Kooperation mit Stephan Borchadt von der Ernst
              Scheering Schule.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-1">
              Haftung für Inhalte
            </h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-1">
              Haftung für Links
            </h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben.
            </p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-1">
              Urheberrecht
            </h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht.
            </p>
            <p className="mt-1">Quelle: www.e-recht24.de</p>
          </section>
          <section>
            <h2 className="font-display text-base font-bold text-foreground mb-1">
              Online-Streitbeilegung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform für die
              außergerichtliche Online-Streitbeilegung bereit:{" "}
              <a
                href="https://www.ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Impressum;
