# ScreenshotAPI — Bottom-of-Funnel SEO Plan

> **Goal:** Capture every high-intent search query from developers and product teams evaluating screenshot API solutions. Every page ends with a clear path to sign up.

---

## Table of Contents

1. [Content Pillars](#content-pillars)
2. [Competitor vs Pages](#1-competitor-vs-pages)
3. [Alternative Pages](#2-alternative-pages)
4. [How-To Guides](#3-how-to-guides)
5. [Use Case Pages](#4-use-case-pages)
6. [Language/Framework Integration Pages](#5-languageframework-integration-pages)
7. [Best-Of / Listicle Pages](#6-best-of--listicle-pages)
8. [Pricing Comparison Pages](#7-pricing-comparison-pages)
9. [Migration Guides](#8-migration-guides)
10. [Site Architecture](#site-architecture)
11. [Page Templates](#page-templates)
12. [Internal Linking Strategy](#internal-linking-strategy)
13. [Technical SEO](#technical-seo)
14. [Execution Roadmap](#execution-roadmap)
15. [KPIs & Measurement](#kpis--measurement)

---

## Content Pillars

Every page on the site maps to one of these pillars:

| Pillar | Intent | Funnel Stage | Example |
|--------|--------|-------------|---------|
| **Comparison** | "Which screenshot API should I use?" | BoFu | vs pages, alternative pages |
| **How-To** | "How do I take screenshots with [language]?" | BoFu | Tutorial guides |
| **Use Case** | "I need screenshots for [specific job]" | BoFu | OG images, visual testing |
| **Integration** | "Does it work with my stack?" | BoFu | Next.js, Django, Rails guides |
| **Evaluation** | "What's the best/cheapest screenshot API?" | BoFu | Listicles, pricing comparisons |

---

## 1. Competitor vs Pages

**URL pattern:** `/compare/screenshotapi-vs-{competitor}`

Each page follows a consistent structure: honest feature comparison table, pricing breakdown, code examples side-by-side, and a clear verdict. Honesty builds trust — acknowledge where competitors are strong.

### Target Competitors

| Priority | Competitor | Target Keyword | Est. Monthly Search Volume |
|----------|-----------|----------------|---------------------------|
| P0 | Urlbox | `screenshotapi vs urlbox`, `urlbox alternative` | Med |
| P0 | Screenshotlayer | `screenshotapi vs screenshotlayer`, `screenshotlayer alternative` | Med |
| P0 | APIFlash | `apiflash vs screenshotapi`, `apiflash alternative` | Low-Med |
| P0 | Puppeteer (self-hosted) | `screenshot api vs puppeteer`, `puppeteer screenshot alternative` | High |
| P0 | Playwright (self-hosted) | `screenshot api vs playwright`, `playwright screenshot service` | High |
| P1 | Browserless | `browserless alternative`, `browserless vs screenshot api` | Med |
| P1 | ScrapingBee | `scrapingbee screenshot alternative` | Low-Med |
| P1 | ScreenshotMachine | `screenshotmachine alternative` | Low |
| P1 | Microlink | `microlink screenshot alternative` | Low |
| P2 | PhantomJsCloud | `phantomjscloud alternative` | Low |
| P2 | ShrinkTheWeb | `shrinktheweb alternative` | Low |
| P2 | html-css-to-image | `html css to image alternative` | Low |
| P2 | PagePeeker | `pagepeeker alternative` | Low |
| P2 | Thumbnail.ws | `thumbnail.ws alternative` | Low |

### Page Template — vs Pages

```
## H1: ScreenshotAPI vs {Competitor} — Full Comparison ({current_year})

### Quick Summary (2-3 sentence verdict)

### Feature Comparison Table
- API simplicity
- Output formats (PNG, JPEG, WebP)
- Full-page capture
- Custom viewports
- Dark mode support
- Wait strategies (network idle, selector, delay)
- SDK availability
- Webhooks
- Response time / speed
- Uptime / reliability

### Pricing Comparison
Side-by-side pricing breakdown with per-screenshot cost at various volumes.
Highlight ScreenshotAPI's credit-based model (no subscriptions, credits never expire).

### Code Examples Side by Side
Show the same task (capture a screenshot of example.com at 1440x900) in both APIs.

### When to Choose {Competitor}
Be honest — build trust. 1-2 scenarios where the competitor might fit better.

### When to Choose ScreenshotAPI
3-4 scenarios where ScreenshotAPI wins (simplicity, pricing, specific features).

### Migration Section
Brief note on how easy it is to switch, link to full migration guide if one exists.

### CTA: "Try ScreenshotAPI free — 5 credits, no card required"
```

### Special: vs Self-Hosted Pages (Puppeteer / Playwright)

These are the highest-volume pages. Target developers considering building their own screenshot service.

**Key angles:**
- Infrastructure cost comparison (server, browser management, scaling, cold starts)
- Maintenance burden (Chromium updates, memory leaks, zombie processes)
- Time to first screenshot (5 min with API vs days self-hosted)
- Reliability at scale (queueing, retries, concurrent renders)
- Total cost of ownership calculator (dev time + infra vs credits)
- "When self-hosting makes sense" section for honesty

---

## 2. Alternative Pages

**URL pattern:** `/compare/{competitor}-alternatives`

These target searchers who've already decided to leave a competitor and want options.

### Pages to Create

| Page | Target Keywords |
|------|----------------|
| `/compare/urlbox-alternatives` | `urlbox alternatives`, `urlbox competitors` |
| `/compare/screenshotlayer-alternatives` | `screenshotlayer alternatives`, `screenshotlayer competitors` |
| `/compare/apiflash-alternatives` | `apiflash alternatives` |
| `/compare/browserless-alternatives` | `browserless alternatives`, `browserless competitors` |
| `/compare/screenshotmachine-alternatives` | `screenshotmachine alternatives` |
| `/compare/puppeteer-screenshot-alternatives` | `puppeteer screenshot service`, `hosted puppeteer alternatives` |
| `/compare/best-screenshot-api` | `best screenshot api`, `best website screenshot api` |
| `/compare/free-screenshot-api` | `free screenshot api`, `screenshot api free tier` |

### Page Template — Alternative Pages

```
## H1: Top {N} {Competitor} Alternatives in {current_year}

### Why People Switch from {Competitor}
2-3 common pain points sourced from reviews, forums, and own knowledge.

### Quick Comparison Table
All alternatives in a table with key differentiators.

### Ranked List of Alternatives
For each alternative (including ScreenshotAPI, listed 1st or 2nd):
- Overview paragraph
- Pros / Cons
- Pricing summary
- Best for: [use case]

### Our Recommendation
Transparent verdict. Position ScreenshotAPI as the best for simplicity + value.

### CTA
```

---

## 3. How-To Guides

**URL pattern:** `/blog/how-to-{slug}`

These capture developers actively searching for a solution. Each guide shows the "hard way" first (builds credibility) then the "easy way" with ScreenshotAPI.

### Language-Specific Screenshot Guides (Highest Priority)

| Page | Target Keywords |
|------|----------------|
| `how-to-take-screenshots-with-python` | `python screenshot website`, `take screenshot of website python` |
| `how-to-take-screenshots-with-javascript` | `javascript screenshot website`, `node screenshot webpage` |
| `how-to-take-screenshots-with-go` | `golang screenshot website`, `go take webpage screenshot` |
| `how-to-take-screenshots-with-ruby` | `ruby screenshot website`, `rails screenshot webpage` |
| `how-to-take-screenshots-with-php` | `php screenshot website`, `php capture webpage` |
| `how-to-take-screenshots-with-curl` | `curl screenshot api`, `screenshot api curl example` |
| `how-to-take-screenshots-with-csharp` | `c# screenshot website`, `.net capture webpage` |
| `how-to-take-screenshots-with-java` | `java screenshot website`, `java capture webpage` |
| `how-to-take-screenshots-with-rust` | `rust screenshot website` |

### Task-Specific How-To Guides

| Page | Target Keywords |
|------|----------------|
| `how-to-generate-og-images-from-url` | `generate og image from url`, `dynamic og image api` |
| `how-to-take-full-page-screenshots` | `full page screenshot api`, `capture entire webpage` |
| `how-to-capture-dark-mode-screenshots` | `dark mode screenshot api`, `capture website dark mode` |
| `how-to-build-link-previews` | `generate link preview image`, `url preview thumbnail api` |
| `how-to-automate-website-screenshots` | `automate website screenshots`, `scheduled screenshot api` |
| `how-to-capture-screenshots-behind-login` | `screenshot authenticated page`, `capture login-protected page` |
| `how-to-take-mobile-screenshots-of-websites` | `mobile screenshot api`, `responsive screenshot capture` |
| `how-to-convert-html-to-image` | `html to image api`, `convert html to png` |
| `how-to-convert-url-to-pdf` | `url to pdf api`, `website to pdf api` |
| `how-to-capture-specific-element-screenshot` | `screenshot specific element`, `css selector screenshot` |
| `how-to-screenshot-single-page-applications` | `screenshot spa`, `screenshot react app` |
| `how-to-take-retina-screenshots` | `retina screenshot api`, `2x screenshot capture` |
| `how-to-add-website-thumbnails-to-your-app` | `website thumbnail generator`, `url thumbnail api` |
| `how-to-build-a-visual-regression-testing-pipeline` | `visual regression testing api`, `screenshot diffing` |
| `how-to-monitor-website-changes-with-screenshots` | `website change detection screenshots`, `visual monitoring` |
| `how-to-screenshot-websites-at-scale` | `bulk screenshot api`, `screenshot api high volume` |

### Page Template — How-To Guides

```
## H1: How to {Task} ({current_year} Guide)

### Introduction
What problem this solves, who needs it, what they'll learn.

### The Manual Approach
Show Puppeteer/Playwright code. Highlight the complexity:
- Dependencies
- Browser management
- Error handling
- Scaling issues

### The API Approach (with ScreenshotAPI)
Show equivalent with ScreenshotAPI:
- 3-5 lines of code
- No infrastructure
- Handles edge cases automatically

### Code Examples
Full working examples in 2-3 languages with the ScreenshotAPI SDK.

### Advanced Options
Show relevant parameters (fullPage, colorScheme, waitUntil, etc.)

### FAQ (for rich snippets)
3-5 questions people also ask.

### CTA
```

---

## 4. Use Case Pages

**URL pattern:** `/use-cases/{slug}`

Dedicated landing pages for each major use case. These target product managers, CTOs, and senior devs evaluating tools for a specific job.

### Pages to Create

| Page | Target Keywords | Audience |
|------|----------------|----------|
| `/use-cases/og-image-generation` | `og image generation api`, `dynamic social card api` | Frontend devs, marketing |
| `/use-cases/link-previews` | `link preview generator`, `url thumbnail service` | SaaS builders |
| `/use-cases/visual-regression-testing` | `visual regression testing tool`, `screenshot testing api` | QA engineers |
| `/use-cases/website-monitoring` | `website screenshot monitoring`, `visual monitoring tool` | DevOps, SRE |
| `/use-cases/directory-thumbnails` | `website thumbnail for directory`, `listing site screenshots` | Directory/marketplace builders |
| `/use-cases/pdf-generation` | `url to pdf api`, `website pdf generation` | Document workflows |
| `/use-cases/social-media-automation` | `social media screenshot tool`, `automated social cards` | Marketing teams |
| `/use-cases/archiving` | `web archiving screenshots`, `website snapshot archive` | Compliance, legal |
| `/use-cases/competitor-monitoring` | `competitor website monitoring`, `track competitor changes` | Marketing, product |
| `/use-cases/reporting` | `automated report screenshots`, `dashboard screenshot api` | Analytics, BI |
| `/use-cases/seo-auditing` | `seo audit screenshots`, `serp screenshot tool` | SEO teams |
| `/use-cases/email-thumbnails` | `website thumbnail in email`, `email link preview image` | Email marketing |

### Page Template — Use Case Pages

```
## H1: {Use Case} with ScreenshotAPI

### The Problem
1-2 paragraphs on the pain this use case addresses.

### How ScreenshotAPI Solves It
Specific features mapped to the use case needs.

### Architecture Diagram
Simple diagram showing where ScreenshotAPI fits in their stack.

### Implementation Guide
Step-by-step with code. Optimized for the most common language for this audience.

### Real-World Example
Concrete scenario with sample request/response.

### Pricing Estimate
"A typical {use case} workflow uses ~X screenshots/month → ~$Y/month"

### CTA
```

---

## 5. Language/Framework Integration Pages

**URL pattern:** `/integrations/{slug}`

These target developers searching for screenshot solutions that work with their specific stack.

### Pages to Create

| Page | Target Keywords |
|------|----------------|
| `/integrations/nextjs` | `nextjs screenshot api`, `next.js og image generation` |
| `/integrations/react` | `react screenshot api`, `react website thumbnail` |
| `/integrations/vue` | `vue screenshot api` |
| `/integrations/django` | `django screenshot api`, `python django website capture` |
| `/integrations/flask` | `flask screenshot api` |
| `/integrations/rails` | `rails screenshot api`, `ruby on rails screenshot` |
| `/integrations/laravel` | `laravel screenshot api`, `php laravel screenshot` |
| `/integrations/express` | `express screenshot api`, `node express screenshot` |
| `/integrations/fastapi` | `fastapi screenshot api` |
| `/integrations/wordpress` | `wordpress screenshot api`, `wordpress website thumbnail plugin` |
| `/integrations/zapier` | `zapier screenshot automation` |
| `/integrations/n8n` | `n8n screenshot node` |
| `/integrations/vercel` | `vercel screenshot api`, `vercel og image` |
| `/integrations/cloudflare-workers` | `cloudflare workers screenshot` |
| `/integrations/aws-lambda` | `aws lambda screenshot api` |
| `/integrations/supabase-edge-functions` | `supabase screenshot`, `supabase edge function screenshot` |
| `/integrations/github-actions` | `github actions screenshot`, `ci screenshot automation` |

### Page Template — Integration Pages

```
## H1: Screenshot API for {Framework} — Quick Start Guide

### Installation
SDK install command, env var setup.

### Basic Example
Minimal working example in the framework's idiom.

### Framework-Specific Patterns
E.g., for Next.js: API route handler, server component usage, OG image route.
E.g., for Django: view function, celery task for async screenshots.

### Production Tips
Caching, error handling, webhook usage for the framework.

### Full Example Repository
Link to GitHub example repo.

### CTA
```

---

## 6. Best-Of / Listicle Pages

**URL pattern:** `/blog/best-{slug}`

These capture high-volume "best X" searches. Position ScreenshotAPI prominently but include real competitors for credibility.

### Pages to Create

| Page | Target Keywords |
|------|----------------|
| `best-screenshot-apis` | `best screenshot api`, `top website screenshot apis` |
| `best-free-screenshot-apis` | `free screenshot api`, `screenshot api free tier` |
| `best-og-image-generators` | `best og image generator`, `og image api` |
| `best-url-to-image-apis` | `url to image api`, `website to image converter api` |
| `best-website-thumbnail-generators` | `website thumbnail generator api` |
| `best-headless-browser-services` | `headless browser as a service`, `hosted headless browser` |
| `best-visual-regression-testing-tools` | `best visual regression testing tools` |
| `best-html-to-image-apis` | `html to image api`, `convert html to image` |
| `best-url-to-pdf-apis` | `url to pdf api`, `best website to pdf api` |

### Page Template — Listicle Pages

```
## H1: {N} Best {Category} in {current_year} (Compared)

### Quick Comparison Table
All tools with pricing, key features, rating.

### Methodology
How we evaluated (factors: API simplicity, speed, pricing, format support, etc.)

### Detailed Reviews
For each tool:
- Overview
- Key features
- Pricing
- Pros / Cons
- Best for: [use case]
- Code example

### Our Top Pick
Clear recommendation with reasoning.

### CTA
```

---

## 7. Pricing Comparison Pages

**URL pattern:** `/compare/pricing/{slug}`

Target searchers specifically comparing costs.

### Pages to Create

| Page | Target Keywords |
|------|----------------|
| `/compare/pricing/screenshot-api-pricing-comparison` | `screenshot api pricing`, `cheapest screenshot api` |
| `/compare/pricing/urlbox-pricing` | `urlbox pricing`, `urlbox cost` |
| `/compare/pricing/screenshotlayer-pricing` | `screenshotlayer pricing` |
| `/compare/pricing/browserless-pricing` | `browserless pricing`, `browserless cost` |
| `/compare/pricing/self-hosted-vs-api-cost` | `puppeteer hosting cost`, `screenshot api vs self hosted cost` |

### Page Template — Pricing Comparison

```
## H1: {Competitor} Pricing vs ScreenshotAPI — Which Is Cheaper?

### Pricing Models Compared
Subscription vs credits, included volumes, overage costs.

### Cost at Different Volumes
Table: 100, 1K, 10K, 50K, 100K screenshots/month.

### Hidden Costs
Overages, feature gating, support tiers.

### Total Cost of Ownership
Include dev time for self-hosted options.

### Calculator (Interactive)
"How many screenshots/month do you need?" → shows cost with each provider.

### Verdict

### CTA
```

---

## 8. Migration Guides

**URL pattern:** `/blog/migrate-from-{competitor}`

Target users actively switching.

### Pages to Create

| Page | Target Keywords |
|------|----------------|
| `migrate-from-urlbox` | `switch from urlbox`, `urlbox migration` |
| `migrate-from-screenshotlayer` | `screenshotlayer migration`, `switch from screenshotlayer` |
| `migrate-from-apiflash` | `apiflash migration` |
| `migrate-from-puppeteer` | `replace puppeteer with api`, `puppeteer to screenshot api` |
| `migrate-from-playwright` | `replace playwright screenshots`, `playwright to api` |
| `migrate-from-browserless` | `browserless migration` |

### Page Template — Migration Guides

```
## H1: Migrate from {Competitor} to ScreenshotAPI — Step by Step

### Parameter Mapping Table
{Competitor}'s parameters → ScreenshotAPI equivalents.

### Before/After Code Examples
Side-by-side in 2-3 languages.

### What Changes
API endpoint, auth mechanism, response format.

### What Stays the Same
Reassure: same concepts, similar parameters, easy switch.

### Migration Checklist
Step-by-step checklist with estimated time (usually < 30 min).

### CTA
```

---

## Site Architecture

### URL Structure

```
screenshotapi.to/
├── /compare/
│   ├── screenshotapi-vs-urlbox
│   ├── screenshotapi-vs-screenshotlayer
│   ├── screenshotapi-vs-puppeteer
│   ├── ...
│   ├── urlbox-alternatives
│   ├── screenshotlayer-alternatives
│   ├── best-screenshot-api
│   ├── free-screenshot-api
│   └── pricing/
│       ├── screenshot-api-pricing-comparison
│       └── ...
├── /use-cases/
│   ├── og-image-generation
│   ├── link-previews
│   ├── visual-regression-testing
│   └── ...
├── /integrations/
│   ├── nextjs
│   ├── django
│   ├── rails
│   └── ...
├── /blog/
│   ├── how-to-take-screenshots-with-python
│   ├── how-to-generate-og-images-from-url
│   ├── best-screenshot-apis
│   ├── migrate-from-urlbox
│   └── ...
├── /docs/ (existing)
├── /pricing/ (existing)
└── /sign-up/ (existing)
```

### Hub Pages

Create index pages that aggregate related content and pass link equity:

| Hub Page | Aggregates |
|----------|-----------|
| `/compare` | All vs pages, alternative pages, pricing comparisons |
| `/use-cases` | All use case pages |
| `/integrations` | All integration pages |
| `/blog` | All how-to, best-of, and migration guides |

---

## Page Templates

### Shared Elements (Every BoFu Page)

1. **Breadcrumbs** — structured data for Google
2. **Table of contents** — sticky sidebar, improves time on page
3. **Last updated date** — signals freshness to Google
4. **Author byline** — E-E-A-T signal
5. **FAQ section** — target People Also Ask, use `FAQPage` schema
6. **CTA block** — appears after intro, mid-page, and at bottom:
   - Primary: "Start for free — 5 credits, no card required"
   - Secondary: "See pricing" or "Read the docs"
7. **Related pages** — 3-4 links to related content in the same pillar
8. **Live code playground embed** — link to `/dashboard/playground` for interactive demo

### Schema Markup

| Page Type | Schema |
|-----------|--------|
| vs / comparison | `Article` + `FAQPage` |
| How-to guides | `HowTo` + `FAQPage` |
| Listicles | `Article` + `ItemList` + `FAQPage` |
| Use cases | `Article` + `FAQPage` |
| Pricing comparison | `Article` + `FAQPage` |
| Integration pages | `TechArticle` + `FAQPage` |

---

## Internal Linking Strategy

### Link Hierarchy

```
Homepage
  ↓ links to
Compare Hub, Use Cases Hub, Integrations Hub, Blog Hub
  ↓ links to
Individual pages
  ↔ cross-link to related pages in other pillars
```

### Cross-Linking Rules

1. **Every vs page** links to:
   - The corresponding migration guide
   - The corresponding pricing comparison
   - The alternative page that mentions the same competitor
   - 2-3 relevant use case pages

2. **Every how-to guide** links to:
   - The SDK docs for the language used
   - The relevant use case page
   - The API reference for parameters used
   - 1-2 vs pages (e.g., "unlike Puppeteer, with an API you don't need to...")

3. **Every use case page** links to:
   - 2-3 how-to guides that demonstrate the use case
   - Integration pages for common stacks used in that domain
   - The pricing page with a volume estimate

4. **Every integration page** links to:
   - The SDK docs
   - 2-3 how-to guides using that framework
   - The relevant use case pages

5. **Contextual CTAs in docs** — existing doc pages should link to relevant SEO pages where natural (e.g., SDK docs link to integration guides and how-to articles).

### Anchor Text Strategy

- Use descriptive, keyword-rich anchor text (not "click here")
- Vary anchor text across pages to avoid over-optimization
- Example: "compare ScreenshotAPI vs Urlbox" not "click here to compare"

---

## Technical SEO

### Page Performance

- All SEO pages should be **statically generated** (Next.js `generateStaticParams` or static MDX)
- Target **< 1s LCP** on all pages
- Use `next/image` for any screenshots or diagrams
- Preload critical fonts

### Meta Tags

Every page needs unique, optimized:

```tsx
export const metadata: Metadata = {
  title: '{H1} | ScreenshotAPI',           // < 60 chars
  description: '{compelling description}',   // < 155 chars, includes CTA
  openGraph: {
    title: '{H1}',
    description: '{description}',
    type: 'article',
    images: ['/og/{slug}.png'],             // auto-generated OG images
  },
  alternates: {
    canonical: 'https://screenshotapi.to/{path}',
  },
}
```

### OG Images

Dogfood the product: use ScreenshotAPI to generate OG images for SEO pages. This is a great credibility signal.

### Sitemap

- Generate a comprehensive `sitemap.xml` that includes all SEO pages
- Submit to Google Search Console
- Group by content type (compare, use-cases, blog, integrations)

### Robots / Indexing

- All SEO pages should be indexable
- Add `noindex` to dashboard, auth, and API routes
- Ensure clean canonical URLs (no trailing slashes, no duplicate content)

---

## Execution Roadmap

### Phase 1 — Foundation (Weeks 1-2)

**Goal:** Ship infrastructure and highest-impact pages.

- [ ] Set up `/compare`, `/use-cases`, `/integrations`, `/blog` routes and layouts
- [ ] Build shared page components (CTA blocks, comparison tables, breadcrumbs, TOC)
- [ ] Implement schema markup helpers (FAQ, HowTo, Article)
- [ ] Set up OG image generation (dogfooding ScreenshotAPI)
- [ ] Ship sitemap generation for new routes
- [ ] Write and publish:
  - `/compare/screenshotapi-vs-puppeteer` (highest volume)
  - `/compare/screenshotapi-vs-playwright` (highest volume)
  - `/compare/screenshotapi-vs-urlbox` (top commercial competitor)
  - `/compare/best-screenshot-api`
  - `/blog/how-to-take-screenshots-with-python`
  - `/blog/how-to-take-screenshots-with-javascript`

### Phase 2 — Competitor Coverage (Weeks 3-4)

**Goal:** Cover all major competitor queries.

- [ ] Ship remaining vs pages:
  - vs Screenshotlayer, APIFlash, Browserless, ScrapingBee, ScreenshotMachine, Microlink
- [ ] Ship alternative pages:
  - Urlbox alternatives, Screenshotlayer alternatives, Browserless alternatives, Puppeteer alternatives
- [ ] Ship pricing comparison pages:
  - Main pricing comparison, self-hosted vs API cost analysis
- [ ] Ship migration guides:
  - From Puppeteer, Playwright, Urlbox, Screenshotlayer

### Phase 3 — Use Cases & How-Tos (Weeks 5-6)

**Goal:** Capture use-case and task-specific searches.

- [ ] Ship use case pages:
  - OG image generation, link previews, visual regression testing, website monitoring, directory thumbnails
- [ ] Ship how-to guides:
  - Full-page screenshots, dark mode captures, OG images from URL, HTML to image, mobile screenshots, screenshots at scale
- [ ] Ship remaining language how-to guides:
  - Go, Ruby, PHP, C#, Java

### Phase 4 — Integrations & Long Tail (Weeks 7-8)

**Goal:** Capture framework-specific and long-tail queries.

- [ ] Ship integration pages:
  - Next.js, React, Django, Rails, Laravel, Express, FastAPI, WordPress
- [ ] Ship platform integration pages:
  - Vercel, AWS Lambda, Cloudflare Workers, GitHub Actions, Zapier, n8n
- [ ] Ship remaining listicles:
  - Best free screenshot APIs, best OG image generators, best HTML to image APIs
- [ ] Ship remaining use case pages:
  - PDF generation, archiving, competitor monitoring, reporting, email thumbnails

### Phase 5 — Optimize & Expand (Ongoing)

**Goal:** Iterate based on data.

- [ ] Monitor Search Console for queries we rank for — create new pages for gaps
- [ ] Update all pages quarterly for freshness signals
- [ ] A/B test CTA placements and copy
- [ ] Build interactive pricing calculator
- [ ] Expand to mid-funnel content (tutorials, thought leadership) that links down to BoFu pages
- [ ] Target featured snippets by optimizing FAQ sections and comparison tables
- [ ] Add video content (Loom/YouTube embeds) to how-to guides for dwell time

---

## KPIs & Measurement

### Primary Metrics

| Metric | Target (6 months) | Tool |
|--------|-------------------|------|
| Organic signups/month | 50+ | Supabase + PostHog |
| BoFu pages indexed | 80+ | Google Search Console |
| Avg position for target keywords | Top 10 | Google Search Console |
| Organic traffic to BoFu pages | 5,000+ sessions/month | PostHog / Plausible |

### Secondary Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Pages with featured snippets | 10+ | Search Console / Ahrefs |
| Avg time on page (BoFu) | > 3 min | PostHog / Plausible |
| CTA click-through rate | > 5% | PostHog |
| Page-to-signup conversion | > 2% | PostHog funnel |
| Backlinks to BoFu pages | 50+ | Ahrefs / Search Console |
| Internal links per page | 5+ | Screaming Frog audit |

### Tracking Setup

- Add `?ref=seo-{slug}` or UTM params to all CTAs on SEO pages
- Set up PostHog funnel: SEO page → sign-up → first screenshot
- Weekly Search Console review for new keyword opportunities
- Monthly content audit: update stale pages, add new competitors

---

## Content Guidelines

### Voice & Tone

- **Developer-first:** Write for engineers. Lead with code, not marketing fluff.
- **Honest:** Acknowledge competitor strengths. Readers trust balanced comparisons.
- **Concise:** Developers skim. Use tables, bullet points, and code blocks.
- **Actionable:** Every section should help the reader do something or decide something.

### Quality Bar

- Every page must have **working code examples** (tested against the live API)
- Comparison data must be **accurate and up-to-date** (verify competitor pricing/features quarterly)
- No filler content — if a section doesn't add value, cut it
- Every page must load in **< 2 seconds** on mobile

### Content Freshness

- Add `lastUpdated` frontmatter to every page
- Display "Last updated: {date}" on the page
- Set calendar reminders to review competitor pages quarterly
- Update pricing data whenever competitors change their pricing
