export function filterConflicts(dataset, { region, usInvolvement }) {
  return dataset.conflicts.filter((conflict) => {
    const regionMatch = region ? conflict.region.toLowerCase() === region.toLowerCase() : true;
    const involvementMatch = usInvolvement
      ? conflict.usInvolvement.toLowerCase() === usInvolvement.toLowerCase()
      : true;
    return regionMatch && involvementMatch;
  });
}

export function getCompanyCorrelation(dataset, ticker) {
  return dataset.analytics.find((company) => company.ticker.toLowerCase() === ticker.toLowerCase()) || null;
}

export function summarizeByInvolvement(dataset, ticker) {
  const company = getCompanyCorrelation(dataset, ticker);
  if (!company) {
    return null;
  }

  const buckets = new Map();

  for (const row of company.conflictAnalytics) {
    const key = row.usInvolvement;
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    buckets.get(key).push(row.conflictPeriodPct);
  }

  return {
    ticker: company.ticker,
    name: company.name,
    groupedReturns: [...buckets.entries()].map(([usInvolvement, values]) => ({
      usInvolvement,
      averageConflictPeriodPct: avg(values),
      sampleSize: values.length
    }))
  };
}

export function getTimeSeries(dataset, options) {
  const {
    tickers = [],
    startDate,
    endDate,
    granularity = "day",
    mode = "absolute"
  } = options;

  const normalizedTickers = tickers.map((t) => t.toUpperCase());
  const selected = dataset.priceSeries.filter((row) => normalizedTickers.includes(row.ticker.toUpperCase()));

  const out = [];
  for (const series of selected) {
    let points = series.points;

    if (startDate) {
      points = points.filter((p) => p.date >= startDate);
    }
    if (endDate) {
      points = points.filter((p) => p.date <= endDate);
    }

    points = aggregatePoints(points, granularity);
    points = mode === "indexed" ? toIndexed(points) : points;

    out.push({
      ticker: series.ticker,
      points
    });
  }

  return out;
}

export function getInsights(dataset, options) {
  const { ticker, region, usInvolvement, limit = 6 } = options;
  const company = getCompanyCorrelation(dataset, ticker);
  if (!company) {
    return null;
  }

  let rows = company.conflictAnalytics;
  if (region) {
    rows = rows.filter((r) => r.region.toLowerCase() === region.toLowerCase());
  }
  if (usInvolvement) {
    rows = rows.filter((r) => r.usInvolvement.toLowerCase() === usInvolvement.toLowerCase());
  }

  const sortedByMagnitude = [...rows]
    .filter((r) => Number.isFinite(r.conflictPeriodPct))
    .sort((a, b) => Math.abs(b.conflictPeriodPct) - Math.abs(a.conflictPeriodPct));

  const top = sortedByMagnitude.slice(0, Math.max(1, limit));

  const cards = top.map((r) => {
    const start = getStageMetric(r, "start");
    const end = getStageMetric(r, "end");
    const progression = r.stageMetrics.filter((s) => s.stage === "progression");

    return {
      conflictId: r.conflictId,
      conflictName: r.conflictName,
      region: r.region,
      usInvolvement: r.usInvolvement,
      conflictPeriodPct: r.conflictPeriodPct,
      interpretation: buildInterpretation(r),
      stageSummary: {
        start: summarizeStage(start),
        progressionAverageStageToPostPct: r.progressionAverageStageToPostPct,
        progressionMilestones: progression.length,
        end: summarizeStage(end)
      }
    };
  });

  return {
    ticker: company.ticker,
    companyName: company.name,
    totalConflictsConsidered: rows.length,
    cards,
    comparison: buildDirectIndirectComparison(company.conflictAnalytics)
  };
}

function aggregatePoints(points, granularity) {
  if (granularity === "day") {
    return points;
  }

  const buckets = new Map();
  for (const p of points) {
    const key = bucketKey(p.date, granularity);
    buckets.set(key, p);
  }

  return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function bucketKey(dateStr, granularity) {
  const d = new Date(dateStr + "T00:00:00Z");
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");

  if (granularity === "week") {
    const week = getWeekNumber(d);
    return `${y}-W${String(week).padStart(2, "0")}`;
  }
  if (granularity === "month") {
    return `${y}-${m}`;
  }
  if (granularity === "year") {
    return String(y);
  }
  if (granularity === "decade") {
    return `${Math.floor(y / 10) * 10}s`;
  }

  return dateStr;
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function toIndexed(points) {
  if (points.length === 0) {
    return points;
  }
  const base = points[0].close;
  if (!base) {
    return points;
  }

  return points.map((p) => ({
    ...p,
    close: (p.close / base) * 100
  }));
}

function getStageMetric(row, stage) {
  return row.stageMetrics.find((m) => m.stage === stage) || null;
}

function summarizeStage(stageMetric) {
  if (!stageMetric) {
    return null;
  }
  return {
    date: stageMetric.date,
    preToStagePct: stageMetric.preToStagePct,
    stageToPostPct: stageMetric.stageToPostPct,
    preToPostPct: stageMetric.preToPostPct
  };
}

function buildInterpretation(row) {
  const pct = row.conflictPeriodPct;
  if (!Number.isFinite(pct)) {
    return "Insufficient data to estimate conflict-window return for this selection.";
  }

  if (pct >= 20) {
    return "Conflict window shows strong positive movement; interpret alongside broader market context and procurement cycles.";
  }
  if (pct >= 5) {
    return "Conflict window shows moderate positive movement; potential alignment is visible but not causal proof.";
  }
  if (pct > -5) {
    return "Conflict window appears near-flat; alignment signals are weak in this period.";
  }
  return "Conflict window shows negative movement; conflict timing alone does not explain performance.";
}

function buildDirectIndirectComparison(rows) {
  const buckets = {
    direct: [],
    indirect: []
  };

  for (const r of rows) {
    if (r.usInvolvement === "direct") {
      buckets.direct.push(r.conflictPeriodPct);
    }
    if (r.usInvolvement === "indirect") {
      buckets.indirect.push(r.conflictPeriodPct);
    }
  }

  return {
    direct: {
      sampleSize: buckets.direct.length,
      averageConflictPeriodPct: avg(buckets.direct)
    },
    indirect: {
      sampleSize: buckets.indirect.length,
      averageConflictPeriodPct: avg(buckets.indirect)
    }
  };
}

function avg(values) {
  const nums = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (nums.length === 0) {
    return null;
  }
  return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}
