import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, "..", "..");
export const RAW_DATA_DIR = path.join(ROOT_DIR, "data", "raw");
export const IMPORT_DATA_DIR = path.join(ROOT_DIR, "data", "import");
export const PROCESSED_DATA_DIR = path.join(ROOT_DIR, "data", "processed");
export const FRONTEND_DIR = path.join(ROOT_DIR, "frontend");

export const RAW_FILES = {
  companies: path.join(RAW_DATA_DIR, "companies.json"),
  prices: path.join(RAW_DATA_DIR, "prices.json"),
  conflicts: path.join(RAW_DATA_DIR, "conflicts.json")
};

export const PROCESSED_FILES = {
  analytics: path.join(PROCESSED_DATA_DIR, "analytics.json"),
  qualityReport: path.join(PROCESSED_DATA_DIR, "quality-report.json")
};

export const API_PORT = Number(process.env.PORT || 8080);
