# Research: Modern funny arcade UI → Divoké deväťdesiate

**Date:** 2026-07-23  
**Question:** What do successful modern funny / casual arcade UIs do, and what should we apply without abandoning Pulp Power (*Sviňa* thriller skin)?

## Sources (primary / first-party analysis)

| Source | Claim used |
|---|---|
| [Górnicki — UX in Clash Royale Pt.1](https://www.gornicki.me/blog/90l/ux-in-clash-royale-part-1) | One-hand / bottom-heavy controls; UI depth ≤1; yellow = primary CTA; red = alert; shallow popups with previous screen peeking |
| [Pixune — Best mobile game UI 2026](https://pixune.com/blog/best-examples-mobile-game-ui-design/) | Clash / Brawl Stars: oversized icons, strong hierarchy, instant combat feedback; Candy Crush: reward psychology + constant micro-feedback |
| [Balatro design analysis](https://medium.com/@yyh19971004/balatro-design-analysis-visual-packaging-and-interactive-feedback-cc6fa6a65370) | Mode-shift backgrounds; progressive disclosure; saturated cards on cool dark stage; score primacy |
| [Alliot / Polygon — Reigns](https://www.polygon.com/2016/9/15/12927968/reigns-mobile-pc-ios-royalty-tinder/) | Funny politics = gap between silly gesture and heavy consequence; physical cards make choices feel toy-like |
| [TypeUI Sega skill](https://www.typeui.sh/design-skills/sega) | Chunky pressable controls with hard offset shadows; scoreboard energy (steal the press, not the pixel font) |
| [Democratic Socialism Simulator](https://molleindustria.org/demsocsim/) | Short session + card/swipe politics satire as genre cousin |
| [Meeting Tycoon](https://github.com/babanomania/meeting-tycoon) | Satire via familiar chrome + toast/confetti outcome juice |

## Distilled rules (modern funny arcade)

1. **Master number always huge** — preferencie is the score. Everything else is support.
2. **Yellow owns the primary verb** — one Signal CTA per screen; secondary stays ghost/outline.
3. **Red owns danger** — kauzy / Eye / alerts only.
4. **UI depth ≤ 1** — phases feel like tabs, not nested menus.
5. **Bottom half is the toy** — actions and CTAs live where thumbs are.
6. **Cards feel physical** — thick frame, press scale, AP cost chip.
7. **Juice on outcome** — floating `+0.6%` / `+50k Sk` / Eye pulse; not silent state swaps.
8. **Mode lighting** — stage tint shifts per phase (Politika / Fond / Centrála) like Balatro blinds.
9. **Funny = contrast** — pulp stakes + arcade toy controls (Reigns gap), not clown fonts.
10. **Avoid** — VT323 / neon magenta cosplay; that fights *Sviňa* and reads as generic retro skin.

## Apply now (this pass)

| Pattern | Implementation |
|---|---|
| Scoreboard | Persistent `HudStrip` during run |
| Bottom dock | Phase dock: Centrála / Politika / Fond |
| Chunky press | Offset-shadow Signal buttons + `:active` press |
| Mode tint | `data-phase` body class / shell wrapper |
| Outcome juice | FloatDelta on preferencie / pokladňa changes |
| Physical action cards | Politika / FNM cards with cost chips and thicker frames |

## Deferred

- Full Reigns swipe for events  
- SFX blips  
- Confetti on election win  
- Character caricature art  
