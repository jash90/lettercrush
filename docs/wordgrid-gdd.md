# WORDGRID
## Litery • Słowa • Strategia

---

# GAME DESIGN DOCUMENT
**Wersja 1.0**

| | |
|---|---|
| **Genre** | Word Puzzle / Match-3 Hybrid |
| **Platform** | iOS & Android |
| **Target** | Casual / Mid-core |

---

# 1. EXECUTIVE SUMMARY

## 1.1 Elevator Pitch

WordGrid to innowacyjna gra mobilna łącząca mechanikę match-3 z tworzeniem słów. Gracze zamieniają litery na planszy, aby tworzyć słowa - im dłuższe słowo i lepsza kombinacja, tym więcej punktów. To Candy Crush spotyka Scrabble w jednym, uzależniającym pakiecie.

## 1.2 Unique Selling Points

- **Hybrydowa mechanika**: Match-3 + Word Game = nowy gatunek
- **Emergent gameplay**: Gracze odkrywają słowa, których nie planowali
- **Dual audience**: Edukacyjne dla dzieci, challenging dla dorosłych
- **Proven monetization**: Battle Pass + IAP + Ads hybrid model
- **Social virality**: Daily challenges z natural sharing mechanic

## 1.3 Target Metrics

| Metryka | Target | Benchmark |
|---------|--------|-----------|
| D1 Retention | **35%+** | 26-28% (top 25%) |
| D7 Retention | **15%+** | ~8% (średnia) |
| Avg Session | **8-10 min** | 5-6 min (mediana) |
| ARPDAU | **$0.08+** | $0.04-0.06 (puzzle) |

---

# 2. CORE GAMEPLAY

## 2.1 High Concept

Gracz operuje na planszy 6x6 (lub 7x7/8x8 w zaawansowanych trybach) wypełnionej losowymi literami. Zamienia sąsiadujące litery miejscami, aby tworzyć słowa w poziomie lub pionie. Znalezione słowa znikają, nowe litery spadają z góry, potencjalnie tworząc cascade combos.

## 2.2 Core Loop

Podstawowa pętla rozgrywki składa się z następujących kroków:

1. **SCAN** - Gracz analizuje planszę w poszukiwaniu potencjalnych słów
2. **SWAP** - Zamiana liter (max 1-2 ruchy dla słowa)
3. **MATCH** - System waliduje słowo w słowniku
4. **CLEAR** - Animacja usunięcia liter + punkty
5. **REFILL** - Nowe litery spadają z góry
6. **CASCADE** - Sprawdzenie czy powstały nowe słowa (bonus combo!)
7. **REPEAT** - Powrót do kroku 1

## 2.3 Word Detection Rules

### Minimalna długość słowa
- **Easy Mode**: 3+ litery
- **Normal Mode**: 4+ litery
- **Hard Mode**: 4+ litery, bez podpowiedzi

### Kierunki odczytu
- Poziomo: od lewej do prawej
- Pionowo: od góry do dołu
- Bez diagonali (upraszcza UX)

### Priorytet słów
Jeśli jedno słowo zawiera się w drugim (np. 'KOT' w 'KOTY'), system wybiera dłuższe słowo. Gracz może manualnie wybrać krótsze przez tap.

## 2.4 Scoring System

System punktacji został zaprojektowany tak, aby nagradzać umiejętności i strategię:

| Element | Mnożnik | Opis |
|---------|---------|------|
| Długość słowa | ×(n²) | 3 litery = ×9, 5 liter = ×25, 8 liter = ×64 |
| Rzadkość liter | 1-10 pkt/litera | A,E,I = 1pkt; Z,X,Q = 10pkt (jak Scrabble) |
| Combo chain | ×1.5 per combo | Cascadowe słowa: ×1.5, ×2.25, ×3.375... |
| Speed bonus | ×1.1 - ×2.0 | Szybsze znalezienie = większy bonus |
| Specjalne litery | ×2 - ×5 | Złote, tęczowe i inne specjalne litery |

**Formuła:**
```
SCORE = (Σ letter_values) × length² × combo_multiplier × speed_bonus × special_multiplier
```

---

# 3. GAME MODES

## 3.1 Classic Mode

| Parametr | Wartość |
|----------|---------|
| **Czas** | 2 minuty |
| **Cel** | Maksymalna ilość punktów |
| **Plansza** | 6×6, stała |
| **Lives** | Brak (czas limituje) |

Tryb podstawowy, idealny dla casual graczy. Prosta mechanika, jasny cel. Retention hook: dzienny highscore, tygodniowe rankingi.

## 3.2 Puzzle Mode (Campaign)

| Parametr | Wartość |
|----------|---------|
| **Poziomy** | 500+ (z regularnym content update) |
| **Struktura** | Mapa świata z regionami tematycznymi |
| **Cel per poziom** | Znajdź X słów / Zdobądź Y punktów / Wyczyść specjalne kafelki |

Główny content driver. Każdy region = nowa mechanika (lód do stopienia, blokady do usunięcia, etc.). Peak & Valley difficulty curve jak w Candy Crush.

### Przykładowe regiony

| Poziomy | Region | Mechanika |
|---------|--------|-----------|
| 1-35 | Tutorial Island | Nauka podstaw |
| 36-80 | Frozen Fjords | Litery zamrożone w lodzie |
| 81-130 | Desert Dunes | Piasek zasypuje litery |
| 131-200 | Jungle Ruins | Liany blokują ruchy |
| 201+ | Kolejne regiony | Nowe mechaniki |

## 3.3 Daily Challenge

| Parametr | Wartość |
|----------|---------|
| **Reset** | Codziennie o 00:00 UTC |
| **Format** | 3 poziomy rosnącej trudności |
| **Nagrody** | Coins, gems, exclusive items za streak |

Krytyczny dla D7+ retention. Streak mechanic (7 dni = bonus, 30 dni = exclusive reward). Łączy się z notyfikacjami push.

## 3.4 Word Hunt (Wykreślanka Mode)

| Parametr | Wartość |
|----------|---------|
| **Plansza** | Większa (8×8 lub 10×10) |
| **Cel** | Znajdź wszystkie ukryte słowa z listy |
| **Różnica** | Słowa są predefiniowane, nie emergent |

Alternatywny tryb dla graczy preferujących wykreślanki. Tematyczne pakiety słów (zwierzęta, kraje, zawody). Relaxing, bez presji czasu.

## 3.5 Versus Mode (PvP)

| Parametr | Wartość |
|----------|---------|
| **Format** | Async lub real-time |
| **Matchmaking** | ELO-based |
| **Struktura** | Ta sama plansza, kto zdobędzie więcej punktów |

Endgame content dla hardcorowych graczy. Sezonowe rankingi, exclusive rewards. Real-time wymaga stable connection.

## 3.6 Zen Mode

| Parametr | Wartość |
|----------|---------|
| **Czas** | Brak limitu |
| **Cel** | Relaks, eksploracja słów |
| **Monetyzacja** | Premium unlock ($2.99) |

Dla graczy szukających relaksu. Brak reklam, cicha muzyka ambient. Idealny przed snem.

---

# 4. PROGRESSION SYSTEMS

## 4.1 Player Level

Główny wskaźnik postępu gracza. XP zdobywane za każde słowo, z bonusem za ukończenie poziomów i daily challenges.

| Poziom | XP Required | Cumulative | Unlock |
|--------|-------------|------------|--------|
| 1-5 | 100-500 | 1,500 | Basic power-ups, hints |
| 6-15 | 500-1,500 | 15,000 | Daily Challenge, więcej power-ups |
| 16-30 | 1,500-3,000 | 60,000 | PvP Mode, custom themes |
| 31-50 | 3,000-5,000 | 165,000 | Leagues, exclusive avatars |
| 51+ | 5,000+ | ∞ | Prestige system, seasonal rewards |

## 4.2 Personal Dictionary

Kolekcjonerski element gry - każde znalezione słowo zostaje zapisane w osobistym słowniku gracza. Gracze mogą przeglądać wszystkie słowa, które kiedykolwiek znaleźli.

- **Statystyki**: ile razy użyte, najlepszy wynik ze słowem
- **Milestones**: 100/500/1000/5000 unikalnych słów = achievement
- **Kategorie**: słowa pogrupowane tematycznie (zwierzęta, zawody, etc.)
- **Discovery**: procent poznanych słów w kategorii

## 4.3 Achievement System

Wielowymiarowy system osiągnięć nagradzający różne style gry:

### Kategorie achievementów

| Kategoria | Przykłady |
|-----------|-----------|
| **Wordsmith** | Długie słowa (6+, 7+, 8+ liter) |
| **Collector** | Unikalne słowa w słowniku |
| **Combo Master** | Łańcuchy combo (3×, 5×, 10×) |
| **Speed Demon** | Szybkie ukończenie poziomów |
| **Dedicated** | Streak days (7, 30, 100, 365) |
| **Social Butterfly** | Zaproszeni znajomi, PvP wins |
| **Explorer** | Ukończone regiony na mapie |

## 4.4 Battle Pass (Season Pass)

| Parametr | Wartość |
|----------|---------|
| **Długość sezonu** | 8 tygodni |
| **Free Track** | 30 nagród (coins, hints, basic cosmetics) |
| **Premium Track** | +30 nagród (gems, exclusive themes, avatars) |
| **Cena Premium** | $4.99 |

Battle Pass jako główny retention driver dla mid-term (D30+). Każdy sezon z unikalnym motywem wizualnym. Weekly missions napędzają progress.

---

# 5. POWER-UPS & SPECIAL ITEMS

## 5.1 Active Power-ups (używane przez gracza)

| Power-up | Koszt | Efekt | Unlock |
|----------|-------|-------|--------|
| **HINT 💡** | 50 coins | Podświetla jedno możliwe słowo | Level 2 |
| **SHUFFLE 🔀** | 100 coins | Miesza wszystkie litery na planszy | Level 5 |
| **TIME FREEZE ⏱️** | 150 coins | +15 sekund do timera | Level 8 |
| **WILDCARD 🃏** | 200 coins | Zamienia literę na dowolną | Level 12 |
| **BOMB 💣** | 250 coins | Usuwa 9 liter (3×3 area) | Level 15 |

## 5.2 Special Letter Tiles

Specjalne litery pojawiające się losowo na planszy lub jako nagrody:

| Typ | Efekt |
|-----|-------|
| **GOLD LETTER** (×2) | Podwaja wartość punktową słowa zawierającego tę literę |
| **RAINBOW LETTER** (wildcard) | Może reprezentować dowolną literę |
| **FROZEN LETTER** (challenge) | Wymaga użycia w 2 słowach aby się odblokować |
| **CHAIN LETTER** (combo) | Automatycznie sprawdza cascade po użyciu |
| **BOMB LETTER** (clear) | Eksploduje usuwając sąsiednie litery po użyciu w słowie |
| **STAR LETTER** (bonus) | Dodaje bonus XP do słowa |

---

# 6. MONETIZATION STRATEGY

## 6.1 Currency System

### Soft Currency: Coins (złote)
- **Zdobywane**: gameplay, daily login, achievements, watching ads
- **Wydawane na**: hints, shuffles, basic power-ups, continues
- **Daily cap farmingu**: ~500 coins (żeby nie inflować)

### Hard Currency: Gems (diamenty)
- **Zdobywane**: premium zakupy, rare achievements, Battle Pass
- **Wydawane na**: premium power-ups, cosmetics, skip waiting, coin packs
- **F2P earn rate**: ~10-15 gems/tydzień

## 6.2 IAP Pricing

| Produkt | Cena | Gems | Bonus | $/Gem |
|---------|------|------|-------|-------|
| Starter Pack | $0.99 | 80 | +500 coins, 3 hints | $0.012 |
| Small Pack | $4.99 | 500 | +10% bonus | $0.010 |
| Medium Pack | $9.99 | 1200 | +20% bonus | $0.008 |
| Large Pack | $19.99 | 2800 | +40% bonus | $0.007 |
| Mega Pack | $49.99 | 8000 | +60% + exclusive avatar | $0.006 |

## 6.3 Subscription Model

**WordGrid Premium: $7.99/miesiąc lub $49.99/rok**

Korzyści subskrypcji:
- No ads (wszystkie formaty)
- 5 darmowych hints dziennie
- Exclusive themes (3 nowe miesięcznie)
- Priority matchmaking w PvP
- +20% XP boost
- Early access do nowych regionów

## 6.4 Ad Strategy

Hybrid monetization z naciskiem na user experience:

### Rewarded Video Ads
- **Nagroda**: 50 coins lub 1 hint lub +30 sek czasu
- **Limit**: 10/dzień
- **Placement**: po przegranym poziomie (continue), w sklepie, daily bonus

### Interstitial Ads
- **Frequency**: co 5 ukończonych poziomów (nie po przegranym!)
- **Skip**: po 5 sekundach
- **Cool-down**: minimum 3 minuty między interstitials

### Banner Ads
- **Placement**: tylko w menu głównym i map screen
- **NIGDY** podczas aktywnej rozgrywki

---

# 7. UI/UX DESIGN

## 7.1 Core Screens

### Home Screen
- Player avatar + level badge (top-left)
- Currencies display (top-right): coins | gems
- PLAY button (center, prominent) - wchodzi do Campaign
- Mode selector (poniżej): Classic | Daily | PvP | Zen
- Bottom nav: Home | Dictionary | Shop | Profile
- Notification badges na Daily Challenge i Battle Pass

### Gameplay Screen
- Grid (6×6) - centralnie, 80% ekranu
- Score display (top-center)
- Timer/moves counter (top-left lub top-right)
- Power-ups tray (bottom) - max 3 aktywne
- Pause button (top-right corner)
- Last word found (floating indicator)

## 7.2 Touch Interactions

| Gesture | Akcja | Feedback |
|---------|-------|----------|
| Tap letter | Zaznaczenie litery | Glow + subtle haptic + pop sound |
| Drag to swap | Zamiana sąsiednich liter | Smooth animation 200ms + swoosh |
| Swipe across word | Quick word selection | Trail effect + each letter lights up |
| Long press | Info o specjalnej literze | Tooltip popup + hold haptic |
| Double tap grid | Shuffle (jeśli ma power-up) | Confirmation modal + scatter animation |

## 7.3 Visual Feedback System (Juice)

Kluczowe elementy "game feel" które zwiększają satysfakcję z rozgrywki:

### Word Found Animation
- Litery rozświetlają się sekwencyjnie (50ms delay)
- Słowo "wyskakuje" z planszy (scale 1.0 → 1.3 → 1.0)
- Particle burst w kolorze słowa
- Score popup (+150!) animowany do score counter
- Haptic: short burst (15ms)

### Combo Animation
- Screen shake (intensity scales z combo level)
- Combo counter: COMBO ×2! ×3! ×4!
- Background pulse effect
- Dźwięk: ascending pitch z każdym combo

### Letter Cascade
- Gravity-based fall (ease-out)
- Subtle bounce na landing
- Staggered timing (nie wszystkie naraz)
- Woosh sound effect

---

# 8. TECHNICAL REQUIREMENTS

## 8.1 Target Platforms

- **iOS**: 14.0+
- **Android**: 8.0+ (API 26)
- **Minimum RAM**: 2GB
- **Screen**: 720p minimum, optimized for 1080p+

## 8.2 Performance Targets

| Parametr | Target |
|----------|--------|
| Frame rate | 60 FPS stable (30 FPS minimum na low-end) |
| Load time | <3 sek cold start, <1 sek level load |
| Memory usage | <300MB RAM |
| App size | <150MB initial, <300MB z all assets |
| Battery | max 8% drain/hour active play |

## 8.3 Dictionary System

Kluczowy komponent techniczny - walidacja słów musi być błyskawiczna i offline-capable.

### Struktura słownika
- **Trie data structure** dla O(m) lookup (m = długość słowa)
- Polski słownik: ~200,000 słów (bez odmian: ~80,000 base words)
- Angielski słownik: ~170,000 słów
- Compressed size: ~5MB per language

### Multi-language support
- **Launch**: Polski, English
- **Post-launch**: Niemiecki, Hiszpański, Francuski
- Letter distribution dostosowana per język (różne frequency tables)

## 8.4 Backend Requirements

- **Cloud save**: Player progress sync
- **Leaderboards**: Daily/Weekly/All-time
- **PvP matchmaking**: ELO calculation, async state sync
- **Push notifications**: Daily reminder, streak warning, PvP turn
- **Analytics**: Firebase/Amplitude integration
- **A/B testing**: Remote config for game balance

## 8.5 Offline Capabilities

| Tryb | Offline? |
|------|----------|
| Campaign mode | ✅ Fully playable offline |
| Classic mode | ✅ Fully playable offline |
| Daily Challenge | ⚠️ Cached on app open (valid 24h) |
| PvP | ❌ Async only (no real-time offline) |
| Progress sync | ⚠️ Queue system, sync on reconnect |

---

# 9. DEVELOPMENT ROADMAP

## 9.1 Phase 1: MVP (8 tygodni)

**Cel:** Playable vertical slice z core loop

| Tydzień | Zadania |
|---------|---------|
| 1-2 | Core grid system + letter swap mechanics |
| 3 | Dictionary integration + word validation |
| 4 | Scoring system + basic UI |
| 5-6 | Visual polish (animations, particles) |
| 7 | Audio implementation |
| 8 | Internal testing + bug fixes |

**Deliverable:** Classic Mode playable, 30 FPS stable

## 9.2 Phase 2: Core Features (8 tygodni)

**Cel:** Feature complete dla soft launch

- Campaign mode: 100 poziomów, 2 regiony
- Progression systems: XP, levels, achievements (10+)
- Power-ups: wszystkie 5 core power-ups
- Daily Challenge: full implementation
- Personal Dictionary: basic view
- IAP integration: coin packs + Starter Pack
- Ads: rewarded video tylko

## 9.3 Phase 3: Soft Launch (4 tygodnie)

**Regiony:** Polska, Czechy, Słowacja (niski CPI, polski język)

- Target: 10,000 organicznych instalacji
- KPIs: D1 > 30%, D7 > 10%, Crash rate < 1%
- A/B testy: difficulty curve, ad frequency, IAP pricing
- Feedback loop: in-app surveys, App Store reviews

## 9.4 Phase 4: Polish & Expand (6 tygodni)

Na podstawie soft launch data:

- +200 poziomów Campaign (3 nowe regiony)
- Word Hunt mode (wykreślanka)
- Battle Pass implementation
- Subscription model
- Interstitial ads (jeśli retention OK)
- English language support

## 9.5 Phase 5: Global Launch

**Target:** Worldwide

- UA campaign (Facebook, Google, TikTok)
- ASO optimization
- Press kit + influencer outreach
- App Store featuring pitch

---

# 10. SUCCESS METRICS & KPIs

## 10.1 Launch Goals (First 30 Days)

| Metryka | Minimum | Target |
|---------|---------|--------|
| D1 Retention | 28% | **35%+** |
| D7 Retention | 10% | **15%+** |
| Avg Session Length | 6 min | **10+ min** |
| Sessions/Day | 2 | **3+** |
| Tutorial Completion | 70% | **85%+** |
| Crash Rate | <2% | **<0.5%** |

## 10.2 Monetization KPIs

1. **ARPDAU Target**: $0.06-0.10 (hybrid model)
2. **Conversion Rate (IAP)**: 2-4% paying users
3. **ARPPU**: $8-15 (first 30 days)
4. **Ad Revenue Split**: 40-50% of total revenue
5. **Rewarded Video Views/DAU**: 2-3
6. **Battle Pass Purchase Rate**: 5-8% of D30 users

## 10.3 Engagement Funnels

Kluczowe punkty konwersji do monitorowania:

| Funnel Step | Target |
|-------------|--------|
| Install → First Level Complete | 90%+ |
| Level 10 → Level 20 | 60%+ |
| First IAP prompt → Purchase | 3%+ |
| Daily Challenge start → Completion | 70%+ |
| PvP unlock → First match played | 40%+ |

---

# 11. COMPETITIVE ANALYSIS

## 11.1 Direct Competitors

| Gra | Mocne strony | Słabe strony | Nasza przewaga |
|-----|--------------|--------------|----------------|
| **Wordscapes** | Massive content, relaxing | Brak combo/cascade | Dynamic gameplay |
| **Word Cookies** | Cute aesthetic, simple | Repetitive, dated UI | Modern polish, PvP |
| **Candy Crush** | Perfect game feel, massive UA | No cognitive challenge | Educational value |
| **Wordle** | Viral, social sharing | 1 gra/dzień, no depth | Unlimited play, progression |

## 11.2 Market Opportunity

Word games to stabilny segment rynku z lojalną bazą graczy. WordGrid targetuje niezagospodarowaną niszę na przecięciu word games i match-3:

- **Word Games market**: $3.2B (2024), CAGR 8.5%
- **Match-3 market**: $7.8B (2024), saturated but stable
- **Hybrid word/puzzle**: Underserved segment
- **Polski rynek**: Brak lokalnych liderów w kategorii

---

# 12. APPENDIX

## 12.1 Letter Distribution (Polski)

Częstotliwość liter w polskim słowniku dostosowana do gameplay:

| Litera | % | Litera | % | Litera | % | Litera | % |
|--------|---|--------|---|--------|---|--------|---|
| A | 9.2 | I | 8.5 | O | 7.8 | E | 7.5 |
| N | 5.7 | R | 4.8 | Z | 4.5 | S | 4.3 |
| W | 4.0 | C | 3.8 | T | 3.5 | K | 3.2 |
| Y | 3.0 | D | 2.8 | P | 2.5 | M | 2.3 |
| L | 2.0 | Ł | 1.8 | U | 1.5 | J | 1.2 |
| B | 1.0 | G | 0.9 | H | 0.8 | Ą | 0.6 |
| Ę | 0.5 | Ó | 0.4 | Ś | 0.3 | Ż | 0.3 |
| Ć | 0.2 | Ń | 0.2 | Ź | 0.1 | F | 0.1 |

## 12.2 Scoring Values per Letter

| Punkty | Litery |
|--------|--------|
| 1 punkt | A, E, I, O, N, R, S, W, Z |
| 2 punkty | C, D, K, L, M, P, T, Y |
| 3 punkty | B, G, H, J, Ł, U |
| 5 punktów | Ą, Ę, F, Ó, Ś, Ż |
| 7 punktów | Ć, Ń |
| 9 punktów | Ź |

## 12.3 Glossary

| Skrót | Znaczenie |
|-------|-----------|
| ARPDAU | Average Revenue Per Daily Active User |
| ARPPU | Average Revenue Per Paying User |
| CPI | Cost Per Install |
| DAU/MAU | Daily/Monthly Active Users |
| D1/D7/D30 | Day 1/7/30 Retention |
| IAP | In-App Purchase |
| LTV | Lifetime Value |
| UA | User Acquisition |
| UX | User Experience |
| F2P | Free to Play |
| PvP | Player vs Player |
| KPI | Key Performance Indicator |

---

*— KONIEC DOKUMENTU —*

---

**WordGrid GDD v1.0**
*Dokument poufny*
