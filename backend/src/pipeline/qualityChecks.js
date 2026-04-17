import { dateDiffDays } from "../lib/dateUtils.js";

const TARGET_START_DATE = "1970-01-01";

export function buildQualityReport(raw, model, options = {}) {
  const largeMoveThresholdPct = options.largeMoveThresholdPct || 20;

  const rawDuplicateMap = new Map();
  for (const row of raw.prices) {
    const key = `${row.companyId}|${row.date}`;
    rawDuplicateMap.set(key, (rawDuplicateMap.get(key) || 0) + 1);
  }

  const companyReports = model.companies.map((company) => {
    const series = model.pricesByCompany.get(company.id) || [];
    const duplicateRows = countCompanyDuplicates(company.id, rawDuplicateMap);

    if (series.length === 0) {
      return {
        companyId: company.id,
        ticker: company.ticker,
        points: 0,
        warnings: ["No price points available"],
        metrics: null
      };
    }

    const startDate = series[0].date;
    const endDate = series[series.length - 1].date;
    const coverageDays = dateDiffDays(startDate, endDate);

    let maxGapDays = 0;
    let totalGapDays = 0;
    let gapCount = 0;
    let largeMovesCount = 0;

    for (let i = 1; i < series.length; i += 1) {
      const prev = series[i - 1];
      const curr = series[i];

      const gap = dateDiffDays(prev.date, curr.date);
      maxGapDays = Math.max(maxGapDays, gap);
      totalGapDays += gap;
      gapCount += 1;

      if (prev.close > 0) {
        const movePct = ((curr.close - prev.close) / prev.close) * 100;
        if (Math.abs(movePct) >= largeMoveThresholdPct) {
          largeMovesCount += 1;
        }
      }
    }

    const avgGapDays = gapCount > 0 ? totalGapDays / gapCount : 0;
    const coverageToTargetDays = dateDiffDays(TARGET_START_DATE, startDate);

    const warnings = [];
    if (duplicateRows > 0) {
      warnings.push(`Duplicate raw rows detected: ${duplicateRows}`);
    }
    if (coverageToTargetDays > 0) {
      warnings.push(`Coverage starts after target (${TARGET_START_DATE}) by ${coverageToTargetDays} days`);
    }
    if (maxGapDays > 45) {
      warnings.push(`Large date gap detected: ${maxGapDays} days`);
    }
    if (largeMovesCount > 0) {
      warnings.push(`Large move events above ${largeMoveThresholdPct}%: ${largeMovesCount}`);
    }

    return {
      companyId: company.id,
      ticker: company.ticker,
      points: series.length,
      warnings,
      metrics: {
        startDate,
        endDate,
        coverageDays,
        maxGapDays,
        avgGapDays,
        duplicateRows,
        largeMovesCount,
        largeMoveThresholdPct
      }
    };
  });

  const companiesWithWarnings = companyReports.filter((c) => c.warnings.length > 0).length;

  return {
    generatedAt: new Date().toISOString(),
    targetStartDate: TARGET_START_DATE,
    summary: {
      companiesChecked: companyReports.length,
      companiesWithWarnings
    },
    companies: companyReports
  };
}

function countCompanyDuplicates(companyId, duplicateMap) {
  let duplicates = 0;
  for (const [key, count] of duplicateMap.entries()) {
    if (!key.startsWith(`${companyId}|`)) {
      continue;
    }
    if (count > 1) {
      duplicates += count - 1;
    }
  }
  return duplicates;
}
