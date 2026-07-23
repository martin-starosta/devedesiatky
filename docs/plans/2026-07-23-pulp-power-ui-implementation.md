# Pulp Power UI Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the carpet/gold/Georgia theme with the approved Pulp Power visual system across existing MVP screens (Setup, Centrála, Politika, FNM) without changing simulation rules.

**Architecture:** Token-first restyle. Lock palette/type/radius/motion in `theme.css`, then migrate each screen CSS to semantic tokens. Add a thin persistent resource strip shell later; MVP1 keeps route-by-`turnPhase` in `App.tsx`. No new gameplay systems in this plan.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, Framer Motion, Vitest, CSS custom properties.

**Design source:** `docs/plans/2026-07-23-divoke-devatdesiate-ui-design.md`  
**GDD:** `docs/divoke-devatdesiate-gdd.md`

---

### Task 1: Lock Pulp Power tokens in theme.css

**Files:**
- Modify: `web/src/ui/theme.css`
- Test: `web/src/ui/theme.tokens.test.ts` (create)

**Step 1: Write the failing test**

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('theme tokens', () => {
  const css = readFileSync(resolve(__dirname, 'theme.css'), 'utf8')

  it('defines Pulp Power palette tokens', () => {
    expect(css).toContain('--soot:')
    expect(css).toContain('--graphite:')
    expect(css).toContain('--bone:')
    expect(css).toContain('--ash:')
    expect(css).toContain('--blood:')
    expect(css).toContain('--signal:')
    expect(css).toContain('--mint:')
  })

  it('does not keep carpet/gold nostalgia tokens as primary brand', () => {
    expect(css).not.toMatch(/--carpet:\s*#3a1f28/i)
    expect(css).not.toMatch(/--gold:\s*#c4a35a/i)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd web && pnpm test -- src/ui/theme.tokens.test.ts`  
Expected: FAIL (file missing or tokens missing)

**Step 3: Write minimal implementation**

Replace `:root` in `theme.css` with:

```css
:root {
  --soot: #0e0e10;
  --graphite: #1c1f24;
  --bone: #e8e2d6;
  --ash: #8b9098;
  --blood: #c8102e;
  --signal: #f5c518;
  --mint: #b8d4a8;

  --radius-panel: 10px;
  --radius-card: 8px;

  --font-display: 'Geist', 'Satoshi', 'Segoe UI', sans-serif;
  --font-ui: 'Geist', 'Satoshi', 'Segoe UI', sans-serif;
  --font-mono: 'Geist Mono', 'ui-monospace', monospace;
}

body {
  margin: 0;
  color: var(--bone);
  font-family: var(--font-ui);
  background:
    radial-gradient(ellipse at 30% 0%, rgba(200, 16, 46, 0.18), transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(28, 31, 36, 0.9), transparent 55%),
    linear-gradient(165deg, #14161a, var(--soot) 70%);
}
```

Keep existing `*`, `html/body/#root` box-sizing rules. Do not self-host fonts yet (system fallbacks OK for this task).

**Step 4: Run test to verify it passes**

Run: `cd web && pnpm test -- src/ui/theme.tokens.test.ts`  
Expected: PASS

**Step 5: Commit**

```bash
git add web/src/ui/theme.css web/src/ui/theme.tokens.test.ts
git commit -m "$(cat <<'EOF'
Lock Pulp Power palette tokens and drop carpet/gold brand colors.

EOF
)"
```

---

### Task 2: Restyle Centrála to Pulp Power

**Files:**
- Modify: `web/src/ui/Centrala.css`
- Modify: `web/src/ui/Centrala.tsx` (class names only if needed)
- Test: visual via `pnpm dev` (no sim change)

**Step 1: Map old vars → new**

Replace any `var(--paper)`, `var(--gold)`, `var(--carpet*)`, `var(--preferencie)`, `var(--ink)` usages:

| Old | New |
|---|---|
| `--preferencie` / paper hero | `--bone` (hero number), `--mint` on poll-up later |
| `--gold` accents | `--signal` for primary CTA only; `--ash` for labels |
| `--paper` titles | `--bone` |
| board border gold | `rgba(232, 226, 214, 0.2)` or `--ash` |
| board fill | `--graphite` gradient on `--soot` |

**Step 2: Apply layout polish from brief**

- Preferencie value: Clash-scale hero (`clamp(2.4rem, 10vw, 3.2rem)`), `font-family: var(--font-mono)` or display.  
- Labels: uppercase OK but Ash color, not gold.  
- Panel: `border-radius: var(--radius-panel)`; inset well, no gold bezel.  
- Primary button (if any): `--signal` bg + soot text.

**Step 3: Manual check**

Run: `cd web && pnpm dev`  
Open Centrála after setup. Blind test: reads as game HUD, not museum.

**Step 4: Commit**

```bash
git add web/src/ui/Centrala.css web/src/ui/Centrala.tsx
git commit -m "$(cat <<'EOF'
Restyle Centrála with Pulp Power HUD tokens.

EOF
)"
```

---

### Task 3: Restyle SetupParty + PolitikaScreen + FnmScreen

**Files:**
- Modify: `web/src/ui/SetupParty.css`
- Modify: `web/src/ui/PolitikaScreen.css`
- Modify: `web/src/ui/FnmScreen.css`
- Touch TSX only if class hooks needed

**Step 1: Same token migration as Task 2** for each CSS file.

**Step 2: FNM-specific**

- Company cards: thick Bone/Ash border, Graphite fill, `radius-card`.  
- Drop slots (Sponzor / Partner / Auction / Delay): clear targets; Signal highlight on valid drop.  
- Keep drag behavior; only visual chrome changes.

**Step 3: Politika-specific**

- AP slots readable; primary action Signal; risky/reputation-damaging actions can use Blood outline later (optional if labels exist).

**Step 4: Run tests (no regressions)**

Run: `cd web && pnpm test && pnpm typecheck`  
Expected: all PASS

**Step 5: Commit**

```bash
git add web/src/ui/SetupParty.css web/src/ui/PolitikaScreen.css web/src/ui/FnmScreen.css
git commit -m "$(cat <<'EOF'
Apply Pulp Power tokens across Setup, Politika, and FNM screens.

EOF
)"
```

---

### Task 4: Semantic button / meter utility classes

**Files:**
- Modify: `web/src/ui/theme.css`
- Optional: small class usage in screens

**Step 1: Add utilities to theme.css**

```css
.btn-primary {
  background: var(--signal);
  color: var(--soot);
  border: 0;
  border-radius: var(--radius-card);
  font-weight: 700;
}

.btn-danger {
  background: transparent;
  color: var(--blood);
  border: 1px solid var(--blood);
  border-radius: var(--radius-card);
}

.btn-ghost {
  background: transparent;
  color: var(--bone);
  border: 1px solid rgba(232, 226, 214, 0.35);
  border-radius: var(--radius-card);
}

.meter-hero {
  font-family: var(--font-mono);
  font-size: clamp(2.4rem, 10vw, 3.2rem);
  color: var(--bone);
  letter-spacing: -0.02em;
}
```

**Step 2: Wire primary CTAs** on Setup / Centrála / Politika / FNM to `.btn-primary` where a clear primary exists.

**Step 3: Commit**

```bash
git add web/src/ui/
git commit -m "$(cat <<'EOF'
Add shared Pulp Power button and meter utility classes.

EOF
)"
```

---

### Task 5: Reduced-motion + juice hooks (prep only)

**Files:**
- Create: `web/src/ui/motion.ts`
- Modify: one screen that already animates (if any Framer usage exists); otherwise Centrála preferencie as a tiny Motion number tween

**Step 1: Helper**

```ts
export function useJuiceEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

(Or use Framer’s `useReducedMotion` directly in components.)

**Step 2: Preferencie tick**

When preferencie changes on Centrála, animate with spring if motion allowed; else snap.

**Step 3: Test + commit**

Run: `cd web && pnpm test && pnpm typecheck`  
Commit: `Add reduced-motion-aware preferencie juice on Centrála.`

---

### Task 6: Do/Don’t note in repo (short)

**Files:**
- Modify: `docs/plans/2026-07-23-divoke-devatdesiate-ui-design.md` (add “Implemented tokens” note)  
  OR create `web/src/ui/README.md` with 10-line Do/Don’t for future UI work

**Step 1: Write Do/Don’t**

- Do: Soot/Graphite/Bone/Blood/Signal  
- Don’t: carpet burgundy, gold chrome, Georgia nostalgia  
- Do: Clash shallow overlays  
- Don’t: STV chrome outside election night  

**Step 2: Commit**

```bash
git add web/src/ui/README.md
git commit -m "$(cat <<'EOF'
Document Pulp Power Do/Don’t for UI contributors.

EOF
)"
```

---

## Out of scope (this plan)

- Event overlay / Volebná noc / Časová os / Epilogue screens (not built yet)  
- Character illustration sheet  
- Self-hosted webfonts packaging  
- Kult meter / scissors chart chrome  
- Simulation or content changes

## Verification checklist

- [ ] `pnpm test` green  
- [ ] `pnpm typecheck` green  
- [ ] Centrála first viewport reads arcade, not museum  
- [ ] No `#3a1f28` / `#c4a35a` as brand surfaces  
- [ ] Primary CTAs are Signal yellow with readable soot text  
