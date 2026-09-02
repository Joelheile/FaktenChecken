import type { CheckMeta } from "./openai";

const NETWORK_ERROR = /failed to fetch|networkerror|load failed/i;

export interface TranscriptResult {
  transcript: string;
  /** Numeric TikTok id for embedding, null if it could not be resolved. */
  videoId: string | null;
}

export async function fetchTikTokTranscript(
  tiktokUrl: string,
  meta?: CheckMeta
): Promise<TranscriptResult> {
  try {
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

    return {
      transcript: data.transcript,
      videoId: typeof data.videoId === "string" ? data.videoId : null,
    };
  } catch (error) {
    console.error("Error in fetchTikTokTranscript:", error);
    const message = error instanceof Error ? error.message : "";
    if (NETWORK_ERROR.test(message)) {
      throw new Error(
        "Server nicht erreichbar. Bitte versuche es in einem Moment erneut."
      );
    }
    throw new Error(message || "Das Transkript konnte nicht geladen werden.");
  }
}
