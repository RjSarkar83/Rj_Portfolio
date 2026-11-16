# ISSUED FOR FABRICATION
### an additive design layer for rjsarkar83.github.io/character-

Your site already does something rare — a scroll-scrubbed film of you turning, walking,
sitting, waving. This layer doesn't touch that. It bolts a **second skin of behaviour**
on top of it, drawn entirely from your own trade: signage, fabrication drawings,
backlit fascia at 2 a.m., vinyl, CNC.

Two files. Two lines. Nothing in `app.js`, `config.js` or `style.css` is modified —
the layer only reads the DOM they build.

---

## The three states of the site

A milled-metal switch sits bottom-right (keys `1 · 2 · 3`). Your choice is remembered.

| State | What happens |
|---|---|
| **SHOP** (`1`) | The portfolio exactly as you built it. |
| **DRAWING** (`2`) | The page becomes its own **fabrication shop drawing**: drafting grid, sheet border, crop + bleed marks, registration crosses, live dimensions measured off the real layout in mm (A1 @ 1:20), a revision cloud round the About headline, figure leaders, a scale bar, a title block — *ArtViSiON · Sheet A-101 · Scale 1:20 · Drawn RS* — and a rotated **ISSUED FOR FABRICATION** stamp. The film desaturates to pencil-grey. **Drag anywhere to measure**: you get a real dimension line with arrowheads and a live mm readout, and your measurements stay pinned to the sheet for a few seconds. |
| **2 A.M.** (`3`) | The world goes dark and the signage lights up. Every headline becomes a **backlit channel letter** with halation; your pointer becomes the only light on site — an inspection work-lamp that reveals what it touches; scanlines, film grain, a ballast that flickers once in a while. The HUD reads `350 cd/m² · 6500 K · ΔE 2.1 · IP65 · 02:00 site`. |

## The character is alive now

* **He watches you.** During the opening hold, move your pointer: he turns — front,
  three-quarter, profile, mirrored left/right — to face it. Scroll and the film takes over again.
* **Grab him.** Drag sideways anywhere and you spin the whole **23-position turntable by
  hand**, with a mechanical detent per frame and the angle readout following. Let go and he
  glides back to wherever the scrollbar says you are.
* **The film gate.** A vertical strip of 23 ticks on the right edge; hover one for a
  contact-sheet peephole of that pose, click to jump the film there.

## The shop floor

* **Router-bit cursor.** Your pointer is a 6 mm bit in a collet ring that **spins faster the
  faster you scroll**, leaving an engraved toolpath that fades behind you. Click and it
  plunges: sparks, a nick mark, a sound.
* **Velocity optics.** Scrub hard and the gate smears and the RGB channels split, like a
  shutter struggling to keep up. (Auto-disables itself if the device can't keep up.)
* **Sound bed (`S`), opt-in, zero audio files** — all synthesised: a machine hum, and a
  **router whose pitch rises with your scroll velocity**, detents, a vinyl peel on mode
  change, a plunge on click.

## Details that reward a second look

* The About headline is held up by **Fig. 02 — the cantilever bracket**: 6 mm MS, zinc
  plated, drawn stroke-by-stroke, bolts tightening as it lands. *"I draw the identity and
  the bracket that holds it up."* — now literally.
* Your stats are **mechanical odometers**: `10,000+ / 150+ / 15+` roll up digit by digit
  each time About comes on screen.
* The five service cards are **laminated fascia**: they tilt in 3D under the pointer with a
  specular sweep, like printed panels catching site light.
* The email is **masked vinyl**. Drag right with a squeegee to apply it; the mask peels,
  the address is revealed, and it stamps `✓ APPLIED · ΔE 2.1 · 12 MM MIN`. (Click still
  works; it self-reveals if left alone — the address is never held hostage.)
* Headlines reveal with word-mask wipes; nav buttons and the download button are magnetic.
* The loader registers itself like a print: red/cyan misregistration that converges.

## Easter eggs (type them)

| Type | Result |
|---|---|
| `2AM` | straight to 2 A.M. + a site-log toast: *02:00 · C21 Mall · 14 fascias · lamps lit* |
| `CNC` | straight to DRAWING + *toolpath loaded · ⌀6 bit · 3 mm radial offset · one setup* |
| `AV`  | the **ArtViSiON** wordmark wipes across the screen |
| `Esc` | clears your measurements / dismisses overlays |

First-time visitors get one coach mark at a time (*drag him · press 2 · press 3 · drag the
vinyl*), each shown once, stored locally, never repeated.

`prefers-reduced-motion` is respected throughout: no grain animation, no tilt, no
follow, no channel split — the three states still work.

---

# WAVE 2 — the update

## The five service images are no longer renders

You said they read as AI. They are gone. The five cards now carry **real location
photography** (Pexels free licence, 1280×800, cropped to the card's 16:10):

| Card | Photograph |
|---|---|
| A · Advertising | arena rig and line-array going up under haze, house lights on (14229532) |
| B · Branding | a real Indian retail row at night — glow boxes, wet tarmac, parked bikes (2119903) |
| C · Creative | a hand inking a logotype construction in a sketchbook (9511742) |
| D · Designing | router spindle and cable chain mid-cut, operator at the bed (9242202) |
| E · Execution | a struck neon blade sign over a dark street (16580330) |

They are *reference* photography, and the disclosure bar now says exactly that.
When you have your own install shots, drop them over
`media/work/a_event.jpg … e_integration.jpg` at 16:10 and nothing else changes.

## One night, five installs (the work hold, rebuilt)

The work hold was already 1.7× longer than the others. Now that length means something.
Scroll through it and **the five services get installed in front of you**:

* a **site clock** runs 22:00 → 06:00 beside a live site log (*"03:05 · router running ·
  ±0.5 mm over 2400 mm · one setup"*);
* each panel is **hoisted** up from below, still dark;
* its face opens like a **roller shutter**, slat by slat;
* then the **lamps strike** — a hard flicker — and a red stamp lands: `LIT 22:40`,
  `LIT 23:55`, `LIT 01:20`, `LIT 03:05`, `LIT 04:50`.

Scroll back up and it un-installs. It is the whole story of your practice — drawn,
fabricated, standing by the morning — told in one scroll.

## The reel (`P`, or the REEL button)

Press `P` and the site **plays itself**: the scrollbar drives the film at 1 film-second
per real second, dwells on each hold long enough to read it, and stops at
*end of reel · 00:46*. A timecode runs in the HUD (`▶ 00:12 / 00:46`). Any scroll,
touch or key takes the wheel back. It turns the portfolio into the film it already was.

## Neon strike (2 A.M., contact + hero)

In LIT mode the big letters are **unlit channel letters** first — pale white shapes in
the dark — then they **ignite one by one**, each with its own ballast stutter, red line
last. With the ballast buzz in the sound bed (`S`), 2 A.M. now sounds like a fascia
warming up.

Keyboard adds: `P` reel. Everything else is unchanged.

---

## WAVE 3 — the case decks (the process IS the portfolio)

Click any service panel (image, keyboard Enter on it, or the `Process ↗` chip)
and the job opens as a presentation board: **recce → concept → working
drawing → production design → production → execution → handover** (each
service keeps only the stages it really has — 5 to 7 boards per deck).

* **Drawings draw themselves.** Six issued sheets are generated as SVG shop
  drawings — portal elevation A-201, portal section A-202, rollout ratio
  B-101, mark construction grid C-101, CNC toolpath D-301, lightbox section
  E-401 — dimension strings, leaders, node dots and title block included.
  They are drawings, not pictures of drawings.
* **Schedules are documents.** Cut lists, rollout kits, repro ladders,
  intake logs, tooling sheets and calibration tables render as framed
  issued sheets (`CUT LIST · REV 2`, `TOOLING · TAPED TO THE MACHINE`…).
* **Photos are site documentation** — every photo board carries its stamp
  (`SITE · 21:40`, `QC · FIRST + LAST`). Nothing in a deck is AI-rendered.
* Flip with ← →, wheel, swipe or the stage rail. `Esc` closes. Reduced
  motion shows every board complete; ≤760px the rail becomes a strip.

### Deck photography (Pexels, real cameras)

| file | pexels id | board |
|---|---|---|
| media/case/recce_laser.jpg | 6474311 | A recce — laser line on atrium wall |
| media/case/print_bed.jpg | 40241484 | A/B production — large-format bed |
| media/case/morning_rig.jpg | 12787862 | A handover — rig at doors-open |
| media/case/proto_shopfront.jpg | wave-2 harvest | B prototype — pilot storefront |
| media/case/collateral.jpg | wave-2 harvest | C day-one — printed collateral |
| media/case/qc_caliper.jpg | 36003971 | D QC — digital caliper on steel |
| media/case/dispatch_stack.jpg | 12278588 | D dispatch — labelled stack |
| media/case/psu_wiring.jpg | 37982526 | E fabrication — PSU loom |
| media/case/screen_up.jpg | 7513419 | E marriage — screen up on site |

Execution/live boards reuse the five `media/work/` photographs from wave 2.
No `index.html` or `config.js` change this wave; deploy set grows by the
`media/case/` folder.

## WAVE 4 — the type house (Montserrat + Playfair Display)

The site now speaks with two voices, set by luxury-type rules, added
purely in `enhance.css` (block 21) — `style.css`/`index.html` untouched:

* **Playfair Display** (variable, self-hosted woff2) = the display voice:
  the nameplate (`RANJAN` roman / `SARKAR` red italic), every section
  title, card titles, the stats, and the contact mail set as serif
  italic — high-contrast modern serif, weight 500–600, editorial
  leading (0.92–1.08), `text-wrap: balance`.
* **Montserrat** (variable, self-hosted woff2) = the reading voice:
  weight 300 for body at 15–17.5 px / 1.75, weights 500–600 uppercase
  with 0.24–0.46 em tracking for every micro-label — tracked caps and
  air are what read as "premium".
* **Mono survives only as the shop voice**: drawings, stamps,
  schedules, HUD, title blocks — the issued-document layer.
* Files: `fonts/Montserrat-var.woff2`, `fonts/Playfair-var.woff2`,
  `fonts/Playfair-italic-var.woff2` (latin subsets, ~38 KB each,
  `font-display: swap`). Google Fonts OFL faces, self-hosted so the
  Pages repo stays offline-complete.
* Fix bundled: while `#s-work` holds the stage the turntable readouts
  (`#angle`, `#x-lux`) fade out — the taller Montserrat cards own that
  corner (`body:has(#s-work.on)`).

Deploy set adds the three woff2 files; nothing else changes.

## WAVE 5 — the work grid, reset + overlap guards

* **Four in a line, one above:** Advertising · Branding · Creative · Designing
  hold the bottom row; **Execution sits above Designing** as a compact
  landscape card (image left, copy right, two-line clamp) — `enhance.css`
  block 22, `≥761px` only; phones keep the snap-scroll strip.
* **Overlap guards, all in CSS, all reversible:**
  - vinyl mask on the contact mail is now fully opaque — no ghost type
    under the "drag right" prompt;
  - `≤760px`: the mode dock fades while the work strip holds, and coach
    tips become a single-line bordered toast (no wrap over headers);
  - `≥761px`: while `#s-work` holds, the dock relocates to the free
    top-right band so it never covers a card's proof line;
  - `980–761px`: bar nav tracking tightens; `≤560px`: deck progress
    readout hides; `.rolerow` wraps with row-gap.
* QA: `qa/shoot8.mjs` sweeps 1440 / 1280 / 1024 / 390 across work, about
  and contact at rest and at tail-of-hold — zero console errors, zero
  collisions; decks and install sequence re-verified (`shoot5`, `shoot3`,
  `shoot4` clean).

## WAVE 6 — the turntable caption is retired

The bottom-left shop-mode caption ("180° turntable · 23 positions ·
scroll-scrubbed") is removed at the user's request: `LUX.shop` is now an
empty string and the `#x-lux` line hides itself whenever its text is
empty — in every state (boot, mode change, reel stop, restored prefs).
The draw and lit captions and the cinema-reel timecode (which reuses the
same line while playing) are untouched.

## WAVE 7 — the reel speaks, the disclosure settles, the dock softens

* **Reel voice-over:** pressing `P` / the REEL key now plays
  `media/vo/reel-info.mp3` — the authenticity note read aloud while the
  film runs; stopping the reel (any wheel / touch / key) pauses and
  rewinds it. Synthesised with the session voice `voice-00`; the module
  is `VO` in `enhance.js` (state hook: `window.X.vo.state()`).
* **Disclosure → footer:** the fixed bottom bar is gone. `#disc` is
  re-parented into `#s-contact .inner` as a quiet left-set footer
  (hairline above, red `AI CHARACTER` label, Montserrat 400 light).
  `measureDisc()` now reserves zero dock space when the bar is static.
  Note: the footer carries the *current truthful* text — "location
  reference photography (Pexels licence), not renders" — not the old
  pre-swap "AI-generated concept renders" sentence.
* **Dock:** tray and every key rounded (14 px tray / 11 px keys,
  3 px gaps); the old 1 px separators are gone.
* QA: `qa/shoot9.mjs` — footer parent/position, VO play+stop states,
  desktop + 390 px footer shots; `shoot4` re-verified (install clock
  05:45, reel HUD) — zero console errors.

Deploy set adds `media/vo/reel-info.mp3`.

## WAVE 8 — the voice retires, one radius everywhere

* **Reel voice-over removed** at user request: the `VO` module, its
  play/stop hooks and `media/vo/reel-info.mp3` are gone. The reel is
  silent again (sound bed `S` and reel HUD unchanged).
* **One radius, everywhere** (`enhance.css` block 24): cards 16 px with
  their key chip and LIT stamp inset 8 px and rounded 8 px; skill chips,
  resume button, coach toast 10 px; vinyl mask 6 px; deck photo boards
  12 px with the site tag inset 10 px; deck sheets, close key, meta
  chips and rail keys 8–12 px; dock as before (14/11 px).
  Drawings deliberately stay sharp — a sheet of paper does not round
  its corners.
* QA: `shoot8` sweep + `shoot5` decks — zero console errors; stamps,
  chips and boards all clip cleanly inside their new corners.

## WAVE 9 — the cards, revised

Card copy now rests exactly as the client revised it: key, title,
tech line, one description — the proof/metric lines
(`C21 Mall Indore · 14 fascias…`, `Xiaomi · Nokia…`, `350 cd/m²…`)
are removed from `config.js` (app.js already skips a missing `proof`),
and E reads "Digital–Physical integration". The "Process ↗" chip no
longer sits on the card at rest: it sleeps at opacity 0 and wakes on
hover / focus-within, so the deck entry stays discoverable without
adding words the revision removed. The compact E card clamps its line
at three so the full sentence shows. Deck top bar recased to match.

## WAVE 10 — SARKAR, thinned and scaled

* `.big .l2` (SARKAR) is now **40% smaller** than RANJAN
  (`font-size: .6em` → 96 px against 160 px at 1440w) and set at
  **weight 400 — the lightest cut Playfair Display actually ships**
  (the family's axis starts at 400; there is no Thin).
* To honour the "thin" request without a fake font file, the line gets
  **optical thinning**: `-webkit-text-stroke: 1.5px var(--bg)`
  (0.8 px ≤760px) shaves the stems in the page colour until the face
  reads a weight lighter — a standard display-size trick.
* Italic and ArtViSiON red retained; RANJAN unchanged.
  QA: `qa/shoot11.mjs` desktop + 390 px, zero errors.

## WAVE 11 — undo of wave 10 + the status line, revised

* **Wave 10 undone** at user request: SARKAR returns to full size,
  weight 500 italic red — no `.6em`, no optical-thinning stroke.
* Hero status line (`config.js`) now reads:
  "360° A-to-Z Production & End-to-End Branding Design to Execution
  Solutions" (replaces "Open to Creative Lead & Design Manager roles").
  It renders through `textContent`, so the ampersand stays literal.

## WAVE 12 — role revised, flag guaranteed

* Role line (`config.js`) now reads "Creative Lead · Production Design
  to Execution".
* The credit line carries India after the city: `city: "Indore, M.P. 🇮🇳"`.
  Because emoji flags render as box-glyphs (or "IN") on Windows and in
  any environment without a colour-emoji font, `enhance.js` swaps the
  emoji at render time for an **inline SVG tricolour** (`.x-flag`,
  baseline-seated, hairline ring) — the flag looks identical everywhere.

## WAVE 13 — credit block, re-ordered

The hero credit block now leads with the promise and ends with the
place, as revised:

1. *Creative Lead · Production Design to Execution* (role, serif italic)
2. 360° A-TO-Z PRODUCTION & END-TO-END BRANDING DESIGN TO EXECUTION SOLUTIONS
3. INDORE, M.P. + inline SVG tricolour

`app.js` still joins `city + " · " + status` into `#iStatus`; the
wave-13 block in `enhance.js` splits on that first separator and
rebuilds two `.x-cred-line` blocks in the new order (flag swap folded
into the same pass).

## Wave 14 — About: experience strip + "Freelancing" (additive)

- `config.js`: new fields `aboutStripLead` ("12 Years Retail Merchandise Working
  Experience of") and `aboutStripList` (ADVERTiSiNG / BRANDiNG / CREATiVE /
  DESiGNiNG / EXECUTiON — branded casing kept verbatim, incl. lowercase i).
  `aboutText` now reads "Freelancing as ArtViSiON Production Design" (was
  "Founder of …"); resume role line @73 → "Freelancing & Creative Lead".
- `enhance.js` (wave-14 IIFE): injects `.x-strip` after `#aText` — tracked-uppercase
  lead line, then a `➤ … • … ➤` row (red arrows/bullets via `.x-ar`/`i`), 2px red
  left rule. No content invented; copy is the user's supplied string only.
- `enhance.css`: `.x-strip*` family; ≤760px guards — `#s-about .ab` scrim panel
  (character stands in the copy column on phones), `.x-brk` craft fig folded,
  `.inner` top clearance under the fixed bar, coach toast hidden while
  `#s-about.on` holds the phone stage.
- QC: `qa/shoot12.mjs` (scroll-to-`#s-about.on`, 1440×900 + 390×844) →
  `qa/89-about-1440.png`, `qa/89-about-390.png`, console `ERRORS []`.
  Run it from `/home/user` (script writes `qa/…` relative to CWD).

## Wave 15 — every service card tells its whole story (additive)

- User directive: the full card copy (key letter, service, sub-head, description)
  must be visible on all five cards, and Execution must read like its four
  siblings. Copy itself was already exact in `config.js projects` — no content
  changes, only render rules.
- `enhance.js` (wave-15 IIFE): tags the fifth card `.x-e`; at ≥761px reparents it
  into `#s-work .inner` after `.whead` (header row, column 4 — still above
  Designing per wave-6); at ≤760px returns it to `.cards` as the fifth snap card.
  Nodes keep their listeners, so the click/keyboard → `openCase(4)` wiring and
  the night-install scrub follow the node (verified: E opens the Execution deck).
- `enhance.css` block 26: `.ln` descriptions return in the 761–1180 band;
  `#s-work .inner` becomes a 4-col grid (rows `minmax(0,1fr) auto`): whead r1 c1-3,
  `.cards` r2 c1-5, `#s-work .x-e` r1 c4 — id-qualified because wave-5's
  `.card:nth-child(2)` placement otherwise claims E (2nd child of `.inner`);
  E = flex column, photo crops via `flex:1/min-height:0`, `margin-top:3.4rem`
  yields the top band to the dock's wave-5 perch; film-gate cap (`#x-strip
  .tk.on .cap`) and the coach tip (761–1100) fade while work holds the stage.
- QC: `qa/shoot13.mjs` — card reveal is SCROLL-SCRUBBED (inline opacity per band
  progress), so the script rides the band in 90px ticks until all five cards hit
  opacity 1, then shoots: `qa/90-work-1440/1000/390.png`, `ERRORS []`.
  `qa/probe10.mjs`: click `.x-e .imw` → Execution deck opens.

## Wave 16 — experience strip becomes one standing line (user reversal)

- User directive: the wave-14 composite ("…Experience of ➤ ADVERTiSiNG • …
  EXECUTiON ➤") is replaced by the single line
  "12 Years Retail Merchandise Working Experience". The arrow/bullet row is
  retired from the About strip (branded-casing list no longer displayed there).
- `config.js`: `aboutStripLead` → the short line; `aboutStripList` removed.
- `enhance.js`: wave-14 IIFE now renders the `➤…➤` row only when a list exists
  (guard keeps the plate = red rule + tracked line, nothing dangling).
- QC: `qa/shoot12.mjs` → `qa/89-about-1440.png` / `89-about-390.png`, `ERRORS []`;
  line wraps to two rows inside the phone scrim panel, no collisions.

## Final cleanup pass (post wave-16, no visual change)

- Bug fixed: `config.js` no longer carries `filmSrc` / `filmSrcMobile`. Neither
  mp4 exists in the repo (both 404 on the live Pages host), so every load bought
  two failed requests before the keyframe fallback ran. `app.js probeFilm()`
  no-ops without the fields — site runs on the keyframe sequence, identical look.
- Dead code removed: wave-5 landscape `.card:nth-child(5)…` block (Execution left
  that niche in wave-15), `.card .pf` type rule (proofs retired wave-9),
  `.x-strip-d` / `.x-ar` rules (arrow row retired wave-16); wave-14 IIFE in
  `enhance.js` reduced to the single lead line.
- `live.html` (byte-identical duplicate of the pre-enhancement `index.html`)
  is not part of the final tree / zip — dead weight in the repo.
- QA: `qa/sweep.mjs` — full-runway scroll both viewports + all five process
  decks open/close + mode switches + sound toggle → console errors, HTTP ≥400
  and failed requests all `[]`. `qa/shoot12/13` re-verified About + Work bands
  pixel-identical to the approved wave-15/16 state.
- Deliverable: `character--github-final.zip` (workspace root) = this folder's
  tree at repo-root layout, ready for `rjsarkar83/character-` @ `master`.

## Final pass 2 — résumé joins the radius system (user order)

- Wave-8's deliberate paper exception ("a sheet of paper does not round its
  corners") retired by user directive: `.paper` now carries the deck-sheet
  corner (12px) and the `Download résumé ↓` button (`.dl`) the button corner
  (10px) — `enhance.css` block 27; block-24 comment updated to match.
- QC: `qa/shoot14.mjs` → `qa/91-resume-1440.png` / `91-resume-390.png`,
  `ERRORS []`; both surfaces rounded at both widths, nothing else moved.
- `character--github-final.zip` rebuilt with this change.

## Wave 18 — character scale, pictogram system, AVIF media (user order)

- **Character display size:** `#film video, #film .fr` now 76% of the band at
  ≥761px and 90% on phones (mask edge-fade keeps the band seamless) — the
  full-height figure read too large; composition otherwise untouched.
- **Pictogram system (user's `uploads/icons.html`):** 24 glyphs from the user's
  own 24×24 / 1.5-stroke / one-red-per-glyph set inlined as an SVG sprite
  (`enhance.js` block 28, stroke → currentColor) and set like a vector artist's
  portfolio: service titles (advertising/branding/creative/designing/execution),
  section eyebrows (brief/concept/grid/card/dispatch), dock keys
  (kiosk/drawing/clock/neon/daynight), all 12 skill chips, and the résumé
  button. Placement CSS in `enhance.css` block 28.
- **AVIF:** all 60 frame/work/case JPEGs re-encoded to `.avif` (PIL +
  pillow-avif-plugin, q50 frames / q55 boards, speed 8); `config.js` +
  `enhance.js` refs flipped; source JPGs removed (media 6.7 MB → 4.4 MB).
  `media/og.jpg` stays JPEG on purpose (social crawlers); work/case JPGs
  archived at workspace `archive-jpg/` for the deck source.
- **Duplicates:** hash audit found no duplicate media files; the stale JPG
  twins of the new AVIFs were the duplicates and are gone (`live.html` was
  retired in the final cleanup pass).
- QC: `qa/sweep.mjs` (both viewports, decks, modes, sound) + `qa/shoot12/13/14/15`
  → console/network all `[]`; icons + scale verified at 1440 and 390.
- `character--github-final.zip` rebuilt with this wave.

## Resume PDF refreshed (user-supplied file)

- `media/resume.pdf` replaced with the user's attached
  `Ranjan_Sarkar_Resume.pdf` (2 pages, 455 KB, valid %PDF-1.4 → %%EOF) —
  was a 2.9 MB build. The `Download résumé ↓` button (`#rDl`, href from
  `config.js resume`) picks it up with no code change; served 200 locally.
- `character--github-final.zip` rebuilt with the new PDF.

## AVIF quality pass (user: character quality kharab)

- First AVIF encode (q50/speed8) banded on the character's smooth gradients.
  Original frame JPEGs re-pulled from the live Pages host (still 200 there),
  frames re-encoded at **q72 / speed 4**, work+case boards at **q68 / speed 4**
  (sources: workspace `/tmp/fr` pull + `archive-jpg/`).
- Frames 507 KB → 927 KB of AVIF for visibly clean gradients; media total
  3.0 MB. Crop inspect `qa/94-frame-crop.png`; bands re-shot (`qa/shoot12/13`,
  `ERRORS []`).
- `character--github-final.zip` rebuilt.

## Wave 19 — Rj_Portfolio launch + 2027 SEO/viral layer

- New home: repo **`Rj_Portfolio`** (branch `master`, Pages from repo root) →
  `https://rjsarkar83.github.io/Rj_Portfolio/`. All asset paths are relative,
  so the subpath host works unchanged.
- `index.html` head: absolute canonical/OG/Twitter URLs (og.jpg 1200×630 with
  width/height/alt), robots meta, font + first-frame preloads, and a
  Schema.org `@graph` (Person + WebSite + ItemList of the five services).
- Root files added: `robots.txt` (AI answer-engine crawlers allowed),
  `sitemap.xml`, branded `404.html`, `llms.txt` (AI-search fact sheet),
  `STRATEGY-2027.md` (growth/viral playbook: share graph, content engine,
  distribution loops, AI-search optimisation, measurement, 90-day targets).
- QC: `qa/sweep.mjs` clean after the head changes.

## Deploy to your GitHub Pages repo

1. Copy `enhance.css` and `enhance.js` into the repo root (next to `style.css`).
2. In `index.html`, add two lines:

```html
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="enhance.css">   <!-- ← added -->
...
<script src="app.js"></script>
<script src="enhance.js"></script>           <!-- ← added -->
```

That is the entire change. `config.js` keeps driving all copy; the layer reads it.
Remove the two lines and the site is exactly what it was.

Console handle for poking at it: `X.setMode('draw') · X.setMode('lit') · X.to(26.5) · X.sound`.
