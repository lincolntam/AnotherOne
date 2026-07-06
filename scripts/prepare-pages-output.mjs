import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const openNextDir = ".open-next";
const pagesDir = ".open-next-pages";
const assetsDir = join(openNextDir, "assets");

if (!existsSync(join(openNextDir, "worker.js"))) {
  throw new Error("Missing .open-next/worker.js. Run opennextjs-cloudflare build first.");
}

rmSync(pagesDir, { recursive: true, force: true });
mkdirSync(pagesDir, { recursive: true });

for (const entry of readdirSync(openNextDir, { withFileTypes: true })) {
  if (entry.name === "assets") continue;
  cpSync(join(openNextDir, entry.name), join(pagesDir, entry.name), { recursive: true });
}

if (existsSync(assetsDir)) {
  for (const entry of readdirSync(assetsDir, { withFileTypes: true })) {
    cpSync(join(assetsDir, entry.name), join(pagesDir, entry.name), { recursive: true });
  }
}

const workerWrapper = `import worker, { BucketCachePurge, DOQueueHandler, DOShardedTagCache } from "./worker.js";

export { BucketCachePurge, DOQueueHandler, DOShardedTagCache };

const assetPrefixes = ["/_next/static/", "/icons/", "/assets/"];
const assetPaths = new Set([
  "/BUILD_ID",
  "/manifest.webmanifest",
  "/offline.html",
  "/sw.js",
  "/anotherwm-bookmarklet.js",
  "/ltravellog-route",
  "/ltravellog-route.html",
  "/ltravellog-route-app.js",
  "/ltravellog-route-style.css",
  "/Tesla.jpg"
]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if ((request.method === "GET" || request.method === "HEAD") && (assetPaths.has(url.pathname) || assetPrefixes.some((prefix) => url.pathname.startsWith(prefix)))) {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) return response;
      await response.body?.cancel();
    }

    return worker.fetch(request, env, ctx);
  }
};
`;

writeFileSync(join(pagesDir, "_worker.js"), workerWrapper);

console.log(`Prepared Cloudflare Pages output in ${pagesDir}`);
