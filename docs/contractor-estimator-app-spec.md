# Contractor Estimator App — Product Spec (v1)

**Working name:** TBD (placeholder: "QuoteRight")
**One-liner:** A guided estimating app for small contractors that turns their own prices, labor rates, and markup into fast, complete, professional quotes — and stops them from underquoting.

---

## 1. Who it's for

- Solo and small (1–5 person) residential contractors: decks, framing, bathrooms, basic renos, electrical.
- Newer contractors who know the trade but lose money on incomplete estimates.
- v0 user: your contractor buddy. Built around his jobs, his numbers, his suppliers.

## 2. Core value proposition

1. **Never forget a line item.** Every job type has a built-in checklist/assembly (demo, disposal, permits, waterproofing, waste factor, contingency...).
2. **His numbers, not generic data.** Labor rate, markup, and material prices belong to the contractor and persist across jobs.
3. **Fast.** A complete bathroom estimate in under 10 minutes.
4. **Professional output.** Branded PDF the client can accept with one tap.

## 3. MVP feature set (build this first)

### 3.1 Contractor profile (one-time setup)
- Business name, logo, contact info (for the PDF).
- Default labor rate ($/hr) — optionally per trade (carpentry vs. electrical).
- Default markup: separate % for materials and labor.
- Default waste factor % (overridable per material).
- Default contingency % per job type.
- Tax rate (GST/HST/PST or state sales tax).

### 3.2 Price list (the contractor's own database)
- Material name, unit (sheet, board, sqft, each, bag), unit price, supplier, last-updated date.
- Seeded from templates on first use; contractor edits prices once, they stick.
- Flag stale prices (e.g., not updated in 90 days) so quotes don't rot.
- **AI price assist (see §5):** button on any material → AI suggests a current local price → contractor confirms/overrides → saved.

### 3.3 Job templates (the real product)
Each job type is an *assembly*: an opinionated, editable checklist of everything that belongs in the estimate.

Launch templates (pick 3–4 with your buddy):
- **Deck** — footings, framing, decking, fasteners/hangers, railing, stairs, sealing, permit, disposal.
- **Bathroom reno** — demo, disposal, permit, plumbing rough-in, electrical, waterproofing/backer board, tile + thinset + grout, fixtures, vanity, paint, contingency.
- **Framing** — lumber by wall length/height, sheathing, fasteners, headers, waste factor.
- **Basic reno / drywall + paint** — demo, drywall, mud/tape, primer/paint, trim, disposal.

Template mechanics:
- Contractor enters job dimensions (deck L×W, wall linear ft, bathroom sqft).
- App computes material quantities from built-in formulas (e.g., joists at 16" o.c., 5% cut waste on decking, tile sqft × 1.10).
- Each line item = quantity × unit price (from his price list) + labor hours × his rate.
- **"Did you forget?" prompts:** items commonly missed (permit fees, dump fees, delivery, contingency) can't be skipped silently — they must be included or explicitly dismissed.

### 3.4 Estimate builder
- Start from template or blank.
- Line items grouped: Materials / Labor / Other (permits, disposal, delivery, subs).
- Live totals: cost, markup, tax, price to client, **and projected profit margin** (contractor-only view).
- Margin warning: "This quote is under your target margin of X%."
- Add one-off items on the fly.

### 3.5 Output & client flow
- Branded PDF estimate: client-facing version hides costs/markup, shows scope + price (itemized or lump-sum toggle).
- Send via share sheet (text/email — contractors live in text messages).
- Status tracking: Draft → Sent → Accepted / Declined.
- Duplicate any past estimate as a starting point.

### 3.6 Photos
- Attach site photos to a job (your own idea from the texts — cheap to build, contractors love it, useful later for AI takeoff).

## 4. Explicitly NOT in MVP

- Live/automatic price feeds as source of truth (ToS risk, coverage gaps, cost).
- Scheduling (add in v2 once estimating retention is proven — it's table stakes elsewhere, not a differentiator).
- Invoicing/payments (v2–v3; good second revenue line via payment processing).
- Blueprint/photo AI takeoff (v3 at earliest; Handoff/Buildxact already do it — only worth building if you can beat them on one specific job type).
- Multi-user/team accounts.

## 5. AI price assist (the pragmatic version of "AI gets prices")

**Design principle: AI suggests, contractor confirms, price list remembers.**

- Flow: contractor taps "Get price" on "2x6x12 PT lumber" → backend calls an LLM with web search (or a scraper API) → returns 1–3 candidate prices with source + date → contractor taps one or types his own → saved to price list with timestamp.
- Batch mode: "Refresh all prices on this estimate" → review screen showing old vs. suggested, accept individually.
- Never silently changes a price on an existing quote.

**Why not fully automatic:**
- No official Home Depot/Lowe's pricing API; scraping violates their ToS (risk you carry, not the user).
- Regional price variance means a wrong "confident" number loses the contractor money — one bad quote and he deletes the app.
- Local lumber yards (often his real supplier, with pro pricing) aren't scrapeable at all.

**Cost control:** price lookups are the only per-use cost (LLM + search calls, roughly cents per lookup). Cap free lookups/month; unlimited on paid tier.

## 6. Suggested tech stack (solo dev, ship fast)

- **App:** React Native + Expo (one codebase, iOS + Android; contractors are heavily mobile) — or Flutter if you prefer.
- **Backend:** Supabase or Firebase (auth, Postgres/Firestore, storage for photos/PDFs) — skip building a custom backend.
- **PDF generation:** server-side (e.g., a small serverless function with an HTML→PDF renderer) so PDFs look identical everywhere.
- **AI price assist:** serverless function calling an LLM API with web search enabled; cache results by (material, region, week) to cut cost.
- **Payments (later):** Stripe.
- **Offline tolerance:** estimates must be creatable offline (job sites have bad signal); sync when back online.

## 7. Data model (simplified)

- **Contractor**: business info, rates, markups, tax, defaults.
- **Material**: name, unit, unit_price, supplier, updated_at.
- **Template**: job_type, input_fields (dimensions), line_item_rules (formula → quantity), required_checklist_items.
- **Estimate**: job info, client info, status, line_items[], photos[], totals snapshot (prices frozen at send time).
- **LineItem**: type (material/labor/other), material_ref or description, qty, unit_price or hours×rate, markup applied.

## 8. Roadmap

**Stage 0 (weeks 1–8): Buddy build.** MVP above, one platform if needed, free. Success = he uses it on 5+ real quotes and says it caught something he'd have missed.

**Stage 1 (months 2–6): Productize.** One trade + one region (your province). Polish onboarding, seed 3–4 templates, launch at **$19–29/month** (not $5–10 — that price can't cover acquisition costs, and Joist already owns $10). Free tier: 3 estimates/month. Target: **10 paying strangers by month 6** or rethink.

**Stage 2 (months 6–12): Stickiness.** Accepted quote → auto material order list (grouped by supplier, ready to text to the yard) → basic job schedule. Invoicing + Stripe payments.

**Stage 3 (12+ months, only if earning it):** photo-assisted quantity takeoff for your one specialty job type; team accounts.

## 9. Success metrics

- Time to complete an estimate (target: <10 min for a templated job).
- % of estimates using a template (validates the best-practices thesis).
- "Caught items" — how often forced-checklist items were added that the contractor hadn't planned.
- Weekly active estimators; estimates sent per user per month.
- Month-6: ≥10 paying non-friend users, <5% monthly churn.

## 10. Biggest risks (be honest with yourself)

1. **Distribution.** Contractors don't browse app stores for SaaS. Your channel is word-of-mouth through your buddies' networks — that's why Stage 0 matters more than features.
2. **Free competition.** Contractor+ is free and claims live pricing; Joist is $10. Your edge must be *guided completeness* ("this app stops me losing money"), not price or price-lookups.
3. **Template quality.** The assemblies ARE the product. Bad formulas = wrong quantities = lost trust instantly. Build them with your buddy and your dad line by line; their field knowledge is your actual moat.
4. **Scope creep.** Scheduler, invoices, AI takeoff — all tempting, all already done by incumbents. Win estimating first.
