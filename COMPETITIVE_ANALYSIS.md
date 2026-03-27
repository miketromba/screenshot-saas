# PROMPT THAT GENERATED THIS
- I ran deep research in both claude and openai with this prompt:
```
Please do comprehensive research in order to discover each and every single software as a service platform that offers programmatic screenshot capturing services. So in other words, like any API platform where you send a request and you get back a screenshot of a given website or a PDF version of the website or something like that. An example of this is URL2PNG.com. There's URL2screenshot.com. There's so many. There's URLbox.com, siteshot.com. There's just a ton of them. So I want you to do comprehensive research and make sure you discover each and every single competitor in the market. Do not ever miss a single competitor. Make sure you find and discover every single one. And then once you've found each and every single one, I want you to branch out and extend your research such that you actually do comprehensive research into each and every one in terms of discovering every single feature that they offer. So and their entire pricing structure and I want you to basically visit every page of their website in order to be comprehensive in your analysis and fully, fully, fully understand each and every single feature and functionality that they offer on their service and exactly what every single thing costs. And exactly how their product behaves so we can have a comprehensive overview of the market and all of our competitors and everything. And then I also want you to include the copy that they have on their marketing website, like what their H1 is, any subheading on their hero section, stuff like that. So that we can do a positioning analysis as well on the entire landscape.
```
- Then I pasted openai's output into claude with this prompt:
```
So I also ran the same exact analysis within ChatGPT. I orchestrated their deep research feature as well. And so what I'm wondering is, I actually like the writing style of Claude better. So what I want you to do is take your report and the one from ChatGPT and basically merge them in a clean way. So if ChatGPT discovered any that you didn't, you should merge them into your report. If it has any additional information that you didn't include, merge it all in. And then at the end, just give me a very brief recap on what you added basically or what ChatGPT discovered that you didn't discover. And then obviously just give me the final report and then I will look into that. But let's make this as comprehensive as possible and exhaustive so that we don't miss anything. 

ChatGPT's Research Report:
[pasted]
```

# The Complete Competitive Landscape of Programmatic Screenshot APIs

**March 2026 — Merged Research Report**

---

The programmatic screenshot capture market contains **at least 75 active or recently-active commercial services**, ranging from venture-backed platforms processing billions of requests monthly to solo-developer side projects launched in 2025. The market breaks into five distinct categories: dedicated screenshot APIs (the core segment, ~35+ services), HTML-to-image/PDF converters (~8 services), headless browser platforms with screenshot endpoints (~8 services), web scrapers with screenshot features (~10+ services), and website monitoring tools that generate screenshots as a byproduct (~6 services). Pricing spans four orders of magnitude, from Cloudflare's ~$0.00025/screenshot to Stillio's $0.05/screenshot for its archival service. **Urlbox and ScreenshotOne dominate** the dedicated API segment on features and market presence, while ScrapFly and Browserless lead among broader platforms. The market is consolidating around Chromium-based rendering, AI-powered analysis, and MCP/agent integration as the newest frontier.

---

## SECTION 1: Dedicated Screenshot APIs — The Core Segment

This is the market's core — services whose primary product is turning URLs (or HTML) into images or PDFs via API.

---

### TIER 1: Market Leaders with Comprehensive Feature Sets

---

#### Urlbox (urlbox.com)

**Company Details:** Founded October 2012 in Leeds, UK by YC alum Chris Roebuck. Longest-running dedicated player in the market.

**Homepage H1:** "The Trusted Source for Website Screenshots"
**Subheading:** "flawless full page automated screenshots…"
**Key Positioning Claims:** Pixel-perfect quality honed over "10,000+ hours of refinements."

**Complete Feature Set:**
- Screenshot capture: full-page, viewport, element-level, area-based
- Output formats: **11 formats** — PNG, JPEG, WebP, AVIF, SVG, PDF, MP4, WEBM, Markdown, JSON, HTML extraction (widest format selection in the market)
- AI-powered screenshot analysis (bring your own OpenAI/Anthropic key for structured JSON output)
- Video/GIF capture with GPU-accelerated rendering
- Custom viewport sizes / device emulation
- Custom headers, cookies, authentication support
- JavaScript rendering / configurable wait conditions
- Retina/HiDPI support (2x)
- Lazy-load handling
- Custom CSS/JS injection
- Geolocation-based rendering
- Proxy support
- Webhooks / async processing
- S3/cloud storage integration (Google Cloud Storage)
- CDN delivery (Cloudflare CDN)
- Caching with configurable TTL
- Ad blocking, cookie banner blocking
- Dark mode capture
- HTML string rendering (not just URLs)
- Watermark support
- SOC2 Type II attestation
- Certified archiving
- On-premises deployment for enterprise
- SDKs: Node.js, PHP, Python, Ruby, Java, C#, Elixir, Golang, Rust, WordPress (10+)
- Bulk capture tool
- Synchronous binary via GET; POST returns JSON with screenshot URL(s) and optional hydrated HTML/markdown/metadata

**Pricing:**
- No free tier; 7-day trial
- Lo-Fi: $19/mo — 2,000 renders, 30 RPM
- Startup: $49/mo — 5,000 renders
- Growth: $149/mo — 20,000 renders
- Business: $498/mo — 99.95% SLA
- Enterprise: $3,000+/mo — dedicated clusters, unlimited RPM

**Rendering Engine:** Chromium
**Infrastructure:** DigitalOcean Kubernetes, Cloudflare CDN, Google Cloud Storage
**Authentication:** API key + secret
**Notable Customers:** BBC, Booking.com, NYTimes
**Integrations:** Zapier, RapidAPI

---

#### ScreenshotOne (screenshotone.com)

**Company Details:** Launched May 2022 by solo founder Dmytro Krasun. 800+ paying customers.

**Homepage H1:** "The screenshot API for developers"
**Subheading:** "Render screenshots… instead of managing browser clusters…"
**Key Positioning Claims:** Cookie banner blocking with 50,000+ continuously updated rules.

**Complete Feature Set:**
- Screenshot capture: full-page, viewport, element, area
- PDF generation
- Scrolling video capture (MP4/GIF with GPU rendering)
- Cookie banner blocking (50,000+ rule database)
- Ad blocking
- Dark mode capture
- HTML/Markdown rendering (not just URLs)
- Geolocation-based rendering
- Proxy support
- Stealth mode (anti-bot bypass)
- Async webhooks
- S3-compatible storage integration
- Cloudflare CDN caching
- Signed request URLs
- Font detection API (unique feature)
- OpenAI Vision integration
- Pay only for successful requests
- Output: PNG, JPEG, WebP, PDF
- SDKs: Java, Go, Node.js, PHP, Python, Ruby, C# (7 official)

**Pricing:**
- Free: 100 screenshots/month
- Starter: $17/mo — 2,000 screenshots, 40 RPM
- Growth: $79/mo — 10,000 screenshots, 80 RPM
- Business: $259/mo — 50,000 screenshots, 150 RPM
- Overages available on all paid plans

**Rendering Engine:** Chromium (Google Chrome)
**Infrastructure:** Google Cloud Platform + bare-metal GPU servers + Cloudflare Workers API gateway
**Authentication:** API key (access_key parameter)
**Notable Customers:** Displayed on homepage (800+ logos)
**Integrations:** Product Hunt featured, GitHub

---

#### ScreenshotAPI.net (screenshotapi.net)

**Company Details:** Founded 2019 by Dirk Hoekstra; later acquired by XO Capital. Most impressive customer logo wall in the segment.

**Homepage H1:** "Programmatically Screenshot Entire Webpage"
**Subheading:** Emphasizes "real Chrome" rendering and 50+ features.

**Complete Feature Set:**
- Screenshot capture: full-page, viewport, element
- PDF generation
- Scrolling video capture (MP4/GIF/WebM)
- Native cron-based scheduling (unique — recurring screenshots without external tools)
- Bulk CSV capture
- Geolocation-based rendering
- Proxy support
- Custom CSS/JS injection
- Ad blocking, cookie banner blocking, chat widget blocking
- Custom headers, cookies, user-agent
- Configurable delays and wait conditions
- Output: PNG, JPEG, WebP, PDF
- RapidAPI marketplace listing

**Pricing:**
- Free trial: 100 screenshots / 7 days
- Essentials: $9/mo — 3,000 screenshots
- Startup: $29/mo — 10,000 screenshots
- Business: $175/mo — 100,000 screenshots ($0.00175 each — best per-unit economics at high volume among major players)

**Rendering Engine:** Chromium (Google Chrome)
**Infrastructure:** Google Cloud with Laravel backend
**Authentication:** API token
**Notable Customers:** Zomato, Vercel, Netflix, Samsung, Amazon, LinkedIn, Huawei, Supabase, Wix, MongoDB

---

### TIER 2: Established Players with Solid Market Positions

---

#### ApiFlash (apiflash.com)

**Company Details:** Founded 2017 in Montpellier, France by Timothée Jeannin. Serves 13,000+ businesses. Architectural differentiator: fresh Chrome instance created and destroyed per screenshot on AWS Lambda for strong isolation.

**Homepage H1:** "Screenshot API based on Google Chrome and AWS Lambda."

**Complete Feature Set:**
- Full-page/viewport/element capture
- S3 integration
- CDN-hosted responses
- IP geolocation
- Proxy support (BYO or BrightData)
- CSS/JS injection
- Caching with custom TTL
- Responsive screenshots
- Custom viewport sizes
- No PDF generation (notable absence)
- No video capture (notable absence)
- Rate limits: leaky-bucket algorithm — 20 req/sec with 400-request bursts

**Pricing:**
- Free: 100 screenshots/month
- Tier 1: ~$7/mo (100 screenshots)
- Tier 2: ~$16/mo (1,000 screenshots)
- Tier 3: ~$49/mo (10,000 screenshots)

**Rendering Engine:** Google Chrome on AWS Lambda
**Infrastructure:** AWS Lambda, S3, CloudFront CDN
**Authentication:** API access key
**Integrations:** GitHub Marketplace, Zapier, Make

---

#### Browshot (browshot.com)

**Company Details:** Operational since 2011, Campbell, California. Differentiated by using **real desktop and mobile browsers** (not emulated). Acquired Thumbalizr (2017) and Blitapp (2023). Currently developing Browshot 2.0/ScreenshotCenter.

**Homepage H1:** "Easy & Reliable Screenshot API for Developers."

**Complete Feature Set:**
- 30+ virtual browsers: iPhone, iPad, Android, BlackBerry, various desktop configs
- Rich browser automation: type, click, sleep, navigate
- S3 upload
- Webhooks
- Dark mode
- Popup hiding
- Geo-located servers in 4 countries
- URL content classification
- Website login support (automated form fill)
- Batch processing
- SDKs: Perl, PHP, Python, Ruby, C#, Node.js

**Pricing (credit-based, pay-as-you-go):**
- Credits: $0.0033–$0.10 each depending on volume
- 1 credit per desktop screenshot, 2 per mobile
- No monthly subscription required

**Rendering Engine:** Real desktop/mobile browsers (unique), not just Chromium
**Infrastructure:** Multi-region with servers in 4 countries
**Authentication:** API key

---

#### Screenshot Machine (screenshotmachine.com)

**Company Details:** Operated by Devtica s.r.o. (Slovakia) since 2012. Highest published uptime SLA in the dedicated API segment: 99.99%.

**Homepage H1:** "Powerful and reliable website screenshot API"
**Secondary positioning:** "Free and reliable screenshot api for website capture" / "Charge only for new, fresh screenshots"

**Complete Feature Set:**
- Full-page capture
- PDF generation (separate API endpoint)
- Device emulation
- Custom error images
- 14-day screenshot caching (charges only for fresh/new screenshots)
- Custom viewport sizes
- Delay/wait configuration

**Pricing (EUR):**
- Free: 100/month
- Starter: €9/mo — 2,500 screenshots
- Professional: €59/mo — 20,000 screenshots
- Business: €99/mo — 50,000 screenshots
- Overage: unique rounding-down system where 999 or fewer extra screenshots are free

**Rendering Engine:** Chromium
**Notable Customers:** 3M, Deloitte, BlackRock, Amgen

---

#### GrabzIt (grabz.it)

**Company Details:** Multi-tool platform combining screenshots, web scraping, website monitoring, and HTML conversion.

**Complete Feature Set:**
- Widest output format range among mid-tier players: images (JPG, PNG, SVG, BMP, TIFF, WebP), PDF, DOCX, video/GIF, CSV, Excel, JSON, XML
- Custom watermarks
- Encrypted captures
- Callback-based async model
- SDKs: ASP.NET, Java, JavaScript, Node.js, PHP, Perl, Python, Ruby (8 languages)

**Pricing:**
- Starting from ~$5.69/month
- Subscriptions offer up to 37% savings

---

#### Restpack (restpack.io)

**Company Details:** Offers three distinct API products: Screenshot API, HTML to PDF API, Browser Mockup API.

**Homepage H1:** "Capture screenshot of any webpage with one API call."
**Key Differentiator:** GDPR compliance with dedicated compliance page and Data Processing Agreement.

**Complete Feature Set:**
- Screenshot capture (full-page, viewport)
- Element capture (Startup+ tier only)
- Retina screenshots (Business+ tier only)
- PDF generation (separate API)
- Geolocation/batch (Enterprise only)
- Lazy-load handling
- CSS/JS injection
- Delay configuration
- Non-profit discounts: 25–50%

**Pricing:**
- No free tier (trial available)
- Basic: $9.95/mo — 1,000 screenshots
- Startup: $39.95/mo — 5,000 screenshots
- Business: $99.95/mo — 20,000 screenshots
- Enterprise: $499.95/mo — 300,000 screenshots

---

#### Microlink (microlink.io)

**Company Details:** Built by Kiko Beats. 10K+ GitHub stars. Positions as "Browser as API" — goes beyond screenshots.

**Homepage H1:** "Extract structured data from any website." (broader than just screenshots)

**Complete Feature Set:**
- Screenshot generation (full-page, viewport, element)
- PDF generation
- Metadata extraction (title, description, images, author, date, etc.)
- Markdown extraction (valuable for LLM/AI workflows)
- Lighthouse performance insights
- Built-in adblock (ads, trackers, cookie consent)
- Device emulation (iPhone 17 series, Samsung Galaxy S26, Pixel 10)
- 240+ CloudFlare CDN edge locations for sub-second cached responses

**Pricing:**
- Free: 50 requests/day, all features, no account required
- Pro: scalable pricing via online calculator

---

#### Screenshotlayer (screenshotlayer.com)

**Company Details:** Part of the apilayer marketplace family. "Queueless" architecture.

**Homepage H1:** "Capture highly customizable snapshots of any website."

**Complete Feature Set:**
- URL-to-screenshot
- Viewport/thumbnail sizing
- Custom CSS injection
- Delay configuration
- Export to FTP/S3
- Dedicated workers (higher tiers)

**Pricing:**
- Free: 100 snapshots/month
- Basic: 10,000 snapshots/month
- Professional: 30,000 snapshots/month
- Enterprise: 75,000 snapshots/month

---

#### URL2PNG (url2png.com)

**Company Details:** Founded 2010, operated by Champion Thinkers LLC in New Hampshire. One of the oldest services.

**Homepage H1:** "Screenshots as a Service"
**Key differentiator:** Deliberate simplicity. Hash-based authentication with APIKEY + TOKEN.

**Complete Feature Set:**
- Viewport-based screenshots
- Full-page capture
- Fastly CDN delivery
- 30-day caching
- Configurable viewport dimensions

**Pricing:**
- No free tier, no free trial
- Level 1: $29/mo — 5,000 screenshots
- Level 2: $99/mo — 25,000 screenshots
- Level 3: $199/mo — 100,000 screenshots
- Level 4: $299/mo — 250,000 screenshots

**Notable Customers:** Fastly, Heroku, AWS, DigitalOcean

---

### TIER 3: Newer Entrants and Disruptors

---

#### CaptureKit (capturekit.dev)

**Company Details:** Launched early 2025 by a solo founder. Combines screenshot capture with AI-powered content analysis.

**Homepage H1:** "Screenshot API to Scale Your Applications"
**Pricing page copy:** "Flexible plans" + "cancel anytime"

**Complete Feature Set:**
- Screenshot capture: full-page, viewport, element
- PDF generation
- AI-powered content analysis (summaries, categories, contact signals)
- Content/HTML extraction
- 17+ real device emulation presets
- S3 upload
- Stealth mode with fingerprint rotation
- Proxy support (HTTP/HTTPS/SOCKS5)
- Cookie banner blocking
- Caching
- Output: PNG, JPEG, WebP, PDF

**Pricing:**
- Free: 100 credits (one-time)
- Starter: $7/mo — 1,000 requests
- Growth: $29/mo — 10,000 requests
- Business: $89/mo — 50,000 requests

**Integrations:** Zapier, Make, n8n, Google Gemini, Mistral, Claude, OpenAI

---

#### SnapRender (snap-render.com)

**Company Details:** Launched late 2025/early 2026. First AI-agent-native screenshot API.

**Homepage H1:** "Screenshot any website with one API call"
**Subheading:** "Built for developers."

**Complete Feature Set:**
- Screenshot capture: full-page, viewport
- PDF generation
- Device emulation
- Ad blocking
- Dark mode
- R2-backed caching (up to 30-day TTL)
- MCP server for Claude Desktop/Code (unique)
- ChatGPT Actions integration
- LangChain, CrewAI, AutoGen integration
- All features available on every plan (no tier-gating)
- Official Node.js and Python SDKs (npm + PyPI)
- Output: PNG, JPEG, WebP, PDF

**Pricing:**
- Free: 500 screenshots/month (best permanent free tier among newer services)
- Starter: $9/mo — 2,000 screenshots
- Growth: $29/mo — 10,000 screenshots
- Business: $79/mo — 50,000 screenshots
- Enterprise: $199/mo — 200,000 screenshots

---

#### SCRNIFY (scrnify.com)

**Company Details:** Based in Germany. Currently in open beta (all services free). Only service offering pure pay-as-you-go with no subscriptions.

**Homepage H1:** "Capture high-quality screenshots with our powerful API"

**Complete Feature Set:**
- Screenshot capture: full-page, viewport
- Video capture: MP4, WebM, GIF (up to 60 seconds)
- Granular wait conditions: firstPaint, firstContentfulPaint, firstMeaningfulPaint, networkIdle, networkAlmostIdle
- Output: PNG, JPEG, WebP
- 5.3 million+ screenshots captured during beta

**Pricing (post-beta):**
- No subscription — pure pay-as-you-go
- €0.008 per screenshot
- €0.008 per video second

---

#### PeekShot (peekshot.com)

**Company Details:** Founded 2025 by Balwant Singh / 9Ethics in Jaipur, India. 500+ business customers.

**Homepage H1:** Positions as automation platform — "Other APIs assume you want to build everything yourself. PeekShot assumes you want screenshots to just work."

**Complete Feature Set:**
- Built-in scheduling (daily/weekly/monthly)
- Bulk CSV capture
- Change detection with notifications
- Hosted CDN URLs
- Webhook delivery
- Project-scoped API keys

**Pricing:**
- Available as AppSumo lifetime deal ($49–$118 one-time)

---

#### Screenshotbase (screenshotbase.com)

**Company Details:** Operated by EverAPI (company behind currencyapi.com, ipbase.com). European-developed with explicit GDPR compliance.

**Homepage H1:** "Free Screenshot API for Developers"
**Subheading:** "built-in compliance… reliability… dedicated support"

**Complete Feature Set:**
- Full-page/scrolling, element screenshots
- Cookie notification blocking
- Custom CSS/JS injection
- CAPTCHA bypass
- HMAC-signed webhooks
- Audit logs
- Team access with multiple API keys
- Managed service option
- Proxies
- SDKs: JavaScript, Python, PHP, Ruby, Go, C#

**Pricing:**
- Free: 300 screenshots/month
- Basic: $15/mo — 3,000 screenshots
- Premium: $59/mo — 20,000 screenshots
- Enterprise: $210/mo — 75,000 screenshots

---

#### Screendot (screendot.io)

**Company Details:** Launched 2022 by Advent Development. Lowest-cost option at scale.

**Homepage H1:** "The Developer Screenshot API"

**Complete Feature Set:**
- JPG, PNG, GIF, WebP output
- CDN delivery
- Custom viewports
- Full-page capture
- Configurable delay

**Pricing:**
- Free: 1,000 screenshots/month
- Paid: scales to ~$0.50 per 1,000 screenshots at high volume

---

#### ScreenshotEngine (screenshotengine.com)

**Company Details:** "Pay only for success" billing policy.

**Homepage H1:** "The fastest and cleanest screenshot API."

**Complete Feature Set:**
- Full JS hydration
- Cookie banner blocking
- Element screenshots
- Output: PNG, JPEG, PDF

**Pricing:**
- Free: 100 screenshots
- Starter: 3,000 screenshots
- Professional: 15,000 screenshots
- Engine: 60,000 screenshots

---

#### Screenshot Scout (screenshotscout.com)

**Company Details:** Developer-focused with emphasis on clean captures.

**Homepage H1:** "The screenshot API for developers"
**Subheading:** "Capture clean… screenshots…"

**Complete Feature Set:**
- Automatic removal of cookie banners, chat widgets, ads
- HMAC signed requests
- Caching
- Customization options

**Pricing:**
- Free: 200 screenshots/month
- Paid tiers available

---

#### ScreenshotBuddy (screenshotbuddy.io)

**Company Details:** Developer-oriented with screenshot + PDF creation.

**Pricing:**
- Free: 200 screenshots/month
- Essential: $9/mo — 2,000 screenshots
- Business: $29/mo — 10,000 screenshots
- Enterprise: $99/mo — 50,000 screenshots

---

#### ScreenshotAPI.com (screenshotapi.com)

**Company Details:** Metered billing model — pricing-led headline.

**Homepage H1:** "First 100 shots are free, then $0.001/shot"

**Complete Feature Set:**
- Cookie/ad element blocking
- CAPTCHA/anti-bot bypass
- Mobile view emulation
- Language controls

**Pricing:**
- Free: first 100 shots
- Then $0.001/shot
- Prepaid bundles at lower per-shot rates for higher volumes

---

#### ScreenshotAPI.io (screenshotapi.io)

**Company Details:** High-volume, low-cost positioning.

**Homepage H1:** "Capture high quality screenshots of any URL"
**Subheading:** "Designed for high volume…"

**Pricing:**
- Free: first 1,000 screenshots
- Then $0.0005 per screenshot (extremely competitive at volume)

---

#### Allscreenshots (allscreenshots.com)

**Homepage H1:** "Capture the web."
**Subheading:** "Pixel-perfect screenshots… One API call. Zero infrastructure."

**Complete Feature Set:**
- Clean captures
- Global regions
- High uptime
- All features included on paid plans

**Pricing:**
- Free: 100/month
- Paid tiers: Starter, Pro, Business, Enterprise with included quotas and per-extra pricing

---

#### GetScreenshot (getscreenshotapi.com)

**Homepage H1:** "Affordable and Powerful Screenshot API."
**Positioning:** No-code/low-code friendliness; Zapier/n8n integration.

---

#### Pikwy (pikwy.com)

**Company Details:** Single-person operation, founded 2020.

**Homepage H1:** "Capture a website screenshot online"

**Complete Feature Set:**
- Unusually comprehensive authentication: HTTP Basic auth, form-based login with XPath selectors, dedicated cookie parameters
- Proxy support including built-in proxies with country selection
- Export destinations: FTP/SFTP, S3, Azure Blob, Dropbox
- Output: PNG, JPEG, PDF

**Pricing:**
- Starting at $3/month (cheapest entry point for a dedicated API)
- Plans scale from $15/month

---

#### Page2Images (page2images.com)

**Homepage H1:** "Website Screenshot API / Generator / Tools."

**Complete Feature Set:**
- Custom CSS/header/cookie injection
- Init/onload JS execution
- Geolocation
- Proxy support
- "Bypass robot check" options (on higher tiers)

**Pricing:**
- Free: 100 credits
- Paid tiers with per-1,000 extras
- Advanced capabilities tier-gated

---

#### PurpleScreenshots (purplescreenshots.com)

**Homepage positioning:** "Automated website screenshot api…"

**Complete Feature Set:**
- Full-page and partial/section capture
- Documentation and try pages available
- Startup/Basic/Enterprise tiers

---

#### Abstract Website Screenshot API (abstractapi.com/api/screenshot-api)

**Homepage H1:** "Abstract's Website Screenshot API helps you take reliable… screenshots…"
**Subheading:** "Simple and transparent pricing."

**Complete Feature Set:**
- Custom CSS injection
- Capture delays
- Part of a 10+ API suite

**Pricing:**
- Free: 100 requests/month
- Standard: ~$99/mo (paid annually) — 60,000 requests/year
- Starting at $8/mo for suite access

---

#### WhoisXML API Screenshot Service (whoisxmlapi.com)

**Homepage H1:** "Instantly take a screenshot of any hosted web page"
**Subheading:** "500 free API requests."

**Complete Feature Set:**
- Chrome-engine rendering
- Output: JPG, PNG, PDF
- Positioned for security/domain intelligence use cases

**Pricing:**
- Credit-based (Domain Research Suite): 1 request = 1 DRS credit
- 500 free API requests

---

#### WebShrinker (webshrinker.com)

**Docs positioning:** "Developer Docs… classify, screenshot, and analyze websites…"

**Complete Feature Set:**
- Website Screenshot API (v2)
- Basic auth and pre-signed URL authentication
- Website classification and analysis

---

#### CloudBrowser (cloudbrowser.co)

**Homepage H1:** "HTML to Image API" and related product positioning.

**Complete Feature Set:**
- URL-to-image and HTML-to-image
- URL/HTML-to-PDF
- Region/exit node IP selection
- Auth covered in docs

**Pricing:**
- $19/mo — 15,000 renders
- Up to $499/mo — 500,000 renders
- Concurrency limits per tier

---

#### Add Screenshots (addscreenshots.com)

**Homepage positioning:** "Quick Start: Screenshot a URL in 60 Seconds" (developer onboarding copy)

**Complete Feature Set:**
- Single payload controls: viewport, waits, CSS/JS injection, delivery destinations

---

#### WebCaptureAPI (webcaptureapi.com)

**Homepage H1:** "Turn any URL into a screenshot in one API call."

**Complete Feature Set:**
- On-demand or scheduled screenshots
- Flexible viewport controls
- Simple GET API

---

#### WebSnapAPI (websnapapi.com)

**Homepage H1:** "Website Screenshot API for devs who ship fast."

**Complete Feature Set:**
- Token-based REST API
- Screenshot capture for previews, monitoring, audits

---

#### WebSnapz (websnapz.com)

**Homepage H1:** "Powerful Screenshot API for Developers."

**Pricing:**
- Free trial tier
- Basic: $28/mo — 5,000 screenshots/month

---

#### LinkPeek (linkpeek.com)

**Homepage H1:** "Website Screenshot Service"
**Subheading:** "Use the fastest screenshot API"

**Company Details:** Long-running provider.

---

#### VebAPI (vebapi.com)

**Homepage H1:** "VebAPI — Website Screenshot API … Perfect for SEO tools, QA, monitoring…"

**Complete Feature Set:**
- URL-to-screenshot with job response
- CDN URL and expiry fields in response

---

#### APIVerve Website Screenshot API (apiverve.com)

**Docs-led positioning:** "Website Screenshot API"

**Pricing:**
- Credit-based: 20 credits per call
- Plan pricing via credit packs

---

#### AWS Marketplace Website Screenshot API

**Marketplace listing H1:** "Capture Screenshots of any Webpage in Seconds"

**Complete Feature Set:**
- Returns link or base64
- Claims up to 100 req/s
- Integrated billing via AWS Marketplace

**Pricing:**
- $0.005 per request (pay-as-you-go via AWS)

---

#### Siteshot Pro (siteshot.pro)

**Homepage positioning:** "Siteshot Pro: Web screenshot API for developers that just works"

**Note:** Different service from site-shot.com.

---

#### ScreenshotsCloud (screenshots.cloud)

**Company Details:** Operated by Brushd LLC. Queueless, CDN-backed architecture.

**Homepage H1:** "Website Screenshot API"
**Subheading:** "automate… real browser screenshots…"

**Complete Feature Set:**
- Real-browser screenshots via CDN-backed "queueless" API
- JPEG, PNG, PDF output
- npm package available
- Documented API URL shape

**Pricing:**
- Free trial (no credit card required)
- Starting at ~$29/month

---

## SECTION 2: HTML-to-Image and PDF Conversion Services

---

#### HTML/CSS to Image (htmlcsstoimage.com / hcti.io)

**Company Details:** Founded 2018 in San Francisco by Code Happy LLC.

**Homepage H1:** "Automate your image generation"

**Complete Feature Set:**
- HTML/CSS-to-image rendering (primary use: dynamic images — social cards, certificates, invoices)
- URL screenshots also supported
- Template API with Handlebars {{variables}}
- Batch image creation
- MCP Server for AI tool integration
- Default resolution: @2X retina
- Performance: simple images ~300ms

**Pricing:**
- Free: 50 images/month
- Starter: $14/mo — 1,000 images
- Scales to $3,000/mo — 1,000,000 images
- Overages: $10 per 1,000 images

**Notable Customers:** Dev.to, Product Hunt, GitHub

---

#### Doppio (doppio.sh)

**Company Details:** France-based. PDF is primary product, screenshots secondary.

**Homepage H1:** "PDF or Screenshot for Modern Software"

**Complete Feature Set:**
- HTML-to-PDF (primary)
- HTML-to-PNG/screenshot (secondary)
- Puppeteer-style parameters (familiar to developers)
- HTML template system with editor for reusable documents with variable injection
- GDPR-compliant, EU-located servers

**Pricing:**
- Free: 400 documents/month
- Starter: $16/mo — 4,000 documents
- Scales to $129/mo — 36,000 + $0.0037/additional

---

#### PDFCrowd (pdfcrowd.com)

**Company Details:** Founded 2009, Czech Republic. Veteran HTML-to-PDF/image converter.

**Complete Feature Set:**
- 50+ configuration parameters for HTML-to-Image API
- Output: PNG, JPEG, GIF, WebP
- Input: URLs, HTML strings, ZIP archives
- Client libraries: 8 languages + WordPress plugin
- MCP PDF Export for AI tools

**Pricing:**
- Credit-based (1 credit = 0.5MB output)
- Starting from ~$11/month

**Integrations:** Zapier, Make, Postman, Bubble

---

#### Bannerbear (bannerbear.com)

**Company Details:** Primarily template-driven creative generation, but supports screenshot API endpoint.

**Homepage H1:** "Automate & Scale Your Marketing"

**Complete Feature Set:**
- "Create a screenshot via API" endpoint under /screenshots
- Async status polling/webhooks
- Template-driven creative image generation

---

## SECTION 3: Headless Browser Platforms with Screenshot Endpoints

---

#### Browserless (browserless.io)

**Company Details:** Founded 2015 by Joel Griffith. ~$1.3M revenue, 3,000 customers.

**Homepage H1:** "Browser Automation and Bypass Bot Detectors"
**REST APIs positioning:** "REST APIs provide HTTP endpoints for screenshots, PDFs…"

**Complete Feature Set:**
- `/screenshot`, `/pdf`, `/screencast` REST endpoints
- Full Puppeteer/Playwright/Selenium automation
- GPU-accelerated rendering (8x faster for animations)
- CAPTCHA solving (10 units per solve)
- Stealth mode
- Session persistence
- Live browser debugger
- Supports Chromium, WebKit, Firefox

**Pricing:**
- Free: 1,000 units/month
- Starter: $25/mo — 20,000 units
- Team: $140/mo — 180,000 units
- Business: $350/mo — 500,000 units
- Enterprise: SOC2, GDPR, HIPAA compliance, self-hosting options

---

#### Cloudflare Browser Rendering

**Company Details:** Headless Chrome on Cloudflare's global edge network. Cheapest option by an order of magnitude.

**Docs H1:** "/screenshot — Capture screenshot"

**Complete Feature Set:**
- REST `/screenshot` endpoint
- Workers Bindings for full Puppeteer/Playwright automation
- Supports Chromium via custom forks of Puppeteer and Playwright
- Free tier: 10 minutes of browser time per day

**Pricing:**
- ~$0.00025 per screenshot ($0.09/hour of browser time, ~3 seconds per screenshot)
- Requires Cloudflare Workers account

**Limitations:** No proxy rotation, no anti-bot bypass (Cloudflare identifies its own requests as bots)

---

#### BrowserCat (browsercat.com)

**Company Details:** Operated by Browser Labs LLC. Emphasizes zero vendor lock-in.

**Homepage H1:** "BrowserCat | Headless Browser API"

**Complete Feature Set:**
- Playwright, Puppeteer, CDP support
- Chromium, Firefox, WebKit
- Switching requires single line of code change

**Pricing:**
- Free: 1,000 credits/month
- Paid plans: ~$0.001/credit

---

#### BrowserCloud (browsercloud.io)

**Homepage positioning:** "Simple, transparent pricing"

**Complete Feature Set:**
- Cloud browser with screenshot and PDF generation
- HTTP API credit model
- Screenshot and PDF quotas enumerated per tier

**Pricing:**
- Free: 200 screenshots/month
- Subscription tiers by credits

---

## SECTION 4: Web Scraping Platforms with Screenshot Features

---

#### ScrapingBee (scrapingbee.com)

**Company Details:** Founded 2019. Acquired by Oxylabs in June 2025.

**Complete Feature Set:**
- Screenshots via `screenshot=True` parameter
- JS-rendered screenshot costs 5 credits (vs 1 for non-JS scraping)
- Full scraping parameter support (wait_for, proxies, etc.)

**Pricing:**
- $49/mo — 50,000 screenshots
- Up to $599/mo — 1.6M screenshots

**Notable Customers:** SAP, Zapier, Deloitte, Zillow

---

#### ScrapFly (scrapfly.io)

**Company Details:** 55,000+ developers, 15B+ monthly requests. Dedicated Screenshot API (not just a parameter).

**Homepage positioning:** "Scrapfly Web Data APIs for developers"

**Complete Feature Set:**
- Dedicated Screenshot API alongside Web Scraping and Extraction APIs
- Accessibility testing via vision deficiency simulation (deuteranopia, protanopia, tritanopia, achromatopsia) — unique WCAG/ADA compliance feature at no additional cost
- Native webhooks
- Server-side screenshot storage
- 130M+ proxies across 120+ countries
- Anti-bot bypass
- Screenshots cost 60 API credits each

**Pricing:**
- Plans from $30/mo to $500/mo

---

#### ScraperAPI (scraperapi.com)

**Complete Feature Set:**
- Screenshot feature via `screenshot=true` parameter
- Full-page requires render, costs additional credits

**Pricing:**
- Credit-based API (trial credits advertised)

---

#### Scrapingdog (scrapingdog.com)

**Complete Feature Set:**
- Dedicated `/screenshot` endpoint
- 5 credits per successful request

---

#### ZenRows (zenrows.com)

**Homepage positioning:** "Universal Scraper API" — scraping-first with screenshot as output option.

---

#### Crawlbase (crawlbase.com)

**Note:** Screenshot API is **no longer available for new sign-ups** (sunset notice). Parameters documented for existing customers only.

---

#### Apify Screenshot API Actor (apify.com)

**Marketplace H1:** "Screenshot API: Smart Capture with CAPTCHA Solver."

**Complete Feature Set:**
- HD screenshots with CAPTCHA handling
- Multi-device output
- PDF archive options
- Pay-as-you-go via Apify platform

---

#### Agenty (agenty.com)

**Complete Feature Set:**
- Screenshot endpoint (full-page/visible part)
- Device/proxy/viewport controls

---

#### Piloterr (piloterr.com)

**Complete Feature Set:**
- Screenshot API within broader scraping API library
- Credit-based plans with JS-rendering multipliers

---

## SECTION 5: Website Monitoring and Archival Tools

---

#### Stillio (stillio.com)

**Company Details:** Based in the Netherlands. Premier scheduled screenshot archival service — not an API, but a web platform.

**Homepage H1:** "Capture Website Screenshots and Archive Automatically"
**Subheading:** "Capture screenshots on autopilot…"

**Complete Feature Set:**
- Scheduled recurring captures (monthly to every 5 minutes on Top Shot plan)
- IP geolocation from 30+ countries
- Cloud sync: Google Drive, Dropbox, OneDrive
- Timestamp watermarks
- 36-month screenshot retention
- API for fetching URLs/screenshots (higher tiers)
- Concierge service add-on ($99/mo)

**Pricing:**
- Starter: $29/mo — 5 URLs
- Plus: $59/mo
- Premium: $99/mo
- Top Shot: $299/mo — unlimited URLs

**Notable Customers:** CNN, L'Oréal, The Washington Post, Sony, ESPN, Yahoo, Fox News, Abercrombie & Fitch, Pandora, Vistaprint

---

#### PageScreen (pagescreen.io)

**Company Details:** French service, founded 2017 by Onvey. Website change monitoring focus.

**Homepage H1:** "Pagescreen is an all-in-one platform to capture and archive and compare visual copies of web pages."

**Complete Feature Set:**
- Visual diff comparison
- Team collaboration
- Alert notifications
- REST API (Team tier+)
- Over-quota fee: €0.008 per capture

**Pricing:**
- Starter: €14.90/mo — 1,000 captures
- Team: €49.90/mo (API access starts here)
- Enterprise: €179.90/mo — 20,000 captures

**Notable Customers:** 4,000+ organizations including Ipsen, OVH, Leeds City Council

---

#### PagePixels (pagepixels.com)

**Company Details:** Most feature-rich automation platform in the monitoring category.

**Homepage H1:** "Automate Screenshots"
**Subheading:** "scheduling, change notifications, and delivery…"

**Complete Feature Set:**
- Multi-step browser automation (click links, fill forms, login)
- Built-in scheduling
- Change notifications
- AI image analysis
- Domain research
- Chrome extension (records and replays browser actions)
- Content scraping

**Pricing:**
- Free: 25 screenshots/month
- Starter: $16.99/mo — 3,000
- Up to $399.99/mo — 200,000

---

#### Blitapp (blitapp.com)

**Company Details:** Acquired by Browshot in 2023. Scheduled capture + delivery platform.

**Homepage H1:** "Thumbnails of all of your captures."

**Pricing:**
- From $5/mo — 100 monthly screenshots
- Higher tiers scale volume and integrations

---

#### GeoScreenshot (geoscreenshot.com)

**Company Details:** API in beta. Core value is capturing screenshots from many geographic locations.

**Homepage H1:** "GeoScreenshot API Beta"

---

## SECTION 6: Niche, Legacy, and Specialized Players

---

#### Site-Shot (site-shot.com)

**Homepage H1:** "Website Screenshot Online"
**Subheading:** "Capture a full page website screenshot in seconds…"

**Complete Feature Set:**
- Advanced geolocation: country, latitude/longitude, language, timezone parameters with auto-configured proxy IPs
- Full page capture up to 20,000px
- Available on APILayer marketplace

**Pricing:**
- Via APILayer: free plan available
- Standalone: $5/mo — 2,000 screenshots + $0.0025/additional
- Professional: $500/mo — 625,000 screenshots ($0.0008/additional)

---

#### Thum.io

**Homepage H1:** "Fast real-time website screenshot API"

**Complete Feature Set:**
- Streaming approach: delivers animated GIF while full screenshot renders (instant visual feedback)
- 2.69 billion screenshots served all-time
- Simple embed endpoints

**Pricing (cheapest per-unit in market):**
- Free: 1,000 impressions/month
- Good: $2/10,000 hits
- Better: $1/10,000 hits ($20/mo minimum)
- Effective cost: ~$0.0001–$0.0002/screenshot

---

#### PhantomJsCloud (phantomjscloud.com)

**Company Details:** Operational since 2015. Claimed 100% uptime.

**Homepage H1:** "PhantomJsCloud API Service — It just works!"

**Complete Feature Set:**
- Full Puppeteer-compatible browser automation
- Supports both Chrome and legacy PhantomJS backends
- Private Cloud option

**Pricing:**
- CPU time: $0.15/hour
- Data egress: $0.25/GB
- Average: ~$0.000095/page
- Free: 500 pages/day
- Private Cloud: $600/mo per geographic location

---

#### Thumbnail.ws

**Complete Feature Set:**
- Website thumbnail generation API
- Documentation and compare-plans page available

**Pricing:**
- Free: 1,000/month
- Premium: $49.50/mo — 2.5M requests

---

#### PagePeeker (pagepeeker.com)

**Company Details:** Founded 2009. Predefined thumbnail sizes (up to 480x360px).

**Homepage positioning:** Startup-friendly ("free until launch/implementation")

**Pricing:**
- Basic: $5.99/mo — 100K API calls
- Advanced: $39.99/mo — 1M API calls
- Premium: custom

---

#### Thumbalizr (thumbalizr.com)

**Company Details:** Acquired by Browshot in 2017. Still operational as standalone service.

**Homepage H1:** "Welcome to Thumbalizr!"
**Subheading:** "Take screenshot of any website."

**Pricing:**
- Premium from 8 euros/$9 per month

---

#### ShrinkTheWeb

**Company Details:** Founded 2009. Acquired Snapito in 2015. Currently showing "Relaunching Soon."

---

## SECTION 7: Comprehensive Pricing Comparison Table

| Service | Free Tier | Cheapest Paid | Effective Cost at 10K/mo | Effective Cost at 50K/mo |
|---------|-----------|---------------|--------------------------|--------------------------|
| Cloudflare BR | 10 min/day | $5/mo (Workers) | ~$2.50 | ~$12.50 |
| Thum.io | 1,000/mo | $1/mo minimum | ~$2 | ~$5 |
| ScreenshotAPI.io | 1,000 free | $0.0005/shot | ~$5 | ~$25 |
| PhantomJsCloud | 500/day | $10/mo | ~$10 | ~$50 |
| Screendot | 1,000/mo | ~$20/mo | ~$20 | ~$25 |
| ScreenshotAPI.com | 100 free | $0.001/shot | ~$10 | ~$50 |
| Site-Shot | 20/mo (APILayer) | $5/mo | ~$15 | ~$50 |
| ScreenshotAPI.net | 100 (trial) | $9/mo | $29 | ~$90 |
| ApiFlash | 100/mo | ~$7/mo | ~$49 | Contact |
| SCRNIFY | Beta (free) | €0.008/shot | ~€80 | ~€400 |
| ScreenshotOne | 100/mo | $17/mo | $79 | $259 |
| Urlbox | None (trial) | $19/mo | ~$98 | ~$149 |
| Screenshotlayer | 100/mo | $19.99/mo | ~$40 | ~$100 |
| Screenshot Machine | 100/mo | €9/mo | ~€30 | ~€65 |
| Restpack | None (trial) | $9.95/mo | $39.95 | $99.95 |
| CaptureKit | 100 (one-time) | $7/mo | $29 | $89 |
| SnapRender | 500/mo | $9/mo | $29 | $79 |
| ScreenshotBuddy | 200/mo | $9/mo | $29 | $99 |
| Screenshotbase | 300/mo | $15/mo | ~$59 | ~$210 |
| Stillio | 14-day trial | $29/mo | N/A (URL-based) | N/A |
| URL2PNG | None | $29/mo | ~$99 | ~$199 |

---

## SECTION 8: Market Trends and Strategic Analysis

### Trend 1: AI Integration Is the Newest Battleground
Urlbox and ScreenshotOne offer AI-powered screenshot analysis using OpenAI and Anthropic models. CaptureKit includes AI content extraction. PagePixels has AI image analysis. SnapRender and Cloudflare have launched MCP servers for AI agent integration. HTML/CSS to Image and PDFCrowd offer MCP servers for AI coding tools. Screenshots are becoming inputs for AI workflows rather than just visual outputs.

### Trend 2: Consolidation Is Underway
ScrapingBee was acquired by Oxylabs in June 2025. ScreenshotAPI.net has changed ownership multiple times. Browshot acquired Thumbalizr and Blitapp. ShrinkTheWeb acquired Snapito in 2015 but is now relaunching. Crawlbase has sunset its screenshot API for new sign-ups. Expect more M&A.

### Trend 3: The Rendering Engine War Is Over — Chromium Won
Nearly every service uses headless Chrome or Chromium. Rare exceptions: Screenshotlayer uses a proprietary engine, Browshot maintains real device browsers, PhantomJsCloud supports its legacy WebKit backend, and Thum.io uses Selenium.

### Trend 4: Pay-As-You-Go Is Challenging Subscriptions
SCRNIFY's pure pay-per-screenshot model, Browshot's credit system, PhantomJsCloud's CPU-time billing, Cloudflare's browser-hour pricing, ScreenshotAPI.com's $0.001/shot, and ScreenshotAPI.io's $0.0005/shot all offer alternatives to monthly subscriptions.

### Trend 5: The Market Is Bifurcating Between Simple and Complex
Simple services (Thum.io, Screendot, PagePeeker, Thumbnail.ws) compete on price and ease. Complex platforms (Urlbox, ScreenshotOne, PagePixels, ScrapFly) compete on features like AI analysis, automation, CAPTCHA solving, and compliance certifications. The middle ground is being squeezed.

### Trend 6: Positioning Convergence
Despite technical variation, headline messaging converges on a few angles: (1) "Don't run browsers" — contrast against self-managed Puppeteer/Chromium fleets, (2) Quality/accuracy — "pixel-perfect," "real Chrome," (3) Clean screenshots — cookie banners, ads, chat widget removal as the differentiator, (4) Scale/reliability/compliance — "queueless," "CDN-backed," SLAs, GDPR, and (5) Pricing-led — "cheapest per shot" as the hero message.

---

## SECTION 9: Complete Vendor Index (Alphabetical)

For quick reference, every service discovered across both research efforts:

1. Abstract Website Screenshot API (abstractapi.com)
2. Add Screenshots (addscreenshots.com)
3. Agenty (agenty.com)
4. Allscreenshots (allscreenshots.com)
5. ApiFlash (apiflash.com)
6. APIVerve (apiverve.com)
7. Apify Screenshot Actor (apify.com)
8. AWS Marketplace Screenshot API
9. Bannerbear (bannerbear.com)
10. Blitapp (blitapp.com)
11. BrowserCat (browsercat.com)
12. BrowserCloud (browsercloud.io)
13. Browserless (browserless.io)
14. Browshot (browshot.com)
15. CaptureKit (capturekit.dev)
16. Cloudflare Browser Rendering
17. CloudBrowser (cloudbrowser.co)
18. Crawlbase (crawlbase.com) — sunset for new users
19. Doppio (doppio.sh)
20. GeoScreenshot (geoscreenshot.com)
21. GetScreenshot (getscreenshotapi.com)
22. GrabzIt (grabz.it)
23. HTML/CSS to Image (htmlcsstoimage.com)
24. LinkPeek (linkpeek.com)
25. Microlink (microlink.io)
26. Page2Images (page2images.com)
27. PagePeeker (pagepeeker.com)
28. PagePixels (pagepixels.com)
29. PageScreen (pagescreen.io)
30. PDFCrowd (pdfcrowd.com)
31. PeekShot (peekshot.com)
32. PhantomJsCloud (phantomjscloud.com)
33. Pikwy (pikwy.com)
34. Piloterr (piloterr.com)
35. PurpleScreenshots (purplescreenshots.com)
36. Restpack (restpack.io)
37. ScrapFly (scrapfly.io)
38. ScraperAPI (scraperapi.com)
39. ScrapingBee (scrapingbee.com)
40. Scrapingdog (scrapingdog.com)
41. Screendot (screendot.io)
42. Screenshot Machine (screenshotmachine.com)
43. Screenshot Scout (screenshotscout.com)
44. ScreenshotAPI.com (screenshotapi.com)
45. ScreenshotAPI.io (screenshotapi.io)
46. ScreenshotAPI.net (screenshotapi.net)
47. ScreenshotBase (screenshotbase.com)
48. ScreenshotBuddy (screenshotbuddy.io)
49. ScreenshotEngine (screenshotengine.com)
50. ScreenshotOne (screenshotone.com)
51. Screenshotlayer (screenshotlayer.com)
52. ScreenshotsCloud (screenshots.cloud)
53. SCRNIFY (scrnify.com)
54. ShrinkTheWeb — relaunching
55. Site-Shot (site-shot.com)
56. Siteshot Pro (siteshot.pro)
57. SnapRender (snap-render.com)
58. Stillio (stillio.com)
59. Thum.io
60. Thumbalizr (thumbalizr.com)
61. Thumbnail.ws
62. URL2PNG (url2png.com)
63. URLtoScreenshot (urltoscreenshot.com)
64. VebAPI (vebapi.com)
65. WebCaptureAPI (webcaptureapi.com)
66. WebShrinker (webshrinker.com)
67. WebSnapAPI (websnapapi.com)
68. WebSnapz (websnapz.com)
69. WhoisXML API Screenshot (whoisxmlapi.com)
70. ZenRows (zenrows.com)