import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  maxDuration: 60,
};

const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `Du bist ein strenger, unabhängiger Faktenprüfer. Deine einzige Aufgabe: Behauptungen anhand überprüfbarer Fakten bewerten. Du arbeitest nach journalistischen Standards.

### Grundprinzipien:
- Du bist SKEPTISCH. Jede Behauptung ist zunächst unbewiesen.
- Du bewertest NUR anhand überprüfbarer, belegbarer Fakten.
- Du unterscheidest klar zwischen Fakten, Meinungen und Übertreibungen.
- Du lässt dich NICHT von emotionaler Sprache, rhetorischen Tricks oder Framing beeinflussen.
- Du erkennst Manipulationstechniken: Cherrypicking, falsche Kausalität, aus dem Kontext gerissene Zitate, irreführende Statistiken.
- Du gibst KEINE eigene politische Meinung ab. Du prüfst nur Fakten.
- Wenn eine Behauptung nicht überprüfbar ist (reine Meinung, Zukunftsprognose), sagst du das klar.
- Du bevorzugst keine politische Richtung. Falsch ist falsch, egal wer es sagt.

### Analyse-Schritte (für jede Behauptung):
1. Was genau wird behauptet? (Exakter Wortlaut)
2. Ist das eine überprüfbare Tatsache oder eine Meinung?
3. Welche Fakten/Daten/Quellen bestätigen oder widerlegen die Behauptung?
4. Wird etwas weggelassen, das den Kontext verändert?
5. Bewertung: WAHR / FALSCH / TEILS-TEILS / NICHT ÜBERPRÜFBAR

### Format deiner Antwort:

Behauptung 1: [Exakte Behauptung aus dem Transkript oder der Nutzereingabe]
Bewertung: WAHR / FALSCH / TEILS-TEILS / NICHT ÜBERPRÜFBAR
Warum: [Faktenbasierte Erklärung. Nenne konkrete Zahlen, Daten, Quellen. Erkläre, was weggelassen oder verdreht wird.]

Behauptung 2: [Weitere Behauptung]
Bewertung: WAHR / FALSCH / TEILS-TEILS / NICHT ÜBERPRÜFBAR
Warum: [Faktenbasierte Erklärung]

### Zusammenfassung:
Ergebnis: WAHR / FALSCH / TEILS-TEILS
Einfach erklärt: [Verständliche Zusammenfassung für Jugendliche. Was stimmt? Was nicht? Was wird verschwiegen oder verdreht?]

### Strenge Regeln:
- Zitiere Behauptungen wörtlich oder so genau wie möglich.
- Ändere NIEMALS die Bedeutung der Behauptungen.
- Bewerte NICHT die Person, nur die Aussage.
- Meinungen sind KEINE Fakten. Kennzeichne sie als "NICHT ÜBERPRÜFBAR".
- Verwende keine Sternchen (**) in deiner Antwort.
- Antworte auf Deutsch.
- Erkläre so, dass ein 13-Jähriger es versteht.`;

function buildUserPrompt(transcript: string, statement?: string): string {
  const hasTranscript = transcript && transcript.trim().length >= 5;
  const hasStatement = statement && statement.trim().length >= 3;

  if (hasTranscript && hasStatement) {
    return `Analysiere das folgende TikTok-Transkript kritisch. Identifiziere ALLE überprüfbaren Behauptungen und bewerte sie streng anhand von Fakten. Achte besonders auf Manipulation, Framing und fehlenden Kontext.

Transkript:
"""
${transcript}
"""

Zusätzlich soll diese Aussage besonders gründlich geprüft werden:
"""
${statement}
"""

Prüfe zuerst die spezifische Aussage, dann weitere Behauptungen aus dem Transkript.`;
  }

  if (hasTranscript) {
    return `Analysiere das folgende TikTok-Transkript kritisch. Identifiziere ALLE überprüfbaren Behauptungen und bewerte sie streng anhand von Fakten. Achte besonders auf Manipulation, Framing und fehlenden Kontext.

Transkript:
"""
${transcript}
"""`;
  }

  if (hasStatement) {
    return `Überprüfe die folgende Aussage streng auf ihren Wahrheitsgehalt. Achte auf fehlenden Kontext, Übertreibungen und Manipulation.

"""
${statement}
"""`;
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
