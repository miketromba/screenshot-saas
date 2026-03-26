# ScreenshotAPI — Product & Pricing Strategy

> Internal strategy document. Last updated: March 2026.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Assessment](#current-state-assessment)
3. [Competitive Landscape](#competitive-landscape)
4. [Pricing Analysis](#pricing-analysis)
5. [Recommended Pricing Restructure](#recommended-pricing-restructure)
6. [Feature Gap Analysis](#feature-gap-analysis)
7. [Differentiation Strategy](#differentiation-strategy)
8. [Go-to-Market Roadmap](#go-to-market-roadmap)
9. [Key Metrics to Track](#key-metrics-to-track)

---

## Executive Summary

ScreenshotAPI (screenshotapi.to) is a website screenshot API that currently uses a credit-pack pricing model. Our competitive analysis of 16 direct competitors reveals that we are **priced 3–9x above market rates** on a per-screenshot basis while offering **fewer features** than most established players. This puts us in the worst competitive quadrant: high price, fewer features.

This document outlines a strategy to reposition ScreenshotAPI into the optimal quadrant — competitive pricing, superior developer experience, and targeted differentiation — through a three-phase plan spanning pricing restructure, feature parity, and DX-driven differentiation.

**Core recommendation:** Introduce subscription tiers priced competitively against ScreenshotOne (the mid-market leader), close critical feature gaps within 6 weeks, increase the free tier from 5 to 200 screenshots/month, and differentiate on developer experience and API simplicity rather than racing to the lowest price.

---

## Current State Assessment

### What We Offer Today

- **API:** Single GET endpoint returning screenshot images
- **Formats:** PNG, JPEG, WebP
- **Features:** Custom viewports, full-page capture, light/dark mode (colorScheme), wait strategies (network idle, CSS selector, delay), quality control
- **SDKs:** JavaScript, Python, Go, Ruby, PHP
- **Auth:** API key via `x-api-key` header or Bearer token
- **Playground:** Interactive testing in dashboard

### Current Pricing (Credit Packs)

| Pack    | Credits | Price | Per Screenshot |
|---------|---------|-------|----------------|
| Starter | 500     | $20   | $0.0400        |
| Growth  | 2,000   | $60   | $0.0300        |
| Pro     | 10,000  | $200  | $0.0200        |
| Scale   | 50,000  | $750  | $0.0150        |

- 5 free credits on signup
- No subscription, credits never expire
- No overage billing

### Current Strengths

- **Clean, simple API design** — single GET request, no complex auth flows
- **No-subscription model** — genuinely appealing for irregular/unpredictable usage
- **Dark/light mode capture** — `colorScheme` parameter that few competitors offer explicitly
- **Interactive playground** — good for onboarding and experimentation
- **Multi-language SDKs** — 5 official SDKs covering major ecosystems

### Current Weaknesses

- **Pricing is 3–9x above market** at every volume tier
- **Free tier is effectively zero** — 5 credits is not enough to evaluate the product
- **Missing table-stakes features** — no ad blocking, PDF export, HTML rendering, webhooks, caching, S3 upload, or cookie banner removal
- **No subscription option** — forces a comparison where credit-pack pricing always looks more expensive
- **No annual billing** — missing opportunity for cash flow and retention

---

## Competitive Landscape

### Market Map (16 competitors analyzed)

#### Budget Tier — Lowest Cost Per Screenshot

| Competitor        | Model        | Free Tier     | ~10K Price | Per Screenshot | Key Differentiator           |
|-------------------|-------------|---------------|------------|----------------|------------------------------|
| **SnapRender**    | Subscription | 500/mo        | $29/mo     | $0.0029        | All features on all plans    |
| **GrabShot**      | Subscription | 100/mo (watermark) | $29/mo | $0.0030       | AI cleanup + device mockups  |
| **ScreenshotAPI.net** | Subscription | 100 (trial) | $29/mo    | $0.0029        | Bulk + scheduling            |
| **ApiFlash**      | Subscription | 100/mo        | $35/mo     | $0.0035        | AWS Lambda-based, stable     |
| **ScreenshotMachine** | Subscription | 100/mo    | ~$64/mo    | ~$0.003        | Longest track record, EUR pricing |

#### Mid-Market — Established Players

| Competitor        | Model        | Free Tier     | ~10K Price | Per Screenshot | Key Differentiator           |
|-------------------|-------------|---------------|------------|----------------|------------------------------|
| **ScreenshotOne** | Subscription | 100/mo        | $79/mo     | $0.0079        | Custom feature dev, best docs|
| **Screenshotly**  | Subscription | 100 total     | $59/mo (12K) | $0.0049     | AI element removal, mockups  |
| **HTMLCSStoImage** | Subscription | 50/mo        | $69/mo     | $0.0069        | HTML/CSS-first, no rate limits|
| **PageBolt**      | Sub + PAYG  | 100/mo        | $79/mo (25K) | $0.0032     | 7 APIs in one, video recording|
| **Microlink**     | Subscription | 50 req/day    | from $39/mo (46K) | ~$0.001 | Metadata + screenshots, CDN  |

#### Premium / Enterprise

| Competitor        | Model        | Free Tier     | Entry Price | Key Differentiator           |
|-------------------|-------------|---------------|-------------|------------------------------|
| **Urlbox**        | Subscription | 7-day trial   | $19/mo (Lo-Fi) | Stealth mode, enterprise SLAs|
| **URL2PNG**       | Subscription | None          | $29/mo      | Oldest player, Fastly CDN    |
| **ScrapingBee**   | Subscription | 1,000 credits | $49/mo      | Full scraping suite bundled  |
| **Stillio**       | Subscription | 14-day trial  | $29/mo      | Monitoring/archival focus    |

#### Credit-Based (Same Model as Us)

| Competitor        | Free Tier     | ~10K Cost  | Per Screenshot | Notes                        |
|-------------------|---------------|------------|----------------|------------------------------|
| **Browshot**      | 100/mo        | ~$50 (8K)  | $0.00625       | Pay-as-you-go, no subscription|
| **Us (current)**  | 5 total       | $200       | $0.0200        | Credit packs, no expiry      |

### Market Trends

1. **Prices are falling fast.** New entrants (SnapRender, GrabShot, Screenshotly) are aggressively undercutting established players. The $0.002–0.005/screenshot range is becoming standard.

2. **AI features are emerging.** AI-powered cookie banner removal, chat widget detection, and automatic element cleanup are becoming differentiators (Screenshotly, GrabShot).

3. **Beyond screenshots.** Competitors are bundling PDF generation, video recording, OG image generation, and metadata extraction into a single API (PageBolt, Microlink).

4. **Free tiers are table stakes.** 100–500 free screenshots per month is the norm. Anything less is a conversion bottleneck.

5. **Developer experience wins.** The APIs winning market share invest heavily in documentation, interactive playgrounds, SDKs, and time-to-first-screenshot.

---

## Pricing Analysis

### Per-Screenshot Cost Comparison at Key Volumes

#### At 2,000 Screenshots

| Provider          | Cost           | Per Screenshot | vs. Us     |
|-------------------|----------------|----------------|------------|
| **Us (current)**  | $60 (one-time) | $0.0300        | —          |
| SnapRender        | $9/mo          | $0.0045        | 6.7x cheaper |
| Screenshotly      | $14/mo (2.5K)  | $0.0056        | 5.4x cheaper |
| ApiFlash          | $7/mo (1K)     | $0.0070        | 4.3x cheaper |
| ScreenshotOne     | $17/mo         | $0.0085        | 3.5x cheaper |

#### At 10,000 Screenshots

| Provider          | Cost           | Per Screenshot | vs. Us     |
|-------------------|----------------|----------------|------------|
| **Us (current)**  | $200 (one-time)| $0.0200        | —          |
| SnapRender        | $29/mo         | $0.0029        | 6.9x cheaper |
| ScreenshotAPI.net | $29/mo         | $0.0029        | 6.9x cheaper |
| GrabShot          | $29/mo         | $0.0030        | 6.7x cheaper |
| ApiFlash          | $35/mo         | $0.0035        | 5.7x cheaper |
| PageBolt          | $79/mo (25K)   | $0.0032        | 6.3x cheaper |
| Screenshotly      | $59/mo (12K)   | $0.0049        | 4.1x cheaper |
| Urlbox            | $99/mo (15K)   | $0.0066        | 3.0x cheaper |
| ScreenshotOne     | $79/mo         | $0.0079        | 2.5x cheaper |

#### At 50,000 Screenshots

| Provider          | Cost           | Per Screenshot | vs. Us     |
|-------------------|----------------|----------------|------------|
| **Us (current)**  | $750 (one-time)| $0.0150        | —          |
| SnapRender        | $79/mo         | $0.0016        | 9.4x cheaper |
| GrabShot          | $79/mo         | $0.0016        | 9.4x cheaper |
| ApiFlash          | $180/mo (100K) | $0.0018        | 8.3x cheaper |
| ScreenshotMachine | ~$108/mo       | $0.0020        | 7.5x cheaper |
| Screenshotly      | $199/mo        | $0.0040        | 3.8x cheaper |
| ScreenshotOne     | $259/mo        | $0.0052        | 2.9x cheaper |

### Free Tier Comparison

| Provider          | Free Screenshots    |
|-------------------|---------------------|
| SnapRender        | 500/month           |
| ScreenshotOne     | 100/month           |
| GrabShot          | 100/month (watermark)|
| Screenshotly      | 100 total (lifetime)|
| ApiFlash          | 100/month           |
| HTMLCSStoImage    | 50/month            |
| Microlink         | 50/day              |
| **Us (current)**  | **5 total**         |

Our free tier is by far the smallest in the market. It is insufficient for evaluation.

### Pricing Model Comparison

| Model                 | Providers                         | Advantage                                 | Disadvantage                              |
|-----------------------|-----------------------------------|-------------------------------------------|-------------------------------------------|
| Monthly subscription  | ScreenshotOne, Urlbox, most others| Predictable revenue, lower per-unit cost   | Recurring commitment, unused credits lost  |
| Sub + overage billing | ScreenshotOne, Screenshotly       | Flexibility to burst beyond plan           | Surprise bills for customers               |
| Credit packs (ours)   | ScreenshotAPI, Browshot           | No recurring cost, use at own pace         | Higher per-unit, looks expensive in comparison|
| PAYG only             | PageBolt ($0.015/req)             | Zero commitment                            | Highest per-unit cost                      |

---

## Recommended Pricing Restructure

### Strategy: Dual-Model Pricing

Introduce monthly subscriptions as the primary pricing model while retaining credit packs as a secondary option. This gives us the best of both worlds — competitive subscription pricing for steady users, and the unique no-commitment credit model for irregular users.

### New Subscription Tiers

| Plan    | Screenshots/mo | Monthly | Annual (20% off) | Per Screenshot | Overage Rate |
|---------|---------------|---------|-------------------|----------------|-------------|
| Free    | 200/mo        | $0      | —                 | —              | —           |
| Starter | 5,000/mo      | $19/mo  | $15/mo ($180/yr)  | $0.0038        | $0.006      |
| Growth  | 25,000/mo     | $49/mo  | $39/mo ($468/yr)  | $0.0020        | $0.004      |
| Scale   | 100,000/mo    | $149/mo | $119/mo ($1,428/yr)| $0.0015       | $0.003      |

### Rationale for Each Tier

**Free (200/mo):** More generous than ScreenshotOne (100/mo) and Screenshotly (100 total). Less than SnapRender (500/mo) — we can increase later if needed. 200 is enough to build and demo a working integration. No credit card required.

**Starter ($19/mo for 5K):** Directly undercuts ScreenshotOne's Basic ($17/mo for 2K) on value — 2.5x more screenshots for $2 more. Competitive with SnapRender ($9/mo for 2K) on a per-screenshot basis while positioning slightly upmarket.

**Growth ($49/mo for 25K):** Sweet spot for growing products. Significantly better value than ScreenshotOne's Growth ($79/mo for 10K) — 2.5x more screenshots for 38% less cost. Comparable to Screenshotly's Growth ($59/mo for 12K) with better value per screenshot.

**Scale ($149/mo for 100K):** Targets high-volume users. Undercuts ScreenshotOne's Scale ($259/mo for 50K) dramatically — 2x the screenshots for 42% less cost. Cheaper than ApiFlash's Large ($180/mo for 100K). At $0.0015/screenshot, this is competitive with even the budget players at scale.

### Retained Credit Packs (Secondary Option)

Keep credit packs for users who prefer no recurring commitment. Reduce prices to be competitive:

| Pack    | Credits | New Price | Per Screenshot | Old Price | Reduction |
|---------|---------|-----------|----------------|-----------|-----------|
| Starter | 1,000   | $9        | $0.0090        | $20/500   | -78%      |
| Growth  | 5,000   | $29       | $0.0058        | $60/2K    | -81%      |
| Pro     | 25,000  | $99       | $0.0040        | $200/10K  | -80%      |
| Scale   | 100,000 | $299      | $0.0030        | $750/50K  | -80%      |

Credit packs are intentionally priced higher per-screenshot than subscriptions (that's the premium for no commitment), but still dramatically cheaper than our current pricing.

### How This Compares to the Market

#### At 5,000 Screenshots (Starter)

| Provider          | Cost     | Per Screenshot |
|-------------------|----------|----------------|
| **Us (new)**      | **$19/mo** | **$0.0038**  |
| SnapRender        | ~$15/mo  | $0.0030        |
| ScreenshotOne     | $17/mo (2K only) | $0.0085 |
| Screenshotly      | $14/mo (2.5K only) | $0.0056|
| GrabShot          | ~$15/mo  | $0.0030        |

Competitive. Slightly above budget players, significantly below established players.

#### At 25,000 Screenshots (Growth)

| Provider          | Cost     | Per Screenshot |
|-------------------|----------|----------------|
| **Us (new)**      | **$49/mo** | **$0.0020**  |
| SnapRender        | ~$50/mo  | $0.0020        |
| ScreenshotOne     | $79/mo (10K) + overage | ~$0.005 |
| PageBolt          | $79/mo   | $0.0032        |
| Screenshotly      | $59/mo (12K) + overage | ~$0.004 |

Excellent value. Matches budget players, dramatically undercuts mid-market.

#### At 100,000 Screenshots (Scale)

| Provider          | Cost     | Per Screenshot |
|-------------------|----------|----------------|
| **Us (new)**      | **$149/mo** | **$0.0015**|
| SnapRender        | ~$130/mo | $0.0013        |
| ApiFlash          | $180/mo  | $0.0018        |
| ScreenshotOne     | $259/mo (50K) + overage | ~$0.004 |
| Urlbox            | $498/mo+ | $0.0050+       |

Very competitive at scale. Close to budget leaders, far below mid-market and premium.

### Competitive Position: Before, After Pricing, and After Features

**Today — High price, few features (worst quadrant):**

```
                    HIGH PRICE PER SCREENSHOT
                           |
   >> US (today) <<        |
            Stillio         |  Urlbox (enterprise)
            (monitoring)    |  ScrapingBee (bundled)
                           |
   FEW FEATURES -----------+----------- MANY FEATURES
                           |
            URL2PNG         |  ScreenshotOne
            Browshot        |  Screenshotly
                           |  PageBolt
            SnapRender      |
            GrabShot        |
            ApiFlash        |
                           |
                    LOW PRICE PER SCREENSHOT
```

**After Phase 1 (pricing restructure) — Low price, still few features:**

Pricing alone moves us down (cheaper) but NOT right (no new features yet).

```
                    HIGH PRICE PER SCREENSHOT
                           |
            Stillio         |  Urlbox (enterprise)
            (monitoring)    |  ScrapingBee (bundled)
                           |
   FEW FEATURES -----------+----------- MANY FEATURES
                           |
            URL2PNG         |  ScreenshotOne
            Browshot        |  Screenshotly
                           |  PageBolt
         >> US (new price) <<
            SnapRender      |
            GrabShot        |
            ApiFlash        |
                           |
                    LOW PRICE PER SCREENSHOT
```

**After Phase 2 (feature parity) — Low price, many features (optimal quadrant):**

Feature work moves us right. This is the target position.

```
                    HIGH PRICE PER SCREENSHOT
                           |
            Stillio         |  Urlbox (enterprise)
            (monitoring)    |  ScrapingBee (bundled)
                           |
   FEW FEATURES -----------+----------- MANY FEATURES
                           |
            URL2PNG         |  ScreenshotOne
            Browshot        |  Screenshotly
                           |  PageBolt
            SnapRender      |  >> US (target) <<
            GrabShot        |
            ApiFlash        |
                           |
                    LOW PRICE PER SCREENSHOT
```

The transition is two distinct moves: Phase 1 drops us down (price), Phase 2 moves us right (features). We don't reach the optimal quadrant until both are done.

---

## Feature Gap Analysis

### Features by Priority

#### P0 — Table Stakes (Must Have Before Marketing Push)

These features are offered by virtually every competitor. Missing them is a dealbreaker for many buyers.

| Feature                    | Competitors That Have It | Effort Estimate | Impact |
|----------------------------|--------------------------|-----------------|--------|
| **Ad blocking**            | ScreenshotOne, Urlbox, Screenshotly, SnapRender, GrabShot, ApiFlash | Medium | High — top requested feature |
| **Cookie banner removal**  | ScreenshotOne, Urlbox, Screenshotly, GrabShot, ApiFlash | Medium | High — related to ad blocking |
| **PDF export**             | ScreenshotOne, Urlbox, Screenshotly, SnapRender, PageBolt, ApiFlash | Low | High — many use cases need PDF |
| **Response caching**       | ScreenshotOne, Urlbox, Screenshotly, all others | Medium | High — reduces cost, improves speed |
| **Generous free tier**     | All competitors (100–500/mo) | Low | Critical — current 5 credits is a conversion killer |

#### P1 — Competitive Parity (Close Within 6 Weeks)

| Feature                    | Competitors That Have It | Effort Estimate | Impact |
|----------------------------|--------------------------|-----------------|--------|
| **HTML rendering**         | ScreenshotOne, Urlbox, Screenshotly, HTMLCSStoImage | Medium | Medium — unlocks OG image generation |
| **Webhooks**               | ScreenshotOne, Urlbox, Screenshotly, PageBolt | Medium | Medium — async workflows |
| **S3 upload**              | ScreenshotOne, Urlbox, Screenshotly, ApiFlash | Medium | Medium — storage integration |
| **Signed URLs**            | ScreenshotOne, Screenshotly | Low | Medium — security feature |
| **Stealth mode**           | ScreenshotOne, Urlbox, Screenshotly | High | Medium — needed for sites with bot detection |

#### P2 — Differentiators (Post-Parity)

| Feature                    | Competitors That Have It | Effort Estimate | Impact |
|----------------------------|--------------------------|-----------------|--------|
| **AI element removal**     | Screenshotly, GrabShot | High | High — emerging differentiator |
| **Device mockup frames**   | Screenshotly, GrabShot, PageBolt | Medium | Medium — marketing use case |
| **Video/scrolling capture**| ScreenshotOne, Urlbox, Screenshotly | High | Low — niche use case |
| **IP geolocation**         | ScreenshotOne, Screenshotly, Urlbox | Medium | Low — useful for international captures |
| **CSS/JS injection**       | ScreenshotOne, Screenshotly, URL2PNG | Low | Medium — power user feature |

### Current Feature Comparison (Before vs. After Roadmap)

| Feature              | Today | After P0 | After P1 | After P2 |
|----------------------|-------|----------|----------|----------|
| PNG/JPEG/WebP        |   Y   |    Y     |    Y     |    Y     |
| Custom viewport      |   Y   |    Y     |    Y     |    Y     |
| Full page capture    |   Y   |    Y     |    Y     |    Y     |
| Dark/light mode      |   Y   |    Y     |    Y     |    Y     |
| Wait strategies      |   Y   |    Y     |    Y     |    Y     |
| SDKs (5+ languages)  |   Y   |    Y     |    Y     |    Y     |
| Playground           |   Y   |    Y     |    Y     |    Y     |
| Ad blocking          |   N   |    Y     |    Y     |    Y     |
| Cookie banner removal|   N   |    Y     |    Y     |    Y     |
| PDF export           |   N   |    Y     |    Y     |    Y     |
| Response caching     |   N   |    Y     |    Y     |    Y     |
| HTML rendering       |   N   |    N     |    Y     |    Y     |
| Webhooks             |   N   |    N     |    Y     |    Y     |
| S3 upload            |   N   |    N     |    Y     |    Y     |
| Signed URLs          |   N   |    N     |    Y     |    Y     |
| Stealth mode         |   N   |    N     |    Y     |    Y     |
| AI element removal   |   N   |    N     |    N     |    Y     |
| Device mockups       |   N   |    N     |    N     |    Y     |
| CSS/JS injection     |   N   |    N     |    N     |    Y     |

---

## Differentiation Strategy

### Why Not "Cheapest"

Racing to the lowest price is unsustainable in this market:

1. **SnapRender and GrabShot are already at $0.0016/screenshot at scale.** Going below that means near-zero or negative margins on real compute costs (headless browsers, memory, bandwidth).

2. **No moat.** Price-based differentiation offers zero switching cost. Price-sensitive customers leave the moment someone undercuts you.

3. **Wrong signal.** Developers choosing infrastructure tools are wary of unsustainably cheap pricing — it signals the service may not be around long-term.

4. **The winners in API markets (Stripe, Twilio, Vercel) never won on price.** They won on developer experience, reliability, and documentation at a fair price.

### Recommended Positioning: "The Developer's Screenshot API"

**Tagline concept:** "The screenshot API that respects your time."

Core positioning pillars:

#### 1. Simplest API in the Market

Our single-GET-request design is already cleaner than most competitors. Lean into this:

- **Zero-config defaults** — sensible defaults for everything (width, height, format, wait strategy). A bare URL parameter should produce a great screenshot with no other options needed.
- **One endpoint, one pattern** — no separate endpoints for PDF vs. screenshot vs. HTML rendering. One unified endpoint with a `type` parameter.
- **Instant API keys** — generate a key in the dashboard with one click, no approval process.
- **Copy-paste examples** — for every language, every framework, every use case. A developer should go from signup to working screenshot in under 60 seconds.

#### 2. Best Documentation and Developer Experience

This is the most underrated competitive advantage in API markets:

- **Interactive API reference** — try every parameter live, see the result inline
- **Framework-specific guides** — not just "here's a cURL command" but "here's how to use this in Next.js App Router" with full working code
- **Error messages that help** — every error response should include what went wrong and how to fix it
- **Playground improvements** — sharable playground URLs, screenshot history, side-by-side comparison
- **Status page** — public uptime monitoring builds trust
- **Changelog** — show momentum and active development

#### 3. Flexible Pricing (Subscriptions + Credit Packs)

We are one of only two providers (with Browshot) offering non-expiring credit packs. Instead of abandoning this, make it a feature:

- "The only screenshot API with both subscription and pay-as-you-go pricing"
- Subscriptions for predictable workloads
- Credit packs for side projects, freelancers, and irregular usage
- No lock-in, switch between models anytime

#### 4. Rendering Fidelity

Our existing `colorScheme` parameter is a seed. Expand into a broader rendering quality story:

- **Accurate color scheme emulation** (already have)
- **Retina/HiDPI support** — 2x and 3x device pixel ratio
- **Font rendering accuracy** — preload system fonts, Google Fonts support
- **Timezone emulation** — capture sites as they appear in specific timezones
- **Locale emulation** — set Accept-Language for localized captures

### Positioning Against Specific Competitors

| Competitor      | Their Positioning | Our Counter-Positioning |
|-----------------|-------------------|------------------------|
| ScreenshotOne   | "Reliable, mature, custom dev" | "Same reliability, better value, simpler API" |
| Urlbox          | "Enterprise, stealth mode" | "80% of the features at 30% of the price" |
| SnapRender      | "Cheapest at scale" | "Better DX, better docs, comparable price" |
| GrabShot        | "AI cleanup + device mockups" | "Simpler API, no gimmicks, just works" (until we add AI features) |
| Screenshotly    | "AI-powered, modern" | "Simpler, more transparent, better free tier" |
| ApiFlash        | "Simple, AWS-based" | "More features, same simplicity, better SDKs" |

---

## Go-to-Market Roadmap

### Phase 1: Pricing & Free Tier (Week 1–2)

**Goal:** Remove the #1 conversion blocker (pricing) and #2 blocker (free tier).

- [ ] Implement new subscription tiers (Free/Starter/Growth/Scale)
- [ ] Implement new credit pack pricing alongside subscriptions
- [ ] Increase free tier from 5 to 200 screenshots/month
- [ ] Add annual billing option (20% discount)
- [ ] Update landing page pricing section
- [ ] Update dashboard billing/upgrade flows
- [ ] Integrate with Polar for subscription management
- [ ] Add plan usage indicators in dashboard
- [ ] Update API to enforce monthly limits and overage billing

### Phase 2: Feature Parity (Week 3–8)

**Goal:** Close the gaps that make us look incomplete compared to competitors.

**Week 3–4: P0 Features**
- [ ] Ad blocking (integrate uBlock Origin lists or similar in Playwright)
- [ ] Cookie banner removal (auto-dismiss common cookie consent frameworks)
- [ ] PDF export (add `type=pdf` support to screenshot endpoint)
- [ ] Response caching (cache by URL + options hash, configurable TTL)
- [ ] Cached responses should not count against quota

**Week 5–6: P1 Features (Part 1)**
- [ ] HTML rendering (accept raw HTML via POST body instead of URL)
- [ ] Webhooks (async screenshot completion notifications)
- [ ] CSS/JS injection (custom stylesheets and scripts before capture)

**Week 7–8: P1 Features (Part 2)**
- [ ] S3 upload (direct-to-S3 with user-provided credentials)
- [ ] Signed URLs (HMAC-signed request URLs for secure client-side usage)
- [ ] Stealth mode (rotate user agents, disable webdriver flag, etc.)

### Phase 3: Differentiation & Growth (Week 9+)

**Goal:** Build the features and experience that make us the clear best choice.

**Developer Experience**
- [ ] Rebuild documentation site with interactive API explorer
- [ ] Add framework-specific integration guides (Next.js, React, Vue, Django, Rails, Laravel, etc.)
- [ ] Improve error messages — every error includes a fix suggestion
- [ ] Add sharable playground URLs
- [ ] Launch public status page
- [ ] Launch public changelog

**Rendering Quality**
- [ ] Retina/HiDPI support (device pixel ratio parameter)
- [ ] Timezone emulation
- [ ] Locale/Accept-Language emulation
- [ ] Google Fonts preloading

**Advanced Features (P2)**
- [ ] AI element removal (ML-based detection of popups, banners, overlays)
- [ ] Device mockup frames (browser, iPhone, MacBook)
- [ ] IP geolocation (capture from specific regions)

**Marketing & Distribution**
- [ ] Launch on Product Hunt
- [ ] Write comparison pages (vs ScreenshotOne, vs Urlbox, vs ApiFlash)
- [ ] Publish SEO content targeting "screenshot API" keywords
- [ ] Create video tutorials and integration walkthroughs
- [ ] Submit to API directories (RapidAPI, API List, Public APIs)
- [ ] Build Zapier / Make integrations for no-code distribution

---

## Key Metrics to Track

### Conversion Funnel

| Metric                        | Current (Est.) | Target (90 days) |
|-------------------------------|----------------|-------------------|
| Landing page → Signup         | ~2%            | 5%+               |
| Signup → First screenshot     | ~30%           | 70%+              |
| Free → Paid conversion        | ~1%            | 5%+               |
| Time to first screenshot      | ~10 min        | < 60 seconds      |

### Revenue

| Metric                        | Target (90 days) |
|-------------------------------|-------------------|
| MRR                           | Track and grow    |
| Average Revenue Per User      | $30–50/mo         |
| Churn rate (monthly)          | < 5%              |
| Annual plan adoption          | > 30% of paid     |

### Product

| Metric                        | Target             |
|-------------------------------|--------------------|
| API uptime                    | 99.9%+             |
| Average response time (fresh) | < 3 seconds        |
| Average response time (cached)| < 200ms            |
| Failed screenshot rate        | < 1%               |
| Support response time         | < 4 hours          |

### Competitive

| Metric                        | How to Track       |
|-------------------------------|--------------------|
| Feature parity score          | Checklist vs. top 5 competitors quarterly |
| Pricing competitiveness       | Per-screenshot cost vs. market average quarterly |
| Search ranking for "screenshot API" | Google Search Console |
| Mentions in comparison articles | Google Alerts, social monitoring |

---

## Appendix: Full Competitor Pricing Database

### ScreenshotOne (screenshotone.com)

- **Model:** Monthly subscription
- **Free:** 100/month
- **Basic:** $17/mo — 2,000 screenshots, 40 req/min, $0.009 overage
- **Growth:** $79/mo — 10,000 screenshots, 80 req/min, $0.006 overage
- **Scale:** $259/mo — 50,000 screenshots, 150 req/min, $0.004 overage
- **Annual billing:** 2 months free
- **Notable:** Custom feature development on all plans, PDF generation, GPU rendering on Scale, strong documentation

### Urlbox (urlbox.io)

- **Model:** Monthly subscription
- **Lo-Fi:** $19/mo — 2,000 renders, 30 req/min (3rd party thumbnails only)
- **Hi-Fi:** $49/mo — 5,000 renders, 60 req/min
- **Ultra:** $99/mo — 15,000 renders, 250 req/min, stealth mode
- **Business:** $498/mo — $495 base + $3 per 1,000 renders, SLA
- **Enterprise:** From $3,000/mo
- **Notable:** Stealth rendering, most comprehensive feature set, strictest tier-gating

### ApiFlash (apiflash.com)

- **Model:** Monthly subscription
- **Free:** 100/month
- **Lite:** $7/mo — 1,000 screenshots
- **Medium:** $35/mo — 10,000 screenshots
- **Large:** $180/mo — 100,000 screenshots
- **Notable:** AWS Lambda-based, very stable, no-frills approach

### ScreenshotMachine (screenshotmachine.com)

- **Model:** Monthly subscription (EUR pricing)
- **Free:** 100/month
- **Basic:** EUR 9/mo — 2,500 screenshots, EUR 0.004 overage
- **Pro:** EUR 59/mo — 20,000 screenshots, EUR 0.003 overage
- **Enterprise:** EUR 99/mo — 50,000 screenshots, EUR 0.002 overage
- **Notable:** Longest-running service, unlimited cached impressions, GIF support

### ScreenshotAPI.net

- **Model:** Monthly subscription
- **Free:** 100 screenshots (7-day trial)
- **Essentials:** $9/mo — 1,000 screenshots, $0.009 overage, 20 req/min
- **Startup:** $29/mo — 10,000 screenshots, $0.008 overage, 40 req/min
- **Business:** $175/mo — 100,000 screenshots, $0.006 overage, 80 req/min
- **Notable:** Bulk screenshots, scheduling, website scraping

### Screenshotly (screenshotly.app)

- **Model:** Monthly subscription
- **Free:** 100 total (lifetime, not monthly)
- **Basic:** $14/mo — 2,500 screenshots, $0.007 overage, 40 req/min
- **Growth:** $59/mo — 12,000 screenshots, $0.005 overage, 80 req/min
- **Scale:** $199/mo — 50,000 screenshots, $0.003 overage, 200 req/min
- **Notable:** AI element removal, device mockup frames, 10+ SDKs

### GrabShot (grabshot.dev)

- **Model:** Monthly subscription
- **Free:** 100/month (watermarked)
- **Starter:** $9/mo — 1,000 screenshots, 20 req/min
- **Pro:** $29/mo — 10,000 screenshots, 60 req/min
- **Business:** $79/mo — 50,000 screenshots
- **Notable:** AI cleanup, device frames (browser, iPhone, MacBook), OG images

### SnapRender (snap-render.com)

- **Model:** Monthly subscription
- **Free:** 500/month
- **Plans:** $9/mo (2K), $29/mo (10K), $79/mo (50K), $199/mo (200K)
- **Notable:** Most generous free tier, all features on all plans, no feature gating, cheapest at scale

### HTMLCSStoImage (htmlcsstoimage.com)

- **Model:** Monthly subscription
- **Free:** 50/month
- **Paid:** $14/mo (1K) → $29/mo (3K) → $69/mo (10K) → $149/mo (30K) → $249/mo (65K) → $375/mo (100K) → $749/mo (200K) → $1,225/mo (350K) → $1,650/mo (500K) → $3,000/mo (1M)
- **Overage:** $10 per 1,000 images
- **Notable:** HTML/CSS-first approach, no rate limits, no seat charges

### PageBolt (pagebolt.dev)

- **Model:** Subscription + PAYG
- **Free:** 100/month
- **Plans:** $29/mo (5K), $79/mo (25K), $199/mo (100K)
- **PAYG:** $0.015 per request
- **Notable:** 7 APIs in one (screenshots, PDF, OG images, video recording, browser sequences, CI/CD, MCP server), video with AI narration

### Microlink (microlink.io)

- **Model:** Monthly subscription
- **Free:** 50 requests/day
- **Pro:** From $39/mo (46K–560K requests depending on tier)
- **Enterprise:** From $500/mo
- **Notable:** Metadata extraction, link previews, PDF generation, 240+ CDN edges, broadest scope

### URL2PNG (url2png.com)

- **Model:** Monthly subscription
- **Bootstrapped:** $29/mo — 5,000 screenshots, $0.006 overage
- **Killinit:** $199/mo — 50,000 screenshots, $0.004 overage
- **Enterprise:** Custom
- **No free tier**
- **Notable:** One of the oldest providers (since 2010), Fastly CDN, hot-linking encouraged

### Browshot (browshot.com)

- **Model:** Credit-based (pay-as-you-go)
- **Free:** 100/month
- **Credits:** $1 (10) → $10 (1K) → $50 (8K) → $100 (20K) → $200 (45K) → $500 (125K) → $1,000 (300K)
- **Notable:** Desktop = 1 credit, mobile = 2 credits, private browsers/servers available

### Screenshotlayer (screenshotlayer.com)

- **Model:** Monthly subscription
- **Free:** 100/month
- **Paid:** From $19.99/month
- **Notable:** Part of APILayer marketplace, S3/FTP export, custom CSS injection, full-page captures

### ScrapingBee (scrapingbee.com)

- **Model:** Monthly subscription (credit-based)
- **Free:** 1,000 credits
- **Freelance:** $49/mo — 250K credits
- **Startup:** $99/mo — 1M credits
- **Business:** $599/mo — 8M credits
- **Notable:** Screenshot is secondary to web scraping, JS rendering costs 5+ credits, residential proxies available

### Stillio (stillio.com)

- **Model:** Monthly subscription (monitoring-focused)
- **Snap Shot:** $29/mo — up to 5 pages tracked
- **Hot Shot:** $79/mo — up to 25 pages
- **Big Shot:** $199/mo — up to 100 pages
- **Top Shot:** From $299/mo — unlimited pages, up to every 5 min
- **Includes:** 6,000 screenshots/month, $0.05 per additional
- **Notable:** Focused on automated monitoring/archiving, not API-first

---

*This document should be reviewed and updated quarterly as the competitive landscape evolves.*
