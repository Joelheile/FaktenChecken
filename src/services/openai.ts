const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
import { FACT_CHECK_PROMPT, FOLLOWUP_PROMPT } from "./prompts";

let currentConversationMessages: Array<{ role: string; content: string }> = [];

// Funktion um tagesaktuelle Informationen über eine Websuche abzurufen
async function performWebSearch(searchTerm: string): Promise<string> {
  try {
    console.log(`Performing web search for: ${searchTerm}`);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano-preview",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein hilfreicher Assistent, der Websuchen durchführt, um aktuelle Informationen zu finden.",
          },
          {
            role: "user",
            content: `Führe eine Websuche durch, um aktuelle Fakten zu folgendem Thema zu finden: ${searchTerm}. Gib nur die relevanten Fakten zurück, keine Einleitungen oder persönliche Meinungen.`,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
        tools: [{ type: "web_search" }],
        tool_choice: { type: "web_search" },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Web search error:", data.error);
      return "";
    }

    // Extrahiere und verarbeite das Websuche-Ergebnis
    let webSearchResults = "";
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const toolCalls = data.choices[0].message.tool_calls;

      if (toolCalls && toolCalls.length > 0) {
        // Bereite einen weiteren API-Call vor, um die Websuche-Ergebnisse zu verarbeiten
        const followUpResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4.1-nano-preview",
              messages: [
                {
                  role: "system",
                  content:
                    "Du fasst Websuche-Ergebnisse zu relevanten Fakten zusammen. Sei präzise, neutral und gib nur gesicherte Informationen wieder. Nenne keine Quellen und schreibe einfach die relevanten Fakten.",
                },
                {
                  role: "user",
                  content: `Fasse die folgenden Websuche-Ergebnisse zu klaren, faktischen Punkten zusammen, die für die Überprüfung dieser Aussage relevant sind: "${searchTerm}"`,
                },
                {
                  role: "assistant",
                  content: null,
                  tool_calls: toolCalls,
                },
                {
                  role: "tool",
                  tool_call_id: toolCalls[0].id,
                  content: JSON.stringify(toolCalls[0].function),
                },
              ],
              temperature: 0.1,
              max_tokens: 1500,
            }),
          },
        );

        const followUpData = await followUpResponse.json();

        if (
          followUpData.choices &&
          followUpData.choices[0] &&
          followUpData.choices[0].message
        ) {
          webSearchResults = followUpData.choices[0].message.content;
        }
      }
    }

    console.log("Web search results obtained");
    return webSearchResults;
  } catch (error) {
    console.error("Error during web search:", error);
    return "";
  }
}

export async function performFactCheck(
  transcript: string,
  statement?: string,
): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      console.log("OpenAI API key not found in environment variables");
      return `**Behauptung 1:** [Erste Behauptung aus dem Video]
**Bewertung:** TEILS-TEILS  
**Warum:** Die präsentierten Daten sind grundsätzlich richtig, aber es fehlt wichtiger Kontext.

**Behauptung 2:** [Zweite Behauptung aus dem Video]
**Bewertung:** FALSCH  
**Warum:** Diese Behauptung stimmt nicht mit dem überein, was Wissenschaftler herausgefunden haben.

### Zusammenfassung:
**Ergebnis:** TEILS-TEILS  
**Einfach erklärt:** Das Video mischt wahre Informationen mit falschen Dingen. Du solltest vorsichtig sein, was du davon glaubst.`;
    }

    if (
      (!transcript || transcript.trim().length < 5) &&
      (!statement || statement.trim().length < 3)
    ) {
      console.log(
        "Empty transcript and no statement, returning simple message",
      );
      return `**Behauptung 1:** Es gibt keinen Text im Video oder keine Aussage.
**Bewertung:** LEER  
**Warum:** Wir haben weder Text im Video gefunden noch eine zu überprüfende Aussage.`;
    }

    console.log("Performing fact check with ChatGPT 4.1 Nano");

    let userPrompt = "";
    let searchTerm = "";

    if (transcript && transcript.trim().length >= 5) {
      if (statement && statement.trim().length >= 3) {
        userPrompt = `Bitte überprüfe folgendes Transkript eines TikTok-Videos auf Fakten und Behauptungen: \n\n${transcript}\n\nBitte überprüfe besonders diese Aussage: ${statement}`;
        searchTerm = statement;
      } else {
        userPrompt = `Bitte überprüfe folgendes Transkript eines TikTok-Videos auf Fakten und Behauptungen: \n\n${transcript}`;
        searchTerm = transcript.split(".")[0];
      }
    } else if (statement && statement.trim().length >= 3) {
      userPrompt = `Bitte überprüfe folgende Aussage auf ihren Wahrheitsgehalt: \n\n${statement}`;
      searchTerm = statement;
    }

    const webSearchResults = await performWebSearch(searchTerm);

    let finalPrompt = userPrompt;
    if (webSearchResults && webSearchResults.trim().length > 0) {
      finalPrompt += `\n\nHier sind aktuelle Informationen zu diesem Thema, die bei der Faktenprüfung helfen können:\n\n${webSearchResults}`;
    }

    currentConversationMessages = [
      {
        role: "system",
        content: FACT_CHECK_PROMPT,
      },
      {
        role: "user",
        content: finalPrompt,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: currentConversationMessages,
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }

    const assistantResponse = data.choices[0].message.content;
    currentConversationMessages.push({
      role: "assistant",
      content: assistantResponse,
    });

    return assistantResponse;
  } catch (error) {
    console.error("Error with ChatGPT fact check:", error);
    throw new Error("Fehler beim Faktencheck. Bitte versuchen Sie es erneut.");
  }
}

export async function askFollowupQuestion(question: string): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      console.log("OpenAI API key not found in environment variables");
      return "**Antwort auf deine Frage:**\n\nHier ist eine einfache Erklärung, die dir helfen kann. Wenn du noch mehr Fragen hast, kannst du gerne nochmal fragen!";
    }

    if (currentConversationMessages.length === 0) {
      throw new Error(
        "Keine aktive Konversation gefunden. Bitte führen Sie zuerst einen Faktencheck durch.",
      );
    }

    console.log(`Sending follow-up question to ChatGPT 3.5 Turbo: ${question}`);

    const systemMessageIndex = currentConversationMessages.findIndex(
      (msg) => msg.role === "system",
    );
    if (systemMessageIndex !== -1) {
      currentConversationMessages[systemMessageIndex] = {
        role: "system",
        content: FOLLOWUP_PROMPT,
      };
    }

    currentConversationMessages.push({
      role: "user",
      content: question,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: currentConversationMessages,
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }

    const assistantResponse = data.choices[0].message.content;
    currentConversationMessages.push({
      role: "assistant",
      content: assistantResponse,
    });

    return assistantResponse;
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
