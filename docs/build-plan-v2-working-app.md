# Build Plan v2 — "The Confident Contractor" App (Working Product)
### AI-guided estimating for small residential contractors. Railway + OpenRouter edition.

**Product in one line:** The contractor talks about the job like he'd talk to a buddy; the app asks the right questions, fills in the site checklist, applies his real rates and proven pricing rules, and hands him a professional quote he trusts.

---

## 1. The golden architecture rule

**AI is the interface. Code is the calculator.**
- The LLM's only jobs: understand messy human input, ask the next right question, extract structured data (JSON), draft client-facing text, and explain numbers in plain language.
- All pricing math (rates, tiered markups, complexity multipliers, contingency, totals) is deterministic TypeScript implementing the consult formulas. The LLM never adds, multiplies, or invents a price.
- Every AI extraction is shown to the user for one-tap confirmation before it enters the estimate.

This makes cheap models safe: extraction and conversation are exactly what low-cost open models do well, and any model mistake is visible and correctable before it touches money.

## 2. Stack (your accounts)

- **App:** Next.js (App Router), mobile-first PWA ("Add to Home Screen" → feels like a native app, no app store).
- **Hosting:** Railway — one project with three services: web (Next.js), Postgres (Railway plugin), and a small worker for PDF generation. Set up a staging environment + production.
- **DB/ORM:** Railway Postgres + Prisma.
- **Photo storage:** Cloudflare R2 (free tier) or a Railway volume; R2 preferred (cheap, S3-compatible).
- **AI:** OpenRouter (OpenAI-compatible API).
  - Dev/testing: `:free` models ($0/token, rate-limited ~20 req/min, 200/day — plenty for building).
  - Production default: a cheap fast model (Gemini Flash-class / DeepSeek / Qwen / Llama tier, ~$0.05–0.30 per M tokens). Append `:floor` to auto-route to the cheapest provider; set `max_price` as a hard ceiling.
  - Config: model name in an env var (`AI_MODEL`, `AI_MODEL_FALLBACK`) so you can swap models without code changes. Add one mid-tier fallback for when the cheap model returns invalid JSON twice.
  - All calls request JSON via structured output; validate with Zod; on validation failure, retry once, then fall back, then degrade gracefully to the manual form.
  - Log tokens + cost per request to Postgres from day one.
- **Voice input:** browser Web Speech API for dictation (free, on-device on most phones). Contractors talk faster than they type.
- **Auth:** email magic link (no passwords — passwords are where tech-illiterate users quit). NextAuth or Lucia.
- **PDF:** server-side HTML→PDF in the worker service.

## 3. Where the AI actually lives (features)

### 3.1 Conversational job intake ("Tell me about the job")
Big mic button + text box. He says: *"Full bathroom gut in a 1975 house, tub to shower conversion, client supplying the vanity, tight second-floor access."*
AI extracts → job_type: bathroom, complexity_hint: high (pre-1980 + tight access), scope flags (tub_to_shower: true, vanity_supplied_by: client), open questions list.
App shows a confirm card: "Got it — 1970s house, full gut, tub→shower, client's vanity. Right?" [Yes] [Fix something]
Then AI asks ONLY the checklist questions still unanswered, one at a time, in plain language ("Any signs of water damage on the floor?" with Yes/No/Not sure buttons).

### 3.2 Smart site visit (photos + checklist)
Camera-first flow: "Take a photo of each corner." Photos attach to checklist items. Optional (phase 2): send photos to a cheap vision model to pre-fill condition flags ("possible water staining near tub — check?") — suggestions only, never conclusions.

### 3.3 The estimate explains itself
Next to every number, a "Why?" tap → AI-generated plain-language explanation grounded in the actual rule ("15% contingency because this is a standard reno — hidden surprises are normal, and this protects you"). Prompt includes the rule that fired; AI only rephrases it.

### 3.4 Underquote guardian
Deterministic checks (margin < target, missing common line items for this job type, complexity multiplier looks low for home age, no contingency adders despite risk flags) → AI phrases the warning like a wise foreman: "Whoa — 1975 house with no 'unknowns behind walls' buffer? That's how the tile job went sideways last time."

### 3.5 Client-facing text generation
AI drafts the scope description, value paragraph, and price-anchoring line for the quote PDF from the structured estimate + his profile (warranty, differentiators). He can regenerate or edit. This is where cheap AI shines — words, not math.

### 3.6 AI price assist (optional, phase 2)
"Get price" on a material → LLM with web search suggests 1–3 current local prices with sources → he taps to accept → saved to HIS price list with a date. Never auto-applied. Cache by (material, region, week).

### 3.7 Learning loop insights
After actuals are entered, deterministic variance stats; AI writes the insight card: "Your last 3 bathrooms ran 20% over on tile hours. Want me to bump the template?" [Yes, fix it] [No].

## 4. UX rules for tech-illiterate users (non-negotiable)

1. **One thing per screen.** One question, one big button. Never a dense form. The full checklist exists underneath, but he experiences it as a conversation.
2. **Thumb-sized targets, huge text.** Assume gloves, sunlight, a phone with a cracked screen, standing in a driveway.
3. **Talk, don't type.** Mic button on every input. Dictation is the primary input method.
4. **Zero jargon.** Not "complexity multiplier" — "How old is the house?" / "Easy to work in, or tight?" The app maps answers to the multiplier silently.
5. **Nothing is ever lost.** Autosave everything instantly. No save buttons. Reopening the app resumes exactly where he was.
6. **Smart defaults everywhere.** Every field pre-filled from his profile and past jobs; he confirms rather than enters.
7. **Undo, not warnings.** Any destructive action is reversible for 30 days. No "Are you sure?" dialogs.
8. **The 3-tap test:** from opening the app to a resumable draft estimate in ≤3 taps. From finished estimate to sent PDF in ≤2.
9. **Onboarding is a conversation too.** The rate wizard is the AI asking: "What do you want to take home a year?" → it computes his $95/hr and shows it proudly: "That's your number. Never quote below it."
10. **Offline-tolerant.** Draft estimates and site capture work offline (PWA + local storage), sync when back on signal. Job sites have bad reception.

## 5. Pricing engine (unchanged from consult — deterministic module `lib/pricing/`)

- Labor rate: (income + overhead + taxes) ÷ 1,400 billable hrs × 1.2; helper cost × 1.2.
- Tiered material markup: <$100 ×1.40 / $100–1k ×1.30 / >$1k ×1.20 (per-item override).
- Complexity multipliers: 1.0 / 1.25 / 1.5 / 1.75–2.0 (mapped from plain-language answers).
- Contingency: base 10/15/20/25% by risk class + stacking adders (+5 indecisive client, +10 unknowns behind walls, +5 trade coordination, +10 rush, +5 specialty materials). Always a visible line item.
- Job templates: bathroom (phase hours: demo 8, rough-in 6, waterproofing 8, tile 16, finishing 8; baseline materials) and deck (formula-driven from dimensions). Templates editable; versioned so old quotes don't change.
- Confidence Check gate before send (5 questions, overridable with a logged reason).
- Unit tests on every formula with the exact numbers from the consult doc ($95/hr example, $9,395 bathroom baseline) as fixtures.

## 6. Build phases (feed to Claude Code one at a time)

**P0 — Foundation (week 1).** Next.js + Prisma + Railway Postgres, magic-link auth, PWA shell, autosave draft system, deploy pipeline to Railway staging. Schema: contractor_profile, materials, templates(versioned), estimates, line_items, site_visits, photos, job_actuals, ai_logs.

**P1 — Pricing engine (week 1–2).** `lib/pricing/` implementing §5 with full unit tests against consult fixtures. No UI yet. This module is sacred; nothing else may compute money.

**P2 — Conversational onboarding (week 2).** AI-guided rate wizard (§4.9) via OpenRouter structured extraction + Zod validation + confirm cards. Fallback plain form if AI unavailable.

**P3 — Conversational estimate intake (week 2–3).** §3.1 flow: dictation/text → extraction → confirm card → gap-filling questions one at a time → structured estimate draft feeding the pricing engine. Live total always visible at bottom.

**P4 — Estimate review + guardian + confidence check (week 3–4).** Line-item review screen (grouped, plain language), "Why?" explainers, underquote guardian, Confidence Check gate.

**P5 — Quote output (week 4).** AI-drafted client text, branded PDF via worker service, share via text/email, status tracking (Draft/Sent/Accepted/Declined + "who'd they go with" on decline).

**P6 — Site visit capture (week 5).** Camera-first checklist flows for bathroom + deck, offline capable, photos to R2, auto-suggest complexity from home age.

**P7 — Actuals + learning loop (week 5–6).** Job completion entry, variance stats, AI insight cards with one-tap template adjustments.

**P8 — Hardening for real users (week 6+).** Error states, AI fallbacks, cost dashboard (tokens/user/month), rate limiting, backups, production Railway environment, buddy #1 onboarded live, then his 2–3 contractor friends.

## 7. AI cost budget (sanity check)

A full conversational estimate ≈ 15–25 LLM calls ≈ 30–60k tokens total. At Flash-class pricing that's well under $0.01 per estimate; even a heavy user (30 estimates/mo) costs pennies. Price-assist web-search calls are the only meaningful cost — cap them per plan tier. Set a hard monthly `max_price` budget per user in code, log everything to ai_logs, and you cannot get a surprise bill.

## 8. What makes this beat the incumbents

Joist is a form. Contractor+ is a form with price lookups. This is a foreman in your pocket: it talks, it remembers your numbers, it stops you from underquoting, and it gets smarter from your own jobs. The consult document's methodology is the brain; the AI is just how a non-technical contractor accesses it without ever seeing a spreadsheet.

## 9. Kill criteria / honesty checkpoints

- Buddy won't use it past 3 real quotes → the UX or the value is wrong; fix before adding anything.
- Cheap-model extraction accuracy <90% on confirm cards → tighten prompts/schemas before considering a pricier model.
- 10 paying strangers within 6 months of public launch at $19–29/mo, or reassess the wedge.
