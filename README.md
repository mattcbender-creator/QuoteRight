# QuoteRight

**A guided estimating app for small residential contractors** — it turns a contractor's own
prices, labor rate, and markup into fast, complete, professional quotes, and stops them from
underquoting.

> Working name. Placeholder brand: **QuoteRight**. The product concept is a "foreman in your
> pocket": the contractor describes a job like he'd talk to a buddy, the app asks the right
> questions, applies his real rates and a proven pricing methodology, and hands him a quote he
> trusts.

## Status

Early proof-of-concept. What exists today:

- **`index.html`** — an interactive, tap-through **demo** of the estimate flow (home → talk →
  confirm → questions → AI-priced materials → full estimate → confidence check → sent). It's a
  visual mockup: everything is hardcoded and nothing is saved. This is the thing you can hand to
  a contractor to tap through on their phone.
- **`docs/`** — the product spec, build plans, methodology guide, and market research that
  define where the working app is headed.

The real app (Next.js PWA + pricing engine + AI intake) has **not** been built yet — the build
plans in `docs/` describe how to build it.

## Run the demo

It's a single static file. Any of these work:

```bash
# Simplest: just open it
open index.html            # macOS  (use `xdg-open index.html` on Linux)

# Or serve it locally
npx http-server -p 8080 -c-1
# then visit http://localhost:8080
```

### Deploy the demo (Railway)

The included `Dockerfile` serves `index.html` with `http-server` on port `8080` — a normal
Dockerfile-based deploy. Point Railway (or any container host) at this repo and it will build and
serve the demo; set the service's target port to `8080`.

## Docs

Everything that defines the product lives in [`docs/`](docs/):

| File | What it is |
| --- | --- |
| [`docs/contractor-estimator-app-spec.md`](docs/contractor-estimator-app-spec.md) | Product spec v1 — who it's for, MVP feature set, data model, roadmap, risks. |
| [`docs/pricing-model.md`](docs/pricing-model.md) | **How pricing works** — typed line items (unit / labour / material / pass-through), where the risk layer applies, tax, and payment milestones. Written against a working electrician's real estimator, which prices off a unit catalogue rather than by build-up. |
| [`docs/build-plan-v2-working-app.md`](docs/build-plan-v2-working-app.md) | Current build plan for the working app (Next.js + Railway + OpenRouter). "AI is the interface, code is the calculator." Phased P0–P8. |
| [`docs/poc-build-plan-claude-code.md`](docs/poc-build-plan-claude-code.md) | POC build plan with milestone-by-milestone prompts for Claude Code. Encodes the exact pricing business logic. |
| [`docs/confident-contractor-guide.pdf`](docs/confident-contractor-guide.pdf) | The "Confident Contractor" methodology guide — the source-of-truth "consult" document the pricing engine implements (rate calc, tiered markups, complexity multipliers, contingency, confidence check). |
| [`docs/research/contractor-needs-and-jobs.md`](docs/research/contractor-needs-and-jobs.md) | **Who we're building for** — what jobs contractors actually get paid for, what estimating really costs them, where margin leaks, why they abandon software, and the field constraints the UI has to survive. |
| [`docs/logo-brief-and-prompts.md`](docs/logo-brief-and-prompts.md) | Logo brief, five concept directions, and paste-ready AI image prompts + how to judge the results. |
| [`docs/research/viability-review-estimating-app.md`](docs/research/viability-review-estimating-app.md) | Market viability review of the low-cost estimating-app idea (competitors, pricing, the live-pricing-data problem). |
| [`docs/research/better-fit-opportunities-solo-dev.md`](docs/research/better-fit-opportunities-solo-dev.md) | Adjacent opportunity research for a solo AI dev serving small contractors. |

## The core idea, in one place

- **Never forget a line item.** Every job type has a built-in assembly/checklist (demo,
  disposal, permits, waterproofing, waste factor, contingency…).
- **His numbers, not generic data.** Labor rate, markup, and material prices belong to the
  contractor and persist across jobs.
- **Deterministic money.** All pricing math is plain code implementing the methodology guide; the
  AI only understands messy input, asks the next question, and explains numbers in plain
  language — it never invents a price.
- **Built for tech-averse users.** One thing per screen, talk instead of type, huge tap targets,
  nothing ever lost.

See the spec and build plans in `docs/` for the full picture.
