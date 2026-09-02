import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";

// Minimal Vercel request/response surface the /api handlers rely on.
type DevReq = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string>;
};
type DevRes = ServerResponse & {
  status: (code: number) => DevRes;
  json: (payload: unknown) => DevRes;
  send: (payload: unknown) => DevRes;
};
type ApiHandler = (req: DevReq, res: DevRes) => unknown;

const TRAILING_SLASHES = /\/+$/;
const API_ROUTE = /^\/api\/[a-zA-Z0-9_-]+$/;

function withResponseHelpers(res: ServerResponse): DevRes {
  const devRes = res as DevRes;
  devRes.status = (code) => {
    res.statusCode = code;
    return devRes;
  };
  devRes.json = (payload) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(payload));
    return devRes;
  };
  devRes.send = (payload) => {
    res.end(typeof payload === "string" ? payload : JSON.stringify(payload));
    return devRes;
  };
  return devRes;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

// Serves the Vercel serverless functions in api/*.ts directly inside the Vite
// dev server, so `npm run dev` answers /api/* requests instead of 404ing.
// Production is unaffected: Vercel runs these same files as real functions.
function devApiPlugin(): Plugin {
  return {
    name: "dev-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) {
          return next();
        }

        const route = url.split("?")[0].replace(TRAILING_SLASHES, "");
        // Only allow simple route names; block path traversal.
        if (!API_ROUTE.test(route)) {
          return next();
        }

        const devReq = req as DevReq;
        const devRes = withResponseHelpers(res);

        try {
          devReq.body = await readJsonBody(req);
          devReq.query = Object.fromEntries(
            new URL(url, "http://localhost").searchParams
          );

          const mod = await server.ssrLoadModule(`${route}.ts`);
          const handler = mod.default as ApiHandler | undefined;
          if (typeof handler !== "function") {
            devRes.status(404).json({ error: "not_found" });
            return;
          }
          await handler(devReq, devRes);
        } catch (error) {
          server.config.logger.error(`[dev-api] ${route}: ${String(error)}`);
          devRes.status(500).json({
            error: "dev_api_error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Expose unprefixed .env vars (APIFY_API_TOKEN, OPENAI_API_KEY, DATABASE_URL)
  // to the in-process API handlers via process.env.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), devApiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
