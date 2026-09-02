import { neon } from "@neondatabase/serverless";
import type { VercelRequest } from "@vercel/node";

/**
 * Server-side writes to the Neon analytics dataset.
 *
 * All persistence is best-effort: a DB failure must never break the user-facing
 * fact check, so callers wrap these in try/catch and log. Identity is anonymous
 * (random client uuids); we enrich with coarse request context (country, device)
 * derived from headers, never the raw IP.
 */

const connection = process.env.DATABASE_URL;
const sql = connection ? neon(connection) : null;

/** Anonymous client identity + context the client knows about a check. */
export interface CheckMeta {
  author?: string | null;
  check_id: string;
  input: "url" | "statement";
  lang?: string | null;
  query?: string | null;
  referrer?: string | null;
  session_id: string;
  video_id?: string | null;
  video_url?: string | null;
  visitor_id: string;
}

/** Model run cost + config, for per-check cost analysis and prompt A/B. */
export interface CheckUsage {
  model: string | null;
  prompt_version: string | null;
  reasoning_effort: string | null;
  reasoning_tokens: number | null;
  search_context: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
}

interface ReportClaim {
  behauptung: string;
  belege: string;
  erklaerung: string;
  manipulation: string | null;
  quellen: { titel: string; url: string }[];
  urteil: string;
}

export interface Report {
  behauptungen: ReportClaim[];
  fazit: string;
  gesamturteil: string;
  quelle_sprache: string;
  selbst_pruefen: string;
  vorsicht: string;
}

interface RequestContext {
  browser: string;
  country: string | null;
  device: string;
  os: string;
}

const header = (req: VercelRequest, name: string): string => {
  const value = req.headers[name];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
};

/** Truncate untrusted client strings before they reach the database. */
const cap = (value: string | null | undefined, max: number): string | null =>
  value == null ? null : value.slice(0, max);

const clientIp = (req: VercelRequest): string => {
  // x-real-ip is set by the Vercel edge to the true peer address, so it can't
  // be forged by a client prepending its own x-forwarded-for to rotate IPs.
  const real = header(req, "x-real-ip");
  if (real) {
    return real;
  }
  const forwarded = header(req, "x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
};

/**
 * Fixed-window per-IP rate limit. Returns true if the request is allowed.
 *
 * Best-effort like the rest of this module: if the DB is off or the query
 * fails, we allow the request rather than break the product. The window is
 * keyed per endpoint so each paid API has its own budget.
 */
export const checkRateLimit = async (
  req: VercelRequest,
  endpoint: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> => {
  if (!sql) {
    return true;
  }
  try {
    const bucket =
      Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
    const windowStart = new Date(bucket * 1000).toISOString();
    const key = `${endpoint}:${clientIp(req)}`;
    const rows = await sql`
      insert into rate_limits (bucket_key, window_start, count)
      values (${key}, ${windowStart}, 1)
      on conflict (bucket_key, window_start)
      do update set count = rate_limits.count + 1
      returning count
    `;
    return Number(rows[0]?.count ?? 0) <= limit;
  } catch (error) {
    console.error("Rate limit check failed, allowing request:", error);
    return true;
  }
};

const firstMatch = (
  rules: [RegExp, string][],
  ua: string,
  fallback: string
): string => rules.find(([pattern]) => pattern.test(ua))?.[1] ?? fallback;

const DEVICE_RULES: [RegExp, string][] = [
  [/iPad|Tablet/i, "tablet"],
  [/Mobi|Android|iPhone/i, "mobile"],
];
const BROWSER_RULES: [RegExp, string][] = [
  [/Edg\//i, "Edge"],
  [/OPR\/|Opera/i, "Opera"],
  [/Chrome\//i, "Chrome"],
  [/Firefox\//i, "Firefox"],
  [/Safari\//i, "Safari"],
];
const OS_RULES: [RegExp, string][] = [
  [/Windows/i, "Windows"],
  [/Android/i, "Android"],
  [/iPhone|iPad|iOS/i, "iOS"],
  [/Mac OS X/i, "macOS"],
  [/Linux/i, "Linux"],
];

const parseDevice = (ua: string): string =>
  firstMatch(DEVICE_RULES, ua, "desktop");

const parseBrowser = (ua: string): string =>
  firstMatch(BROWSER_RULES, ua, "Other");

const parseOs = (ua: string): string => firstMatch(OS_RULES, ua, "Other");

const requestContext = (req: VercelRequest): RequestContext => {
  const ua = header(req, "user-agent");
  return {
    country: header(req, "x-vercel-ip-country") || null,
    device: parseDevice(ua),
    browser: parseBrowser(ua),
    os: parseOs(ua),
  };
};

const upsertSession = async (
  meta: CheckMeta,
  ctx: RequestContext
): Promise<void> => {
  if (!sql) {
    return;
  }
  await sql`
    insert into sessions (id, visitor, country, device, browser, os, lang, referrer)
    values (${cap(meta.session_id, 64)}, ${cap(meta.visitor_id, 64)},
            ${ctx.country}, ${ctx.device}, ${ctx.browser}, ${ctx.os},
            ${cap(meta.lang, 32)}, ${cap(meta.referrer, 500)})
    on conflict (id) do nothing
  `;
};

/**
 * Content-addressed cache lookup. Returns the most recent successful report for
 * this hash, or null on miss / DB off. A hit means a prior identical check
 * (same model + prompt + transcript + statement) already paid for the model run
 * and web searches, so we can replay its report for free.
 */
export const lookupCachedReport = async (
  contentHash: string
): Promise<Report | null> => {
  if (!sql) {
    return null;
  }
  const rows = await sql`
    select report from checks
    where content_hash = ${contentHash} and status = 'ok' and report is not null
    order by created_at desc
    limit 1
  `;
  const report = rows[0]?.report;
  return report ? (report as Report) : null;
};

export const persistCheck = async (
  req: VercelRequest,
  meta: CheckMeta,
  report: Report,
  transcript: string,
  durationMs: number,
  usage: CheckUsage,
  contentHash: string | null,
  cached: boolean
): Promise<void> => {
  if (!sql) {
    return;
  }
  await upsertSession(meta, requestContext(req));

  // Cap once and reuse so the parent row id matches the claims FK below.
  const checkId = cap(meta.check_id, 64);

  await sql`
    insert into checks (id, session, input, query, video_url, video_id, author,
                        transcript, lang, verdict, fazit, caution, tip,
                        n_claims, duration_ms, status, stage,
                        model, tokens_in, tokens_out, reasoning_tokens,
                        search_context, reasoning_effort, prompt_version,
                        content_hash, report, cached)
    values (${checkId}, ${cap(meta.session_id, 64)}, ${meta.input},
            ${cap(meta.query, 2000)}, ${cap(meta.video_url, 500)},
            ${cap(meta.video_id, 64)}, ${cap(meta.author, 128)},
            ${cap(transcript, 20_000)}, ${report.quelle_sprache},
            ${report.gesamturteil}, ${report.fazit}, ${report.vorsicht},
            ${report.selbst_pruefen}, ${report.behauptungen.length},
            ${durationMs}, 'ok', 'complete',
            ${usage.model}, ${usage.tokens_in}, ${usage.tokens_out},
            ${usage.reasoning_tokens}, ${usage.search_context},
            ${usage.reasoning_effort}, ${usage.prompt_version},
            ${contentHash}, ${JSON.stringify(report)}::jsonb, ${cached})
    on conflict (id) do nothing
  `;

  // One batched, idempotent insert: a retried request can't duplicate claims.
  const rows = report.behauptungen.map((c, idx) => ({
    idx,
    text: cap(c.behauptung, 4000),
    verdict: c.urteil,
    explanation: cap(c.erklaerung, 4000),
    evidence: cap(c.belege, 4000),
    manipulation: cap(c.manipulation, 500),
    sources: c.quellen,
    n_sources: c.quellen.length,
  }));

  if (rows.length > 0) {
    await sql.query(
      `insert into claims (check_id, idx, text, verdict, explanation, evidence,
                          manipulation, sources, n_sources)
       select $1, x.idx, x.text, x.verdict, x.explanation, x.evidence,
              x.manipulation, x.sources, x.n_sources
       from jsonb_to_recordset($2::jsonb) as x(idx int, text text,
              verdict text, explanation text, evidence text, manipulation text,
              sources jsonb, n_sources int)
       on conflict (check_id, idx) do nothing`,
      [checkId, JSON.stringify(rows)]
    );
  }
};

export const persistCheckError = async (
  req: VercelRequest,
  meta: CheckMeta,
  message: string,
  transcript: string,
  stage: "transcript" | "factcheck"
): Promise<void> => {
  if (!sql) {
    return;
  }
  await upsertSession(meta, requestContext(req));
  await sql`
    insert into checks (id, session, input, query, video_url, video_id, author,
                        transcript, status, stage, error)
    values (${cap(meta.check_id, 64)}, ${cap(meta.session_id, 64)}, ${meta.input},
            ${cap(meta.query, 2000)}, ${cap(meta.video_url, 500)},
            ${cap(meta.video_id, 64)}, ${cap(meta.author, 128)},
            ${cap(transcript, 20_000)}, 'error', ${stage}, ${cap(message, 4000)})
    on conflict (id) do nothing
  `;
};
