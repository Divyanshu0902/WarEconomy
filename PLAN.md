# War Economy Timeline Dashboard - Full Project Plan

## Project Goal

Build a website with one core purpose: visualize how stock prices of major US military-related companies changed over time (days, weeks, months, years, decades), mapped to conflicts and wars worldwide, to examine patterns related to war economy incentives.

## Scope Decisions (Locked)

- Build path: Static MVP first
- Time window: 1970 to present
- Company set: 5 major defense firms
- Tone: Balanced hybrid (critical framing + responsible methodology)
- Frontend language: JavaScript (no TypeScript)
- Deployment target: GitHub Pages (primary free path), with optional Netlify/Vercel free tiers

## Free Deployment Feasibility

- Yes, this MVP is deployable for free.
- GitHub Pages is the safest zero-cost default for a static site.
- Netlify and Vercel also have free tiers suitable for this project size.
- Practical free-tier constraints:
  - Build minutes and bandwidth limits
  - No private backend/database for free static hosting needs
  - API-based live ingestion can introduce paid limits later
- Recommendation for zero budget: ship static MVP on GitHub Pages first, mirror to Netlify/Vercel only if needed.

## What "Static MVP" Means

- Frontend-only deployment (HTML/CSS/JS bundle)
- No always-on backend server in v1
- Curated stock/conflict/event datasets included as static files
- Interactive analysis performed in-browser
- Data updates happen by refreshing data files and redeploying

## Architecture (MVP)

### Frontend

- JavaScript single-page app
- Responsive layout for desktop and mobile
- Main charting layer for multi-series timelines and overlays

### Data

- Static JSON/CSV data files
- Normalized schema for companies, prices, conflicts, and annotations
- Source/provenance manifest for transparency
- Conflict lifecycle fields for start, progression checkpoints, and end events
- US involvement tagging fields to distinguish direct vs indirect participation

### Deployment

- Static hosting on GitHub Pages (primary)
- Optional static hosting on Vercel/Netlify free tiers
- Optional caching headers for data assets

## Phased Execution Plan

### Phase 1 - App Setup and Experience Baseline

1. Initialize frontend project for static hosting.
2. Create core page structure:
   - Header/context statement
   - Chart workspace
   - Controls panel (company/range/granularity)
   - Conflict and event legend
   - Methodology/disclaimer panel
3. Define visual system:
   - CSS variables for color and spacing
   - Distinct chart palette for multi-company lines
   - Consistent typography and spacing scale
   - Mobile-first responsiveness and accessibility baseline

### Phase 2 - Data Model and Curated Data Pack (depends on Phase 1)

1. Define data schema for:
   - Companies
   - Historical prices
   - Conflicts (durations)
   - Conflict lifecycle stages (start/progression/end)
   - US involvement classification (direct/indirect/coalition/advisory/proxy)
   - Point events (markers)
   - Narrative annotations
2. Build v1 data pack:
   - 5 defense firms (example: LMT, RTX, NOC, GD, HII)
   - Historical adjusted-close style price data from 1970 onward (or earliest available)
   - Conflict start/progression/end records and region metadata
   - US involvement metadata with confidence notes
   - Key event timeline markers
3. Add `data/provenance` manifest with:
   - Source URLs
   - Last updated date
   - Usage/licensing notes
   - Known limitations and gaps

### Phase 3 - Visualization Engine (depends on Phase 2)

1. Implement time-series chart with:
   - Multi-company stock lines
   - Conflict bands spanning start-to-end dates
   - Distinct markers for conflict start, progression milestones, and end
   - Event markers on exact dates
2. Implement controls and interactions:
   - Time presets: 7D, 1M, 6M, 1Y, 5Y, 10Y, ALL
   - Custom date range
   - Granularity switch: day/week/month/year/decade
   - Company selection toggles
   - Filters for US involvement level and conflict region
3. Add compare modes:
   - Absolute prices
   - Indexed baseline (% change from selected start date)
4. Add explicit correlation analysis helpers:
   - Pre-conflict, in-conflict, and post-conflict windows
   - Return deltas around start/progression/end milestones
   - Optional lag window presets (for delayed market response checks)

### Phase 4 - Interpretation Layer and Responsible Framing

1. Add annotation cards tied to selected periods/conflicts.
2. Include methodology notes directly in UI.
3. Add clear caution statements:
   - Correlation does not prove causation
   - Survivorship bias considerations
   - Timeline/date ambiguity across sources
4. Add explicit interpretation around conflict lifecycle:
   - What changed near conflict start
   - What changed during escalation/progression
   - What changed around conflict de-escalation/end
5. Add US-involvement interpretation labels so viewers can compare direct and indirect cases.
6. Keep narrative aligned with balanced-critical objective:
   - Critically examine profit patterns
   - Avoid overclaiming causal certainty

### Phase 5 - Quality Checks and Deployment (depends on Phases 3-4)

1. Validate chart overlay correctness (event and conflict alignment).
2. Validate granularity aggregation logic for all levels.
3. Verify mode switching (absolute vs indexed) consistency.
4. Validate lifecycle marker logic (start/progression/end) against source dates.
5. Validate involvement filters (direct/indirect/etc.) and counts.
6. Test responsiveness and readability on mobile/desktop.
7. Build production bundle and deploy to GitHub Pages.
8. Optionally mirror deploy to Netlify/Vercel free tier.
9. Publish concise README and dataset update instructions.

## File/Folder Scaffold (Target)

- `src/` application code
- `src/components/` chart and control components
- `src/data/` schema descriptors and constants (JavaScript)
- `src/utils/` date and normalization utilities
- `public/data/` static datasets
- `docs/` optional methodology and limitations notes
- `README.md` setup + deployment + update workflow

## Verification Checklist

1. Default load shows all 5 companies and overlays.
2. Preset ranges correctly change chart domain.
3. Granularity changes update data aggregation correctly.
4. At least 10 known events are visually aligned to expected dates.
5. Conflict lifecycle markers (start/progression/end) appear correctly for sampled conflicts.
6. US involvement filters correctly partition conflicts (direct vs indirect, etc.).
7. Indexed comparison remains stable when date range changes.
8. Mobile layout has no clipping; controls and legends are usable.
9. Production build deploys successfully to GitHub Pages and serves static data correctly.

## Out of Scope for v1

- Live backend ingestion pipeline
- Real-time market feeds
- Predictive analytics or investment signals
- User accounts or personalization

## Risks and Caveats

- Correlation vs causation is a core methodological risk.
- Source date disagreements can affect interpretation.
- Historical pricing normalization choices can alter visual impressions.
- Ethical framing should remain explicit and transparent.

## Future Upgrade Path (Post-MVP)

1. Add scheduled data ingestion for near-real-time updates.
2. Expand company coverage beyond initial 5.
3. Introduce richer conflict datasets and confidence scoring.
4. Add export/reporting views and deeper comparative analytics.
