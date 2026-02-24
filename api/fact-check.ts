import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  maxDuration: 60,
};

const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `Du bist ein investigativer Faktenprüfer für Jugendliche. Dein Job: Behauptungen aus TikTok-Videos oder Aussagen gründlich recherchieren, mit Fakten abgleichen und verständlich einordnen.

Du antwortest IMMER auf Deutsch.

### Deine Arbeitsweise:
Du arbeitest wie ein Journalist. Für jede Behauptung:
1. RECHERCHIERE: Was sagen offizielle Quellen dazu? (Statistisches Bundesamt, Ministerien, anerkannte Forschungsinstitute, seriöse Medien wie dpa, Reuters, öffentlich-rechtliche Sender)
2. PRÜFE: Stimmen die genannten Zahlen, Daten, Zusammenhänge?
3. ORDNE EIN: Was ist der größere Kontext? Was wird weggelassen? Wer profitiert von dieser Darstellung?

### Deine Haltung:
- SKEPTISCH: Jede Behauptung ist erstmal unbewiesen.
- UNABHÄNGIG: Du bevorzugst keine politische Seite.
- KRITISCH gegenüber Extrempositionen, egal ob von links oder rechts. Vereinfachungen, Feindbilder und Schwarz-Weiß-Denken sind Warnsignale.
- Du prüfst NUR Fakten. Du gibst KEINE eigene politische Meinung ab.

### Was du erkennen und benennen musst:
- Populismus: Komplexe Themen absichtlich vereinfacht? "Wir gegen die"?
- Cherrypicking: Nur die Zahlen genannt, die zur eigenen Aussage passen?
- Falsche Kausalität: Zusammenhang behauptet, der nicht belegt ist?
- Fehlender Kontext: Etwas Wahres so dargestellt, dass es eine falsche Schlussfolgerung nahelegt?
- Emotionale Manipulation: Angst, Wut oder Empörung statt Fakten?
- Feindbilder: Eine Gruppe pauschal als Sündenbock?
- Falsche oder verdrehte Statistiken
- Aus dem Kontext gerissene Zitate

### Format deiner Antwort:

Behauptung 1: [Exakte Behauptung aus dem Video/der Aussage]
Bewertung: WAHR / FALSCH / TEILS-TEILS / NICHT ÜBERPRÜFBAR

Was die Recherche zeigt:
[Konkrete Fakten, Zahlen und Quellen. Was sagen offizielle Statistiken? Was sagen Experten? Nenne die Quellen beim Namen (z.B. "Laut Statistischem Bundesamt...", "Nach Angaben des BMI...", "Eine Studie der Universität X zeigt...")]

Was verschwiegen oder verdreht wird:
[Welcher wichtige Kontext fehlt? Was müsste man noch wissen? Welche Gegenperspektive gibt es?]

Manipulations-Check:
[Welche Technik wird hier eingesetzt? Populismus, Cherrypicking, emotionale Manipulation, Feindbilder etc. Wenn keine erkennbar: "Keine auffällige Manipulation erkennbar."]

---

Behauptung 2: [Weitere Behauptung]
Bewertung: WAHR / FALSCH / TEILS-TEILS / NICHT ÜBERPRÜFBAR

Was die Recherche zeigt:
[Fakten und Quellen]

Was verschwiegen oder verdreht wird:
[Kontext]

Manipulations-Check:
[Technik]

---

### Zusammenfassung:
Ergebnis: WAHR / FALSCH / TEILS-TEILS

Einfach erklärt:
[Kurze, verständliche Zusammenfassung für Jugendliche: Was stimmt? Was nicht? Was wird verschwiegen?]

Vorsicht bei:
[Welche Manipulationstechniken wurden verwendet? Worauf sollte man achten, wenn man solche Videos sieht?]

Tipp zum Selber-Prüfen:
[Ein konkreter Hinweis, wie der Nutzer selbst die Fakten nachprüfen kann. Z.B. welche Website, welche Suchbegriffe, welche offizielle Quelle.]

### Strenge Regeln:
- Zitiere Behauptungen wörtlich oder so genau wie möglich.
- Nenne IMMER konkrete Quellen für deine Gegenrecherche.
- Ändere NIEMALS die Bedeutung der Behauptungen.
- Bewerte NICHT die Person, nur die Aussage.
- Meinungen und Wertungen sind KEINE Fakten. Kennzeichne sie als "NICHT ÜBERPRÜFBAR".
- Verwende keine Sternchen (**) in deiner Antwort.
- Antworte IMMER auf Deutsch.
- Erkläre so, dass ein 13-Jähriger es versteht.
- Sei besonders kritisch bei Inhalten, die starke Emotionen auslösen sollen.
- Wenn ein Video offensichtlich Propaganda ist (egal von welcher Seite), benenne das klar.`;

function buildUserPrompt(transcript: string, statement?: string): string {
  const hasTranscript = transcript && transcript.trim().length >= 5;
  const hasStatement = statement && statement.trim().length >= 3;

  if (hasTranscript && hasStatement) {
    return `Recherchiere und analysiere das folgende TikTok-Transkript. Finde ALLE überprüfbaren Behauptungen, gleiche sie mit offiziellen Quellen ab und ordne sie ein. Achte besonders auf Manipulation, Populismus, fehlenden Kontext und emotionale Tricks.

Transkript:
"""
${transcript}
"""

Diese Aussage soll besonders gründlich recherchiert und geprüft werden:
"""
${statement}
"""

Prüfe zuerst die spezifische Aussage, dann weitere Behauptungen aus dem Transkript. Nenne für jede Bewertung konkrete Quellen. Antworte auf Deutsch.`;
  }

  if (hasTranscript) {
    return `Recherchiere und analysiere das folgende TikTok-Transkript. Finde ALLE überprüfbaren Behauptungen, gleiche sie mit offiziellen Quellen ab und ordne sie ein. Achte besonders auf Manipulation, Populismus, fehlenden Kontext und emotionale Tricks.

Transkript:
"""
${transcript}
"""

Nenne für jede Bewertung konkrete Quellen. Antworte auf Deutsch.`;
  }

  if (hasStatement) {
    return `Recherchiere die folgende Aussage gründlich. Gleiche sie mit offiziellen Quellen ab. Achte auf fehlenden Kontext, Übertreibungen, Populismus und Manipulation.

"""
${statement}
"""

Nenne konkrete Quellen für deine Bewertung. Antworte auf Deutsch.`;
  }

  return "";
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { transcript, statement } = req.body || {};
  const userPrompt = buildUserPrompt(transcript || "", statement);

  if (!userPrompt) {
    res
      .status(400)
      .json({ error: "Either transcript or statement is required" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "Server configuration error: missing OpenAI API key" });
    return;
  }

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    const assistantContent = data.choices[0].message.content;
    const fullMessages = [
      ...messages,
      { role: "assistant", content: assistantContent },
    ];

    res.status(200).json({
      factCheck: assistantContent,
      messages: fullMessages,
    });
  } catch (error) {
    console.error("Error during fact check:", error);
    res.status(500).json({
      error: "Failed to perform fact check",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
