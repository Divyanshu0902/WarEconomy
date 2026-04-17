# War Economy (Backend-First MVP)

This project is currently implemented with a backend-first approach so the data pipeline and analytics operations are verified before UI design.

## What is implemented now

- JavaScript-only codebase
- Raw data ingestion from `data/raw/*.json`
- Optional CSV imports from `data/import/*.csv`
- Schema validation for companies, price points, conflicts, and milestones
- Correlation-focused analytics around conflict lifecycle stages:
  - start
  - progression
  - end
- US involvement classification support:
  - direct
  - indirect
  - coalition
  - advisory
  - proxy
- Processed dataset output at `data/processed/analytics.json`
- Data quality report output at `data/processed/quality-report.json`
- HTTP API for querying conflicts and company analytics
- Full frontend dashboard served by backend for timeline correlation exploration

## Quick start

1. Build analytics dataset:

   ```bash
   npm run pipeline
   ```

2. (Optional) Add historical CSV files into `data/import/` before running pipeline.

3. Build quality report (same pipeline command, explicit alias):

   ```bash
   npm run quality
   ```

4. Start backend API (also serves minimal frontend harness):

   ```bash
   npm run start:api
   ```

5. Open in browser:

   - `http://localhost:8080/` (minimal frontend harness)
   - `http://localhost:8080/health`

6. Run integration checks:

   ```bash
   npm run test:integration
   ```

## API endpoints

- `GET /health`
- `GET /api/metadata`
- `GET /api/conflicts?region=...&usInvolvement=...`
- `GET /api/analytics?ticker=LMT`
- `GET /api/analytics/summary?ticker=LMT`
- `GET /api/timeseries?tickers=LMT,RTX&startDate=...&endDate=...&granularity=month&mode=indexed`
- `GET /api/insights?ticker=LMT&region=...&usInvolvement=...&limit=6`

## Data contract

### Raw input files

- `data/raw/companies.json`
- `data/raw/prices.json`
- `data/raw/conflicts.json`

### Processed output file

- `data/processed/analytics.json`
- `data/processed/quality-report.json`

## Import workflow

1. Follow schema in `data/import/README.md`.
2. Add one or more CSV files with columns: `ticker,date,close`.
3. Run `npm run pipeline`.
4. Confirm merged output in `data/processed/analytics.json` and warnings in `data/processed/quality-report.json`.

## Quality gate workflow

1. Build latest report:

   ```bash
   npm run pipeline
   ```

2. Run quality gate:

   ```bash
   npm run quality:gate
   ```

3. Optional threshold overrides:
   - `MAX_ALLOWED_GAP_DAYS=120`
   - `TARGET_START_DATE=1970-01-01`
   - `ALLOW_COVERAGE_AFTER_TARGET=true`

## Current limitation

Seed data is curated sample data for backend validation. It is not yet the full 1970-present production-grade dataset. The pipeline and schema are designed so this can be expanded safely.

## Next phase

After backend design and operations are finalized, we can build the full chart UI and presentation layer on top of these validated endpoints.
