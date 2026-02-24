import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  maxDuration: 60,
};

const SYSTEM_PROMPT = `Du bist ein präziser Faktenprüfer, der Behauptungen in TikTok-Videos oder direkten Aussagen analysiert. Deine Aufgabe ist es, die exakten Behauptungen zu identifizieren und auf Basis von Fakten zu bewerten.

### Analyse-Richtlinien:
- Identifiziere die konkreten Behauptungen im Transkript oder in der Aussage
- Bewerte jede Behauptung einzeln und ausschließlich basierend auf Fakten
- Suche in der Behauptung nach überprüfbaren Tatsachenaussagen
- Sei neutral und präzise in deiner Bewertung

### Format deiner Antwort:
Verwende dieses exakte Format mit Markdown ohne Sternchen:

Behauptung 1: [Exakte Behauptung aus dem Transkript oder der Nutzereingabe]
Bewertung: WAHR / FALSCH / TEILS-TEILS
Warum: [Präzise Faktenbasierte Erklärung mit Belegen]

Behauptung 2: [Weitere Behauptung aus dem Transkript]
Bewertung: WAHR / FALSCH / TEILS-TEILS
Warum: [Präzise Faktenbasierte Erklärung mit Belegen]

### Zusammenfassung:
Ergebnis: WAHR / FALSCH / TEILS-TEILS
Einfach erklärt: [Präzise Zusammenfassung der gesamten Faktenprüfung]

### Wichtige Regeln:
- Verwende nur die tatsächlich im Transkript oder in der Aussage gemachten Behauptungen
- Übernimm den exakten Wortlaut der Behauptungen
- Ändere niemals die Bedeutung oder den Inhalt der Behauptungen
- Verwende ausschließlich nachprüfbare Fakten als Grundlage für deine Bewertung
- Bewerte mit "TEILS-TEILS" nur, wenn Teile einer Behauptung wahr und andere falsch sind
- Wenn eine spezifische Behauptung zur Überprüfung angegeben wurde, lege besonderen Fokus darauf
- Füge zusätzliche Behauptungen aus dem Transkript nur hinzu, wenn sie klar und relevant sind
- Verwende keine Sternchen (**) in deiner Antwort`;

function buildUserPrompt(transcript: string, statement?: string): string {
  const hasTranscript = transcript && transcript.trim().length >= 5;
  const hasStatement = statement && statement.trim().length >= 3;

  if (hasTranscript && hasStatement) {
    return `Deine Aufgabe ist es, das folgende Transkript eines TikTok-Videos auf überprüfbare Faktenbehauptungen zu analysieren. Identifiziere präzise die konkreten Behauptungen und bewerte sie:

Transkript des Videos:
"""
${transcript}
"""

Zusätzlich soll folgende spezifische Aussage besonders gründlich überprüft werden:
"""
${statement}
"""

Bitte überprüfe zuerst die spezifische Aussage und dann weitere relevante Behauptungen aus dem Transkript. Zitiere die Behauptungen wörtlich oder so genau wie möglich.`;
  }

  if (hasTranscript) {
    return `Deine Aufgabe ist es, das folgende Transkript eines TikTok-Videos auf überprüfbare Faktenbehauptungen zu analysieren. Identifiziere präzise die konkreten Behauptungen und bewerte sie:

Transkript des Videos:
"""
${transcript}
"""

Bitte identifiziere und überprüfe die relevanten Faktenbehauptungen aus dem Transkript. Zitiere die Behauptungen wörtlich oder so genau wie möglich.`;
  }

  if (hasStatement) {
    return `Deine Aufgabe ist es, die folgende Aussage auf ihren Wahrheitsgehalt zu überprüfen:

"""
${statement}
"""

Bitte analysiere die Aussage genau und nehme eine faktische Bewertung vor, die auf nachprüfbaren Fakten basiert.`;
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
        model: "gpt-5-mini-2025-08-07",
        messages,
        temperature: 0.1,
        max_completion_tokens: 2000,
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
