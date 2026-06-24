---
name: generate-podcast
description: >-
  Generate a two-host "deep dive" podcast for a blog post from scratch via Google Gemini
  multi-speaker TTS (no NotebookLM needed). Claude writes the script in the house voice,
  Gemini renders it to MP3 with two cast voices, and it's embedded via the ::podcast
  directive (player + crawlable transcript WITH speaker labels + AudioObject schema). The
  script IS the transcript — no Whisper, no transcription errors, no invented bylines.
  Runs the gates and holds for "go live". Use when the user says "generate a podcast",
  "make a deep dive for [post]", "/generate-podcast", or wants an AI podcast for a post.
---

# Generate Podcast — Hawaii Picnics & Beach Events

Produces a NotebookLM-style two-host episode end to end via **Google Gemini multi-speaker
TTS** — fully automatable, ~free (Gemini AI Studio free tier; pennies/episode if billed).
Distinct from `/add-podcast` (which transcribes an MP3 you already recorded): this one
*writes and generates* the audio.

**Why this beats NotebookLM here:** Claude writes the script in the brand voice (NotebookLM
doesn't know it), so it's more on-brand and specific; the script IS the transcript (with real
**speaker labels**, no Whisper errors, no invented author names); and it's one command.

## Prerequisites (one-time)
- `python3 -m pip install --user google-genai lameenc` (PyAV/lameenc are self-contained — no
  system ffmpeg needed). Run scripts with the same `python3` these are installed under.
- `GEMINI_API_KEY` in `.env` (free key from aistudio.google.com).

## House defaults (approved 2026-06-14 — keep unless the user changes them)
- **Voices:** `Maya` = **Kore** (warm female host), `Sam` = **Charon** (deeper male co-host).
- **Tone:** NONE — leave the delivery to Gemini's natural conversational tuning (default `style`
  is empty). We A/B'd custom style prompts (relaxed, vacation, full-voice radio) and they fought
  the model; Google's untouched multi-speaker tone sounds the most natural. Only add a `style`
  override if an episode genuinely needs it. Voices (Kore + Charon) are baked into the generator.

## Workflow

### 1. Write the script (this is half the quality — and make it GEO-friendly)
- Read the target post. Write a **two-host conversation** (speakers `Maya` and `Sam`) in the
  house voice from `References/` — dry, specific, real numbers, the honest "when not to" beats,
  a genuine back-and-forth (questions, push-back, a light laugh). Discuss it like two locals
  who know it; don't just read the post aloud.
- **GEO-structured (required):** build the conversation around the *exact questions the post
  targets* (its intent + PAA), and answer each one **clearly, specifically, and quotably** — so
  AI answer engines can lift a direct answer. Maya asks the searcher's real question ("what's
  the single best restaurant?", "how far ahead do I book?", "where do locals eat cheap?"), Sam
  gives a crisp, self-contained answer with the names/numbers. Helpful first, on-intent always.
- **Length: 10–15 minutes** (no less than 10, no more than 15) — roughly **1,900–2,700 words**
  at Gemini's pace (~180 wpm). The generator prints the duration; if it lands under 10:00, add
  turns and regenerate. Match the post's depth.
- No stage-direction tags (Gemini infers tone naturally; default style is none). ASCII is fine;
  the transcript renders as-is.
- Save as JSON: `{ "slug": "<post-slug>", "turns": [ { "speaker": "Maya", "text": "..." },
  { "speaker": "Sam", "text": "..." }, ... ] }` (voices/style default; add a `"style"` or
  `"voices"` field only to override). Write it to a temp path (e.g. `/tmp/<slug>-pod.json`).

### 2. Generate the MP3
```bash
python3 scripts/generate-podcast.py /tmp/<slug>-pod.json
```
Chunks the script under the TTS per-request cap, concatenates the PCM, encodes MP3 via lameenc
→ `public/audio/<slug>.mp3`. Prints duration + `durationIso`.

### 3. Wire it into the post (content/podcasts.ts + the directive)
- Add/replace the `content/podcasts.ts` entry keyed by slug: `title`, `description`,
  `audioSrc: "/audio/<slug>.mp3"`, `duration`, `durationIso` (from step 2), `uploadDate`, and
  `transcript` = **the same turns** (keep the `speaker` labels — that's the edge over Whisper).
- Add `::podcast <slug>` after the post's intro (a one-line "Prefer to listen?" lead-in), if
  not already present.

### 4. Gates (same bar as any post edit) + commit
- `npm run build` clean; in the built HTML: player + transcript turns + AudioObject schema;
  MP3 at `out/audio/<slug>.mp3`.
- `npm run check` green (podcasts.ts is exempt from the slop scan). Lighthouse ≥ 95/100/≥95/100
  (audio + text are light — holds perf). `post-checklist.mjs <slug> --kw "..."` AUTO all pass
  (`::podcast` counts toward visual cadence); **paste the table.**
- Focused commit (post + podcasts.ts + the MP3). **Hold the push until "go live."**

## Notes
- **Quota:** the Gemini free tier caps TTS at **10 requests/day** (each episode = ~2–4 chunked
  requests, so ~3 episodes/day; tone/A-B tests eat into it fast). A 429 RESOURCE_EXHAUSTED means
  you've hit it — wait for the daily reset or enable billing on the key (then it's pennies/episode
  with no tight cap). Do short test clips sparingly.
- One episode per post, keyed by slug. Replacing an existing episode (e.g. swapping a NotebookLM
  one for this) just overwrites the MP3 + the podcasts.ts entry.
- **MP3 size:** ~10–15 MB/episode in git. Fine for a handful; move to Git LFS / external host at
  scale (flag it).
- Cost is printed implicitly (free tier covers low volume). Keep the two-speaker cap (Gemini
  multi-speaker supports exactly 2).

## Acceptance criteria
- `public/audio/<slug>.mp3` generated; `::podcast` renders player + labeled transcript + schema.
- npm check green; Lighthouse ≥ 95/100/≥95/100; checklist AUTO all pass (table pasted).
- Transcript carries speaker labels; no invented bylines; voices/tone = the approved defaults
  unless the user changed them.
- Focused commit; held for "go live".
