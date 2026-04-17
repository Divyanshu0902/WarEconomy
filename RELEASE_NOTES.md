# Release Notes

## v1.0.0 Wrap-Up (2026-04-17)

### Scope

Finalized Milestone E polish and Milestone F deployment wrap-up. Milestone A remains deferred by documented decision in `MILESTONE_A_BLOCKER_LOG.md`.

### Highlights

1. UI polish completed:
   - Dark editorial luxury visual system (type, palette, spacing, motion)
   - Chart readability improvements for dense overlays
   - Mobile ergonomics improvements for controls
   - Accessibility enhancements (focus states, skip link, aria-live updates, aria-busy)
   - Active filter context strip and legend density controls
   - Loading shimmer states across major panels
2. Static deployment mode completed:
   - Frontend automatically falls back to static runtime when API is unavailable
   - Static export script emits a deploy-ready artifact in `dist/static`
3. Deployment automation completed:
   - GitHub Actions workflow added for GitHub Pages publishing

### Verification Checklist

- [x] `npm run pipeline`
- [x] `npm run test:integration`
- [x] `npm run quality:gate`
- [x] `npm run export:static`
- [x] Dashboard route returns 200 in API mode
- [x] Frontend runtime supports static fallback mode
- [x] `dist/static` contains deploy-ready output

### Known Deferred Items

1. Milestone A production-grade historical continuity:
   - Real-source replacement for synthetic continuity rows remains pending
   - Blocker tracked in `MILESTONE_A_BLOCKER_LOG.md`

### Artifact Paths

- API + frontend source: `frontend/`, `backend/src/api/`
- Static export artifact: `dist/static/`
- Deployment workflow: `.github/workflows/deploy-pages.yml`
