import fs from "node:fs/promises";
import path from "node:path";
import { FRONTEND_DIR, PROCESSED_FILES, ROOT_DIR } from "../config.js";

const DIST_DIR = path.join(ROOT_DIR, "dist", "static");
const DIST_ASSETS_DIR = path.join(DIST_DIR, "assets");
const DIST_DATA_DIR = path.join(DIST_DIR, "data");

async function exportStaticSite() {
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await fs.mkdir(DIST_ASSETS_DIR, { recursive: true });
  await fs.mkdir(DIST_DATA_DIR, { recursive: true });

  await copyFile(path.join(FRONTEND_DIR, "index.html"), path.join(DIST_DIR, "index.html"));
  await copyFile(path.join(FRONTEND_DIR, "assets", "styles.css"), path.join(DIST_ASSETS_DIR, "styles.css"));
  await copyFile(path.join(FRONTEND_DIR, "assets", "app.js"), path.join(DIST_ASSETS_DIR, "app.js"));
  await copyFile(PROCESSED_FILES.analytics, path.join(DIST_DATA_DIR, "analytics.json"));

  // GitHub Pages serves static sites more reliably with this marker.
  await fs.writeFile(path.join(DIST_DIR, ".nojekyll"), "\n", "utf8");

  console.log("Static site export complete:");
  console.log(`- ${DIST_DIR}`);
  console.log("Contents:");
  console.log("  - index.html");
  console.log("  - assets/styles.css");
  console.log("  - assets/app.js");
  console.log("  - data/analytics.json");
  console.log("  - .nojekyll");
}

async function copyFile(src, dest) {
  await fs.copyFile(src, dest);
}

exportStaticSite().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
