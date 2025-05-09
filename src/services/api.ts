
// API service for TikTok transcription and fact-checking with ChatGPT

export interface FactCheckResponse {
  transcript: string;
  factCheck: string;
}

// API keys would normally be stored in a secure backend
// For demo purposes, we'll allow them to be entered by the user
let apifyApiToken = "";
let openaiApiKey = "";

export function setApifyApiToken(token: string) {
  apifyApiToken = token;
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

// Function to get transcript from TikTok video using Apify
async function getTikTokTranscript(url: string): Promise<string> {
  try {
    const videoId = extractTikTokVideoId(url);
    if (!videoId) {
      throw new Error("Ungültige TikTok URL. Konnte keine Video-ID extrahieren.");
    }

    if (!apifyApiToken) {
      console.log("Apify API token not set, using mock transcript");
      return `Dies ist ein Beispiel-Transkript für TikTok Video ID: ${videoId}. In einer vollständigen Implementierung würden wir hier die Apify API nutzen, um das tatsächliche Transkript des Videos zu erhalten.`;
    }

    console.log(`Fetching transcript for TikTok video ID: ${videoId}`);
    
    // Using the correct Apify dataset endpoint based on the provided documentation
    const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/TOoo5HOEjdoYUqIqO/items?token=${apifyApiToken}`);
    
    if (!datasetResponse.ok) {
      throw new Error(`Apify dataset error: ${datasetResponse.status}`);
    }
    
    const data = await datasetResponse.json();
    
    if (!data || data.length === 0) {
      throw new Error("Keine Daten vom TikTok Video gefunden.");
    }
    
    // Extract transcript from the response
    const videoData = data[0];
    if (videoData && videoData.subtitles) {
      return videoData.subtitles.join(" ");
    } else {
      return `Video gefunden, aber kein Transkript verfügbar für Video ID: ${videoId}.`;
    }
  } catch (error) {
    console.error("Error fetching TikTok transcript:", error);
    throw new Error("Fehler beim Abrufen des Transkripts. Bitte versuchen Sie es erneut.");
  }
}

// Function to perform fact check using ChatGPT 4o according to OpenAI documentation
async function performFactCheckWithChatGPT(transcript: string): Promise<string> {
  try {
    if (!openaiApiKey) {
      console.log("OpenAI API key not set, using mock fact check");
      return `Faktencheck für den Transkript:\n\n1. Behauptung: [Erste Behauptung aus dem Video]\n   Bewertung: Teilweise korrekt.\n   Erklärung: Die präsentierten Daten sind grundsätzlich richtig, aber fehlen wichtigen Kontext.\n\n2. Behauptung: [Zweite Behauptung aus dem Video]\n   Bewertung: Falsch.\n   Erklärung: Diese Behauptung widerspricht aktuellen wissenschaftlichen Erkenntnissen.\n\nZusammenfassung: Das Video enthält eine Mischung aus korrekten Informationen und Fehlinformationen.`;
    }

    console.log("Performing fact check with ChatGPT 4o");
    
    // Using the OpenAI API for gpt-4o according to the latest documentation
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
            content: "Du bist ein Faktenprüfer. Deine Aufgabe ist es, Behauptungen in TikTok-Videos zu analysieren und auf ihre Richtigkeit zu überprüfen. Gib für jede wesentliche Behauptung eine Bewertung ab (Korrekt, Teilweise korrekt, Falsch, Nicht überprüfbar) und begründe deine Einschätzung mit Fakten. Fasse am Ende die Glaubwürdigkeit des Videos zusammen. Formuliere alles in einfacher Sprache, die für Schüler zwischen 13-16 Jahren verständlich ist."
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
  
  // Get transcript from Apify API (or mock)
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
    
    // Using the OpenAI API for gpt-4o according to the latest documentation
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
            content: "Du bist ein Faktenprüfer, der Folgefragen zu einem bereits durchgeführten Faktencheck beantwortet. Gib sachliche, gut recherchierte Antworten in einfacher Sprache, die für Schüler zwischen 13-16 Jahren verständlich ist."
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
