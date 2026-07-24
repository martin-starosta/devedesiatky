# Centrála header shell (mobile) — design

Date: 2026-07-24  
Scope: **mobile only** (`mobile/`). No `web/` changes.

## Goal

Put the brand banner `mobile/assets/game-slices/header.png` at the top of every in-game screen, move stats (`HudStrip`) directly under it, and use pure black as the default screen background.

## Shell layout

`GameShell` chrome order:

1. Brand banner (`header.png`, full width, `resizeMode: 'cover'`)
2. `HudStrip` (Preferencie / Pokladňa / Koalícia|AP / Kauza)
3. Stage (screen content)
4. `PhaseDock` (unchanged)

Banner is global (all phases that render inside `GameShell`), not Centrála-only.

### Asset & a11y

- Source path: `mobile/assets/game-slices/header.png`
- Banner height ~100–140px; width fills the content column
- Treat as decorative (title/tagline baked into art) with an accessibility label such as “Divoké deväťdesiate”, or hide from the accessibility tree if the shell already names the screen
- Sit below the status-bar / safe-area inset; black fills edge-to-edge behind the safe area

## Centrála cleanup

In `mobile/src/Centrala.tsx`:

- Remove duplicate brand text already present in the banner (title + tagline)
- Keep date, HQ notes (“Centrála strany” block), CTAs, and side actions in the stage — they sit under HudStrip via the shell order
- No second hero image inside Centrála

## Backgrounds

- Default screen / shell canvas → `#000`
- Apply on `SafeAreaView` (and shell root if it paints its own background)
- HudStrip, panels, and tiles keep existing surface colors — only the page canvas goes pure black

## Out of scope

- Any `web/` layout, CSS, or asset copies
- Adaptive / shorter banner on non-Centrála screens
- Redesign of HudStrip metrics or PhaseDock

## Verification

- Centrála: banner → stats → date/HQ/CTAs; no double titles
- Politika / FNM (and other shelled phases): banner → stats → content
- Backgrounds read as black, not charcoal (`#1a0f12` / gradients)
- Safe area: status bar not overlapping the banner art
