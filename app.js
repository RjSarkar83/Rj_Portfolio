/* ============================================================
   app.js — scroll-scrubbed film engine
   Drives the film with the scrollbar: segments play, holds
   freeze so a section can be read. Works with a real
   film.mp4 if one is present, otherwise with the keyframe
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
  $("#barName").textContent = C.name;
  $("#ldName").innerHTML = C.nameLine1 + "<br><em>" + C.nameLine2 + "</em>";
  $("#n1").textContent = C.nameLine1;
  $("#n2").textContent = C.nameLine2;
  $("#iRole").textContent = C.role;
  $("#iStatus").textContent = C.city + " · " + C.status;
  $("#aTitle").textContent = C.aboutTitle;
  $("#aText").textContent = C.aboutText;
  $("#dText").textContent = C.disclosure;

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
    '<a href="tel:' + C.phone.replace(/\s/g, "") + '">' + C.phone + '</a>' +
    C.links.map(function (l) {
      return '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + ' ↗</a>';
    }).join("");

  /* ───── 2. timeline: segments + holds ───── */
  var D = C.filmDuration, H = C.holds;
  var PPS = 108;                                    // scroll px per film-second
  var HOLDPX = function () { return Math.round(window.innerHeight * 0.95); };
  var blocks = [], i;

  function buildTimeline() {
    blocks = [];
    var prev = 0, hp = HOLDPX();
    for (i = 0; i < H.length; i++) {
      blocks.push({ kind: "seg", t0: prev, t1: H[i].at, px: Math.max(120, (H[i].at - prev) * PPS) });
      blocks.push({ kind: "hold", t0: H[i].at, t1: H[i].at, px: Math.round(hp * (H[i].mul || 1)), id: H[i].id });
      prev = H[i].at;
    }
    if (prev < D) blocks.push({ kind: "seg", t0: prev, t1: D, px: (D - prev) * PPS });
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
  var F = C.frames, vid = $("#vid"), useVideo = false, imgs = [];

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
    var m = smooth(clamp((u - 0.05) / 0.90, 0, 1));
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
     t=0 is the opening hero, so x starts at 0 — the back pose is dead centre —
     and only slides right once the name fades in. */
  var SHIFT = [[0, 0], [4.2, 12], [7.6, 26], [14.6, 17],
               [26.5, 0], [37.5, 10], [42.3, -17], [45.7, 15], [46, 15]];
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
    var maxPx = Math.max(0, (0.86 - 0.5 - hwFrac) * fw);
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
    var bw = mob() ? w * 0.74 : Math.min(h * 0.52, w * 0.3);
    var bh = mob() ? h * 0.42 : h * 0.72;
    var bx = mob() ? (w - bw) / 2 : w / 2 + (clampShift(shiftAt(45), hwAt(45)) / 100) * w - bw / 2;
    var by = mob() ? h * 0.10 : (h - bh) / 2;
    rct.setAttribute("x", bx); rct.setAttribute("y", by);
    rct.setAttribute("width", bw); rct.setAttribute("height", bh);
    var len = 2 * (bw + bh);
    rct.style.setProperty("--dash", len);
    rct.dataset.len = len;
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
    // exponential smoothing, independent of frame rate
    shownT += (targetT - shownT) * (1 - Math.pow(0.0009, dt / 1000));
    if (Math.abs(targetT - shownT) < 0.002) shownT = targetT;
    var t = shownT;

    if (useVideo) {
      if (vid.readyState >= 2 && Math.abs(vid.currentTime - t) > 0.02) {
        try { vid.currentTime = t; } catch (e) {}
      }
    } else {
      renderStills(t);
    }

    /* hero weight: full at t=0, gone by the intro hold */
    var hw = 1 - smooth(clamp(t / 7.6, 0, 1));
    var base = +(filmEl.style.getPropertyValue("--sc") || 1);
    filmEl.style.transform =
      "translate(" + clampShift(shiftAt(t), hwAt(t)).toFixed(2) + "vw," +
      (heroY * hw).toFixed(1) + "px) scale(" +
      (base * (1 + (heroS - 1) * hw)).toFixed(4) + ")";

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

    if (shownT !== targetT) tick();
  }
  function tick() { if (!raf) raf = requestAnimationFrame(paint); }

  function onScroll() { targetT = timeAt(window.scrollY); tick(); }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    layout(); onScroll();
    F.forEach(function (f, n) { imgs[n].src = mob() && f.m ? f.m : f.src; });
  });

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

  /* try the real film; swap over silently if it exists */
  (function probeFilm() {
    var src = mob() && C.filmSrcMobile ? C.filmSrcMobile : C.filmSrc;
    if (!src) return;
    vid.addEventListener("loadeddata", function () {
      useVideo = true;
      vid.style.opacity = 1;
      imgs.forEach(function (im) { im.style.display = "none"; });
      try { vid.play().then(function () { vid.pause(); }).catch(function () {}); } catch (e) {}
      onScroll();
    });
    vid.addEventListener("error", function () { useVideo = false; });
    vid.src = src;
  })();

  /* iOS needs one gesture before seeking works */
  window.addEventListener("touchstart", function once() {
    if (useVideo) { try { vid.play().then(function () { vid.pause(); }); } catch (e) {} }
    window.removeEventListener("touchstart", once);
  }, { passive: true });
})();
