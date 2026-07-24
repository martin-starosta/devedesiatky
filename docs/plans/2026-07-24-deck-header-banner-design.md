# Deck header banner (mobile) — design

Date: 2026-07-24  
Scope: **mobile product path** (`App.tsx` → `DeckQuarterScreen`). No `web/`.

Related: `2026-07-24-centrala-header-shell-design.md` covers legacy `GameShell` (v2). This doc is the live deck UI.

## Goal

Show brand banner `mobile/assets/game-slices/header.png` at the top of every product screen (loading, setup, play, timeline, boss).

## Safe area (B′)

- Banner starts at **y=0** (under status bar / notch).
- Height = `insets.top + 96` so title/pig/tagline stay below system chrome.
- Top of art is dark smoke → light status icons remain readable.
- `SafeAreaView` edges: `right`, `bottom`, `left` only (no `top`).
- Content (HUD, scroll) starts below the banner.

## Architecture

**Mount in `App.tsx`** (not per-screen branches):

1. `GameHeader` (new)
2. Loading spinner **or** `DeckQuarterScreen`
3. `StatusBar` style `light`

One mount → all deck screens inherit the banner.

### `GameHeader`

- File: `mobile/src/GameHeader.tsx`
- Asset: `require('../assets/game-slices/header.png')`
- RN `Image`, `resizeMode: 'cover'`, full width
- Height: `useSafeAreaInsets().top + 96`
- a11y label: `Divoké deväťdesiate`

### Legacy

- Do not rewire unused v2 screens in this change.
- Optional later: `GameShell` can import `GameHeader` (YAGNI until touched).

## Out of scope

- Compressing / resizing the 9MB PNG
- Adding `expo-image`
- Adaptive shorter banner per phase
- `web/`

## Verification

- Loading, setup, play, timeline, boss: banner visible at top
- Banner under status bar; brand text not clipped by Dynamic Island
- Black canvas (`#000`) unchanged under content
- Light status bar icons readable on banner
