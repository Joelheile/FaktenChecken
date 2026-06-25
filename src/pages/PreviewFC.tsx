import { FactCheckResult } from "@/components/fact-check";
import { FactCheckReport } from "@/components/fact-check/types";

const mock: FactCheckReport = {
  quelle_sprache: "Deutsch",
  gesamturteil: "teils_teils",
  fazit:
    "Das Video mischt richtige und falsche Sachen. Eine Zahl stimmt ungefähr, aber wichtige Infos fehlen. Eine andere Behauptung ist einfach falsch, und ein Teil ist nur eine Meinung.",
  vorsicht:
    "Das Video macht dir mit dramatischer Musik und großen Zahlen Angst. Das nennt man emotionale Manipulation. Schau immer, ob die Zahlen auch erklärt werden.",
  behauptungen: [
    {
      behauptung: "Deutschland hatte 2023 die höchsten Strompreise der Welt.",
      urteil: "falsch",
      erklaerung:
        "Deutschland hat zwar hohe Strompreise, aber nicht die höchsten der Welt. Einige Länder lagen darüber.",
      belege:
        "Laut Eurostat lagen die Haushaltsstrompreise in Deutschland 2023 unter denen mehrerer anderer Länder.",
      manipulation: "Übertreibung",
      quellen: [
        { titel: "Eurostat: Strompreisstatistik für Haushalte 2023", url: "https://ec.europa.eu/eurostat" },
        { titel: "Statistisches Bundesamt: Energiepreise", url: "https://www.destatis.de" },
      ],
    },
    {
      behauptung: "Strom wird in Deutschland teurer, wenn mehr Gas importiert wird.",
      urteil: "wahr",
      erklaerung:
        "Wenn teures Gas zur Stromerzeugung gebraucht wird, kann der Strompreis steigen. Das ist gut belegt.",
      belege: "Die Bundesnetzagentur erklärt den Zusammenhang von Gas- und Strompreis im Monitoringbericht.",
      manipulation: null,
      quellen: [
        { titel: "Bundesnetzagentur: Monitoringbericht Energie", url: "https://www.bundesnetzagentur.de" },
      ],
    },
    {
      behauptung: "Erneuerbare Energien deckten 2023 etwa die Hälfte des deutschen Stromverbrauchs.",
      urteil: "teils_teils",
      erklaerung:
        "Die Zahl stimmt ungefähr, aber es kommt darauf an, ob man Verbrauch oder Erzeugung meint. Das wird im Video nicht gesagt.",
      belege: "Das Umweltbundesamt nennt einen Anteil von rund 50 Prozent am Bruttostromverbrauch 2023.",
      manipulation: "Fehlender Kontext",
      quellen: [
        { titel: "Umweltbundesamt: Erneuerbare Energien in Zahlen", url: "https://www.umweltbundesamt.de" },
      ],
    },
    {
      behauptung: "Die Regierung ist total unfähig.",
      urteil: "nicht_pruefbar",
      erklaerung:
        "Das ist eine Meinung, kein Fakt. Man kann nicht mit Quellen beweisen, ob das stimmt.",
      belege: "Meinungen lassen sich nicht mit Quellen überprüfen.",
      manipulation: "Pauschalurteil",
      quellen: [],
    },
  ],
  selbst_pruefen:
    "Tippe bei Google 'Eurostat Strompreise 2023' ein. Dann siehst du selbst, welche Länder am teuersten waren.",
};

const PreviewFC = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto w-full max-w-2xl px-5 py-10 md:px-8">
      <FactCheckResult
        transcript="Hier stünde das Original-Transkript des TikTok-Videos."
        report={mock}
        followups={[
          {
            question: "Welches Land hatte denn die höchsten Strompreise?",
            answer:
              "2023 zählten Länder wie **Irland** und **Dänemark** zu den teuersten in Europa. Deutschland lag dahinter.",
          },
        ]}
        onAskFollowup={async () => {}}
        isLoading={false}
      />
    </div>
  </div>
);

export default PreviewFC;
