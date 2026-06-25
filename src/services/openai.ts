import { FactCheckReport } from "@/components/fact-check/types";

interface Message {
  role: string;
  content: string;
}

/** Anonymous identity + context attached to a fact check for the dataset. */
export interface CheckMeta {
  check_id: string;
  session_id: string;
  visitor_id: string;
  input: "url" | "statement";
  query: string | null;
  video_url: string | null;
  video_id: string | null;
  author: string | null;
  referrer: string | null;
  lang: string | null;
}

let currentConversationMessages: Message[] = [];
let currentCheckId: string | null = null;
let currentSession: string | null = null;

export async function performFactCheck(
  transcript: string,
  statement: string | undefined,
  meta?: CheckMeta,
): Promise<FactCheckReport> {
  if (
    (!transcript || transcript.trim().length < 5) &&
    (!statement || statement.trim().length < 3)
  ) {
    throw new Error("Kein Text im Video gefunden und keine Aussage angegeben.");
  }

  currentCheckId = meta?.check_id ?? null;
  currentSession = meta?.session_id ?? null;

  const response = await fetch("/api/fact-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, statement, meta }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.report) {
    throw new Error("Invalid response from fact check API");
  }

  currentConversationMessages = Array.isArray(data.messages)
    ? data.messages
    : [];

  return data.report as FactCheckReport;
}

export async function askFollowupQuestion(question: string): Promise<string> {
  if (currentConversationMessages.length === 0) {
    throw new Error(
      "Keine aktive Konversation gefunden. Bitte führen Sie zuerst einen Faktencheck durch.",
    );
  }

  const response = await fetch("/api/followup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      messages: currentConversationMessages,
      check_id: currentCheckId,
      session_id: currentSession,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.answer || typeof data.answer !== "string") {
    throw new Error("Invalid response from followup API");
  }

  currentConversationMessages = Array.isArray(data.messages)
    ? data.messages
    : currentConversationMessages;

  return data.answer;
}

export function resetConversation(): void {
  currentConversationMessages = [];
  currentCheckId = null;
  currentSession = null;
}
