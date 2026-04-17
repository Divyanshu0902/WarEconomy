export function toDate(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${input}`);
  }
  return d;
}

export function toISODate(input) {
  return toDate(input).toISOString().slice(0, 10);
}

export function dateDiffDays(a, b) {
  const ms = toDate(b).getTime() - toDate(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function addDays(input, days) {
  const d = toDate(input);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function inRange(date, start, end) {
  const t = toDate(date).getTime();
  return t >= toDate(start).getTime() && t <= toDate(end).getTime();
}
