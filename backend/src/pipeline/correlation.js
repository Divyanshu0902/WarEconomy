import { addDays, inRange } from "../lib/dateUtils.js";

function getNearestPriceOnOrBefore(series, date) {
  let best = null;
  for (const point of series) {
    if (point.date <= date) {
      best = point;
    } else {
      break;
    }
  }
  return best;
}

function getNearestPriceOnOrAfter(series, date) {
  for (const point of series) {
    if (point.date >= date) {
      return point;
    }
  }
  return null;
}

function pctChange(from, to) {
  if (!from || !to || from.close === 0) {
    return null;
  }
  return ((to.close - from.close) / from.close) * 100;
}

function stageReturn(series, stageDate, windowDays = 30) {
  const before = getNearestPriceOnOrBefore(series, addDays(stageDate, -windowDays));
  const atOrAfter = getNearestPriceOnOrAfter(series, stageDate);
  const after = getNearestPriceOnOrAfter(series, addDays(stageDate, windowDays));

  return {
    windowDays,
    stageDate,
    preToStagePct: pctChange(before, atOrAfter),
    stageToPostPct: pctChange(atOrAfter, after),
    preToPostPct: pctChange(before, after)
  };
}

function conflictWindowReturn(series, startDate, endDate) {
  const atStart = getNearestPriceOnOrAfter(series, startDate);
  const atEnd = getNearestPriceOnOrBefore(series, endDate);
  return pctChange(atStart, atEnd);
}

function buildConflictMilestones(conflict) {
  const milestones = [...conflict.milestones].sort((a, b) => a.date.localeCompare(b.date));
  const hasStart = milestones.some((m) => m.stage === "start");
  const hasEnd = milestones.some((m) => m.stage === "end");

  if (!hasStart) {
    milestones.unshift({
      stage: "start",
      date: conflict.startDate,
      label: "Conflict start"
    });
  }

  if (!hasEnd && conflict.endDate) {
    milestones.push({
      stage: "end",
      date: conflict.endDate,
      label: "Conflict end"
    });
  }

  return milestones;
}

export function computeCorrelationAnalytics(model, options = {}) {
  const stageWindowDays = options.stageWindowDays || 30;

  const companyAnalytics = [];

  for (const company of model.companies) {
    const series = model.pricesByCompany.get(company.id) || [];
    if (series.length === 0) {
      continue;
    }

    const perConflict = model.conflicts.map((conflict) => {
      const milestones = buildConflictMilestones(conflict);
      const conflictEnd = conflict.endDate || series[series.length - 1].date;

      const stageMetrics = milestones.map((milestone) => ({
        stage: milestone.stage,
        label: milestone.label,
        date: milestone.date,
        ...stageReturn(series, milestone.date, stageWindowDays)
      }));

      const progressionAverage = average(
        stageMetrics
          .filter((m) => m.stage === "progression")
          .map((m) => m.stageToPostPct)
      );

      const conflictPeriodPct = conflictWindowReturn(series, conflict.startDate, conflictEnd);

      const pointsDuringConflict = series.filter((p) => inRange(p.date, conflict.startDate, conflictEnd)).length;

      return {
        conflictId: conflict.id,
        conflictName: conflict.name,
        region: conflict.region,
        usInvolvement: conflict.usInvolvement,
        conflictStartDate: conflict.startDate,
        conflictEndDate: conflict.endDate,
        conflictPeriodPct,
        progressionAverageStageToPostPct: progressionAverage,
        pointsDuringConflict,
        stageMetrics
      };
    });

    companyAnalytics.push({
      companyId: company.id,
      ticker: company.ticker,
      name: company.name,
      sector: company.sector,
      conflictAnalytics: perConflict
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    assumptions: {
      stageWindowDays,
      note: "Metrics are correlation-oriented event-window returns. They do not establish causality."
    },
    companyAnalytics
  };
}

function average(values) {
  const nums = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (nums.length === 0) {
    return null;
  }
  const sum = nums.reduce((acc, v) => acc + v, 0);
  return sum / nums.length;
}
