# QuoteRight — Logo Brief & AI Image Prompts

Paste-ready prompts for an AI image generator (Midjourney, DALL·E, Ideogram,
Firefly). Brief first, because the prompt is only as good as the brief.

---

## 1. The brief

**Product.** A guided estimating app for solo and small residential contractors.
The contractor talks about a job, the app asks the right questions, applies his
real rates, and produces a complete quote that doesn't lose him money.

**Name.** QuoteRight — double meaning: *quote it correctly*, and *quote it right
now*. The mark should lean on **correct**, not fast.

**Who sees it.** A 30–55 year old contractor, on a phone, in a driveway, in
sunlight, possibly with gloves on. He is not a design person. He is suspicious of
software that looks like it was made for someone else.

**What it must say — in order of priority**
1. **This is correct / verified / checked.** Confidence, not cleverness.
2. **This is a trade tool**, not office software. It belongs next to a tape
   measure, not a spreadsheet.
3. **Small, sharp, professional.** A one-man shop that looks like it has its act
   together.

**What it must NOT say**
- Not corporate-construction (no hard hats, no cranes, no blueprints)
- Not finance/fintech (no charts, no coins, no dollar signs)
- Not cute, not a mascot, not a robot, not an AI brain
- Not a generic house outline — every contractor app already uses one

**Existing visual language** (from the working demo — the mark must live in it)
- Ink black `#0E1113`, warm paper `#F0EEE9`, **site orange `#E8630A`**
- Accents: chalk blue `#2B5D8A`, tape yellow `#F5C511`, green `#2E7D46`
- Typeface: **Archivo** (tight tracking, heavy weights), IBM Plex Mono for numbers
- Feel: job-site paper, carpenter's pencil, tape on a doorframe. Warm, sturdy,
  slightly analogue — not glassy or techy.

**Current placeholder** (what we're replacing): a rounded black square with an
orange checkmark. It works, but it's generic — every second app has a checkmark.

**Technical requirements**
- Must read at **16×16 px** (favicon) and **1024×1024** (app icon)
- Must work in **pure single-colour** (black on white, white on black)
- **Square app-icon lockup** + a **horizontal wordmark lockup**
- Flat vector. No gradients, no bevels, no drop shadows, no 3D
- Balanced inside a rounded-square (iOS/Android icon safe area)

---

## 2. The concept directions

Pick a lane before generating — mixed metaphors produce mush.

| # | Concept | The idea | Why it could win |
|---|---|---|---|
| **A** | **Checkmark from a pencil stroke** | The tick is drawn as a carpenter-pencil mark — flat chisel tip, slight taper | Merges "correct" with "trade tool." Most on-brief. |
| **B** | **Checkmark + measurement tick** | A tick mark that doubles as a ruler/tape graduation | "Measured correctly" in one shape. Very ownable. |
| **C** | **The right angle** | A carpenter's square (L) forming an implied check or a "Q" | Speaks to *right* = square/true. Trade-authentic. |
| **D** | **Q + tick ligature** | The Q's tail becomes the checkmark | Strong monogram, works tiny |
| **E** | **Torn paper / tape corner** | A quote sheet corner with a tick, tape-yellow accent | Closest to the app's paper-and-tape aesthetic |

**Recommended: A or B.** They carry both meanings in one shape, survive at 16px,
and don't collide with the house-outline cliché.

---

## 3. Paste-ready prompts

> Add your generator's flags at the end (e.g. Midjourney `--v 7 --style raw --ar 1:1`).
> Generate on a **plain white background** and recolour later — generators handle
> brand hex codes unreliably.

### Prompt A — Pencil-stroke checkmark ★ start here

```
Minimal flat vector logo icon for a construction estimating app called QuoteRight.
A single bold checkmark drawn as a carpenter's pencil stroke — flat chisel-tip
edges, slightly tapered ends, one confident sweep, subtle angular cut where the
stroke changes direction. Geometric and precise, not hand-drawn or sketchy.
Solid burnt orange on white. Flat 2D vector, no gradient, no shadow, no outline,
no 3D, no text. Thick strokes, high contrast, legible at 16 pixels. Centered,
generous margins, app icon composition.
```

### Prompt B — Measurement-tick checkmark

```
Minimal flat vector logo mark: a bold checkmark whose long upstroke is marked with
three short perpendicular graduation lines, like the increments on a tape measure
or ruler. Reads instantly as a check first, a measuring tool second. Geometric,
precise, engineered. Solid black on white. Flat 2D vector, no gradients, no
shadows, no 3D, no text, no background. Heavy strokes, high contrast, must be
legible at 16 pixels. Centered app icon composition.
```

### Prompt C — Carpenter's square

```
Minimal flat vector logo icon: a carpenter's framing square forming a clean right
angle, with the inner negative space suggesting a checkmark. Tool-authentic,
geometric, built from straight lines and one precise angle. Solid black on white.
Flat 2D vector, no gradient, no shadow, no 3D, no text. Thick uniform strokes,
high contrast, legible at small sizes. Centered, square composition.
```

### Prompt D — Q monogram ligature

```
Minimal flat vector monogram logo: the letter Q where the tail extends into a bold
checkmark, drawn as one continuous confident stroke. Geometric grotesque letterform,
tight and heavy, slightly condensed. Solid black on white. Flat 2D vector, no
gradient, no shadow, no 3D, no serif. Legible at 16 pixels. Centered app icon
composition with even margins.
```

### Prompt E — App icon lockup (run once you've picked a mark)

```
App icon: rounded square with 22% corner radius, solid near-black background
(#0E1113), containing a single bold burnt-orange (#E8630A) [INSERT CHOSEN MARK
DESCRIPTION] centered with generous padding. Flat 2D vector, no gradient, no
shadow, no bevel, no text. Bold, high contrast, iOS app icon style, clean and
confident.
```

### Prompt F — Horizontal wordmark lockup

```
Horizontal logo lockup: a bold geometric sans-serif wordmark reading "QuoteRight"
as one word, tight letter-spacing, heavy weight, slightly condensed — "Quote" in
near-black and "Right" in burnt orange. To its left, a small square icon containing
a bold checkmark. Clean baseline alignment, balanced optical spacing. Flat vector,
white background, no gradient, no shadow, no tagline.
```

---

## 4. Negative prompt (append to any of the above)

```
--no hard hat, house outline, roof, hammer, crane, blueprint, gradient, 3D, bevel,
emboss, drop shadow, glow, mascot, cartoon, robot, brain, circuit, lightbulb,
handshake, dollar sign, bar chart, pie chart, swoosh, globe, shield, ribbon,
watermark, photorealism, texture, noise, multiple variations in one image, text
(unless wordmark), signature, border, frame
```

---

## 5. How to judge what comes back

Run every candidate through this before you fall in love with it:

1. **Squint test.** Blur it. Is it still one clear shape?
2. **16px test.** Shrink to favicon size. Does it turn to mush?
3. **One-colour test.** Fill it solid black. Does it survive?
4. **Driveway test.** Screenshot it on the app header, look at it on a phone
   outdoors. Still sharp?
5. **Cliché test.** Search "contractor app logo." If yours is in that grid, keep going.
6. **The buddy test.** Show your contractor three, say nothing, ask which company
   he'd trust with his numbers. **His answer beats ours.**

---

## 6. After you pick one

Send it back here and I'll:
- Redraw it as **clean inline SVG** (generators produce raster with wobbly curves)
- Optically align it with the Archivo wordmark
- Wire it into the app header, favicon and apple-touch-icon
- Produce the mono, reversed and app-icon variants

**Note:** AI generators output raster images with imprecise geometry. Treat the
output as a **direction to redraw**, not a finished logo. A logo needs true vector
paths to hold up at every size.
