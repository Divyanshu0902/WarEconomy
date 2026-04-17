# War Economy Timeline Dashboard - Full Project Plan

## Project Goal
Build a website with one core purpose: visualize how stock prices of major US military-related companies changed over time (days, weeks, months, years, decades), mapped to conflicts and wars worldwide, to examine patterns related to war economy incentives.

## Scope Decisions (Locked)
- Build path: Static MVP first
- Time window: 1970 to present
- Company set: 5 major defense firms
- Tone: Balanced hybrid (critical framing + responsible methodology)
- Deployment target: Vercel or Netlify

## What "Static MVP" Means
- Frontend-only deployment (HTML/CSS/JS bundle)
- No always-on backend server in v1
- Curated stock/conflict/event datasets included as static files
- Interactive analysis performed in-browser
- Data updates happen by refreshing data files and redeploying

## Architecture (MVP)
### Frontend
- TypeScript single-page app
- Responsive layout for desktop and mobile
- Main charting layer for multi-series timelines and overlays

### Data
- Static JSON/CSV data files
- Normalized schema for companies, prices, conflicts, and annotations
- Source/provenance manifest for transparency

### Deployment
- Static hosting on Vercel/Netlify
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
   - Point events (markers)
   - Narrative annotations
2. Build v1 data pack:
   - 5 defense firms (example: LMT, RTX, NOC, GD, HII)
   - Historical adjusted-close style price data from 1970 onward (or earliest available)
   - Conflict start/end records and region metadata
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
   - Event markers on exact dates
2. Implement controls and interactions:
   - Time presets: 7D, 1M, 6M, 1Y, 5Y, 10Y, ALL
   - Custom date range
   - Granularity switch: day/week/month/year/decade
   - Company selection toggles
3. Add compare modes:
   - Absolute prices
   - Indexed baseline (% change from selected start date)

### Phase 4 - Interpretation Layer and Responsible Framing
1. Add annotation cards tied to selected periods/conflicts.
2. Include methodology notes directly in UI.
3. Add clear caution statements:
   - Correlation does not prove causation
   - Survivorship bias considerations
   - Timeline/date ambiguity across sources
4. Keep narrative aligned with balanced-critical objective:
   - Critically examine profit patterns
   - Avoid overclaiming causal certainty

### Phase 5 - Quality Checks and Deployment (depends on Phases 3-4)
1. Validate chart overlay correctness (event and conflict alignment).
2. Validate granularity aggregation logic for all levels.
3. Verify mode switching (absolute vs indexed) consistency.
4. Test responsiveness and readability on mobile/desktop.
5. Build production bundle and deploy to Vercel/Netlify.
6. Publish concise README and dataset update instructions.

## File/Folder Scaffold (Target)
- `src/` application code
- `src/components/` chart and control components
- `src/types/` schema types
- `src/utils/` date and normalization utilities
- `public/data/` static datasets
- `docs/` optional methodology and limitations notes
- `README.md` setup + deployment + update workflow

## Verification Checklist
1. Default load shows all 5 companies and overlays.
2. Preset ranges correctly change chart domain.
3. Granularity changes update data aggregation correctly.
4. At least 10 known events are visually aligned to expected dates.
5. Indexed comparison remains stable when date range changes.
6. Mobile layout has no clipping; controls and legends are usable.
7. Production build deploys successfully and serves static data correctly.

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
