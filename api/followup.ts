import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, persistQuestion } from "./_db";

export const config = {
  maxDuration: 30,
};

const MODEL = "gpt-4o-mini-search-preview";

// Bound untrusted client input. The whole conversation is client-supplied, so
// without caps this endpoint is an open, web-search-enabled LLM proxy.
const MAX_QUESTION_CHARS = 2000;
const MAX_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 24_000;
const ALLOWED_ROLES = new Set(["system", "user", "assistant"]);

interface UrlCitation {
  type: string;
  url_citation?: { url: string; title?: string };
}

function appendSources(content: string, annotations?: UrlCitation[]): string {
  if (!annotations?.length) return content;
  const urls = [
    ...new Set(
      annotations
        .filter((a) => a.type === "url_citation" && a.url_citation?.url)
        .map((a) => a.url_citation!.url),
    ),
  ];
  if (urls.length === 0) return content;
  return `${content}\n\nQuellen:\n${urls.map((u) => `- ${u}`).join("\n")}`;
}

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

  const {
    question: rawQuestion,
    messages,
    check_id,
    session_id,
  } = req.body || {};

  if (!rawQuestion || typeof rawQuestion !== "string") {
    res.status(400).json({ error: "Missing or invalid question" });
    return;
  }

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Missing or invalid messages array" });
    return;
  }

  if (!(await checkRateLimit(req, "followup", 40, 3600))) {
    res.status(429).json({
      error: "Too many requests",
      message: "Zu viele Anfragen. Bitte versuche es später erneut.",
    });
    return;
  }

  const question = rawQuestion.slice(0, MAX_QUESTION_CHARS);

  // Keep only well-formed messages, trim each, and bound the history length.
  const history: Message[] = messages
    .filter(
      (msg): msg is Message =>
        msg &&
        typeof msg.role === "string" &&
        ALLOWED_ROLES.has(msg.role) &&
        typeof msg.content === "string",
    )
    .slice(-MAX_MESSAGES)
    .map((msg) => ({
      role: msg.role,
      content: msg.content.slice(0, MAX_MESSAGE_CHARS),
    }));

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "Server configuration error: missing OpenAI API key" });
    return;
  }

  try {
    // Always inject exactly one system prompt (ours) and drop any client-sent
    // system messages, so the guardrails hold even on a direct API call.
    const updatedMessages: Message[] = [
      { role: "system", content: FOLLOWUP_SYSTEM_PROMPT },
      ...history.filter((msg) => msg.role !== "system"),
      { role: "user", content: question },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: updatedMessages,
        web_search_options: {},
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    const message = data.choices?.[0]?.message;
    if (!message?.content) {
      throw new Error("OpenAI returned no content");
    }

    const assistantContent = appendSources(
      message.content,
      message.annotations,
    );
    updatedMessages.push({ role: "assistant", content: assistantContent });

    try {
      await persistQuestion(
        check_id ?? null,
        session_id ?? null,
        question,
        assistantContent,
        null,
      );
    } catch (dbError) {
      console.error("Failed to persist question:", dbError);
    }

    res.status(200).json({
      answer: assistantContent,
      messages: updatedMessages,
    });
  } catch (error) {
    console.error("Error during followup:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    try {
      await persistQuestion(
        check_id ?? null,
        session_id ?? null,
        question,
        null,
        message,
      );
    } catch (dbError) {
      console.error("Failed to persist question error:", dbError);
    }

    res.status(500).json({ error: "Failed to answer follow-up question" });
  }
}
