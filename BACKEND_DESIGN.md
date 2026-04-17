# Backend Design (Data Pipeline First)

## Objective

Ensure all critical data operations are reliable before UI work:

- ingest
- validate
- transform
- correlate
- expose via API

## Architecture

- Runtime: Node.js, ECMAScript modules
- Storage model: static JSON files for raw and processed datasets
- Processing pattern: batch pipeline (`npm run pipeline`) with optional CSV imports
- Serving pattern: lightweight HTTP API (`npm run start:api`)

## Directory design

- `backend/src/config.js`: central path and port configuration
- `backend/src/schema.js`: raw data validation rules
- `backend/src/lib/`: reusable utilities
- `backend/src/pipeline/`: ingestion, transformation, analytics computation
- `backend/src/api/`: query logic, server, and integration test
- `data/import/`: optional CSV expansion for historical price coverage

## Pipeline flow

1. Load raw datasets (`companies`, `prices`, `conflicts`)
2. Merge optional CSV imports from `data/import/*.csv` into base price rows
3. Validate schema integrity and allowed enum values
4. Normalize date and per-company series ordering
5. Compute conflict-lifecycle analytics
6. Run quality checks (coverage, gaps, duplicates, large moves)
7. Write processed artifacts for API reads and quality auditing

## Correlation model implemented

For each company and each conflict:

1. Stage-centered event windows (default 30-day around milestone date):
   - pre-to-stage percent change
   - stage-to-post percent change
   - pre-to-post percent change
2. Full conflict-window return (start to end, or ongoing to latest available point)
3. Progression-stage average for escalation/de-escalation tracking
4. Preservation of US involvement tag for grouped comparisons

This is intentionally correlation analysis and does not claim causality.

## API operations

- Conflicts filtering by region and US involvement
- Per-ticker conflict analytics retrieval
- Per-ticker grouped summary by involvement type
- Metadata and health for observability

## Integration testing strategy

`backend/src/api/integrationTest.js` verifies:

- service health endpoint
- conflict filtering endpoint
- ticker analytics endpoint
- grouped summary endpoint

A passing run confirms pipeline output and API integration coherence.

## Quality checks implemented

- Per-company coverage window from first to last available date
- Late-start warning relative to target baseline (`1970-01-01`)
- Duplicate raw row detection by `(companyId, date)`
- Maximum and average inter-point gap detection
- Large move event counts using configurable threshold

## Why this supports your project motive

Your core motive is to examine stock changes relative to conflict start, progression, and end, especially with US direct/indirect involvement. The backend is explicitly structured around that lifecycle and involvement taxonomy so later charting can focus on interpretation instead of fixing data plumbing.
