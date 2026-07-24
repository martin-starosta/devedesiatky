# Divoká privatizácia → herné jadro

Ako sa reálna kupónová a „divoká" privatizácia 90. rokov premietla do deck-buildera
(GDD v3). Historická vrstva je stylizovaná; reálni ľudia ostávajú len v zdrojovaných
fakt-kartách, na scéne sú fiktívne strany a sponzori (viď `timeline.ts` guidelines).

## Historický mechanizmus (prečo štát dostal málo)

1. **Kupónová vlna (1991–92).** Zákon o prevode majetku štátu (feb. 1991) + vznik
   **Fondu národného majetku (FNM)**. Občania nad 18 dostali **kupónovú knižku (DIK)**
   za symbolických ~1000 Kčs; body sa menili za akcie. Zámer: rozdať majetok „všetkým".
2. **Zvrat 1995.** Mečiarova 3. vláda **zrušila 2. vlnu kupónky** (novela 12. 7. 1995)
   a nahradila ju **dlhopismi FNM (nominál 10 000 Sk)** — občania dostali papier namiesto
   podielu.
3. **Priame predaje** vopred vybraným kupcom (prevažne priaznivcom vlády). Kúpna cena
   sa znižovala o „investície", splácala sa dlhopismi FNM a **na splátky** → majetok za
   zlomok hodnoty.
4. **Zrod oligarchov.** Nafta Gbely (nominálne 500 mil. Sk, fakticky prvá splátka 150 mil.;
   strata oproti trhu ~3 mld. Sk), VSŽ Košice a i. Vznikla klika napojená na moc; štát
   dostal málo, strana si cez lojálne biznis-siete budovala moc.

Zdroje: sk.wikipedia.org/wiki/Kupónová_privatizácia; teraz.sk (30 rokov od začiatku);
zastavmekorupciu.sk (privatizácia za 3. Mečiarovej vlády); spravy.pravda.sk (divoké
postupy); 1997-2001.state.gov (Slovakia Economic Policy 1995).

## Mapovanie na mechaniky

| Historický beat | Herná mechanika |
|---|---|
| Peniaze tečú strane | patronage karty → `pokladna` (`priamy-predaj`, `dlhopisova-schema`, `sponzor-galavecer`, `fnm-kontakt`) |
| Zrod oligarchu, strana buduje moc | `oligarcha` (škáluje s `offices`, dáva `offices`+`media`), `manazerske-odkupenie` (+`offices`) |
| Štát dostane málo | patronage/Kult karty ťahajú **Slovensko index** dole (GDD §8); event „priame predaje" ho zráža tiež |
| Škandály, ktoré si sám vyrobíš | patronage inject **kauzy** — vrátane `kauza-priamy-predaj`, `kauza-dlhopis`, `kauza-oligarcha` (nevymazateľná) |
| Čistá cesta | clean shop: `verejne-obstaravanie`, `protikorupcny-audit`, `verejna-sutaz-karta` → **Reputácia = dôvera občanov** + dvíhajú Slovensko index |
| Zrušiť kupóny → priame predaje | event **Kupónka**: `cancel-wave` = `patronagePower: 'full'` (cash windfall) + `trustDebt` (−Reputácia, −Slovensko index); `continue-wave` = rozdať občanom (+dôvera, +index) |

## Zmenené / pridané súbory

- `packages/content/src/cards.ts` — `slovenskoIndex` do `CardEffect` schémy; nové karty
  (dirty: `priamy-predaj`, `manazerske-odkupenie`, `dlhopisova-schema`, `oligarcha`;
  clean: `verejne-obstaravanie`, `protikorupcny-audit`); existujúce patronage karty teraz
  zrážajú Slovensko index; rozšírené shop pooly.
- `packages/content/src/kauzaCards.ts` — `kauza-priamy-predaj`, `kauza-dlhopis`, `kauza-oligarcha`.
- `packages/content/src/timeline.ts` — obohatený `fact-kuponka`; `slovenskoIndex` v `EventChoice`;
  doladený fork Kupónky; `eventPrivatizationEffects` konštanty.
- `packages/simulation/src/deck/events.ts` — aplikácia dovtedy ignorovaných `trustDebt`,
  `patronagePower` a nového `slovenskoIndex` z event-choice.
- Testy: thesis-guard v `cards.contract.test.ts`; fork Kupónky v `deck/reduce.test.ts`.

Rozsah zámerne v hraniciach zamknutej MVP-A architektúry: žiadny nový HUD-resource,
Reputácia slúži ako „dôvera občanov". Samostatný merač Dôvery + hrateľný Slovensko index
na HUD je MVP-B.
