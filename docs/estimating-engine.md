# The Estimating Engine — How QuoteRight Works Out Hours, Materials and Price

*Design document. Written Aug 2026. This is the intellectual core of the product —
everything else (UI, PDF, auth) is plumbing around this.*

> **Read this first:** every production rate, waste factor and multiplier in this
> document is a **seed value that has not been validated against real jobs.** They
> are here so the system has somewhere to start and something to argue with. The
> spec already names this as the #1 product risk: *"Bad formulas = wrong quantities
> = lost trust instantly."* §14 is the protocol for replacing these numbers with
> your buddy's real ones. **Do not ship the seed table as truth.**

---

## Table of contents

1. [The problem we're actually solving](#1-the-problem-were-actually-solving)
2. [The central architectural decision: quantities × rates](#2-the-central-architectural-decision-quantities--rates)
3. [The four layers](#3-the-four-layers)
4. [Layer 1 — Takeoff: where quantities come from](#4-layer-1--takeoff-where-quantities-come-from)
5. [Layer 2 — Production rates: where hours come from](#5-layer-2--production-rates-where-hours-come-from)
6. [Layer 3 — Adjusters: why this job is not the average job](#6-layer-3--adjusters-why-this-job-is-not-the-average-job)
7. [Layer 4 — Materials, waste and packaging](#7-layer-4--materials-waste-and-packaging)
8. [Confidence and provenance](#8-confidence-and-provenance)
9. [The question engine — asking 3 questions instead of 22](#9-the-question-engine--asking-3-questions-instead-of-22)
10. [Contingency, derived instead of guessed](#10-contingency-derived-instead-of-guessed)
11. [The learning loop — getting smarter from his own jobs](#11-the-learning-loop--getting-smarter-from-his-own-jobs)
12. [The underquote guardian](#12-the-underquote-guardian)
13. [Three depths of estimate](#13-three-depths-of-estimate)
14. [Calibration protocol — how the seed numbers get replaced](#14-calibration-protocol--how-the-seed-numbers-get-replaced)
15. [Worked example, end to end](#15-worked-example-end-to-end)
16. [What's deterministic vs what's AI](#16-whats-deterministic-vs-whats-ai)
17. [Data model](#17-data-model)
18. [Build sequence](#18-build-sequence)
19. [Open questions and known risks](#19-open-questions-and-known-risks)

---

## 1. The problem we're actually solving

A contractor's estimate has three parts. They fail differently:

| Part | How it fails | How bad |
|---|---|---|
| **Materials** | Forgot a line item; wrong quantity | Recoverable — he buys more, eats a few hundred |
| **Labour hours** | Underestimated | **This is where jobs die.** Hours are the biggest cost line and the least visible error |
| **Price wrapper** (markup, margin, contingency) | Markup/margin confusion; no buffer | Silent — looks fine, bleeds on every job |

Our research already established the stakes: remodeler net profit is commonly 10–18%,
NAHB's *best* remodelers averaged under 4%, and **below 8% net margin one bad job puts
you in the red.** A 20% hours underestimate on a $20k bathroom is roughly $2,000 —
which on a thin-margin job is the entire profit.

So the engine has three jobs, in priority order:

1. **Don't miss anything.** (Completeness beats precision. A line item at the wrong
   price is a small error; a line item that isn't there is 100% wrong.)
2. **Get the hours defensibly close.** Not perfect — *defensible*, and improving.
3. **Be honest about what it doesn't know**, and price that uncertainty explicitly
   instead of hiding it.

And it must do all three in **under 10 minutes**, because at a 1-in-6 win rate the
speed on the five losing bids matters as much as the quality of the winning one.

---

## 2. The central architectural decision: quantities × rates

**Never store hours as a lump. Always store `quantity × production_rate`.**

```
hours = quantity × production_rate × adjusters
```

This is the single most important decision in the whole system. Here's why.

### The wrong way (what most template apps do)

```
bathroom_template = { demo: 8hrs, rough_in: 6hrs, waterproofing: 8hrs, tile: 16hrs }
```

This is what our POC currently does. It has two fatal flaws:

- **It doesn't scale.** A 5×9 bathroom and a 9×12 bathroom both get 16 hours of tile.
  One of those is wrong by 60%.
- **It can't learn.** When a job runs 6 hours over, what did you learn? Nothing
  transferable. You can nudge "bathroom demo" from 8 to 9 hours, but that tells you
  nothing about the next bathroom, which is a different size.

### The right way

```
tile_hours = 140 sqft × 0.12 hr/sqft = 16.8 hrs
```

Now when the job runs over and tile actually took 21 hours, you learn:

```
observed rate = 21 / 140 = 0.15 hr/sqft
```

**That is a transferable fact about this contractor.** It improves every future tile
estimate at every size. That's the difference between an app with templates and an app
that gets smarter.

### The consequence

Everything downstream depends on this. Actuals capture must be per-task. The learning
loop updates rates, not totals. The quote breakdown shows quantities, which is also
what homeowners want to see (our research: *itemised quotes build trust faster than
lump sums*).

---

## 3. The four layers

```
   ┌─────────────────────────────────────────────────────────┐
   │ LAYER 1 · TAKEOFF                                       │
   │ "How much of everything is there?"                      │
   │ 140 sqft tile · 8 LF vanity wall · 1 tub→shower · 1 WC  │
   │ ← AI extracts from speech; contractor confirms          │
   └────────────────────────┬────────────────────────────────┘
                            ↓
   ┌─────────────────────────────────────────────────────────┐
   │ LAYER 2 · PRODUCTION RATES                              │
   │ "How long does a unit of that take him?"                │
   │ tile 0.12 hr/sqft · WC set 1.25 hr/ea                   │
   │ ← his table, seeded from defaults, learned from actuals │
   └────────────────────────┬────────────────────────────────┘
                            ↓
   ┌─────────────────────────────────────────────────────────┐
   │ LAYER 3 · ADJUSTERS                                     │
   │ "Why is THIS job not the average job?"                  │
   │ 2nd floor +8% handling · 1975 house +15% demo/rough     │
   │ ← decomposed, each one individually learnable           │
   └────────────────────────┬────────────────────────────────┘
                            ↓
   ┌─────────────────────────────────────────────────────────┐
   │ LAYER 4 · MATERIALS + PACKAGING                         │
   │ "What does he buy, and in what units does it come?"     │
   │ 154 sqft needed → 13 boxes @ 12.5 sqft = 162.5          │
   │ ← his price list; waste + box-rounding in code          │
   └────────────────────────┬────────────────────────────────┘
                            ↓
              PRICING ENGINE (already spec'd)
       labour $ + materials $ + markup + contingency → quote
```

Layers 1–4 produce **cost**. The pricing engine turns cost into **price**. Keeping
them separate is what lets us show him "your cost" and "client pays" as two clearly
distinct numbers — which our research flagged as a defect we must fix.

---

## 4. Layer 1 — Takeoff: where quantities come from

### 4.1 The quantity vocabulary

Each job type has a fixed set of quantity keys. Bathroom:

| Key | Unit | Typical source |
|---|---|---|
| `floor_area` | sqft | stated / measured |
| `wall_tile_area` | sqft | derived from wet-wall dimensions |
| `ceiling_area` | sqft | = floor_area |
| `wall_paint_area` | sqft | perimeter × height − openings − tiled |
| `fixture_count.toilet` | ea | counted |
| `fixture_count.vanity` | ea | counted |
| `fixture_count.tub` / `.shower` | ea | counted |
| `plumbing_relocations` | ea | asked |
| `electrical_devices` | ea | counted |
| `door_count` | ea | counted |
| `demo_scope` | enum | asked (surface / full gut / down to studs) |

**These keys are the contract between the AI and the calculator.** The model's only
job in this layer is to fill them in. It never computes hours.

### 4.2 Four ways a quantity gets filled

In descending order of trustworthiness:

| Source | Confidence | How |
|---|---|---|
| `measured` | 0.95 | He typed a dimension, or laser/photo measure |
| `client_stated` | 0.70 | "It's about 5 by 9" |
| `derived` | = parent | Computed from another quantity (`ceiling_area = floor_area`) |
| `inferred` | 0.40 | Template typical for this job type + house vintage |
| `defaulted` | 0.25 | We had nothing; used the template median |

Confidence is **not decoration** — it drives the question engine (§9) and the
contingency (§10). This is the mechanism by which the app *knows what it doesn't know*.

### 4.3 Derivation rules (code, not AI)

Most quantities come from two or three real measurements. The rest are computed:

```
floor_area          = length × width
perimeter           = 2 × (length + width)
wall_gross          = perimeter × ceiling_height
door_deduction      = door_count × 21          # 3'0" × 7'0"
window_deduction    = Σ window areas
wall_net            = wall_gross − door_deduction − window_deduction
wet_wall_area       = shower_walls_lf × tile_height
wall_paint_area     = wall_net − wet_wall_area
ceiling_area        = floor_area
```

So **"5 by 9, 8-foot ceiling, one door"** — three facts spoken in four seconds —
produces eleven quantities. That's the "minimal typing" requirement from the field
research, satisfied by arithmetic rather than by more form fields.

### 4.4 The AI's actual job here

Given: *"Small main-floor bathroom, maybe five by nine. Rip the tub out, put in a
walk-in shower, tile the floor and the shower walls. They're buying their own vanity.
House is from the seventies."*

The model returns **only** this:

```json
{
  "job_type": "bathroom",
  "quantities": {
    "length_ft":  { "value": 5,  "source": "client_stated" },
    "width_ft":   { "value": 9,  "source": "client_stated" },
    "demo_scope": { "value": "full_gut", "source": "client_stated" }
  },
  "scope_flags": {
    "tub_to_shower_conversion": true,
    "vanity_supplied_by": "client",
    "floor_tile": true,
    "wall_tile": true
  },
  "context": { "house_vintage": "1970s" },
  "unknowns": [
    "ceiling_height", "shower_wall_lf", "tile_height",
    "subfloor_condition", "plumbing_relocations", "ventilation_exists"
  ]
}
```

No hours. No prices. No arithmetic. The schema is enforced with structured outputs,
so this is a validated object, not parsed prose.

**Then the confirm card**, in his language, before any of it counts:

> Got it — **1970s house, 5×9 bathroom, full gut, tub→shower, client's vanity.**
> Right? **[Yes] [Fix something]**

---

## 5. Layer 2 — Production rates: where hours come from

### 5.1 The rate table

One row per task, per contractor. This is his most valuable data — it *is* his
experience, written down.

```
task_code            unit    hr/unit   source   n    σ
------------------------------------------------------------
demo.bathroom.gut    sqft    0.085     seed     0    —
tile.floor.set       sqft    0.120     seed     0    —
tile.wall.set        sqft    0.155     seed     0    —
waterproof.membrane  sqft    0.055     seed     0    —
backer.board.hang    sqft    0.035     seed     0    —
plumb.rough.fixture  ea      2.50      seed     0    —
plumb.set.toilet     ea      1.25      seed     0    —
plumb.set.vanity     ea      2.50      seed     0    —
plumb.set.shower     ea      3.00      seed     0    —
elec.device.install  ea      0.75      seed     0    —
drywall.hang         sqft    0.014     seed     0    —
drywall.finish       sqft    0.025     seed     0    —
paint.two.coat       sqft    0.010     seed     0    —
vent.fan.install     ea      2.50      seed     0    —
```

> ⚠️ **These are placeholders.** They are drawn from general residential remodel
> ranges to give the system a starting point, not from measured data, and not from
> your buddy. They will be wrong for him — possibly by 30%+ in either direction. §14
> is how they get fixed. **Ship them marked "unverified" in the UI until n ≥ 3.**

### 5.2 Why hours-per-unit and not hours-per-job

Because the rate is the thing that's stable about a contractor, and the quantity is
the thing that's stable about a job. Separating them means:

- One tile rate serves every bathroom, kitchen backsplash and mudroom he ever quotes
- A 6-hour overrun teaches something reusable
- Two contractors can share templates but never share rates
- He can see and edit *his own speed*, which is a legible, ownable number in a way
  that "bathroom = 45 hours" never is

### 5.3 Mobilisation — the hours nobody counts

A solo contractor's real cost includes getting there and setting up. This is
invisible in most estimates and it's pure leak.

```
mobilisation_hours = site_visits × (drive_time × 2 + setup_teardown)
```

Default `setup_teardown` = 0.5 hr; `drive_time` from his profile (default 0.4 hr).
Visit count comes from the phase plan — a bathroom with a tile cure day and an
inspection hold is 8+ visits, not 5.

At $95/hr, two extra unplanned trips is **$247 of unbilled time.** Making this a
visible line item is one of the cheapest wins in the product.

---

## 6. Layer 3 — Adjusters: why this job is not the average job

### 6.1 The problem with one big multiplier

Our POC applies a single complexity multiplier (1.0 / 1.25 / 1.5 / 1.75) to the whole
subtotal. That's crude and it's wrong in a specific way: **a 1970s house makes demo
and rough-in harder. It does not make tile-setting harder.** Multiplying the tile line
by 1.5 because the house is old inflates the estimate in a place he can't defend, and
teaches the system nothing.

### 6.2 Decomposed adjusters

Each factor applies to **only the task groups it actually affects**:

| Adjuster | Trigger | Applies to | Effect |
|---|---|---|---|
| `access.upper_floor` | 2nd floor+ | demo, material handling | +8% |
| `access.tight_stairs` | narrow/turning stair | demo, material handling | +6% |
| `access.no_parking` | no driveway access | mobilisation only | +0.25 hr/visit |
| `vintage.pre_1980` | house age | demo, plumbing rough, electrical rough | +15% |
| `vintage.pre_1960` | house age | demo, plumbing rough, electrical rough | +25% |
| `occupied.living_in` | client staying | **fixed** +0.4 hr/visit (protect/clean) | — |
| `condition.known_water` | reported damage | demo, subfloor | +20% |
| `height.over_9ft` | ceiling > 9ft | paint, drywall, wall tile | +10% |
| `finish.premium` | client's material grade | tile, trim | +12% |

Combination is multiplicative within a task group, capped:

```
group_factor = clamp(Π(applicable adjusters), 1.0, 1.9)
```

The cap matters. Three stacking 20% adjusters would produce ×1.73 and four would
produce ×2.07 — at which point you're not estimating, you're guessing. If the cap
binds, the app says so and pushes toward a site visit.

### 6.3 Why this is better

- **More accurate** — the uplift lands where the difficulty actually is
- **Defensible** — "the demo is up because it's a 1975 house and it's on the second
  floor" is a sentence he can say to a client
- **Learnable** — each adjuster is a separate coefficient with its own evidence.
  After 15 jobs you can ask: *do his second-floor jobs actually run 8% long on demo?*
  With one blob multiplier that question is unanswerable.

---

## 7. Layer 4 — Materials, waste and packaging

### 7.1 Three numbers, not one

Most apps compute one number (how much is needed). We compute three, because the
difference between them is real money:

```
needed    = quantity                       # 140 sqft
with_waste = needed × (1 + waste_factor)   # 140 × 1.10 = 154 sqft
purchased  = ceil_to_package(with_waste)   # 13 boxes @ 12.5 = 162.5 sqft
```

He is billed for `purchased`. He plans for `with_waste`. The gap is attic stock, and
telling him about it is a small, credible act of competence:

> **Tile — 13 boxes** (162.5 sqft). You need 154 with waste, so you'll have about
> **8 sqft spare** — that's your attic stock for repairs. Ordering 12 boxes leaves
> you 4 sqft short.

### 7.2 Waste factors (seed)

| Material | Waste | Note |
|---|---|---|
| Floor tile, straight lay | 10% | |
| Floor tile, diagonal/herringbone | 15% | pattern drives waste, ask the pattern |
| Wall tile | 12% | |
| Drywall | 12% | |
| Dimensional lumber | 8% | |
| Decking | 6% | |
| Paint | 5% | |
| Thinset / grout | 8% | |

Pattern-driven waste is a real one most estimates miss. A herringbone floor is not a
straight-lay floor plus vibes — it's +5% material and roughly +25% on the setting rate.

### 7.3 Package rounding

Materials don't come in continuous units. The table needs `package_qty`:

| Material | Sold as |
|---|---|
| Tile | box (varies — read from his price list) |
| Drywall | 4×8 sheet = 32 sqft |
| Thinset | 50 lb bag ≈ 95 sqft at ¼" notch |
| Lumber | discrete lengths (8/10/12/16 ft) |
| Membrane | roll (varies) |

Lumber deserves a cut-optimiser rather than a divide: fourteen 7'2" studs out of
16-footers is 7 sticks with usable offcuts, not `ceil(14 × 7.17 / 16) = 7` by luck.
This is a small solver and it saves real money on framing jobs.

### 7.4 Where his prices come from

Priority order, highest first:

1. **His imported spreadsheet** (already built in the POC — this is a genuine asset;
   it's his real, negotiated, local pricing)
2. His manually entered price list
3. AI price assist, confirmed by him (spec §5)
4. Template default — **flagged as unverified in the quote**

Stale-price flag at 90 days, per spec §3.2.

---

## 8. Confidence and provenance

Every quantity, rate and adjuster carries where it came from. This isn't
bookkeeping — three features are impossible without it.

```ts
type Provenance = {
  value: number;
  unit: string;
  source: 'measured' | 'client_stated' | 'derived' | 'inferred' | 'defaulted';
  confidence: number;      // 0..1
  asked_at?: timestamp;    // if the user confirmed it
};
```

**What it buys us:**

1. **The question engine** (§9) needs to know what's shaky and what it's worth
2. **Contingency** (§10) is computed from unresolved uncertainty rather than picked
3. **The quote itself** can be honest: an allowance for something genuinely unknown
   is labelled as an allowance, not buried. Our research found homeowners are
   explicitly taught to distrust "miscellaneous" and "incidentals" — a *named*
   allowance with a reason does the opposite.

**Estimate-level confidence** rolls up weighted by dollar impact — a shaky number on
a $40 line doesn't matter; a shaky one on a $4,000 line does:

```
overall_confidence = Σ(confidence_i × cost_i) / Σ(cost_i)
```

Displayed as one word, not a percentage: **Solid** (>0.80) / **Reasonable** (0.60–0.80)
/ **Rough** (<0.60). A "Rough" estimate gets a bigger contingency and a nudge to go look.

---

## 9. The question engine — asking 3 questions instead of 22

### 9.1 The problem

The v2 plan has a 15–22 item checklist per job type. Asking all of them is a form,
and our field research is unambiguous: forms are how this app dies. But skipping them
loses the "never forget a line item" value prop.

### 9.2 The resolution: value of information

Every unknown gets scored on what it's *worth* asking:

```
information_value = |dollar_delta| × P(non_default) × (1 − confidence)
```

- `dollar_delta` — how much the estimate moves between the answers
- `P(non_default)` — how likely the non-default answer is, **conditioned on context
  we already have** (house vintage, job type, reported symptoms)
- `1 − confidence` — how unsure we currently are

Ask the top 3–5. Everything else takes its default and gets folded into contingency.

### 9.3 Worked scoring — the 1970s bathroom from §4.4

| Unknown | Δ$ | P(non-default) | Score | Asked? |
|---|---|---|---|---|
| Subfloor rot under tub | 1,800 | 0.35 ← *1970s + tub removal* | **630** | ✅ #1 |
| Plumbing relocation for shower | 1,400 | 0.40 ← *tub→shower conversion* | **560** | ✅ #2 |
| Ceiling height | 900 | 0.30 | **270** | ✅ #3 |
| Existing ventilation | 650 | 0.35 ← *1970s* | **228** | ✅ #4 |
| Shower wall LF / tile height | 700 | 0.25 | 175 | ✅ #5 |
| Asbestos in floor tile | 2,400 | 0.05 ← *1975 is late for it* | 120 | ⚠️ flagged, not asked |
| Window in wet wall | 500 | 0.15 | 75 | ❌ default |
| Grout colour | 0 | — | **0** | ❌ never |

**Five questions, ranked by money.** The other seventeen still exist — they're in the
model, they took defaults, and their uncertainty is priced in §10 rather than silently
ignored.

Note the asbestos row: low probability, high impact. It doesn't earn a question, but
it does earn a **flag** on the quote (*"1970s house — if the floor tile is original,
test before demo"*). Low-probability catastrophes get disclosed, not priced.

### 9.4 Why this makes it *easier*, not just cheaper

Each question is visibly attached to money:

> **Any water damage or soft spots around the tub?**
> This one's worth asking — in a house this age it's about a **1-in-3** chance, and
> it swings the quote by **~$1,800**.
> **[No, checked it] [Yes] [Not sure]**

"Not sure" is a first-class answer. It keeps the uncertainty explicit and raises the
buffer rather than forcing a false precision. That's the honest option most apps
don't offer.

---

## 10. Contingency, derived instead of guessed

### 10.1 What's wrong with the current approach

The POC has a base 15% plus a "buffer" toggle that adds 10%. It's a vibe. He can't
tell a client why it's 25%, and turning it off doesn't make the job less risky — it
just makes the quote less honest.

### 10.2 Derived contingency

```
contingency% = base(risk_class) + Σ(unresolved_unknown_i.weight)
```

| Component | Contribution |
|---|---|
| Base — new construction / simple | 8% |
| Base — standard remodel | 12% |
| Base — pre-1980 remodel | 15% |
| Base — structural / unknown-heavy | 20% |
| + Subfloor condition unknown | +4% |
| + Plumbing relocation unknown | +3% |
| + "Not sure" on any asked question | +2% each |
| + Client undecided on finishes | +3% |
| + No site visit performed | +5% |
| **Cap** | **28%** |

### 10.3 The good part: answering questions visibly lowers it

This is the best interaction in the app. He answers the subfloor question with
"No, I checked, it's solid" and watches the buffer drop from 19% to 15% — **$620 off
the quote, live.**

> **Buffer: 15%** *(was 19%)*
> You checked the subfloor — that's $620 off. Two unknowns left:
> **[Ventilation]** **[Ceiling height]**

That teaches the single most valuable estimating lesson there is — *inspection is
worth money* — without a word of instruction. It also gives him a reason to answer
questions, which solves the engagement problem the checklist created.

### 10.4 On the client side

Keep the POC's framing, which the research called possibly the best thing on the page:

> **Contingency allowance — $2,180**
> Covers surprises behind the walls. **Any unused portion comes back to you.**

Risk buffer reframed as a trust signal. Don't touch it.

---

## 11. The learning loop — getting smarter from his own jobs

### 11.1 Capture: per task, not per job

When a job closes, ask for actual hours **by phase**, not one total. A single total
teaches nothing about which rate was wrong.

Keep it to under a minute — this is the highest-friction moment in the whole product
and it's the one that makes everything else work:

> **Henderson bathroom — done. Two minutes for next time?**
> Demo — *est. 12 hrs* → **[12] [+] [−]**
> Tile — *est. 17 hrs* → **[21] [+] [−]**
> Plumbing — *est. 14 hrs* → **[14] [+] [−]**
> *…tap to adjust, swipe to skip a phase*

Bias risk to design around: he'll pattern-match to the estimate rather than recall.
Pre-filling with the estimate is the fast path but it anchors hard. Consider showing
the estimate only *after* he enters a number, and treat any phase entered exactly
equal to the estimate as low-weight evidence.

### 11.2 Update: shrinkage, not replacement

Do **not** overwrite a rate with one observation. One bad job would poison every
future quote.

```
w_prior = 5                                    # the seed counts as 5 observations
new_rate = (w_prior × prior_rate + n × observed_mean) / (w_prior + n)
```

| Jobs observed | Weight on his data |
|---|---|
| 1 | 17% |
| 3 | 38% |
| 5 | 50% |
| 10 | 67% |
| 20 | 80% |

Slow at first — which is correct, because the first observation could be a fluke —
and decisively his after a dozen jobs. `w_prior` is a tunable; lower it to 3 if the
seed table proves badly off for him.

### 11.3 Dispersion → his personal contingency

Track the spread, not just the mean. A contractor whose tile rate is consistently
0.14 needs less buffer than one who ranges 0.09–0.22 on the same task.

```
cv = σ / mean                      # coefficient of variation
personal_risk_adder = clamp(round(cv × 20), 0, 8)   # percentage points
```

After ~8 jobs this replaces part of the generic base rate with something true about
him specifically.

### 11.4 The insight card

Deterministic stats; the model only writes the sentence (per the architecture rule):

> **Your last 3 bathrooms ran 22% over on tile.**
> Your rate says 0.12 hr/sqft; you're actually running **0.15**. On a typical
> 140 sqft floor that's **4 hours — about $400 a job.**
> **[Update my rate to 0.15] [Leave it]**

Never auto-applied. He owns his numbers.

### 11.5 "This looks like a job you've done"

Once there are ~10 closed jobs, the fastest path stops being the template and starts
being his own history. Match on job type + size band + vintage + scope flags:

> This looks a lot like **Henderson (Apr 2026)** — 5×9, 1970s, tub→shower.
> That one came in at **$19,400** and ran **4 hours over on tile**.
> **[Start from that job] [Start fresh]**

This is the endgame for "easy": the best estimate for the next bathroom is the last
bathroom, corrected. No template can compete with that, and no competitor has his
history.

---

## 12. The underquote guardian

Deterministic checks. The model only phrases the warning.

| Check | Trigger | Severity |
|---|---|---|
| Margin below target | `margin < profile.target` | High |
| Margin below survival | `margin < 8%` | **Critical** |
| Missing common line item | assembly item absent and not dismissed | High |
| No contingency on old house | `vintage < 1980 && contingency < 12%` | High |
| Complexity looks low | `vintage < 1980 && access_adjusters == none` | Medium |
| Rate below his own floor | `rate < profile.computed_floor` | **Critical** |
| Hours below his own history | `est_hours < 0.75 × his mean for this job type` | High |
| Unverified rates on big job | `total > $10k && rates with n=0` | Medium |
| Stale material prices | any price > 90 days old | Medium |

### The one that matters most

Our research identified markup/margin confusion as *"the single most valuable thing we
could fix"* — a 20% markup yields a 16.7% margin, and on a $100k job that's $3,300
gone. So the guardian's headline check is margin, in plain words, both numbers shown
and labelled:

> **This lands at 14% margin.** Your target is 20%.
> Your cost **$16,400** · client pays **$19,100** · you keep **$2,700**.
> *(You applied a 16% markup — markup and margin aren't the same number.)*
> One bad week and this job is underwater.
> **[Reprice to 20%] [Send anyway]**

"Send anyway" always exists, and logs a reason. He's the contractor; the app is not
his boss. But the number is never hidden.

---

## 13. Three depths of estimate

One flow, three exit points. He picks by how much the job is worth to him.

| | **Ballpark** | **Quote** | **Site visit** |
|---|---|---|---|
| Time | 60 seconds | 8–10 min | 30 min + visit |
| Input | job type + size | + 3–5 ranked questions | + measurements + photos |
| Confidence | Rough | Reasonable | Solid |
| Contingency | 22–28% | 12–18% | 8–12% |
| Output | **a range**, phone-friendly | fixed price, itemised PDF | fixed price + photo record |
| Use | the first phone call | the normal path | $15k+ or gut jobs |

**Ballpark must output a range and must never become the quote.** Our research is
explicit that ranges are the industry's core conflict — homeowners hear the low end
as firm. So the ballpark is deliberately not sendable; it's a talking number for the
phone, labelled as such, and converting it to a real quote requires the questions.

That's a guardrail, not a limitation: the failure mode we're preventing is him
reading a 60-second number over the phone and being held to it.

---

## 14. Calibration protocol — how the seed numbers get replaced

**This section is the difference between a working product and a plausible-looking
one.** The seed rates in §5.1 are unvalidated. Here's how they become real.

### Step 1 — Back-cast against jobs he's already done (before writing any UI)

Take **8–10 of his completed jobs**. For each, you need what he actually billed and
roughly how long each phase took. Then:

1. Enter the job's quantities into the model
2. Run the engine with seed rates
3. Compare estimated hours vs his actual hours, **per phase**
4. Compute the ratio per task code

If `tile.floor.set` comes back consistently at 1.3× across six jobs, the seed is wrong
and his real rate is ~0.156. Fix the seed *before* he ever sees it.

**Target: engine total within ±15% of his actual on 7 of 10 back-cast jobs.** Below
that, the templates aren't ready and shipping them will burn his trust on the first
quote.

### Step 2 — Sit with him and argue about the assembly lists

The completeness checklist matters more than the rates — a missing line is a 100%
error. Go through each template line by line and ask:

- What's missing?
- What do you *always* forget?
- What did the last job teach you that isn't in here?

The spec already names this: *"their field knowledge is your actual moat."* This is a
half-day at a kitchen table with a printout, not a research task.

### Step 3 — Shadow mode for the first 5 real quotes

He quotes the way he normally does. The app quotes in parallel. Compare before he
sends. He always wins the disagreement, and every disagreement is a data point.

### Step 4 — Gate the confidence display on evidence

Until `n ≥ 3` on a task code, the UI says the number is unverified:

> **Tile — 17 hrs** · *starting estimate, not yet calibrated to your work*

Honest, and it makes the learning loop legible from day one — he can watch "unverified"
disappear as he closes jobs.

### Step 5 — Never ship a rate table to a *second* contractor untouched

Rates are personal. A new user gets the seed table plus an onboarding path that
back-casts 2–3 of *his* past jobs before his first real quote. That onboarding is
also the best possible demo: *"tell me about a job you already did, and I'll show you
what I'd have quoted."*

---

## 15. Worked example, end to end

**Input** (spoken, 11 seconds):

> *"Small main-floor bathroom, about 5 by 9. Ripping the tub out for a walk-in
> shower, tiling the floor and shower walls, client's buying their own vanity.
> House is mid-seventies."*

### Layer 1 — Takeoff

| Quantity | Value | Source | Conf |
|---|---|---|---|
| floor_area | 45 sqft | client_stated | 0.70 |
| ceiling_height | 8 ft | **asked → answered** | 0.95 |
| perimeter | 28 LF | derived | 0.70 |
| shower_wall_lf | 12 LF | **asked → answered** | 0.95 |
| wall_tile_area | 96 sqft | derived (12 LF × 8 ft) | 0.95 |
| wall_paint_area | 128 sqft | derived | 0.70 |
| ceiling_area | 45 sqft | derived | 0.70 |
| fixtures | WC 1, vanity 1, shower 1 | client_stated | 0.85 |
| plumbing_relocations | 1 | **asked → answered** | 0.95 |
| subfloor_condition | sound | **asked → "checked, solid"** | 0.90 |
| ventilation_exists | no → add fan | **asked → answered** | 0.95 |

Five questions asked. Everything else derived or defaulted.

### Layer 2 — Hours

| Task | Qty | Rate | Base hrs |
|---|---|---|---|
| demo.bathroom.gut | 45 sqft | 0.085 | 3.8 |
| plumb.rough.fixture | 3 ea | 2.50 | 7.5 |
| plumb.relocate | 1 ea | 4.00 | 4.0 |
| elec.device.install | 3 ea | 0.75 | 2.3 |
| vent.fan.install | 1 ea | 2.50 | 2.5 |
| backer.board.hang | 96 sqft | 0.035 | 3.4 |
| waterproof.membrane | 108 sqft | 0.055 | 5.9 |
| tile.floor.set | 45 sqft | 0.120 | 5.4 |
| tile.wall.set | 96 sqft | 0.155 | 14.9 |
| grout.seal | 141 sqft | 0.020 | 2.8 |
| drywall.patch | 60 sqft | 0.039 | 2.3 |
| paint.two.coat | 173 sqft | 0.010 | 1.7 |
| plumb.set.toilet | 1 ea | 1.25 | 1.3 |
| plumb.set.vanity | 1 ea | 2.50 | 2.5 |
| trim.punch | 1 job | 4.00 | 4.0 |
| **Subtotal** | | | **64.3** |

### Layer 3 — Adjusters

| Adjuster | Applies to | Effect |
|---|---|---|
| `vintage.pre_1980` +15% | demo, plumb rough, elec rough | +2.7 hrs |
| `access.upper_floor` | — *(main floor)* | — |
| `occupied.living_in` +0.4 hr/visit × 7 | mobilisation | +2.8 hrs |
| mobilisation 7 visits × (0.8 drive + 0.5 setup) | — | +9.1 hrs |
| **Total hours** | | **78.8** |

**Labour: 78.8 × $95 = $7,489**

### Layer 4 — Materials

| Item | Needed | +waste | Purchased | Cost |
|---|---|---|---|---|
| Floor tile | 45 sqft | 49.5 | **4 boxes** (50 sqft) | $340 |
| Wall tile | 96 sqft | 107.5 | **9 boxes** (112.5) | $765 |
| Membrane kit | 108 sqft | — | 1 kit | $812 |
| Backer board | 96 sqft | 107.5 | **4 sheets** | $148 |
| Thinset | 141 sqft | — | **2 bags** | $84 |
| Grout + seal | — | — | — | $95 |
| Shower valve/head/door | 1 | — | — | $948 |
| Plumbing rough materials | — | — | — | $615 |
| Vent fan + duct | 1 | — | — | $210 |
| Electrical | — | — | — | $180 |
| Paint + drywall | — | — | — | $140 |
| Dumpster + disposal | — | — | — | $420 |
| Protection + consumables | — | — | — | $110 |
| **Materials at cost** | | | | **$4,867** |

*(Vanity excluded — client-supplied. Flagged on the quote so there's no dispute later.)*

### Pricing

```
Labour          78.8 hrs × $95              $7,489
Materials at cost                           $4,867
Material markup (tiered 40/30/20%)         +$1,478
                                           -------
Work subtotal to client                    $13,834
Contingency 15%                            +$2,075
                                           -------
Raw total                                  $15,909
Rounded (smart, nearest $100)              $15,900
```

**One spoken sentence and five tap-answers → a defensible, itemised quote.** That's
the product.

> ### ⚠️ Open question: what counts as "cost"?
>
> I deliberately stopped before printing a margin figure, because the answer depends
> on two conventions that **aren't settled yet — and both change the number
> materially.** Since the entire underquote guardian (§12) triggers on margin, this
> has to be resolved before that ships.
>
> **1. How much of a billed hour is actually cost?**
> The $95/hr rate is a *billing* rate — the wizard builds it as
> `(income + overhead + taxes) ÷ 1,400 × 1.2`, so it already contains his wage,
> overhead recovery and a profit loading. Counting the full $95 as "cost" understates
> margin badly. The POC currently hard-codes `cost = labour × 0.62`, and the code
> comment says outright that it's a demo placeholder. Whatever replaces it should be
> derived from the same wizard inputs that built the rate, not a magic constant.
>
> **2. Is contingency profit?**
> The client-facing quote says *"any unused portion comes back to you"* — which is
> the best line on the page and we're keeping it. But that promise means contingency
> **cannot be counted as margin**: it's held against risk, and returned if unspent.
> Counting it as profit would show him a margin he hasn't earned yet and might have
> to give back.
>
> On this job the two conventions swing the reported margin between roughly **20% and
> 31%** — one of those numbers fires the guardian and one doesn't. **Settle this
> against the consult document before P4.**

---

## 16. What's deterministic vs what's AI

The architecture rule from the v2 plan, made concrete. **If it touches a number, it's
code.**

| Step | Owner | Why |
|---|---|---|
| Parse speech → quantity keys | **AI** | Messy human language is exactly what it's for |
| Infer missing quantities from context | **AI** *(as suggestion)* | Judgment, but always confirmed |
| Geometry derivations | **Code** | Arithmetic |
| Rank which questions to ask | **Code** | Deterministic VOI scoring |
| Phrase the question in plain English | **AI** | Voice |
| Hours = qty × rate × adjusters | **Code** | Never let a model multiply |
| Waste, package rounding, cut optimisation | **Code** | Arithmetic |
| Markup, margin, contingency, total | **Code** | Never let a model near money |
| Decide a warning should fire | **Code** | Thresholds |
| Phrase the warning like a foreman | **AI** | Voice |
| Client scope description, value paragraph | **AI** | Prose is the job |
| Variance stats after a job | **Code** | Arithmetic |
| Write the insight card sentence | **AI** | Voice |
| Update a production rate | **Code** *(he confirms)* | His numbers |

**Every AI output that becomes a number passes through a confirm card first.** That's
what makes cheap models safe here — and it's the same property that lets us run
extraction on a low-cost model without risking the quote.

---

## 17. Data model

```sql
-- His speed at each task. The most valuable table in the system.
production_rate(
  id, contractor_id, task_code, unit,
  hours_per_unit        numeric,
  source                enum('seed','observed','manual'),
  sample_count          int default 0,
  stddev                numeric,
  updated_at            timestamptz
)

-- Job templates. Shared across contractors, versioned so old quotes don't move.
assembly(id, job_type, version, name)

assembly_line(
  assembly_id, task_code,
  quantity_expr         text,      -- 'floor_area', 'shower_wall_lf * tile_height'
  include_when          text,      -- 'scope_flags.wall_tile == true'
  commonly_missed       bool,      -- drives the "did you forget?" prompt
  sort_order            int
)

-- Per-estimate quantities with provenance.
takeoff(
  estimate_id, quantity_key,
  value numeric, unit text,
  source     enum('measured','client_stated','derived','inferred','defaulted'),
  confidence numeric,
  asked_at   timestamptz
)

-- Which adjusters fired, so the learning loop can evaluate them individually.
estimate_adjuster(estimate_id, adjuster_code, factor, applied_to_groups text[])

-- Closed-job feedback, per phase. Without this nothing learns.
actuals(
  estimate_id, task_code,
  estimated_hours numeric, actual_hours numeric,
  entered_at timestamptz, note text
)

-- Every question shown: what we asked, what it was worth, what he said.
-- This is how the question engine gets tuned.
question_log(
  estimate_id, unknown_key,
  information_value numeric, dollar_delta numeric, p_non_default numeric,
  was_asked bool, answer text, answered_at timestamptz
)
```

Two notes:

- **`assembly` is versioned.** When a template improves, old quotes must not silently
  change. Freeze the version on the estimate.
- **`question_log` earns its place.** After a few hundred estimates you can check
  whether your `P(non_default)` priors were right — e.g. does subfloor rot actually
  show up in ~35% of pre-1980 tub removals? That's how the question engine improves,
  and it costs one insert per question to collect.

---

## 18. Build sequence

**P0 — Prove the engine offline (do this before any UI).**
Rate table + assemblies + the four layers as a pure TypeScript module. Unit tests
using the consult document's fixtures ($95/hr, the $9,395 bathroom baseline). Then
run §14 Step 1: back-cast 8–10 of his real jobs and tune until you're within ±15% on
7 of them. **If you can't hit that, nothing built on top matters.**

**P1 — Takeoff + confirm card.** Speech → quantity keys → confirm. Geometry
derivations. Still no questions, defaults for everything.

**P2 — Question engine.** VOI ranking, top 5, "not sure" as a first-class answer,
live contingency response (§10.3). This is the moment the app feels smart.

**P3 — Materials, waste, packaging.** Wire in the spreadsheet import that already
exists in the POC. Cut optimiser for framing/decking.

**P4 — Guardian + margin/markup fix.** Deterministic checks, both numbers labelled.
This is a correctness fix to a defect the research already identified — don't defer it.

**P5 — Actuals capture.** The 60-second close-out screen. Nothing learns until this
ships, so it's earlier than it feels.

**P6 — Learning loop.** Shrinkage updates, dispersion → personal contingency, insight
cards, similar-job matching.

**P7 — Site-visit depth.** Photo attachment to takeoff items, measurement capture.

---

## 19. Open questions and known risks

**Open — needs resolving in the docs, before P4:**

0. **What counts as cost, and is contingency profit?** See the boxed note at the end
   of §15. The two conventions swing this job's reported margin between ~20% and ~31%,
   and the guardian fires on margin. This is the highest-priority open item in the
   whole document — everything else is a refinement; this one can make the guardian
   either useless or a nuisance.

**Open — need your buddy to answer:**

1. **Does he think in sqft or in jobs?** If he genuinely estimates "a bathroom is
   about two weeks," the per-unit model may be a harder sell than I think, and the UI
   needs to hide the rates behind a phase-level view.
2. **Crew size.** Everything above assumes solo or a fixed crew. Two guys on tile isn't
   half the hours — is there a productivity factor, and does he even vary it?
3. **How does he handle subs?** Sub quotes are a pass-through with their own markup and
   their own risk of coming in late. Not modelled here at all.
4. **What's his actual visit count on a bathroom?** Mobilisation is a real cost line
   and I've guessed 7. That number should come from him.
5. **Does he price by the job or by the room?** Multi-room jobs share mobilisation and
   demo setup — the engine currently would double-count that.

**Known risks:**

| Risk | Mitigation |
|---|---|
| **Seed rates are wrong for him** — most likely failure | §14 back-cast before he sees anything; "unverified" labels until n≥3 |
| Actuals capture never happens → nothing learns | Make it 60 seconds, prompt at job close, accept partial data |
| Actuals are anchored to the estimate | Don't pre-fill; treat exact matches as weak evidence |
| VOI priors are guesses | `question_log` collects the evidence to fix them |
| Adjusters double-count with contingency | Adjusters price *known* difficulty; contingency prices *unknowns*. Audit that no factor appears in both |
| Template drift breaks old quotes | Version assemblies; freeze on estimate |
| Over-engineering before validation | P0 is a pure module with tests. If the back-cast fails, stop and fix the model, don't build UI on a broken engine |

---

## Appendix — why not just use RSMeans-style published data?

Published unit-cost databases exist and are more rigorous than the seed table here.
Two reasons they're not the answer for this product:

1. **Licensing and regional fit.** They're commercial, priced for commercial GCs, and
   calibrated to a labour market that isn't a solo residential remodeler in his town.
2. **It's the wrong moat.** Our differentiator is *his* numbers getting better over
   time — the thing no competitor can copy, because they don't have his job history.
   Published data is a better *seed*, not a better *system*.

Worth revisiting as a seeding source if the back-cast in §14 shows the hand-seeded
table is badly off across multiple contractors. It would improve the starting point
for new users, which is exactly where the system is weakest.
