# Price Import Format

Drop one or more CSV files in this folder to extend historical coverage.

## Required headers

- ticker
- date
- close

Alternative accepted format (Stooq download):

- Date
- Close
- ticker inferred from filename (for example `lmt_stooq.csv` => `LMT`)

## Optional headers

- source
- currency
- adjustedClose

## Rules

- `ticker` must match a company ticker in `data/raw/companies.json` (LMT, RTX, NOC, GD, HII)
- `date` must be ISO format: YYYY-MM-DD
- `close` must be a positive number
- Duplicate rows by `(ticker, date)` are deduplicated by the pipeline, preferring the latest imported row
- Imported rows are merged with `data/raw/prices.json` during pipeline build
- Files with unrecognized headers are skipped and reported in `analytics.json` metadata (`importSummary`)

## Example

```csv
ticker,date,close,source,currency
LMT,1985-01-02,7.83,stooq,USD
LMT,1985-01-03,7.75,stooq,USD
RTX,1985-01-02,4.12,stooq,USD
```

## Notes

- Keep each CSV under ~20 MB for easier local processing.
- Validate CSV formatting before running `npm run pipeline`.
- `synthetic_backfill.csv` can be generated with `npm run backfill:synthetic` for continuity testing only.
- Synthetic rows are not a substitute for real historical market data and should be replaced before final publication.
- Run `npm run quality:gate` after imports to check readiness thresholds.
