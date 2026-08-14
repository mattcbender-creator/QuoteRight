# Handoff

State of QuoteRight as of this branch, what changed and why, what's real vs.
mocked, and what to do next. Written for whoever picks this up — including you
in three weeks.

---

## Where things stand in one paragraph

`index.html` is still a single-file, no-backend POC, but its **pricing maths is
now real and correct** and reconciles to the cent against a working
electrician's actual spreadsheet. Three design docs in `docs/` define the
pricing model, where prices come from without manual uploads, and how the two
fit together. The UI overflow bugs that made the demo look broken on a phone
are fixed. `test/pricing.test.mjs` locks the money maths down with 24 assertions.
Nothing has been merged to `main` yet.

---

## Run it

```bash
open index.html                  # or: npx http-server -p 8080 -c-1
node test/pricing.test.mjs       # 24 assertions on the money maths
```

The test drives the real `calc()` in a headless browser rather than
reimplementing the formula — a test that reimplements the formula only proves
the reimplementation agrees with itself. It needs Chromium; override the path
with `CHROME_PATH=... node test/pricing.test.mjs` if the default is wrong.

**Demo data resets on first load** — the storage key moved to
`quoteright_poc_v5` because the profile gained tax, unit cost and milestones.
An old save would have computed money against missing settings.

---

## What changed on this branch (4 commits, none merged)

| Commit | What |
|---|---|
| `a316f8b` | Text overflow fixes + simplification across every screen |
| `7f50956` | `docs/pricing-model.md` — the pricing design |
| `d92d2bf` | `docs/automated-pricing-data.md` — where prices come from |
| `7947308` | AI price-list onboarding + price-source tags |
| *(uncommitted at time of writing)* | The `calc()` rewrite, tax, milestones, pass-throughs, tests |

### 1. UI / overflow

Audited every screen at 320/360/390/1280px with a headless browser, flagging
anything that overflowed its box, ran past the viewport, got truncated, or
wrapped into a line-height too small to hold it. The bad ones:

- Quote rows put client+job in a left column and amount+date in a right one,
  and they collided — the job line's `text-overflow:ellipsis` never applied
  because an inline `<span>` ignores it. Rows are now one column of three
  lines, each part truncating in its own space.
- Section line editors gave the item name ~70px, leaving `Cabinet in…`. The
  name now gets its own full-width row above the controls.
- The complexity picker pushed "Extreme ×1.75" off the right edge and rendered
  its label/multiplier inline as `Standard×1`. Now a 2×2 grid.

`scripts` for this live in the scratchpad, not the repo — re-create with a
`document.querySelectorAll('*')` sweep comparing `scrollWidth`/`clientWidth`
if you need it again.

### 2. The pricing model — the important one

**Read `docs/pricing-model.md` before touching money code.**

The short version: the app was built for *build-up* pricing (hours × rate +
materials × markup + complexity + contingency). A real electrician's estimator
prices with an **all-in unit catalogue** — `$65/receptacle`, margin already
baked in. Running his numbers through the old engine turned **$5,010 into
$9,400**. He'd have lost every bid.

Now every line has a kind, and the kind decides how money flows:

| kind | price | markup | complexity | contingency | rounding |
|---|---|---|---|---|---|
| `labour` | hours × rate | rate carries it | yes | yes | yes |
| `material` | cost × (1+tier) | tiered 40/30/20% | yes | yes | yes |
| `unit` | qty × catalogue price | none — baked in | **no** | **no** | **no** |
| `passthrough` | at cost | **none** | **no** | **no** | **no** |

```
buildUp = labour + materialsSold
cxAdd   = buildUp × (cx − 1)
cont    = (buildUp + cxAdd) × pct        // pct is 0 when buildUp is 0
preTax  = round(buildUp + cxAdd + cont) + units + passthrough
tax     = preTax × taxRate
total   = preTax + tax
```

Three things in there are load-bearing and easy to undo by accident:

1. **Contingency is zero when there's no build-up work.** Not a special case —
   it falls out of applying the risk layer to `buildUp` only. That's correct:
   a unit-price contractor manages that risk with a contract term ("changes
   after rough-in billed hourly"), which his sheet does explicitly and the
   pricing drawer now recommends in place of a padded line.
2. **Rounding covers the estimated part only.** An earlier version rounded the
   whole pre-tax figure and turned his exact $4,560 of catalogue lines into
   $4,600. Silently overstating a contractor's own price list is exactly the
   trust-losing error the product exists to prevent. The regression test pins
   this.
3. **Margin is never fabricated.** For unit work we can't know cost unless he
   tells us (`profile.unitCost`, default `null`). While it's unset,
   `costKnown:false` and both margin *and* "Your cost" are hidden, with a
   prompt to set it — rather than quietly using a 60% guess, which is what the
   old code did while displaying "68% margin" with total confidence.

Also added because his sheet has them and we didn't: **tax** (configurable
label + rate, defaults to HST 13%) and **payment milestones** (deposit /
rough-in / completion, replacing a hardcoded "30% deposit").

### 3. Where prices come from

**Read `docs/automated-pricing-data.md`.** Both contractors who saw the demo
asked the same question — "where do the prices actually come from?" — and the
second added the real constraint: suppliers give different discounts, so a
generic price is useless unless he can override it.

There is no cheap legal live-pricing feed. No public Home Depot/Lowe's API,
1build is enterprise-only, and **RSMeans's licence forbids redistributing its
data inside a product at all**, at any budget. So the answer is four layers:

1. **AI-drafted starter catalogue at signup** — removes the upload step.
2. **His edits are permanent truth** — tagged, never silently overwritten.
3. **2b. Prices update from things he already does** — snap a receipt, forward
   a supplier price sheet, say it out loud. This is the answer to the *ongoing*
   burden, which is the part that actually eats time.
4. **Pooled regional pricing** once there's a userbase — first-party data, so
   it sidesteps every licensing problem. This is the real moat.

---

## Real vs. mocked — read this before demoing

| Thing | Status |
|---|---|
| Pricing maths (`calc()`) | **Real.** Reconciles to the reference sheet to the cent. |
| Tax, milestones, pass-throughs | **Real**, configurable in Settings. |
| `.xlsx` import | **Real.** Parses the reference workbook correctly — 225 items, 25 sections, correct `area · room` nesting. |
| "AI suggested" tags & override rule | **Real** behaviour, wired end-to-end into quotes. |
| The AI catalogue *content* | **Mocked.** `AI_CATALOGS` is hand-written placeholder data for two trades. There is no backend and no model call. |
| Everything else | No auth, no server, no PDF, no persistence beyond `localStorage`. |

Don't let the AI-catalogue mock get demoed as a working feature — the
interaction is real, the numbers in it are invented.

---

## What I'd do next, in order

1. **Merge and redeploy.** Four commits are stranded; if Railway serves `main`,
   nobody has seen any of this — including the price-source tags that answer
   the exact question both contractors asked. No PR has been opened.

2. **Get a second contractor's estimator, from a different trade.** The whole
   pricing model is built on *one* electrician's sheet. It fits his work
   beautifully — that's also the risk. Before anyone writes a real Next.js
   pricing engine around this, check the four line kinds against a plumber or
   drywaller's sheet. One text message; it de-risks the entire build. **This is
   worth more than any code.**

3. **Answer the open questions** in `docs/pricing-model.md` (are the $180 vs
   $220 circuit prices a typo or real? what are his actual payment
   percentages? is 60% close for his unit cost share?).

4. **Then start the real app** (`docs/build-plan-v2-working-app.md` P0–P8).
   The POC has done its job on UI and pricing; further polish here has
   diminishing returns. Port `calc()` and `test/pricing.test.mjs` into
   `lib/pricing/` first — that module is sacred, nothing else should compute
   money.

---

## Traps

- **`DB.book` items and quote `units` are different shapes.** Catalogue items
  are `{name, price, source}` objects; quote unit lines are
  `[name, qty, price, source]` tuples. Every consumer destructures
  positionally, which is why adding a 4th slot was safe — keep appending, never
  reorder.
- **`groupTotal()` returns the client-facing figure** (build-up × cx + fixed),
  not a raw cost. `groupParts()` gives the split if you need it.
- **`clientItems()` scales sections to foot exactly** against the pre-tax
  subtotal, absorbing rounding drift into the largest line. A quote that
  doesn't add up looks amateur. Don't "simplify" this away.
- **`calc()` reads `DB.profile`** for markup, rounding, tax and unit cost — it
  is not a pure function of `q`. Worth fixing when it moves to `lib/pricing/`.
- The reference spreadsheet is **not** in the repo (it's a real contractor's
  file). `test/pricing.test.mjs` hardcodes five of its lines as the fixture, so
  the test stands alone.
