# Feature Quality Audit Plan

## Purpose

This document is the operating plan for a full quality audit of every feature this product offers, exposes, or publicly claims to support.

The goal is not to do a shallow review. The goal is to determine, for every feature:

- whether it actually works
- whether it is implemented well
- whether it is safe, maintainable, and testable
- whether the docs and marketing accurately describe it
- whether the current implementation is the highest-quality version of that feature we should ship

This is an audit plan, not the audit itself.

---

## Instructions For The Facilitator Agent

You are the orchestrator, not the primary reviewer.

Your job is to preserve your context window by breaking this audit into bounded tasks and delegating the deep work to subagents. You should coordinate, consolidate, prioritize, and track findings, but you should not personally perform the detailed code review, runtime QA, or exhaustive feature verification except when a tiny tie-breaker is needed.

### Operating Rules

1. Read this file completely before starting.
2. Read the repo instructions in `AGENTS.md`.
3. For runtime verification work, read and follow:
   - `.agents/skills/qa-testing/SKILL.md`
   - `.agents/skills/agent-browser/SKILL.md`
4. Delegate every substantial review task to a subagent.
5. Keep each subagent narrowly scoped to one feature family or one verification objective.
6. Run independent subagents in parallel whenever possible.
7. Do not let one agent review the whole product end to end.
8. Do not let browser QA happen in the facilitator's own context unless absolutely necessary.
9. Prefer `generalPurpose` subagents for deep reviews and QA flows.
10. For broad codebase mapping, prefer `explore` subagents.
11. For browser-based QA in this repo, use a `generalPurpose` subagent that follows the `qa-testing` skill and uses `agent-browser`. Do not use `browser-use` for this workflow.
12. Require evidence from every delegated task. No hand-wavy conclusions.
13. Do not edit code during the audit unless explicitly asked in a separate task.
14. Track anything that is partially implemented, misleadingly marketed, or only present as internal scaffolding.

### Required Deliverable Format For Every Subagent

Every delegated task must return:

- `Scope reviewed`
- `What was verified`
- `Findings` ordered by severity
- `Evidence` with file paths, routes, commands run, and screenshots/readbacks where relevant
- `Gaps not verified`
- `Recommended follow-up`
- `Suggested owner` if obvious

### Severity Levels

- `Critical`: security issue, billing breakage, data loss, major false marketing claim, core feature unusable
- `High`: broken major workflow, incorrect quota/billing behavior, incorrect auth, missing required error handling
- `Medium`: unreliable edge case, weak UX, inconsistent docs, flaky or incomplete test coverage
- `Low`: polish, wording mismatch, minor performance or maintainability concerns

### Evidence Standard

A feature is not considered audited until the delegated reviewer has checked all applicable layers:

- implementation quality
- API or UI behavior
- edge cases and negative cases
- test coverage and missing tests
- docs/marketing alignment
- security and abuse angle
- observability and debugging support

If a reviewer cannot verify something, they must say exactly why.

---

## Audit Method

Every feature family should be reviewed in the same order:

1. Inventory the exact user-facing promise.
2. Trace the implementation path in code.
3. Verify the happy path.
4. Verify failure modes and edge cases.
5. Verify quota, auth, and billing interactions if applicable.
6. Verify UI and API ergonomics.
7. Verify docs, examples, pricing copy, and positioning claims.
8. Evaluate implementation quality:
   - correctness
   - clarity
   - maintainability
   - extensibility
   - testability
   - performance
   - security
9. Record findings and recommended changes.

For each feature family, the facilitator should ask subagents to answer:

- Does this feature truly work?
- Is the current implementation the best reasonable version of it?
- Is the public promise accurate?
- What would break under load, misuse, strange input, or real customer behavior?
- What is missing that a high-quality implementation should include?

---

## Audit Phases

## Phase 0: Audit Setup

### Objective

Create a clean baseline before reviewing feature quality.

### Delegate

- One subagent for environment and baseline health
- One subagent for feature inventory and source-of-truth mapping

### Tasks

1. Verify the repo installs and runs with the expected toolchain.
2. Identify required env vars, external services, and local blockers.
3. Run baseline quality gates:
   - `bun check`
   - relevant tests
   - full test suite if feasible
4. Confirm which apps/packages are involved in each customer-facing feature.
5. Build a feature map linking:
   - feature name
   - code paths
   - API routes
   - UI pages
   - docs pages
   - pricing/marketing claims

### Output

- Baseline health report
- Feature inventory matrix
- Blocker list
- Audit execution order recommendation

---

## Phase 1: Public API Surface Audit

### Objective

Audit every externally exposed API route for contract quality, correctness, safety, and documentation accuracy.

### Delegate

Split into parallel subagents by route family:

- screenshot API
- API keys API
- credits API
- subscription API
- usage API
- user API
- webhook endpoint API
- public health endpoint
- incoming Polar webhook handler

### Review Criteria

- request validation quality
- auth behavior
- status codes
- error body quality
- response headers
- quota/billing side effects
- backward compatibility risk
- missing contract guarantees
- test coverage depth
- docs parity

### Required Route Checklist

Audit all of these explicitly:

- `GET /api/health`
- `GET /api/v1/screenshot`
- `POST /api/v1/screenshot`
- `GET /api/v1/playground/screenshot`
- `GET /api/v1/api-keys`
- `POST /api/v1/api-keys`
- `DELETE /api/v1/api-keys/:id`
- `GET /api/v1/credits/packs`
- `GET /api/v1/credits`
- `GET /api/v1/credits/transactions`
- `POST /api/v1/credits/purchase`
- `POST /api/v1/credits/initialize`
- `GET /api/v1/subscription/plans`
- `GET /api/v1/subscription`
- `POST /api/v1/subscription/checkout`
- `POST /api/v1/subscription/upgrade`
- `POST /api/v1/subscription/cancel`
- `GET /api/v1/subscription/portal`
- `GET /api/v1/usage`
- `GET /api/v1/usage/stats`
- `GET /api/v1/user/me`
- `GET /api/v1/webhooks`
- `POST /api/v1/webhooks`
- `DELETE /api/v1/webhooks/:id`
- `POST /api/webhooks/polar`

---

## Phase 2: Screenshot Engine Feature Audit

### Objective

Review every capture capability individually and in combination, including whether the implementation is robust, secure, and production-grade.

### Delegate

Break this into multiple subagents, each with a narrow slice:

- base capture and formats
- rendering/wait controls
- cleanup/injection features
- environment emulation
- output enhancements
- caching behavior
- failure handling and browser lifecycle

### Features To Audit Individually

#### Base Capture

- URL capture
- raw HTML rendering via POST
- PNG output
- JPEG output
- WebP output
- PDF output
- custom width
- custom height
- full-page capture
- quality control

#### Rendering And Timing

- `waitUntil=load`
- `waitUntil=domcontentloaded`
- `waitUntil=networkidle0`
- `waitUntil=networkidle2`
- `waitForSelector`
- `delay`
- font readiness behavior
- Google font preloading

#### Visual And Page-State Controls

- light mode capture
- dark mode capture
- CSS injection
- JS injection
- element removal by selector
- popup removal
- cookie banner removal
- ad blocking

#### Environment Emulation

- stealth mode
- device pixel ratio / retina capture
- timezone emulation
- locale emulation
- geolocation override

#### Presentation Enhancements

- browser mockup frame
- iPhone mockup frame
- MacBook mockup frame

#### Caching

- cache key generation
- cache TTL behavior
- cache hit correctness
- cache miss correctness
- cache + billing interaction
- cache + varying options interaction

### Required Quality Questions

Every screenshot feature reviewer must answer:

- Does it work for real inputs, not just synthetic tests?
- What are the bad inputs?
- What combinations produce surprising behavior?
- Is the implementation overly permissive or unsafe?
- Are timeouts and resource cleanup adequate?
- Are errors actionable for customers?
- Is the docs copy precise?
- Is test coverage meaningful or superficial?

### Special Security Questions

Audit the screenshot engine for:

- SSRF risk
- internal network access risk
- unsafe HTML or script execution assumptions
- browser escape or filesystem assumptions
- abuse potential from long pages, long delays, or pathological inputs
- denial-of-service and cost explosion risk

---

## Phase 3: Auth, Identity, And Access Audit

### Objective

Validate that authentication and authorization are correct across both the API product and the dashboard.

### Delegate

- one subagent for API key auth
- one subagent for session auth and dashboard access
- one subagent for auth-related edge cases and abuse cases

### Features To Audit

- API key required behavior
- bearer token support
- revoked key behavior
- `lastUsedAt` updates
- cross-user access isolation
- session-protected route coverage
- sign-in flow
- sign-up flow
- sign-out flow
- user bootstrap via `/user/me`
- QA bypass boundaries in non-production environments

### Required Questions

- Can one user access another user's data?
- Are there missing ownership checks?
- Are auth failures consistent and safe?
- Are secrets or raw credentials leaked anywhere?
- Are docs and legal pages accurate about auth and key handling?

---

## Phase 4: Billing, Plans, Credits, And Quota Audit

### Objective

Determine whether monetization and usage accounting are correct, defensible, and aligned with public pricing claims.

### Delegate

- one subagent for subscription lifecycle
- one subagent for credits and transactions
- one subagent for quota enforcement and overage logic
- one subagent for Polar integration flows
- one subagent for pricing/marketing parity

### Features To Audit

#### Plans And Entitlements

- free tier provisioning
- monthly usage reset logic
- monthly vs annual billing cycle behavior
- plan changes
- cancellation behavior
- uncancel/revoke behavior from webhooks
- overage behavior for paid plans

#### Credits

- credit balance initialization
- credit pack listing
- credit purchase flow
- credit consumption on screenshot usage
- transaction logging
- fallback from subscription allowance to credits

#### Checkout And Billing Operations

- subscription checkout
- upgrade flow
- cancel flow
- customer portal flow
- Polar product ID mapping
- webhook-driven state changes

#### Public Promise Audit

Explicitly verify whether each of these is:

- fully shipped
- partially implemented
- internal only
- marketed but not really available

Items to verify carefully:

- signed URLs
- S3 upload
- auto top-up
- signup bonus
- feature gating by plan
- overage billing semantics

### Required Questions

- Can usage be miscounted?
- Can customers be overcharged or undercharged?
- Do plan tables match real enforcement?
- Do purchased credits always land?
- Are there race conditions around balance or usage updates?
- Are the support expectations implied by pricing realistic?

---

## Phase 5: Webhooks And External Integration Audit

### Objective

Audit both outgoing customer webhooks and incoming provider webhooks.

### Delegate

- one subagent for outbound webhook endpoint management
- one subagent for outbound delivery behavior
- one subagent for incoming Polar webhook correctness
- one subagent for integration quality of any publicly claimed but not fully exposed feature

### Features To Audit

- webhook endpoint creation
- webhook endpoint listing
- webhook endpoint deletion/deactivation
- secret generation
- HMAC signature correctness
- event filtering
- `screenshot.completed` dispatch
- delivery logging
- network failure handling
- response truncation behavior
- delivery retry strategy or lack thereof
- idempotency expectations

### Required Questions

- Can a customer rely on webhook delivery?
- Is the webhook contract clear enough?
- Are there replay, spoofing, or signature validation concerns?
- Is delivery observability sufficient?
- Are missing retries or dead-letter behavior a real product gap?

---

## Phase 6: Dashboard And UX Audit

### Objective

Review every authenticated and public UI surface for workflow quality, clarity, resilience, and alignment with the underlying product.

### Delegate

Split by UI area:

- auth pages
- dashboard overview and navigation
- API keys page
- billing page
- credits page
- usage page
- playground page
- settings page
- marketing homepage and pricing
- docs explorer and docs navigation
- status page

### Review Criteria

- can a real user complete the intended task?
- loading states
- error states
- empty states
- destructive action clarity
- copy quality
- accessibility
- mobile responsiveness
- visual correctness
- consistency with billing and backend behavior

### Required User Flows

Audit these end-to-end:

- sign up
- sign in
- sign out
- first-time arrival to dashboard
- create an API key and use it successfully
- inspect usage history
- inspect usage stats
- view and use the screenshot playground
- start a subscription checkout
- purchase a credit pack
- view pricing and understand the offer
- read docs and successfully make a first API call

### Playground-Specific Questions

- Does the playground expose the right options?
- Are there missing capture parameters?
- Does it return helpful feedback?
- Does it correctly reflect balance/quota?
- Does it encourage successful first use?

---

## Phase 7: Docs, SDK, And DX Audit

### Objective

Audit the developer experience promised by the product, not just the runtime behavior.

### Delegate

- one subagent for docs/API reference
- one subagent for SDK parity
- one subagent for code samples and quickstart quality
- one subagent for marketing/docs consistency

### Surfaces To Audit

- docs homepage
- authentication docs
- screenshot API docs
- credits docs
- usage docs
- API keys docs
- webhooks docs
- API explorer
- guides
- integration pages
- use-case pages
- comparison pages
- changelog
- official SDK directories:
  - JavaScript
  - Python
  - Go
  - Ruby
  - PHP

### Required Questions

- Can a developer get to first successful screenshot quickly?
- Are sample requests valid right now?
- Do SDKs expose the same important options as the API?
- Are examples outdated?
- Are docs precise about auth, headers, errors, and quota?
- Are comparison and pricing pages fair and accurate?
- Are there features documented that the product does not truly expose?

---

## Phase 8: Data Model, Persistence, And Consistency Audit

### Objective

Review whether the database layer correctly supports the product and whether the data model creates hidden quality risks.

### Delegate

- one subagent for schema and index review
- one subagent for transactionality and race conditions
- one subagent for data retention and cleanup concerns

### Areas To Audit

- profiles
- API keys
- subscriptions
- credit balances
- credit transactions
- credit packs
- auto top-up config
- screenshots log
- screenshot cache
- webhook endpoints
- webhook deliveries

### Required Questions

- Are indexes sufficient for expected usage?
- Are uniqueness guarantees correct?
- Are counters updated safely?
- Are stale rows cleaned up?
- Are unused tables or partially wired tables creating confusion?
- Are schema enums aligned with live product behavior?

---

## Phase 9: Reliability, Performance, And Operations Audit

### Objective

Determine how production-ready the system is under normal load, error conditions, and operational stress.

### Delegate

- one subagent for browser runtime reliability
- one subagent for performance and resource usage
- one subagent for observability and operability

### Areas To Audit

- browser launch strategy
- local vs hosted runtime differences
- timeout handling
- screenshot duration tracking
- cache effectiveness
- failure logging
- webhook logging
- health checks
- alertability gaps
- operational visibility for billing and quota issues

### Required Questions

- What fails first under load?
- What is hard to debug in production?
- Which failures would silently hurt customers?
- Are there background tasks that can fail without visibility?
- Are there missing dashboards or alerts that should exist?

---

## Phase 10: Marketing, Packaging, And Promise Audit

### Objective

Verify that what the company says it offers matches what the product actually delivers.

### Delegate

- one subagent for pricing and feature claims
- one subagent for comparison/use-case pages
- one subagent for legal/support promise alignment

### Areas To Audit

- homepage feature claims
- pricing page claims
- subscription tier feature lists
- credit pack messaging
- status page implication
- changelog claims
- blog and integration claims
- legal pages that mention API keys, auth, or customer obligations

### Required Questions

- Are we overselling anything?
- Are there features presented as available that are only partial?
- Are plan-tier distinctions real or just marketing copy?
- Are support claims, reliability implications, and customer expectations aligned?

---

## Phase 11: Synthesis And Backlog Creation

### Objective

Turn raw audit findings into a prioritized action plan.

### Delegate

Use one subagent to normalize and cluster findings if the list is large, but the facilitator should own the final synthesis.

### Final Consolidation Tasks

1. De-duplicate findings from all subagents.
2. Group by:
   - broken features
   - risky features
   - misleading promises
   - missing tests
   - maintainability problems
   - performance/operability gaps
3. Rank by severity and customer impact.
4. Produce a recommended execution order for remediation.
5. Separate:
   - immediate fixes
   - strategic refactors
   - docs/marketing corrections
   - postponed enhancements

### Final Output

The final audit package should include:

- executive summary
- feature-by-feature findings index
- top critical issues
- top false-promise mismatches
- missing-test inventory
- recommended remediation roadmap
- unresolved questions

---

## Delegation Template

Use a prompt like this when assigning a feature review:

```text
Review only the assigned scope. Do not review the whole product.

Scope:
- [insert narrow feature family]

Objective:
- determine whether the feature truly works
- assess implementation quality
- assess security, billing, DX, and docs implications where relevant
- identify missing tests and misleading public claims

Rules:
- do not edit code
- gather concrete evidence
- if runtime verification is needed, follow `.agents/skills/qa-testing/SKILL.md`
- for browser QA in this repo, use `agent-browser` through a `generalPurpose` workflow
- check both code and user-visible behavior
- call out anything partially implemented or only internally scaffolded

Required output:
- Scope reviewed
- What was verified
- Findings by severity
- Evidence
- Gaps not verified
- Recommended follow-up
```

---

## Recommended Execution Order

Run the audit in this order:

1. Phase 0 setup and feature inventory
2. Phase 1 public API audit
3. Phase 2 screenshot engine audit
4. Phase 3 auth audit
5. Phase 4 billing and quota audit
6. Phase 5 webhooks and integrations audit
7. Phase 6 dashboard and UX audit
8. Phase 7 docs and SDK audit
9. Phase 8 data model audit
10. Phase 9 reliability and operations audit
11. Phase 10 marketing/promise audit
12. Phase 11 synthesis and backlog creation

This order is intentional. The screenshot API, auth, and billing model are the product core. Public promises should be audited only after the real implementation has been mapped and verified.

---

## Definition Of Done

This audit is complete only when:

- every shipped or claimed feature has been reviewed
- every major route and workflow has evidence-backed findings
- runtime verification has been performed where applicable
- docs and pricing claims have been compared against real implementation
- partial or misleading features have been explicitly flagged
- a prioritized remediation backlog exists

If any feature family was skipped, the audit is not complete.
