/* ============================================================
   app.js — scroll-scrubbed film engine
   Drives the film with the scrollbar: segments play, holds
   freeze so a section can be read. Works with a real
   with the keyframe stills (no mp4 ships — video path retired wave 26)
   stills — identical scroll behaviour either way.
   ============================================================ */
(function () {
  "use strict";
  var C = window.CONFIG;
  var $ = function (s) { return document.querySelector(s); };
  var mob = function () { return window.innerWidth <= 760; };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (u) { return u * u * (3 - 2 * u); };

  document.documentElement.style.setProperty('--accent', C.accent);

  /* ───── 1. text from config ───── */
  $("#barName").textContent = C.barName || C.name;
  $("#ldName").innerHTML = '<span class="x-mt">' + C.nameLine1 + "</span><br><em>" + C.nameLine2 + "</em>";
  $("#n1").textContent = C.nameLine1;
  $("#n2").textContent = C.nameLine2;
  $("#iRole").textContent = C.role;
  $("#iStatus").textContent = C.city + " · " + C.status;
  $("#aTitle").textContent = C.aboutTitle;
  $("#aText").textContent = C.aboutText;

  $("#aStats").innerHTML = C.stats.map(function (s) {
    return '<div><div class="n">' + s.n + '</div><div class="l">' + s.l + '</div></div>';
  }).join("");

  $("#wTitle").innerHTML = C.workTitle || "Selected work";
  $("#wCards").innerHTML = C.projects.map(function (p) {
    return '<div class="card">' +
             (p.img ? '<div class="imw">' +
                        (p.key ? '<span class="kk">' + p.key + '</span>' : '') +
                        '<img class="im" src="' + p.img + '" alt="' + p.title + ' — ' + p.tech + '" loading="lazy" decoding="async">' +
                      '</div>' : '') +
             '<div class="bd">' +
               '<div class="t">' + p.title + '</div>' +
               '<div class="tech">' + p.tech + '</div>' +
               '<div class="ln">' + p.line + '</div>' +
               (p.proof ? '<div class="pf">' + p.proof + '</div>' : '') +
             '</div></div>';
  }).join("");

  $("#sChips").innerHTML = C.skills.map(function (s, i) {
    return '<span class="chip" style="transition-delay:' + (i * 55) + 'ms">' + s + '</span>';
  }).join("");

  var rowHTML = function (r) {
    return '<div class="row"><div class="rr">' + r.role + '</div>' +
           '<div class="oo">' + r.org + '</div>' +
           (r.yr ? '<div class="yy">' + r.yr + '</div>' : '') + '</div>';
  };
  $("#rExp").innerHTML = C.experience.map(rowHTML).join("");
  $("#rEdu").innerHTML = C.education.map(rowHTML).join("");
  $("#rDl").href = C.resume;

  $("#cTitle").innerHTML = C.contactTitle;
  $("#cMail").textContent = C.email;
  $("#cMail").href = "mailto:" + C.email;
  $("#cLinks").innerHTML =
    '<div class="clinks-grp">' +
      '<div class="clinks-lbl">Connect &amp; Social</div>' +
      '<div class="clinks-row">' +
        '<a href="tel:' + C.phone.replace(/\s/g, "") + '">' + C.phone + '</a>' +
        C.links.map(function (l) {
          return '<a href="' + l.url + '" target="_blank" rel="noopener noreferrer">' + l.label + ' ↗</a>';
        }).join("") +
      '</div>' +
    '</div>' +
    (C.ecosystem && C.ecosystem.length ?
      '<div class="clinks-grp">' +
        '<div class="clinks-lbl">ArtViSiON Ecosystem</div>' +
        '<div class="clinks-row clinks-eco">' +
          C.ecosystem.map(function (l) {
            return '<a href="' + l.url + '" target="_blank" rel="noopener noreferrer">' + l.label + ' ↗</a>';
          }).join("") +
        '</div>' +
      '</div>' : '');

  /* ───── 2. timeline: segments + holds (balanced scroll pacing) ───── */
  var D = C.filmDuration, H = C.holds;
  var SEG_PX = [1480, 860, 1080, 1020, 760, 680]; // evenly paced scroll distance per beat
  var HOLDPX = function () { return Math.round(window.innerHeight * 0.78); };
  var blocks = [], i;

  function buildTimeline() {
    blocks = [];
    var prev = 0, hp = HOLDPX();
    for (i = 0; i < H.length; i++) {
      var segW = SEG_PX[i] || Math.max(360, (H[i].at - prev) * 120);
      blocks.push({ kind: "seg", t0: prev, t1: H[i].at, px: segW });
      blocks.push({ kind: "hold", t0: H[i].at, t1: H[i].at, px: Math.round(hp * (H[i].mul || 1)), id: H[i].id });
      prev = H[i].at;
    }
    if (prev < D) blocks.push({ kind: "seg", t0: prev, t1: D, px: Math.max(240, (D - prev) * 140) });
    var acc = 0;
    blocks.forEach(function (b) { b.s0 = acc; acc += b.px; b.s1 = acc; });
    return acc;
  }

  var total = 0;
  function layout() {
    total = buildTimeline();
    $("#runway").style.height = (total + window.innerHeight) + "px";
    computeHero();
    sizeFrame();
  }

  function scrollToHold(id) {
    for (var k = 0; k < blocks.length; k++) {
      if (blocks[k].kind === "hold" && blocks[k].id === id) {
        window.scrollTo({ top: blocks[k].s0 + blocks[k].px * 0.4, behavior: "smooth" });
        return;
      }
    }
  }

  /* nav */
  $("#nav").innerHTML = H.map(function (h) {
    return '<button data-go="' + h.id + '">' + h.id + "</button>";
  }).join("");
  $("#nav").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (b) scrollToHold(b.dataset.go);
  });

  /* ───── 3. scroll → film time ───── */
  function timeAt(y) {
    if (y <= 0) return 0;
    for (var k = 0; k < blocks.length; k++) {
      var b = blocks[k];
      if (y < b.s1) {
        if (b.kind === "hold") return b.t0;
        var u = (y - b.s0) / b.px;
        return b.t0 + (b.t1 - b.t0) * u;
      }
    }
    return D;
  }

  /* ───── 4. film: video if available, else stills ───── */
  var F = C.frames, imgs = [];

  var filmEl = $("#film");
  F.forEach(function (f, n) {
    var im = document.createElement("img");
    im.className = "fr"; im.alt = ""; im.decoding = "async";
    im.src = mob() && f.m ? f.m : f.src;
    im.style.opacity = n === 0 ? 1 : 0;
    filmEl.appendChild(im); imgs.push(im);
  });

  function renderStills(t) {
    var a = 0;
    for (var k = 0; k < F.length - 1; k++) if (t >= F[k].t) a = k;
    var b = Math.min(a + 1, F.length - 1);
    var span = (F[b].t - F[a].t) || 1;
    var u = clamp((t - F[a].t) / span, 0, 1);
    // wide dissolve: with view-angle-adjacent frames this reads as real rotation
    var m = smooth(clamp(u, 0, 1));   // full-span blend: no pose holds at the seams (wave 27)
    for (var j = 0; j < imgs.length; j++) {
      var o = j === a ? 1 - m : j === b ? m : 0;
      if (a === b && j === a) o = 1;
      imgs[j].style.opacity = o;
    }
    // slow continuous drift so a held frame never looks frozen
    var sc = 1.035 - 0.035 * (t / D);
    filmEl.style.setProperty("--sc", sc.toFixed(4));
  }

  /* horizontal placement of the film over film-time (desktop only).
     t=0 starts dead centre with back view (x0_back), then he runs RIGHT
     from 0vw -> 26vw into Intro (t=2.4), performs 1-Round Spin + Jump
     + Red Waves -> Wave at 26vw through t=7.6. */
  var SHIFT = [[0, 0], [0.5, 4], [2.4, 26], [7.6, 26], [14.6, 17],
               [26.5, 0], [37.5, 10], [42.3, -17], [45.7, 25], [46, 25]];
  function shiftAt(t) {
    if (mob()) return 0;
    for (var k = 0; k < SHIFT.length - 1; k++) {
      if (t <= SHIFT[k + 1][0]) {
        var u = smooth(clamp((t - SHIFT[k][0]) / ((SHIFT[k + 1][0] - SHIFT[k][0]) || 1), 0, 1));
        return SHIFT[k][1] + (SHIFT[k + 1][1] - SHIFT[k][1]) * u;
      }
    }
    return SHIFT[SHIFT.length - 1][1];
  }

  /* The film is masked: anything past 0.89 of the film width fades out. Clamp
     the shift with the CURRENT frame's measured half-width so the character can
     never slide into that fade, on any viewport including ultrawide. */
  function clampShift(vwShift, hwFrac) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var fw = (vw / vh < FILM_AR) ? vw * 1.035 : (vh * 1.035) * FILM_AR;
    var maxPx = Math.max(0, (0.89 - 0.5 - hwFrac) * fw);
    var px = clamp(vwShift / 100 * vw, -maxPx, maxPx);
    return px / vw * 100;
  }

  /* half-width of the frame pair we are dissolving between */
  function hwAt(t) {
    var a = 0;
    for (var k = 0; k < F.length - 1; k++) if (t >= F[k].t) a = k;
    var b = Math.min(a + 1, F.length - 1);
    var span = (F[b].t - F[a].t) || 1;
    var u = clamp((t - F[a].t) / span, 0, 1);
    var ha = F[a].hw || 0.12, hb = F[b].hw || 0.12;
    return ha + (hb - ha) * u;
  }

  /* ── opening hero fit ──────────────────────────────────────────────
     On a 16:9 viewport the film already fills the screen, so simply lifting
     the figure pushes his head under the top bar. Instead, fit the whole
     figure into the band between the top bar and the "Scroll to begin" hint,
     then centre it there. Measured from x0_back.jpg: the cap starts at 0.0611
     of frame height and the soles sit at 0.9444.                       */
  var HERO_HEAD = 0.0625, HERO_SOLES = 0.9236, FILM_AR = 16 / 9;
  var heroS = 1, heroY = 0;
  function computeHero() {
    heroS = 1; heroY = 0;
    if (mob()) return;
    var vw = window.innerWidth, vh = window.innerHeight, base = 1.035, fw, fh;
    if (vw / vh < FILM_AR) { fw = vw * base; fh = fw / FILM_AR; }
    else                   { fh = vh * base; fw = fh * FILM_AR; }
    var bandTop = 58;                            // under the top bar
    var bandBot = vh - 3.2 * 16 - 11 - 24;       // above the hint, with a gap
    var band = bandBot - bandTop;
    if (band <= 0) return;
    var figH = (HERO_SOLES - HERO_HEAD) * fh;
    heroS = Math.min(1, band / figH);
    var fy = (vh - fh * heroS) / 2;
    var headA = fy + HERO_HEAD * fh * heroS;
    var soleA = fy + HERO_SOLES * fh * heroS;
    heroY = (bandTop + (band - (soleA - headA)) / 2) - headA;
  }

  /* ───── 5. contact frame svg ───── */
  var svg = $("#frameSvg"), rct = $("#frameRect");
  function sizeFrame() {
    var w = window.innerWidth, h = window.innerHeight;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", w); svg.setAttribute("height", h);
    var bw = mob() ? Math.min(w * 0.72, h * 0.36) : Math.min(h * 0.52, w * 0.3);
    var bh = mob() ? h * 0.42 : h * 0.72;
    var bx = mob() ? (w - bw) / 2 : w / 2 + (clampShift(shiftAt(45.7), hwAt(45.7)) / 100) * w - bw / 2;
    var by = mob() ? h * 0.11 : (h - bh) / 2;
    rct.setAttribute("x", bx); rct.setAttribute("y", by);
    rct.setAttribute("width", bw); rct.setAttribute("height", bh);
    var len = 2 * (bw + bh);
    rct.style.setProperty("--dash", len);
    rct.dataset.len = len;
  }

  /* ───── 5b. red foot-shockwave canvas (Jump + Red Waves beat) ───── */
  var waveCv = document.createElement("canvas");
  waveCv.id = "waveFx";
  waveCv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4;";
  var stageEl = $("#stage");
  stageEl.insertBefore(waveCv, $("#vig"));
  var waveCtx = waveCv.getContext("2d");

  function drawRedWaves(t, shiftVw, liftPx) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (waveCv.width !== Math.round(vw * dpr) || waveCv.height !== Math.round(vh * dpr)) {
      waveCv.width = Math.round(vw * dpr);
      waveCv.height = Math.round(vh * dpr);
    }
    waveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    waveCtx.clearRect(0, 0, vw, vh);

    if (t >= 5.20 && t <= 6.85) {
      var u = clamp((t - 5.20) / 1.65, 0, 1);
      var cx = vw * 0.5 + (shiftVw / 100) * vw;
      var cy = (mob() ? vh * 0.68 : vh * 0.84) + liftPx * 0.25;
      var maxR = mob() ? vw * 0.44 : Math.min(vw * 0.30, vh * 0.46);

      waveCtx.save();
      waveCtx.globalCompositeOperation = "lighter";

      var glowA = Math.sin(Math.PI * clamp(u * 1.15, 0, 1)) * 0.42;
      var grd = waveCtx.createRadialGradient(cx, cy, 4, cx, cy, maxR * 0.65);
      grd.addColorStop(0, "rgba(255, 40, 55, " + glowA.toFixed(3) + ")");
      grd.addColorStop(0.5, "rgba(227, 6, 19, " + (glowA * 0.45).toFixed(3) + ")");
      grd.addColorStop(1, "rgba(227, 6, 19, 0)");
      waveCtx.fillStyle = grd;
      waveCtx.beginPath();
      waveCtx.ellipse(cx, cy, maxR * 0.72, maxR * 0.24, 0, 0, Math.PI * 2);
      waveCtx.fill();

      for (var r = 0; r < 3; r++) {
        var ru = clamp((u - r * 0.16) / 0.72, 0, 1);
        if (ru <= 0 || ru >= 1) continue;
        var ease = 1 - Math.pow(1 - ru, 2.4);
        var rx = 24 + ease * maxR;
        var ry = rx * 0.26;
        var alpha = Math.pow(1 - ru, 1.35) * 0.92;
        waveCtx.strokeStyle = "rgba(227, 6, 19, " + alpha.toFixed(3) + ")";
        waveCtx.lineWidth = Math.max(1.5, (1 - ru) * 5.5);
        waveCtx.shadowColor = "#E30613";
        waveCtx.shadowBlur = 18;
        waveCtx.beginPath();
        waveCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        waveCtx.stroke();

        waveCtx.strokeStyle = "rgba(255, 110, 120, " + (alpha * 0.55).toFixed(3) + ")";
        waveCtx.lineWidth = Math.max(1, (1 - ru) * 2.0);
        waveCtx.beginPath();
        waveCtx.ellipse(cx, cy, rx * 0.92, ry * 0.92, 0, 0, Math.PI * 2);
        waveCtx.stroke();
      }

      var burstA = Math.sin(Math.PI * clamp(u / 0.85, 0, 1));
      if (burstA > 0.02) {
        waveCtx.shadowBlur = 12;
        for (var k = 0; k < 14; k++) {
          var ang = (k / 14) * Math.PI * 2 + 0.22;
          var r0 = (0.18 + 0.45 * u) * maxR;
          var r1 = r0 + (18 + (k % 3) * 14) * burstA;
          var x0 = cx + Math.cos(ang) * r0;
          var y0 = cy + Math.sin(ang) * r0 * 0.30 - burstA * (8 + (k % 4) * 6);
          var x1 = cx + Math.cos(ang) * r1;
          var y1 = cy + Math.sin(ang) * r1 * 0.30 - burstA * (16 + (k % 4) * 9);
          waveCtx.strokeStyle = "rgba(255, 45, 60, " + (burstA * 0.72).toFixed(3) + ")";
          waveCtx.lineWidth = 2;
          waveCtx.beginPath();
          waveCtx.moveTo(x0, y0);
          waveCtx.lineTo(x1, y1);
          waveCtx.stroke();
        }
      }
      waveCtx.restore();
    } else if (window.__RJ_DANCE && window.__RJ_DANCE.active) {
      var d = window.__RJ_DANCE;
      var cx2 = vw * 0.5 + (shiftVw / 100) * vw;
      var cy2 = (mob() ? vh * 0.77 : vh * 0.84) + liftPx * 0.25;
      var maxR2 = mob() ? vw * 0.36 : Math.min(vw * 0.24, vh * 0.36);
      var pulse = d.beatFrac || 0;
      waveCtx.save();
      waveCtx.globalCompositeOperation = "lighter";
      var rx2 = 28 + pulse * maxR2;
      var alpha2 = (1 - pulse) * 0.78;
      waveCtx.strokeStyle = "rgba(227, 6, 19, " + alpha2.toFixed(3) + ")";
      waveCtx.lineWidth = Math.max(1.5, (1 - pulse) * 4.5);
      waveCtx.shadowColor = "#E30613";
      waveCtx.shadowBlur = 16;
      waveCtx.beginPath();
      waveCtx.ellipse(cx2, cy2, rx2, rx2 * 0.25, 0, 0, Math.PI * 2);
      waveCtx.stroke();
      waveCtx.restore();
    }
  }

  /* ───── 6. main render loop ───── */
  var secs = {}, navBtns;
  H.forEach(function (h) { secs[h.id] = $("#s-" + h.id); });
  navBtns = Array.prototype.slice.call(document.querySelectorAll("#nav button"));

  var targetT = 0, shownT = 0, raf = null;
  var angEl = $("#angle"), angT = $("#angleT");

  var lastTS = 0;
  function paint(ts) {
    raf = null;
    var dt = lastTS ? Math.min(64, (ts || 0) - lastTS) : 16.7;
    lastTS = ts || 0;
    // balanced exponential smoothing for buttery scrub response
    shownT += (targetT - shownT) * (1 - Math.pow(0.0045, dt / 1000));
    if (Math.abs(targetT - shownT) < 0.002) shownT = targetT;
    var t = shownT;

    var dance = window.__RJ_DANCE;
    if (dance && dance.active) {
      for (var j = 0; j < imgs.length; j++) {
        imgs[j].style.opacity = (j === dance.frameIdx) ? 1 : 0;
      }
      filmEl.style.setProperty("--sc", "1.02");
    } else {
      renderStills(t);
    }

    /* hero weight: full at t=0 (back view dead centre), lifts into intro by t=2.4 */
    var hw = 1 - smooth(clamp(t / 2.4, 0, 1));
    var base = +(filmEl.style.getPropertyValue("--sc") || 1);
    /* jump lift arc during t=5.25..6.75 */
    var jumpU = clamp((t - 5.25) / 1.50, 0, 1);
    var jumpLift = (t >= 5.25 && t <= 6.75) ? -Math.sin(Math.PI * jumpU) * (mob() ? 22 : 34) : 0;
    var danceLift = (dance && dance.active) ? (dance.dy || 0) : 0;
    var danceRot = (dance && dance.active) ? (dance.rot || 0) : 0;
    var danceDx = (dance && dance.active) ? (dance.dx || 0) : 0;
    var appliedShift = clampShift(shiftAt(t), hwAt(t));

    filmEl.style.transform =
      "translate(calc(" + appliedShift.toFixed(2) + "vw + " + danceDx.toFixed(1) + "px)," +
      (heroY * hw + jumpLift + danceLift).toFixed(1) + "px) scale(" +
      (base * (1 + (heroS - 1) * hw)).toFixed(4) + ") rotate(" + danceRot.toFixed(2) + "deg)";

    drawRedWaves(t, appliedShift, jumpLift + danceLift);

    /* sections */
    var active = null;
    H.forEach(function (h) {
      var on = t >= h.from && t <= h.to;
      secs[h.id].classList.toggle("on", on);
      if (on) active = h.id;
    });
    navBtns.forEach(function (b) { b.classList.toggle("on", b.dataset.go === active); });

    /* contact frame draw 43.9 → 45.3 */
    var len = +rct.dataset.len || 1000;
    var fu = clamp((t - 43.9) / 1.4, 0, 1);
    svg.style.opacity = t > 43.6 ? 1 : 0;
    rct.style.strokeDashoffset = (len * (1 - smooth(fu))).toFixed(1);

    /* nearest view angle, so the rotation is legible */
    var na = 0, nd = 1e9;
    for (var q = 0; q < F.length; q++) {
      var dd = Math.abs(F[q].t - t);
      if (dd < nd) { nd = dd; na = q; }
    }
    if (F[na].a && angT.textContent !== F[na].a) angT.textContent = F[na].a;
    angEl.style.opacity = window.scrollY > 40 ? 1 : 0;

    $("#prog").style.width = (100 * clamp(window.scrollY / total, 0, 1)) + "%";
    $("#hint").style.opacity = window.scrollY > 40 ? 0 : 1;

    if (shownT !== targetT || (window.__RJ_DANCE && window.__RJ_DANCE.active)) tick();
  }
  function tick() { if (!raf) raf = requestAnimationFrame(paint); }
  window.__RJ_TICK = tick;

  function onScroll() { targetT = timeAt(window.scrollY); tick(); }

  window.addEventListener("scroll", onScroll, { passive: true });
  function onResize() {
    layout(); onScroll();
    F.forEach(function (f, n) {
      var wantSrc = mob() && f.m ? f.m : f.src;
      if (imgs[n].getAttribute("src") !== wantSrc) imgs[n].src = wantSrc;
    });
  }
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", function () {
    setTimeout(onResize, 120);
  }, { passive: true });

  /* ───── 7. loader: preload the stills, probe for a film ─────
     The timeline carries ~22 keyframes, but the visitor only sees the first
     few seconds before they start scrolling. Gate the loader on the frames
     inside the opening beat (plus one spare) and let the rest stream in
     behind it, so the bar never holds the page hostage for a frame the
     viewer will not reach for another half minute.                      */
  var PRIO = 1;
  while (PRIO < F.length && F[PRIO].t <= 8) PRIO++;
  PRIO = Math.min(F.length, PRIO + 1);

  var need = PRIO, got = 0;
  function bump() {
    got++;
    var p = Math.round(100 * got / need);
    $("#ldBar").style.width = p + "%";
    $("#ldPc").textContent = p + "%";
    if (got >= need) start();
  }
  imgs.forEach(function (im, n) {
    if (n >= PRIO) return;            /* still downloads, just does not gate */
    if (im.complete) bump();
    else { im.addEventListener("load", bump); im.addEventListener("error", bump); }
  });
  setTimeout(function () { if (got < need) { got = need; start(); } }, 9000);

  var started = false;
  function start() {
    if (started) return; started = true;
    layout(); onScroll();
    setTimeout(function () { $("#loader").classList.add("done"); }, 260);
  }

  /* iOS needs one gesture before seeking works */
  window.addEventListener("touchstart", function once() {
    window.removeEventListener("touchstart", once);
  }, { passive: true });
})();
