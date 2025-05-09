import posthog from 'posthog-js';

// Initialize PostHog only in the browser environment and with API key
if (typeof window !== 'undefined') {
  // Use the environment variable or fallback to the value in case it's directly provided
  const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
  
  posthog.init(apiKey, {
    api_host: 'https://eu.i.posthog.com',
    // Disable capturing in development
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        // Turn off capturing in development
        posthog.opt_out_capturing();
      }
    },
    // Enable autocapture of events
    autocapture: true,
    // Capture pageviews
    capture_pageview: true,
    // Capture performance metrics
    capture_pageleave: true,
  });
}

export { posthog };
