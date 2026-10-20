import factCheck from "./fact-check.js";
import transcript from "./transcript.js";

const routes: Record<string, (req: Request) => Promise<Response>> = {
  "/api/fact-check": factCheck,
  "/api/transcript": transcript,
};

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export default {
  async fetch(req) {
    const handler = routes[new URL(req.url).pathname];
    const res = handler
      ? await handler(req)
      : Response.json({ error: "not_found" }, { status: 404 });
    for (const [name, value] of Object.entries(securityHeaders)) {
      res.headers.set(name, value);
    }
    return res;
  },
} satisfies ExportedHandler;
