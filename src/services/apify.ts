import { CheckMeta } from "./openai";

export async function fetchTikTokTranscript(
  tiktokUrl: string,
  meta?: CheckMeta,
): Promise<string> {
  try {
    console.log(`Fetching transcript for TikTok video: ${tiktokUrl}`);

    const response = await fetch("/api/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tiktokUrl, meta }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.transcript || typeof data.transcript !== "string") {
      throw new Error("Invalid response from transcript API");
    }

    return data.transcript;
  } catch (error) {
    console.error("Error in fetchTikTokTranscript:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unbekannter Fehler beim Abrufen des Transkripts.";
    throw new Error(
      `Fehler bei der TikTok-Transkript-Anfrage: ${errorMessage}`,
    );
  }
}
