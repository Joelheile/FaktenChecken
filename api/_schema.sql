-- Anonymized analytics dataset (Neon Postgres).
-- Stores the substantive funnel: access -> search -> generated report -> followups.
-- Lightweight engagement (pageviews, clicks) lives in PostHog, not here.
-- No IP, no PII by design: visitor/session are random client-generated uuids,
-- location is coarse country only.

create table if not exists sessions (
  id         text primary key,            -- per-visit uuid (sessionStorage)
  visitor    text not null,               -- persistent uuid (localStorage), pseudonymous
  created_at timestamptz not null default now(),
  country    text,                        -- coarse geo from edge header
  device     text,                        -- mobile | tablet | desktop
  browser    text,
  os         text,
  lang       text,                        -- navigator.language
  referrer   text
);

create table if not exists checks (
  id          text primary key,           -- per-check uuid
  session     text references sessions(id),
  created_at  timestamptz not null default now(),
  input       text not null,              -- 'url' | 'statement'
  query       text,                       -- the typed statement (null for pure video checks)
  video_url   text,
  video_id    text,
  author      text,                       -- tiktok @handle
  transcript  text,
  lang        text,                       -- detected source language of the content
  verdict     text,                       -- overall: wahr | falsch | teils_teils | nicht_pruefbar
  fazit       text,
  caution     text,
  tip         text,
  n_claims    int,
  duration_ms int,
  status      text not null default 'ok', -- 'ok' | 'error'
  stage       text,                        -- 'complete' | 'transcript' | 'factcheck' (where it ended)
  error       text,
  model       text,                        -- model that produced the report
  tokens_in   int,
  tokens_out  int,
  reasoning_tokens int,
  search_context   text,                    -- web_search context size knob
  reasoning_effort text,                    -- reasoning effort knob
  prompt_version   text                     -- bump on prompt/schema change
);

create table if not exists claims (
  id           bigserial primary key,
  check_id     text not null references checks(id) on delete cascade,
  idx          int not null,
  unique (check_id, idx),
  text         text,                      -- the claim
  verdict      text,                      -- wahr | falsch | teils_teils | nicht_pruefbar
  explanation  text,
  evidence     text,
  manipulation text,
  sources      jsonb,                     -- [{ titel, url }]
  n_sources    int
);

create table if not exists questions (
  id         bigserial primary key,
  check_id   text references checks(id) on delete cascade,
  session    text,
  created_at timestamptz not null default now(),
  question   text not null,
  answer     text,
  status     text not null default 'ok',  -- 'ok' | 'error'
  error      text
);

-- Per-IP request counters for cost protection on the paid endpoints.
-- Fixed-window: one row per (endpoint:ip, window_start). Old rows are inert;
-- prune with `delete from rate_limits where window_start < now() - interval '1 day'`.
create table if not exists rate_limits (
  bucket_key   text not null,               -- 'endpoint:ip'
  window_start timestamptz not null,
  count        int not null default 1,
  primary key (bucket_key, window_start)
);
create index if not exists rate_limits_window_idx on rate_limits (window_start);

create index if not exists checks_session_idx   on checks (session);
create index if not exists checks_created_idx    on checks (created_at);
create index if not exists checks_verdict_idx    on checks (verdict);
create index if not exists checks_author_idx     on checks (author);
create index if not exists claims_check_idx      on claims (check_id);
create index if not exists claims_verdict_idx    on claims (verdict);
create index if not exists questions_check_idx   on questions (check_id);
create index if not exists sessions_visitor_idx  on sessions (visitor);
