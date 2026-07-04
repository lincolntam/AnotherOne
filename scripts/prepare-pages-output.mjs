import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
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
  if (entry.name === "assets" || entry.name === "worker.js") continue;
  cpSync(join(openNextDir, entry.name), join(pagesDir, entry.name), { recursive: true });
}

cpSync(join(openNextDir, "worker.js"), join(pagesDir, "_worker.js"));

if (existsSync(assetsDir)) {
  for (const entry of readdirSync(assetsDir, { withFileTypes: true })) {
    cpSync(join(assetsDir, entry.name), join(pagesDir, entry.name), { recursive: true });
  }
}

console.log(`Prepared Cloudflare Pages output in ${pagesDir}`);
