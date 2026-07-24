## Agent skills

### Issue tracker

Issues and PRDs live as GitHub Issues in this repo (via `gh`); external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical roles map 1:1 to labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.

### AI Docs
Before making changes:
- Read aidocs/AI_CONTEXT.md
- Read aidocs/FEATURE_MAP.md for the affected feature.
- Follow aidocs/INVARIANTS.md.
- Follow existing implementation patterns.

Run the appropriate validation commands before considering the task complete.

### Base rules:
- Be extremely concise.  Sacriface grammar for the sake of concision.
- Before sending ANY response, ask yourself: does this contain a promise to do something later?
- Do not start coding until you are 95% confident what to implement 
- Before designing anything, find the existing equivalent. 
- Get a 5-minute sketch in front of a human before the design doc.
- YAGNI applies to guards, caches, and CLS keys too. 
- User corrections often point at design issues, not just rule issues.
- A thorough design of the wrong solution is still the wrong solution.
- Aim for simplicity, 2-4 dev team size, tested and proven ideas and patterns. Always cross compare with Laravel/Rails/Django when looking for "how things are done"
