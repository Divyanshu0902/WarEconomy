import { spawn } from "node:child_process";
import net from "node:net";

function fetchJson(url) {
  return fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}) for ${url}`);
    }
    return res.json();
  });
}

async function run() {
  const port = await findFreePort();
  const server = spawn(process.execPath, ["backend/src/api/server.js"], {
    env: {
      ...process.env,
      PORT: String(port)
    },
    stdio: "inherit",
    shell: false
  });

  try {
    await waitForServer(port, 10000);

    const health = await fetchJson(`http://localhost:${port}/health`);
    const conflicts = await fetchJson(`http://localhost:${port}/api/conflicts?usInvolvement=direct`);
    const analytics = await fetchJson(`http://localhost:${port}/api/analytics?ticker=LMT`);
    const summary = await fetchJson(`http://localhost:${port}/api/analytics/summary?ticker=LMT`);

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

function waitForServer(port, timeoutMs) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = async () => {
      try {
        await fetchJson(`http://localhost:${port}/health`);
        resolve();
      } catch (error) {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server did not become ready on port ${port}`));
          return;
        }
        setTimeout(attempt, 200);
      }
    };

    attempt();
  });
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();
    tester.once("error", reject);
    tester.listen(0, () => {
      const address = tester.address();
      if (!address || typeof address === "string") {
        tester.close(() => reject(new Error("Unable to determine free port")));
        return;
      }
      const port = address.port;
      tester.close(() => resolve(port));
    });
  });
}

run().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
