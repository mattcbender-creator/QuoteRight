# Who We're Building For — Contractor Research

*Compiled Aug 2026. Sources at the end. Everything here is desk research —
it points at what to ask real contractors, it does not replace asking them.*

---

## TL;DR — the five findings that should drive the product

1. **The job types in the demo are the right ones.** Bathroom is the single most
   common remodel job in America, kitchen is second. We led with the correct two,
   and the NAHB ranking gives us the next ones to add.
2. **The pitch is unpaid hours, not "faster quotes."** A detailed estimate takes
   **2–8 hours**, and contractors win roughly **1 in 6**. That's **12–48 unpaid
   hours per won job.** That's the number to put in front of a contractor.
3. **Contractors lose money by confusing markup with margin** — a 20% markup is
   only a 16.7% margin. This is a documented, widespread, expensive error, and
   our app currently shows a "cushion" without ever clarifying which it is. **This
   is a product bug waiting to happen and the single most valuable thing we could
   fix.**
4. **Software dies in the field, not in the demo.** 47% of contractors say getting
   people to actually use new tech is their #1 challenge — ahead of cost. Tools get
   abandoned when they're "built for the office and handed to the field."
5. **Margins are thinner than outsiders assume.** NAHB's *best* remodelers averaged
   under 4% net profit, and below 8% net margin **one bad job puts you in the red.**
   That is the entire justification for the underquote guardian.

---

## 1. What jobs do they actually do?

From NAHB's 2025 survey of professional remodelers — how common each project is,
scored 1–5:

| Rank | Project | Score | % rating it common | In our demo? |
|---|---|---|---|---|
| 1 | **Bathroom remodel** | 4.1 | 73% | ✅ built |
| 2 | **Kitchen remodel** | 3.9 | — | ✅ built |
| 3 | **Whole-house remodel** | 3.5 | — | ⚠️ "Something else" |
| 4 | Room addition | — | 42% | ❌ |
| 5 | Window / door replacement | — | 35% | ❌ |

Homeowner-side surveys rank things differently, because they count small
self-directed jobs the pros never bid:

- **Interior painting** — most popular renovation of 2025 (Angi)
- Painting 43%, outdoor living 39%, bathroom 38%, landscaping 34% (Great Day)
- 67% of renovating homeowners did interior room remodeling (Statista)
- **54% of homeowners renovated in 2025**

**Read:** our bathroom-and-kitchen-first instinct matches what *professionals*
get paid for. The homeowner data is a caution — painting and outdoor living are
high-volume but often low-ticket or DIY, so they're not necessarily where a
quoting tool earns its keep.

**Next templates to build, in order:** whole-house/multi-room, room addition,
window & door replacement. Deck and framing (already built) don't appear in the
NAHB top five — worth confirming they're actually what your buddy quotes most,
or reprioritising.

---

## 2. The estimating problem — the real numbers

- A detailed estimate takes **2–8 hours**; some contractors report **4–20 hours**
  on a single bid. Large complex jobs can take a week.
- Typical win rate cited in contractor forums: **1 in 6**.
- A contractor winning 1 in 6 "absorbs the cost not only of their winning estimate
  but also of the five free estimates they didn't win."
- Clients expect the drive-out, the walk-through, the options discussion and a
  written bid — **for free**. That's easily 2 hours before any pricing work starts.
- Knock-on effect: contractors **deliberately under-invest in bids they think
  they'll lose**, producing worse estimates on long-shot jobs — which then lose,
  confirming the belief.

**Product implication.** The headline benefit is not "professional-looking quotes."
It's *"stop giving away 12–48 unpaid hours per job you win."* Speed on the losing
bids matters as much as quality on the winning ones — a fast, complete quote makes
long-shot bids cheap enough to do properly.

---

## 3. Where the money actually leaks

**Margins are thin.**

- Remodeler net profit commonly **10–18%**; markups typically **30–45%**.
- But NAHB reported their **"best" remodelers averaged under 4% net profit.**
- **Below 8% net margin, one bad job puts you in the red.**

**The markup/margin trap — the most actionable finding in this document.**

> Aiming for a 20% profit margin but applying a 20% *markup* leaves you at a
> **16.7% margin**. On a $100,000 job that's **$3,300 gone.** At a 10% markup, the
> real margin is **9.1%** — before overhead.

Many contractors use "standard" markup numbers heard from other contractors
without ever checking what margin those actually produce.

**Why remodels carry more risk than new builds:** scope is harder to predict,
access is worse, surprises are normal. This is exactly what our complexity
multiplier and contingency engine exist to price.

### ⚠️ What this means for QuoteRight — a real defect

Our app applies **markup** on materials (+40/30/20% on cost) and then shows a
figure labelled **"Built-in cushion — 53%."** That number is neither a clean
markup nor a margin, and a contractor will read it as margin. Given that
markup/margin confusion is a documented way contractors lose thousands, **a
guided estimating app that blurs the two is doing harm.**

**Recommended fix:** show both, explicitly labelled, and teach the difference in
one plain sentence:

- **Your cost** — what you pay out
- **Client pays** — the quote
- **Your margin — X%** (profit ÷ price) ← the number that decides if you eat
- **Markup applied — Y%** (profit ÷ cost) ← the number you punch in

Plus a target-margin warning: *"This quote lands at 14% margin. Your target is
20%. One bad week puts this job underwater."*

---

## 4. Why contractors abandon software (how we lose)

- **47% of contractors** say getting employees to use new technology is their
  single biggest challenge — **ahead of cost or integration** (AGC 2024).
- Adoption fails when software is treated as "an IT install instead of a change in
  how people work."
- Field crews **revert to familiar tools under deadline pressure** — a spreadsheet
  feels safer than an unproven platform, even when the platform saves real time.
- Tools get abandoned because they're **"built for the office and handed to the
  field"** — they add a login and give the crew nothing back.
- Contractors juggle dozens of point solutions, each with its own login and
  learning curve. Subs working for several GCs may face three or four systems.

**Product implications**

| Finding | What we do about it |
|---|---|
| Reverts under deadline pressure | The tool must be *faster than the spreadsheet on the worst day*, not just better on a good one |
| "Adds a login, gives nothing back" | Give value on the very first screen, before any account exists — our demo already does this |
| Too many logins | Magic-link or no login at all for the POC. **Never** a password |
| Built for office, handed to field | Every screen must survive a driveway on a phone — this is the design bar, not a nice-to-have |

---

## 5. Field reality — the design constraints

Direct from field-software guidance, and it reads like a spec for our UI:

> "Designed for the reality of construction work: someone wearing work gloves,
> standing on a roof, in direct sunlight, with spotty cell service."

- **Large touch targets** — not buttons sized for a mouse
- **Minimal typing** — dropdowns, photo capture, tap-to-confirm over text fields
- **Glove-compatible** touch; **sunlight-readable** text
- **Offline is mandatory** — signal drops constantly; save and sync later
- **Battery-aware** — limit background work and heavy GPS
- **Mobile-first ≠ mobile-responsive.** Responsive means you *can* see it on a
  phone. Mobile-first means the phone workflow came first and desktop is secondary.

**Scorecard for our current demo**

| Requirement | Status |
|---|---|
| Large touch targets | ✅ 44px+ everywhere, CTAs 60–72px |
| Sunlight-readable | ✅ all text ≥4.5:1 contrast (we rejected the mockup's 1.76:1 labels) |
| Minimal typing | ⚠️ tap-to-confirm on most screens, but intake is still four text fields |
| Glove-friendly | ⚠️ number inputs are small targets — the weakest spot |
| Offline | ❌ **not implemented** — localStorage persists, but no service worker |
| Mobile-first | ✅ built phone-first from the start |

**Biggest gaps: offline support, and the small number inputs.**

---

## 6. What clients want to see (drives the quote sheet)

- **Homeowners want certainty.** Fixed price lets them budget without fear of
  overruns.
- **Ranges cause the industry's core conflict**: homeowners hear a range as firm;
  contractors mean it as approximate. A range is also heard at its low end, so
  anything above later feels like a bait-and-switch.
- **Vague lump sums are a documented red flag** homeowners are actively taught to
  distrust — as are the words "miscellaneous" and "incidentals" with no explanation.
- **Itemised quotes build trust faster than lump sums.**
- **Precise-looking prices out-perform round ones** — buyers read oddly specific
  numbers as carefully calculated. One documented test: **$14,975 beat $15,000.**
  But to-the-dollar on a five-figure job reads machine-generated; a deliberate
  increment ($25/$100) keeps the calculated feel without false precision.
- Homeowners also weigh **schedule reliability and warranty strength**, not price
  alone.

**Our quote sheet already does this well:** itemised, plain-English scope groups,
no "miscellaneous," fixed total, warranty/timeline/insured blocks, and the
contingency framed as *"any unused portion comes back to you"* — which converts
our risk buffer into a trust signal. **Keep that line. It may be the best thing
on the page.**

---

## 7. What to ask your contractor (this is what desk research can't answer)

1. Of your last 10 quotes — what were they, and how many did you win?
2. How long does one estimate actually take, start to finish? Where does the time go?
3. What's your hourly rate, and how did you land on it?
4. What markup do you use — and do you know what margin that gives you?
5. What's the last job you lost money on, and why?
6. What do you do *after* the quote is accepted? (ordering, scheduling — where's the next pain?)
7. What software have you tried and stopped using? Why did you stop?
8. Do you quote from the truck, the kitchen table, or at 9pm on the couch?

---

## Caveats

- Vendor-published numbers (win rates, time-per-bid, adoption stats) are
  directional; several come from companies selling estimating software.
- Time-per-bid and 1-in-6 win rates come from contractor forums, not a controlled
  survey. Treat as anecdotal-but-consistent.
- NAHB rankings cover **professional remodelers in the US**; Canadian mix and any
  single contractor's mix will differ.
- Homeowner-survey project rankings mix DIY with professionally contracted work.
- Margin figures vary widely by trade, region and year.

---

## Sources

- [NAHB — Top Remodeling Projects 2025](https://www.nahb.org/blog/2026/02/top-remodel-projects-2025)
- [Eye On Housing — Bathroom Remodeling Most Common Project 2025](https://eyeonhousing.org/2026/01/bathroom-remodeling-is-most-common-project-in-2025/)
- [Statista — Renovations among U.S. homeowners 2025](https://www.statista.com/statistics/449541/frequency-of-renovations-among-homeowners-who-renovated/)
- [Great Day Improvements — 2026 State of American Home Renovation](https://www.greatdayimprovements.com/home-advice/american-home-renovation-report/2026/)
- [Blaze Estimating — How Long Does a Construction Estimate Take](https://blazeestimating.com/how-long-does-a-construction-estimate-take/)
- [Mike Holt Forums — Charging for estimates](https://forums.mikeholt.com/threads/charging-for-estimates-is-not-working.60142/post-995114)
- [Buildern — Construction Profit Margin vs Markup](https://buildern.com/resources/blog/construction-profit-margin-vs-markup/)
- [BuildBook — Remodeling Contractor Profit Margins](https://buildbook.co/blog/remodeling-contractor-profit-margins)
- [Markup and Profit — How Much Should a Contractor Charge](https://www.markupandprofit.com/articles/how-much-should-a-contractor-charge/)
- [Beam AI — Why Construction Software Adoption Fails](https://www.ibeam.ai/blog/why-construction-software-fails)
- [Remato — Why Crews Abandon Construction Software](https://remato.com/blog/mobile-first-construction-software-adoption/)
- [VeilSun — Construction's Software Graveyard](https://www.veilsun.com/blog/constructions-software-graveyard-why-so-many-tools-get-abandoned)
- [Knowify — What makes a mobile app work for a trade contractor crew](https://knowify.com/resources/mobile-app-trade-contractor/)
- [Jobkore — The Contractor's Phone Is the Office](https://getjobkore.com/blog/contractor-mobile-app/)
- [Hopedale Builders — Fixed Price vs Cost Plus](https://www.hopedalebuilders.com/blog/fixed-price-vs-cost-plus-contractor-estimates)
- [Projul — Itemized vs Lump Sum Estimates](https://projul.com/blog/itemized-estimates-pros-cons/)
- [Home Contractor Authority — Contractor Red Flags](https://homecontractorauthority.com/home-contractor-red-flags/)
- [SmallBizClub — Psychological Pricing Tactics](https://smallbizclub.com/sales-and-marketing/business-leaders-share-their-top-psychological-pricing-tactics/)
