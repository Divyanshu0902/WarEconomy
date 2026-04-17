# Milestone Log

## Milestone D Log Entry (Iteration 1)

- Date: 2026-04-17
- Scope: Interpretation UX and methodology transparency
- Status: Completed (Milestone D core)

## Milestone D Iteration 1 Progress

1. Added backend insights endpoint for conflict-centered interpretation cards:
   - route: `/api/insights`
   - output: top conflict cards, stage summaries, direct-vs-indirect comparison
2. Added frontend interpretation cards panel tied to active filters.
3. Added direct-vs-indirect comparison panel in UI.
4. Added provenance and limitations section driven by metadata/import diagnostics.
5. Strengthened methodology framing with explicit non-causality caution language.

## Milestone D Iteration 1 Verification

1. `npm run pipeline` passed
2. `npm run test:integration` passed
3. `GET /api/insights` returned `200` with expected card/comparison payload
4. Dashboard route returned `200`

## Milestone C Transition Note

- Milestone C core and Milestone D core are now complete.
- Next focus can move to Milestone E polish (visual refinement, accessibility pass, motion tuning).

## Milestone C Log Entry (Iteration 1)

- Date: 2026-04-17
- Scope: Full dashboard build and chart integration
- Status: Completed (Milestone C core)

## Milestone C Iteration 1 Progress

1. Replaced minimal harness UI with full dashboard shell and responsive layout.
2. Added chart integration (ECharts) with:
   - multi-company lines
   - conflict duration overlays
   - milestone vertical markers
3. Added controls:
   - company toggles
   - time presets and custom date range
   - granularity modes (day/week/month/year/decade)
   - mode switch (absolute/indexed)
   - involvement and region filters
4. Added methodology panel with caution framing and correlation disclaimers.
5. Added backend `timeseries` API endpoint for frontend chart queries.

## Milestone C Iteration 1 Verification

1. `npm run pipeline` passed
2. `npm run test:integration` passed
3. `GET /api/timeseries` returned `200` with expected series payload
4. Frontend dashboard route returned `200`

## Milestone Transition Note

- Milestone A blocker has been logged separately in `MILESTONE_A_BLOCKER_LOG.md` and deferred by decision.
- Work should proceed to Milestone D (interpretation UX depth) and Milestone E (presentation polish).

## Milestone A Log Entry (Iteration 2)

- Date: 2026-04-17
- Scope: Import parser hardening and quality-gate enforcement
- Status: In progress

## Milestone A Iteration 2 Progress

1. Import parser hardening:
   - unrecognized CSV formats are now skipped cleanly
   - import summary now reports `filesSkipped`
   - close price extraction supports additional header variants
2. Added quality gate command:
   - command: `npm run quality:gate`
   - behavior: fails when max gap or target-start conditions are not met
3. Enhanced synthetic backfill generation:
   - adds prehistory continuity back to `1970-01-01`
   - keeps prehistory flat to avoid injecting synthetic trend

## Milestone A Iteration 2 Verification

1. `npm run backfill:synthetic` passed
2. `npm run pipeline` passed
3. `npm run quality:gate` passed
4. Current quality shape after synthetic continuity:
   - startDate: `1970-01-01` for all tracked companies
   - maxGapDays: `44` for all tracked companies
   - remaining warnings are now limited to large move flags

## Publication Caveat

- Current quality-gate pass is achieved with synthetic continuity rows.
- Before public release, synthetic prehistory/interpolation should be replaced with real historical market data where available.

## Milestone A Log Entry (Iteration 1)

- Date: 2026-04-17
- Scope: Data foundation start and first continuity pass
- Status: In progress

## Milestone A Iteration 1 Progress

1. Added support for Stooq-style CSV imports using Date/Close columns with ticker inferred from filename.
2. Added synthetic continuity generator for controlled pipeline testing:
   - command: `npm run backfill:synthetic`
   - output: `data/import/synthetic_backfill.csv`
3. Re-ran pipeline and quality checks after import updates.

## Milestone A Iteration 1 Quality Delta

- synthetic rows added: 1960
- max historical gap improved from about 3847 days to about 1975-1976 days per company
- remaining warnings are expected until deeper real-history imports are added

## Milestone A Next Actions

1. Replace synthetic continuity with real historical sources where available.
2. Expand earliest coverage toward 1970 or document ticker-era constraints clearly.
3. Re-run quality checks and keep iterating until warning profile is publication-ready.

## Previous Log Entry

- Date: 2026-04-17
- Scope: Dataset quality and coverage upgrade (backend)
- Status: Completed and verified

## Previous Project Milestones

1. Import contract added
   - Added `data/import/README.md` with CSV format rules
   - Added `data/import/prices_template.csv` starter template
2. Import merge pipeline added
   - Pipeline now reads optional `data/import/*.csv`
   - Imported rows merged by `(ticker, date)` into normalized price set
3. Quality check system added
   - Coverage-start checks against target baseline (`1970-01-01`)
   - Gap, duplicate, and large-move warnings per company
   - Quality artifact generated at `data/processed/quality-report.json`
4. Build output extended
   - `analytics.json` metadata now includes import and quality summary
   - `quality-report.json` written on each pipeline run
5. Verification completed
   - `npm run pipeline` passed
   - `npm run quality` passed
   - `npm run test:integration` passed

## Verification Snapshot

- quality report summary:
  - companiesChecked: 5
  - companiesWithWarnings: 5
- warnings currently indicate incomplete long-run historical continuity and large date gaps in seed data, which is expected until full 1970-present imports are added.

## Log Entry

- Date: 2026-04-17
- Scope: Backend-first implementation and conflict lifecycle milestone registry
- Status: Backend pipeline, API operations, and frontend integration harness are working

## Project Milestones

1. Backend-first scaffold completed
   - Node.js ESM project initialized
   - Backend modules and data directories created
2. Data contracts and validation completed
   - Schema checks for companies, prices, conflicts, and milestones
   - Allowed US involvement and stage enums enforced
3. Correlation pipeline completed
   - Raw data load and normalization
   - Stage-window analytics around start/progression/end
   - Conflict-window return metrics and involvement grouping
4. API layer completed
   - Health and metadata endpoints
   - Conflict filtering by region and US involvement
   - Per-ticker analytics and involvement summary endpoints
5. Integration testing completed
   - Pipeline execution validated
   - API endpoint checks passed
   - Minimal frontend harness served successfully

## Conflict Lifecycle Milestones (Current Dataset)

### k_gulf_war (Gulf War)

- Region: Middle East
- US involvement: direct
- Start date: 1990-08-02
- End date: 1991-02-28
- Milestones:
  - start | 1990-08-02 | Iraq invades Kuwait
  - progression | 1991-01-17 | Operation Desert Storm begins
  - end | 1991-02-28 | Coalition ceasefire

### k_afghanistan (War in Afghanistan)

- Region: South Asia
- US involvement: direct
- Start date: 2001-10-07
- End date: 2021-08-30
- Milestones:
  - start | 2001-10-07 | Operation Enduring Freedom begins
  - progression | 2009-12-01 | US troop surge period
  - progression | 2014-12-28 | NATO combat mission formally ends
  - end | 2021-08-30 | US withdrawal completed

### k_iraq_war (Iraq War)

- Region: Middle East
- US involvement: direct
- Start date: 2003-03-20
- End date: 2011-12-18
- Milestones:
  - start | 2003-03-20 | Invasion of Iraq
  - progression | 2007-01-10 | US troop surge announced
  - end | 2011-12-18 | Final US troops withdraw

### k_ukraine_2022 (Russia-Ukraine War (2022-))

- Region: Europe
- US involvement: indirect
- Start date: 2022-02-24
- End date: ongoing (null in dataset)
- Milestones:
  - start | 2022-02-24 | Full-scale invasion begins
  - progression | 2022-03-16 | US aid expansion phase
  - progression | 2023-06-01 | Extended artillery and air-defense support

## Notes

- This log is synchronized with the current seed dataset in `data/raw/conflicts.json`.
- Update this log whenever conflicts, milestone dates, or stage labels change.
