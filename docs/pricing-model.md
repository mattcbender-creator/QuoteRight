# Pricing model

How QuoteRight turns a scope into a number. Written against a real estimator
(`Estimator_2023.xlsx`, a working electrician's sheet) rather than against the
methodology guide alone, because the two disagree and the disagreement matters.

## What the real sheet does

One sheet, 303 rows. Columns are `Description | total (qty) | $ (unit price) |
Subtotal (=qty×price)`. Rows nest two levels deep: an **area** (`Main floor`,
`Second floor`, `Basement`, `Garage`, `Outside`, `Structured cabling`,
`service 200amp`) and a **room** under it (`kitchen`, `#1 bedroom`, `bathroom`…).
Priced lines sit under the rooms.

- **225 priced lines, but only 78 distinct operations.** The sheet is a
  room-by-room *checklist*, not a flat price list — the same 78 operations
  repeat across ~22 rooms. Estimating a job means walking the rooms and
  entering counts.
- **Every price is all-in installed.** `receptacles 15a - new location
  installed = $65` already contains labour, material, overhead and profit in
  one number. There is no hours column and no material-cost column anywhere.
- **Three different kinds of money are already in there**, even though the
  sheet treats them identically:
  - unit lines — `pot light … $130`
  - time-and-material — `rip out and or isolate old circuits. Per hr. $220`
  - pass-through cost — `ESA permit. $450` (a government fee, marked up by nobody)
- **HST 13% is a line at the bottom**, then Grand Total.
- **Payment is three milestone draws**, not a deposit: first payment, second at
  rough-in inspection, balance after final inspection.
- **Risk is managed by contract terms, not a contingency line.** The notes say
  *"all changes after ruff in inspection are done at per hour basis"* and *"all
  additions are signed with up dated price."* There is no contingency anywhere
  in the sheet. This is the important one — see below.

## The mismatch with what we built

The app's `calc()` implements *build-up* pricing, straight from the methodology
guide: `hours × rate`, `materials × tiered markup`, then a complexity
multiplier (1.0–1.75×) and a contingency (15% or 25%) on the whole subtotal.
That is the right model for a GC pricing a bathroom gut. It is the wrong model
for a trade sub pricing off a catalogue, and today the app applies it to
imported unit prices anyway.

Running five real lines from his sheet through the current engine:

| | |
|---|---|
| His sheet's total (qty × price) | **$5,010** |
| QuoteRight's total for the same lines | **$9,400** |
| — complexity uplift added (cx 1.5) | +$2,505 |
| — contingency added (25%) | +$1,879 |
| **Inflation over his own price** | **+88%** |

Even at complexity 1.0 with the buffer off, it still returns $5,800, because
the 15% base contingency has nowhere to turn off. The uplift and the
contingency are being stacked onto prices that already contain his margin and
his own slop. He would lose every bid.

Two smaller gaps in the same area:

- **There is no tax anywhere in the app.** For an Ontario contractor that is
  13% missing from every quote.
- **The margin figure is fabricated.** `cost = labour×0.62 + matCost +
  units×0.60` — the `0.60` is a hardcoded guess. The app currently shows "68%
  margin" on the example above with total confidence. Never do that with
  someone's livelihood.

## The model

### 1. Every line has a kind, and the kind decides how money flows

| kind | input | price | markup | complexity | contingency |
|---|---|---|---|---|---|
| `unit` | qty × catalogue price | qty × price | none — baked in | **no** | **no** (default) |
| `labour` | hours × rate | hours × rate | none — rate carries it | yes | yes |
| `material` | supplier cost | cost × (1 + tier) | tiered 40/30/20% | yes | yes |
| `passthrough` | actual cost | cost | **none** | **no** | **no** |

`passthrough` is the missing fourth type and it earns its place: permits, ESA
fees, dump fees, city inspections. Marking up a $450 permit is how you lose a
job on the one line a client can price-check in ten seconds. His sheet already
carries it at exact cost.

### 2. Risk applies once, and only to the build-up portion

```
buildUp   = labour + materialsSold
fixed     = units + passthrough

cxAdd     = buildUp × (cx − 1)
cont      = (buildUp + cxAdd) × contPct

preTax    = round(buildUp + cxAdd + cont) + units + passthrough
tax       = preTax × taxRate
total     = preTax + tax
```

Unit lines and pass-throughs skip the risk layer entirely, **and they sit
outside rounding too.** Rounding is a presentation choice that only makes
sense for *estimated* work — a quote isn't a bill. But a catalogue price and
a permit fee are exact numbers the contractor already decided on. An earlier
version of this formula rounded the whole pre-tax figure and turned his exact
$4,560 of unit lines into $4,600; silently overstating a contractor's own
price list is precisely the kind of error that loses trust. Round the
estimated part, add the exact parts on top.

**Contingency defaults to off on a unit-priced job.** His sheet has no
contingency because he controls that risk with a contract term instead:
changes after rough-in are billed hourly, additions are re-signed at an updated
price. That is a *better* instrument than padding — it keeps the bid
competitive and still protects him. So when a quote is mostly unit lines, we
should propose the change-order clause rather than a contingency percentage,
and say why. When it's mostly build-up work, contingency is the right tool and
stays on.

### 3. Tax is a first-class, jurisdiction-aware line

A setting: `HST 13%` / `GST 5% + PST` / `GST only` / `none`, with the rate
editable. Rendered on the client sheet exactly as his does it — Subtotal, tax
line named properly ("HST"), Grand Total.

### 4. Payment schedule is milestones, not a fixed deposit

The client sheet currently hardcodes "30% deposit to schedule". His job needs
*deposit → rough-in inspection → balance after final inspection*. Make the
schedule a list of named milestones with a percentage each, defaulted per
trade, with the dollar amounts computed and printed on the quote.

### 5. Never fabricate a margin

For build-up work we know cost, so margin is real. For unit work we cannot know
it unless he tells us. Ask **once per catalogue** — "roughly what share of a
unit price is your cost?", default 60% — store it, and label anything derived
from it as an estimate. If he hasn't answered, show the total and suppress the
margin rather than inventing one.

## What this means for the catalogue

**Model it as ~78 operations plus room templates, not 225 items.** A room
template is a named list of operations (`bathroom` = these 12). A job is then
"3 bedrooms, 2 baths, a kitchen" → rooms instantiated with their operations at
zero count → he walks through entering counts. That is exactly how the
spreadsheet is used today, and it is the biggest single UX win available: it
turns estimating from scrolling 300 rows into answering "how many rooms?"

**Prices are contextual to the room, not global.** Nine operations carry
conflicting prices across rooms:

| operation | prices seen |
|---|---|
| `dimmers - LED capable installed` | $45 / $85 / $110 |
| `switches 3way - new location installed` | $85 / $110 / $130 |
| `circuits to panel 15a includes breaker` | $180 / $220 |
| `dryer` | $380 / $420 |
| `electric fireplace 15a feed` | $160 / $210 |
| `washer feed with rec and afc breaker` | $210 / $220 |
| `bath exhaust fan feed and switch location` | $120 / $130 |
| `exhaust fan feed and switch location` | $120 / $130 |
| `new octagon box outlet for sconce lights` | $65 / $85 |

Some of these are deliberate (a kitchen dimmer is a bigger job than a closet
dimmer). Some are almost certainly drift — `$210` vs `$220` for the same washer
feed, `$180` vs `$220` for the same circuit. **Surface them on import** and let
him decide per operation: keep the per-room prices, or set one price
everywhere. Do not silently pick one. A flat global price list would collapse
these nine into whichever price we happened to hit last, and he would never
know.

## Worked example — the same five lines, priced correctly

| line | kind | calc | amount |
|---|---|---|---|
| 12 × receptacle 15a | unit | 12 × $65 | $780 |
| 18 × pot light | unit | 18 × $130 | $2,340 |
| 8 × switch | unit | 8 × $65 | $520 |
| 4 × 20a circuit | unit | 4 × $230 | $920 |
| ESA permit | passthrough | at cost | $450 |
| | | **Subtotal** | **$5,010** |
| | | HST 13% | $651.30 |
| | | **Grand total** | **$5,661.30** |

Matches his sheet to the cent, which is the test that matters: if we hand this
contractor's own numbers back to him and they don't reconcile with the
spreadsheet he already trusts, he will not use the app a second time.

## What has to change in the code

1. `calc()` — rewrite around line kinds and the single risk layer above.
2. Data model — add `kind` to every line; add `passthrough`; keep `units` as-is.
3. Settings — tax jurisdiction + rate, unit-cost ratio, payment milestones.
4. Client sheet — subtotal / tax / grand total, and the milestone schedule.
5. Importer — **no change needed to the parser**; it already reads this
   workbook correctly (225 items, 25 sections, correct `area · room` nesting,
   stops cleanly at the totals block). Add drift detection and operation
   de-duplication on top of it.
6. Room templates — the new piece, and the one worth building first.

## Open questions for the contractor

- Is the $180/$220 circuit difference real or a typo? Same for washer and dryer.
- What are the three payment percentages?
- What's his rough cost share on a unit price — is 60% close?
- Does he ever apply a discount, and is it per-line or on the total?
