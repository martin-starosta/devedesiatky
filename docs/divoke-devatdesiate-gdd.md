# Divoké deväťdesiate — Game Design Document v2

**Working title:** Divoké deväťdesiate (The Wild Nineties)
**Genre:** Arcade political party tycoon
**Platform:** Web (desktop + mobile browser)
**Session length:** 20–30 minutes per run (full 1993–1998 campaign)
**Tone:** Arcade-fun, fast and juicy, with real history delivered through short "Čo sa naozaj stalo" fact cards
**Language:** Slovak first, English localization later

---

## 1. Pitch

It's January 1993. Slovakia just became independent — and you lead a political party in a brand-new state where everything is up for grabs: ministries, the secret service, state TV, and billions in state property waiting to be privatized.

You have five years and **two elections (1994 and 1998)**. NPC parties fight you for every percentage point. To win you need money; legal party financing is pocket change, so the real fuel is **patronage** — handing state companies to sponsors who fund your campaigns. Every deal buys votes today and grows a **kauza** (scandal) that may detonate tomorrow.

The endgame is history itself: the September 1998 elections, 84 % turnout, a united opposition. The question the game asks — the question of the whole era — is: **can you hold power without becoming the thing that gets voted out in '98?**

Every major in-game event is based on a real one. You play the fiction; the fact cards teach the history.

---

## 2. Design pillars

1. **Fast and juicy.** Quarterly turns, big poll swings, election-night needle drama, koruna rain when a sponsor pays up. Arcade first.
2. **History as the level design.** Real events fire on real dates and set the difficulty curve; the two real elections are the bosses.
3. **You are the incentive structure.** The era's core dynamic — power needs money, money comes from state property, property creates scandals, scandals threaten power — is the literal game loop.
4. **Facts ride on fun.** Fact cards: max 3 sentences, skippable, collectible.
5. **Fictional parties and people, real events and institutions.** NPC parties are recognizable archetypes with invented names; real names of officials appear only in factual popup cards.
6. **Proti spomienkovému optimizmu.** The game's mission: dismantle the "za Mečiara bolo dobre" myth — not by lecturing, but by letting the player manufacture the myth themselves and then handing them the bill. The golden era was golden **iba pre vyvolených**; the game makes that measurable.

---

## 3. Setup — found your party

Player picks (or randomizes) a party identity:

- **Ideology sliders:** národný ↔ občiansky, sociálny ↔ trhový, Východ ↔ Západ (geopolitical orientation)
- Sliders determine your **voter base** (which demographic pools you draw from) and which NPC parties are natural coalition partners vs. blood enemies.
- Start: 8–12 % preferencie, near-empty pokladňa, 3 regional offices.

Optional preset: play a Hnutie-like dominant machine (power-preservation challenge) or a small challenger (insurgent challenge). Two very different games from the same systems.

---

## 4. Core loop

Each turn = **one quarter**, 1993 Q1 → 1998 Q3 (23 turns + 2 election specials).

1. **Politika phase** (2–3 action points)
   - *In government:* pass policies, appoint loyalists (SIS, state TV, FNM board), call referendums, pressure media
   - *In opposition:* rallies, kauza investigations, unite-the-opposition diplomacy, foreign trips (Brussels/Washington photo ops → Reputation)
2. **Peniaze phase — the patronage engine** (government only; opposition fundraises the hard way)
   - The FNM presents 2–4 state companies ready for privatization. Assign each to:
     - **Sponzor** → cash to your pokladňa, +1 hidden Kauza token
     - **Koaličný partner** → Koalícia stability up, partner stops threatening to walk
     - **Verejná súťaž** → Reputation up, no money, coalition grumbles
   - Or **cancel/delay** (companies keep bleeding, unions angry)
3. **Event card** — historical event fires; choices differ by whether you're in government or opposition.
4. **Poll tick** — preferencie update with satisfying animated swing; fact card; next quarter.

---

## 5. Resources

| Resource | What it is | Key tension |
|---|---|---|
| **Preferencie (%)** | Poll support — the master number, always on screen | Everything feeds it; nothing holds it |
| **Pokladňa (Sk)** | Party funds — campaigns, billboards, regional offices | Legal income is tiny; patronage is the only way to scale |
| **Koalícia** | Stability of your government (if in one) | Partners demand ministries and companies; feeding them starves your sponsors |
| **Kauzy** | Hidden scandal tokens from dirty deals | Each has a fuse — journalists, defectors, or the '98 handover can light it |
| **Reputácia** | International/civic standing | Gates Western support and the good endings; most power moves damage it |
| **Médiá** | Control of the information space | State TV control mutes kauzy but radicalizes independent press and Reputation |

**The signature mechanic — Kauzy have memory.** Every patronage deal writes an entry into an invisible ledger. Kauzy don't fire on a timer — they fire when *conditions* are met: a fired appointee talks, a journalist connects two deals, or you lose power and the new government opens the archives. The player learns viscerally why regimes fight so hard to never lose power — which is the era's darkest and most important lesson.

---

## 6. NPC parties (archetypes)

Six AI parties with distinct strategies, fictional names, recognizable silhouettes:

- **Hnutie** — dominant populist machine built around one charismatic leader; masters of patronage; the gravity well of 90s politics. (If the player doesn't play this archetype, Hnutie is the main antagonist.)
- **Národniari** — loud nationalists; cheap coalition partner, expensive reputation.
- **Robotnícka strana** — protest workers' party; chaotic, sells its votes turn by turn.
- **Ľavica** — post-communist left; big stable base, slow, courted by everyone.
- **Kresťanskí demokrati** — principled, coalition-averse, immune to your sponsors.
- **Maďarská koalícia** — regional bloc; reliable partner for a Western-facing player, toxic for a nationalist one.

**1997 special:** if the government's Kauzy and authoritarian moves cross a threshold, the AI opposition parties trigger **Zjednotenie** — they merge into a united bloc (the SDK moment). The player sees the doom meter forming in real time. Fact card: in 1997 five opposition parties formed a single coalition, the move that made the 1998 defeat of the regime possible.

**Oligarchs as NPCs:** the sponsor pool — Železný barón, Fondový žralok, Tichý spoločník, Pán čistý — each with appetite (which industries), generosity, and riskiness (Kauza size per deal). They remember. In 1998, prosecutors follow the trail of exactly what you handed to whom.

---

## 7. Elections — the boss fights

**Voľby '94 and Voľby '98** are multi-stage specials:

1. **Kampaň (3 mini-turns):** allocate pokladňa across regions and channels — billboards, rallies, TV spots (cheap if you control state TV — with a Reputation bill), negative ads (preferencie theft with backlash risk).
2. **Volebná noc:** arcade needle — exit poll vs. real count drama, district-by-district ticker.
3. **Skladanie vlády:** coalition negotiation minigame. Offer ministries, the FNM chairmanship, the interior ministry (controls police — mutes Kauzy; the AI knows its value and charges for it).
4. **Noc dlhých nožov** (post-'94 event): the winning coalition divides state institutions in an overnight parliament session. The player literally drags institution cards to coalition partners. Fact card: on 3–4 November 1994, the new majority replaced leadership of key state institutions in a single overnight sitting.

Losing an election ≠ game over — it flips you to opposition play, and your Kauzy ledger is now in hostile hands. Surviving that is the hardest, most instructive run in the game.

---

## 8. The historical timeline (event cards)

Same real spine as v1, now with role-dependent choices:

**1993** — *Vznik republiky* (tutorial); *Kupónka* — as government you decide: continue the second coupon wave (citizens happy, sponsors furious — you're giving away their companies) or cancel it and switch to direct sales (the patronage engine unlocks at full power, hidden Trust debt with voters). Fact: the second wave was cancelled in 1995; citizens received FNM bonds (nominal 10,000 Sk) while direct sales transferred enterprises to pre-selected buyers at deep discounts.

**1994** — *Pád vlády* (a defection topples the PM — Koalícia mechanics tutorial; fact: March 1994 parliamentary recall and the interim government); *Voľby '94* (boss fight #1); *Noc dlhých nožov*.

**1995** — *Fond rozdáva* (patronage golden window opens); *Únos* — the president's son is abducted. As government: investigate honestly (Koalícia crisis, Reputation up) or contain it (Kauza+++, media war). As opposition: your biggest weapon, if you dare use it. Fact: 31 August 1995, Michal Kováč Jr. was abducted to Austria; the investigation pointed to the SIS and the case poisoned politics for years.

**1996** — *Výbuch* (the witness-link car bomb; the game's tonal floor — no profitable choice exists on this card, deliberately; fact: April 1996, Róbert Remiáš); *Čierna diera* (the West locks the door; Reputation-gated paths close; fact: exclusion from the first EU/NATO wave).

**1997** — *Zmarené referendum* — as government you can sabotage the referendum (short-term save, huge Reputation/Zjednotenie trigger) or let it run. Fact: May 1997, ballots issued with the fourth question removed; the referendum was invalidated. *Zjednotenie* — the opposition unites (see §6).

**1998** — *Amnestie* — if you're the regime with heavy Kauzy, the devil's bargain card: amnesty everything (Kauzy frozen… unless annulled later — the fact card notes the real amnesties were annulled in 2017). *Voľby '98* — final boss, record turnout modeled: high mobilization structurally favors the opposition.

Minor deck (~15 cards): defector with a briefcase, nebankovka wants to sponsor you (trap), a German chancellor's cold handshake, mafia offers "election security" in the East, students marching, the party ples.

---

## 9. Endgame & scoring

After Voľby '98, the epilogue simulates 1998–2002 in a 60-second montage:

- **Held power cleanly** (won '98 with low Kauzy): *"Štátnik"* ending — rarest, biggest score multiplier.
- **Held power dirty:** *"Čierna diera"* — isolated internationally, economy bleeding, score capped. The game shows what the country pays for your win.
- **Lost power, low Kauzy:** *"Demokrat"* — you hand over power, survive politically, comeback teased. Honorable score.
- **Lost power, heavy Kauzy:** *"Vyšetrovaný"* — archives open, sponsors flee abroad, the ledger you built all game scrolls past as the credits.
- Opposition-start victory in '98: *"Zmena"* — the historical outcome, played from the other side.

Score = preferencie at end × Reputation multiplier × fact-cards collected. The **Časová os** screen keeps the collectible history layer (23 major + 15 minor facts).

---

## 9c. Proti spomienkovému optimizmu — the anti-nostalgia systems

This is the mission layer. Three mechanics that turn "it wasn't a golden era" from a message into an experience:

### Dvojité skóre — Vyvolení vs. Slovensko

Two scoreboards run the whole game, side by side:

- **Vyvolení:** your preferencie, pokladňa, sponsors' net worth — the numbers the player is optimizing.
- **Slovensko index:** unemployment, average real wage, savings of ordinary citizens, regional decay, emigration of young people, health of state banks.

Most power moves push the two lines **in opposite directions**. Stripping a factory: sponsor +200M Sk, 3,000 jobs in Považie gone. Cancelling kupónka: patronage engine unlocked, citizens' books turn to paper. The player watches the scissors open in real time — and because they're busy winning, they mostly ignore the bottom line. Exactly like people did then. The epilogue makes them look at it.

### Kult — nostalgia as a manufactured resource

A new government-only resource: **Kult** (personality cult / "otec národa" meter). The player *builds* nostalgia deliberately:

- Actions: state TV celebration programming, megashow rallies, Gabčíkovo-style pride projects, "my sme si dali Slovensko" anniversary events.
- Effect: Kult keeps **preferencie artificially high even as the Slovensko index falls** — it decouples perception from reality. It's the strongest tool in the game and it feels great to use.
- The punchline: the epilogue names the mechanic. *"Kult, ktorý si vybudoval, prežil tvoju vládu. Volá sa spomienkový optimizmus — a hlasuje dodnes."* The player realizes today's nostalgia isn't a memory of how things were — it's the residue of a machine they personally operated for twenty turns.

### Účet — the bill

The final card of every run, after the epilogue, regardless of ending: a plain, sourced reckoning of what the era actually cost, in fact-card style. Draft content (all documented, to be sourced precisely during content production):

- State banks left loaded with bad loans from political lending; their post-1998 rescue and restructuring cost the state on the order of a hundred billion korún — paid by taxpayers, not by the vyvolení.
- Unemployment climbing toward the highest levels in the region by the end of the decade; whole regions around stripped factories never fully recovered.
- The flagship steelworks — the largest employer in the East — brought to the edge of collapse by 1998 under its privatized management.
- Exclusion from the first EU/NATO/OECD wave: years of lost investment and a "black hole" reputation that took a decade to repair.
- Austerity packages after 1998 that ordinary households paid so the books could be cleaned.

Closing line of the game: **"Zlatá éra existovala. Len nie pre teba."** — followed by the player's own Vyvolení-vs-Slovensko graph from their run.

### Ujo Fero's family — the human mirror

The stats need a face. Ujo Fero's side comments track his family through the player's own decisions: his brother works at the strojárne the player's sponsor stripped; his mother put her kupónová knižka into a fund; his daughter is deciding between nursing school in Trenčín and a ticket to Vienna. None of it is a cutscene — it's three lines of dialogue per act, generated from the player's actual ledger. The most personal consequence system in the game, and the cheapest to build.

---

## 10. Characters

- **Sponzori** — the four oligarch NPCs (§6), your Faustian rolodex.
- **Riaditeľ Fondu** — your patronage interface; cheerful, terrifying.
- **Kapitán** — man from "the service"; his loyalty follows whoever appointed him. Appointing him is a choice you'll regret either way.
- **Pani redaktorka** — independent journalist; the Kauza fuse-lighter. Pressuring her works, once.
- **Veľvyslanec** — Western ambassador; hands out Reputation and cold handshakes.
- **Ujo Fero** — your driver since the founding congress; Greek chorus, moral compass, comic relief.

---

## 11. UI / screens

1. **Centrála** (main) — party HQ dashboard: preferencie graph front and center, pokladňa, koalícia bar, the Eye (Kauzy pressure), quarter/date.
2. **Snem** — parliament view; seat arcs by party, coalition math visualized live.
3. **FNM screen** — companies to distribute; drag company card onto sponsor/partner/auction slots.
4. **Event overlay** — illustrated card, role-dependent choices, fact-card flip.
5. **Volebná noc** — the needle, the ticker, the champagne-or-funeral cutaway.
6. **Časová os** — collected fact cards as a readable history of 1993–1998.

**Art direction:** 90s Slovak vernacular — VHS grain, congress-hall carpets, marbled suits, brick phones, state-TV lower thirds. Flat vector + halftone. Synth-folk soundtrack, funny not mournful.

---

## 12. Technical design

- **Stack:** React + TypeScript, Zustand, Framer Motion. Client-side only for MVP; static deploy (Azure Static Web Apps).
- **Data-driven content:** parties, events, companies, fact cards in TS/JSON content files — historians and writers contribute without touching engine code; EN localization = content task.
- **Simulation core:** deterministic quarterly reducer + seedable RNG → replays, balance tests, daily-challenge mode. Poll model: demographic pools × ideology distance × momentum, simple enough to tune in a spreadsheet.
- **AI parties:** utility-based (each archetype scores actions by its strategy weights) — predictable enough to learn, varied enough to replay.
- **Saves:** localStorage in production (in-memory only for any Claude-artifact prototype).
- **Education metric:** track fact-card opens and "Zisti viac" clicks.

---

## 13. MVP scope

**MVP 1 — vertical slice:** 1993–1994 (8 turns + Voľby '94), 3 NPC parties, patronage engine with 6 companies + 2 sponsors, 5 event cards, election night needle. This slice already contains the whole thesis: patronage → money → votes → kauzy.

**MVP 2 — full campaign:** all 23 turns, 6 parties, Zjednotenie logic, both elections, endgame epilogue.

**MVP 3 — polish:** art pass, sound, minor deck, opposition-start mode, daily challenge, teacher/timeline print mode.

**Cut for v1:** multiplayer, post-1998 content, real-person characters, custom scenario editor.

---

## 14. Risks & mitigations

- **Sensitivity:** cards involving victims (Únos, Výbuch) are deliberately unprofitable — moments of reckoning, not opportunities; fact cards treat them with straight respect. Playtest with people who lived it.
- **Legal:** no living real persons as characters; fact cards state documented public facts with sources; fictional party/company names checked against real marks.
- **"Both-sides-ism" risk:** the systems themselves judge — dirty power wins short-term and loses the epilogue. The thesis is structural, not preachy.
- **Complexity creep:** political sims drown in menus. Rule: if a turn takes over 90 seconds, cut a system.

---

## 15. Why this frame wins

v1 made you a beneficiary of the machine; v2 makes you its operator. Every abstract sentence from a history textbook — "the government privatized state property to political allies who financed the ruling movement" — becomes a button the player presses, a number that goes up, and a kauza that comes due. When the archives open in the '98 epilogue and the player's own ledger scrolls past, no lecture is needed. That's the game.
