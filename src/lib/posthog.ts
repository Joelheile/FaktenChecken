import posthogClient from "posthog-js";
import { getSessionId, getVisitorId } from "./ids";

// Initialize PostHog only in the browser environment and with API key
if (typeof window !== "undefined") {
  // Use the environment variable or fallback to the value in case it's directly provided
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;

  posthogClient.init(apiKey, {
    api_host: "https://eu.i.posthog.com",
    // Disable capturing in development
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        // Turn off capturing in development
        posthog.opt_out_capturing();
      }
    },
    // Audience is 12-14 year olds; autocapture would record typed input
    // (URLs, statements) as DOM events. We track only the explicit, scrubbed
    // events in analytics.ts instead.
    autocapture: false,
    // Pageviews are captured manually per route in App.tsx (SPA routing),
    // so disable the built-in handler to avoid double counting.
    capture_pageview: false,
    // Capture when users leave a page
    capture_pageleave: true,
  });

  // Join key with the Neon dataset: every PostHog event carries the same
  // anonymous visitor_id (persistent) and session_id (per-visit) we store in
  // the sessions table, so engagement (PostHog) joins to outcomes (Neon).
  posthogClient.register({ visitor_id: getVisitorId() });
  posthogClient.register_for_session({ session_id: getSessionId() });
}

export const posthog = posthogClient;
