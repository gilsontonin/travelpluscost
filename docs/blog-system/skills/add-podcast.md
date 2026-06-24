---
name: add-podcast
description: >-
  Add a NotebookLM-style "deep dive" podcast episode to an existing blog post on the
  Hawaii Picnics & Beach Events site. Transcribes the MP3 locally with faster-whisper,
  formats it into a crawlable transcript, wires it into content/podcasts.ts, and embeds
  it with a ::podcast directive (native HTML5 audio player + collapsible transcript +
  AudioObject JSON-LD). Runs the gates (build, npm check, Lighthouse, post-checklist) and
  holds for "go live". Use when the user says "add a podcast", "add the deep dive",
  "transcribe this episode", "/add-podcast", or drops an MP3 to embed in a post.
---

# Add Podcast — Hawaii Picnics & Beach Events

Embeds one audio episode (typically a NotebookLM two-host "deep dive" about the post) into
an existing blog post: a native `<audio>` player + a collapsible, **crawlable** transcript
+ `AudioObject` schema, via a `::podcast <slug>` directive.

**Why it's worth doing:** Google can't listen to audio, so the SEO value is the **transcript
text** (fresh, unique content — a NotebookLM conversation differs from the article, so it's
not a duplicate) plus the **dwell time** the player buys and the **accessibility** win. The
audio itself won't move rankings. Don't add a podcast that's just a robot reading the article
verbatim — that transcript IS a duplicate and adds nothing.

The mechanism already exists (shipped 2026-06-14): the `::podcast` directive + `renderPodcast`
in `lib/markdown.ts`, the `podcasts` registry in `content/podcasts.ts`, and `.podcast` styles
in `app/globals.css`. This skill just adds an episode.

---

## Prerequisite (one-time)
`python3 -m pip install --user faster-whisper` — PyAV bundles the audio decoder, so **no
system ffmpeg/poppler** is needed on this box. (openai-whisper would need ffmpeg; don't use it.)

## Workflow

### 1. Get the MP3 in place
- The user drops the MP3 (anywhere — usually `~/Downloads/` or `public/audio/`). Pasted-in
  audio can't be reached; it must be a file on disk.
- **Rename it to the post slug:** `public/audio/<slug>.mp3` (e.g. `best-restaurants-in-maui.mp3`).
  Confirm the slug exists in `content/blog.ts`. Map the episode to the post by topic.

### 2. Transcribe + generate the entry (one command)
```bash
python3 scripts/transcribe-podcast.py public/audio/<slug>.mp3 --slug <slug> --write
```
- Runs faster-whisper `small.en` (good for clean podcast audio; ~4–5× realtime on CPU, so a
  20-min episode takes a few minutes — run it with a long timeout or in the background).
- Merges segments into readable paragraphs (breaks on >1s pauses / ~340-char sentence ends).
- `--write` splices a `content/podcasts.ts` entry (keyed by slug) after the opening brace,
  with `title` / `description` / `uploadDate` left as **TODO**. Without `--write` it prints the
  entry to paste by hand.

### 3. Fill the metadata + REVIEW the transcript
- Set `title` (e.g. "The Deep Dive: <hook>"), `description` (one line), `uploadDate` (today).
- **Read the transcript.** It's verbatim, so:
  - **Flag invented bylines / mis-heard names** — NotebookLM sometimes credits a fictitious
    author (it invented "Indira Wemberton" from "Wember" on episode 1). Tell the user; light
    edits to the transcript text are fine, but the audio still says it (a regen is the real fix).
  - **No speaker labels** — Whisper doesn't do diarization, so it's flowing paragraphs, not
    Host/Co-host. That's honest and fine; true labels need a heavier diarization step.

### 4. Embed the directive
- Add `::podcast <slug>` on its own line in the post body, **right after the intro** (before
  the ToC), with a one-line lead-in: *"Prefer to listen? Our deep dive walks through the whole
  guide in about N minutes."* `content/blog.ts` is huge — splice via a small Python scoped to
  the post's slug slice (the Edit tool/anchor works too if the anchor is unique).

### 5. Build & verify
```bash
export PATH="$HOME/.local/node/bin:$PATH" && npm run build
```
- In `out/blog/<slug>/index.html`: `podcast__player` present, `podcast__line` transcript turns
  present, `"@type":"AudioObject"` present, and the MP3 exported to `out/audio/<slug>.mp3`.

### 6. Gates (all must pass — same bar as any post edit)
- `npm run check` → green. (Transcripts are already exempt from the ai-slop scan in
  `scripts/check.mjs` — verbatim NotebookLM register isn't our house voice; don't "fix" it.)
- **Lighthouse** the post: Perf ≥ 95, SEO 100, A11y ≥ 95, BP 100. Audio + transcript text are
  light (the `<audio>` is `preload="metadata"`, transcript is collapsed text), so perf holds —
  unlike in-body images, which tank this site's heavier posts.
- `node scripts/post-checklist.mjs <slug> --kw "<primary>"` → AUTO all pass; **paste the full
  table.** (The `::podcast` directive counts toward visual cadence 6.5 — handled in post-stats
  + post-checklist.)
- Re-run `serp-optimize` only if you changed body prose meaningfully; the transcript lives in
  `podcasts.ts` (not the scored body), so the score is unaffected by it.

### 7. Commit & hold
- Stage the post + `content/podcasts.ts` + `public/audio/<slug>.mp3` (+ any mechanism tweak).
  Confirm `.env` isn't staged. Focused commit, co-author trailer.
- **Do NOT `git push` until the user says "go live"** (each push burns a Netlify build credit).

---

## Gotchas / non-negotiables
- **MP3 size:** episodes are ~25–30 MB committed to the repo. Fine for a handful; if it scales
  to many, move audio to **Git LFS or an external host** (flag it, don't silently switch).
- **a11y:** the card title is a styled `<p>`, not a heading (an `<h3>` before the first `<h2>`
  breaks heading order); `.podcast__dur` uses `text-black/70` for contrast. Don't regress these.
- **Transcript ≠ house voice:** never run it through the slop fixer or rewrite it to sound like
  us — it's a recording. It's already exempted from the scan.
- **One episode per post**, keyed by the post slug.

## Acceptance criteria
- `::podcast <slug>` renders player + crawlable transcript + AudioObject schema in the built HTML;
  MP3 served at `/audio/<slug>.mp3`.
- `npm run check` green; Lighthouse ≥ 95/100/≥95/100; post-checklist AUTO all pass (table pasted).
- Invented bylines / mis-heard names in the transcript flagged to the user.
- Focused commit; **held for "go live"** (no push).
