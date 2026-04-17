import { toDate } from "./lib/dateUtils.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertString(v, label) {
  assert(typeof v === "string" && v.trim().length > 0, `${label} must be a non-empty string`);
}

function assertNumber(v, label) {
  assert(typeof v === "number" && Number.isFinite(v), `${label} must be a finite number`);
}

export function validateRawData(raw) {
  assert(Array.isArray(raw.companies), "companies must be an array");
  assert(Array.isArray(raw.prices), "prices must be an array");
  assert(Array.isArray(raw.conflicts), "conflicts must be an array");

  for (const c of raw.companies) {
    assertString(c.id, "company.id");
    assertString(c.ticker, "company.ticker");
    assertString(c.name, "company.name");
    assertString(c.sector, "company.sector");
  }

  for (const p of raw.prices) {
    assertString(p.companyId, "price.companyId");
    assertString(p.date, "price.date");
    toDate(p.date);
    assertNumber(p.close, "price.close");
  }

  const validInvolvement = new Set(["direct", "indirect", "coalition", "advisory", "proxy"]);
  const validStages = new Set(["start", "progression", "end"]);

  for (const conflict of raw.conflicts) {
    assertString(conflict.id, "conflict.id");
    assertString(conflict.name, "conflict.name");
    assertString(conflict.region, "conflict.region");
    assert(validInvolvement.has(conflict.usInvolvement), "conflict.usInvolvement is invalid");
    assertString(conflict.startDate, "conflict.startDate");
    toDate(conflict.startDate);
    if (conflict.endDate) {
      toDate(conflict.endDate);
    }

    assert(Array.isArray(conflict.milestones), "conflict.milestones must be an array");
    for (const m of conflict.milestones) {
      assert(validStages.has(m.stage), "milestone.stage is invalid");
      assertString(m.date, "milestone.date");
      toDate(m.date);
      assertString(m.label, "milestone.label");
    }
  }
}
