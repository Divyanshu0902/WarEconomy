import { readJson } from "../lib/fileUtils.js";
import { PROCESSED_FILES } from "../config.js";

const MAX_ALLOWED_GAP_DAYS = Number(process.env.MAX_ALLOWED_GAP_DAYS || 90);
const TARGET_START_DATE = process.env.TARGET_START_DATE || "1970-01-01";
const ALLOW_COVERAGE_AFTER_TARGET = process.env.ALLOW_COVERAGE_AFTER_TARGET === "true";

async function main() {
  const report = await readJson(PROCESSED_FILES.qualityReport);

  const failures = [];

  for (const company of report.companies) {
    if (!company.metrics) {
      failures.push(`${company.ticker}: no metrics available`);
      continue;
    }

    if (company.metrics.maxGapDays > MAX_ALLOWED_GAP_DAYS) {
      failures.push(`${company.ticker}: maxGapDays ${company.metrics.maxGapDays} > ${MAX_ALLOWED_GAP_DAYS}`);
    }

    if (!ALLOW_COVERAGE_AFTER_TARGET && company.metrics.startDate > TARGET_START_DATE) {
      failures.push(`${company.ticker}: startDate ${company.metrics.startDate} is after ${TARGET_START_DATE}`);
    }
  }

  if (failures.length > 0) {
    console.error("Quality gate failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Quality gate passed.");
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
