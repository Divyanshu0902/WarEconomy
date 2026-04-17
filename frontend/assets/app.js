const API_BASE = "";
const STATIC_DATA_PATH_CANDIDATES = [
  "data/analytics.json",
  "../data/processed/analytics.json",
  "/data/processed/analytics.json",
  "/dist/static/data/analytics.json"
];

const PRESETS = ["7D", "1M", "6M", "1Y", "5Y", "10Y", "ALL"];
const COMPANY_COLORS = {
  LMT: "#8e2f1f",
  RTX: "#385d9e",
  NOC: "#4a7f47",
  GD: "#ab5f16",
  HII: "#6f4d95"
};

const state = {
  companies: [],
  selectedTickers: new Set(),
  conflicts: [],
  preset: "10Y",
  metadata: null,
  legendExpanded: false
};

let chart;
let applyButtonLabel = "Apply Filters";
let runtimeMode = "api";
let staticDatasetPromise;

async function fetchJson(path) {
  if (runtimeMode === "static") {
    return queryStaticEndpoint(path);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}) for ${path}`);
    }
    return res.json();
  } catch (error) {
    if (!path.startsWith("/api/") && path !== "/health") {
      throw error;
    }
    runtimeMode = "static";
    announce("Switched to static data mode");
    return queryStaticEndpoint(path);
  }
}

async function loadStaticDataset() {
  if (!staticDatasetPromise) {
    staticDatasetPromise = loadFirstAvailableStaticDataset();
  }
  return staticDatasetPromise;
}

async function loadFirstAvailableStaticDataset() {
  let lastError = "";

  for (const path of STATIC_DATA_PATH_CANDIDATES) {
    try {
      const res = await fetch(path);
      if (!res.ok) {
        lastError = `HTTP ${res.status} at ${path}`;
        continue;
      }

      const json = await res.json();
      return json;
    } catch (error) {
      lastError = error?.message || String(error);
    }
  }

  throw new Error(
    `Static dataset missing. Tried: ${STATIC_DATA_PATH_CANDIDATES.join(", ")}. Last error: ${lastError || "unknown"}`
  );
}

async function queryStaticEndpoint(path) {
  const dataset = await loadStaticDataset();
  const parsed = new URL(path, "https://local.invalid");

  if (parsed.pathname === "/health") {
    return { ok: true, generatedAt: dataset.metadata?.generatedAt || null, mode: "static" };
  }

  if (parsed.pathname === "/api/metadata") {
    return {
      ...dataset.metadata,
      runtimeMode: "static"
    };
  }

  if (parsed.pathname === "/api/conflicts") {
    const region = parsed.searchParams.get("region");
    const usInvolvement = parsed.searchParams.get("usInvolvement");
    const conflicts = filterConflictsStatic(dataset, { region, usInvolvement });
    return { total: conflicts.length, conflicts };
  }

  if (parsed.pathname === "/api/analytics") {
    const ticker = parsed.searchParams.get("ticker");
    const company = getCompanyCorrelationStatic(dataset, ticker || "");
    if (!company) {
      throw new Error(`Company not found for ticker ${ticker || "n/a"}`);
    }
    return company;
  }

  if (parsed.pathname === "/api/analytics/summary") {
    const ticker = parsed.searchParams.get("ticker");
    const summary = summarizeByInvolvementStatic(dataset, ticker || "");
    if (!summary) {
      throw new Error(`Company not found for ticker ${ticker || "n/a"}`);
    }
    return summary;
  }

  if (parsed.pathname === "/api/timeseries") {
    const tickersRaw = parsed.searchParams.get("tickers") || "";
    const tickers = tickersRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const series = getTimeSeriesStatic(dataset, {
      tickers,
      startDate: parsed.searchParams.get("startDate") || undefined,
      endDate: parsed.searchParams.get("endDate") || undefined,
      granularity: (parsed.searchParams.get("granularity") || "day").toLowerCase(),
      mode: (parsed.searchParams.get("mode") || "absolute").toLowerCase()
    });
    return { total: series.length, series };
  }

  if (parsed.pathname === "/api/insights") {
    const ticker = parsed.searchParams.get("ticker") || "";
    const limit = Number(parsed.searchParams.get("limit") || 6);
    const insights = getInsightsStatic(dataset, {
      ticker,
      region: parsed.searchParams.get("region") || undefined,
      usInvolvement: parsed.searchParams.get("usInvolvement") || undefined,
      limit
    });
    if (!insights) {
      throw new Error(`Company not found for ticker ${ticker || "n/a"}`);
    }
    return insights;
  }

  throw new Error(`Unsupported static endpoint: ${parsed.pathname}`);
}

function filterConflictsStatic(dataset, { region, usInvolvement }) {
  return dataset.conflicts.filter((conflict) => {
    const regionMatch = region ? conflict.region.toLowerCase() === region.toLowerCase() : true;
    const involvementMatch = usInvolvement
      ? conflict.usInvolvement.toLowerCase() === usInvolvement.toLowerCase()
      : true;
    return regionMatch && involvementMatch;
  });
}

function getCompanyCorrelationStatic(dataset, ticker) {
  return dataset.analytics.find((company) => company.ticker.toLowerCase() === ticker.toLowerCase()) || null;
}

function summarizeByInvolvementStatic(dataset, ticker) {
  const company = getCompanyCorrelationStatic(dataset, ticker);
  if (!company) {
    return null;
  }

  const buckets = new Map();
  for (const row of company.conflictAnalytics) {
    if (!buckets.has(row.usInvolvement)) {
      buckets.set(row.usInvolvement, []);
    }
    buckets.get(row.usInvolvement).push(row.conflictPeriodPct);
  }

  return {
    ticker: company.ticker,
    name: company.name,
    groupedReturns: [...buckets.entries()].map(([usInvolvement, values]) => ({
      usInvolvement,
      averageConflictPeriodPct: averageStatic(values),
      sampleSize: values.length
    }))
  };
}

function getTimeSeriesStatic(dataset, options) {
  const {
    tickers = [],
    startDate,
    endDate,
    granularity = "day",
    mode = "absolute"
  } = options;

  const normalizedTickers = tickers.map((t) => t.toUpperCase());
  const selected = dataset.priceSeries.filter((row) => normalizedTickers.includes(row.ticker.toUpperCase()));

  return selected.map((series) => {
    let points = series.points;
    if (startDate) {
      points = points.filter((p) => p.date >= startDate);
    }
    if (endDate) {
      points = points.filter((p) => p.date <= endDate);
    }

    points = aggregatePointsStatic(points, granularity);
    points = mode === "indexed" ? toIndexedStatic(points) : points;

    return {
      ticker: series.ticker,
      points
    };
  });
}

function getInsightsStatic(dataset, options) {
  const { ticker, region, usInvolvement, limit = 6 } = options;
  const company = getCompanyCorrelationStatic(dataset, ticker);
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

  const top = [...rows]
    .filter((r) => Number.isFinite(r.conflictPeriodPct))
    .sort((a, b) => Math.abs(b.conflictPeriodPct) - Math.abs(a.conflictPeriodPct))
    .slice(0, Math.max(1, limit));

  const cards = top.map((r) => {
    const start = getStageMetricStatic(r, "start");
    const end = getStageMetricStatic(r, "end");
    const progression = r.stageMetrics.filter((s) => s.stage === "progression");

    return {
      conflictId: r.conflictId,
      conflictName: r.conflictName,
      region: r.region,
      usInvolvement: r.usInvolvement,
      conflictPeriodPct: r.conflictPeriodPct,
      interpretation: buildInterpretationStatic(r),
      stageSummary: {
        start: summarizeStageStatic(start),
        progressionAverageStageToPostPct: r.progressionAverageStageToPostPct,
        progressionMilestones: progression.length,
        end: summarizeStageStatic(end)
      }
    };
  });

  return {
    ticker: company.ticker,
    companyName: company.name,
    totalConflictsConsidered: rows.length,
    cards,
    comparison: buildDirectIndirectComparisonStatic(company.conflictAnalytics)
  };
}

function aggregatePointsStatic(points, granularity) {
  if (granularity === "day") {
    return points;
  }

  const buckets = new Map();
  for (const p of points) {
    const key = bucketKeyStatic(p.date, granularity);
    buckets.set(key, p);
  }

  return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function bucketKeyStatic(dateStr, granularity) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");

  if (granularity === "week") {
    const week = getWeekNumberStatic(d);
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

function getWeekNumberStatic(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function toIndexedStatic(points) {
  if (!points.length) {
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

function getStageMetricStatic(row, stage) {
  return row.stageMetrics.find((m) => m.stage === stage) || null;
}

function summarizeStageStatic(metric) {
  if (!metric) {
    return null;
  }
  return {
    date: metric.date,
    preToStagePct: metric.preToStagePct,
    stageToPostPct: metric.stageToPostPct,
    preToPostPct: metric.preToPostPct
  };
}

function buildInterpretationStatic(row) {
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

function buildDirectIndirectComparisonStatic(rows) {
  const buckets = { direct: [], indirect: [] };
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
      averageConflictPeriodPct: averageStatic(buckets.direct)
    },
    indirect: {
      sampleSize: buckets.indirect.length,
      averageConflictPeriodPct: averageStatic(buckets.indirect)
    }
  };
}

function averageStatic(values) {
  const nums = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (!nums.length) {
    return null;
  }
  return nums.reduce((acc, n) => acc + n, 0) / nums.length;
}

function show(id, payload) {
  document.getElementById(id).textContent = JSON.stringify(payload, null, 2);
}

function announce(message) {
  const live = document.getElementById("liveStatus");
  if (!live) {
    return;
  }
  live.textContent = "";
  window.requestAnimationFrame(() => {
    live.textContent = message;
  });
}

async function init() {
  chart = echarts.init(document.getElementById("chart"));
  const applyBtn = document.getElementById("applyBtn");
  if (applyBtn) {
    applyButtonLabel = applyBtn.textContent || applyButtonLabel;
  }

  const base = await fetchJson("/api/metadata");
  state.metadata = base;
  state.companies = ["LMT", "RTX", "NOC", "GD", "HII"];
  state.companies.forEach((t) => state.selectedTickers.add(t));

  renderCompanyChips();
  renderPresetButtons();

  const allConflicts = await fetchJson("/api/conflicts");
  state.conflicts = allConflicts.conflicts || [];
  fillRegionFilter(state.conflicts);
  renderLegend(state.conflicts);

  show("snapshot", {
    metadata: base,
    note: "Use controls and Apply Filters to refresh chart and correlation snapshots.",
    runtimeMode
  });
  renderProvenance(base);

  wireEvents();
  applyPreset("10Y");
  await refreshDashboard();
}

function setLoading(isLoading) {
  const chartEl = document.getElementById("chart");
  const applyBtn = document.getElementById("applyBtn");
  const loadingRegions = [
    document.getElementById("insightCards"),
    document.getElementById("comparison"),
    document.getElementById("provenance"),
    document.getElementById("snapshot"),
    document.getElementById("legend")
  ].filter(Boolean);

  document.body.classList.toggle("is-loading", isLoading);
  if (chartEl) {
    chartEl.classList.toggle("shimmer", isLoading);
    chartEl.setAttribute("aria-busy", String(isLoading));
  }

  for (const region of loadingRegions) {
    region.setAttribute("aria-busy", String(isLoading));
  }

  if (applyBtn) {
    applyBtn.disabled = isLoading;
    applyBtn.textContent = isLoading ? "Loading..." : applyButtonLabel;
  }

  announce(isLoading ? "Loading updated dashboard data" : "Dashboard update complete");
}

function wireEvents() {
  document.getElementById("applyBtn").addEventListener("click", () => {
    refreshDashboard().catch((err) => showError(err));
  });

  const legendToggle = document.getElementById("legendToggle");
  if (legendToggle) {
    legendToggle.addEventListener("click", () => {
      state.legendExpanded = !state.legendExpanded;
      renderLegend(state.conflicts);
      announce(state.legendExpanded ? "Expanded legend items" : "Collapsed legend items");
    });
  }

  window.addEventListener("resize", () => {
    renderLegend(state.conflicts);
    if (chart) {
      chart.resize();
    }
  });
}

function renderCompanyChips() {
  const el = document.getElementById("companyList");
  el.innerHTML = "";

  for (const ticker of state.companies) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `chip ${state.selectedTickers.has(ticker) ? "active" : ""}`;
    chip.textContent = ticker;
    chip.setAttribute("aria-pressed", String(state.selectedTickers.has(ticker)));
    chip.setAttribute("aria-label", `Toggle company ${ticker}`);
    chip.addEventListener("click", () => {
      if (state.selectedTickers.has(ticker)) {
        state.selectedTickers.delete(ticker);
      } else {
        state.selectedTickers.add(ticker);
      }
      renderCompanyChips();
      announce(`Selected companies: ${[...state.selectedTickers].join(", ") || "none"}`);
    });
    el.appendChild(chip);
  }
}

function renderPresetButtons() {
  const el = document.getElementById("presets");
  el.innerHTML = "";

  for (const p of PRESETS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `preset ${p === state.preset ? "active" : ""}`;
    btn.textContent = p;
    btn.setAttribute("aria-pressed", String(p === state.preset));
    btn.setAttribute("aria-label", `Set time preset ${p}`);
    btn.addEventListener("click", () => {
      applyPreset(p);
      refreshDashboard().catch((err) => showError(err));
    });
    el.appendChild(btn);
  }
}

function applyPreset(preset) {
  state.preset = preset;
  renderPresetButtons();

  const end = new Date();
  const start = new Date(end);

  if (preset === "7D") start.setUTCDate(end.getUTCDate() - 7);
  if (preset === "1M") start.setUTCMonth(end.getUTCMonth() - 1);
  if (preset === "6M") start.setUTCMonth(end.getUTCMonth() - 6);
  if (preset === "1Y") start.setUTCFullYear(end.getUTCFullYear() - 1);
  if (preset === "5Y") start.setUTCFullYear(end.getUTCFullYear() - 5);
  if (preset === "10Y") start.setUTCFullYear(end.getUTCFullYear() - 10);
  if (preset === "ALL") start.setUTCFullYear(1970);

  document.getElementById("startDate").value = toIsoDate(start);
  document.getElementById("endDate").value = toIsoDate(end);
}

function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}

function fillRegionFilter(conflicts) {
  const regionEl = document.getElementById("region");
  const regions = [...new Set(conflicts.map((c) => c.region))].sort();
  for (const region of regions) {
    const opt = document.createElement("option");
    opt.value = region;
    opt.textContent = region;
    regionEl.appendChild(opt);
  }
}

function renderLegend(conflicts) {
  const legend = document.getElementById("legend");
  const summary = document.getElementById("legendSummary");
  const toggle = document.getElementById("legendToggle");
  legend.innerHTML = "";

  if (summary) {
    summary.innerHTML = "";
    const total = conflicts.length;
    const directCount = conflicts.filter((c) => c.usInvolvement === "direct").length;
    const indirectCount = conflicts.filter((c) => c.usInvolvement === "indirect").length;
    const chips = [
      `Total ${total}`,
      `Direct ${directCount}`,
      `Indirect ${indirectCount}`
    ];

    for (const text of chips) {
      const chip = document.createElement("span");
      chip.className = "legend-summary-chip";
      chip.textContent = text;
      summary.appendChild(chip);
    }
  }

  const collapseLimit = window.innerWidth <= 760 ? 5 : 8;
  const needsToggle = conflicts.length > collapseLimit;

  if (toggle) {
    toggle.style.display = needsToggle ? "inline-flex" : "none";
    toggle.textContent = state.legendExpanded ? "Show Fewer" : "Show More";
    toggle.setAttribute("aria-expanded", String(state.legendExpanded));
  }

  for (const [index, c] of conflicts.entries()) {
    const item = document.createElement("div");
    item.className = "legend-item";
    if (needsToggle && index >= collapseLimit) {
      item.classList.add("extra");
      if (state.legendExpanded) {
        item.classList.add("show");
      }
    }

    const end = c.endDate || "ongoing";
    item.textContent = `${c.name} | ${c.usInvolvement} | ${c.startDate} -> ${end}`;
    legend.appendChild(item);
  }
}

function renderActiveFilters({ tickers, mode, granularity, startDate, endDate, involvement, region }) {
  const root = document.getElementById("activeFilters");
  if (!root) {
    return;
  }

  const pills = [
    `Companies ${tickers.join("/")}`,
    `Mode ${mode}`,
    `Grain ${granularity}`,
    `Range ${startDate} to ${endDate}`,
    `US ${involvement || "all"}`,
    `Region ${region || "all"}`
  ];

  root.innerHTML = "";
  for (const text of pills) {
    const pill = document.createElement("span");
    pill.className = "active-filter-pill";
    pill.textContent = text;
    root.appendChild(pill);
  }
}

async function refreshDashboard() {
  const tickers = [...state.selectedTickers];
  if (tickers.length === 0) {
    show("snapshot", { warning: "Select at least one company." });
    return;
  }

  const mode = document.getElementById("mode").value;
  const granularity = document.getElementById("granularity").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const involvement = document.getElementById("involvement").value;
  const region = document.getElementById("region").value;

  const conflictQuery = new URLSearchParams();
  if (involvement) conflictQuery.set("usInvolvement", involvement);
  if (region) conflictQuery.set("region", region);

  const timeQuery = new URLSearchParams({
    tickers: tickers.join(","),
    mode,
    granularity,
    startDate,
    endDate
  });

  setLoading(true);
  try {
    const [seriesRes, conflictsRes, summaryRes, insightsRes] = await Promise.all([
      fetchJson(`/api/timeseries?${timeQuery.toString()}`),
      fetchJson(`/api/conflicts?${conflictQuery.toString()}`),
      fetchJson(`/api/analytics/summary?ticker=${encodeURIComponent(tickers[0])}`),
      fetchJson(`/api/insights?ticker=${encodeURIComponent(tickers[0])}&${conflictQuery.toString()}`)
    ]);

    state.conflicts = conflictsRes.conflicts || [];
    renderLegend(state.conflicts);
    renderActiveFilters({ tickers, mode, granularity, startDate, endDate, involvement, region });
    renderChart(seriesRes.series || [], state.conflicts, { mode });
    renderInsightCards(insightsRes.cards || []);
    renderComparison(insightsRes.comparison || null);

    show("snapshot", {
      selectedTickers: tickers,
      mode,
      granularity,
      range: { startDate, endDate },
      conflictCount: state.conflicts.length,
      summaryForPrimaryTicker: summaryRes,
      insightCardCount: (insightsRes.cards || []).length,
      runtimeMode
    });
  } finally {
    setLoading(false);
  }
}

function renderChart(seriesRows, conflicts, options) {
  const lineSeries = seriesRows.map((s) => ({
    type: "line",
    name: s.ticker,
    showSymbol: false,
    smooth: false,
    lineStyle: { width: 2, color: COMPANY_COLORS[s.ticker] || undefined },
    itemStyle: { color: COMPANY_COLORS[s.ticker] || undefined },
    data: s.points.map((p) => [p.date, p.close])
  }));

  const first = lineSeries[0];
  if (first) {
    first.markArea = {
      itemStyle: { color: "rgba(201, 147, 58, 0.08)" },
      data: conflicts.map((c) => [
        { name: c.name, xAxis: c.startDate },
        { xAxis: c.endDate || new Date().toISOString().slice(0, 10) }
      ])
    };

    first.markLine = {
      symbol: ["none", "none"],
      lineStyle: { type: "dashed", color: "rgba(201, 147, 58, 0.55)", width: 1 },
      label: { show: false },
      data: conflicts.flatMap((c) => (c.milestones || []).map((m) => ({ xAxis: m.date })) )
    };
  }

  chart.setOption({
    animationDuration: 500,
    textStyle: {
      color: "#fafaf8"
    },
    tooltip: {
      trigger: "axis",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      backgroundColor: "rgba(10, 11, 15, 0.94)",
      textStyle: {
        color: "#f5f0e8"
      }
    },
    legend: {
      top: 8,
      textStyle: {
        color: "#8b8fa8"
      }
    },
    grid: {
      left: 55,
      right: 18,
      top: 40,
      bottom: 60
    },
    xAxis: {
      type: "time",
      axisLine: {
        lineStyle: { color: "rgba(255,255,255,0.2)" }
      },
      axisLabel: {
        color: "#8b8fa8"
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.05)"
        }
      }
    },
    yAxis: {
      type: "value",
      name: options.mode === "indexed" ? "Indexed (Base=100)" : "Price",
      nameTextStyle: {
        color: "#8b8fa8"
      },
      axisLine: {
        lineStyle: { color: "rgba(255,255,255,0.2)" }
      },
      axisLabel: {
        color: "#8b8fa8"
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255,255,255,0.05)"
        }
      }
    },
    dataZoom: [
      { type: "inside" },
      {
        type: "slider",
        bottom: 15,
        borderColor: "rgba(255,255,255,0.08)",
        fillerColor: "rgba(201,147,58,0.17)",
        backgroundColor: "rgba(255,255,255,0.03)",
        textStyle: { color: "#8b8fa8" },
        handleStyle: {
          color: "#c9933a",
          borderColor: "#c9933a"
        }
      }
    ],
    series: lineSeries
  });
}

function showError(err) {
  show("snapshot", { error: err.message || String(err) });
  announce(`Error: ${err.message || String(err)}`);
}

function renderInsightCards(cards) {
  const root = document.getElementById("insightCards");
  root.innerHTML = "";

  if (!cards.length) {
    root.textContent = "No insight cards for the current filter set.";
    return;
  }

  for (const card of cards) {
    const el = document.createElement("article");
    el.className = "card";

    const pct = formatPct(card.conflictPeriodPct);
    const directness = card.usInvolvement;

    el.innerHTML = `
      <h3>${escapeHtml(card.conflictName)}</h3>
      <p><strong>Region:</strong> ${escapeHtml(card.region)} | <strong>US involvement:</strong> ${escapeHtml(directness)}</p>
      <p><strong>Conflict-window return:</strong> ${pct}</p>
      <p>${escapeHtml(card.interpretation)}</p>
      <div class="metric-row">
        <span class="pill">Start pre->stage: ${formatPct(card.stageSummary?.start?.preToStagePct)}</span>
        <span class="pill">Start stage->post: ${formatPct(card.stageSummary?.start?.stageToPostPct)}</span>
        <span class="pill">Progression avg: ${formatPct(card.stageSummary?.progressionAverageStageToPostPct)}</span>
        <span class="pill">End stage->post: ${formatPct(card.stageSummary?.end?.stageToPostPct)}</span>
      </div>
    `;

    root.appendChild(el);
  }
}

function renderComparison(comparison) {
  const root = document.getElementById("comparison");
  root.innerHTML = "";

  if (!comparison) {
    root.textContent = "Comparison unavailable for current selection.";
    return;
  }

  root.appendChild(buildComparisonTile("Direct", comparison.direct));
  root.appendChild(buildComparisonTile("Indirect", comparison.indirect));
}

function buildComparisonTile(label, data) {
  const el = document.createElement("section");
  el.className = "comparison-tile";
  el.innerHTML = `
    <h3>${escapeHtml(label)} US Involvement</h3>
    <p><strong>Sample size:</strong> ${Number(data?.sampleSize || 0)}</p>
    <p><strong>Average conflict-window return:</strong> ${formatPct(data?.averageConflictPeriodPct)}</p>
  `;
  return el;
}

function renderProvenance(metadata) {
  const root = document.getElementById("provenance");
  root.innerHTML = "";

  const importSummary = metadata?.importSummary || {};
  const qualitySummary = metadata?.qualitySummary || {};

  root.appendChild(buildProvenanceBlock("Dataset generation", [
    `Generated at: ${metadata?.generatedAt || "n/a"}`,
    `Title: ${metadata?.title || "n/a"}`,
    `Focus: ${metadata?.focus || "n/a"}`
  ]));

  root.appendChild(buildProvenanceBlock("Import diagnostics", [
    `Files processed: ${importSummary.filesProcessed ?? 0}`,
    `Files skipped: ${importSummary.filesSkipped ?? 0}`,
    `Rows imported: ${importSummary.rowsImported ?? 0}`,
    `Rows rejected: ${importSummary.rowsRejected ?? 0}`
  ]));

  root.appendChild(buildProvenanceBlock("Known limitations", [
    "Correlation signals do not establish causality.",
    "Conflict date boundaries can vary across historical sources.",
    `Companies with quality warnings: ${qualitySummary.companiesWithWarnings ?? "n/a"}`,
    "Milestone A blocker remains documented separately for publication readiness."
  ]));
}

function buildProvenanceBlock(title, lines) {
  const el = document.createElement("section");
  el.className = "provenance-block";
  const items = lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  el.innerHTML = `<strong>${escapeHtml(title)}</strong><ul>${items}</ul>`;
  return el;
}

function formatPct(value) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  return `${value.toFixed(2)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

init().catch((err) => showError(err));
