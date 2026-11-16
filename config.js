/* ============================================================
   config.js — your 13 brief answers. Edit ONLY the text inside
   the quotes. Nothing else in the site needs to be touched.
   ============================================================ */
window.CONFIG = {

  /* 1 · 2 · 3 — name, role, status -------------------------- */
  name:      "Ranjan Sarkar",
  barName:   "Rj_Sarkar",          /* wave-22: top-left brand, as written */
  nameLine1: "RANJAN",
  nameLine2: "SARKAR",
  role:      "Creative Lead · Production Design to Execution",
  city:      "Indore, M.P. 🇮🇳",
  status:    "360° A-to-Z Production & End-to-End Branding Design to Execution Solutions",

  /* 13 — accent colour (ArtViSiON red) ---------------------- */
  accent:    "#E30613",

  /* 4 · 5 · 6 — about --------------------------------------- */
  aboutTitle: "I draw the identity and the bracket that holds it up.",
  aboutText:  "Twelve years taking retail and environmental brand work from the first " +
              "sketch all the way to the installed, lit and inspected object. I am the " +
              "person who stays on site at two in the morning while the fascia goes up. " +
              "Freelancing as ArtViSiON Production Design; before that Creative Director at " +
              "BrandSutra Media Convergence.",
  /* wave-16: the strip is a single standing line — the arrow row retired */
  aboutStripLead: "12 Years Retail Merchandise Working Experience",
  stats: [
    { n: "10,000+", l: "retail signage units" },
    { n: "150+",    l: "identities built" },
    { n: "15+",     l: "sectors served" }
  ],

  /* 7 — the five services ----------------------------------- */
  workTitle: "Five services.<br>One pair of hands.",
  projects: [
    { key:   "A",
      title: "Advertising",
      tech:  "Event design",
      line:  "Stands, portals and stages drawn, fabricated and standing by the morning.",
      img:   "media/camp/t/a09.webp" },

    { key:   "B",
      title: "Branding",
      tech:  "National retail rollout",
      line:  "One ratio drawing that survives 300+ shopfronts in 15 sectors without a redraw.",
      img:   "media/camp/t/b21.webp" },

    { key:   "C",
      title: "Creative",
      tech:  "Startup identity",
      line:  "A mark, a construction grid and the production files that ship on day one.",
      img:   "media/camp/t/c31.webp" },

    { key:   "D",
      title: "Designing",
      tech:  "Architectural CNC",
      line:  "Artwork redrawn as geometry a router can cut, to ±0.5 mm over 2400 mm.",
      img:   "media/camp/t/d41.webp" },

    { key:   "E",
      title: "Execution",
      tech:  "Digital–Physical integration",
      line:  "Backlit fabrication and live screens detailed to read as one continuous surface.",
      img:   "media/camp/t/e51.webp" }
  ],

  /* 8 — skills ---------------------------------------------- */
  skills: ["CorelDRAW", "Illustrator", "Photoshop", "Affinity",
           "Canva", "Microsoft Office", "GitHub", "Wix",
           "Printing Machine", "Product and Packaging", "ACP Fabrication", "CNC Routing",
           "Signage Engineering", "Brand Identity", "Retail Rollout",
           "Site Recce", "Quality Control", "Vinyl & Large Format"],

  /* 9 · 10 — experience and education ----------------------- */
  experience: [
    { role: "Freelancing & Creative Lead", org: "ArtViSiON Production Design · Indore", yr: "2024 — present" },
    { role: "Creative Director",       org: "BrandSutra Media Convergence",         yr: "2021 — 2024" }
  ],
  education: [
    { role: "AAASP Diploma", org: "Arena Animation", yr: "" },
    { role: "Production Designer → Sr. Brand Designer", org: "BrandSutra", yr: "2015 — 2021" }
  ],
  resume: "media/resume.pdf",

  /* 11 — contact -------------------------------------------- */
  email: "rjsarkar@icloud.com",
  phone: "+91 900 900 1551",
  links: [
    { label: "Portfolio", url: "https://sites.google.com/view/rjsarkar" },
    { label: "GitHub",    url: "https://rjsarkar83.github.io/Brand_Designer" }
  ],
  contactTitle: "LET'S BUILD<br>SOMETHING REAL.",

  /* ---------------------------------------------------------
     FILM SOURCE — keyframe sequence only (final cleanup):
     filmSrc / filmSrcMobile retired; neither mp4 ships with the
     repo, so probing them only bought a 404 per load. app.js's
     probeFilm() no-ops without these fields and the site runs
     on the keyframe sequence below, exactly as it looks today.
     --------------------------------------------------------- */
  filmDuration:  46,

  /* keyframes: the film-second each still represents --------- */
  frames: [
    { t: 0.0 , a: "180\u00b0 behind", hw: 0.067, src: "media/frames/x0_back.webp", m: "media/frames/x0_back_m.webp" },
    { t: 1.2 , a: "157\u00b0 turning", hw: 0.076, src: "media/frames/x0a_turn157.webp", m: "media/frames/x0a_turn157_m.webp" },
    { t: 2.4 , a: "135\u00b0 turning", hw: 0.086, src: "media/frames/x1a_turn135.webp", m: "media/frames/x1a_turn135_m.webp" },
    { t: 3.3 , a: "112\u00b0 turning", hw: 0.081, src: "media/frames/x1c_turn112.webp", m: "media/frames/x1c_turn112_m.webp" },
    { t: 4.2 , a: "90\u00b0 side", hw: 0.076, src: "media/frames/x1b_turn90.webp", m: "media/frames/x1b_turn90_m.webp" },
    { t: 5.1 , a: "67\u00b0 turning", hw: 0.080, src: "media/frames/x1d_turn67.webp", m: "media/frames/x1d_turn67_m.webp" },
    { t: 6.0 , a: "45\u00b0 three-qtr", hw: 0.083, src: "media/frames/x1_turn45.webp", m: "media/frames/x1_turn45_m.webp" },
    { t: 6.8 , a: "22\u00b0 turning", hw: 0.076, src: "media/frames/x1e_turn22.webp", m: "media/frames/x1e_turn22_m.webp" },
    { t: 7.6 , a: "0\u00b0 front", hw: 0.069, src: "media/frames/x2_front.webp", m: "media/frames/x2_front_m.webp" },
    { t: 9.9 , a: "first step", hw: 0.079, src: "media/frames/x2a_step1.webp", m: "media/frames/x2a_step1_m.webp" },
    { t: 12.2, a: "second step", hw: 0.079, src: "media/frames/x2b_step2.webp", m: "media/frames/x2b_step2_m.webp" },
    { t: 14.6, a: "15\u00b0 medium", hw: 0.063, src: "media/frames/x3_steps.webp", m: "media/frames/x3_steps_m.webp" },
    { t: 16.4, a: "reaching back", hw: 0.090, src: "media/frames/x3a_turnsit.webp", m: "media/frames/x3a_turnsit_m.webp" },
    { t: 18.2, a: "lowering", hw: 0.085, src: "media/frames/x3b_lower.webp", m: "media/frames/x3b_lower_m.webp" },
    { t: 20.0, a: "40\u00b0 seated", hw: 0.075, src: "media/frames/x4_sit.webp", m: "media/frames/x4_sit_m.webp" },
    { t: 22.2, a: "leaning in", hw: 0.081, src: "media/frames/x4a_lean.webp", m: "media/frames/x4a_lean_m.webp" },
    { t: 24.3, a: "desk arrives", hw: 0.168, src: "media/frames/x4b_deskin.webp", m: "media/frames/x4b_deskin_m.webp" },
    { t: 26.5, a: "high front", hw: 0.168, src: "media/frames/x5_desk.webp", m: "media/frames/x5_desk_m.webp" },
    { t: 29.0, a: "pushing back", hw: 0.168, src: "media/frames/x5a_push.webp", m: "media/frames/x5a_push_m.webp" },
    { t: 30.2, a: "stepping out", hw: 0.213, src: "media/frames/x5b_stepout.webp", m: "media/frames/x5b_stepout_m.webp" },
    { t: 31.5, a: "70\u00b0 standing", hw: 0.234, src: "media/frames/x6_stand.webp", m: "media/frames/x6_stand_m.webp" },
    { t: 34.5, a: "80\u00b0 striding", hw: 0.303, src: "media/frames/x6a_stride.webp", m: "media/frames/x6a_stride_m.webp" },
    { t: 37.5, a: "90\u00b0 profile", hw: 0.147, src: "media/frames/x7_walk.webp", m: "media/frames/x7_walk_m.webp" },
    { t: 39.9, a: "reaching up", hw: 0.135, src: "media/frames/x7a_reach.webp", m: "media/frames/x7a_reach_m.webp" },
    { t: 42.3, a: "25\u00b0 pulling", hw: 0.145, src: "media/frames/x8_pull.webp", m: "media/frames/x8_pull_m.webp" },
    { t: 44.0, a: "arms lowering", hw: 0.093, src: "media/frames/x8a_lower.webp", m: "media/frames/x8a_lower_m.webp" },
    { t: 45.7, a: "0\u00b0 wave", hw: 0.110, src: "media/frames/x9_wave.webp", m: "media/frames/x9_wave_m.webp" }
  ],

  /* ---------------------------------------------------------
     TIMELINE — straight from the guide's timing table.
     hold = the film freezes here so the section can be read.
     --------------------------------------------------------- */
  holds: [
    { id: "intro",   at: 7.6,  from: 3.0,  to: 8.6  },
    { id: "about",   at: 14.6, from: 10.2, to: 15.6 },
    { id: "work",    at: 26.5, from: 24.8, to: 28.8, mul: 1.7 },
    { id: "skills",  at: 37.5, from: 31.2, to: 39.2, mul: 1.2 },
    { id: "resume",  at: 42.3, from: 39.9, to: 43.6 },
    { id: "contact", at: 45.7, from: 44.4, to: 46.0 }
  ],

  /* AI disclosure — keep this. It is what makes the format safe. */
  disclosure: "The character is a stylised 3D render of Ranjan Sarkar, built from his own " +
              "photograph. The five service visuals are location reference photography " +
              "(Pexels licence), not renders. The projects, drawings, tolerances and " +
              "clients they describe are real work."
};
