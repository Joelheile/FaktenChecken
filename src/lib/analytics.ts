import {
  FactCheckReport,
  ReportClaim,
  Verdict,
} from "@/components/fact-check/types";
import { posthog } from "./posthog";

/**
 * Centralized PostHog event tracking.
 *
 * Goal: capture the data worth mining later, what people search, which videos
 * they check, what verdict comes back, which sources they trust. Everything
 * else stays out so the event stream stays queryable.
 *
 * Video and search context is registered as session super properties on submit
 * (register_for_session), so it auto-attaches to every later event in the same
 * visit (completed, per-claim, source clicks, followups) without prop drilling.
 */

const TEXT_LIMIT = 500;

const truncate = (text: string): string =>
  text.length > TEXT_LIMIT ? text.slice(0, TEXT_LIMIT) : text;

type InputType = "url" | "statement";
type SubmitSource = "manual" | "example";

interface TikTokVideoMeta {
  video_id: string | null;
  video_author: string | null;
}

const NO_VIDEO: TikTokVideoMeta = { video_id: null, video_author: null };

const STANDARD = /tiktok\.com\/@([\w.-]+)\/video\/(\d+)/i;
const SHORT = /(?:vm|vt)\.tiktok\.com\/(\w+)/i;

export const parseTikTokVideo = (url: string): TikTokVideoMeta => {
  const standard = url.match(STANDARD);
  if (standard) return { video_author: standard[1], video_id: standard[2] };

  const short = url.match(SHORT);
  if (short) return { video_author: null, video_id: short[1] };

  return NO_VIDEO;
};

const countVerdicts = (claims: ReportClaim[]): Record<Verdict, number> => {
  const counts: Record<Verdict, number> = {
    wahr: 0,
    falsch: 0,
    teils_teils: 0,
    nicht_pruefbar: 0,
  };
  for (const claim of claims) counts[claim.urteil] += 1;
  return counts;
};

export const trackFactCheckSubmitted = (params: {
  url: string;
  statement?: string;
  source: SubmitSource;
}): void => {
  const { url, statement, source } = params;
  const inputType: InputType = url ? "url" : "statement";
  const video = url ? parseTikTokVideo(url) : NO_VIDEO;
  const searchQuery = statement?.trim() ? truncate(statement.trim()) : null;

  posthog.register_for_session({
    input_type: inputType,
    video_id: video.video_id,
    video_author: video.video_author,
    search_query: searchQuery,
  });

  posthog.capture("tiktok_url_submitted", {
    input_type: inputType,
    source,
    video_url: url || null,
    search_query: searchQuery,
    has_url: !!url,
    has_statement: !!statement,
    query_length: statement?.trim().length ?? 0,
  });
};

const trackClaimAnalyzed = (claim: ReportClaim, index: number): void => {
  posthog.capture("claim_analyzed", {
    claim_text: truncate(claim.behauptung),
    verdict: claim.urteil,
    has_manipulation: !!claim.manipulation,
    manipulation_type: claim.manipulation ?? null,
    source_count: claim.quellen.length,
    claim_index: index,
  });
};

export const trackFactCheckCompleted = (params: {
  report: FactCheckReport;
  transcriptLength: number;
  durationMs: number;
}): void => {
  const { report, transcriptLength, durationMs } = params;
  const claims = report.behauptungen;
  const counts = countVerdicts(claims);
  const sourceCount = claims.reduce((sum, c) => sum + c.quellen.length, 0);
  const manipulationCount = claims.filter((c) => !!c.manipulation).length;

  posthog.capture("fact_check_completed", {
    overall_verdict: report.gesamturteil,
    source_language: report.quelle_sprache,
    claim_count: claims.length,
    claims_true: counts.wahr,
    claims_false: counts.falsch,
    claims_partial: counts.teils_teils,
    claims_unknown: counts.nicht_pruefbar,
    source_count: sourceCount,
    manipulation_count: manipulationCount,
    has_manipulation: manipulationCount > 0,
    has_caution: !!report.vorsicht?.trim(),
    transcript_length: transcriptLength,
    duration_ms: durationMs,
  });

  claims.forEach(trackClaimAnalyzed);
};

export const trackFactCheckError = (message: string, type: string): void => {
  posthog.capture("fact_check_error", {
    error_message: message,
    error_type: type,
  });
};

export const trackSourceClicked = (params: {
  url: string;
  title: string;
  verdict: Verdict;
  claimIndex: number;
}): void => {
  posthog.capture("source_clicked", {
    source_url: params.url,
    source_title: params.title,
    claim_verdict: params.verdict,
    claim_index: params.claimIndex,
  });
};

export const trackFollowupAsked = (question: string): void => {
  posthog.capture("followup_question_asked", {
    question_text: truncate(question.trim()),
    question_length: question.trim().length,
  });
};

export const trackFollowupAnswered = (
  question: string,
  answer: string,
): void => {
  posthog.capture("followup_question_answered", {
    question_text: truncate(question.trim()),
    answer_length: answer.length,
  });
};

export const trackFollowupError = (message: string): void => {
  posthog.capture("followup_question_error", { error_message: message });
};

export const trackImpressumClicked = (): void => {
  posthog.capture("impressum_click", { source: "footer" });
};
