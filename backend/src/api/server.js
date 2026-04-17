import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { URL } from "node:url";
import { API_PORT, FRONTEND_DIR } from "../config.js";
import { loadAnalytics } from "./dataStore.js";
import { filterConflicts, getCompanyCorrelation, getInsights, getTimeSeries, summarizeByInvolvement } from "./query.js";

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

const CONTENT_TYPE = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

async function serveFrontendAsset(res, relPath) {
  const safePath = relPath.replace(/^\/+/, "");
  const filePath = path.resolve(FRONTEND_DIR, safePath);

  if (!filePath.startsWith(path.resolve(FRONTEND_DIR))) {
    sendJson(res, 400, { error: "Invalid path" });
    return true;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": CONTENT_TYPE[ext] || "application/octet-stream"
    });
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

async function handleRequest(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    const served = await serveFrontendAsset(res, "index.html");
    if (!served) {
      notFound(res);
    }
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    const relPath = url.pathname.replace("/assets/", "");
    const served = await serveFrontendAsset(res, relPath);
    if (!served) {
      notFound(res);
    }
    return;
  }

  const dataset = await loadAnalytics();

  if (url.pathname === "/health") {
    sendJson(res, 200, { ok: true, generatedAt: dataset.metadata.generatedAt });
    return;
  }

  if (url.pathname === "/api/conflicts") {
    const region = url.searchParams.get("region");
    const usInvolvement = url.searchParams.get("usInvolvement");
    const results = filterConflicts(dataset, { region, usInvolvement });
    sendJson(res, 200, { total: results.length, conflicts: results });
    return;
  }

  if (url.pathname === "/api/analytics") {
    const ticker = url.searchParams.get("ticker");
    if (!ticker) {
      sendJson(res, 400, { error: "ticker query param is required" });
      return;
    }

    const company = getCompanyCorrelation(dataset, ticker);
    if (!company) {
      sendJson(res, 404, { error: "Company not found" });
      return;
    }

    sendJson(res, 200, company);
    return;
  }

  if (url.pathname === "/api/analytics/summary") {
    const ticker = url.searchParams.get("ticker");
    if (!ticker) {
      sendJson(res, 400, { error: "ticker query param is required" });
      return;
    }

    const summary = summarizeByInvolvement(dataset, ticker);
    if (!summary) {
      sendJson(res, 404, { error: "Company not found" });
      return;
    }

    sendJson(res, 200, summary);
    return;
  }

  if (url.pathname === "/api/timeseries") {
    const tickersRaw = url.searchParams.get("tickers");
    if (!tickersRaw) {
      sendJson(res, 400, { error: "tickers query param is required" });
      return;
    }

    const tickers = tickersRaw.split(",").map((t) => t.trim()).filter(Boolean);
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;
    const granularity = (url.searchParams.get("granularity") || "day").toLowerCase();
    const mode = (url.searchParams.get("mode") || "absolute").toLowerCase();

    const series = getTimeSeries(dataset, {
      tickers,
      startDate,
      endDate,
      granularity,
      mode
    });

    sendJson(res, 200, { total: series.length, series });
    return;
  }

  if (url.pathname === "/api/insights") {
    const ticker = url.searchParams.get("ticker");
    if (!ticker) {
      sendJson(res, 400, { error: "ticker query param is required" });
      return;
    }

    const region = url.searchParams.get("region") || undefined;
    const usInvolvement = url.searchParams.get("usInvolvement") || undefined;
    const limit = Number(url.searchParams.get("limit") || 6);

    const insights = getInsights(dataset, { ticker, region, usInvolvement, limit });
    if (!insights) {
      sendJson(res, 404, { error: "Company not found" });
      return;
    }

    sendJson(res, 200, insights);
    return;
  }

  if (url.pathname === "/api/metadata") {
    sendJson(res, 200, dataset.metadata);
    return;
  }

  notFound(res);
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    sendJson(res, 500, { error: err.message || "Internal server error" });
  });
});

server.listen(API_PORT, () => {
  console.log(`API listening on http://localhost:${API_PORT}`);
});
