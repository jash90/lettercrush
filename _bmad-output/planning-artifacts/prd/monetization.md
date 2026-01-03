# WordGrid PRD - Monetization Strategy

**Parent Document:** [PRD Overview](./overview.md)

---

## 1. Monetization Overview

WordGrid uses a hybrid monetization model combining:

| Revenue Stream | Target % of Revenue | v1.0 | v2.0 |
|----------------|---------------------|------|------|
| In-App Purchases | 45-50% | ✅ | ✅ |
| Advertising | 40-45% | ✅ | ✅ |
| Subscription | 5-10% | ❌ | ✅ |
| Battle Pass | 5-10% | ❌ | ✅ |

**Target ARPDAU:** $0.06-0.10 (hybrid model)

---

## 2. Currency System

### 2.1 Soft Currency: Coins

| Aspect | Details |
|--------|---------|
| **Icon** | 🪙 Gold coin |
| **Earning** | Gameplay, daily login, achievements, ads |
| **Spending** | Hints, shuffles, basic power-ups, continues |
| **Daily Cap** | ~500 coins (prevent inflation) |

#### Coin Economy

| Source | Coins/Day (Active Player) |
|--------|--------------------------|
| Gameplay (avg) | 100-150 |
| Daily Login | 50 |
| Daily Challenge | 100-300 |
| Rewarded Ads | 50-500 (5-10 views) |
| **Total Daily** | **300-1,000** |

| Sink | Cost |
|------|------|
| Hint | 50 coins |
| Shuffle | 100 coins |
| Time Freeze | 150 coins |
| Wildcard | 200 coins |
| Bomb | 250 coins |
| Continue (Campaign) | 100 coins |

### 2.2 Hard Currency: Gems

| Aspect | Details |
|--------|---------|
| **Icon** | 💎 Diamond |
| **Earning** | Purchases, achievements, Battle Pass, rare events |
| **Spending** | Premium power-ups, cosmetics, coin packs, skip timers |
| **F2P Earn Rate** | ~10-15 gems/week |

#### Gem Value Anchoring

| Item | Gem Cost | Perceived Value |
|------|----------|-----------------|
| 1,000 coins | 100 gems | $1.00 |
| Premium theme | 500 gems | $5.00 |
| Avatar | 300 gems | $3.00 |
| Power-up bundle | 200 gems | $2.00 |

---

## 3. In-App Purchases

### 3.1 Gem Packs

| Product | Price | Gems | Bonus | $/Gem |
|---------|-------|------|-------|-------|
| Starter Pack | $0.99 | 80 | +500 coins, 3 hints | $0.012 |
| Small Pack | $4.99 | 500 | +10% (50 gems) | $0.010 |
| Medium Pack | $9.99 | 1,200 | +20% (200 gems) | $0.008 |
| Large Pack | $19.99 | 2,800 | +40% (800 gems) | $0.007 |
| Mega Pack | $49.99 | 8,000 | +60% (3,000 gems) + avatar | $0.006 |

### 3.2 Special Offers

| Offer Type | Trigger | Duration | Discount |
|------------|---------|----------|----------|
| First Purchase | First IAP prompt | 24 hours | 50% |
| Level Up Bundle | Every 5 levels | 1 hour | 30% |
| Failed Level | 3 consecutive fails | 30 min | 40% |
| Comeback Bundle | Returning after 7+ days | 48 hours | 50% |
| Holiday Special | Calendar events | Event duration | 40% |

### 3.3 Consumable Bundles

| Bundle | Contents | Price |
|--------|----------|-------|
| Hint Pack | 10 hints | $0.99 |
| Power Pack | 5 each power-up | $2.99 |
| Mega Bundle | 20 hints + 10 shuffles + 5 bombs | $4.99 |

### 3.4 IAP Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-IAP-01 | Purchases shall process through App Store/Play Store | P0 |
| FR-IAP-02 | Purchased items shall be delivered immediately | P0 |
| FR-IAP-03 | Purchase history shall be viewable in-app | P2 |
| FR-IAP-04 | Restore purchases shall work on new devices | P0 |
| FR-IAP-05 | Limited offers shall show countdown timer | P1 |

---

## 4. Advertising Strategy

### 4.1 Ad Types & Placement

#### 4.1.1 Rewarded Video Ads

| Parameter | Value |
|-----------|-------|
| **Placement** | Post-game continue, shop bonus, daily bonus |
| **Reward** | 50 coins OR 1 hint OR +30 sec time |
| **Daily Limit** | 10 views |
| **User Initiated** | Always |

#### 4.1.2 Interstitial Ads

| Parameter | Value |
|-----------|-------|
| **Frequency** | Every 5 completed levels |
| **Skip Timer** | 5 seconds |
| **Cool-down** | 3 minutes minimum |
| **Trigger** | Only after WIN, never after loss |

#### 4.1.3 Banner Ads

| Parameter | Value |
|-----------|-------|
| **Placement** | Main menu, map screen only |
| **Size** | 320×50 (standard) |
| **NEVER** | During active gameplay |

### 4.2 Ad Revenue Targets

| Metric | Target |
|--------|--------|
| Rewarded views/DAU | 2-3 |
| Interstitial impressions/DAU | 1-2 |
| Banner CTR | 0.5-1% |
| eCPM (rewarded) | $15-25 |
| eCPM (interstitial) | $8-15 |
| eCPM (banner) | $1-3 |

### 4.3 Ad Network Integration

| Network | Priority | Use Case |
|---------|----------|----------|
| AdMob | Primary | All formats |
| ironSource | Secondary | Rewarded video |
| Unity Ads | Tertiary | Fallback |
| Meta Audience | Quaternary | High-value users |

### 4.4 Advertising Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AD-01 | Rewarded ads shall deliver reward upon completion | P0 |
| FR-AD-02 | Interstitials shall be skippable after 5 seconds | P0 |
| FR-AD-03 | Ads shall not appear during active gameplay | P0 |
| FR-AD-04 | Ad frequency shall respect cool-down periods | P1 |
| FR-AD-05 | Premium/subscription users shall see no ads | P0 |

---

## 5. Subscription Model (v2.0)

### 5.1 WordGrid Premium

| Tier | Price | Billing |
|------|-------|---------|
| Monthly | $7.99/month | Recurring |
| Annual | $49.99/year | Recurring (48% savings) |

### 5.2 Premium Benefits

| Benefit | Value |
|---------|-------|
| Ad-free experience | All formats removed |
| Daily hints | 5 free hints/day |
| Exclusive themes | 3 new themes/month |
| XP Boost | +20% permanent |
| Priority matchmaking | PvP queue priority |
| Early access | New regions 1 week early |
| Premium badge | Profile display |

### 5.3 Subscription Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SUB-01 | Subscription status shall sync within 60 seconds | P0 |
| FR-SUB-02 | Benefits shall activate immediately on purchase | P0 |
| FR-SUB-03 | Expiration warning shall show 3 days before renewal | P1 |
| FR-SUB-04 | Subscription shall be manageable via platform settings | P0 |

---

## 6. Battle Pass Revenue (v2.0)

### 6.1 Battle Pass Economics

| Parameter | Value |
|-----------|-------|
| **Season Length** | 8 weeks |
| **Premium Price** | $4.99 |
| **Target Purchase Rate** | 5-8% of D30 users |
| **Value Delivered** | ~$15 worth of items |

### 6.2 Revenue Calculation

| Scenario | Calculation |
|----------|-------------|
| 100,000 DAU | 100,000 × 5% × $4.99 = $24,950/season |
| Per User | $4.99 × 6.5 seasons/year = $32.44/year |

---

## 7. Conversion Optimization

### 7.1 First Purchase Funnel

```
Install → Tutorial Complete → First Soft Block
                                    ↓
                        Offer: Starter Pack ($0.99)
                                    ↓
              [Accept] → 45% convert within 7 days
              [Decline] → Retarget at level 10, 20
```

### 7.2 Conversion Targets

| Metric | Target | Industry Avg |
|--------|--------|--------------|
| Install → First Purchase | 2-4% | 2-3% |
| D7 Payer Rate | 3-5% | 2-4% |
| D30 Payer Rate | 5-8% | 4-6% |
| ARPPU (30 days) | $8-15 | $10-12 |

### 7.3 Whale Management

| Player Segment | % of Payers | % of Revenue | Strategy |
|----------------|-------------|--------------|----------|
| Minnows ($0-10) | 70% | 15% | Volume, engagement |
| Dolphins ($10-50) | 25% | 35% | Value packs, Battle Pass |
| Whales ($50+) | 5% | 50% | Exclusive offers, VIP |

---

## 8. Anti-Pay-to-Win Principles

| Principle | Implementation |
|-----------|----------------|
| No gameplay advantage | Power-ups available to F2P via grinding |
| Skill matters | High skill beats purchased power-ups |
| Cosmetic focus | Premium items are mostly visual |
| Fair PvP | Matchmaking ignores spending |
| Generous F2P | Core game fully playable free |

---

## 9. Revenue KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| ARPDAU | $0.06-0.10 | Daily revenue / DAU |
| ARPPU | $8-15 | Revenue / paying users (30 days) |
| Conversion rate | 2-4% | Paying users / total users |
| LTV | $1.50-3.00 | Lifetime value per install |
| IAP/Ad split | 50/50 | Revenue balance |

---

*Generated by BMAD PRD Workflow v1.0*
