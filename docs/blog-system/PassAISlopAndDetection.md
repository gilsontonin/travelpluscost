# Passing the AI-slop smell test

> The point isn't to "trick AI detectors." It's that the words that trip detectors are the same ones
> that make readers bounce and Google shrug — generic, padded, lifeless. Cut them and the writing is
> both more human *and* better. Roughly half of readers can already spot AI copy on sight (Bynder
> survey, 2,000 US/UK consumers), so this is a real trust issue, not a gimmick.
>
> This pairs with `voice.md` (the hard rules) and `DanKennedyVoice.md` (how to sound). **The enforced
> word list lives in `scripts/ai-slop-check.mjs`** — run it on every post (the write + publish skills
> do). This file is the human guide to *why* and *how*.

---

## What AI text looks like (Grammarly's tells)

Beyond word choice, AI writing has a *shape* — watch for it:
- **Robotic/formal tone** — same sentence structure repeated, little emotion or nuance. *Antidote:* vary rhythm (long setup → short punch), one dry aside per few hundred words.
- **Repetitive phrasing & clichés** — leans on familiar stock phrases. *Antidote:* the HARD/SOFT lists below; say it the way you'd say it out loud.
- **No personal touch** — generalizes, no real stories or stakes. *Antidote:* one real story (`stories.md`), one real number (`stats.md`), one honest opinion + a "when not to bother" (`opinions.md`).
- **Too-perfect formatting** — title-case headings, immaculate bullets, uniform paragraphs. *Antidote:* sentence-case headings, mixed paragraph lengths, prose over endless bullets.

## The principle

AI isn't the enemy; **unedited, generic writing is.** AI mirrors safe patterns: stock transitions,
corporate verbs, dramatic ad clichés, hedging filler. The fix is always the same — **specific,
personal, honest, spoken-aloud.** If you wouldn't say it to someone across a table, cut it.

## Two tiers (what the checker flags)

**HARD tells — cut on sight (the checker fails the post on these).** Near-always slop in our context:
`delve` · `leverage` · `utilize/utilization` · `facilitate` · `seamless` · `world-class` ·
`cutting-edge` · `unlock the…` · `game-changing` · `revolutionize` · `unparalleled` ·
`best-in-class` · `synergy` · `nestled` · `hidden gem` · `treasure trove` · `testament to` ·
`tapestry` · `ever-evolving / ever-changing` · `in today's…` · `furthermore` · `moreover` ·
`in conclusion` · `it is important to note` · `take it to the next level` · `streamline` ·
`shed light on` · `to put it simply` · `a key takeaway` · `from a broader perspective` · `this underscores…`.

**SOFT tells — flag & review (warnings, not failures).** Fine in moderation, suspicious in bulk —
the checker warns, and **3+ in one paragraph is a red flag**: `elevate` (vs. legit "elevated
view"/"elevation") · `at the end of the day` · `to the next level` · `significant` · `vital` · `crucial` ·
`comprehensive` · `realm` · `nuance` · `intricate` · `myriad` · `plethora` · `robust` · `vibrant` ·
`bustling` · `stunning` · `breathtaking` · `majestic` · `serene` · `picturesque` · `boasts` · `gem` ·
`paradise` · `captivating` · `immerse` · `embark` · `dive into` · `when it comes to` ·
`whether you're…` · `look no further` · `rich history` · `array of` · `showcase` · `enhance` ·
`harness` · `illuminate` · `at its core` · `generally speaking` · `typically` · `tends to` ·
`arguably` · `to some extent` · `broadly speaking` · `refine` · `bolster` · `differentiate` ·
`innovative` · `transformative` · `scalable`.

(Travel writing leans on the SOFT list hard — one `stunning` is fine; a paragraph of `stunning,
breathtaking, majestic paradise` is slop. Earn each one or swap it for something specific.)

## Swaps

- corporate verbs → plain ones: `leverage→use`, `utilize→use`, `facilitate→help`, `enhance→improve`,
  `optimize→improve/refine`.
- stock transitions → human ones: `furthermore/moreover→and / what's more`, `therefore→so`,
  `subsequently→then/next`, `in conclusion→`(just end).
- ad clichés → grounded: `unlock the power of→make the most of`, `take it to the next level→help it
  grow`, `unparalleled excellence→outstanding`.
- hedging → direct: `it is important to note that X→X`, `one might argue→some say` (or just state it).

## De-slop, by example

> ❌ "In today's ever-evolving digital realm, it is vital to leverage cutting-edge solutions."
> ✅ "The internet moves fast — keep up or get left behind."

> ❌ "Nestled in a breathtaking tropical paradise, this hidden gem boasts unparalleled beauty."
> ✅ "It's an 80-foot waterfall five minutes off the road in Hilo — and on a sunny morning it throws a rainbow."

The trick every time: **casual, specific, personal.** A real number, a real place, a dry aside,
a "here's when not to bother." That's what no detector — and no reader — mistakes for a machine.

## How it's enforced

- `node scripts/ai-slop-check.mjs <slug>` (or a draft `.md` path, or `--all`) → reports HARD ❌ and
  SOFT ⚠ hits with line snippets, flags paragraphs with 3+ soft tells, exits non-zero on any HARD tell.
- **write-blog-post** runs it in the voice gate before a draft is saved.
- **publish-post** runs it in Step 3; a HARD tell is a mismatch to fix before the post can auto-go-live.
- **Override:** a HARD tell inside scare-quotes that the post is *deliberately mocking* (e.g. "do not
  chase every `\"hidden gem\"` you saw online") is intentional voice — keep it and note the override.
  The checker can't tell mockery from slop; you can.
