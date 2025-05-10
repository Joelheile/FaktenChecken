const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
import { FACT_CHECK_PROMPT, FOLLOWUP_PROMPT } from "./prompts";

let currentConversationMessages: Array<{role: string, content: string}> = [];

export async function performFactCheck(transcript: string): Promise<string> {
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

    if (!transcript || transcript.trim().length < 5) {
      console.log("Empty transcript, returning simple message");
      return `**Behauptung 1:** Es gibt keinen Text im Video.
**Bewertung:** LEER  
**Warum:** Wir haben keinen Text gefunden.`

    }

    console.log("Performing fact check with ChatGPT 3.5 Turbo");
    
    currentConversationMessages = [
      {
        role: "system",
        content: FACT_CHECK_PROMPT
      },
      {
        role: "user",
        content: `Bitte überprüfe folgendes Transkript eines TikTok-Videos auf Fakten und Behauptungen: \n\n${transcript}`
      }
    ];
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: currentConversationMessages,
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    const assistantResponse = data.choices[0].message.content;
    currentConversationMessages.push({
      role: "assistant",
      content: assistantResponse
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
      throw new Error("Keine aktive Konversation gefunden. Bitte führen Sie zuerst einen Faktencheck durch.");
    }

    console.log(`Sending follow-up question to ChatGPT 3.5 Turbo: ${question}`);
    
    const systemMessageIndex = currentConversationMessages.findIndex(msg => msg.role === "system");
    if (systemMessageIndex !== -1) {
      currentConversationMessages[systemMessageIndex] = {
        role: "system",
        content: FOLLOWUP_PROMPT
      };
    }
    
    currentConversationMessages.push({
      role: "user",
      content: question
    });
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: currentConversationMessages,
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    const assistantResponse = data.choices[0].message.content;
    currentConversationMessages.push({
      role: "assistant",
      content: assistantResponse
    });
    
    return assistantResponse;
  } catch (error) {
    console.error("Error with follow-up question:", error);
    throw new Error("Fehler beim Beantworten der Frage. Bitte versuchen Sie es erneut.");
  }
}

export function resetConversation(): void {
  currentConversationMessages = [];
}