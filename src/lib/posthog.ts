import posthog from 'posthog-js';

// Initialize PostHog only in the browser environment and with API key
if (typeof window !== 'undefined' && process.env.VITE_POSTHOG_API_KEY) {
  posthog.init(process.env.VITE_POSTHOG_API_KEY, {
    api_host: 'https://app.posthog.com',
    // Disable in development
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        // Turn off capturing in development
        posthog.opt_out_capturing();
      }
    },
  });
}

export { posthog };
