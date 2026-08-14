# POC Build Plan — Guided Contractor Estimator
### For use with Claude Code. Based on the "Confident Contractor" consult document.

**What this app is:** Not a calculator. A confidence system. It encodes a proven quoting methodology (rate calculation, tiered markups, complexity multipliers, mandatory contingency, site-visit capture, quoted-vs-actual learning) so a small residential contractor can produce a defensible, profitable quote in ~30 minutes instead of a 10-hour anxiety spiral.

**POC scope:** Web app (Next.js + Supabase), mobile-first responsive. Two job types: **bathroom renovation** and **deck**. Single user (no auth beyond a simple login). Deploy to Vercel so the contractor opens a link on his phone.

---

## Core business logic (from the consult — implement exactly)

### 1. Labor rate wizard (one-time setup)
```
(desired annual income + business overhead + taxes @ ~30%)
÷ billable hours (default 1,400, range 1,200–1,500)
= minimum hourly rate
× 1.2 = actual billing rate
```
Also: crew/helper cost ×1.20 minimum = helper bill rate. Store both.

### 2. Tiered material markup (automatic by price band)
- Items under $100: cost × 1.40
- Items $100–$1,000: cost × 1.30
- Items over $1,000: cost × 1.20
Applied per line item automatically; contractor can override per item.

### 3. Complexity multiplier (one selection per estimate)
- Standard 1.0× — newer home, easy access, no surprises expected
- Medium 1.25× — built 1980–2000, tight space, older plumbing
- High 1.5× — pre-1980, layout changes, custom tile, hidden-issue risk
- Extreme 1.75–2.0× — heritage home, structural unknowns, multi-trade
Applies to the labor+materials base before contingency. Show the plain-language descriptions in the picker so choosing is easy.

### 4. Contingency engine (cannot be skipped)
Base: 10% simple / 15% standard reno / 20% complex / 25% high-risk old home.
Checkbox adders stack on top: indecisive client +5%, unknowns behind walls +10%, other-trade coordination +5%, rush timeline +10%, specialty materials +5%.
Render as a separate, client-visible line: "Contingency Allowance (X%) — covers unforeseen complications such as hidden water damage, incorrect existing measurements, or material defects."

### 5. Job templates with labor-hour phases
Bathroom (standard baseline, hours × contractor's rate):
demo/prep 8h, plumbing rough-in 6h, waterproofing 8h, tile install 16h, fixtures/finishing 8h. Materials baseline: waterproofing $800, plumbing $600, tile/grout $1,300, fixtures $800, misc $300. All editable; these are starting points the contractor tunes.
Deck: computed per sqft from dimensions (footings, framing, decking, fasteners, railing, stairs, sealing, permit, disposal) — build formulas with the contractor.

### 6. Pre-send Confidence Check (blocking screen before "Send")
Five yes/no gates, all must pass or be consciously overridden:
1. Gut: "If this job goes sideways, do I still make money?" (No → prompt +10–15% contingency)
2. Market: "Is this price defensible for my quality and market?"
3. Profit: "Does this hit my $X/hr rate and target margin?" (auto-computed and shown)
4. Scope: "Did I capture everything at the site visit, or am I guessing?"
5. Value: "Does the quote say WHY I'm worth this?"

### 7. Site visit capture (mobile forms)
Per job type, a checklist form with photo upload prompts, mirroring the consult checklists:
- Bathroom: measurements (room dims, door swing, plumbing/electrical locations...), 12+ photo prompts (4 corners, fixtures, plumbing access, damage...), condition assessment (home age, floor, water damage, plumbing type), scope toggles (full gut? tub→shower? who supplies tile/fixtures?), logistics (occupied? pets? parking?).
- Deck: dimensions, grade/slope, soil type, utilities located?, permit?, material choice (PT/cedar/composite), stairs, railing.
Home age answer should auto-suggest the complexity multiplier.

### 8. Quoted vs. Actual tracking (the learning loop)
After a job completes: enter actual labor hours, actual material cost, complications (none/minor/major + notes), lessons learned.
App computes variance %, achieved hourly rate, and real margin.
After 3+ tracked jobs of a type, surface insights: "You underestimate tile installation by an average of 20% — apply adjustment to future bathroom quotes?" One tap applies it to the template.

### 9. Quote output
Client-facing PDF/print view: branded header, scope description, value/differentiation blurb (editable defaults: warranty, premium waterproofing, realistic timeline, photo updates), price anchoring line ("Renovations of this scope in our area typically range from $X–$Y..."), itemized-or-lump-sum toggle, separate contingency line, total.
Internal view additionally shows: costs, markups, margin %, achieved $/hr projection.
Statuses: Draft → Sent → Accepted / Declined (with a "what did they go with?" note field on Declined — feeds market data).

---

## Milestone prompts for Claude Code

Work one milestone at a time. Commit after each. Run `/init` first, then paste the relevant milestone as your prompt along with this file in the repo as `SPEC.md`.

**M0 — Scaffold.** "Set up a Next.js (App Router) + Supabase project, mobile-first with a clean neutral UI. Simple email login for a single user. Tables per SPEC.md: contractor_profile, materials, templates, estimates, line_items, site_visits, job_actuals. Seed nothing yet."

**M1 — Setup wizard.** "Build the contractor onboarding wizard implementing the labor rate calculation in SPEC.md §1 exactly, plus business info/logo, helper rates, tax rate, and the tiered markup table (§2, editable defaults). Persist to contractor_profile."

**M2 — Materials & price list.** "Build the price list: CRUD for materials (name, unit, unit cost, supplier, updated_at). Auto-apply tiered markup from profile to compute bill price, overridable per item. Flag items not updated in 90 days. Seed ~30 common bathroom + deck materials with placeholder costs."

**M3 — Estimate builder (bathroom first).** "Build estimate creation from the bathroom template in SPEC.md §5: phase-based labor lines at the contractor's rate, material lines from the price list, complexity multiplier picker (§3), contingency engine (§4) as a mandatory line. Live totals: cost, price, margin %, projected $/hr. Warn when margin < target."

**M4 — Site visit capture.** "Build mobile-friendly site visit forms per SPEC.md §7 for bathroom and deck, with photo uploads to Supabase storage. Link a visit to an estimate; auto-suggest complexity multiplier from home age. Show a completeness meter."

**M5 — Confidence check + quote output.** "Build the pre-send Confidence Check gate (§6), then the client-facing quote view/PDF and internal view (§9), with status tracking Draft/Sent/Accepted/Declined."

**M6 — Deck template.** "Add the deck job type: dimension inputs (L×W, height, stairs, railing length), quantity formulas for framing/decking/fasteners/footings with waste factors [fill in formulas from contractor interview], flowing into the same estimate builder."

**M7 — Actuals & learning loop.** "Build job completion tracking per SPEC.md §8: quoted vs. actual entry, variance and achieved-rate computation, and after 3+ jobs of a type, insight cards proposing template adjustments the contractor can apply in one tap."

**M8 — Polish for the buddy test.** "Empty states, sensible defaults, ability to duplicate an estimate, and a 2-minute demo path: setup wizard → new bathroom estimate → confidence check → PDF."

---

## Definition of POC success
The contractor quotes **one real job** with it, the Confidence Check passes honestly, the client receives a professional PDF, and the contractor says the quote took under an hour and included something he'd normally have missed. Then track that job's actuals — if the variance data teaches him something, you have a product.

## Deliberately out of scope for POC
Auth/multi-user, payments/invoicing, scheduling, AI price lookup, blueprint/photo takeoff, native mobile apps, competitor research tools. All later, only if the POC lands.
