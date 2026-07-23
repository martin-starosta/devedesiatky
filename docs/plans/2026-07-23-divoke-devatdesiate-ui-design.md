# Divoké deväťdesiate — UI / Art Design Brief

**Date:** 2026-07-23  
**Product:** Divoké deväťdesiate (The Wild Nineties)  
**Source GDD:** `docs/divoke-devatdesiate-gdd.md`  
**Status:** Approved (brainstorming)

---

## 1. North star

**Product:** Web arcade political party tycoon. Educational fun; Slovak first; 20–30 minute runs covering 1993–1998.  
**Audience:** Players who want a juicy arcade session. History arrives as skippable “Čo sa naozaj stalo” fact cards, not homework.  
**Design read:** In-game arcade HUD in a contemporary Slovak crime-thriller skin, with Clash-depth juice and Tropico satire — not 90s museum cosplay.

**One-line brief:**  
You operate the machine of power in a graphite / blood-red pulp world; the HUD feels like a mobile arcade game; the world feels like a Soltész cover that learned to smile.

### Mood stack (priority order)

1. **Sviňa (film cover)** — grit, pig-in-a-suit grotesque, blood-red accent, brutal sans  
   - Ref: https://www.artforum.sk/katalog/138400/svina-filmova-obalka
2. **Clash Royale dashboard** — shallow UI, chunky meters, bright primary CTA, card readability  
   - Ref: https://dribbble.com/shots/25949663-Clash-Royale-Game-Dashboard-UI
3. **iGaming polish** — dense but legible resource strip, reward FX without casino kitsch  
   - Ref: https://dribbble.com/shots/23841974-iGaming-Platform-Jogo
4. **Tropico** — caricature archetypes, funny-not-mournful power fantasy  
   - Ref: https://en.wikipedia.org/wiki/Tropico_(video_game)
5. **Period evidence only** — FNM stamps, brick phones, VHS stills as props *inside* the thriller frame

### Explicitly not

- Burgundy congress carpet as brand surface  
- Gold chrome UI bezels / warm paper nostalgia  
- VHS-as-the-whole-aesthetic  
- Admin-dashboard density without arcade hierarchy  
- Real likenesses of living people

### Shell name

**Pulp Power** (Hybrid C, revised): Tropico power-fantasy readability + Clash juice on the loop + *Sviňa* pulp as the world skin. State-TV language reserved for election night; patronage table pattern reserved for FNM.

### Locked Centrála visual target (2026-07-23)

Player-approved mock: `docs/design-refs/centrala-dashboard-target.png`

**Keep from this mock**
- Pig-in-suit boss silhouette as brand mascot (fictional, never a real likeness)
- Night asphalt / Hotel Sláva atmosphere behind the HUD
- Metal bolted scoreboard strip: Preferencie · Pokladňa · Koalícia · Kauza oko
- Torn-paper “Centrála strany” board with polaroid HQ + sticky-note schedule
- Dense 2×3 action tile grid with chunky icons
- Signal-yellow primary CTA + bottom Politika / Fond / Centrála dock
- Stamps, envelopes of cash, CRT TV, megaphone as period *props*

**Adapt to GDD (do not copy blindly)**
- Title spelling: **Divoké deväťdesiate** (not “devätdesiate”)
- CTA maps to turn flow: “Ďalší ťah” / open Politika, not a free-roam “deň” loop unless we redesign the sim
- Action tiles map to existing systems (Politika AP, FNM, médiá, kauzy), not a new idle upgrade tree
- Preferencie stays the Clash-scale master number; avoid packing four equal-weight hero metrics

**Tone line from mock (keep):** *Ty si šéf. Morálka je voliteľná.*

---

## 2. Visual system

### Palette (locked)

| Token | Hex | Role |
|---|---|---|
| Soot | `#0E0E10` | Page ground |
| Graphite | `#1C1F24` | Panels / HUD wells |
| Bone | `#E8E2D6` | Primary text / preferencie hero number |
| Ash | `#8B9098` | Secondary labels |
| Blood | `#C8102E` | Kauzy, danger, critical titles, Kult heat |
| Signal | `#F5C518` | Primary CTA / payoffs only (one job) |
| Mint | `#B8D4A8` | Soft positive (poll up, Reputation gain) — never compete with Signal |

No gold. No burgundy carpet fill. Warmth only from Bone + Signal sparks.

### Typography

- **Display / titles:** Condensed brutal sans (e.g. Druk / Impact-adjacent web face). Tight tracking; all-caps sparingly.  
- **UI / body:** Clean grotesk (e.g. Geist / Satoshi). Never Georgia. Never Inter-as-default nostalgia.  
- **Numbers** (preferencie, pokladňa): Tabular mono or display sans, oversized, readable at thumb distance.

### Materials

- Surfaces: wet concrete, bathroom tile grain, cheap hotel marble, night asphalt — photographic texture under dark overlays.  
- UI chrome: 1px Bone/Ash hairlines, soft inset wells, no ornate gold bezels.  
- Grain: light film noise on full-screen moments only (events, election night), not on every meter.

### Shape

- Radius: 8–12px panels; sharp corners OK on event cards.  
- Cards: thick silhouette borders, high-contrast face art (Tropico caricature, *Sviňa* lighting).  
- Depth: Clash shallow — max one overlay; previous screen always peeking.

### Motion juice

- Poll swing, koruna rain, kauza Eye pulse, election needle — springy, short, readable.  
- `prefers-reduced-motion`: instant value swaps; no rain / needle scrub.

---

## 3. Screens & interaction patterns

### Persistent shell

- **Resource strip:** quarter/date · preferencie (hero) · pokladňa · koalícia bar · Eye (kauzy pressure).  
- **Bottom nav (mobile-first):** Centrála · Snem · FNM (government only) · Časová os.  
- Max **one** overlay at a time.

### Screen map

| Screen | Job | Pattern |
|---|---|---|
| **Centrála** | Turn HQ | Dense resource board + 2–3 Politika AP slots. Preferencie graph is the visual hero (Clash-scale number). Ujo Fero as a thin side quip, not a cutscene. |
| **Snem** | Coalition math | Seat arc / wedge viz; live majority readout. Drag ministries only in coalition minigame, not every turn. |
| **FNM** | Patronage toy | Physical card table: company → Sponzor / Partner / Verejná súťaž / Delay. Drop = koruna FX or Reputation ping + hidden kauza tick. |
| **Event overlay** | History beat | Illustrated pulp card, 2–3 role-dependent choices, flip to fact card (max 3 sentences, skippable). Tile/concrete backdrop; Blood only when the card earns it. |
| **Volebná noc** | Boss spectacle | State-TV language *here only*: lower-thirds, district ticker, arcade needle. Champagne vs funeral cutaway. |
| **Časová os** | Education layer | Collectible fact strip; clean dossier, not scrapbook. Education metric lives here. |
| **Epilogue / Účet** | Thesis | Dvojité skóre graph (Vyvolení vs Slovensko) + closing line. Pulp still, then cold ledger. No joke sting. |

### Interaction rules

- Turn target: under 90 seconds (GDD complexity rule).  
- Primary actions = Signal; destructive / kauza-linked = Blood; neutral = Bone outline on Graphite.  
- Drag-drop is sacred on FNM + Noc dlhých nožov; everywhere else prefer tap.  
- Fact cards never block juicy number feedback — numbers animate first; fact is optional flip.

---

## 4. Characters, illustration & anti-nostalgia UI

### Illustration

Flat vector + harsh *Sviňa* lighting (one hard key, deep shadow). Caricature archetypes, invented faces — never likenesses of living people. Silhouettes readable at card size. Pig-as-metaphor is tonal (greed, rot), not a literal mascot on every screen.

### Cast treatment

- **Sponzori** — four distinct oligarch cards (appetite icons, risk pip for kauza size).  
- **Riaditeľ Fondu** — cheerful clerk energy; patronage UI face.  
- **Kapitán** — service silhouette; loyalty follows the appointer.  
- **Pani redaktorka** — fuse-lighter; Eye reacts when she is in play.  
- **Veľvyslanec** — cold handshake = Reputation FX.  
- **Ujo Fero** — Greek chorus; ~3 lines/act generated from the player’s ledger (brother/factory, mother/kupónka, daughter/Vienna).

### Anti-nostalgia on screen (not a lecture)

- **Dvojité skóre:** Vyvolení (player meters) vs Slovensko index as a persistent scissors chart — ignorable mid-run, unavoidable in epilogue.  
- **Kult:** Signal glow that props preferencie while Slovensko bleeds; epilogue names the mechanic.  
- **Účet:** final sourced ledger card; closing line *„Zlatá éra existovala. Len nie pre teba.“* + the player’s own scissors graph.

### Tone guardrails

Únos / Výbuch: no profitable juice, no comedy FX, respectful fact cards. Arcade fun elsewhere; reckoning moments stay cold.

---

## 5. MVP scope, deliverables & success

### MVP 1 visual scope (1993–1994 slice)

Ship the shell + juice on the loop that proves the thesis:

- Centrála  
- FNM table (6 companies, 2 sponsors)  
- Event overlay (5 cards)  
- Voľby ’94 needle  
- Basic Časová os  
- 3 NPC party colors / silhouettes  

Defer: full Snem polish, Kult meter chrome, epilogue art (MVP 2).

### Deliverables

1. Locked tokens (palette, type, radius, motion rules) in `web/src/ui/theme.css`  
2. Screen wire → hi-fi pass for Centrála + FNM + Event + Election night  
3. One character sheet (sponsor set + Ujo Fero)  
4. Fact-card + kauza Eye component specs  
5. Do/Don’t mood board (*Sviňa* ✓ · carpet/gold ✗ · Clash juice ✓)

### Success criteria

- First viewport of Centrála reads as arcade game, not admin dashboard or nostalgia museum.  
- Blind test: “mobile game HUD” before “history app”.  
- Patronage drop feels better than reading a paragraph.  
- Sensitive events never feel like loot moments.  
- Turn stays under 90s; fact cards skippable without losing the payoff animation.

### Out of scope for v1 art

Multiplayer skins, real-person portraits, full STV chrome outside election night, burgundy/gold “congress” retheme.

---

## 6. Relationship to current code

Existing `web/src/ui/theme.css` uses carpet burgundy, gold, Georgia/paper tokens — **superseded by this brief**. Implementation should replace those tokens and restyle Centrála / Setup to Pulp Power without changing simulation rules.

Stack (from GDD, unchanged): React + TypeScript, Zustand, Framer Motion / Motion, client-side MVP.

---

## 7. Decision log

| Decision | Choice | Why |
|---|---|---|
| Center of gravity | Hybrid C → Pulp Power | Arcade + Tropico + Slovak thriller, not museum |
| Primary mood ref | *Sviňa* film cover | User rejected carpet/gold as oldschool |
| Primary CTA color | Signal yellow, not gold | Clash readability; gold reads nostalgia |
| STV language | Election night only | Avoid “news app” between bosses |
| Patronage UI | Card table | Core loop must feel tactile |
| Sensitive cards | No arcade loot FX | Respect + GDD risk mitigation |
