# Handoff: CEO document for a multi-carrier illustration tool

You are picking this up from another chat that failed to deliver. The user rejected every version. Read the feedback section before you design anything.

## What the user needs

A document for the CEO of an insurance firm ("Tompkins Insurance", website given as https://tompkinsinsurance.com/leadership/). The CEO is not technical and has little time. The document has to make the CEO understand a proposed tool and believe it is a real, workable solution. It must look professionally designed and match the firm's real logo and website branding.

The user is working under time pressure and does not want questions. Make decisions and deliver.

## The idea being proposed

Life insurance advisors compare carriers for a client by running each carrier's illustration software separately (Canada Life, Manulife, Sun Life), typing the same client into each one, and building a comparison by hand. An "illustration" is the carrier's document showing what a policy costs and pays over time.

The proposal: one simple intake where the advisor enters the case once and clicks a button. Software runs each carrier's own illustration tool, saves the carrier's document, checks it against the request, and returns one firm-branded comparison with the carrier documents attached.

Decisions the user already made:
- Use the carriers' own tools, not a home-built calculator, so the numbers are the carriers' and always current.
- The advisor experience must be as easy as possible. Advisors are not technical. Ideally one button.
- The firm has Claude Enterprise. Claude operating the carrier websites (Claude in Chrome, or desktop control) is the intended way to run the tools, alone or as the fallback behind scripted automation.
- Back-end complexity is acceptable if the advisor side stays simple.

## What is true and what is not (do not overstate this)

- Nothing is built. Nothing has been tested against any carrier tool.
- Ordinary, proven technology: software filling in a website and saving a PDF; reading figures from a PDF; building a branded comparison; an AI assistant operating a website in a browser.
- Unknown: whether each carrier's tool can be operated this way, how long a run takes, whether sign-in still needs a person (carriers may text a code), how much upkeep it needs.
- Main risk: carrier portal rules generally do not allow automated use. Each carrier would need to agree. Fallback if one refuses: staff run that carrier's tool and software still builds the comparison.
- Cheapest proof: one advisor signs in to one carrier tool and lets Claude in Chrome attempt one real illustration.
- The description of how advisors work today is an assumption. Nobody confirmed it.

Research from search-result snippets only (likely, not confirmed):
- Canada Life: "Canada Life Illustrations", web-based, desktop version retired May 2024, reached through "Workspace". Public site terms prohibit scraping.
- Sun Life: "Sun Life Illustrations", web-based, built by Equisoft, desktop version retired.
- Manulife: "Manulife Illustrations", web or desktop not determined. Biggest open feasibility question.
- No public illustration data feed found at any of the three.
- Equisoft LifeGuide is an existing multi-carrier quote tool in Canada; whether it produces full participating whole life illustrations was not confirmed.

## Branding: not solved

The previous chat could not reach tompkinsinsurance.com (blocked in its sandbox) and web search found no trace of that domain. The only "Tompkins Insurance" found was a New York agency on a different address (tompkinsins.com), which may be a different company. Every version so far used an invented navy and gold look with the firm name set in plain type. This is probably a large part of why the user called it amateur and off-brand.

Before designing, get the real logo, colours and fonts. If you can open the website, take them from there. If you cannot, the user needs to attach the logo file and a screenshot of the site.

## Feedback so far, in order

1. First concept doc (two pages, technical): "a non technical CEO won't get it."
2. One-page plain summary: "Too simple now. Just how does it work. It's for the CEO."
3. One-page five-step explainer: asked for two pages, easier-to-read fonts and branding, and imagery to make things simpler.
4. Two-page version with icons: "Don't sound smart, be smart, but relay accurately for average folks. Sounding smart makes it look like faking. Is it a real solution or not."
5. Honest rewrite with a status box: "A CEO doesn't have time for this. Needs to understand it."
6. One page, about 80 words, one picture: "Looks amateur. It's not even a full page. Design is shit. Looks like grade school. Does it even work."
7. Dense consulting-style one-pager with flow diagram, sample table and sidebar: "Totally wrong."

## What that feedback adds up to (the previous chat's reading, not confirmed by the user)

- Explain how it works, at a level between a slogan and a technical spec.
- Plain words for average people. No consultant tone, no jargon, no cleverness.
- Fast to take in: mostly visual, but a full, finished-looking page, not sparse.
- Real graphic design quality. Flat boxes, line icons and CSS layouts read as amateur to this user. Expect to need real imagery or illustration and the real brand.
- It must come across as real. The user is torn between wanting it to look convincing and needing it to be accurate. Do not fake certainty; show the concept confidently and state plainly that it is a proposal to be tested.
- The last version leaned on caveats ("Not built. Not yet tested." was the largest type in the sidebar). That may be what "totally wrong" meant: it sold the doubt, not the idea. The user did not say.

## Things to avoid

- Inventing timings, savings or statistics. None exist.
- Presenting the sample illustration numbers as real. An earlier sample comparison used figures from a made-up model, not from the carriers.
- Claiming zero logins or fully hands-off operation.
- Asking the user a string of questions.

## Files from the previous chat

Repository `mattcbender-creator/quoteright`, branch `ccr-05f6dd23-45ephz`:
- `examples/tompkins-illustration-desk/ceo-brief.html` and `.pdf`: last version, rejected.
- `examples/tompkins-illustration-desk/overview.html` and `.pdf`: two-page illustrated version, rejected.
- `examples/tompkins-illustration-desk/how-it-works.html`, `executive-summary.html`, `solution-design.html`: earlier versions, rejected. `solution-design` has the fullest technical detail.
- `examples/tompkins-hnw-carrier-comparison/`: a sample three-carrier comparison for a fictional client, with invented figures. Useful only as a picture of the output.

Use these for content. Do not reuse the visual design.
