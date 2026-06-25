import type { VercelRequest, VercelResponse } from "@vercel/node";
import { CheckMeta, checkRateLimit, persistCheckError } from "./_db.js";

export const config = {
  maxDuration: 120,
};

const APIFY_BASE_URL = "https://api.apify.com/v2";
const ACTOR_ID = "emQXBCL3xePZYgJyn";
// Bound the actor run so it can't outlast the function and cause a hard timeout.
const ACTOR_TIMEOUT_SECS = 100;

interface ApifyDatasetItem {
  transcript?: string;
  subtitles?: string[];
  text?: string;
}

function processWebVTT(vtt: string): string {
  const lines = vtt.split("\n");
  const filtered = lines
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith("WEBVTT")) return false;
      if (/^\d{2}:\d{2}:\d{2}/.test(trimmed)) return false;
      if (trimmed.includes("-->")) return false;
      return true;
    })
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return filtered.join(" ");
}

function extractTranscript(item: ApifyDatasetItem): string | null {
  // Check transcript (WebVTT format)
  if (item.transcript) {
    const processed = processWebVTT(item.transcript);
    if (processed) return processed;
  }

  // Check subtitles array
  if (item.subtitles && Array.isArray(item.subtitles)) {
    const joined = item.subtitles.join(" ").trim();
    if (joined) return joined;
  }

  // Check text
  if (item.text) {
    return item.text.trim();
  }

  return null;
}

/**
 * Resolve the numeric TikTok video id via the official oEmbed endpoint. This
 * also works for short (vm./vt.) links, which carry no id in the URL itself.
 * Best-effort: a failure just means no embed is shown, never a broken check.
 */
async function resolveVideoId(url: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { embed_product_id?: unknown };
    const id = data.embed_product_id;
    return typeof id === "string" && /^\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function isTikTokUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return false;
    const host = hostname.toLowerCase();
    return host === "tiktok.com" || host.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { url, meta } = req.body || {};
  if (!url || typeof url !== "string" || !isTikTokUrl(url)) {
    res.status(400).json({ error: "Missing or invalid TikTok url" });
    return;
  }

  if (!(await checkRateLimit(req, "transcript", 20, 3600))) {
    res.status(429).json({
      error: "Too many requests",
      message: "Zu viele Anfragen. Bitte versuche es später erneut.",
    });
    return;
  }

  // Only used to record a failed check: the success path is persisted by
  // /api/fact-check, so a video is written here only when transcription fails.
  const checkMeta: CheckMeta | null =
    meta?.check_id && meta?.session_id && meta?.input ? meta : null;

  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    res
      .status(500)
      .json({ error: "Server configuration error: missing API token" });
    return;
  }

  try {
    // Resolve the embeddable video id concurrently with the (slow) actor run.
    const videoIdPromise = resolveVideoId(url);

    // Single synchronous call: run the actor and get its dataset items back.
    // Apify blocks until the run finishes, so no manual polling loop is needed.
    const response = await fetch(
      `${APIFY_BASE_URL}/acts/${ACTOR_ID}/run-sync-get-dataset-items?timeout=${ACTOR_TIMEOUT_SECS}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ videos: [url] }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Apify run failed: ${response.status} ${response.statusText}`,
      );
    }

    const items: ApifyDatasetItem[] = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("No data returned from actor");
    }

    const transcript = extractTranscript(items[0]);

    if (!transcript) {
      if (checkMeta) {
        try {
          await persistCheckError(
            req,
            checkMeta,
            "no transcript",
            "",
            "transcript",
          );
        } catch (dbError) {
          console.error("Failed to persist transcript error:", dbError);
        }
      }
      res.status(422).json({
        error: "no_transcript",
        message:
          "Dieses Video hat keinen Text zum Prüfen. Es wurden keine Untertitel oder gesprochene Sprache gefunden. Probiere ein Video, in dem jemand spricht.",
      });
      return;
    }

    res.status(200).json({ transcript, videoId: await videoIdPromise });
  } catch (error) {
    console.error("Error processing request:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    // Record the uncheckable video (private, deleted, no captions, actor
    // timeout) so the failure population isn't lost to the dataset.
    if (checkMeta) {
      try {
        await persistCheckError(req, checkMeta, message, "", "transcript");
      } catch (dbError) {
        console.error("Failed to persist transcript error:", dbError);
      }
    }

    res.status(500).json({
      error: "transcript_failed",
      message:
        "Das Transkript konnte gerade nicht geladen werden. Bitte versuche es in einem Moment erneut.",
    });
  }
}
