import path from "node:path";
import { IMPORT_DATA_DIR } from "../config.js";
import { readDir, readText } from "../lib/fileUtils.js";

export async function mergeImportedPrices(raw) {
  const report = {
    filesProcessed: 0,
    filesSkipped: 0,
    rowsRead: 0,
    rowsImported: 0,
    rowsRejected: 0,
    unknownTickers: 0,
    badRows: 0,
    files: []
  };

  const tickerToCompanyId = new Map(raw.companies.map((c) => [c.ticker.toUpperCase(), c.id]));

  let files = [];
  try {
    files = await readDir(IMPORT_DATA_DIR);
  } catch {
    return { prices: raw.prices, report };
  }

  const csvFiles = files.filter((f) => f.toLowerCase().endsWith(".csv"));
  if (csvFiles.length === 0) {
    return { prices: raw.prices, report };
  }

  const importedByKey = new Map();

  for (const fileName of csvFiles) {
    const fullPath = path.join(IMPORT_DATA_DIR, fileName);
    const content = await readText(fullPath);
    const parsed = parseCsv(content);

    if (!parsed.valid) {
      report.filesSkipped += 1;
      report.files.push({
        fileName,
        rowsRead: 0,
        rowsImported: 0,
        rowsRejected: 0,
        skipped: true,
        reason: parsed.reason
      });
      continue;
    }

    const rows = parsed.rows;

    const fileReport = {
      fileName,
      rowsRead: rows.length,
      rowsImported: 0,
      rowsRejected: 0
    };

    for (const row of rows) {
      report.rowsRead += 1;

      const normalized = normalizeRow(row, fileName);
      const ticker = normalized.ticker;
      const date = normalized.date;
      const close = normalized.close;
      const companyId = tickerToCompanyId.get(ticker);

      if (!companyId) {
        report.rowsRejected += 1;
        report.unknownTickers += 1;
        fileReport.rowsRejected += 1;
        continue;
      }

      if (!date || Number.isNaN(new Date(date).getTime()) || !Number.isFinite(close) || close <= 0) {
        report.rowsRejected += 1;
        report.badRows += 1;
        fileReport.rowsRejected += 1;
        continue;
      }

      const key = `${companyId}|${date}`;
      importedByKey.set(key, { companyId, date, close });
      report.rowsImported += 1;
      fileReport.rowsImported += 1;
    }

    report.filesProcessed += 1;
    report.files.push(fileReport);
  }

  const mergedByKey = new Map(raw.prices.map((p) => [`${p.companyId}|${p.date}`, p]));
  for (const [key, value] of importedByKey.entries()) {
    mergedByKey.set(key, value);
  }

  return {
    prices: [...mergedByKey.values()],
    report
  };
}

function normalizeRow(row, fileName) {
  const explicitTicker = String(row.ticker || "").toUpperCase().trim();
  const inferredTicker = inferTickerFromFileName(fileName);
  const ticker = explicitTicker || inferredTicker;

  const date = String(row.date || row.Date || "").trim();
  const closeRaw = row.close ?? row.Close ?? row.adj_close ?? row["Adj Close"] ?? "";
  const close = Number(closeRaw);

  return { ticker, date, close };
}

function inferTickerFromFileName(fileName) {
  const base = fileName.replace(/\.csv$/i, "");
  const token = base.split(/[_\-.]/)[0] || "";
  return token.toUpperCase();
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { valid: false, rows: [], reason: "No data rows" };
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  const hasTickerDateClose = headers.includes("ticker") && headers.includes("date") && headers.includes("close");
  const hasDateCloseOnly = headers.includes("date") && (headers.includes("close") || headers.includes("adj close"));

  if (!hasTickerDateClose && !hasDateCloseOnly) {
    return { valid: false, rows: [], reason: "Unrecognized CSV header format" };
  }

  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = cols[j] ?? "";
    }
    rows.push(row);
  }

  return { valid: true, rows, reason: null };
}

function splitCsvLine(line) {
  const out = [];
  let curr = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(curr.trim());
      curr = "";
      continue;
    }
    curr += ch;
  }
  out.push(curr.trim());
  return out;
}
