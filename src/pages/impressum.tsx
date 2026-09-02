import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/home/footer";
import { posthog } from "@/lib/posthog";

const {
  VITE_IMPRESSUM_NAME: name,
  VITE_IMPRESSUM_STREET: street,
  VITE_IMPRESSUM_CITY: city,
  VITE_IMPRESSUM_PHONE: phone,
  VITE_IMPRESSUM_EMAIL: email,
  VITE_IMPRESSUM_VAT_ID: vatId,
} = import.meta.env;

const Impressum = () => {
  useEffect(() => {
    posthog.capture("impressum_page_viewed");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background bg-dots">
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8 md:py-16">
        <Link
          className="mb-10 inline-flex items-center gap-2 font-bold font-mono text-muted-foreground text-xs uppercase tracking-wide transition-colors hover:text-foreground"
          onClick={() =>
            posthog.capture("back_to_home_click", { source: "impressum_page" })
          }
          to="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>

        <p className="eyebrow mb-1">Rechtliches</p>
        <h1 className="mb-6 font-display font-extrabold text-4xl">Impressum</h1>
        <div className="mb-8 h-0.5 w-full bg-foreground" />

        <div className="space-y-6 font-body text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="mb-1 font-bold font-display text-base text-foreground">
              Angaben gemäß § 5 TMG
            </h2>
            <p>{name}</p>
            <p>{street}</p>
            <p>{city}</p>
          </section>
          <section>
            <h2 className="mb-1 font-bold font-display text-base text-foreground">
              Kontakt
            </h2>
            <p>Telefon: {phone}</p>
            <p>E-Mail: {email}</p>
          </section>
          <section>
            <h2 className="mb-1 font-bold font-display text-base text-foreground">
              Umsatzsteuer-ID
            </h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:
            </p>
            <p>{vatId}</p>
          </section>
          <section>
            <h2 className="mb-1 font-bold font-display text-base text-foreground">
              Kooperation
            </h2>
            <p>
              Dies ist eine Kooperation mit der Ernst-Schering-Schule Berlin.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-bold font-display text-base text-foreground">
              Haftung für Inhalte
            </h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-bold font-display text-base text-foreground">
              Haftung für Links
            </h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben.
            </p>
          </section>
          <section>
            <h2 className="mb-1 font-bold font-display text-base text-foreground">
              Urheberrecht
            </h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht.
            </p>
            <p className="mt-1">Quelle: www.e-recht24.de</p>
          </section>
          <section>
            <h2 className="mb-1 font-bold font-display text-base text-foreground">
              Online-Streitbeilegung
            </h2>
            <p>
              Die Europäische Kommission stellt eine Plattform für die
              außergerichtliche Online-Streitbeilegung bereit:{" "}
              <a
                className="text-primary underline underline-offset-2 transition-opacity hover:opacity-80"
                href="https://www.ec.europa.eu/consumers/odr"
                rel="noopener noreferrer"
                target="_blank"
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
