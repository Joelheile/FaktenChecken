// Get OpenAI API key from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";
import { FACT_CHECK_PROMPT, FOLLOWUP_PROMPT } from "./prompts";

// Store conversation context for follow-up questions
let currentConversationMessages: Array<{role: string, content: string}> = [];

/**
 * Performs fact checking on a transcript using ChatGPT
 */
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

    // Check if transcript is empty or very small
    if (!transcript || transcript.trim().length < 5) {
      console.log("Empty transcript, returning simple message");
      return `**Behauptung 1:** Es gibt keinen Text im Video.
**Bewertung:** LEER  
**Warum:** Wir haben keinen Text gefunden.`

    }

    console.log("Performing fact check with ChatGPT 3.5 Turbo");
    
    // Reset conversation history when starting a new fact check
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
    
    // Using the OpenAI API with the cheaper gpt-3.5-turbo model
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
    
    // Add the assistant's response to the conversation history
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

/**
 * Handles follow-up questions about the fact check
 */
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
    
    // Update system message for followup to be more kid-friendly
    // Find and replace the system message
    const systemMessageIndex = currentConversationMessages.findIndex(msg => msg.role === "system");
    if (systemMessageIndex !== -1) {
      currentConversationMessages[systemMessageIndex] = {
        role: "system",
        content: FOLLOWUP_PROMPT
      };
    }
    
    // Add the user's follow-up question to the conversation history
    currentConversationMessages.push({
      role: "user",
      content: question
    });
    
    // Send the updated conversation to ChatGPT
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
    
    // Add the assistant's response to the conversation history
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

/**
 * Resets the current conversation
 */
export function resetConversation(): void {
  currentConversationMessages = [];
} 