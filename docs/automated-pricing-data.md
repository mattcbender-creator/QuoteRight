# Automated pricing data — how a contractor gets prices without uploading anything

Answers one question: **where do the numbers in someone's price list come from
if not from him typing them in or exporting a spreadsheet?**

## The constraint that shapes everything

`docs/research/viability-review-estimating-app.md` already did this homework —
worth restating plainly because it rules out the naive answer:

- **There is no free or cheap official live-pricing API for Home Depot or
  Lowe's.** Confirmed, not assumed.
- **1build** (the clean aggregated cost-data source) is enterprise
  contact-sales — no published price, not affordable at this stage.
- **RSMeans/Gordian** costs real money (**$396–$5,973/yr**) *and its license
  forbids redistributing the data inside an app you sell.* Not usable as an
  embedded source at all, regardless of budget.
- **Scraper APIs** work (~$0.0035/lookup) but sit in ToS-gray territory
  against the retailers' terms of service, and only cover big-box SKUs — not
  a local lumberyard, not an electrician's installed-price catalogue like the
  one we just looked at.

So "automated" cannot mean "we pipe in a live Home Depot feed." That option
is either not for sale to us or not legal to resell. Anyone promising that at
a $15–29/month price point is either lying or eating an unsustainable cost.
What *is* achievable automatically, cheaply, and legally is a different
architecture — four layers, each one doing a piece of the job.

## The four layers

### Layer 1 — AI-generated starter catalogue at signup (replaces the upload)

This is the direct fix for "I aint uploading excel files every time." He
never uploads anything, including the first time.

At signup he answers three things the rate wizard already needs anyway:
**trade, region (postal/zip), and roughly how he prices** (labour rate,
or "priced per fixture," etc.). From that, an LLM with web search drafts a
starter catalogue — the ~50–100 operations typical for his trade, each with a
plausible regional price and a cited source — using the **room-template /
operation-list shape from `docs/pricing-model.md`** as the skeleton, since we
already know *what* a trade needs priced, just not *his* numbers.

He reviews it as one screen, not a spreadsheet: "Here's a starting price
list for a residential electrician in Ottawa — 78 operations, most sourced
from typical trade pricing in your area. Tap any line to change it, or accept
all and adjust as you go." Nothing is saved as fact until he taps accept —
same rule the build plan already set for AI price-assist (§3.6): *never
auto-applied.*

This is the existing "AI price assist" feature from `build-plan-v2-working-app.md`
§3.6, run once in bulk at onboarding instead of per-material on demand. No new
capability — just runs the LLM-with-search call ~80 times up front instead of
whenever he taps "get price" on one item.

**Cost:** one-time, dozens of cheap web-search LLM calls per new contractor —
call it $0.10–0.30 total (matches the existing per-lookup cost estimate in the
viability review), not a recurring line.

**Trust framing matters here:** call it a *draft*, not a fact. It's a
reasonable starting point pulled from public trade pricing, explicitly lower-
confidence than a number he's actually charged before. Never present it with
the same visual weight as a price he's confirmed or actually used.

### Layer 2 — His own corrections become the permanent source of truth

The moment he edits a line — in the draft catalogue, or later on a live
quote — that price is marked `source: contractor`, dated, and never
silently touched again. This is the existing rule the codebase already half-
implements (`editCost`, `editHours` in `index.html` — a contractor's edit
always wins over whatever populated the line). Layer 1 just needs to feed
prices in *with a confidence/source tag* so this rule has something to
override.

Over time, for an active contractor, the catalogue converges toward being
100% his own confirmed numbers. Layer 1 is a bootstrap, not a permanent
dependency — the app should need it less and less per contractor the longer
he uses it.

### Layer 3 — Scheduled refresh, not live-per-quote

Re-checking prices on every quote is neither necessary nor affordable at
scale. Instead: a background job re-checks catalogue lines periodically
(monthly is plenty — material and labour prices don't move week to week) and
surfaces **only the ones that moved**: *"5 prices in your catalogue may be
out of date — review?"* He accepts or dismisses per line. This mirrors the
"flag items not updated in 90 days" idea already in
`poc-build-plan-claude-code.md` M2, just automated instead of a passive flag.

Any line he's personally confirmed (Layer 2) can be excluded from auto-
refresh by default — if he told the app what something costs, an AI web
search shouldn't second-guess him without being asked.

**Cost:** bounded and predictable — one batch job per contractor per month,
not a call per quote. This is the lever that keeps Layer 1's ongoing cost
near zero rather than compounding per estimate.

### Layer 4 — Regional pooled pricing (the real moat, and the one legal "live" data source)

Once there are multiple QuoteRight contractors in the same trade and region,
their own confirmed prices (Layer 2 data, anonymized and aggregated) become a
genuinely live, accurate regional price index — accurate in a way scraped
retail prices never are, because it's *installed* pricing from contractors
who actually did the work, not shelf prices for the raw material. And
critically: **this sidesteps every licensing and ToS problem above**, because
it's the app's own first-party data, not resold Home Depot or RSMeans data.

This is explicitly the wedge the viability review points at ("build for one
buddy first... your data moat") — it just needs naming as the long-term
answer to "how do we get live prices" rather than treated as a side effect.
It only works once there's a userbase, so it's a phase-2+ layer, not day one.

Mechanically: an operation like "pot light IC slim LED 4inch, installed" gets
a running (median, count, last-updated) across contractors in the same trade
+ region who've confirmed a price for it. New contractors in that
trade/region get *pooled* numbers as their Layer-1 starting point instead of
(or blended with) the AI web-search draft — better data, and it costs nothing
per lookup.

### A fifth thing, cheap and separate: labour rate defaults

The rate wizard (`build-plan-v2-working-app.md` §4.9) asks what he wants to
take home and computes his hourly rate — that's the right mechanism and
doesn't need AI or scraping. The one genuinely free, legal, automatable
government data source here is a **public wage index** (BLS by trade/metro in
the US, Statistics Canada by trade/region in Canada) used only to suggest a
plausible *starting* rate before he answers the wizard's real questions —
"electricians in your area typically target $85–110/hr" as a sanity check,
never as the number itself.

## What this replaces vs. what stays

- **Replaces:** the spreadsheet-import screen (`docs/pricing-model.md`'s
  importer) as the *primary* onboarding path. The importer isn't wasted work —
  keep it as an *option* ("Already have a price list? Import it instead") for
  a contractor like the one whose sheet we just parsed, who has 20 years of
  his own numbers and would rather bring them wholesale than re-answer 78
  questions. Automated-by-default, import-if-you-already-have-one.
- **Stays exactly as designed:** everything in `docs/pricing-model.md` about
  line kinds, the risk layer, tax, and payment milestones. That's the math
  layer; this document is only about how the *inputs* to that math get
  populated without a manual export.

## Build order

1. **Layer 2 first, structurally** — it's nearly free (tag every price with
   `source` and `updated_at`) and every other layer depends on the
   "contractor edits always win" rule existing before AI-sourced data is
   allowed to touch a price.
2. **Layer 1** — the actual fix for "no more uploading." Needs: the
   room-template/operation skeleton from `pricing-model.md` per trade, and one
   LLM-with-web-search onboarding call. This is the single highest-leverage
   piece — it's what makes signup require zero files.
3. **Layer 3** — a scheduled job, straightforward once Layer 1/2 exist.
4. **Layer 4** — needs real users first; design the schema (trade, region,
   operation, price, confirmed_at) from day one so historical data isn't lost
   waiting for this phase, but don't build the aggregation UI until there's
   enough data for it to mean something.

## Open question for you

Layer 1 needs a **skeleton of operations per trade** to seed its questions
(the way `pricing-model.md` proposes for electrical, built from your friend's
real sheet). Should I build that skeleton for one trade first — electrical,
since we have a real reference sheet — or is there a different trade you want
prioritized for the next contractor design partner?
