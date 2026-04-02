# Screenshot Engine Feature Audit Findings

## Scope

This document records a feature-by-feature implementation-quality audit of the screenshot engine.

The focus is the domain-specific engine behavior in:

- `apps/server/src/services/screenshot.ts`
- `apps/server/src/routes/screenshot.ts`
- `apps/server/src/services/cache.ts`
- related tests and docs

This is not a broad product or billing audit.

The findings below were synthesized from one narrowly scoped subagent review per screenshot-engine feature.

---

## Executive Summary

The screenshot engine is **functional and reasonably well-factored**, but most features are implemented as **thin wrappers around basic Puppeteer primitives plus light heuristics**, not as especially robust or best-in-class systems.

The strongest parts are:

- base viewport/render pipeline
- color scheme emulation
- timezone override
- simple CSS injection

The weakest parts are:

- stealth mode
- cookie banner removal
- ad blocking
- locale emulation
- JS injection observability

The biggest recurring pattern is:

- many features **exist and work on the happy path**
- but they are **lightweight implementations**
- with **weak validation**
- **shallow outcome-based tests**
- and **overstated product expectations** in a few places

The engine is currently best described as:

- **good MVP quality**
- **acceptable for many straightforward use cases**
- **not yet engineered to a high-confidence, high-robustness standard** across real-world websites

---

## Normalized Conclusions

### Overall Assessment

- The engine is strongest when it simply delegates to a well-supported Chromium capability.
- The engine is weakest where it tries to infer or clean up page state with brittle heuristics.
- Many tests prove that code paths run, but not that the feature produces the intended visual outcome.
- Several features are under-validated at the HTTP boundary, so bad inputs turn into runtime failures instead of clear client errors.

### Most Important Cross-Cutting Weaknesses

1. **Validation is too thin**  
   Many options are cast from strings without strong boundary checks: `waitUntil`, `colorScheme`, `timezone`, `locale`, `devicePixelRatio`, dimensions, and more.

2. **Tests are too wiring-focused**  
   Many tests confirm that Puppeteer methods were called, but not that the screenshot result is visually or behaviorally correct.

3. **Heuristic cleanup features are shallow**  
   Cookie banner removal, popup removal, and ad blocking are all lightweight first-pass heuristics, not robust systems.

4. **Some docs overstate implementation quality**  
   A few features are documented as more powerful or complete than the code really is.

5. **Observability is weak**  
   Several features swallow errors or lack enough telemetry to know whether they are succeeding meaningfully in production.

---

## Feature Ratings

| Feature | Rating | Summary |
|---|---:|---|
| URL capture / navigation | 6.5/10 | Good core path, weak validation and SSRF hardening |
| Raw HTML rendering | 6.5/10 | Useful and clean, but under-validated and under-hardened |
| Custom viewport sizing | 6.5/10 | Correct primitive, weak input enforcement |
| Full-page capture | 6/10 | Works via Puppeteer flag, but not deeply engineered |
| Output formats and quality | 6.5/10 | Solid basics, thin validation and limited PDF depth |
| `waitUntil` | 6.5/10 | Reasonable primitive, but still just Puppeteer semantics |
| `waitForSelector` | 6/10 | Helpful, but not true readiness semantics |
| `delay` | 6/10 | Useful fallback, inherently naive |
| Font readiness / `preloadFonts` | 6/10 | Good baseline, docs overclaim, weak proof of correctness |
| Cookie banner removal | 5/10 | Best-effort heuristic, brittle across real CMP diversity |
| Popup removal | 5.5/10 | Useful for obvious overlays, high false-positive risk |
| Element removal | 6.5/10 | Practical power tool, but weak validation and observability |
| Ad blocking | 5/10 | Minimal heuristic blocklist, high over/underblocking risk |
| CSS injection | 6.5/10 | Strong simple primitive, lacks limits and clearer contract |
| JS injection | 5/10 | Powerful but weakly observable and silently lossy |
| Stealth mode | 4/10 | Covers only naive bot checks, mostly shallow anti-detection |
| Color scheme emulation | 7/10 | One of the cleanest, most correct features in the engine |
| Device pixel ratio / HiDPI | 7/10 | Correct mechanism, weak validation and output verification |
| Timezone emulation | 6.5/10 | Proper primitive, thin validation and behavior proof |
| Locale emulation | 5/10 | Really just `Accept-Language`, not true browser locale emulation |
| Geolocation override | 6.5/10 | Correct primitive, misleading expectations and weak validation |
| Device mockups | 6/10 | Nice MVP, but composition correctness has real flaws |
| Response caching | 6/10 | Functional MVP, but weak keying/storage/semantics |

---

## Detailed Findings

### URL capture / navigation

Current implementation quality is acceptable but not robust. The engine uses the correct Puppeteer navigation primitives, but invalid `waitUntil` values and weak URL-policy safeguards mean bad inputs or dangerous targets fall through too far into runtime behavior. This is a good baseline implementation, not a hardened screenshot navigation system.

### Raw HTML rendering

The HTML rendering path is clean and sensibly reuses the main pipeline, but it lacks stricter validation and a stronger story for base URLs, relative assets, caching parity, and untrusted HTML hardening. It is useful, but not deeply productized.

### Custom viewport sizing

The viewport implementation uses the right browser primitive and is technically straightforward. The main weakness is not the rendering strategy but the lack of enforced constraints and clearer contract behavior at the API boundary.

### Full-page capture

This feature relies almost entirely on Puppeteer’s built-in `fullPage` flag. That is fine for an MVP, but it means the product is not really solving lazy-loading, long-page tiling, or tricky fixed-position behavior itself. The docs currently imply a stronger implementation than what exists.

### Output formats and quality

Raster format handling is mostly sound. JPEG/WebP quality handling is correct, PNG ignores quality correctly, and PDF is clearly separated. The weakness is in feature depth and contract validation, especially around PDF behavior and invalid format inputs.

### `waitUntil`

This is a respectable exposure of Puppeteer load semantics, but it is not an advanced readiness system. The engine mostly hands the problem back to the user by exposing Puppeteer’s built-in modes.

### `waitForSelector`

Useful, but only as a narrow existence gate. It does not mean “page is truly ready,” and it does not require visibility, stability, or finished rendering. Good utility, but easy to misuse.

### `delay`

This is a classic “escape hatch” implementation: simple, often useful, but fundamentally naive. It helps users paper over uncertain timing, but it is not a robust readiness solution.

### Font readiness / `preloadFonts`

Waiting on `document.fonts.ready` is a good baseline. The optional preload behavior is less impressive than the docs suggest, and the tests do not really prove that the intended fonts were rendered correctly.

### Cookie banner removal

This is exactly the kind of feature you were talking about. The current implementation is a shallow heuristic:

- broad CSS selectors
- one-pass click attempts
- hardcoded vendor IDs
- one fixed 500ms wait

It will work on some common banners, but it is not robust across iframe CMPs, shadow DOM, delayed injection, localization, or complex consent systems. This is a true best-effort helper, not a high-quality generalized solution.

### Popup removal

Similar story to cookie banners: useful in obvious cases, but driven by broad class-name heuristics and fixed/sticky/z-index guesses. This will generate both misses and false positives.

### Element removal

This is a good low-level capability because it gives customers direct control. Its biggest weaknesses are validation, timing order, and poor observability. As a power tool it is decent; as a polished feature it still needs refinement.

### Ad blocking

The implementation is very lightweight:

- request interception
- a small substring denylist

That makes it cheap, but also very weak compared with real blocker-quality approaches. It can overblock legitimate assets and still miss a large amount of real ad clutter.

### CSS injection

This is one of the stronger “simple primitives” in the engine. It is implemented in the obvious, correct way. The quality gap is mostly around limits, observability, and precise documentation of ordering.

### JS injection

This feature is powerful, but the implementation quality is dragged down by swallowed errors and weak debuggability. Right now, it is very hard to know whether injected JS truly ran successfully in production.

### Stealth mode

This is one of the weakest features in the engine. It only addresses a narrow set of simple automation checks:

- `navigator.webdriver`
- one Blink automation flag
- a fixed user-agent string

That is not close to strong anti-detection behavior on the modern web. The current implementation is only meaningfully helpful against basic sites with naive checks.

### Color scheme emulation

This is one of the best-implemented features in the engine because it cleanly maps to a real browser primitive and is applied at the right time. The remaining gaps are validation and stronger behavior-based tests.

### Device pixel ratio / HiDPI

Another relatively strong feature because it uses the correct mechanism. The gaps are around enforcement, performance guardrails, and end-to-end verification of actual bitmap output.

### Timezone emulation

Technically solid primitive, correctly applied before navigation. The feature would be much stronger with validation, better tests, and clearer documentation of what timezone emulation does not affect.

### Locale emulation

This is one of the more misleadingly named features. The implementation is basically just `Accept-Language` header injection. That is useful, but it is not true browser locale emulation.

### Geolocation override

The core browser primitive is used correctly, but the product expectations around location realism are larger than what the code actually does. This is browser geolocation override, not full regional emulation.

### Device mockups

Nice presentation feature, but the implementation has real correctness issues:

- fixed viewport assumptions
- wrong data URI MIME for non-PNG inner captures
- distortion/cropping risk on `fullPage`
- illustrative rather than high-fidelity frame design

It is a good marketing helper, not a highly polished output compositor.

### Response caching

Caching works as an MVP, but it is not especially strong architecturally:

- 32-bit rolling hash key
- Postgres blob storage
- GET-only behavior
- unwired cleanup
- semantics that need clearer product decisions

Useful, but not elegant or high-confidence at scale.

---

## Top 5 Weakest Features

1. `stealthMode`
2. `removeCookieBanners`
3. `blockAds`
4. `locale`
5. `jsInject`

These are the features where the current implementation is furthest from a strong or best-in-class standard.

---

## Top 5 Strongest Features

1. `colorScheme`
2. `devicePixelRatio`
3. `viewport sizing`
4. `timezone`
5. `cssInject`

These are the features where the current implementation most cleanly matches an appropriate browser primitive.

---

## Highest-Leverage Improvements

### 1. Add strong boundary validation for engine options

This would improve many features at once:

- dimensions
- `waitUntil`
- `colorScheme`
- `devicePixelRatio`
- `timezone`
- `locale`
- geolocation
- `mockupDevice`
- `type`

### 2. Build real behavioral test fixtures instead of mostly wiring tests

Especially for:

- cookie banners
- popups
- ad blocking
- full-page capture
- color scheme
- locale/timezone/geolocation
- mockups

### 3. Tighten docs so they describe the actual implementation, not the idealized outcome

Most important around:

- full-page capture
- font preloading
- locale emulation
- geolocation wording
- ad blocking
- stealth mode

### 4. Upgrade the heuristic cleanup layer

The cleanup trio is currently weak:

- `removeCookieBanners`
- `removePopups`
- `blockAds`

If screenshot quality is a differentiator, this is where the biggest product-quality gains are available.

### 5. Improve observability for non-deterministic features

Most needed for:

- `jsInject`
- caching
- font loading
- geolocation permission override
- cleanup feature effectiveness

---

## Recommended Remediation Order

### Tier 1: Fix the most misleading or weakest implementations

1. `stealthMode`
2. `removeCookieBanners`
3. `blockAds`
4. `locale`
5. `jsInject`

### Tier 2: Fix correctness and contract weaknesses

1. option validation across the engine
2. mockup correctness
3. caching architecture
4. full-page behavior and docs alignment

### Tier 3: Raise confidence with better tests

1. visual/behavioral fixture testing
2. scenario matrices for cleanup features
3. output-dimension and media-behavior assertions

---

## Best-In-Class Gap

The engine’s main gap versus a truly high-quality screenshot platform is not “missing primitives.” It is that too many features stop at the **first workable implementation** instead of being pushed to:

- stronger real-world robustness
- clearer behavioral guarantees
- tighter validation
- richer observability
- more honest and precise product claims

That is especially true for the features that try to **interpret or manipulate arbitrary websites** rather than simply configure the browser.

---

## Bottom Line

The screenshot engine is **meaningfully functional**, but most of its domain-specific features should currently be treated as:

- **best-effort helpers**
- not **high-confidence robust systems**

If the goal is to make the engine a strong differentiator, the biggest opportunity is not adding more features first. It is **deepening the implementation quality of the existing ones**, especially:

- cookie banner removal
- popup cleanup
- ad blocking
- stealth
- locale/regional realism
- testing and observability around visual correctness
