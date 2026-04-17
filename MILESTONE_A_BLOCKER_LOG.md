# Milestone A Blocker Log

## Status

- Date logged: 2026-04-17
- Milestone: A (Data Foundation Completion)
- Decision: Defer fix for now, continue with Milestone C and later milestones

## Exact Problem

Milestone A currently passes technical quality checks only because synthetic continuity rows are being used.

1. Real long-run market data ingestion is incomplete for 1970-present.
2. External Stooq direct CSV automation is blocked by API-key/captcha flow, so those downloaded files are not machine-ingestable in the current unattended pipeline step.
3. To keep pipeline progress moving, synthetic prehistory/interpolation rows were generated and imported.
4. This allows quality gate success for continuity metrics, but it is not publication-grade evidence.

## Evidence in Current System

- Synthetic generator exists in `backend/src/pipeline/generateBackfill.js`.
- Synthetic data file currently present at `data/import/synthetic_backfill.csv`.
- Import summary in processed metadata shows skipped real-source files and imported synthetic rows.
- Quality gate passes after synthetic coverage is added.

## Why This Is a Blocker

Milestone A acceptance requires production-grade historical data continuity and provenance. Synthetic continuity is acceptable for engineering validation but not for final public analytical claims.

## Deferred Fix Scope

When revisiting Milestone A, complete the following:

1. Acquire real historical sources for all tracked companies with documented provenance.
2. Replace synthetic prehistory/interpolation rows with real historical rows where available.
3. Re-run quality gate with synthetic rows removed (or separately excluded).
4. Confirm warning profile aligns with expected market-closure behavior only.
5. Update methodology disclosures and milestone log with final data-source coverage.

## Temporary Operating Mode

Proceed with Milestone C+ development using current backend and processed dataset so UX and interaction layers can be completed while real historical sourcing is solved later.
