# Deck Header Banner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `header.png` as a top banner on every product screen via App-level `GameHeader` with B′ safe-area sizing (`insets.top + 96`).

**Architecture:** New presentational `GameHeader` component. Mount once in `App.tsx` above loading and `DeckQuarterScreen`. Drop `top` from SafeAreaView edges so the banner bleeds under the status bar.

**Tech Stack:** Expo / React Native, `react-native-safe-area-context`, Vitest (existing mobile test patterns).

**Design:** `docs/plans/2026-07-24-deck-header-banner-design.md`

---

### Task 1: GameHeader component + test

**Files:**
- Create: `mobile/src/GameHeader.tsx`
- Create: `mobile/src/GameHeader.test.ts`
- Modify (optional later): `mobile/src/GameShell.tsx` — skip in this plan (YAGNI)

**Step 1: Write the failing test**

Vitest in this repo does not render RN trees. Follow the pattern of asserting module exports / pure sizing helper if needed. Prefer a tiny pure helper for height so we can TDD without a RN renderer:

```ts
// mobile/src/GameHeader.test.ts
import { describe, expect, it } from 'vitest'
import { bannerHeight } from './GameHeader'

describe('bannerHeight', () => {
  it('adds content band below safe-area inset', () => {
    expect(bannerHeight(0)).toBe(96)
    expect(bannerHeight(59)).toBe(155)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter mobile test -- src/GameHeader.test.ts`

Expected: FAIL — `bannerHeight` not exported / module missing.

**Step 3: Write minimal implementation**

```tsx
// mobile/src/GameHeader.tsx
import { Image, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const headerBanner = require('../assets/game-slices/header.png')

const CONTENT_BAND = 96

export function bannerHeight(topInset: number): number {
  return topInset + CONTENT_BAND
}

export function GameHeader() {
  const insets = useSafeAreaInsets()
  return (
    <Image
      source={headerBanner}
      style={[styles.banner, { height: bannerHeight(insets.top) }]}
      resizeMode="cover"
      accessibilityLabel="Divoké deväťdesiate"
    />
  )
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
  },
})
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter mobile test -- src/GameHeader.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add mobile/src/GameHeader.tsx mobile/src/GameHeader.test.ts
git commit -m "$(cat <<'EOF'
Add GameHeader with safe-area-aware banner height.

EOF
)"
```

---

### Task 2: Mount banner in App

**Files:**
- Modify: `mobile/App.tsx`

**Step 1: Wire GameHeader into both ready and loading trees**

In `App.tsx`:

1. `import { GameHeader } from './src/GameHeader'`
2. Change SafeAreaView `edges` to `['right', 'bottom', 'left']` on the ready tree (and loading tree for consistency).
3. Inside each SafeAreaView, render `<GameHeader />` above the existing content (loading `View` / `DeckQuarterScreen`).

Loading branch shape:

```tsx
<SafeAreaView style={styles.safe} edges={['right', 'bottom', 'left']}>
  <GameHeader />
  <View style={styles.loading}>
    <ActivityIndicator color="#f4e6c8" />
  </View>
</SafeAreaView>
```

Ready branch: same edges + `<GameHeader />` above `<DeckQuarterScreen ... />`.

Keep `StatusBar style="light"`. Keep `styles.safe` background `#000`.

**Step 2: Typecheck**

Run: `pnpm --filter mobile typecheck`

Expected: PASS

**Step 3: Run mobile tests**

Run: `pnpm --filter mobile test`

Expected: PASS (including GameHeader.test.ts)

**Step 4: Commit**

```bash
git add mobile/App.tsx
git commit -m "$(cat <<'EOF'
Show GameHeader on all deck product screens.

EOF
)"
```

---

### Task 3: Manual smoke (device / simulator)

**Files:** none

**Step 1: Start Expo**

Run: `pnpm --filter mobile start` (or existing iOS/Android script)

**Step 2: Check**

- [ ] Loading: banner visible under status bar
- [ ] Setup (empty deck): banner above archetype CTA
- [ ] Play: banner above DeckHud
- [ ] Timeline / boss: banner still present
- [ ] Title/tagline not clipped by notch; light status icons readable

**Step 3: No commit unless fixes needed**

If height feels wrong, adjust `CONTENT_BAND` only (keep formula `top + band`).
