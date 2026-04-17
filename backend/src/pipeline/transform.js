import { toISODate } from "../lib/dateUtils.js";

export function transformRawData(raw) {
  const companiesById = new Map(raw.companies.map((c) => [c.id, c]));

  const pricesByCompany = new Map();
  for (const price of raw.prices) {
    const normalized = {
      ...price,
      date: toISODate(price.date)
    };

    if (!pricesByCompany.has(price.companyId)) {
      pricesByCompany.set(price.companyId, []);
    }
    pricesByCompany.get(price.companyId).push(normalized);
  }

  for (const bucket of pricesByCompany.values()) {
    bucket.sort((a, b) => a.date.localeCompare(b.date));
  }

  return {
    companies: raw.companies,
    conflicts: raw.conflicts,
    companiesById,
    pricesByCompany
  };
}
