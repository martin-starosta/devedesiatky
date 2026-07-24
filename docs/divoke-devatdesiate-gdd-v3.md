# Divoké deväťdesiate — GDD v3 (Roguelike Deckbuilder pivot)

**Genre pivot:** from event-driven party tycoon (v2) → **roguelike deckbuilder** (Balatro-style engine-building quarters + Slay-the-Spire-style election boss fights).
**Everything mission-critical from v2 survives:** the historical timeline, the Vyvolení-vs-Slovensko double score, Kult, Účet, fact cards, and the anti-nostalgia thesis. Only the *interaction model* changes — from spending action points to **building and playing a deck**.

This document describes only the delta from v2. Sections not mentioned here (tone, historical event content, fact-card rules, sensitivity guidelines, art direction) carry over unchanged.

---

## 1. Why the pivot works for us

- The reducer seam `(state, action, rng) => state` already in the repo models a deckbuilder *more* cleanly than the sim — playing a card is just an action.
- The content layer (`timeline.ts`, `kauzy.ts`, `npcParties.ts`, `partyFounding.ts`, fact cards) is genre-neutral data that transfers directly.
- Scope drops: a card + relic UI is far cheaper for a small team than a management sim with a map and poll model.
- **The thesis gets sharper.** Kauzy as *curse cards shuffled into your own deck* expresses "dirty power pollutes the machine you rely on" better than any hidden ledger could.

---

## 2. Structure: acts, quarters, bosses

Three **acts**, each ≈ two years, mapped to the real timeline:

| Act | Years | Engine quarters | Boss |
|---|---|---|---|
| I | 1993–1994 | 6 | **Voľby '94** |
| II | 1995–1996 | 8 | **Čierna diera / referendum pressure** (mid-boss + act boss) |
| III | 1997–1998 | 8 | **Voľby '98** (final boss) |

Within an act, each **quarter = one round** of engine-building. Between quarters: a short **acquisition step** (shop / patronage / event node). At the end of an act: an **election boss fight**.

---

## 3. Core loop — the engine quarter (Balatro half)

Each quarter you must clear a rising **kvóta** — the bar to stay politically viable. The bar rises every quarter (opposition organizes, expectations grow, the West watches). Miss it and you bleed Preferencie; miss it badly and the act boss starts with the advantage.

Per quarter:

1. **Draw** a hand from your deck (default hand 5, energy 3).
2. **Play cards** — political action cards that generate resources and combo:
   - *Míting*, *Bilbordy*, *Regionálna sieť*, *Tlak na médiá*, *Sľub*, *Kult event*…
   - Cards scale off state: e.g. *Kult event* scores more the higher your Kult; *Regionálna sieť* scores per office owned.
3. **Score against the kvóta** — like Balatro's chips×mult, but themed: base **Podpora** × **Mobilizácia** multiplier. Clearing the bar banks Preferencie; overkill converts to Pokladňa.
4. **Resolve** any drawn kauzy (see §5), then acquisition step.

The engine-building fantasy: assemble card synergies that reliably clear a rising bar. The dark twist: the most powerful cards are patronage cards that add kauzy to the deck.

---

## 4. Acquisition step — patronage as the shop

Between quarters, choose one node (StS map style):

- **Sponzor (patronage shop):** buy strong cards cheap with Pokladňa — but each adds 1–2 **kauzy** curse cards to your deck and an Obligation to that sponsor NPC.
- **Verejná súťaž (clean shop):** weaker cards, no kauzy, costs Reputácia-friendly cash.
- **Event node (?):** a historical timeline event fires (existing `timeline.ts` content) with a choice → reward or kauzy.
- **Inštitúcia node:** claim/upgrade a relic (§6).
- **Odpočinok:** remove one card from deck, or upgrade one (limited — removing kauzy should feel precious).

---

## 5. Kauzy — curse cards (the thesis mechanic)

Kauzy are cards shuffled into your own deck. They are the pivot's centerpiece.

- **Clog:** they take a hand slot and cost energy or do nothing useful — drawing them weakens the quarter.
- **Detonation:** each kauzy carries the v2 condition tags (a fired appointee, a journalist connecting deals, losing power). When a condition is met and the kauzy is *in hand or drawn*, it triggers: Preferencie/Reputácia hit, or it becomes **Nevymazateľná** (can't be removed at Odpočinok) until handled.
- **Médiá mute** (from closed issue #9) survives: high Médiá control suppresses detonation — you can literally bury kauzy by owning the press, at a Reputácia and Slovensko-index cost.
- Removing kauzy is expensive and limited → the player accumulates them faster than they can clean, exactly like the era. By Act III a dirty deck is visibly choking.

`kauzy.ts` logic (conditions, tags, mute) transfers; the mechanism changes from ledger entries to card instances.

---

## 6. Inštitúcie — relics

Passive rule-modifiers won as rewards or claimed at institution nodes:

- **Štátna TV (STV):** Kult cards cost 1 less energy; +1 Médiá.
- **SIS:** once per act, exile a kauzy from hand — but +hidden Pozornosť that feeds boss difficulty.
- **FNM predsedníctvo:** patronage cards cost less; sponsors give an extra card.
- **Interná bezpečnosť (interior ministry):** reduces detonation chance (police mute) — the relic the boss AI most wants to take from you if you lose.
- **Ústavná väčšina:** raise hand size to 6 while held.

Relics tie to the government/opposition state: losing an election boss can *strip* relics into the opposition's hands.

---

## 7. Election boss fights (Slay-the-Spire half)

At each act end, a rival-party boss with **telegraphed intents** — this is where `npcAi.ts` is reused as an intent generator, not thrown away.

- The boss (e.g. **Zjednotená opozícia** in Act III) telegraphs next-turn intents: `−8% smer: smear`, `mobilizuje mladých: +block`, `medzinárodný tlak`.
- You respond by playing cards across a 3–5 round fight: attack their Preferencie, block their smears, spend banked Pokladňa on campaign cards.
- **Phases / mechanics per boss:**
  - *Voľby '94:* single rival machine; learnable, teaches the boss format.
  - *Act II mid-boss (referendum):* introduces the sabotage choice — win cheap now by sabotaging (huge Slovensko-index + Reputácia hit, permanently strengthens the final boss) or play fair.
  - *Voľby '98:* the **Zjednotenie** boss — starts stronger the more kauzy in your deck and the more you sabotaged. High turnout modeled as escalating boss mult each round. This is where a dirty run comes due.
- **Win:** stay in government → unlock govt-only card pool + relics for next act.
- **Lose:** flip to the **opposition deck** — a different, leaner card set; your kauzy are now weaponized by the winner (detonation conditions relax). Surviving from opposition is the hardest, most instructive run.

---

## 8. The two scoreboards + Kult + Účet (unchanged mission layer)

- **Slovensko index** is a passive meter. Most high-scoring cards (especially patronage and Kult) push it *down*. It's never in the player's face during a quarter — only the epilogue forces the comparison.
- **Kult** is a resource built by cards (STV programming, megashow rallies). It **decouples your scoring engine from the Slovensko index** — Kult cards let you clear the kvóta while the country declines. Epilogue names it as spomienkový optimizmus.
- **Účet** is the post-1998 reckoning screen, unchanged from v2: sourced facts on bank bailouts, unemployment, VSŽ, Western exclusion, austerity. Closing line: *"Zlatá éra existovala. Len nie pre teba."* + the player's own Vyvolení-vs-Slovensko graph.

---

## 9. Meta-progression (new — the roguelike hook)

Fact cards become the meta-currency, so the educational layer *is* the unlock system:

- Collecting fact cards across runs unlocks new **starting decks** (party archetypes from `partyFounding.ts`), new relics into the pool, and new event nodes.
- **Ascension-style difficulty:** "Mečiarizmus I–X" — each tier raises kvóta growth, kauzy frequency, boss strength. Slovak-history flavored modifiers ("noc dlhých nožov: boss steals a relic on turn 1").
- Timeline/Časová os screen (already built, #7) becomes the collection gallery + the education KPI surface.

---

## 10. State & reducer model (engineer-facing)

New run state (extends existing types; resources carry over):

```
DeckRunState {
  act, quarter, phase,        // see §10.1 phase machine
  deck, hand, drawPile, discardPile, exhaustPile,
  energy, energyMax, handSize,
  quota, quotaBase,           // rising bar
  quarterPodpora,             // resets each PLAY quarter
  quarterMobilizacia,         // resets each PLAY quarter; floor 1 when scoring
  bossAdvantage,              // set by severe kvóta miss; consumed at BOSS start
  resources: { preferencie, pokladna, reputacia, media, koalicia, kult, slovenskoIndex, offices },
  kauzy: KauzaCard[],         // instances in deck, carry #9 condition tags
  relics: Relic[],
  sponsors: SponsorDebt[],    // Obligations, reused from v2
  govOrOpposition,            // flips on boss loss
  boss?: BossState,           // intents, round, bossSupport (hp-analogue)
  rngSeed,
  collectedFacts,             // meta
}
```

Actions (replace v2's SPEND_POLITIKA / ASSIGN_FNM set for the product path):
`START_RUN(archetype, seed)`, `DRAW_HAND`, `PLAY_CARD(id, target?)`, `END_QUARTER`, `SHOP_BUY(id)` / `SHOP_SKIP`, `TAKE_PATRONAGE(id)`, `RESOLVE_EVENT(choiceId)`, `REMOVE_CARD(id)` / `UPGRADE_CARD(id)`, `CLAIM_RELIC(id)`, `BOSS_PLAY(id, target?)`, `BOSS_END_TURN`, `COLLECT_FACT` / `DISMISS_FACT`.

Illegal actions for the current `phase` are no-ops (return same state). Keeps the `no-react.test.ts` guard and content-contract tests. `rng.ts` reused (shuffle, draw, boss variance, seeded replays for balance).

### 10.0 Scoring vocabulary (one sentence each)

| Term | Who sees it | Meaning |
|---|---|---|
| **Podpora** | In-quarter only | Base chips for this quarter's engine score; resets every PLAY. |
| **Mobilizácia** | In-quarter only | Multiplier for this quarter; resets every PLAY; treat as ≥1 when settling. |
| **Kvóta** | In-quarter HUD | Rising bar; score = Podpora × Mobilizácia must meet/beat it. |
| **Preferencie** | Always on HUD | Political viability meter; banks from cleared kvótas; bleeds on miss; boss fight stake. |
| **Boss support** | Boss HUD only | Rival's hp-analogue (Preferencie pressure on *them*); not the player's Preferencie. |

### 10.1 Phase machine (locked)

Acquisition is one parent phase with a `node` discriminant (`shop-clean` | `shop-patronage` | `event` | `institution` | `rest`). MVP-A may offer a subset of nodes per step; unchosen types are simply absent from the offer, not separate top-level phases.

| From | Trigger | To | Notes |
|---|---|---|---|
| (none) | `START_RUN` | `DRAW` | Seed RNG, build starting deck, set Act I Q1 kvóta. |
| `DRAW` | `DRAW_HAND` (or auto after enter) | `PLAY` | Draw up to `handSize`; reset Podpora/Mobilizácia; refill energy. Run kauzy **on-draw** checks (§10.3). |
| `PLAY` | `PLAY_CARD` | `PLAY` | Spend energy; apply card effects (§10.2). Energy 0 does not auto-end. |
| `PLAY` | `END_QUARTER` | `RESOLVE` | Allowed with energy remaining. |
| `RESOLVE` | (internal, atomic) | `ACQUIRE` or `BOSS` or `FACT` | Settle kvóta (§3); run kauzy **on-resolve** checks; then route. After Q1–Q5 → `ACQUIRE` (optionally via `FACT` if a fact is pending). After Q6 settle → `BOSS` (fact pending may insert before boss). |
| `FACT` | `COLLECT_FACT` / `DISMISS_FACT` | prior next | Returns to the phase that queued the fact (`ACQUIRE` enter, or `BOSS` enter). |
| `ACQUIRE` | node complete (`SHOP_*` / `TAKE_PATRONAGE` / `RESOLVE_EVENT` / `CLAIM_RELIC` / `REMOVE_CARD` / `UPGRADE_CARD` / skip) | `DRAW` | Advance quarter calendar; raise kvóta; enter next DRAW. |
| `BOSS` | `BOSS_PLAY` | `BOSS` | Player turn inside fight. |
| `BOSS` | `BOSS_END_TURN` | `BOSS` | Resolve telegraphed intent; roll next intent; advance round. |
| `BOSS` | win/lose rule (§10.4) | terminal / `FACT` | MVP-A ends after outcome (+ optional fact). Gov/opposition flip on loss. |

### 10.2 Closed card-effect schema (locked for MVP-A)

Card definitions in content are data only. The reducer interprets a **closed** `effects: CardEffect[]` list — no free-form scripts. Unknown effect types are a content-contract failure.

```
CardEffect =
  | { type: 'addPodpora'; amount: number }
  | { type: 'addMobilizacia'; amount: number }
  | { type: 'addPodporaPer'; stat: 'kult' | 'offices' | 'media'; amount: number }
  | { type: 'addMobilizaciaPer'; stat: 'kult' | 'offices' | 'media'; amount: number }
  | { type: 'gainResource'; resource: 'preferencie' | 'pokladna' | 'reputacia' | 'media' | 'kult' | 'koalicia' | 'offices'; amount: number }
  | { type: 'gainEnergy'; amount: number }
  | { type: 'draw'; amount: number }
  | { type: 'addKauza'; kauzaTypeId: string; count?: number }  // default count 1
  | { type: 'bossDamage'; amount: number }                     // BOSS phase only; else no-op
  | { type: 'bossBlock'; amount: number }                      // BOSS phase only; else no-op
```

- Energy **cost** and tags (`patronage` | `kult` | `campaign` | `kauza` | …) live on the card def, not as effects.
- Relics modify costs/rules in the reducer (not via open-ended card scripts).
- Kauza curse cards use the same schema; typical curse: empty useful effects + high cost / `addKauza` never on play — clog is enough. Detonation is **not** a card effect; it is §10.3.

### 10.3 Kauzy evaluation points (locked)

Kauzy are card instances in piles/hand. Condition tags reuse v2: `journalist` | `defector` | `lossOfPower` (extensible later). Evaluate **only** at these points:

1. **On draw** — when a kauza enters `hand` during `DRAW_HAND` or a `draw` effect: if any of its conditions are already *armed* this act/quarter, attempt detonation immediately.
2. **On resolve** — at start of `RESOLVE` (before kvóta settle): for each kauza **in hand**, attempt detonation for conditions armed this quarter.
3. **On condition arm** — when gameplay arms a condition (e.g. event choice, card tag, media pressure crossing a threshold, boss loss → `lossOfPower`): scan **hand only** (not draw/discard) and attempt detonation for matching latent kauzy.
4. **Mute check** — at each detonation attempt: if `media >= muteThreshold`, status → muted path (Reputácia cost + reduced Preferencie hit; Slovensko-index cost hook for MVP-B). Else full detonation, or mark **Nevymazateľná** when the content flag says so instead of removing pressure.
5. **Never** on passive shuffle, shop browse, or relic claim unless that action explicitly arms a condition or draws the card.

Armed conditions clear at quarter boundary unless marked persistent (MVP-A: `lossOfPower` arms only on boss loss / leaving government).

### 10.4 Voľby '94 boss win/lose (locked for MVP-A)

Learnable single-rival fight; 3–5 rounds (`maxRounds = 5`).

- **Boss support** (hp-analogue): starts at a fixed base (content tunable, default **40**), plus bonuses from `bossAdvantage` and SIS **Pozornosť**.
- **Player block** resets each player turn; absorbs smear Preferencie damage.
- Player turn: `BOSS_PLAY` cards (`bossDamage` / `bossBlock` / resource spends) then `BOSS_END_TURN`.
- After player ends turn: resolve telegraphed intent (smear → Preferencie loss after block; mobilize → boss gains block; international pressure → Reputácia hit / next-intent buff); telegraph next intent; `round++`.

**Win:** `bossSupport <= 0` before rounds exhaust → stay in government.  
**Lose:** `resources.preferencie <= preferencieFloor` (default **5**) at any check after an intent, **or** `round > maxRounds` with `bossSupport > 0` → opposition flip; arm `lossOfPower`; weaponize kauzy (detonation conditions relax / hostile hands).  
Do **not** use v2 kampaň / volebná noc / koalícia / noc dlhých nožov staging on the product path.

---

## 11. Migration plan (strangler-fig — don't break main)

**Phase 0 — decide & document.** This GDD lands in `docs/`. Spec #26 supersedes issue #1 (v2 election-as-staged-sim). MVP-A slices: #27–#35.

**Phase 1 — deck reducer alongside the sim.** Add deck modules inside `@devedesiatky/simulation` (reducer, card engine, boss engine) and card/relic/kauza content in `@devedesiatky/content`. Reuse `rng`, resource names, and existing timeline/kauzy/NPC content. The existing v2 `GameState`/`reduce` keeps compiling and tested until the deck path is the default entry. Tests-first fixtures:
- clean run clears Act I kvótas,
- kauzy-choked run fails a late-act kvóta,
- boss fight win/lose flips gov/opposition.

**Phase 2 — content as cards.** Author card definitions (closed `CardEffect` schema §10.2); port patronage deals → patronage cards; port kauzy → curse-card instances (condition data already exists).

**Phase 3 — UI swap (Expo iOS-first).** Product client is `mobile/` (Expo). Reuse shell patterns: HUD, Event overlay, Časová os, setup → archetype/deck select, game router. New screens: Hand/combat, Map/acquisition, Shop, BossFight. Stop extending Politika / FNM / Snem-as-sim as the primary loop (web remains non-product / reference). Shared packages must stay framework-agnostic.

**Phase 4 — meta layer.** Fact-collection unlocks + Ascension tiers (MVP-C).

**Retire vs keep at a glance:**
- Keep: `rng.ts`, `@devedesiatky/content` timeline/facts/party founding, kauzy condition/mute tunables, `npcAi` ideas → boss intents, theme tokens, Event overlay, Časová os, HUD, setup, shell router, reducer/test discipline.
- Rewrite: politika/patronage *interaction* → card effects + shops; reducer action set → deck actions.
- Retire/repurpose on product path: Politika screen, FNM screen, Snem-as-sim, v2 election staging.

---

## 12. MVP scope (v3)

**MVP-A — the loop:** Act I only (6 quarters + Voľby '94 boss), 1 archetype, ~20 cards, ~5 kauzy types, 3 relics, engine quarter + acquisition (patronage + clean shop required; other nodes may stub) + one boss. Contains the full thesis: engine-building → patronage → kauzy-clog → boss reckoning. Locked rules: §§10.0–10.4.

**MVP-B — full run:** all 3 acts, gov/opposition flip as ongoing mode, Kult + Slovensko index + Účet, all timeline events as nodes.

**MVP-C — roguelike depth:** meta-unlocks, Ascension, more archetypes, daily seed.

**Cut for v1:** multiplayer, post-1998 content, real-person characters, custom card editor.
