# WordGrid Epics & User Stories

**Parent Document:** [Epics Overview](./overview.md)

---

## 1. Epic Overview

### 1.1 Epic Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EPIC STRUCTURE                               │
│                                                                      │
│  E1: Core Gameplay                                                   │
│  ├── US1.1-1.8: Grid mechanics, word validation, scoring            │
│  │                                                                   │
│  E2: Game Modes                                                      │
│  ├── US2.1-2.6: Classic, Campaign, Daily, PvP, Word Hunt, Zen       │
│  │                                                                   │
│  E3: Progression System                                              │
│  ├── US3.1-3.5: XP, levels, achievements, dictionary                │
│  │                                                                   │
│  E4: Monetization                                                    │
│  ├── US4.1-4.5: IAP, ads, subscription, shop                        │
│  │                                                                   │
│  E5: Social Features                                                 │
│  ├── US5.1-5.4: Leaderboards, friends, sharing                      │
│  │                                                                   │
│  E6: Technical Foundation                                            │
│  ├── US6.1-6.6: Dictionary, cloud, analytics, performance           │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Epic Summary

| Epic | Stories | Priority | Sprint Target |
|------|---------|----------|---------------|
| E1: Core Gameplay | 8 | P0 | Sprint 1-3 |
| E2: Game Modes | 6 | P0-P1 | Sprint 2-5 |
| E3: Progression | 5 | P0 | Sprint 3-4 |
| E4: Monetization | 5 | P0 | Sprint 4-5 |
| E5: Social | 4 | P1 | Sprint 5-6 |
| E6: Technical | 6 | P0 | Sprint 1-2 |

---

## 2. Epic 1: Core Gameplay

### E1 Overview
**Goal**: Implement the fundamental word-finding gameplay loop with satisfying feedback and accurate scoring.

**Success Criteria**:
- Word validation <50ms
- 60 FPS during gameplay
- Player satisfaction >4.0/5.0 (beta feedback)

---

### US1.1: Letter Grid Display

**As a** player
**I want** to see a 6×6 grid of letter tiles
**So that** I can scan for potential words to form

**Acceptance Criteria**:
- [ ] Grid displays 36 letter tiles in 6×6 arrangement
- [ ] Each tile shows a single letter clearly
- [ ] Letter distribution follows Polish/English frequency tables
- [ ] Grid adapts to different screen sizes while maintaining tap targets ≥44pt
- [ ] Special tiles (Gold, Rainbow) are visually distinct

**Technical Notes**:
- Use Unity UI Toolkit for grid layout
- Implement responsive scaling based on device
- Pre-generate tile sprites for all supported characters

**Story Points**: 5
**Priority**: P0
**Sprint**: 1

---

### US1.2: Tile Swap Mechanics

**As a** player
**I want** to swap adjacent letters by tapping or swiping
**So that** I can form words horizontally or vertically

**Acceptance Criteria**:
- [ ] Tap two adjacent tiles to swap them
- [ ] Swipe from one tile to adjacent tile to swap
- [ ] Drag tile onto adjacent position to swap
- [ ] Only orthogonally adjacent swaps allowed (not diagonal)
- [ ] Visual feedback during swap (animation, trail)
- [ ] Haptic feedback on swap initiation
- [ ] Swap animation completes in <200ms

**Technical Notes**:
- Implement gesture recognizer with configurable thresholds
- Queue swaps during animation to prevent input loss
- Support both touch methods simultaneously

**Story Points**: 8
**Priority**: P0
**Sprint**: 1

---

### US1.3: Word Detection

**As a** player
**I want** the game to automatically detect valid words I've formed
**So that** I know when I've made a successful move

**Acceptance Criteria**:
- [ ] Detect horizontal words (left-to-right)
- [ ] Detect vertical words (top-to-bottom)
- [ ] Minimum word length: 3 letters
- [ ] Words validated against language dictionary
- [ ] Multiple simultaneous words detected
- [ ] Overlapping words both count (e.g., CAT and CATS)
- [ ] Detection occurs after each swap and cascade

**Technical Notes**:
- Use Trie data structure for O(m) word lookup
- Implement efficient grid scanning algorithm
- Cache validation results within same grid state

**Story Points**: 13
**Priority**: P0
**Sprint**: 1

---

### US1.4: Word Validation

**As a** player
**I want** only real words from the dictionary to be accepted
**So that** the game feels fair and educational

**Acceptance Criteria**:
- [ ] Polish dictionary with 200,000+ words
- [ ] English dictionary with 170,000+ words
- [ ] Word lookup completes in <50ms
- [ ] Case-insensitive matching
- [ ] Profanity filter blocks inappropriate words
- [ ] Offline validation (no network required)

**Technical Notes**:
- Implement Trie with compressed nodes for memory efficiency
- Load core dictionary first, extended async
- Binary dictionary format for fast loading

**Story Points**: 13
**Priority**: P0
**Sprint**: 1

---

### US1.5: Score Calculation

**As a** player
**I want** to earn points based on word length and letter values
**So that** I'm rewarded for finding longer and more complex words

**Acceptance Criteria**:
- [ ] Base score = sum of letter values (Scrabble-style)
- [ ] Length multiplier = length² (3-letter=9×, 5-letter=25×)
- [ ] Combo multiplier = 1.5^combo_count for cascade chains
- [ ] Speed bonus = 1.1-2.0× based on time to find
- [ ] Special tile multipliers applied (Gold=2×, etc.)
- [ ] Score breakdown shown in popup
- [ ] Total score updates in real-time

**Technical Notes**:
- Implement ScoreEngine with pluggable multipliers
- Polish letter values differ from English (see GDD)
- Round to nearest integer after all multipliers

**Story Points**: 8
**Priority**: P0
**Sprint**: 2

---

### US1.6: Cascade System

**As a** player
**I want** cleared words to trigger new letters falling and potential chain reactions
**So that** I can achieve satisfying combo multipliers

**Acceptance Criteria**:
- [ ] Cleared tiles removed with dissolve animation
- [ ] Remaining tiles fall due to gravity (<200ms)
- [ ] New tiles spawn from top to fill gaps
- [ ] Automatic word detection after refill
- [ ] Cascade combos increment counter (×2, ×3, etc.)
- [ ] Maximum cascade depth: no limit
- [ ] Visual celebration escalates with combo level

**Technical Notes**:
- Implement coroutine-based animation sequencing
- Detect combo in same animation frame for smooth flow
- Optimize particle effects for mobile performance

**Story Points**: 13
**Priority**: P0
**Sprint**: 2

---

### US1.7: Special Tiles

**As a** player
**I want** special tiles to appear occasionally
**So that** gameplay has variety and strategic opportunities

**Acceptance Criteria**:
- [ ] Gold Tile: 2× score multiplier (5% spawn rate)
- [ ] Rainbow Tile: Wildcard, matches any letter (2% spawn rate)
- [ ] Frozen Tile: Requires 2 matches to clear
- [ ] Chain Tile: Triggers adjacent cascade when cleared
- [ ] Bomb Tile: Clears 3×3 area when matched
- [ ] Star Tile: Bonus XP when cleared
- [ ] Special tiles visually distinct with animations

**Technical Notes**:
- Implement tile type system with inheritance
- Balance spawn rates through remote config
- Track special tile usage in analytics

**Story Points**: 13
**Priority**: P1
**Sprint**: 3

---

### US1.8: Power-Up System

**As a** player
**I want** to use consumable power-ups to help me
**So that** I can overcome difficult situations

**Acceptance Criteria**:
- [ ] Bomb: Clear selected tile and neighbors
- [ ] Shuffle: Randomize all tiles
- [ ] Time Boost: Add 15 seconds
- [ ] Hint: Highlight a valid word
- [ ] Freeze: Pause timer for 5 seconds
- [ ] Power-ups unlocked at specific player levels
- [ ] Count displayed on button, decrements on use
- [ ] Purchase more via shop

**Technical Notes**:
- Store power-up inventory locally with cloud sync
- Implement cooldown to prevent spam
- Track usage for balancing analytics

**Story Points**: 8
**Priority**: P1
**Sprint**: 3

---

## 3. Epic 2: Game Modes

### E2 Overview
**Goal**: Provide diverse gameplay experiences to retain different player types.

**Success Criteria**:
- All 6 modes functional
- D7 retention >25%
- Session length 8-15 minutes average

---

### US2.1: Classic Mode

**As a** casual player
**I want** a quick 2-minute word-finding session
**So that** I can play during short breaks

**Acceptance Criteria**:
- [ ] 2-minute countdown timer
- [ ] Timer visible and prominent
- [ ] Warning at 30 seconds (visual + audio)
- [ ] Game ends when timer reaches 0
- [ ] Final score displayed with breakdown
- [ ] High score tracked and displayed
- [ ] Option to continue via rewarded ad (1×)
- [ ] Leaderboard ranking shown

**Technical Notes**:
- Implement GameMode base class with timer
- Store high scores locally and sync to cloud
- Track mode-specific analytics

**Story Points**: 8
**Priority**: P0
**Sprint**: 2

---

### US2.2: Campaign Mode

**As a** progression-focused player
**I want** to complete levels with specific objectives
**So that** I feel a sense of accomplishment and progression

**Acceptance Criteria**:
- [ ] 500+ levels across 8 themed worlds
- [ ] Each level has 1-3 objectives (score, words, special)
- [ ] Star rating system (1-3 stars based on score)
- [ ] Progress saved and synced
- [ ] World map with level nodes
- [ ] Unlock next level on completion
- [ ] Boss levels every 15 levels with unique mechanics
- [ ] Replay for better stars

**Technical Notes**:
- Level data stored in JSON/ScriptableObjects
- Implement level selection UI with scroll
- Track per-level statistics

**Story Points**: 21
**Priority**: P0
**Sprint**: 3-4

---

### US2.3: Daily Challenge

**As a** retention-focused player
**I want** a unique daily puzzle
**So that** I have a reason to play every day

**Acceptance Criteria**:
- [ ] New challenge every day at 00:00 UTC
- [ ] Same grid for all players (fair competition)
- [ ] 3-stage challenge (Easy → Medium → Hard)
- [ ] Streak tracking with rewards
- [ ] Streak rewards: Day 3, Day 7, Day 14, Day 30
- [ ] Cannot replay once completed
- [ ] Challenge cached for 24h offline play
- [ ] Daily leaderboard

**Technical Notes**:
- Generate from seed based on date
- Cache challenge data on app open
- Streak stored locally with cloud validation

**Story Points**: 13
**Priority**: P0
**Sprint**: 4

---

### US2.4: PvP Versus Mode

**As a** competitive player
**I want** to challenge other players on the same grid
**So that** I can prove my word-finding skills

**Acceptance Criteria**:
- [ ] Matchmaking based on ELO rating
- [ ] Same grid for both players (fairness)
- [ ] 2-minute simultaneous play
- [ ] Real-time score visibility (optional)
- [ ] Winner determined by final score
- [ ] ELO adjusted after match
- [ ] League system: Bronze → Silver → Gold → Platinum → Diamond
- [ ] Season rewards

**Technical Notes**:
- Use PlayFab matchmaking
- WebSocket for real-time updates
- Async mode: 24h to complete turn

**Story Points**: 21
**Priority**: P1
**Sprint**: 5

---

### US2.5: Word Hunt Mode

**As a** relaxed player
**I want** to find specific themed words
**So that** I can play without time pressure

**Acceptance Criteria**:
- [ ] No timer (relaxed gameplay)
- [ ] Theme-based word lists (Animals, Countries, etc.)
- [ ] Target words to find displayed
- [ ] Progress tracking per theme
- [ ] Hints available for stuck moments
- [ ] Complete theme to unlock next
- [ ] 20+ themes at launch

**Technical Notes**:
- Curated word lists per theme
- Generate grids containing target words
- Track completion per theme

**Story Points**: 13
**Priority**: P1
**Sprint**: 5

---

### US2.6: Zen Mode (Premium)

**As a** premium subscriber
**I want** endless ad-free word finding
**So that** I can relax without interruptions

**Acceptance Criteria**:
- [ ] No timer
- [ ] No score pressure
- [ ] Ambient music and visuals
- [ ] No ads
- [ ] Available only to subscribers
- [ ] Session statistics tracked
- [ ] Beautiful, calming theme

**Technical Notes**:
- Gate behind subscription check
- Track Zen mode usage for retention analysis
- Special calm audio track

**Story Points**: 8
**Priority**: P2
**Sprint**: 6

---

## 4. Epic 3: Progression System

### E3 Overview
**Goal**: Provide meaningful long-term progression to drive retention.

**Success Criteria**:
- D30 retention >10%
- Average player level at D30 >15
- Achievement completion >60%

---

### US3.1: XP and Leveling

**As a** player
**I want** to earn XP and level up
**So that** I feel my progress is recognized

**Acceptance Criteria**:
- [ ] XP earned from completing games
- [ ] XP bonus for words found, combos achieved
- [ ] Level up notification with rewards
- [ ] Current level and XP shown in profile
- [ ] XP bar visible during gameplay
- [ ] Level milestones unlock features (power-ups, modes)
- [ ] 100+ levels with increasing XP requirements

**Technical Notes**:
- XP curve: level_xp = base * level^1.5
- Store level progress in cloud save
- Analytics for level distribution

**Story Points**: 8
**Priority**: P0
**Sprint**: 3

---

### US3.2: Personal Dictionary

**As a** player
**I want** to track all words I've found
**So that** I feel a sense of collection and learning

**Acceptance Criteria**:
- [ ] Record every unique word found
- [ ] Show word count by length and category
- [ ] Display word definitions (if available)
- [ ] Mark favorite words
- [ ] Progress toward category completion
- [ ] Milestone rewards (100 words, 500 words, etc.)
- [ ] Share word discoveries

**Technical Notes**:
- Store word list locally with cloud sync
- Optional: Fetch definitions from API
- Efficient storage (hash set of word IDs)

**Story Points**: 8
**Priority**: P1
**Sprint**: 4

---

### US3.3: Achievement System

**As a** player
**I want** to earn achievements for various accomplishments
**So that** I have goals to work toward

**Acceptance Criteria**:
- [ ] 50+ achievements across categories
- [ ] Categories: Words, Combos, Modes, Social, Collection
- [ ] Achievement popup on unlock
- [ ] Progress tracking for incremental achievements
- [ ] Achievement showcase in profile
- [ ] XP/coin rewards for unlocking
- [ ] Rare achievements highlighted

**Achievement Examples**:
- Word Wizard: Find 1000 words
- Combo Master: Achieve 10× combo
- Speed Demon: Score 1000 in 30 seconds
- Polyglot: Play in 2+ languages
- Daily Devotee: 30-day streak

**Story Points**: 13
**Priority**: P1
**Sprint**: 4

---

### US3.4: Battle Pass

**As a** engaged player
**I want** a seasonal progression track with rewards
**So that** I have extra motivation to play regularly

**Acceptance Criteria**:
- [ ] 8-week seasons
- [ ] Free track with basic rewards
- [ ] Premium track ($4.99) with exclusive rewards
- [ ] 50 levels per season
- [ ] XP from daily/weekly challenges
- [ ] Season-exclusive cosmetics
- [ ] Progress visible in dedicated screen

**Technical Notes**:
- Server-side season configuration
- Track purchased separately from subscription
- Reset progress each season

**Story Points**: 13
**Priority**: P2
**Sprint**: 6

---

### US3.5: Leaderboards

**As a** competitive player
**I want** to see how I rank against others
**So that** I'm motivated to improve

**Acceptance Criteria**:
- [ ] Global leaderboard (all-time)
- [ ] Weekly leaderboard (resets Monday)
- [ ] Daily leaderboard (resets midnight UTC)
- [ ] Friends-only leaderboard
- [ ] Per-mode leaderboards
- [ ] Top 100 displayed, player's rank always shown
- [ ] Profile tap to view player stats

**Technical Notes**:
- Use PlayFab leaderboards
- Cache for offline viewing
- Update in near real-time for top 1000

**Story Points**: 8
**Priority**: P1
**Sprint**: 5

---

## 5. Epic 4: Monetization

### E4 Overview
**Goal**: Implement fair, player-friendly monetization that supports game development.

**Success Criteria**:
- ARPDAU >$0.05
- Conversion rate >3%
- Player satisfaction maintained

---

### US4.1: In-App Purchases

**As a** player
**I want** to buy gems and coins
**So that** I can get power-ups and customization

**Acceptance Criteria**:
- [ ] 5 gem pack tiers ($0.99 - $49.99)
- [ ] Best value badges on larger packs
- [ ] Secure purchase flow (StoreKit 2 / Play Billing)
- [ ] Immediate delivery of currency
- [ ] Receipt validation on server
- [ ] Restore purchases option
- [ ] Purchase history in settings

**Technical Notes**:
- Use native store APIs
- Server-side receipt validation
- Handle edge cases (network failure, etc.)

**Story Points**: 13
**Priority**: P0
**Sprint**: 4

---

### US4.2: Ad Integration

**As a** free player
**I want** to watch ads for rewards
**So that** I can earn power-ups without paying

**Acceptance Criteria**:
- [ ] Rewarded video: 2× rewards after game
- [ ] Rewarded video: Extra continue in Classic
- [ ] Interstitial: Between games (max 1 per 3 games)
- [ ] Banner: None (premium feel)
- [ ] Ad cooldowns enforced
- [ ] Graceful handling of no-fill
- [ ] Premium removes all ads

**Technical Notes**:
- Use AdMob with ironSource mediation
- Implement ad request queuing
- Track ad impressions and revenue

**Story Points**: 8
**Priority**: P0
**Sprint**: 4

---

### US4.3: Premium Subscription

**As a** dedicated player
**I want** a subscription option
**So that** I can get ongoing benefits without constant purchases

**Acceptance Criteria**:
- [ ] Monthly subscription: $7.99
- [ ] Benefits: No ads, 2× coins, Zen mode, exclusive content
- [ ] Free 7-day trial
- [ ] Auto-renewal management
- [ ] Subscription status sync across devices
- [ ] Clear value proposition shown

**Technical Notes**:
- StoreKit 2 / Play Billing subscription APIs
- Server-side subscription validation
- Grace period handling

**Story Points**: 13
**Priority**: P1
**Sprint**: 5

---

### US4.4: Shop Interface

**As a** player
**I want** a clear shop interface
**So that** I can easily browse and purchase items

**Acceptance Criteria**:
- [ ] Categories: Gems, Coins, Power-ups, Themes, VIP
- [ ] Clear pricing and value indicators
- [ ] Purchase confirmation modal
- [ ] Currency balance always visible
- [ ] Limited-time offers highlighted
- [ ] Purchase success animation
- [ ] Error handling with retry option

**Technical Notes**:
- Modular shop item system
- Remote config for pricing/offers
- A/B test shop layouts

**Story Points**: 8
**Priority**: P0
**Sprint**: 4

---

### US4.5: Virtual Currency System

**As a** player
**I want** to earn and spend in-game currency
**So that** I can progress without always spending money

**Acceptance Criteria**:
- [ ] Coins: Earned from gameplay, used for power-ups
- [ ] Gems: Premium currency for cosmetics/instant unlocks
- [ ] Daily login bonus (coins)
- [ ] Achievement rewards (coins + gems)
- [ ] Clear conversion display in shop
- [ ] Currency balance in header

**Technical Notes**:
- Dual currency economy
- Server-validated for multiplayer fairness
- Anti-exploit measures

**Story Points**: 5
**Priority**: P0
**Sprint**: 3

---

## 6. Epic 5: Social Features

### E5 Overview
**Goal**: Enable social connections to drive viral growth and retention.

---

### US5.1: Friend System

**As a** social player
**I want** to add friends
**So that** I can see their progress and compete

**Acceptance Criteria**:
- [ ] Add friends via username/code
- [ ] Import from contacts (with permission)
- [ ] Friend list with online status
- [ ] View friend profiles and stats
- [ ] Challenge friends to matches
- [ ] 100 friend maximum

**Story Points**: 8
**Priority**: P1
**Sprint**: 5

---

### US5.2: Score Sharing

**As a** proud player
**I want** to share my scores
**So that** I can show off to friends

**Acceptance Criteria**:
- [ ] Share button on result screen
- [ ] Generate shareable image card
- [ ] Share to social platforms
- [ ] Deep link to download app
- [ ] Track shares for referral program

**Story Points**: 5
**Priority**: P1
**Sprint**: 5

---

### US5.3: Push Notifications

**As a** returning player
**I want** to receive relevant notifications
**So that** I remember to play

**Acceptance Criteria**:
- [ ] Daily challenge reminder
- [ ] Streak at risk warning
- [ ] Friend challenge notification
- [ ] Season/event announcements
- [ ] Configurable in settings
- [ ] Respect quiet hours

**Story Points**: 5
**Priority**: P1
**Sprint**: 5

---

### US5.4: Social Hub

**As a** connected player
**I want** a central social screen
**So that** I can manage my social activities

**Acceptance Criteria**:
- [ ] Friend activity feed
- [ ] Pending friend requests
- [ ] Challenge invitations
- [ ] Quick compare with friends
- [ ] Social achievement showcase

**Story Points**: 8
**Priority**: P2
**Sprint**: 6

---

## 7. Epic 6: Technical Foundation

### E6 Overview
**Goal**: Build robust technical infrastructure for reliability and performance.

---

### US6.1: Dictionary System

**As a** developer
**I want** an efficient dictionary system
**So that** word validation is fast and accurate

**Acceptance Criteria**:
- [ ] Trie data structure implementation
- [ ] <50ms lookup time
- [ ] <15MB memory per language
- [ ] <500ms load time
- [ ] Offline functionality
- [ ] OTA dictionary updates

**Story Points**: 13
**Priority**: P0
**Sprint**: 1

---

### US6.2: Cloud Save System

**As a** player
**I want** my progress saved to the cloud
**So that** I don't lose it and can play on multiple devices

**Acceptance Criteria**:
- [ ] Automatic save after key events
- [ ] Manual sync option
- [ ] Conflict resolution (latest wins, max for scores)
- [ ] Offline queue for failed saves
- [ ] Cross-platform sync (iOS ↔ Android)
- [ ] Data export for GDPR

**Story Points**: 13
**Priority**: P0
**Sprint**: 2

---

### US6.3: Analytics Integration

**As a** product team
**I want** comprehensive analytics
**So that** we can understand player behavior

**Acceptance Criteria**:
- [ ] Session tracking (start, end, duration)
- [ ] Event tracking (level_start, word_found, purchase)
- [ ] User properties (level, language, subscription)
- [ ] Funnel tracking (onboarding, first purchase)
- [ ] Retention cohorts
- [ ] Revenue tracking

**Story Points**: 8
**Priority**: P0
**Sprint**: 2

---

### US6.4: Performance Optimization

**As a** player
**I want** the game to run smoothly
**So that** I have an enjoyable experience

**Acceptance Criteria**:
- [ ] 60 FPS on target devices
- [ ] <300MB memory usage
- [ ] <3s cold start time
- [ ] <8% battery drain per hour
- [ ] Adaptive quality for low-end devices

**Story Points**: 13
**Priority**: P0
**Sprint**: 2-3

---

### US6.5: Authentication System

**As a** player
**I want** multiple sign-in options
**So that** I can choose my preferred method

**Acceptance Criteria**:
- [ ] Guest play (anonymous)
- [ ] Email/password
- [ ] Google Sign-In
- [ ] Apple Sign-In (iOS)
- [ ] Account linking (guest → full account)
- [ ] Account deletion (GDPR)

**Story Points**: 8
**Priority**: P0
**Sprint**: 2

---

### US6.6: Crash Reporting & Monitoring

**As a** developer
**I want** crash reporting
**So that** we can fix issues quickly

**Acceptance Criteria**:
- [ ] Automatic crash reporting (Crashlytics)
- [ ] ANR detection (Android)
- [ ] Custom error logging
- [ ] Performance monitoring
- [ ] Alerting on crash spike
- [ ] <0.5% crash rate target

**Story Points**: 5
**Priority**: P0
**Sprint**: 1

---

## 8. Sprint Planning

### 8.1 Sprint Allocation

| Sprint | Duration | Focus | Stories |
|--------|----------|-------|---------|
| Sprint 1 | 2 weeks | Core Grid + Dictionary | US1.1-1.4, US6.1, US6.6 |
| Sprint 2 | 2 weeks | Scoring + Cascade + Cloud | US1.5-1.6, US2.1, US6.2-6.5 |
| Sprint 3 | 2 weeks | Progression + Special | US1.7-1.8, US3.1, US4.5 |
| Sprint 4 | 2 weeks | Campaign + Daily + Shop | US2.2-2.3, US3.2-3.3, US4.1-4.2, US4.4 |
| Sprint 5 | 2 weeks | PvP + Social + Subscription | US2.4-2.5, US3.5, US4.3, US5.1-5.3 |
| Sprint 6 | 2 weeks | Premium + Polish | US2.6, US3.4, US5.4 |

### 8.2 Story Point Velocity

**Assumed Velocity**: 40 story points per sprint

| Sprint | Story Points | Cumulative |
|--------|--------------|------------|
| Sprint 1 | 44 | 44 |
| Sprint 2 | 42 | 86 |
| Sprint 3 | 34 | 120 |
| Sprint 4 | 55 | 175 |
| Sprint 5 | 47 | 222 |
| Sprint 6 | 34 | 256 |

**Total**: ~256 story points over 12 weeks

---

## 9. Definition of Done

### 9.1 Story DoD

- [ ] Code complete and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] UI matches design specifications
- [ ] Accessibility requirements met
- [ ] Performance targets met
- [ ] Analytics events implemented
- [ ] Localization complete (PL + EN)
- [ ] QA sign-off
- [ ] Documentation updated

### 9.2 Epic DoD

- [ ] All stories complete
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security review complete
- [ ] Stakeholder demo and approval
- [ ] Release notes prepared

---

*Generated by BMAD PRD Workflow v1.0*
