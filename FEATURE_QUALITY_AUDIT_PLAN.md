# Screenshot Engine Feature Quality Audit Plan

## Purpose

This document defines the process for auditing the **implementation quality of the screenshot engine itself**.

This is not a broad product audit.

The focus is the domain-specific feature set of the rendering engine:

- how each screenshot feature is implemented
- how robust and reliable that implementation is
- how well it handles real-world websites
- what classes of sites or behaviors it fails on
- whether the current solution is naive, acceptable, strong, or best-in-class
- what a higher-quality implementation would look like

If a feature exists mainly in the screenshot pipeline, this document covers it.

If a feature is primarily billing, auth, dashboard UX, docs, or marketing, it is out of scope unless it directly affects screenshot-engine behavior.

---

## What This Audit Is

This audit is about questions like:

- Is our cookie-banner removal strategy actually good?
- Is our popup removal logic robust or brittle?
- Are our wait strategies sufficient for modern JS-heavy apps?
- Is our ad blocking approach too simplistic?
- Is stealth mode meaningfully useful or mostly cosmetic?
- Is our full-page capture reliable on long and lazy-loaded pages?
- Is our caching design sound for screenshot rendering?

This audit is **not** mainly about:

- whether a route exists
- whether pricing copy matches implementation
- whether the dashboard has the right buttons
- whether billing is wired correctly

Those things matter, but they are not the core target of this document.

---

## Instructions For The Facilitator Agent

You are the orchestrator, not the implementation reviewer.

Your job is to preserve your context window by delegating each feature review to narrowly scoped subagents. You should coordinate the review sequence, enforce the evaluation standard, consolidate findings, and build the remediation backlog.

You should **not** personally do the deep analysis for every feature.

### Operating Rules

1. Read this file completely before starting.
2. Read `AGENTS.md`.
3. Use subagents for every substantial review task.
4. Keep each subagent focused on one feature or one tight feature family.
5. Run independent subagents in parallel whenever possible.
6. Do not assign the entire screenshot engine to a single subagent.
7. Require concrete evidence and implementation critique, not summaries.
8. Prefer `generalPurpose` subagents for deep feature audits.
9. Use `explore` subagents only when first mapping code paths or locating related files.
10. Use browser/runtime verification only when it materially helps evaluate implementation quality.
11. Do not edit code during the audit unless explicitly asked in a separate task.
12. Distinguish clearly between:
    - feature exists
    - feature works
    - feature is high quality
13. Make subagents compare the current implementation against stronger alternative designs when relevant.
14. Treat "good enough for a demo" and "production-grade implementation" as different ratings.

### What Every Subagent Must Return

Every delegated review must return:

- `Feature reviewed`
- `Problem this feature is trying to solve`
- `Current implementation strategy`
- `Strengths`
- `Weaknesses`
- `Failure modes and edge cases`
- `Comparison to stronger approaches`
- `Quality rating`
- `Evidence`
- `Recommended improvements`

### Quality Rating Scale

Use this exact scale:

- `1/5 - naive`
- `2/5 - weak`
- `3/5 - acceptable`
- `4/5 - strong`
- `5/5 - best in class`

Subagents must justify the rating.

### Evidence Standard

A feature is not considered audited until the reviewer has inspected all applicable layers:

- implementation details in code
- related tests
- real-world behavior assumptions
- edge-case handling
- failure handling
- performance implications
- abuse/security implications
- maintainability and extensibility

If runtime verification is used, it should support the implementation critique, not replace it.

---

## Core Audit Method

Every screenshot-engine feature should be reviewed in the same sequence:

1. Define the problem the feature is solving.
2. Identify the exact implementation strategy currently used.
3. Trace the code path end to end.
4. Identify the assumptions baked into the implementation.
5. Identify the classes of sites/pages/scenarios it is likely to handle well.
6. Identify the classes of sites/pages/scenarios it is likely to fail on.
7. Evaluate whether the chosen approach is simplistic, reasonable, or advanced.
8. Compare it against better-known or more robust implementation patterns.
9. Assess test coverage quality.
10. Produce a rating and concrete upgrade recommendations.

### Required Questions For Every Feature

Every reviewer must answer:

- What exact strategy did we choose?
- Why does this strategy work at all?
- Where is it brittle?
- What real-world scenarios will break it?
- What would a stronger implementation do differently?
- Are we missing observability that would tell us whether the feature is working in production?
- Do current tests prove quality, or do they only prove the happy path?
- If a competitor built this feature well, what would they probably add beyond our version?

---

## Evaluation Dimensions

Each feature review should score or comment on all of these dimensions:

- `Correctness`
- `Robustness`
- `Coverage breadth`
- `Real-world reliability`
- `Performance cost`
- `Abuse/security risk`
- `Maintainability`
- `Extensibility`
- `Test quality`
- `Observability`

If a dimension is not relevant, the reviewer should say so explicitly.

---

## Review Artifact Template

Every feature review should be written using this template:

### Feature reviewed

`[feature name]`

### Problem this feature is trying to solve

- What customer problem does it solve?
- What does "good" look like for this feature?

### Current implementation strategy

- Where is it implemented?
- What exact tactics does it use?
- What heuristics, selectors, or browser APIs does it rely on?

### Strengths

- What is good about the current approach?

### Weaknesses

- What is simplistic, brittle, incomplete, or risky?

### Failure modes and edge cases

- What scenarios will break it?
- What site patterns are poorly handled?
- What race conditions or timing issues exist?

### Comparison to stronger approaches

- What would a stronger implementation do?
- What would a best-in-class implementation likely add?

### Quality rating

- `X/5`
- Why this score?

### Evidence

- file paths
- functions
- tests
- runtime behavior if used

### Recommended improvements

- Immediate upgrades
- Structural upgrades
- Tests or observability needed

---

## Audit Phases

## Phase 0: Engine Mapping And Setup

### Objective

Create a precise map of the screenshot engine before auditing feature quality.

### Delegate

- one subagent for engine code map
- one subagent for feature inventory

### Tasks

1. Identify all screenshot-engine entry points.
2. Identify all core services, helpers, and related tests.
3. Build a feature inventory from code, not marketing copy.
4. Group features into implementation families.
5. Identify shared cross-cutting concerns:
   - browser lifecycle
   - page navigation
   - DOM manipulation
   - caching
   - post-processing
   - quota hooks only where they influence engine behavior

### Output

- screenshot engine map
- feature inventory
- audit grouping proposal

---

## Phase 1: Base Capture Pipeline Audit

### Objective

Evaluate the core rendering pipeline before layering on feature-specific behavior.

### Delegate

- one subagent for browser lifecycle and navigation
- one subagent for base capture and output formats
- one subagent for HTML rendering path

### Features To Audit

- browser launch strategy
- local vs hosted Chromium behavior
- browser/page lifecycle cleanup
- URL navigation
- raw HTML rendering
- viewport sizing
- full-page capture
- PNG output
- JPEG output
- WebP output
- PDF output
- quality handling

### Required Questions

- Is the base pipeline structurally sound?
- Are browser resources managed correctly?
- Does the system rely on fragile defaults?
- Does full-page capture handle long or lazy-loaded pages well?
- Is PDF handled as a first-class path or just a branch?
- Are format-specific tradeoffs handled well?

---

## Phase 2: Timing, Readiness, And Render Stability Audit

### Objective

Evaluate whether the engine knows when a page is actually ready to capture.

### Delegate

- one subagent for wait strategies
- one subagent for selector-based readiness and delay behavior
- one subagent for font/render completeness

### Features To Audit

- `waitUntil=load`
- `waitUntil=domcontentloaded`
- `waitUntil=networkidle0`
- `waitUntil=networkidle2`
- `waitForSelector`
- `delay`
- `document.fonts.ready`
- font preloading

### Required Questions

- Does this work on modern client-rendered apps?
- Which site types are likely to capture too early?
- Is delay a weak fallback or a reliable control?
- Are fonts handled in a robust way?
- What would a more resilient render-readiness system look like?

---

## Phase 3: Content Cleanup And DOM Intervention Audit

### Objective

Deeply evaluate all features that try to manipulate the page before capture.

### Delegate

Assign separate subagents for each feature whenever possible:

- cookie banner removal
- popup removal
- element removal
- ad blocking
- CSS injection
- JS injection

### Features To Audit

#### Cookie Banner Removal

- selector coverage
- CMP-specific handling
- click-vs-hide strategy
- delayed banners
- localized banners
- overlays and backdrops
- iframe cases
- shadow DOM cases
- persistence side effects

#### Popup Removal

- heuristic quality
- false positives
- z-index and fixed-position assumptions
- modals vs legitimate dialogs
- late-appearing popups

#### Element Removal

- reliability of selector-based removal
- safety of user-supplied selectors
- observability when removal fails

#### Ad Blocking

- request interception strategy
- blocklist quality
- overblocking risk
- underblocking risk
- third-party script side effects

#### CSS Injection

- timing
- flexibility
- escape hatches
- conflict with page layout

#### JS Injection

- timing
- safety
- debuggability
- usefulness vs unpredictability

### Required Questions

- Is the approach heuristic-only, or does it have feature-aware logic?
- How often will it work on real customer targets?
- What major classes of cookie banners/popups/ads will it miss?
- Is the implementation likely to create false positives?
- What would a stronger multi-stage implementation look like?

---

## Phase 4: Environment Emulation And Anti-Detection Audit

### Objective

Evaluate how well the engine simulates user context and avoids detection.

### Delegate

- one subagent for stealth mode
- one subagent for color scheme and locale/timezone
- one subagent for DPR and geolocation

### Features To Audit

- stealth mode
- user-agent override
- webdriver masking
- color scheme emulation
- device pixel ratio
- timezone emulation
- locale emulation
- geolocation override

### Required Questions

- Is this feature meaningful or mostly superficial?
- Which detection surfaces are still uncovered?
- How realistic is the emulation?
- Which websites will still detect automation?
- Is the implementation enough for the claim we are making?

---

## Phase 5: Output Enhancement And Post-Processing Audit

### Objective

Evaluate features that transform, wrap, or reuse the capture result after rendering.

### Delegate

- one subagent for device mockups
- one subagent for caching
- one subagent for output metadata/headers if relevant to engine behavior

### Features To Audit

- browser mockup
- iPhone mockup
- MacBook mockup
- cache key design
- cache TTL behavior
- cache reuse semantics
- cache storage design
- cache invalidation and cleanup

### Required Questions

- Are mockups high quality or just decorative wrappers?
- Do they preserve fidelity and sizing correctly?
- Is caching architecturally sound for screenshot rendering?
- Can caching produce incorrect or misleading outputs?
- What stronger caching architecture would exist?

---

## Phase 6: Cross-Cutting Engine Architecture Audit

### Objective

Evaluate the screenshot engine as a system, beyond any one feature.

### Delegate

- one subagent for security and abuse resistance
- one subagent for performance and resource usage
- one subagent for reliability and observability

### Areas To Audit

- SSRF exposure
- unsafe protocols and internal network access
- resource exhaustion risk
- unbounded inputs
- browser launch cost
- concurrency model
- timeout design
- failure reporting
- logging and metrics
- debuggability
- feature interaction complexity
- code organization

### Required Questions

- What are the engine’s biggest architectural weaknesses?
- What will fail first under real customer load?
- Which features interact badly with each other?
- Which parts are hard to extend safely?
- Where are we blind in production?

---

## Phase 7: Test Quality And Validation Audit

### Objective

Determine whether tests actually prove engine quality.

### Delegate

- one subagent for unit test quality
- one subagent for integration test quality
- one subagent for missing scenario coverage

### Areas To Audit

- unit tests for screenshot options
- integration tests for live rendering
- feature combination coverage
- adversarial input coverage
- real-world site pattern coverage
- regression test quality

### Required Questions

- Do tests prove the implementation is robust, or only that code paths exist?
- Which features have shallow tests?
- Which features need fixture sites or scenario matrices?
- Where do we need benchmark-style tests instead of simple assertions?

---

## Phase 8: Feature-By-Feature Synthesis

### Objective

Produce a final quality assessment for each screenshot-engine feature.

### Delegate

The facilitator should own the final synthesis, but may use one normalization subagent if needed.

### Final Consolidation Tasks

For each feature, produce:

- feature name
- current implementation summary
- quality rating
- biggest weaknesses
- best-in-class gap
- recommended next step

Then produce:

- top 5 weakest engine features
- top 5 strongest engine features
- top 5 highest-leverage improvements
- foundational architectural fixes that improve multiple features at once

---

## Feature Inventory To Audit

This is the minimum screenshot-engine feature set to review.

### Capture Core

- URL capture
- raw HTML rendering
- viewport width
- viewport height
- full-page capture
- PNG
- JPEG
- WebP
- PDF
- quality control

### Timing And Stability

- `waitUntil`
- `waitForSelector`
- `delay`
- font readiness
- font preloading

### Content Cleanup And Manipulation

- cookie banner removal
- popup removal
- element removal
- ad blocking
- CSS injection
- JS injection

### Environment Emulation

- color scheme
- stealth mode
- device pixel ratio
- timezone
- locale
- geolocation

### Output Enhancements

- browser mockup
- iPhone mockup
- MacBook mockup
- caching

### Cross-Cutting Engine Concerns

- browser lifecycle
- navigation safety
- timeout model
- error quality
- logging and observability
- performance
- security hardening

---

## Recommended Delegation Order

Run the audit in this order:

1. Phase 0 engine mapping
2. Phase 1 base capture pipeline
3. Phase 2 timing and readiness
4. Phase 3 content cleanup and DOM intervention
5. Phase 4 environment emulation and anti-detection
6. Phase 5 output enhancement and post-processing
7. Phase 6 cross-cutting architecture
8. Phase 7 test quality
9. Phase 8 synthesis

This order matters. You need to understand the underlying capture pipeline before judging cleanup, stealth, or caching quality.

---

## Delegation Prompt Template

Use a prompt like this for each feature review:

```text
Review only the assigned screenshot-engine feature.

Feature:
- [insert one feature or one tight feature family]

Objective:
- determine how the feature is currently implemented
- evaluate how good that implementation is
- identify strengths, weaknesses, and brittleness
- compare it to stronger implementation patterns
- rate it on a 1/5 to 5/5 quality scale

Rules:
- do not edit code
- gather evidence from implementation and tests
- runtime verification is optional and should support implementation critique
- focus on implementation quality, not generic product commentary
- identify what a best-in-class solution would add

Required output:
- Feature reviewed
- Problem this feature is trying to solve
- Current implementation strategy
- Strengths
- Weaknesses
- Failure modes and edge cases
- Comparison to stronger approaches
- Quality rating
- Evidence
- Recommended improvements
```

---

## Definition Of Done

This audit is complete only when:

- every screenshot-engine feature has been reviewed individually or in a tightly scoped family
- every review explains the implementation strategy, not just whether the feature exists
- every review identifies real-world failure modes
- every review compares the current solution to stronger approaches
- every feature has a justified quality rating
- a prioritized improvement backlog exists for the engine

If the output does not tell us **how good our implementation is**, the audit is not complete.
