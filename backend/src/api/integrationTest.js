import { spawn } from "node:child_process";

function fetchJson(url) {
  return fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}) for ${url}`);
    }
    return res.json();
  });
}

async function run() {
  const server = spawn(process.execPath, ["backend/src/api/server.js"], {
    stdio: "inherit",
    shell: false
  });

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const health = await fetchJson("http://localhost:8080/health");
    const conflicts = await fetchJson("http://localhost:8080/api/conflicts?usInvolvement=direct");
    const analytics = await fetchJson("http://localhost:8080/api/analytics?ticker=LMT");
    const summary = await fetchJson("http://localhost:8080/api/analytics/summary?ticker=LMT");

    console.log("Integration checks passed.");
    console.log({
      health,
      directConflictCount: conflicts.total,
      lmtConflicts: analytics.conflictAnalytics.length,
      groupedSummaryBuckets: summary.groupedReturns.length
    });
  } finally {
    server.kill("SIGTERM");
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
