import type { ViteDevServer } from "vite";

export function addHeadersMiddleware(server: ViteDevServer) {
  server.middlewares.use((_req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });
}
