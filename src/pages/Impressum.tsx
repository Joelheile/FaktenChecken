import { posthog } from "@/lib/posthog";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    {children}
  </section>
);

const Impressum = () => {
  useEffect(() => {
    posthog.capture("impressum_page_viewed");
  }, []);

  const handleBackClick = () => {
    posthog.capture("back_to_home_click", {
      source: "impressum_page",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-800"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Impressum</h1>

        <Section title="Angaben gemäß § 5 TMG">
          <p>Joel Heil Escobar</p>
          <p>Köpenicker Straße 43</p>
          <p>10179 Berlin</p>
        </Section>

        <Section title="Kontakt">
          <p>Telefon: +49 171 5871414</p>
          <p>E-Mail: joel@cinoramic.io</p>
        </Section>

        <Section title="Umsatzsteuer-ID">
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:
          </p>
          <p>DE366514999</p>
        </Section>

        <Section title="Kooperation">
          <p>
            Dies ist eine Kooperation mit Stephan Borchadt von der Ernst
            Scheering Schule.
          </p>
        </Section>

        <Section title="Haftung für Inhalte">
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
            auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
            §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
            verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
            überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen.
          </p>
          <p>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
            Informationen nach den allgemeinen Gesetzen bleiben hiervon
            unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
            Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
            Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
            Inhalte umgehend entfernen.
          </p>
        </Section>

        <Section title="Haftung für Links">
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
            verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            der Seiten verantwortlich. Die verlinkten Seiten wurden zum
            Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
            Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
            erkennbar.
          </p>
          <p>
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
            jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
            zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
            derartige Links umgehend entfernen.
          </p>
        </Section>

        <Section title="Urheberrecht">
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
            diesen Seiten unterliegen dem deutschen Urheberrecht. Die
            Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
            schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht
            kommerziellen Gebrauch gestattet.
          </p>
          <p>
            Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
            wurden, werden die Urheberrechte Dritter beachtet. Insbesondere
            werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie
            trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten
            wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
            Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
          </p>
          <p>Quelle: www.e-recht24.de</p>
        </Section>

        <Section title="Online-Streitbeilegung">
          <p>
            Die Europäische Kommission stellt eine Plattform für die
            außergerichtliche Online-Streitbeilegung (OS-Plattform) bereit,
            aufrufbar unter{" "}
            <a
              href="https://www.ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://www.ec.europa.eu/consumers/odr
            </a>
          </p>
          <p>
            Wir sind zur Teilnahme an einem Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle weder verpflichtet noch bereit.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default Impressum;
