import { FactCheckReport } from "@/components/fact-check/types";
import { parseTikTokVideo } from "@/lib/analytics";
import { getSessionId, getVisitorId, newCheckId } from "@/lib/ids";
import { fetchTikTokTranscript } from "./apify";
import {
  askFollowupQuestion as askOpenAIFollowup,
  CheckMeta,
  performFactCheck,
  resetConversation,
} from "./openai";

/**
 * Response structure for fact checking operations
 */
export interface FactCheckResponse {
  /** The transcript text extracted from the TikTok video */
  transcript: string;
  /** The structured fact-checking report */
  report: FactCheckReport;
  /** Numeric TikTok id for embedding, null for statement-only checks */
  videoId: string | null;
}

/**
 * Error types that can occur during API operations
 */
export enum ApiErrorType {
  TRANSCRIPTION_ERROR = "transcription_error",
  FACT_CHECK_ERROR = "fact_check_error",
  FOLLOWUP_ERROR = "followup_error",
  NETWORK_ERROR = "network_error",
  AUTH_ERROR = "auth_error",
}

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  type: ApiErrorType;

  constructor(message: string, type: ApiErrorType) {
    super(message);
    this.name = "ApiError";
    this.type = type;
  }
}

/** Real progress signals emitted while a fact check runs. */
export type FactCheckProgress =
  | { stage: "transcript" }
  | { stage: "analyzing" };

/**
 * Transcribe a TikTok video and run the structured fact check on its content.
 *
 * @param tiktokUrl - URL of the TikTok video (may be empty if only a statement is given)
 * @param statement - Optional statement to fact-check alongside or instead of the video
 * @param onProgress - Receives real progress events (transcript fetched, then live model progress)
 */
export async function transcribeAndFactCheck(
  tiktokUrl: string,
  statement?: string,
  onProgress?: (progress: FactCheckProgress) => void,
): Promise<FactCheckResponse> {
  resetConversation();

  const video = tiktokUrl
    ? parseTikTokVideo(tiktokUrl)
    : { video_id: null, video_author: null };
  const meta: CheckMeta = {
    check_id: newCheckId(),
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    input: tiktokUrl ? "url" : "statement",
    query: statement?.trim() || null,
    video_url: tiktokUrl || null,
    video_id: video.video_id,
    author: video.video_author,
    referrer: document.referrer || null,
    lang: navigator.language || null,
  };

  try {
    let transcript = "";
    let videoId: string | null = null;

    if (tiktokUrl) {
      onProgress?.({ stage: "transcript" });
      const result = await fetchTikTokTranscript(tiktokUrl, meta);
      transcript = result.transcript;
      videoId = result.videoId;

      if (!transcript || transcript.trim().length < 5) {
        console.warn("Retrieved empty or very short transcript");
      }
    }

    onProgress?.({ stage: "analyzing" });
    const report = await performFactCheck(transcript, statement, meta);

    return { transcript, report, videoId };
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      const type = /transkript|untertitel|video|erreichbar/i.test(message)
        ? ApiErrorType.TRANSCRIPTION_ERROR
        : ApiErrorType.NETWORK_ERROR;
      // Surface the (already German, user-facing) message as-is.
      throw new ApiError(message, type);
    }

    throw new ApiError(
      "Bei der Analyse ist ein Fehler aufgetreten.",
      ApiErrorType.NETWORK_ERROR,
    );
  }
}

/**
 * Ask a follow-up question about the current fact check.
 */
export async function askFollowupQuestion(question: string): Promise<string> {
  try {
    return await askOpenAIFollowup(question);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ApiError(
      `Failed to answer follow-up question: ${errorMessage}`,
      ApiErrorType.FOLLOWUP_ERROR,
    );
  }
}
