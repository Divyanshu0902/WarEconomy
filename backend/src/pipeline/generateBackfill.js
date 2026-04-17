import path from "node:path";
import { RAW_FILES, ROOT_DIR } from "../config.js";
import { readJson } from "../lib/fileUtils.js";
import fs from "node:fs/promises";

const OUTPUT_FILE = path.join(ROOT_DIR, "data", "import", "synthetic_backfill.csv");
const TARGET_START_DATE = process.env.BACKFILL_START_DATE || "1970-01-01";
const STEP_DAYS = Number(process.env.BACKFILL_STEP_DAYS || 30);

async function main() {
  const [companies, prices] = await Promise.all([
    readJson(RAW_FILES.companies),
    readJson(RAW_FILES.prices)
  ]);

  const companyById = new Map(companies.map((c) => [c.id, c]));
  const byCompany = new Map();

  for (const p of prices) {
    if (!byCompany.has(p.companyId)) {
      byCompany.set(p.companyId, []);
    }
    byCompany.get(p.companyId).push(p);
  }

  for (const arr of byCompany.values()) {
    arr.sort((a, b) => a.date.localeCompare(b.date));
  }

  const rows = ["ticker,date,close,source,currency"];

  for (const [companyId, series] of byCompany.entries()) {
    const company = companyById.get(companyId);
    if (!company || series.length < 2) {
      continue;
    }

    addSyntheticPrehistory(rows, company.ticker, series[0], TARGET_START_DATE, STEP_DAYS);

    for (let i = 1; i < series.length; i += 1) {
      const prev = series[i - 1];
      const curr = series[i];
      const prevTime = new Date(prev.date).getTime();
      const currTime = new Date(curr.date).getTime();
      const gapDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));

      if (gapDays <= 40) {
        continue;
      }

      // Fill monthly points between sparse anchor dates so quality checks can validate pipeline behavior.
      const steps = Math.floor(gapDays / STEP_DAYS);
      for (let step = 1; step < steps; step += 1) {
        const t = step / steps;
        const time = prevTime + (currTime - prevTime) * t;
        const d = new Date(time).toISOString().slice(0, 10);
        const close = prev.close + (curr.close - prev.close) * t;
        rows.push(`${company.ticker},${d},${close.toFixed(4)},synthetic_interpolation,USD`);
      }
    }
  }

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, rows.join("\n") + "\n", "utf8");
  console.log(`Wrote ${rows.length - 1} synthetic rows to ${OUTPUT_FILE}`);
}

function addSyntheticPrehistory(rows, ticker, firstPoint, startDate, stepDays) {
  const startTime = new Date(startDate).getTime();
  const firstTime = new Date(firstPoint.date).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(firstTime) || firstTime <= startTime) {
    return;
  }

  const gapDays = Math.round((firstTime - startTime) / (1000 * 60 * 60 * 24));
  const steps = Math.floor(gapDays / stepDays);

  for (let step = 0; step < steps; step += 1) {
    const t = step / Math.max(steps, 1);
    const time = startTime + (firstTime - startTime) * t;
    const d = new Date(time).toISOString().slice(0, 10);
    // Keep prehistory flat at first known value to avoid artificial trend injection.
    rows.push(`${ticker},${d},${Number(firstPoint.close).toFixed(4)},synthetic_prehistory,USD`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
