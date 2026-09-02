import type { FactCheckReport } from "@/components/fact-check/types";

/** Anonymous identity + context attached to a fact check for the dataset. */
export interface CheckMeta {
  author: string | null;
  check_id: string;
  input: "url" | "statement";
  lang: string | null;
  query: string | null;
  referrer: string | null;
  session_id: string;
  video_id: string | null;
  video_url: string | null;
  visitor_id: string;
}

export async function performFactCheck(
  transcript: string,
  statement: string | undefined,
  meta?: CheckMeta
): Promise<FactCheckReport> {
  if (
    (!transcript || transcript.trim().length < 5) &&
    (!statement || statement.trim().length < 3)
  ) {
    throw new Error("Kein Text im Video gefunden und keine Aussage angegeben.");
  }

  const response = await fetch("/api/fact-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, statement, meta }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.report) {
    throw new Error("Invalid response from fact check API");
  }

  return data.report as FactCheckReport;
}
