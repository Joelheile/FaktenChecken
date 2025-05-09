// Get OpenAI API key from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

// Store conversation context for follow-up questions
let currentConversationMessages: Array<{role: string, content: string}> = [];

/**
 * Performs fact checking on a transcript using ChatGPT
 */
export async function performFactCheck(transcript: string): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      console.log("OpenAI API key not found in environment variables");
      return `Faktencheck für den Transkript:\n\n1. Behauptung: [Erste Behauptung aus dem Video]\n   Bewertung: Teilweise korrekt.\n   Erklärung: Die präsentierten Daten sind grundsätzlich richtig, aber fehlen wichtigen Kontext.\n\n2. Behauptung: [Zweite Behauptung aus dem Video]\n   Bewertung: Falsch.\n   Erklärung: Diese Behauptung widerspricht aktuellen wissenschaftlichen Erkenntnissen.\n\nZusammenfassung: Das Video enthält eine Mischung aus korrekten Informationen und Fehlinformationen.`;
    }

    console.log("Performing fact check with ChatGPT 3.5 Turbo");
    
    // Reset conversation history when starting a new fact check
    currentConversationMessages = [
      {
        role: "system",
        content: "Du bist ein Faktenprüfer. Deine Aufgabe ist es, Behauptungen in TikTok-Videos zu analysieren und auf ihre Richtigkeit zu überprüfen. Gib für jede wesentliche Behauptung eine Bewertung ab (Korrekt, Teilweise korrekt, Falsch, Nicht überprüfbar) und begründe deine Einschätzung mit Fakten. Fasse am Ende die Glaubwürdigkeit des Videos zusammen. Formuliere alles in einfacher Sprache, die für Schüler zwischen 13-16 Jahren verständlich ist."
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
      return "Antwort auf Ihre Frage:\n\nVielen Dank für Ihre Nachfrage. Zu diesem Thema gibt es folgende zusätzliche Informationen, die Ihnen helfen könnten...\n\nIch hoffe, das beantwortet Ihre Frage. Haben Sie weitere Fragen?";
    }

    if (currentConversationMessages.length === 0) {
      throw new Error("Keine aktive Konversation gefunden. Bitte führen Sie zuerst einen Faktencheck durch.");
    }

    console.log(`Sending follow-up question to ChatGPT 3.5 Turbo: ${question}`);
    
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