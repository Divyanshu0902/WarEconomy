# War Economy Dashboard

War Economy is a conflict-lifecycle correlation dashboard for exploring how defense company price movement aligns with conflict start/progression/end milestones.

## Project status

1. Milestone C (dashboard core): complete
2. Milestone D (interpretation layer): complete
3. Milestone E (UI polish): complete
4. Milestone F (deployment wrap-up): complete
5. Milestone A (real historical continuity): deferred and tracked in `MILESTONE_A_BLOCKER_LOG.md`

## Features

- Data pipeline and schema validation
- Correlation analytics around conflict lifecycle stages
- API mode (backend + frontend)
- Static mode (frontend fallback using exported `analytics.json`)
- Responsive polished dashboard with:
  - company controls
  - overlay legend + density toggle
  - interpretation cards
  - direct-vs-indirect comparison
  - provenance and caution framing

## Quick start (API mode)

1. Build analytics dataset:

   ```bash
   npm run pipeline
   ```

2. Start backend API:

   ```bash
   npm run start:api
   ```

3. Open:

   - `http://localhost:8080/`
   - `http://localhost:8080/health`

## Verification commands

- Full verification + static export:

  ```bash
  npm run verify:all
  ```

- Deploy preparation path:

  ```bash
  npm run deploy:prep
  ```

## Static export (GitHub Pages target)

1. Build dataset:

   ```bash
   npm run pipeline
   ```

2. Export static site:

   ```bash
   npm run export:static
   ```

3. Deploy the generated artifact:

   - path: `dist/static`
   - includes:
     - `index.html`
     - `assets/styles.css`
     - `assets/app.js`
     - `data/analytics.json`
     - `.nojekyll`

## GitHub Pages automation

- Workflow file: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` or manual workflow dispatch
- Pipeline in workflow:
  1. install dependencies
  2. build dataset
  3. run integration tests
  4. export static site
  5. deploy `dist/static` to GitHub Pages

## API endpoints

- `GET /health`
- `GET /api/metadata`
- `GET /api/conflicts?region=...&usInvolvement=...`
- `GET /api/analytics?ticker=LMT`
- `GET /api/analytics/summary?ticker=LMT`
- `GET /api/timeseries?tickers=LMT,RTX&startDate=...&endDate=...&granularity=month&mode=indexed`
- `GET /api/insights?ticker=LMT&region=...&usInvolvement=...&limit=6`

## Data contract

### Raw input

- `data/raw/companies.json`
- `data/raw/prices.json`
- `data/raw/conflicts.json`

### Processed output

- `data/processed/analytics.json`
- `data/processed/quality-report.json`

## Quality gate

```bash
npm run quality:gate
```

Optional env overrides:

- `MAX_ALLOWED_GAP_DAYS=120`
- `TARGET_START_DATE=1970-01-01`
- `ALLOW_COVERAGE_AFTER_TARGET=true`

## Notes

- Static mode is automatic when API calls are unavailable; the UI switches to local exported data mode.
- For publication-grade claims, Milestone A real-source historical continuity still needs completion.
