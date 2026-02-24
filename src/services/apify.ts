export function extractTikTokVideoId(url: string): string {
  const standardRegex = /video\/(\d+)/;
  const standardMatch = url.match(standardRegex);

  if (standardMatch) {
    return standardMatch[1];
  }

  const shortUrlRegex = /vm\.tiktok\.com\/(\w+)/i;
  const shortUrlMatch = url.match(shortUrlRegex);

  if (shortUrlMatch) {
    return `shorturl-${shortUrlMatch[1]}`;
  }

  return "";
}

export async function fetchTikTokTranscript(
  tiktokUrl: string,
): Promise<string> {
  try {
    console.log(`Fetching transcript for TikTok video: ${tiktokUrl}`);

    const response = await fetch("/api/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tiktokUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.transcript;
  } catch (error: any) {
    console.error("Error in fetchTikTokTranscript:", error);
    const errorMessage =
      error.message || "Unbekannter Fehler beim Abrufen des Transkripts.";
    throw new Error(
      `Fehler bei der TikTok-Transkript-Anfrage: ${errorMessage}`,
    );
  }
}
