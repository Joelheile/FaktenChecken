
// API service for TikTok transcription and fact-checking with ChatGPT

export interface FactCheckResponse {
  transcript: string;
  factCheck: string;
}

// TikTok API key would normally be stored in a secure backend
// For demo purposes, we'll allow it to be entered by the user
let tiktokApiKey = "";

// OpenAI API key would normally be stored in a secure backend
// For demo purposes, we'll allow it to be entered by the user
let openaiApiKey = "";

export function setTiktokApiKey(key: string) {
  tiktokApiKey = key;
}

export function setOpenaiApiKey(key: string) {
  openaiApiKey = key;
}

// Function to extract video ID from TikTok URL
function extractTikTokVideoId(url: string): string {
  const regex = /video\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : "";
}

// Function to get transcript from TikTok video
async function getTikTokTranscript(url: string): Promise<string> {
  try {
    const videoId = extractTikTokVideoId(url);
    if (!videoId) {
      throw new Error("Ungültige TikTok URL. Konnte keine Video-ID extrahieren.");
    }

    if (!tiktokApiKey) {
      console.log("TikTok API key not set, using mock transcript");
      return `Dies ist ein Beispiel-Transkript für TikTok Video ID: ${videoId}. In einer vollständigen Implementierung würden wir hier die TikTok API nutzen, um das tatsächliche Transkript des Videos zu erhalten.`;
    }

    // In a real implementation, we would call the TikTok API here
    // For demonstration purposes, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`Fetching transcript for TikTok video ID: ${videoId}`);
    
    // Simulate API call
    // In a production environment, this would be a real API call using the TikTok API
    return `Dies ist ein Beispiel-Transkript für TikTok Video ID: ${videoId}. In einer vollständigen Implementierung würden wir hier die TikTok API nutzen, um das tatsächliche Transkript des Videos zu erhalten.`;
  } catch (error) {
    console.error("Error fetching TikTok transcript:", error);
    throw new Error("Fehler beim Abrufen des Transkripts. Bitte versuchen Sie es erneut.");
  }
}

// Function to perform fact check using ChatGPT 4o
async function performFactCheckWithChatGPT(transcript: string): Promise<string> {
  try {
    if (!openaiApiKey) {
      console.log("OpenAI API key not set, using mock fact check");
      return `Faktencheck für den Transkript:\n\n1. Behauptung: [Erste Behauptung aus dem Video]\n   Bewertung: Teilweise korrekt.\n   Erklärung: Die präsentierten Daten sind grundsätzlich richtig, aber fehlen wichtigen Kontext.\n\n2. Behauptung: [Zweite Behauptung aus dem Video]\n   Bewertung: Falsch.\n   Erklärung: Diese Behauptung widerspricht aktuellen wissenschaftlichen Erkenntnissen.\n\nZusammenfassung: Das Video enthält eine Mischung aus korrekten Informationen und Fehlinformationen.`;
    }

    console.log("Performing fact check with ChatGPT 4o");
    
    // ChatGPT 4o API Call
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Du bist ein Faktenprüfer. Deine Aufgabe ist es, Behauptungen in TikTok-Videos zu analysieren und auf ihre Richtigkeit zu überprüfen. Gib für jede wesentliche Behauptung eine Bewertung ab (Korrekt, Teilweise korrekt, Falsch, Nicht überprüfbar) und begründe deine Einschätzung mit Fakten. Fasse am Ende die Glaubwürdigkeit des Videos zusammen."
          },
          {
            role: "user",
            content: `Bitte überprüfe folgendes Transkript eines TikTok-Videos auf Fakten und Behauptungen: \n\n${transcript}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error with ChatGPT fact check:", error);
    throw new Error("Fehler beim Faktencheck. Bitte versuchen Sie es erneut.");
  }
}

// Main function to transcribe and fact check
export async function transcribeAndFactCheck(tiktokUrl: string): Promise<FactCheckResponse> {
  console.log(`Prüfe TikTok URL: ${tiktokUrl}`);
  
  // Get transcript from TikTok API (or mock)
  const transcript = await getTikTokTranscript(tiktokUrl);
  
  // Get fact check from ChatGPT 4o
  const factCheck = await performFactCheckWithChatGPT(transcript);
  
  return {
    transcript,
    factCheck
  };
}

export async function askFollowupQuestion(question: string): Promise<string> {
  try {
    if (!openaiApiKey) {
      console.log("OpenAI API key not set, using mock response");
      return "Antwort auf Ihre Frage:\n\nVielen Dank für Ihre Nachfrage. Zu diesem Thema gibt es folgende zusätzliche Informationen, die Ihnen helfen könnten...\n\nIch hoffe, das beantwortet Ihre Frage. Haben Sie weitere Fragen?";
    }

    console.log(`Sending follow-up question to ChatGPT 4o: ${question}`);
    
    // ChatGPT 4o API Call for follow-up questions
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Du bist ein Faktenprüfer, der Folgefragen zu einem bereits durchgeführten Faktencheck beantwortet. Gib sachliche, gut recherchierte Antworten."
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error with follow-up question:", error);
    throw new Error("Fehler beim Beantworten der Frage. Bitte versuchen Sie es erneut.");
  }
}
