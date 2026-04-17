import { PROCESSED_FILES } from "../config.js";
import { writeJson } from "../lib/fileUtils.js";
import { validateRawData } from "../schema.js";
import { loadRawData } from "./loadRawData.js";
import { transformRawData } from "./transform.js";
import { computeCorrelationAnalytics } from "./correlation.js";
import { mergeImportedPrices } from "./importPrices.js";
import { buildQualityReport } from "./qualityChecks.js";

export async function buildDataset() {
  const raw = await loadRawData();
  const mergedImport = await mergeImportedPrices(raw);
  raw.prices = mergedImport.prices;

  validateRawData(raw);

  const model = transformRawData(raw);
  const analytics = computeCorrelationAnalytics(model, { stageWindowDays: 30 });
  const qualityReport = buildQualityReport(raw, model);

  const payload = {
    metadata: {
      title: "War Economy Correlation Dataset",
      focus: "Stock change correlation around conflict start/progression/end with US involvement tagging",
      generatedAt: analytics.generatedAt,
      importSummary: mergedImport.report,
      qualitySummary: qualityReport.summary
    },
    companies: model.companies,
    priceSeries: model.companies.map((company) => ({
      companyId: company.id,
      ticker: company.ticker,
      points: model.pricesByCompany.get(company.id) || []
    })),
    conflicts: model.conflicts,
    analytics: analytics.companyAnalytics,
    assumptions: analytics.assumptions
  };

  await writeJson(PROCESSED_FILES.analytics, payload);
  await writeJson(PROCESSED_FILES.qualityReport, qualityReport);
  return payload;
}

if (process.argv[1] && process.argv[1].endsWith("buildDataset.js")) {
  buildDataset()
    .then((payload) => {
      console.log(`Processed dataset written with ${payload.analytics.length} companies.`);
    })
    .catch((err) => {
      console.error("Pipeline failed:", err.message);
      process.exitCode = 1;
    });
}
