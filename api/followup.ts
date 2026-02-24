import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  maxDuration: 30,
};

const MODEL = "gpt-4o-mini";

const FOLLOWUP_SYSTEM_PROMPT = `Du bist ein investigativer Faktenprüfer. Beantworte die Nachfrage des Nutzers auf Deutsch.

Regeln:
- RECHERCHIERE gründlich. Nenne konkrete Quellen, Zahlen und Daten.
- Antworte NUR mit überprüfbaren Fakten, nicht mit Meinungen.
- Ordne die Fakten ein: Was ist der größere Kontext? Was wird oft verschwiegen?
- Bleibe sachlich und neutral. Keine politische Meinung.
- Sei kritisch gegenüber Extrempositionen von links und rechts.
- Benenne Manipulationstechniken, wenn du sie erkennst.
- Wenn etwas nicht überprüfbar ist, sag das klar.
- Erkläre verständlich für Jugendliche (13 Jahre).
- Gib am Ende einen Tipp, wie der Nutzer selbst weiter recherchieren kann.
- Nutze Markdown für Lesbarkeit, aber ohne Sternchen (**).
- Antworte IMMER auf Deutsch.`;

interface Message {
  role: string;
  content: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { question, messages } = req.body || {};

  if (!question || typeof question !== "string") {
    res.status(400).json({ error: "Missing or invalid question" });
    return;
  }

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Missing or invalid messages array" });
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
    const updatedMessages: Message[] = messages.map((msg: Message) =>
      msg.role === "system"
        ? { role: "system", content: FOLLOWUP_SYSTEM_PROMPT }
        : msg,
    );

    updatedMessages.push({ role: "user", content: question });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: updatedMessages,
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    const assistantContent = data.choices[0].message.content;
    updatedMessages.push({ role: "assistant", content: assistantContent });

    res.status(200).json({
      answer: assistantContent,
      messages: updatedMessages,
    });
  } catch (error) {
    console.error("Error during followup:", error);
    res.status(500).json({
      error: "Failed to answer follow-up question",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
