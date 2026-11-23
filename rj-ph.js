/* ============================================================
   rj-ph.js  ·  mobile home, "paper" edition
   White paper + red type + a character that assembles out of
   ~4200 red particles as you scroll. Mobile route only.
   Reuses the frames already on the server (media/frames/*_m.webp).
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  if (root.dataset.rjLayout !== 'mobile') return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var RED = '#e30613', INK = '#111214';
  var PANEL = 900;          // one panel per frame, in px of scroll
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- pose list (measured alpha boxes on the server frames) ---------- */
  var POSES = [
    { f: 'x2_front_m.webp',     b: [179, 97, 540, 842] },
    { f: 'x1e_turn22_m.webp',   b: [170, 97, 550, 842] },
    { f: 'x1_turn45_m.webp',    b: [160, 97, 560, 842] },
    { f: 'x1b_turn90_m.webp',   b: [150, 97, 572, 842] },
    { f: 'x1c_turn112_m.webp',  b: [157, 98, 561, 840] },
    { f: 'x1a_turn135_m.webp',  b: [162, 98, 556, 841] },
    { f: 'x0a_turn157_m.webp',  b: [172, 97, 548, 842] },
    { f: 'x0_back_m.webp',      b: [180, 97, 540, 842] },
    { f: 'x_jump_crouch_m.webp',b: [135, 98, 584, 841] },
    { f: 'x_jump_air_m.webp',   b: [117, 74, 602, 817] },
    { f: 'x8a_lower_m.webp',    b: [145, 98, 575, 842] },
    { f: 'x9_wave_m.webp',      b: [157, 98, 561, 840] },
    { f: 'x2a_step1_m.webp',    b: [142, 98, 574, 841] },
    { f: 'x2b_step2_m.webp',    b: [140, 98, 576, 841] },
    { f: 'x3_steps_m.webp',     b: [186, 98, 532, 841] },
    { f: 'x4_sit_m.webp',       b: [190, 140, 530, 842] },
    { f: 'x5_desk_m.webp',      b: [110, 150, 610, 842] },
    { f: 'x6_stand_m.webp',     b: [150, 110, 570, 842] },
    { f: 'x7_walk_m.webp',      b: [107, 98, 613, 840] }
  ];

  var SAMPLE = 760;          // working resolution of the sampled bitmap
  var COUNT = 23000;         // particles (drawn as ink squares: cheap + crisp)
  var INK = 22;              // character ink threshold — low keeps eyes, brows, mouth
  var SHARPEN = 2.8;         // local contrast boost before thresholding
  var loaded = {};           // file -> {img, data, w, h}

  /* =========================================================
     boot
     ========================================================= */
  function start() {
    var home = document.querySelector('[data-m-page="home"]');
    if (!home) { setTimeout(start, 220); return; }
    if ($('.ph', home)) return;

    root.classList.add('rj-ph');
    build(home);
  }

  function build(home) {
    var wrap = document.createElement('div');
    wrap.className = 'ph';
    wrap.innerHTML =
      coverHTML() +
      bandHTML() +
      secHTML('01', 'The day job', 'Retail signage, brand identity and production design — twelve years of it, from the first sketch to the <em>installed, lit, inspected</em> object.',
              '12', 'years on site',
              'Indore · M.P. · pan-India rollouts') +
      bandHTML() +
      secHTML('02', 'The numbers', 'Twelve years on site, ten thousand signage units and a hundred and fifty identities later — the numbers behind the work.',
              '10k+', 'signage units', '150+ identities · 15 sectors') +
      bandHTML() +
      outroHTML();

    var hero = $('.m-hero', home);
    home.insertBefore(wrap, hero || home.firstChild);

    /* the film cover moves into the first section */
    var cover = $('.m-cover', home);
    if (cover) {
      var sec = wrap.querySelector('.ph-sec');
      if (sec) sec.appendChild(cover);
    }

    tabbar = document.getElementById('m-tabbar') || tabbar;
    if (tabbar) tabbar.classList.remove('ph-tab-hide');   /* the bar stays put now */
    document.body.classList.add('rj-ph-on');
    mountCanvas();
    hookScroll();
  }

  /* ---------- markup ---------- */
  var SEQ = [
    { shot: 'FIG. 01', word: 'The character', note: 'Ranjan Sarkar · in particles' },
    { shot: 'FIG. 02', word: 'Acrylic signage', note: 'Outdoor · face-lit · box frame' },
    { shot: 'FIG. 03', word: 'ACP cladding', note: 'Facade · rainscreen · sub-frame',
      subs: ['FACADE', 'RAINSCREEN', 'SUB-FRAME'] },
    { shot: 'FIG. 04', word: 'Event advertising', note: 'Arch gate · stand · standee',
      subs: ['ARCH GATE', 'STAND', 'STANDEE'] },
    { shot: 'FIG. 05', word: 'Branding product', note: 'Merch · kit · giveaway' },
    { shot: 'FIG. 06', word: 'Brand identity', note: 'Mark · type · colour',
      subs: ['MARK', 'TYPE', 'COLOUR'] },
    { shot: 'FIG. 07', word: 'Stationery', note: 'Card · letterhead · docket' },
    { shot: 'FIG. 08', word: 'Packaging', note: 'Mailer · label · seal',
      subs: ['MAILER', 'LABEL', 'SEAL'] },
    { shot: 'FIG. 09', word: '2D layout plan', note: 'Elevations · sections · BOQ' },
    { shot: 'FIG. 10', word: 'Advertising', note: 'Campaign · 360° · media · install', pillar: 1 },
    { shot: 'FIG. 11', word: 'Branding', note: 'Naming · identity · kit · guard', pillar: 1 },
    { shot: 'FIG. 12', word: 'Creative', note: 'Concept · art direction · pitch', pillar: 1 },
    { shot: 'FIG. 13', word: 'Designing', note: 'Survey · drawings · approvals', pillar: 1 },
    { shot: 'FIG. 14', word: 'Execution', note: 'Production · site · install · live', pillar: 1 },
    { shot: 'FIG. 15', word: 'End-to-End Solution', note: 'One scope',
      subs: ['360°', 'A TO Z', 'END TO END'], close: 1 }
  ];

  function coverHTML() {
    return '' +
      '<section class="ph-cover" aria-labelledby="ph-title">' +
        '<div class="ph-cover__pin">' +
        '<p class="ph-say" id="ph-say">' +
          '<b id="ph-say-k">FIG. 01</b>' +
          '<em id="ph-say-w">The character</em>' +
          '<span id="ph-say-n"><b class="ph-say-l">Ranjan Sarkar</b><i class="ph-say-s" id="ph-say-subs"><em></em><em></em><em></em></i></span>' +
        '</p>' +
        '<h1 class="ph-sr" id="ph-title">Ranjan Sarkar — design to execution</h1>' +
        '<div class="ph-stage" id="ph-stage">' +
          '<canvas id="ph-canvas" role="img" aria-label="One set of red particles transforming on scroll: the character, acrylic signage, an ACP facade, advertising, inshop branding, then a 2D layout plan"></canvas>' +
        '</div>' +
        '<div class="ph-cover__foot">' +
          '<p class="ph-scrollcue"><span></span>Scroll</p>' +
          '<p class="ph-scrollcue" id="ph-st-count" style="letter-spacing:.14em">01 / 09</p>' +
        '</div>' +
        '</div>' +
      '</section>';
  }

  function bandHTML() {
    var words = ['Signage engineering', 'Brand identity', 'ACP facade', 'CNC routing',
                 'Retail rollout', 'Vinyl & large format', 'Site recce', 'Quality control'];
    var line = words.concat(words).map(function (w) { return '<span>' + w + '<i></i></span>'; }).join('');
    return '<div class="ph-band" aria-hidden="true"><div class="ph-band__track">' + line + '</div></div>';
  }



  function secHTML(num, title, body, figure, unit, note) {
    return '' +
      '<section class="ph-sec">' +
        '<p class="ph-sec__num">(' + num + ')</p>' +
        '<h2 class="ph-sec__title">' + title + '</h2>' +
        '<p class="ph-sec__body">' + body + '</p>' +
        '<p class="ph-sec__figure"><b>' + figure + '</b><span>' + unit + '</span></p>' +
        '<div class="ph-rule"></div>' +
        '<p class="ph-sec__note">' + note + '</p>' +
      '</section>';
  }

  function outroHTML() {
    return '' +
      '<section class="ph-outro">' +
        '<p class="ph-kicker"><i style="background:#ff5a62"></i><b>Let’s build</b> something real</p>' +
        '<h2>Same pair of hands,<br><em>your brand next.</em></h2>' +
        '<p>Tell me the city, send a few site photos, add rough dimensions and a deadline. That’s enough to scope the first call.</p>' +
        '<div class="ph-outro__links">' +
          '<a href="https://wa.me/919009001551" target="_blank" rel="noopener">WhatsApp <b>↗</b></a>' +
          '<a href="mailto:rjsarkar@icloud.com">Email <b>↗</b></a>' +
          '<a href="tel:+919009001551">Call <b>↗</b></a>' +
          '<a href="https://www.behance.net/ranjansark83" target="_blank" rel="noopener">Behance <b>↗</b></a>' +
        '</div>' +
        '<div class="ph-outro__sig"><span>Ranjan Sarkar · ArtViSiON</span><span>Sheet RJ-01 · Rev C</span></div>' +
      '</section>';
  }


  /* =========================================================
     the process story — one particle field that transforms
     outdoor acrylic → ACP cladding facade → advertising &
     branding → inshop branding → the 2D layout sheet
     ========================================================= */
  var STAGES = [
    { k: '01', label: 'Outdoor acrylic signage', shot: 'SIGN 01 · OUTDOOR ACRYLIC',
      note: 'Face-lit acrylic · box frame · pylon',
      cap: 'A face-lit <em>acrylic signage</em> system, drawn to the millimetre before a single panel is cut.' },
    { k: '02', label: 'ACP cladding facade', shot: 'SIGN 02 · ACP FACADE',
      note: 'Rainscreen · routed reveal · sub-frame',
      cap: 'The same unit climbs the wall: <em>ACP cladding</em>, shadow joints and a structural sub-frame.' },
    { k: '03', label: 'Advertising & branding', shot: 'SIGN 03 · ADVERTISING',
      note: 'Retail · event · brand print',
      cap: 'Then the <em>advertising language</em> — one mark, one grid, every surface it lands on.' },
    { k: '04', label: 'Inshop branding design', shot: 'SIGN 04 · INSHOP',
      note: 'Counter · canopy · hanging board',
      cap: 'Inside the store the branding turns <em>inshop</em> — counters, canopies and wayfinding.' },
    { k: '05', label: '2D layout plan', shot: 'DRG 05 · 2D LAYOUT PLAN',
      note: 'Elevations · sections · title block',
      cap: 'And it all lands on one sheet: the <em>2D layout plan</em> a vendor can actually build from.' }
  ];
  var NST = STAGES.length;
  var SH_W = 600, SH_H = 904, NODES = 5200;
  var BOX = { x: 0, y: 0, w: 1, h: 1 };
  var stCv, stCx, stW = 0, stH = 0, stParts = [], stShapes = [], stCur = 0, stLast = -1;

  /* ---------- the five drawings, authored for a portrait stage ---------- */
  function drawShape(g, kind, w, h) {
    var R = RED, IN = 'rgba(17,18,20,.34)';
    g.lineCap = 'butt';
    function L(x1, y1, x2, y2, col, wid) {
      g.strokeStyle = col || R; g.lineWidth = wid || 1.6;
      g.beginPath(); g.moveTo(x1 * w, y1 * h); g.lineTo(x2 * w, y2 * h); g.stroke();
    }
    function B(x1, y1, x2, y2, col, wid) {
      g.strokeStyle = col || R; g.lineWidth = wid || 1.9;
      g.strokeRect(x1 * w, y1 * h, (x2 - x1) * w, (y2 - y1) * h);
    }
    function F(x1, y1, x2, y2, fill) {
      g.fillStyle = fill; g.fillRect(x1 * w, y1 * h, (x2 - x1) * w, (y2 - y1) * h);
    }
    function D(x1, y1, x2, y2) {
      L(x1, y1, x2, y2, IN, 1.2);
      L(x1, y1 - 0.012, x1, y1 + 0.012, IN, 1.2);
      L(x2, y2 - 0.012, x2, y2 + 0.012, IN, 1.2);
    }

    if (kind === 'acrylic') {                     /* pylon: panel over a post, standing */
      L(0.10, 0.90, 0.90, 0.90, IN, 1.4);
      F(0.14, 0.10, 0.86, 0.40, 'rgba(227,6,19,.06)');
      B(0.14, 0.10, 0.86, 0.40);
      B(0.18, 0.13, 0.82, 0.37, R, 1.1);
      L(0.24, 0.18, 0.74, 0.18, R, 2.8);          /* name */
      L(0.24, 0.245, 0.58, 0.245, R, 1.8);
      L(0.24, 0.30, 0.66, 0.30, R, 1.8);
      B(0.42, 0.40, 0.58, 0.86);                  /* post */
      L(0.42, 0.52, 0.58, 0.52, IN, 1.1);
      L(0.42, 0.70, 0.58, 0.70, IN, 1.1);
      B(0.32, 0.83, 0.68, 0.90);                  /* base plate */
      D(0.08, 0.10, 0.08, 0.90);                  /* height */
    } else if (kind === 'acp') {                   /* cladding facade carrying a loud sign */
      L(0.05, 0.93, 0.95, 0.93, IN, 1.5);
      B(0.10, 0.20, 0.90, 0.93);                   /* the clad elevation */
      var c, r;
      for (c = 1; c < 6; c++) L(0.10 + c * 0.1333, 0.20, 0.10 + c * 0.1333, 0.93, 'rgba(17,18,20,.16)', 1.1);
      for (r = 1; r < 6; r++) L(0.10, 0.20 + r * 0.146, 0.90, 0.20 + r * 0.146, 'rgba(17,18,20,.16)', 1.1);
      F(0.10, 0.04, 0.90, 0.20, 'rgba(227,6,19,.07)');
      B(0.10, 0.04, 0.90, 0.20, R, 3);              /* the fascia / signage band */
      L(0.167, 0.09, 0.29, 0.09, R, 9);             /* A R T */
      L(0.32, 0.09, 0.43, 0.09, R, 9);
      L(0.46, 0.09, 0.58, 0.09, R, 9);
      L(0.64, 0.07, 0.85, 0.07, R, 3.4);            /* tagline */
      L(0.64, 0.135, 0.78, 0.135, R, 2.2);
      B(0.30, 0.30, 0.80, 0.44, R, 2.6);            /* wall sign */
      L(0.345, 0.35, 0.60, 0.35, R, 6.5);
      L(0.345, 0.405, 0.52, 0.405, R, 3.4);
      L(0.13, 0.62, 0.13, 0.93, IN, 1.6);           /* entrance reveal */
      B(0.13, 0.62, 0.48, 0.93, IN, 1.8);
      L(0.30, 0.62, 0.30, 0.93, IN, 1.2);
      B(0.56, 0.58, 0.74, 0.70, R, 1.8);            /* wall plaque */
      L(0.60, 0.63, 0.70, 0.63, R, 2.2);
      L(0.84, 0.20, 0.90, 0.26, IN, 1.4);           /* return edge */
      D(0.06, 0.04, 0.06, 0.93);
    } else if (kind === 'event') {                 /* arch gate, stand and standee */
      L(0.05, 0.92, 0.95, 0.92, IN, 1.5);
      /* arch gate */
      g.save();
      g.strokeStyle = R; g.lineWidth = 5; g.lineCap = 'butt';
      g.beginPath();
      g.moveTo(0.10 * w, 0.92 * h);
      g.lineTo(0.10 * w, 0.34 * h);
      g.quadraticCurveTo(0.10 * w, 0.10 * h, 0.32 * w, 0.10 * h);
      g.quadraticCurveTo(0.54 * w, 0.10 * h, 0.54 * w, 0.34 * h);
      g.lineTo(0.54 * w, 0.92 * h);
      g.stroke();
      g.beginPath();
      g.moveTo(0.16 * w, 0.92 * h);
      g.lineTo(0.16 * w, 0.36 * h);
      g.quadraticCurveTo(0.16 * w, 0.16 * h, 0.32 * w, 0.16 * h);
      g.quadraticCurveTo(0.48 * w, 0.16 * h, 0.48 * w, 0.36 * h);
      g.lineTo(0.48 * w, 0.92 * h);
      g.stroke();
      g.restore();
      F(0.16, 0.62, 0.48, 0.92, 'rgba(227,6,19,.05)');   /* the gate opening */
      L(0.19, 0.30, 0.45, 0.30, R, 3);                    /* name across the arch */
      L(0.24, 0.36, 0.40, 0.36, R, 1.8);
      /* stand / kiosk */
      B(0.62, 0.42, 0.96, 0.92);                   /* body */
      B(0.62, 0.42, 0.96, 0.52, R, 2.4);           /* header */
      L(0.67, 0.465, 0.91, 0.465, R, 3);
      L(0.66, 0.60, 0.92, 0.60, IN, 1.3);          /* counters */
      L(0.66, 0.70, 0.92, 0.70, IN, 1.3);
      B(0.66, 0.74, 0.78, 0.86, R, 1.8);           /* display */
      B(0.82, 0.74, 0.92, 0.86, IN, 1.8);
      /* standee */
      B(0.44, 0.60, 0.56, 0.90);                   /* board */
      L(0.47, 0.65, 0.53, 0.65, R, 2.2);
      L(0.47, 0.70, 0.52, 0.70, R, 1.6);
      L(0.46, 0.90, 0.54, 0.90, R, 2.4);           /* foot */
    } else if (kind === 'product') {                /* branding product: bottle, box, tube */
      L(0.05, 0.92, 0.95, 0.92, IN, 1.4);
      B(0.12, 0.34, 0.40, 0.92);                   /* bottle body */
      B(0.19, 0.26, 0.33, 0.34);                   /* neck */
      B(0.18, 0.19, 0.34, 0.26, R, 2);             /* cap */
      B(0.15, 0.50, 0.37, 0.66, R, 2);             /* label */
      L(0.19, 0.555, 0.33, 0.555, R, 2.4);
      L(0.19, 0.605, 0.29, 0.605, IN, 1.2);
      B(0.46, 0.52, 0.74, 0.92);                   /* box / carton */
      L(0.46, 0.60, 0.74, 0.60, IN, 1.2);
      B(0.51, 0.64, 0.69, 0.76, R, 1.8);           /* box logo */
      L(0.55, 0.70, 0.65, 0.70, R, 2);
      B(0.79, 0.44, 0.92, 0.78);                   /* tube */
      L(0.79, 0.50, 0.92, 0.50, IN, 1.2);
      B(0.80, 0.82, 0.91, 0.88, R, 1.6);           /* tube cap */
      L(0.82, 0.60, 0.89, 0.60, R, 1.8);
    } else if (kind === 'identity') {               /* the mark, on its construction grid */
      L(0.05, 0.93, 0.95, 0.93, IN, 1.4);
      /* construction grid */
      B(0.08, 0.08, 0.92, 0.52, 'rgba(17,18,20,.18)', 1.2);
      var gi, gj;
      for (gi = 1; gi < 4; gi++) L(0.08 + gi * 0.21, 0.08, 0.08 + gi * 0.21, 0.52, 'rgba(17,18,20,.10)', 1);
      for (gj = 1; gj < 2; gj++) L(0.08, 0.08 + gj * 0.22, 0.92, 0.08 + gj * 0.22, 'rgba(17,18,20,.10)', 1);
      /* a monogram: two interlocking rounded forms = the ArtViSiON eyes */
      g.save();
      g.strokeStyle = R; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(0.20 * w, 0.38 * h);
      g.bezierCurveTo(0.20 * w, 0.16 * h, 0.46 * w, 0.16 * h, 0.46 * w, 0.30 * h);
      g.bezierCurveTo(0.46 * w, 0.44 * h, 0.20 * w, 0.44 * h, 0.20 * w, 0.30 * h);
      g.stroke();
      g.beginPath();
      g.moveTo(0.54 * w, 0.38 * h);
      g.bezierCurveTo(0.54 * w, 0.16 * h, 0.80 * w, 0.16 * h, 0.80 * w, 0.30 * h);
      g.bezierCurveTo(0.80 * w, 0.44 * h, 0.54 * w, 0.44 * h, 0.54 * w, 0.30 * h);
      g.stroke();
      /* the bar through both, like the lens bridge */
      g.lineWidth = 5;
      g.beginPath(); g.moveTo(0.30 * w, 0.30 * h); g.lineTo(0.70 * w, 0.30 * h); g.stroke();
      g.restore();
      /* wordmark + tagline */
      L(0.22, 0.60, 0.78, 0.60, R, 6);             /* the wordmark bar */
      L(0.22, 0.68, 0.62, 0.68, R, 3.2);
      L(0.22, 0.745, 0.48, 0.745, IN, 1.6);
      /* colour chips with names */
      B(0.22, 0.79, 0.34, 0.86, R, 2);
      B(0.38, 0.79, 0.50, 0.86, IN, 2);
      B(0.54, 0.79, 0.66, 0.86, IN, 2);
      L(0.22, 0.90, 0.34, 0.90, IN, 1);
      L(0.38, 0.90, 0.50, 0.90, IN, 1);
      L(0.54, 0.90, 0.66, 0.90, IN, 1);
    } else if (kind === 'stationery') {             /* letterhead, card, envelope */
      B(0.10, 0.10, 0.62, 0.66);                   /* letterhead */
      L(0.16, 0.18, 0.42, 0.18, R, 3);             /* logo */
      L(0.16, 0.26, 0.34, 0.26, R, 1.8);
      L(0.16, 0.36, 0.56, 0.36, IN, 1.2);          /* text lines */
      L(0.16, 0.42, 0.56, 0.42, IN, 1.2);
      L(0.16, 0.48, 0.52, 0.48, IN, 1.2);
      L(0.16, 0.54, 0.56, 0.54, IN, 1.2);
      B(0.16, 0.60, 0.34, 0.63, R, 1.6);           /* footer rule */
      B(0.56, 0.56, 0.94, 0.76, R, 2);             /* business card */
      L(0.61, 0.62, 0.80, 0.62, R, 2.6);
      L(0.61, 0.68, 0.74, 0.68, IN, 1.2);
      B(0.10, 0.74, 0.50, 0.92);                   /* envelope */
      L(0.10, 0.74, 0.30, 0.84, IN, 1.2);
      L(0.50, 0.74, 0.30, 0.84, IN, 1.2);
      B(0.72, 0.84, 0.86, 0.92, R, 1.8);           /* stamp / seal */
    } else if (kind === 'packaging') {              /* mailer box, label and wax seal */
      L(0.05, 0.93, 0.95, 0.93, IN, 1.5);
      /* mailer box, three-quarter */
      g.save();
      g.strokeStyle = R; g.lineWidth = 3; g.lineJoin = 'round';
      g.beginPath();                                  /* front face */
      g.moveTo(0.08 * w, 0.44 * h); g.lineTo(0.52 * w, 0.44 * h);
      g.lineTo(0.52 * w, 0.92 * h); g.lineTo(0.08 * w, 0.92 * h); g.closePath(); g.stroke();
      g.beginPath();                                  /* top face */
      g.moveTo(0.08 * w, 0.44 * h); g.lineTo(0.20 * w, 0.30 * h);
      g.lineTo(0.64 * w, 0.30 * h); g.lineTo(0.52 * w, 0.44 * h); g.stroke();
      g.beginPath();                                  /* side face */
      g.moveTo(0.52 * w, 0.44 * h); g.lineTo(0.64 * w, 0.30 * h);
      g.lineTo(0.64 * w, 0.78 * h); g.lineTo(0.52 * w, 0.92 * h); g.stroke();
      g.restore();
      B(0.14, 0.56, 0.46, 0.70, R, 2);                /* the label, front and centre */
      L(0.18, 0.605, 0.42, 0.605, R, 3);
      L(0.18, 0.655, 0.34, 0.655, IN, 1.4);
      /* tape strip over the top face */
      L(0.20, 0.30, 0.14, 0.44, IN, 1.2);
      L(0.64, 0.30, 0.58, 0.44, IN, 1.2);
      /* barcode */
      B(0.14, 0.76, 0.32, 0.86, IN, 1.4);
      var bi;
      for (bi = 0; bi < 5; bi++) L(0.16 + bi * 0.035, 0.76, 0.16 + bi * 0.035, 0.86, IN, 1);
      /* pouch, right */
      B(0.70, 0.42, 0.94, 0.80);                      /* body */
      L(0.70, 0.42, 0.72, 0.36, IN, 1.3);             /* top seal */
      L(0.94, 0.42, 0.92, 0.36, IN, 1.3);
      L(0.72, 0.36, 0.92, 0.36, R, 2.4);
      g.beginPath(); g.arc(0.82 * w, 0.58 * h, 0.075 * w, 0, 6.2832);
      g.strokeStyle = R; g.lineWidth = 2.6; g.stroke();   /* the seal */
      L(0.76, 0.70, 0.88, 0.70, IN, 1.3);
      /* hang tag */
      B(0.62, 0.86, 0.74, 0.93, R, 1.8);
      L(0.68, 0.86, 0.68, 0.82, IN, 1.1);
    } else {                                        /* the 2D layout sheet (portrait) */
      B(0.05, 0.03, 0.95, 0.97, R, 2.1);            /* sheet edge */
      B(0.09, 0.06, 0.91, 0.94, IN, 1.4);           /* drawing frame */
      var i, j;
      for (i = 1; i < 8; i++) L(0.09 + i * 0.1025, 0.06, 0.09 + i * 0.1025, 0.94, 'rgba(17,18,20,.10)', 1);
      for (j = 1; j < 11; j++) L(0.09, 0.06 + j * 0.08, 0.91, 0.06 + j * 0.08, 'rgba(17,18,20,.10)', 1);
      B(0.15, 0.11, 0.55, 0.34);                    /* elevation A */
      L(0.20, 0.30, 0.50, 0.30, R, 2);
      B(0.24, 0.17, 0.36, 0.30, R, 1.4);
      B(0.40, 0.21, 0.50, 0.30, R, 1.4);
      B(0.15, 0.39, 0.55, 0.50);                    /* elevation B */
      L(0.20, 0.44, 0.44, 0.44, R, 1.6);
      B(0.15, 0.57, 0.55, 0.78);                    /* plan view */
      L(0.15, 0.68, 0.55, 0.68, IN, 1.2);
      L(0.33, 0.57, 0.33, 0.78, IN, 1.2);
      B(0.62, 0.11, 0.85, 0.34, IN, 1.4);           /* section */
      L(0.66, 0.17, 0.81, 0.17, R, 1.6);
      L(0.66, 0.24, 0.77, 0.24, IN, 1.2);
      L(0.66, 0.30, 0.81, 0.30, IN, 1.2);
      B(0.62, 0.39, 0.85, 0.52, IN, 1.4);           /* detail */
      B(0.62, 0.57, 0.85, 0.78, R, 1.5);            /* title block */
      L(0.62, 0.64, 0.85, 0.64, IN, 1.2);
      L(0.62, 0.71, 0.85, 0.71, IN, 1.2);
      L(0.70, 0.57, 0.70, 0.78, IN, 1.2);
      L(0.66, 0.61, 0.80, 0.61, R, 1.6);
      B(0.15, 0.83, 0.55, 0.90, IN, 1.3);           /* sheet strip */
      L(0.20, 0.865, 0.46, 0.865, IN, 1.1);
    }
  }

  /* ---------- the five service pillars, drawn as five plates ---------- */
  function drawPillarArt(g, kind, w, h) {
    var R = RED, IN = 'rgba(17,18,20,.62)';
    g.lineCap = 'round'; g.lineJoin = 'round';
    function L(x1, y1, x2, y2, col, wid) {
      g.strokeStyle = col || R; g.lineWidth = wid || 2;
      g.beginPath(); g.moveTo(x1 * w, y1 * h); g.lineTo(x2 * w, y2 * h); g.stroke();
    }
    function B(x1, y1, x2, y2, col, wid) {
      g.strokeStyle = col || R; g.lineWidth = wid || 2.2;
      g.strokeRect(x1 * w, y1 * h, (x2 - x1) * w, (y2 - y1) * h);
    }
    function F(x1, y1, x2, y2, fill) {
      g.fillStyle = fill; g.fillRect(x1 * w, y1 * h, (x2 - x1) * w, (y2 - y1) * h);
    }
    function C(x, y, r, col, wid) {
      g.strokeStyle = col || R; g.lineWidth = wid || 2;
      g.beginPath(); g.arc(x * w, y * h, r * w, 0, 6.2832); g.stroke();
    }
    var GY = 0.82, SH = 0;

    if (kind === 'pillAds') {                      /* megaphone: one voice, every direction */
      g.save(); g.translate(0, 0.035 * h);
      L(0.06, 0.88, 0.94, 0.88, IN, 2);
      g.save();                                    /* the horn */
      g.translate(0.46 * w, 0.50 * h); g.rotate(-0.14);
      g.strokeStyle = R; g.lineWidth = 3.6; g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(-0.20 * w, -0.07 * h);
      g.lineTo(0.10 * w, -0.19 * h);
      g.lineTo(0.10 * w, 0.19 * h);
      g.lineTo(-0.20 * w, 0.07 * h);
      g.closePath(); g.stroke();
      g.beginPath();                               /* mouth rim */
      g.moveTo(0.10 * w, -0.19 * h); g.lineTo(0.15 * w, -0.23 * h);
      g.lineTo(0.15 * w, 0.23 * h); g.lineTo(0.10 * w, 0.19 * h);
      g.stroke();
      g.beginPath();                               /* body + handle */
      g.moveTo(-0.20 * w, -0.07 * h); g.lineTo(-0.30 * w, -0.05 * h);
      g.lineTo(-0.30 * w, 0.05 * h); g.lineTo(-0.20 * w, 0.07 * h);
      g.stroke();
      g.beginPath();                               /* grip, hanging off the body */
      g.moveTo(-0.28 * w, 0.07 * h); g.lineTo(-0.23 * w, 0.07 * h);
      g.lineTo(-0.20 * w, 0.22 * h); g.lineTo(-0.25 * w, 0.22 * h);
      g.closePath(); g.stroke();
      g.restore();
      g.save();                                    /* the blast: three arcs + rays */
      g.strokeStyle = R; g.lineWidth = 3.4; g.lineCap = 'round';
      var cc = [[0.60, 0.40, 0.10], [0.63, 0.40, 0.19], [0.67, 0.40, 0.28]];
      for (var m = 0; m < cc.length; m++) {
        g.beginPath();
        g.arc(cc[m][0] * w, cc[m][1] * h, cc[m][2] * w, -0.62, 0.62);
        g.stroke();
      }
      g.restore();
      /* the reach: print · screen · site, marked once on the ground line */
      L(0.14, 0.80, 0.86, 0.80, IN, 1.8);
      for (var y3 = 0; y3 < 4; y3++) L(0.14 + y3 * 0.24, 0.845, 0.14 + y3 * 0.24, 0.80, IN, 1.6);
      g.restore();
    } else if (kind === 'pillBrand') {              /* one mark, then everything it touches */
      g.save(); g.translate(0, 0.035 * h);
      B(0.14, 0.10, 0.86, 0.50, IN, 1.4);          /* construction frame */
      L(0.14, 0.30, 0.22, 0.30, IN, 1.2);          /* axis marks, not a line through */
      L(0.78, 0.30, 0.86, 0.30, IN, 1.2);
      L(0.50, 0.10, 0.50, 0.15, IN, 1.2);
      L(0.50, 0.45, 0.50, 0.50, IN, 1.2);
      C(0.14, 0.30, 0.03, IN, 1.4);                /* anchor points */
      C(0.86, 0.30, 0.03, IN, 1.4);
      g.save(); g.strokeStyle = R; g.lineWidth = 6.2; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();                                /* eye left */
      g.moveTo(0.26 * w, 0.30 * h);
      g.bezierCurveTo(0.26 * w, 0.15 * h, 0.48 * w, 0.15 * h, 0.48 * w, 0.30 * h);
      g.bezierCurveTo(0.48 * w, 0.45 * h, 0.26 * w, 0.45 * h, 0.26 * w, 0.30 * h);
      g.stroke();
      g.beginPath();                                /* eye right */
      g.moveTo(0.52 * w, 0.30 * h);
      g.bezierCurveTo(0.52 * w, 0.15 * h, 0.74 * w, 0.15 * h, 0.74 * w, 0.30 * h);
      g.bezierCurveTo(0.74 * w, 0.45 * h, 0.52 * w, 0.45 * h, 0.52 * w, 0.30 * h);
      g.stroke();
      g.lineWidth = 4.2;
      g.beginPath(); g.moveTo(0.38 * w, 0.30 * h); g.lineTo(0.62 * w, 0.30 * h); g.stroke();
      g.restore();
      /* the kit: card, label, seal — the mark re-used, not re-drawn */
      B(0.14, 0.58, 0.42, 0.76, R, 2.4);            /* the card */
      L(0.19, 0.635, 0.33, 0.635, R, 3.4);
      L(0.19, 0.675, 0.28, 0.675, IN, 1.8);
      C(0.33, 0.715, 0.022, R, 1.8);
      B(0.50, 0.58, 0.74, 0.66, R, 2.2);            /* the label */
      L(0.55, 0.61, 0.68, 0.61, R, 2.6);
      L(0.55, 0.635, 0.63, 0.635, IN, 1.6);
      C(0.62, 0.735, 0.055, R, 2.4);                /* the seal */
      C(0.62, 0.735, 0.024, R, 1.6);
      L(0.14, 0.83, 0.86, 0.83, IN, 1.8);           /* one bench, three pieces */
      g.restore();
    } else if (kind === 'pillCreative') {          /* the pencil, mid-stroke */
      g.save(); g.translate(0, 0.035 * h);
      L(0.06, 0.90, 0.94, 0.90, IN, 2);
      g.save();
      g.translate(0.62 * w, 0.30 * h); g.rotate(-0.34);
      g.strokeStyle = R; g.lineWidth = 4.6;
      g.beginPath(); g.rect(-0.26 * w, -0.07 * h, 0.46 * w, 0.14 * h); g.stroke();
      g.beginPath();
      g.moveTo(0.20 * w, -0.07 * h); g.lineTo(0.25 * w, -0.07 * h);
      g.lineTo(0.25 * w, 0.07 * h); g.lineTo(0.20 * w, 0.07 * h); g.stroke();
      g.beginPath();
      g.moveTo(-0.26 * w, -0.07 * h); g.lineTo(-0.37 * w, 0); g.lineTo(-0.26 * w, 0.07 * h);
      g.closePath(); g.stroke();
      g.restore();
      g.save();
      g.strokeStyle = R; g.lineWidth = 5.4; g.lineCap = 'round';
      g.beginPath();
      g.moveTo(0.08 * w, 0.80 * h);
      g.bezierCurveTo(0.30 * w, 0.66 * h, 0.50 * w, 0.84 * h, 0.80 * w, 0.58 * h);
      g.stroke();
      g.restore();
      C(0.14, 0.24, 0.075, R, 3);                  /* the idea, still small */
      L(0.14, 0.13, 0.14, 0.07, R, 2.2);           /* and its rays */
      L(0.05, 0.20, 0.01, 0.17, R, 2.2);
      L(0.23, 0.20, 0.27, 0.17, R, 2.2);
      L(0.09, 0.31, 0.04, 0.35, R, 2.2);
      L(0.19, 0.31, 0.24, 0.35, R, 2.2);
      g.restore();
    } else if (kind === 'pillDesign') {            /* measured elevation */
      g.save(); g.translate(0, 0.035 * h);
      B(0.12, 0.14, 0.88, 0.74, R, 3);
      L(0.12, 0.28, 0.88, 0.28, IN, 1.8);
      L(0.42, 0.28, 0.42, 0.74, IN, 1.8);
      L(0.68, 0.28, 0.68, 0.74, IN, 1.8);
      B(0.46, 0.50, 0.64, 0.74, R, 2.4);
      L(0.18, 0.21, 0.40, 0.21, R, 5);
      L(0.50, 0.21, 0.64, 0.21, R, 3);
      L(0.12, 0.79, 0.88, 0.79, IN, 1.8);
      L(0.12, 0.755, 0.12, 0.825, IN, 1.6);
      L(0.88, 0.755, 0.88, 0.825, IN, 1.6);
      C(0.76, 0.40, 0.05, R, 2.2);
      L(0.76, 0.45, 0.76, 0.56, IN, 1.6);
      g.restore();
    } else if (kind === 'full360') {               /* 360° · A to Z · end to end, one loop */
      var ox = 0.50 * w, oy = 0.36 * h, r1 = 0.255 * w, r2 = 0.292 * w;
      var s, ang, kk;
      function head(cx0, cy0, dir, size) {          /* an arrowhead that reads at small size */
        var tx = -Math.sin(dir), ty = Math.cos(dir);
        var nx = Math.cos(dir), ny = Math.sin(dir);
        g.beginPath();
        g.moveTo(cx0, cy0);
        g.lineTo(cx0 - tx * size - nx * size * 0.62, cy0 - ty * size - ny * size * 0.62);
        g.moveTo(cx0, cy0);
        g.lineTo(cx0 - tx * size + nx * size * 0.62, cy0 - ty * size + ny * size * 0.62);
        g.stroke();
      }
      g.strokeStyle = R; g.lineWidth = 3.4;
      g.beginPath(); g.arc(ox, oy, r1, 0, 6.2832); g.stroke();          /* the dial */
      g.strokeStyle = IN; g.lineWidth = 1.9;
      g.beginPath(); g.arc(ox, oy, r2, 0, 6.2832); g.stroke();
      for (s = 0; s < 26; s++) {                                         /* A … Z, once around */
        ang = -Math.PI / 2 + s * (6.2832 / 26);
        var long = (s % 5 === 0) ? 0.032 : 0.017;
        g.strokeStyle = (s === 0 || s === 25) ? R : IN;
        g.lineWidth = (s === 0 || s === 25) ? 3.6 : 1.9;
        g.beginPath();
        g.moveTo(ox + Math.cos(ang) * r2, oy + Math.sin(ang) * r2);
        g.lineTo(ox + Math.cos(ang) * (r2 + long * w), oy + Math.sin(ang) * (r2 + long * w));
        g.stroke();
      }
      /* the sweep: a quiet arrowed arc — the wheel keeps turning */
      var rs = r1 - 0.080 * w, a0 = 3.50, a1 = 5.30, size = 0.048 * w;
      g.strokeStyle = R; g.lineWidth = 5.4; g.lineCap = 'round';
      g.beginPath(); g.arc(ox, oy, rs, a0, a1); g.stroke();
      var ex = ox + Math.cos(a1) * rs, ey = oy + Math.sin(a1) * rs;
      var tx = -Math.sin(a1), ty = Math.cos(a1);
      var nx = Math.cos(a1), ny = Math.sin(a1);
      g.lineWidth = 4.4;
      g.beginPath();
      g.moveTo(ex - tx * size + nx * size * 0.72, ey - ty * size + ny * size * 0.72);
      g.lineTo(ex, ey);
      g.lineTo(ex - tx * size - nx * size * 0.72, ey - ty * size - ny * size * 0.72);
      g.stroke();
      /* the hub: one centre, one scope — closed, nothing to misread */
      g.strokeStyle = R;
      g.lineWidth = 3.2;
      g.beginPath(); g.arc(ox, oy, 0.070 * w, 0, 6.2832); g.stroke();
      g.lineWidth = 2.4;
      g.beginPath(); g.arc(ox, oy, 0.032 * w, 0, 6.2832); g.stroke();
      /* one unbroken chain: client dot → five stages → the last switch-on */
      L(0.11, 0.80, 0.80, 0.80, IN, 2.6);
      C(0.11, 0.80, 0.034, IN, 2.6);
      for (kk = 0; kk < 5; kk++) C(0.19 + kk * 0.125, 0.80, 0.034, R, 3.2);
      C(0.80, 0.80, 0.056, R, 3.8);                                      /* closed loop */
      C(0.80, 0.80, 0.025, R, 2.6);
      L(0.11, 0.885, 0.89, 0.885, IN, 1.8);                              /* the bench */
    } else {                                        /* execution: the gantry goes up */
      g.save(); g.translate(0, 0.035 * h);
      L(0.05, 0.86, 0.95, 0.86, IN, 2.4);
      B(0.14, 0.18, 0.86, 0.30, R, 3.2);
      L(0.21, 0.24, 0.55, 0.24, R, 6);
      L(0.61, 0.24, 0.79, 0.24, R, 3.2);
      L(0.23, 0.30, 0.23, 0.86, R, 4);
      L(0.77, 0.30, 0.77, 0.86, R, 4);
      L(0.23, 0.62, 0.77, 0.62, IN, 2.6);
      L(0.23, 0.72, 0.77, 0.52, IN, 2.2);
      L(0.23, 0.52, 0.77, 0.72, IN, 2.2);
      L(0.14, 0.86, 0.32, 0.86, IN, 3);            /* base plates */
      L(0.68, 0.86, 0.86, 0.86, IN, 3);
      C(0.23, 0.86, 0.045, R, 2.4);
      C(0.77, 0.86, 0.045, R, 2.4);
      L(0.36, 0.12, 0.40, 0.06, R, 2.2);
      L(0.52, 0.12, 0.56, 0.06, R, 2.2);
      L(0.68, 0.12, 0.72, 0.06, R, 2.2);
      g.restore();
    }
  }

  var KIND = ['acrylic', 'acp', 'event', 'product', 'identity', 'stationery', 'packaging', 'plan',
              'pillAds', 'pillBrand', 'pillCreative', 'pillDesign', 'pillBuild', 'full360'];

  /* ink canvas → deterministic, evenly spread node cloud */
  function shapePts(img, seed) {
    var g = img.getContext('2d');
    var d = g.getImageData(0, 0, img.width, img.height).data;
    /* a 1px dilation pass so hairline strokes still read as drawn edges */
    function ink(x, y) {
      if (x < 0 || y < 0 || x >= img.width || y >= img.height) return 0;
      return d[(y * img.width + x) * 4 + 3];
    }
    var cand = [], x, y;
    for (y = 0; y < img.height; y += 1) {
      for (x = 0; x < img.width; x += 1) {
        var own = ink(x, y);
        if (own > 70) cand.push([x, y]);
      }
    }
    var s = seed;
    function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
    for (var q = cand.length - 1; q > 0; q--) {
      var j2 = Math.floor(rnd() * (q + 1)), tmp = cand[q]; cand[q] = cand[j2]; cand[j2] = tmp;
    }
    var out = [], minD = 7;
    while (out.length < NODES && minD >= 1) {
      for (var c2 = 0; c2 < cand.length && out.length < NODES; c2++) {
        var p = cand[c2], ok = true;
        for (var o = 0; o < out.length; o++) {
          var dx = out[o][0] - p[0], dy = out[o][1] - p[1];
          if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
        }
        if (ok) out.push(p);
      }
      minD -= 1;
    }
    if (!out.length) out = [[img.width / 2, img.height / 2]];
    return out.map(function (p) { return { u: p[0] / img.width, v: p[1] / img.height }; });
  }

  function buildShape(i) {
    var img = document.createElement('canvas');
    img.width = SH_W; img.height = SH_H;
    var kind = KIND[i];
    if (kind === 'full360' || kind.indexOf('pill') === 0) drawPillarArt(img.getContext('2d'), kind, SH_W, SH_H);
    else drawShape(img.getContext('2d'), kind, SH_W, SH_H);
    var pts = shapePts(img, 9173 + i * 613);
    var nodes = pts.slice(0, Math.min(NODES, pts.length));
    return { pts: nodes, ar: SH_W / SH_H, fig: i === KIND.length - 1 };
  }

  /* =========================================================
     one particle field, six drawings:
     character → acrylic signage → ACP facade → advertising
     → inshop branding → 2D layout plan
     ========================================================= */
  var cv, cx, DPR = 1, W = 0, H = 0, tabbar = null;
  var parts = [], docs = [], cur = 0, lastIdx = -1;
  var pad = { x: 0.04, top: 0.11, bot: 0.05 };

  function mountCanvas() {
    cv = $('#ph-canvas');
    if (!cv) return;
    cx = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize, { passive: true });

    parts = [];
    for (var i = 0; i < COUNT; i++) {
      parts.push({ x: Math.random() * W, y: Math.random() * H, tx: 0, ty: 0,
                   vx: 0, vy: 0, a: 0, ta: 0.5, seed: Math.random() });
    }

    /* drawing 1 is the character (sampled from the frame art) */
    loadPoses();
    /* drawings 2–9 are the process sheets */
    for (var d = 0; d < KIND.length; d++) docs[d + 1] = buildShape(d);   /* 1…13 */

    requestAnimationFrame(tick);
    hookScroll();
  }

  function resize() {
    if (!cv) return;
    var r = cv.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cv.width = W * DPR;
    cv.height = H * DPR;
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    lastIdx = -1;
    if (docs[1]) assign();
  }

  /* ---------- the character, sampled once ---------- */
  function loadPoses() {
    var p0 = POSES[0];
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      var s = sample(img, p0.b);
      docs[0] = { pts: s.pts, ar: s.w / s.h };
      assign();
    };
    img.src = 'media/frames/' + p0.f;
  }

  function sample(img, box) {
    var bw = box[2] - box[0], bh = box[3] - box[1];
    var scale = SAMPLE / Math.max(bw, bh);
    var w = Math.max(1, Math.round(bw * scale)), h = Math.max(1, Math.round(bh * scale));
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d');
    g.drawImage(img, -box[0] * scale, -box[1] * scale, img.naturalWidth * scale, img.naturalHeight * scale);
    var d = g.getImageData(0, 0, w, h).data;

    /* local contrast: wide blur subtracted from the pixel, so eyes, brows and
       the mouth survive at small size instead of being averaged away */
    var lum = new Float32Array(w * h);
    var i, k;
    for (i = 0; i < w * h; i++) lum[i] = Math.max(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);

    var r = Math.max(2, Math.round(w / 26));
    var blur = new Float32Array(w * h);
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var sum = 0, n = 0;
        for (var yy = Math.max(0, y - r); yy <= Math.min(h - 1, y + r); yy += 2) {
          for (var xx = Math.max(0, x - r); xx <= Math.min(w - 1, x + r); xx += 2) {
            sum += lum[yy * w + xx]; n++;
          }
        }
        blur[y * w + x] = sum / n;
      }
    }

    var pts = [];
    for (var y2 = 0; y2 < h; y2++) {
      for (var x2 = 0; x2 < w; x2++) {
        var idx = y2 * w + x2, L = lum[idx], B = blur[idx];
        var ink = L + (L - B) * SHARPEN;               /* sharpened luminance */
        if (ink < INK) continue;                        /* paper */
        if (ink < 46 && L < B + 14) continue;           /* soft gradient haze */
        pts.push({ u: x2 / w, v: y2 / h, lum: Math.min(1, ink / 210) });
      }
    }

    /* deterministic shuffle so thinning never stripes or flickers */
    var seed = 1337 + Math.round(box[0] * 7 + box[1] * 13);
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var q = pts.length - 1; q > 0; q--) {
      var r2 = Math.floor(rnd() * (q + 1)); var tmp = pts[q]; pts[q] = pts[r2]; pts[r2] = tmp;
    }
    var out = pts.slice(0, Math.min(COUNT, pts.length));
    while (out.length < COUNT && pts.length) out.push(pts[out.length % pts.length]);
    return { pts: out, w: w, h: h };
  }

  /* ---------- fit a drawing into the stage and aim the particles ---------- */
  function assign() {
    var n = SEQ.length;
    var iA = Math.min(n - 1, Math.floor(cur)), iB = Math.min(n - 1, iA + 1);
    var A = docs[iA], B = docs[iB] || A;
    if (!A) return;

    var raw = cur - Math.floor(cur);
    var tE = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    if (iA === n - 1) tE = 0;

    function fit(doc) {
      var boxW = W * (1 - pad.x * 2), boxH = H * (1 - pad.top - pad.bot);
      var s = Math.min(boxW / doc.ar, boxH);
      return { s: s, w: s * doc.ar, h: s, x: (W - s * doc.ar) / 2, y: pad.top * H + (boxH - s) / 2 };
    }
    var fA = fit(A), fB = fit(B);

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var a = A.pts[i % A.pts.length], b = B.pts[i % B.pts.length] || a;
      var rep = Math.floor(i / A.pts.length);           /* spread duplicates, never stack them */
      if (rep) { a = A.pts[(i + rep * 7) % A.pts.length]; b = B.pts[(i + rep * 7) % B.pts.length] || a; }
      var ax = fA.x + a.u * fA.w, ay = fA.y + a.v * fA.h;
      var bx = fB.x + b.u * fB.w, by = fB.y + b.v * fB.h;
      p.tx = ax + (bx - ax) * tE;
      p.ty = ay + (by - ay) * tE;
      var l0 = (a.lum === undefined ? 0.6 : a.lum);
      p.ta = (A.fig ? 0.42 + l0 * 0.58 : 0.72) + Math.max(0, Math.sin(tE * Math.PI)) * 0.1;
      p.sz = A.fig ? (0.85 + l0 * 1.5) : 1.75;
    }
    for (var q = 0; q < parts.length; q++) {
      var s2 = parts[q];
      if (!s2.placed || Math.abs(s2.tx - s2.x) > W * 0.8 || Math.abs(s2.ty - s2.y) > H * 0.8) {
        s2.x = s2.tx; s2.y = s2.ty; s2.vx = 0; s2.vy = 0; s2.a = s2.ta; s2.placed = 1;
      }
    }
    setCopy(iA, tE > 0.5 ? iB : iA);
  }

  /* ---------- caption: one line at a time, nothing else ---------- */
  var copyIdx = -1;
  function setCopy(i, j) {
    if (copyIdx === j) return;
    copyIdx = j;
    var s = SEQ[j];
    var say = $('#ph-say');
    if (say) {
      say.classList.remove('is-in');
      say.classList.toggle('is-pillar', !!s.pillar);
      setTimeout(function () {
        var a = $('#ph-say-k'), b = $('#ph-say-w'), c = $('#ph-say-n');
        if (a) a.textContent = s.shot;
        if (b) b.textContent = s.word;
        var pil = 0;
        if (s.pillar) { for (var q = 0; q < SEQ.length; q++) if (SEQ[q].pillar) { pil++; if (q === j) break; } }
        if (c) c.innerHTML = '<b class="ph-say-l">' +
              (s.pillar ? 'Pillar 0' + pil + ' of 05' : (s.subs ? s.word : 'Ranjan Sarkar')) + '</b>' +
              '<i class="ph-say-s">' + (s.subs
                ? s.subs.map(function (x) { return '<em>' + x + '</em>'; }).join('')
                : (s.pillar ? '<em>360°</em><em>A to Z</em><em>end to end</em>' : '<em>in particles</em>')) + '</i>';
        say.classList.add('is-in');
      }, 160);
    }
    var c2 = $('#ph-st-count');
    if (c2) c2.textContent = ('0' + (j + 1)).slice(-2) + ' / ' + ('0' + SEQ.length).slice(-2);
  }

  /* ---------- render ---------- */
  function tick() {
    if (!cx) return;
    cx.clearRect(0, 0, W, H);

    var idx = Math.min(SEQ.length - 1, Math.floor(cur));
    if (idx !== lastIdx) { lastIdx = idx; assign(); }

    var settle = reduce ? 1 : 0.18;
    var t = performance.now() * 0.0014;
    var bucket = [[], [], []];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.vx = (p.vx + (p.tx - p.x) * settle) * 0.84;
      p.vy = (p.vy + (p.ty - p.y) * settle) * 0.84;
      p.x += p.vx; p.y += p.vy;
      p.a += (p.ta - p.a) * 0.14;
      var r = (p.sz || 1.2) * (0.9 + p.seed * 0.5) * (0.96 + Math.sin(t + p.seed * 40) * 0.05);
      var b = p.a < 0.55 ? 0 : (p.a < 0.8 ? 1 : 2);
      bucket[b].push(p.x - r * 0.5, p.y - r * 0.5, r);
    }
    cx.fillStyle = RED;
    var alphas = [0.5, 0.72, 0.95];
    for (var bi = 0; bi < 3; bi++) {
      var arr = bucket[bi];
      if (!arr.length) continue;
      cx.globalAlpha = alphas[bi];
      cx.beginPath();
      for (var q = 0; q < arr.length; q += 3) cx.rect(arr[q], arr[q + 1], arr[q + 2], arr[q + 2]);
      cx.fill();
    }
    cx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  /* ---------- scroll → drawing ---------- */
  function hookScroll() {
    var ticking = false;
    function paint() {
      var cover = $('.ph-cover'), pin = $('.ph-cover__pin');
      if (cover && pin) {
        var r = cover.getBoundingClientRect();
        var span = Math.max(1, r.height - pin.getBoundingClientRect().height);
        var s = Math.min(1, Math.max(0, (-r.top) / span));
        cur = s * (SEQ.length - 1);
        assign();
      }

      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  }

  /* ---------- route watch: mobile.js swaps sections ---------- */
  var mo = new MutationObserver(function () {
    var home = document.querySelector('[data-m-page="home"]');
    if (!home) return;
    var hidden = home.hidden;
    root.classList.toggle('rj-ph', !hidden);
    if (!hidden && !$('.ph', home)) build(home);
  });
  var main = document.getElementById('m-main');
  if (main) mo.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  setTimeout(start, 1400);
})();
