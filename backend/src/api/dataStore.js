import { PROCESSED_FILES } from "../config.js";
import { readJson } from "../lib/fileUtils.js";

let cache = null;

export async function loadAnalytics() {
  if (!cache) {
    cache = await readJson(PROCESSED_FILES.analytics);
  }
  return cache;
}

export function clearCache() {
  cache = null;
}
