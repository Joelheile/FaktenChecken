interface Message {
  role: string;
  content: string;
}
//
let currentConversationMessages: Message[] = [];

export async function performFactCheck(
  transcript: string,
  statement?: string,
): Promise<string> {
  try {
    if (
      (!transcript || transcript.trim().length < 5) &&
      (!statement || statement.trim().length < 3)
    ) {
      return `Behauptung 1: Es gibt keinen Text im Video oder keine Aussage.
Bewertung: LEER
Warum: Wir haben weder Text im Video gefunden noch eine zu überprüfende Aussage.`;
    }

    console.log("Performing fact check via API route");

    const response = await fetch("/api/fact-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, statement }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.factCheck || typeof data.factCheck !== "string") {
      throw new Error("Invalid response from fact check API");
    }

    currentConversationMessages = Array.isArray(data.messages)
      ? data.messages
      : [];

    return data.factCheck;
  } catch (error) {
    console.error("Error with fact check:", error);
    throw new Error("Fehler beim Faktencheck. Bitte versuchen Sie es erneut.");
  }
}

export async function askFollowupQuestion(question: string): Promise<string> {
  try {
    if (currentConversationMessages.length === 0) {
      throw new Error(
        "Keine aktive Konversation gefunden. Bitte führen Sie zuerst einen Faktencheck durch.",
      );
    }

    console.log("Sending follow-up question via API route");

    const response = await fetch("/api/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        messages: currentConversationMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.answer || typeof data.answer !== "string") {
      throw new Error("Invalid response from followup API");
    }

    currentConversationMessages = Array.isArray(data.messages)
      ? data.messages
      : currentConversationMessages;

    return data.answer;
  } catch (error) {
    console.error("Error with follow-up question:", error);
    throw new Error(
      "Fehler beim Beantworten der Frage. Bitte versuchen Sie es erneut.",
    );
  }
}

export function resetConversation(): void {
  currentConversationMessages = [];
}
