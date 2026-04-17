import { RAW_FILES } from "../config.js";
import { readJson } from "../lib/fileUtils.js";

export async function loadRawData() {
  const [companies, prices, conflicts] = await Promise.all([
    readJson(RAW_FILES.companies),
    readJson(RAW_FILES.prices),
    readJson(RAW_FILES.conflicts)
  ]);

  return { companies, prices, conflicts };
}
