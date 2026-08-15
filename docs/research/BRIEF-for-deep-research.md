# Research Brief — QuoteRight

*Paste everything below the line into ChatGPT (deep research mode) or another
research agent. Written Aug 2026.*

*Note for us, not for the researcher: the highest-value questions about this product
can only be answered by interviewing a working contractor — see
`contractor-needs-and-jobs.md` §7. This brief deliberately covers only what desk
research can settle. Run both in parallel; don't let this substitute for the
interview.*

---

## CONTEXT

I'm building **QuoteRight**, an AI-guided estimating tool for **solo and very small
residential remodeling contractors** (1–5 people) in North America. Think the guy who
does bathrooms, kitchens, decks and basement framing, quotes from his truck or at 9pm
on his couch, and runs his business out of a spreadsheet and his head.

The product turns a spoken description of a job — *"small main-floor bathroom, 5 by 9,
tub to shower, house is from the seventies"* — into a complete, itemised, margin-checked
quote in under ten minutes. Under the hood it computes labour hours as
`quantity × production_rate × adjusters`, prices materials with waste and package
rounding, and derives a contingency from what it still doesn't know. All arithmetic is
deterministic code; the AI only handles language.

I am pre-launch, with a working clickable prototype and one friendly contractor lined
up as first user.

## WHAT I ALREADY KNOW — DON'T RE-RESEARCH THIS

Skip these; I have them sourced and I don't need them confirmed:

- Bathroom is the #1 remodel job, kitchen #2 (NAHB 2025)
- A detailed estimate takes 2–8 hours; typical win rate ~1 in 6
- Remodeler net profit commonly 10–18%; NAHB's *best* averaged under 4%; below 8%
  net margin one bad job puts a contractor in the red
- Markup ≠ margin: a 20% markup yields a 16.7% margin. Widespread, expensive error
- 47% of contractors say getting people to actually use new tech is their #1
  challenge, ahead of cost (AGC 2024)
- Field constraints: gloves, direct sunlight, spotty signal, large touch targets,
  offline required
- Homeowners want fixed prices not ranges; itemised beats lump sum; "miscellaneous"
  is a documented red flag; precise-looking prices outperform round ones

## WHAT I NEED — SIX QUESTIONS, IN PRIORITY ORDER

### Q1 — Does speed-to-quote actually increase win rate? *(highest priority)*

This is the single biggest unknown in my business case. If responding in 2 hours
instead of 5 days moves a contractor from winning 1-in-6 to 1-in-5, that's a ~20%
revenue increase, which is worth far more than the hours the tool saves.

Find:
- Any data on **first-responder advantage** in home services / contracting / trades
  lead conversion. Lead-response-time studies (Lead Response Management, InsideSales,
  HBR's "Short Life of Online Sales Leads") — do the findings extend to
  high-consideration, in-home, five-figure purchases, or only to low-ticket web leads?
- Data from home-services lead marketplaces (Angi, Thumbtack, Houzz, HomeAdvisor) on
  response time vs. booking rate
- Any contractor-side survey data on **why homeowners chose the bid they chose** —
  where does speed rank against price, professionalism of the document, referral,
  and gut feel about the person?
- Counter-evidence: is there research suggesting that for large remodels a *fast*
  quote reads as careless or unconsidered? I want the strongest version of the
  argument against my thesis.

**Be explicit about how much of this is vendor-published** — much of the
lead-response literature comes from companies selling CRM software.

### Q2 — What do the incumbents do, and where exactly do they fail?

Competitors: **Joist, Contractor+, Jobber, Housecall Pro, Buildertrend, ServiceTitan,
Knowify, JobTread, Fieldwire, Handoff, Kojo**, plus anything newer with an AI angle.

For each of the most relevant (prioritise ones a *solo* contractor would actually
consider):
- Real current pricing — monthly, per-seat, what's gated behind which tier, setup fees
- Whether they do **labour hour estimation** at all, or only line-item entry and
  invoicing. I believe most are glorified invoice builders. Confirm or correct this.
- Do any of them **learn from completed jobs** to improve future estimates? This is my
  core differentiator and I need to know if it already exists.
- What do 1–3 star reviews consistently complain about? Mine G2, Capterra, Reddit
  (r/Construction, r/Contractor, r/HomeImprovement), contractor forums. I want
  **abandonment reasons in contractors' own words**, not feature-checklist gaps.
- Anything that has launched in the last 18 months with an AI estimating pitch — did
  it get traction, and what are people saying about accuracy?

### Q3 — Where can I get trustworthy production rates (labour hours per unit)?

My engine needs seed values like "floor tile ≈ 0.12 hours per square foot." Mine are
currently educated guesses and that is my biggest product risk.

Find:
- The real options — **RSMeans, Craftsman National Estimator, HomeTech Remodeling &
  Renovation Cost Estimator, Xactimate**, and any open or academic datasets
- For each: **actual licensing cost and terms**, whether an individual or small
  software company can license the data for use inside a product (as opposed to
  reading it), update frequency, and whether it's residential-remodel-relevant or
  commercial-new-construction biased
- Any free or public-domain sources of residential labour productivity data
  (government, trade association, insurance)
- How accurate are these considered by practitioners? Search contractor forums for
  what people say about RSMeans numbers vs. their real-world hours — I've heard they
  run high for commercial and don't fit small residential jobs, and I want to know if
  that's true.

### Q4 — What will these guys actually pay, and how do they churn?

- Real pricing benchmarks for SaaS sold to **solo tradespeople** — what monthly price
  points work, where does resistance start, do they prefer annual, per-job, or
  per-quote pricing?
- Evidence on **free trial vs freemium vs paid pilot** for this audience specifically
- What's typical churn for small-contractor SaaS, and when does it happen (month 1?
  after the busy season ends?)
- Do these buyers expense software at all, or is every dollar personal? How does that
  affect willingness to pay?
- Anything on seasonality — does a remodeling contractor's willingness to adopt new
  tools vary across the year? (I'd guess winter is when they have time and no money.)

### Q5 — What's the liability exposure of telling a contractor a number?

My app produces a number a contractor relies on to bid a job. If the number is wrong
and he loses money, or if he quotes a client and can't honour it:

- Is there precedent — case law, industry practice, or insurer guidance — on
  **software vendor liability for estimating errors**? How do RSMeans, Xactimate and
  the estimating incumbents handle this contractually?
- What disclaimer and terms-of-service language is standard in this category?
- Does providing estimating guidance create any professional-advice exposure
  (comparable to tax software)?
- Anything specific to **Canada vs US** — I may launch in Canada first.

### Q6 — What actually makes a homeowner pick one bid over another?

I have partial data on this. I need it sharpened, because it tells me what the quote
document should emphasise:

- Studies or surveys where homeowners explain their contractor choice, ranked
- How much does the **quote document itself** matter vs. the in-person interaction?
- Does itemisation ever *hurt* — does breaking out labour invite price negotiation or
  DIY substitution on line items?
- Evidence on presenting a contingency/allowance line to homeowners — does "any
  unused portion comes back to you" build trust, or does any visible buffer read as
  padding?

## SOURCE QUALITY BAR

- **Prefer:** peer-reviewed work, government and trade-association data (NAHB, NARI,
  AGC, Statistics Canada, BLS), primary survey data, and contractors talking to each
  other unprompted in forums and subreddits
- **Treat with suspicion and label as such:** anything published by a company selling
  estimating or CRM software. Much of the "contractors waste X hours" literature is
  content marketing. Cite it if it's the only source, but say so.
- **Date everything.** Pricing and product capabilities from before 2025 are probably
  stale. Say when each figure is from.
- **Flag US-only data.** I may launch in Canada; note where a finding may not transfer.

## OUTPUT FORMAT

1. **Executive summary** — the five findings that should most change what I build,
   with a one-line "so what" each
2. **One section per question (Q1–Q6)**, each ending with an explicit
   **"what this means for the product"** paragraph
3. **A confidence rating on every substantive claim** — Strong / Moderate / Weak /
   Contested — and say plainly when the honest answer is "there isn't good data on
   this"
4. **A contradictions section** — where sources disagree, show both sides rather than
   averaging them into mush
5. **Full source list with links**

## WHAT I DON'T WANT

- Generic startup or SaaS advice not specific to contractors
- A feature list of what my competitors offer, absent any signal about what users
  think of it
- Marketing copy, positioning suggestions, or naming ideas
- Confident answers where the underlying data is thin — I would rather read "no
  reliable public data exists on this" than a plausible number I might act on. If a
  question can't be answered well, say so and explain what evidence *would* answer it.
