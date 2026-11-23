# Ranjan Sarkar — ArtViSiON Production Design

Static portfolio. Koi build step nahi — seedha GitHub Pages par upload karo.

## Files

| File | Kaam |
|---|---|
| `index.html` | poora page (nav, hero/film stage, mobile home, work, about, contact) |
| `style.css`, `enhance.css`, `portfolio-ui.css`, `mobile.css` | base + desktop + intro + mobile styles |
| `rj-ph.css`, `rj-mobile-hero.css` | mobile home (particle stage), hero layer |
| `app.js`, `enhance.js`, `mobile.js`, `portfolio-boot.js` | desktop + mobile behaviour, boot chain |
| `rj-ph.js` | **particle engine + 15-stage sequence** (FIG. 01–15) |
| `rj-mobile-hero.js`, `portfolio-cases.js`, `service-plates.js`, `workshop-gallery.js`, `workshop-entry.js`, `intro-player.js`, `config.js` | hero, case pages, plates, workshop, intro player |
| `media/` | frames, mobile art, workshop images, poster, résumé |
| `fonts/` | self-hosted Montserrat + Playfair |

## Upload

1. Naya repo banao (ya `Rj_Portfolio` me daalo).
2. Is folder ka **andar ka content** repo root me daalo (`index.html` root par ho).
3. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
4. `https://<user>.github.io/Rj_Portfolio/` par live.

Sab paths relative hain — repo naam kuch bhi ho, chalega.

## Look

Ek hi look: **dark ground, red signal, paper-type headlines**. Day/night toggle nahi hai.

## Bottom tab bar (Home · Work · About · Contact)

- Bar **scroll par chhupti nahi** — fix rehti hai.
- Jo section screen par hai, uska tab **scroll ke saath colour badalta hai**: text pehle grey → active par light red, icon ke peeche maroon chip, neeche red underline, aur upar ek chhota live dot. Ye `--tab-heat` (0–1) se chalta hai, `mobile.js` me `aimTabs()` + `paintTabs()`.
- Home route long hai: hero/character/film card = **Home**, "Selected work" = **Work**, "The day job / The numbers" = **About**, "Same pair of hands" = **Contact**.
- Work / About / Contact pages par seedha wahi tab active rehta hai.

## Sequence (FIG. 01–15)

01 character → 02 acrylic → 03 ACP cladding → 04 event advertising → 05 branding product → 06 brand identity → 07 stationery → 08 packaging → 09 2D layout plan → **10 Advertising → 11 Branding → 12 Creative → 13 Designing → 14 Execution → 15 End-to-End Solution (360° · A to Z)**.

Tuning `rj-ph.js` ke top par: `COUNT`, `SEQ`, `NODES`, `SAMPLE`, `settle`.

## Cleanup (is build me)

- Duplicate `media/rjh/` folder hata diya — site-log strip ab wahi `media/frames/*_m.webp` cuts use karta hai.
- `media/artvision-mobile/mark.webp` (purana logo) delete.
- `style.css` ke `fonts/Inter-*.ttf` `@font-face` hata diye (files repo me kabhi thi hi nahi → 404) — body ab self-hosted **Montserrat** par hai.
- Intro player ab film file ki pehle probe karta hai: `media/artvision-working-line/` upload na ho to console me 404 nahi, screen par seedha saaf message aata hai.
- Verified: mobile 390×844 aur desktop 1440×900 — **0 console error, 0 page error, 0 missing file** (home / #work / #about / #contact).

## Video film (optional)

`media/artvision-working-line/` folder khali hai — `ArtViSiON_Intro_Hindi_Bharat.mp4` (+ `.vp9.webm`), Bengali aur English versions wahaan daalo to "Play video" chal jayega. Poster ki zarurat nahi, player khud handle karta hai.

## Logo

`media/artvision-mobile/mark-rj.svg` — `logo_original.html` se nikala gaya static RJ figure (`currentColor`; dark header par safed).
