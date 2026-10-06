# Portfolio MVP update — 6 October 2026

## Added
- Deterministic 0–100 lead readiness scoring with explicit strengths, missing information and non-pricing mismatch warnings, computed in the carpenter inbox.
- Shared project brief configuration and validation logic, including project stage, documentation state and architect/designer status; five wizard steps preserved.
- Footer with navigation, demo disclosure, carpenter entry and Danijel Web credit.
- GoTrue session persistence and rotating refresh-token support (passwords never persisted).
- Edge-only upload-rule copy and an automated parity check with frontend file rules.
- Image source/licensing inventory (`docs/IMAGE-SOURCES.md`), tests for scores, optional fields and sessions.

## Changed
- Header and hero main CTA open the Smart Brief directly; secondary CTA still scrolls to projects.
- Navigation only links to real sections; removed nonfunctional About/Contact placeholders.
- Updated intro text, final review, README and GitHub Pages `base` path.
- Edge Function validation uses `shared/` pure modules instead of `src/` UI imports.

## Verification
- `npm test`: **PASS — 23 tests** (Node v22.16.0 with experimental TypeScript stripping).
- JS/JSX/TS parser check: **PASS — 33 files, 0 syntax errors**.
- `npm run build`: **BLOCKED in this sandbox**. The uploaded `node_modules` was generated on Windows and lacks Linux `@rolldown/binding-linux-x64-gnu` native binary. A fresh `npm ci` could not complete because outbound DNS to npm registry is unavailable here. No successful bundle build is claimed.
- `npm run check`: **BLOCKED** by the same build dependency.
- Live Supabase authentication, database, Turnstile and Cloudflare/Pages deployment were not tested against an actual configured remote project.

## Build on your machine
1. Extract the ZIP and open the project root.
2. Run `npm ci` (regenerates platform-specific `node_modules`, do not reuse the supplied Windows directory).
3. Run `npm test`, `npm run build`, `npm run check`.
4. For GitHub Pages subpath testing, set `PAGES_BASE_PATH=/namjestaj-po-mjeri/` before `npm run build`; inspect generated `dist/index.html` and the browser app including `#/upiti`.

No demo images were replaced. Never use demo images commercially without verifying licenses.
