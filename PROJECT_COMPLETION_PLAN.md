# Project Completion Plan

## Objective

Complete the full project end-to-end: robust backend data operations, high-quality correlation analysis around conflict lifecycle milestones, polished frontend visualization, and free production deployment.

## Current Status Snapshot

### Completed

- Backend-first architecture implemented
- Raw data schema validation and correlation pipeline implemented
- Conflict lifecycle model implemented (start, progression, end)
- US involvement classification implemented
- Quality report generation implemented
- API endpoints and integration tests working
- Milestone log and backend design docs created
- Milestone C core completed (dashboard)
- Milestone D core completed (interpretation layer)
- Milestone E polish completed (visual, responsive, accessibility)
- Milestone F deployment wrap-up completed (static export + GitHub Pages workflow)

### Remaining

- Expand real historical dataset quality and continuity (Milestone A deferred blocker)

## Delivery Strategy

- Priority 1: Data and analytics correctness
- Priority 2: Frontend functionality and usability
- Priority 3: Presentation polish and narrative clarity
- Priority 4: Free hosting deployment and maintainable update workflow

## Master Milestones

## Milestone A - Data Foundation Completion

### Milestone A Goal

Raise dataset quality from seed-level to production-grade historical coverage for 1970-present.

### Milestone A Tasks

1. Acquire and import long-run historical price series for all 5 companies.
2. Normalize dates and handle ticker-history caveats where applicable.
3. Expand conflict timeline coverage and ensure lifecycle milestones are complete.
4. Add provenance metadata for each imported source.
5. Run and review quality report until warning profile is acceptable.

### Milestone A Acceptance Criteria

- All 5 companies have substantially continuous historical coverage.
- Quality report gap warnings are reduced to expected market-closure behavior.
- Conflict records include complete lifecycle milestones and US involvement tags.

## Milestone B - Correlation Analytics Hardening

### Milestone B Goal

Strengthen analytical outputs for reliable interpretation around conflict start/progression/end.

### Milestone B Tasks

1. Add configurable event-window sizes (for example 7, 30, 90 days).
2. Add lag-window analysis (for delayed market reaction checks).
3. Add baseline/index normalization options per selected analysis window.
4. Add aggregate comparison metrics by US involvement category.
5. Add confidence notes and edge-case handling for sparse ranges.

### Milestone B Acceptance Criteria

- Analytics output supports multi-window and lag comparisons.
- Summary views can compare direct vs indirect involvement effects.
- Output remains explicit about correlation-only interpretation.

## Milestone C - Frontend Dashboard Build

### Milestone C Goal

Replace minimal harness with a full dashboard focused on timeline-to-conflict correlation analysis.

### Milestone C Tasks

1. Build dashboard shell with clear sections:
   - chart workspace
   - controls panel
   - conflict legend
   - interpretation/methodology panel
2. Integrate charting library and render:
   - multi-company price lines
   - conflict duration bands
   - milestone markers for start/progression/end
3. Add controls:
   - company toggles
   - range presets and custom date ranges
   - granularity modes (day/week/month/year/decade)
   - involvement and region filters
4. Add mode switch:
   - absolute price
   - indexed performance
5. Integrate API data loading and error states.

### Milestone C Acceptance Criteria

- User can explore all required time scales.
- Conflict overlays align correctly with timeline and selected filters.
- Interaction remains responsive on desktop and mobile.

## Milestone D - Interpretation Layer and Methodology UX

### Milestone D Goal

Present meaningful, responsible interpretation without causal overreach.

### Milestone D Tasks

1. Add conflict-centered insight cards tied to selected windows.
2. Add visible disclaimers (correlation vs causation, survivorship bias, data uncertainty).
3. Add clear labels for US direct vs indirect involvement cases.
4. Add methodology panel describing calculations and limitations.
5. Add source/provenance references in UI.

### Milestone D Acceptance Criteria

- Interpretation text is clear, critical, and methodologically transparent.
- Users can understand what the metrics mean and what they do not prove.

## Milestone E - UI Presentation Polish

### Milestone E Goal

Elevate visual quality and readability while preserving analytical clarity.

### Milestone E Tasks

1. Finalize visual identity (typography, palette, spacing, hierarchy).
2. Improve chart readability and legend behavior for dense overlays.
3. Add mobile-first control ergonomics and compact states.
4. Add meaningful transitions and loading placeholders.
5. Perform accessibility pass for contrast, focus states, and keyboard use.

### Milestone E Acceptance Criteria

- UI is visually coherent and not merely utilitarian.
- Key analysis workflows are comfortable on both desktop and mobile.

## Milestone F - Deployment and Project Wrap-Up

### Milestone F Goal

Ship a fully usable version on free hosting with a reliable maintenance workflow.

### Milestone F Tasks

1. Add static export path for frontend + processed analytics data.
2. Configure GitHub Pages as primary free deployment.
3. Keep optional Netlify/Vercel deployment path documented.
4. Finalize README with run, update, and deploy instructions.
5. Add final verification checklist and release notes.

### Milestone F Acceptance Criteria

- Site is deployable and accessible on free hosting.
- Dataset refresh workflow is documented and repeatable.

## Execution Order and Dependencies

1. Milestone A (required before high-confidence frontend claims)
2. Milestone B (required before final interpretation UX)
3. Milestone C (full dashboard implementation)
4. Milestone D (interpretation and methodology)
5. Milestone E (presentation polish)
6. Milestone F (deploy and wrap-up)

## Suggested Working Rhythm

- One active milestone at a time.
- For each milestone:
  - open milestone todo list
  - implement
  - run verification
  - update milestone log
  - mark complete before moving on

## Immediate Next Action

Keep Milestone A deferred per blocker log and proceed with release maintenance workflow using current static/API deploy paths.
