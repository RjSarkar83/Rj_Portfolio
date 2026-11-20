/* ════════════════════════════════════════════════════════════════════
   enhance.js — "ISSUED FOR FABRICATION"
   Additive layer. Reads DOM built by app.js & config.js and adds:

     01 · view modes                SHOP / DRAWING + REPLAY INTRO
     02 · router-bit cursor + engraved toolpath (measuring tool in
          DRAWING mode)
     03 · live character            pointer-follow + horizontal turntable
     04 · velocity optics           router spin, gate smear, grain
     05 · machine sound bed         synthesised, opt-in, zero audio files
     06 · shop-drawing overlay      grid, crop marks, live dimensions
     07 · vinyl squeegee, odometer stats, cantilever bracket, card tilt,
          word-mask reveals, film gate & 5-service process decks

   Keyboard: 1 shop · 2 drawing · 3/R replay intro · S sound · P reel · 0 reset
   ════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var C = window.CONFIG;
  if (!C || !C.frames || !window.RJCases || !window.RJIntro) return;

  /* ───────────────────────── helpers ───────────────────────── */
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
  var lerp = function (a, b, u) { return a + (b - a) * u; };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = RM.matches;
  var FINE = window.matchMedia("(hover:hover) and (pointer:fine)");
  var mob = function () { return window.innerWidth <= 760; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var F = C.frames, NF = F.length;
  var MM_PER_PX = function () { return 841 / Math.max(320, window.innerWidth); }; /* A1 sheet */

  /* images and links are natively draggable — that hijacks our drags */
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.closest && e.target.closest("#film,.x-sq")) e.preventDefault();
  });

  var body = document.body, root = document.documentElement;
  var stage = $("#stage"), film = $("#film");
  var frImgs = $$("#film .fr");
  var secs = $$(".sec");
  var activeId = "";                    /* which hold is on screen right now */
  function readActive() {
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].classList.contains("on")) return secs[i].id.replace("s-", "");
    }
    return "";
  }

  /* ════════════════════════ 01 · SOUND BED ════════════════════════
     Everything is synthesised: a machine hum, a router whose pitch
     follows scroll velocity, frame detents, a vinyl peel, a plunge.  */
  var SND = (function () {
    var ctx = null, master = null, humG = null, rot = null, noise = null;
    var enabled = false, ready = false, quiet = false;

    function build() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { ctx = new AC(); } catch (e) { return false; }
      master = ctx.createGain(); master.gain.value = 0.0001;
      var comp = ctx.createDynamicsCompressor();
      try { comp.threshold.value = -18; comp.ratio.value = 6; } catch (e) {}
      master.connect(comp); comp.connect(ctx.destination);

      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.2), ctx.sampleRate);
      var d = noise.getChannelData(0), i;
      for (i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.7;

      /* machine hum — the shop floor, always on once sound is on */
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 190; lp.Q.value = 1.6;
      humG = ctx.createGain(); humG.gain.value = 0.30;
      var o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 51;
      var o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = 77.4;
      var o3 = ctx.createOscillator(); o3.type = "sine"; o3.frequency.value = 102.7;
      var g3 = ctx.createGain(); g3.gain.value = 0.22;
      o1.connect(lp); o2.connect(lp); o3.connect(g3); g3.connect(lp);
      lp.connect(humG); humG.connect(master);
      o1.start(); o2.start(); o3.start();

      /* router — spins up with scroll velocity */
      var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 700; bp.Q.value = 0.9;
      var rg = ctx.createGain(); rg.gain.value = 0.0001;
      var ro = ctx.createOscillator(); ro.type = "sawtooth"; ro.frequency.value = 320;
      var rn = ctx.createBufferSource(); rn.buffer = noise; rn.loop = true;
      var rh = ctx.createBiquadFilter(); rh.type = "highpass"; rh.frequency.value = 2400;
      var rng = ctx.createGain(); rng.gain.value = 0.22;
      ro.connect(bp); rn.connect(rh); rh.connect(rng); rng.connect(bp);
      bp.connect(rg); rg.connect(master);
      ro.start(); rn.start();
      rot = { g: rg, o: ro, bp: bp };
      ready = true;
      return true;
    }

    function env(node, t0, a, peak, dur) {
      var g = node.gain;
      g.cancelScheduledValues(t0);
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + a);
      g.exponentialRampToValueAtTime(0.0001, t0 + dur);
    }
    function burst(dur, type, f0, f1, peak, q) {
      if (!on()) return;
      var t = ctx.currentTime;
      var s = ctx.createBufferSource(); s.buffer = noise;
      s.playbackRate.value = rnd(0.85, 1.15);
      var bf = ctx.createBiquadFilter(); bf.type = type || "bandpass";
      bf.frequency.setValueAtTime(f0, t);
      bf.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
      bf.Q.value = q || 1.1;
      var g = ctx.createGain();
      s.connect(bf); bf.connect(g); g.connect(master);
      env(g, t, 0.006, peak, dur);
      s.start(t); s.stop(t + dur + 0.05);
    }
    function tone(dur, f0, f1, peak, type) {
      if (!on()) return;
      var t = ctx.currentTime;
      var o = ctx.createOscillator(); o.type = type || "sine";
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
      var g = ctx.createGain();
      o.connect(g); g.connect(master);
      env(g, t, 0.008, peak, dur);
      o.start(t); o.stop(t + dur + 0.05);
    }
    function on() { return enabled && !quiet && ready && ctx && ctx.state === "running"; }
    function level() {
      if (!ready) return;
      var t = ctx.currentTime, loud = enabled && !quiet;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(loud ? 0.5 : 0.0001, t, loud ? 0.25 : 0.06);
    }

    return {
      toggle: function () {
        if (!ready && !build()) return false;
        enabled = !enabled;
        if (enabled && ctx.state !== "running" && ctx.resume) ctx.resume().catch(function () {});
        level();
        return enabled;
      },
      isOn: function () { return enabled; },
      setQuiet: function (v) { quiet = v; level(); },
      /* velocity in px/ms → router rpm */
      spin: function (v) {
        if (!on() || !rot) return;
        var a = clamp(Math.abs(v), 0, 9), t = ctx.currentTime;
        var f = 210 + Math.pow(a / 9, 0.72) * 1250;
        var g = 0.0001 + Math.pow(a / 9, 1.3) * 0.055;
        rot.o.frequency.setTargetAtTime(f, t, 0.09);
        rot.bp.frequency.setTargetAtTime(f * 1.5, t, 0.12);
        rot.g.gain.setTargetAtTime(g, t, 0.1);
      },
      detent: function () { burst(0.035, "highpass", 2600, 1800, 0.05, 0.8); },
      peel:   function () { burst(0.55, "bandpass", 420, 3400, 0.09, 1.4); },
      plunge: function () { burst(0.09, "highpass", 3200, 900, 0.07, 0.7); tone(0.14, 240, 62, 0.05, "sine"); },
      thud:   function () { tone(0.22, 120, 46, 0.10, "sine"); burst(0.06, "lowpass", 900, 200, 0.05, 0.7); },
      tick:   function () { burst(0.02, "highpass", 4200, 3000, 0.03, 0.9); },
      chime:  function () { tone(0.5, 880, 1320, 0.05, "triangle"); tone(0.7, 440, 660, 0.035, "sine"); }
    };
  })();

  /* ════════════════════════ 02 · TIMELINE (inverse only) ══════════
     app.js owns scroll→time. We only need the reverse, to jump the
     film gate to a chosen frame. Same constants, same block order.  */
  var SEG_PX = [1480, 860, 1080, 1020, 760, 680], blocks = [];
  function buildBlocks() {
    blocks = [];
    var prev = 0, hp = Math.round(window.innerHeight * 0.78);
    C.holds.forEach(function (h, idx) {
      var segW = SEG_PX[idx] || Math.max(360, (h.at - prev) * 120);
      blocks.push({ kind: "seg", t0: prev, t1: h.at, px: segW });
      blocks.push({ kind: "hold", t0: h.at, t1: h.at, px: Math.round(hp * (h.mul || 1)), id: h.id });
      prev = h.at;
    });
    if (prev < C.filmDuration) blocks.push({ kind: "seg", t0: prev, t1: C.filmDuration, px: Math.max(240, (C.filmDuration - prev) * 140) });
    var acc = 0;
    blocks.forEach(function (b) { b.s0 = acc; acc += b.px; b.s1 = acc; });
  }
  function scrollAtTime(t) {
    var k, b;
    for (k = 0; k < blocks.length; k++) {
      b = blocks[k];
      if (b.kind === "hold" && Math.abs(t - b.t0) < 0.004) return b.s0 + b.px * 0.4;
      if (b.kind === "seg" && t >= b.t0 && t < b.t1) {
        var u = (t - b.t0) / ((b.t1 - b.t0) || 1);
        return b.s0 + u * b.px;
      }
    }
    /* inside a hold: aim at its middle */
    for (k = 0; k < blocks.length; k++) {
      b = blocks[k];
      if (b.kind === "hold" && Math.abs(t - b.t0) < 0.6) return b.s0 + b.px * 0.4;
    }
    return 0;
  }

  /* ════════════════════════ 03 · INJECTED FURNITURE ══════════════ */
  var NS = "http://www.w3.org/2000/svg";

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* world grade + grid + annotation + grain + scan + lamp */
  var grade = el("div"); grade.id = "x-grade"; body.appendChild(grade);

  var gridSvg = document.createElementNS(NS, "svg");
  gridSvg.id = "x-grid"; gridSvg.setAttribute("preserveAspectRatio", "none");
  body.appendChild(gridSvg);

  var annoSvg = document.createElementNS(NS, "svg");
  annoSvg.id = "x-anno"; annoSvg.setAttribute("preserveAspectRatio", "none");
  body.appendChild(annoSvg);

  var tool = el("canvas"); tool.id = "x-tool"; body.appendChild(tool);
  var tctx = tool.getContext("2d");

  var grain = el("div"); grain.id = "x-grain"; body.appendChild(grain);

  /* channel-split filter, applied to the film only while scrubbing hard */
  body.insertAdjacentHTML("beforeend",
    '<svg id="x-fxdefs" width="0" height="0" aria-hidden="true" style="position:absolute"><defs>' +
    '<filter id="x-aberr" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">' +
      '<feOffset id="x-offR" in="SourceGraphic" dx="0" dy="0" result="oR"/>' +
      '<feColorMatrix in="oR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cR"/>' +
      '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cG"/>' +
      '<feOffset id="x-offB" in="SourceGraphic" dx="0" dy="0" result="oB"/>' +
      '<feColorMatrix in="oB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cB"/>' +
      '<feComposite in="cR" in2="cG" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="s1"/>' +
      '<feComposite in="s1" in2="cB" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>' +
    '</filter></defs></svg>');
  var offR = $("#x-offR"), offB = $("#x-offB");

  /* HUD readout */
  var lux = el("div"); lux.id = "x-lux";
  lux.innerHTML = '<span class="led"></span><span id="x-luxT"></span>';
  body.appendChild(lux);
  var luxT = $("#x-luxT", lux);

  /* the dock */
  var dock = el("div"); dock.id = "x-dock";
  dock.innerHTML =
    '<div class="x-modes" role="group" aria-label="View mode" style="display:flex">' +
      '<button type="button" data-mode="shop" aria-pressed="true"><i></i>Shop<kbd>1</kbd></button>' +
      '<button type="button" data-mode="draw" aria-pressed="false"><i></i>Drawing<kbd>2</kbd></button>' +
      '<button type="button" id="x-replay" aria-pressed="false"><i></i>Replay Intro<kbd>3</kbd></button>' +
    '</div><div class="sep"></div>' +
    '<button type="button" id="x-snd" aria-pressed="false"><i></i>Sound<kbd>S</kbd></button>' +
    '<div class="sep"></div>' +
    '<button type="button" id="x-play" aria-pressed="false"><i></i>Reel<kbd>P</kbd></button>';
  body.appendChild(dock);

  /* toast + coach */
  var toast = el("div"); toast.id = "x-toast"; body.appendChild(toast);
  var coach = el("div"); coach.id = "x-coach"; body.appendChild(coach);

  /* cursor */
  var cur = el("div"); cur.id = "x-cursor";
  cur.innerHTML = '<span class="ring"></span><span class="cross"><i></i><i></i><i></i><i></i></span>' +
                  '<span class="bit"></span><span class="tag">⌀6 MM · 3 FLUTE</span>';
  body.appendChild(cur);

  /* film gate + contact-sheet peephole */
  var strip = el("div"); strip.id = "x-strip"; body.appendChild(strip);
  var peep = el("div"); peep.id = "x-peep"; peep.innerHTML = "<span></span>"; body.appendChild(peep);
  var peepCap = $("span", peep);

  /* easter egg overlay */
  var egg = el("div"); egg.id = "x-egg";
  egg.innerHTML = '<div class="wm">ART<em>VISION</em></div><div class="sub">Production Design · Indore · Est. 2024</div>';
  body.appendChild(egg);

  /* loader furniture */
  (function () {
    var ld = $("#loader");
    if (!ld) return;
    ld.appendChild(el("div", "x-meta",
      "<span>Pre-flighting <b>" + NF + " keyframes</b></span>" +
      "<span>Sheet <b>A-101</b> · Rev C</span>"));
  })();

  /* grain texture, generated once */
  (function () {
    try {
      var s = 110, c = document.createElement("canvas");
      c.width = c.height = s;
      var g = c.getContext("2d"), im = g.createImageData(s, s), i;
      for (i = 0; i < im.data.length; i += 4) {
        var v = 118 + Math.random() * 74;
        im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
        im.data[i + 3] = 26 + Math.random() * 40;
      }
      g.putImageData(im, 0, 0);
      grain.style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
    } catch (e) { grain.style.display = "none"; }
  })();

  /* ════════════════════════ 04 · MODES ══════════════════════════ */
  var MODE = "shop";
  var LUX = {
    shop: "",
    draw: "A1 · scale 1:20 · tol ±0.5 mm · ⌀6 bit · rev C"
  };
  var dockBtns = $$("#x-dock .x-modes button");

  function setMode(m, quiet) {
    if (m !== "draw") m = "shop";
    if (m === MODE && !quiet) return;
    MODE = m;
    body.classList.toggle("x-draw", m === "draw");
    dockBtns.forEach(function (b) {
      var on = b.dataset.mode === m;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    luxT.textContent = LUX[m];
    lux.classList.toggle("on", !!LUX[m]);
    store.set("x-mode", m);
    buildAnno();
    if (!quiet) {
      SND.peel();
      say(m === "draw" ? "<b>Drawing</b> · issued for fabrication"
        : "<b>Shop</b> · back to the portfolio");
      tipSeen(m === "draw" ? "draw" : "");
    }
  }

  dock.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.id === "x-snd") {
      var on = SND.toggle();
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      store.set("x-sound", on ? "1" : "0");
      if (on) { SND.chime(); say("<b>Sound on</b> · the router follows your scroll"); }
      else say("Sound off");
      return;
    }
    if (b.id === "x-replay") {
      if (replay.on) stopReplay(false);
      else startReplayIntro();
      return;
    }
    if (b.id === "x-play") { stopReplay(false); setCinema(!cin.on); return; }
    if (b.dataset.mode) { SND.plunge(); setMode(b.dataset.mode); }
  });

  var toastT = null;
  function say(html, ms) {
    toast.innerHTML = html;
    toast.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove("on"); }, ms || 2600);
  }

  /* ════════════════════════ 05 · CURSOR + TOOLPATH ══════════════ */
  var ptr = { x: innerWidth / 2, y: innerHeight / 2, cx: innerWidth / 2, cy: innerHeight / 2,
              down: false, hot: false, inside: false };
  var trail = [], sparks = [], marks = [];
  var DPR = Math.min(2, window.devicePixelRatio || 1);

  function sizeTool() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    tool.width = Math.round(innerWidth * DPR);
    tool.height = Math.round(innerHeight * DPR);
    tool.style.width = innerWidth + "px";
    tool.style.height = innerHeight + "px";
    tctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  if (FINE.matches && !reduced) {
    body.classList.add("x-cursor-on", "x-hidecursor");
    window.addEventListener("pointermove", function (e) {
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.inside = true;
      root.style.setProperty("--x-mx", e.clientX + "px");
      root.style.setProperty("--x-my", e.clientY + "px");
      if (!ptr.down && MODE !== "draw") {
        trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (trail.length > 90) trail.shift();
      }
      var t = e.target;
      var hot = t && t.closest && t.closest("a,button,.card,.tk");
      if (hot !== ptr.hot) { ptr.hot = !!hot; cur.classList.toggle("hot", ptr.hot); }
    }, { passive: true });
    window.addEventListener("pointerdown", function () { ptr.down = true; cur.classList.add("press"); });
    window.addEventListener("pointerup", function () { ptr.down = false; cur.classList.remove("press"); });
    window.addEventListener("pointerleave", function () { ptr.inside = false; });
    document.addEventListener("mouseleave", function () { ptr.inside = false; });

    /* click = router plunge: a spark burst and a registration nick */
    window.addEventListener("click", function (e) {
      if (reduced) return;
      var i, n = 9;
      for (i = 0; i < n; i++) {
        sparks.push({ x: e.clientX, y: e.clientY,
          vx: rnd(-2.4, 2.4), vy: rnd(-2.8, 0.9), life: 1, r: rnd(0.6, 1.7) });
      }
      marks.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (marks.length > 14) marks.shift();
      SND.plunge();
    }, { passive: true });
  }

  /* measure tool — only in DRAWING mode */
  var meas = null;
  window.addEventListener("pointerdown", function (e) {
    if (MODE !== "draw" || e.button !== 0 || mob()) return;
    var t = e.target;
    if (t && t.closest && t.closest("a,button,.tk,.x-sq,.card")) return;
    meas = { x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY, live: true };
    root.classList.add("x-dragging");
    if (window.getSelection) window.getSelection().removeAllRanges();
  });
  window.addEventListener("pointermove", function (e) {
    if (meas && meas.live) { meas.x1 = e.clientX; meas.y1 = e.clientY; }
  }, { passive: true });
  window.addEventListener("pointerup", function () {
    if (!meas) return;
    meas.live = false;
    root.classList.remove("x-dragging");
    var d = Math.hypot(meas.x1 - meas.x0, meas.y1 - meas.y0);
    if (d > 14) {
      meas.born = performance.now();
      marks.push(meas);
      if (marks.length > 8) marks.shift();
      SND.tick();
    }
    meas = null;
  });

  function drawTool(now) {
    tctx.clearRect(0, 0, innerWidth, innerHeight);
    var i, p, a;

    /* engraved toolpath */
    if (trail.length > 1) {
      for (i = trail.length - 1; i >= 0; i--) {
        if (now - trail[i].t > 900) trail.splice(i, 1);
      }
      for (i = 1; i < trail.length; i++) {
        var age = (now - trail[i].t) / 900;
        a = (1 - age) * 0.5;
        if (a <= 0.01) continue;
        tctx.beginPath();
        tctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        tctx.lineTo(trail[i].x, trail[i].y);
        tctx.strokeStyle = "rgba(227,6,19," + (a * 0.85).toFixed(3) + ")";
        tctx.lineWidth = 1.4 * (1 - age) + 0.25;
        tctx.lineCap = "round";
        tctx.stroke();
      }
    }

    /* sparks */
    for (i = sparks.length - 1; i >= 0; i--) {
      p = sparks[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.11; p.vx *= 0.985; p.life -= 0.035;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      tctx.beginPath();
      tctx.arc(p.x, p.y, p.r * p.life, 0, 6.2832);
      tctx.fillStyle = "rgba(255," + Math.round(150 + 90 * p.life) + ",90," + (p.life * 0.85).toFixed(3) + ")";
      tctx.fill();
    }

    /* registration nicks left by clicks */
    for (i = marks.length - 1; i >= 0; i--) {
      var m = marks[i];
      if (m.life != null) {
        m.life -= 0.006;
        if (m.life <= 0) { marks.splice(i, 1); continue; }
        a = m.life * 0.5;
        tctx.strokeStyle = "rgba(227,6,19," + a.toFixed(3) + ")";
        tctx.lineWidth = 1;
        tctx.beginPath();
        tctx.moveTo(m.x - 6, m.y); tctx.lineTo(m.x + 6, m.y);
        tctx.moveTo(m.x, m.y - 6); tctx.lineTo(m.x, m.y + 6);
        tctx.stroke();
        tctx.beginPath();
        tctx.arc(m.x, m.y, 3.2, 0, 6.2832);
        tctx.stroke();
      } else if (m.x0 != null) {
        /* a persisted measurement */
        var ageM = (now - m.born) / 5200;
        if (ageM > 1) { marks.splice(i, 1); continue; }
        dimension(m.x0, m.y0, m.x1, m.y1, 1 - ageM * 0.35);
      }
    }

    /* live measurement */
    if (meas) dimension(meas.x0, meas.y0, meas.x1, meas.y1, 1);
  }

  var MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  function dimension(x0, y0, x1, y1, alpha) {
    var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 6) return;
    var mm = len * MM_PER_PX();
    var ang = Math.atan2(dy, dx);
    var nx = -Math.sin(ang) * 5, ny = Math.cos(ang) * 5;
    tctx.save();
    tctx.globalAlpha = clamp(alpha, 0, 1);
    tctx.strokeStyle = "#ff4438"; tctx.fillStyle = "#ff4438"; tctx.lineWidth = 1;
    tctx.beginPath(); tctx.moveTo(x0, y0); tctx.lineTo(x1, y1); tctx.stroke();
    /* extension ticks */
    tctx.beginPath();
    tctx.moveTo(x0 - nx, y0 - ny); tctx.lineTo(x0 + nx, y0 + ny);
    tctx.moveTo(x1 - nx, y1 - ny); tctx.lineTo(x1 + nx, y1 + ny);
    tctx.stroke();
    /* arrows */
    arrowHead(x0, y0, ang, 1); arrowHead(x1, y1, ang, -1);
    /* label */
    var lbl = (mm < 10 ? mm.toFixed(1) : Math.round(mm)) + " MM";
    tctx.font = "9px " + MONO;
    var w = tctx.measureText(lbl).width + 10;
    var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    tctx.save();
    tctx.translate(mx, my);
    var flip = Math.abs(ang) > Math.PI / 2;
    tctx.rotate(flip ? ang + Math.PI : ang);
    tctx.fillStyle = "rgba(4,9,18,.92)";
    tctx.fillRect(-w / 2, -13, w, 12);
    tctx.fillStyle = "#ff4438";
    tctx.textAlign = "center";
    tctx.fillText(lbl, 0, -4);
    tctx.restore();
    tctx.restore();
  }
  function arrowHead(x, y, ang, dir) {
    tctx.save(); tctx.translate(x, y); tctx.rotate(ang); tctx.scale(dir, 1);
    tctx.beginPath(); tctx.moveTo(0, 0); tctx.lineTo(8, -2.8); tctx.lineTo(8, 2.8); tctx.closePath();
    tctx.fill(); tctx.restore();
  }

  /* ════════════════════════ 06 · THE LIVE CHARACTER ═════════════
     Two ways to move him that the scrollbar does not know about:
       · at the hero he turns to face your pointer
       · anywhere, grab and drag horizontally to spin all 23 poses   */
  var turn = { active: false, pos: 0, target: 0, dragging: false,
               startX: 0, startPos: 0, lastIdx: -1, release: 0, cooldown: 0 };
  var flipped = false, hisX = innerWidth * 0.72;
  function readHisX() {
    var m = getComputedStyle(film).transform;
    if (m && m.indexOf("matrix") === 0) {
      var v = m.slice(7, -1).split(",");
      var e = parseFloat(v[4]);
      if (!isNaN(e)) hisX = innerWidth / 2 + e;
    }
  }

  function frameIndexFromTime(t) {
    var a = 0, k;
    for (k = 0; k < NF - 1; k++) if (t >= F[k].t) a = k;
    var b = Math.min(a + 1, NF - 1);
    var span = (F[b].t - F[a].t) || 1;
    return a + clamp((t - F[a].t) / span, 0, 1) * (b - a);
  }
  var frLast = [];
  function renderPos(p) {
    p = clamp(p, 0, NF - 1);
    var a = Math.floor(p), b = Math.min(a + 1, NF - 1), m = smooth(p - a), j, o;
    for (j = 0; j < frImgs.length; j++) {
      o = j === a ? 1 - m : j === b ? m : 0;
      if (a === b && j === a) o = 1;
      if (frLast[j] !== o) { frLast[j] = o; frImgs[j].style.opacity = o; }
    }
    var near = m < 0.5 ? a : b;
    if (near !== turn.lastIdx) {
      turn.lastIdx = near;
      if (turn.dragging) SND.detent();
      var lab = F[near] && F[near].a;
      if (lab) { var at = $("#angleT"); if (at) at.textContent = lab; }
      markStrip(near);
    }
    return p;
  }
  function displayedIndex() {
    var best = 0, bv = -1, i, v;
    for (i = 0; i < frImgs.length; i++) {
      v = parseFloat(frImgs[i].style.opacity || 0);
      if (v > bv) { bv = v; best = i; }
    }
    return best;
  }

  /* drag to spin (mouse/pen only — touch tablets scroll natively) */
  window.addEventListener("pointerdown", function (e) {
    if (caseOpen || e.pointerType === "touch" || !FINE.matches || MODE === "draw" || mob() || reduced) return;
    var t = e.target;
    if (t && t.closest && t.closest("a,button,.tk,.x-sq,#x-dock,.paper")) return;
    e.preventDefault();                      /* no image drag, no text drag */
    turn.dragging = true; turn.moved = false;
    turn.startX = e.clientX;
    turn.startPos = turn.target = turn.pos = displayedIndex();
    turn.active = true;
    root.classList.add("x-dragging");
  });
  window.addEventListener("pointermove", function (e) {
    if (!turn.dragging) return;
    var dx = e.clientX - turn.startX;
    if (Math.abs(dx) > 5) turn.moved = true;
    if (!turn.moved) return;
    turn.target = clamp(turn.startPos - dx / 26, 0, NF - 1);
    tipSeen("drag");
  }, { passive: true });
  window.addEventListener("pointerup", function () {
    if (!turn.dragging) return;
    turn.dragging = false;
    root.classList.remove("x-dragging");
    if (turn.moved) turn.release = performance.now();
    else turn.active = false;
  });
  window.addEventListener("pointercancel", function () {
    turn.dragging = false; root.classList.remove("x-dragging"); turn.active = false;
  });

  /* he faces your pointer during the opening beat */
  var lastScroll = performance.now(), followOn = false, hisT = 0;
  var followFrames = [
    findFrameIdx("x2_front"),
    findFrameIdx("x1_turn45"),
    findFrameIdx("x1b_turn90")
  ];
  function ts500() {
    var n = performance.now();
    if (n - hisT > 400) { hisT = n; return true; }
    return false;
  }
  window.addEventListener("scroll", function () {
    lastScroll = performance.now();
    /* the scrollbar is the boss again: hand the film straight back to app.js */
    if (followOn || turn.active) { followOn = false; turn.active = false; turn.release = 0; }
  }, { passive: true });

  function updateTurn(now) {
    /* release: glide back to wherever the scrollbar says we are */
    if (turn.active && !turn.dragging && turn.release) {
      var y = window.scrollY || window.pageYOffset || 0;
      var home = frameIndexFromTime(timeFromDisplay(y));
      var u = clamp((now - turn.release) / 480, 0, 1);
      turn.pos = lerp(turn.pos == null ? home : turn.pos, home, smooth(u) * 0.35 + 0.06);
      renderPos(turn.pos);
      if (u >= 1) { turn.active = false; turn.release = 0; }
      return;
    }
    if (turn.dragging && turn.moved) {
      turn.pos = lerp(turn.pos == null ? turn.target : turn.pos, turn.target, 0.34);
      renderPos(turn.pos);
      return;
    }

    /* pointer follow — only while the opening hold is on screen */
    var canFollow = FINE.matches && !reduced && !mob() && !caseOpen && !(window.__RJ_DANCE && window.__RJ_DANCE.active) &&
                    activeId === "intro" && (now - lastScroll > 420) && !ptr.down;
    if (canFollow) {
      if (ts500()) readHisX();
      var nx = clamp((ptr.x - hisX) / (innerWidth * 0.5), -1, 1);
      var off = Math.abs(nx);                                /* 0 on him → 1 edge */
      var fi = followFrames[Math.min(2, Math.round(clamp(off, 0, 1) * 2))];
      var wantFlip = nx < 0;                                 /* you are on his left */
      if (wantFlip !== flipped) { flipped = wantFlip; body.classList.toggle("x-flip", flipped); }
      turn.pos = lerp(turn.pos == null ? fi : turn.pos, fi, 0.09);
      renderPos(turn.pos);
      followOn = true;
    } else if (followOn) {
      followOn = false;
    }
    if (flipped && !canFollow) { flipped = false; body.classList.remove("x-flip"); }
  }
  function timeFromDisplay(y) {
    /* mirror of app.js timeAt(), used only to find the way home */
    var k, b;
    if (y <= 0) return 0;
    for (k = 0; k < blocks.length; k++) {
      b = blocks[k];
      if (y < b.s1) {
        if (b.kind === "hold") return b.t0;
        var u = (y - b.s0) / b.px;
        return b.t0 + (b.t1 - b.t0) * u;
      }
    }
    return C.filmDuration;
  }

  /* ════════════════════════ 07 · VELOCITY OPTICS ═════════════════ */
  var vel = { y: 0, v: 0, aberr: 0, allowed: !reduced && !mob(), bad: 0,
              init: 0, sndT: 0, fxT: 0, grain: -1, spin: "" };

  function updateVelocity(now, dt) {
    var y = window.scrollY || window.pageYOffset || 0;
    if (!vel.init) { vel.init = 1; vel.y = y; }
    var inst = dt > 0 ? (y - vel.y) / dt : 0;            /* px per ms */
    vel.y = y;
    vel.v = lerp(vel.v, inst, 0.32);
    var a = Math.abs(vel.v);

    /* router spin: cursor ring + sound both read this */
    var spin = clamp(1.5 - a * 0.16, 0.16, 1.5).toFixed(2) + "s";
    if (spin !== vel.spin) { vel.spin = spin; root.style.setProperty("--x-spin", spin); }
    if (now - vel.sndT > 70) { vel.sndT = now; SND.spin(a > 0.28 ? a : 0); }

    /* gate smear */
    var blur = clamp((a - 1.1) * 1.15, 0, 2.8);
    var want = vel.allowed && a > 2.4 ? clamp((a - 2.4) * 1.15, 0, 6.5) : 0;
    vel.aberr = lerp(vel.aberr, want, want > vel.aberr ? 0.5 : 0.12);
    var f = [];
    if (blur > 0.05) f.push("blur(" + blur.toFixed(2) + "px)");
    if (vel.aberr > 0.35) f.push("url(#x-aberr)");
    var fs = f.length ? f.join(" ") : "";
    if (film.getAttribute("data-f") !== fs) { film.style.filter = fs; film.setAttribute("data-f", fs); }
    if (vel.aberr > 0.35 && now - vel.fxT > 45) {
      vel.fxT = now;
      var d = vel.aberr.toFixed(1);
      offR.setAttribute("dx", "-" + d);
      offB.setAttribute("dx", d);
    }

    /* adaptive quality: if the page is struggling, drop the filter for good */
    if (dt > 34) { vel.bad++; } else if (vel.bad > 0) { vel.bad--; }
    if (vel.bad > 90) { vel.allowed = false; vel.bad = 0; }

    /* grain lifts with speed */
    var go = Math.round(((MODE === "draw" ? 0.045 : 0.05) +
                         clamp(a * 0.012, 0, 0.05)) * 100);
    if (go !== vel.grain) { vel.grain = go; grain.style.opacity = (go / 100).toFixed(2); }
  }

  /* ════════════════════════ 08 · SHOP DRAWING ════════════════════ */
  function sizeSvg(svg, w, h) {
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", w); svg.setAttribute("height", h);
  }
  function buildGrid() {
    var w = innerWidth, h = innerHeight;
    sizeSvg(gridSvg, w, h);
    gridSvg.innerHTML =
      '<defs>' +
        '<pattern id="xg1" width="26" height="26" patternUnits="userSpaceOnUse">' +
          '<path d="M26 0H0V26" fill="none" stroke="rgba(143,186,255,.075)" stroke-width=".6"/></pattern>' +
        '<pattern id="xg2" width="130" height="130" patternUnits="userSpaceOnUse">' +
          '<rect width="130" height="130" fill="url(#xg1)"/>' +
          '<path d="M130 0H0V130" fill="none" stroke="rgba(143,186,255,.16)" stroke-width=".8"/></pattern>' +
      '</defs><rect width="' + w + '" height="' + h + '" fill="url(#xg2)"/>';
  }

  function R(node) { return node ? node.getBoundingClientRect() : null; }
  function dimH(x1, x2, y, label, red, off) {
    if (x2 < x1) { var t = x1; x1 = x2; x2 = t; }
    if (x2 - x1 < 12) return "";
    var o = off || 7, c = red ? "dimx an" : "dim", tc = red ? "an" : "";
    var mid = (x1 + x2) / 2;
    var w = label.length * 6.9 + 12;
    return '<g class="' + c + '">' +
      '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"/>' +
      '<line x1="' + x1 + '" y1="' + (y - o) + '" x2="' + x1 + '" y2="' + (y + o) + '"/>' +
      '<line x1="' + x2 + '" y1="' + (y - o) + '" x2="' + x2 + '" y2="' + (y + o) + '"/>' +
      '<path d="M' + x1 + ' ' + y + ' l8 -3 l0 6 z" class="' + (red ? "dimx" : "dim") + '" fill="' + (red ? "#ff4438" : "#8fbaff") + '" stroke="none"/>' +
      '<path d="M' + x2 + ' ' + y + ' l-8 -3 l0 6 z" fill="' + (red ? "#ff4438" : "#8fbaff") + '" stroke="none"/>' +
      '<rect x="' + (mid - w / 2) + '" y="' + (y - 13) + '" width="' + w + '" height="11" fill="rgba(4,9,18,.94)" stroke="none"/>' +
      '<text class="' + tc + '" x="' + mid + '" y="' + (y - 4.5) + '" text-anchor="middle">' + label + '</text></g>';
  }
  function dimV(y1, y2, x, label, red) {
    if (y2 < y1) { var t = y1; y1 = y2; y2 = t; }
    if (y2 - y1 < 12) return "";
    var mid = (y1 + y2) / 2, w = label.length * 6.9 + 12;
    var col = red ? "#ff4438" : "#8fbaff";
    return '<g class="' + (red ? "dimx" : "dim") + '">' +
      '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '"/>' +
      '<line x1="' + (x - 7) + '" y1="' + y1 + '" x2="' + (x + 7) + '" y2="' + y1 + '"/>' +
      '<line x1="' + (x - 7) + '" y1="' + y2 + '" x2="' + (x + 7) + '" y2="' + y2 + '"/>' +
      '<path d="M' + x + ' ' + y1 + ' l-3 8 l6 0 z" fill="' + col + '" stroke="none"/>' +
      '<path d="M' + x + ' ' + y2 + ' l-3 -8 l6 0 z" fill="' + col + '" stroke="none"/>' +
      '<rect x="' + (x - w / 2) + '" y="' + (mid - 5.5) + '" width="' + w + '" height="11" fill="rgba(4,9,18,.94)" stroke="none"/>' +
      '<text class="' + (red ? "an" : "") + '" x="' + x + '" y="' + (mid + 3) + '" text-anchor="middle">' + label + '</text></g>';
  }
  function leader(x1, y1, x2, y2, label, red) {
    var col = red ? "#ff4438" : "#8fbaff";
    var tw = label.length * 6.9 + 12, W = innerWidth, m = mob() ? 14 : 26;
    var anchor = x2 > x1 ? "start" : "end";
    if (anchor === "start") x2 = clamp(x2, m + 4, W - m - tw - 4);
    else x2 = clamp(x2, m + tw + 4, W - m - 4);
    var tx = x2 + (x2 > x1 ? 5 : -5);
    return '<g class="' + (red ? "dimx" : "dim") + '">' +
      '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>' +
      '<circle cx="' + x1 + '" cy="' + y1 + '" r="2" fill="' + col + '" stroke="none"/>' +
      '<text class="' + (red ? "an" : "") + '" x="' + tx + '" y="' + (y2 + 3) + '" text-anchor="' + anchor + '">' + label + '</text></g>';
  }
  function cross(x, y, r) {
    return '<g class="mark"><circle cx="' + x + '" cy="' + y + '" r="' + r + '"/>' +
      '<line x1="' + (x - r - 5) + '" y1="' + y + '" x2="' + (x + r + 5) + '" y2="' + y + '"/>' +
      '<line x1="' + x + '" y1="' + (y - r - 5) + '" x2="' + x + '" y2="' + (y + r + 5) + '"/></g>';
  }
  function cloud(x, y, w, h, r) {
    var d = "", n, i, s;
    r = r || 8;
    n = Math.max(2, Math.round(w / (r * 2))); s = w / n;
    d += "M" + x + " " + y;
    for (i = 0; i < n; i++) d += " a" + (s / 2) + " " + (s / 2) + " 0 0 1 " + s + " 0";
    n = Math.max(2, Math.round(h / (r * 2))); s = h / n;
    for (i = 0; i < n; i++) d += " a" + (s / 2) + " " + (s / 2) + " 0 0 1 0 " + s;
    n = Math.max(2, Math.round(w / (r * 2))); s = w / n;
    for (i = 0; i < n; i++) d += " a" + (s / 2) + " " + (s / 2) + " 0 0 1 " + (-s) + " 0";
    n = Math.max(2, Math.round(h / (r * 2))); s = h / n;
    for (i = 0; i < n; i++) d += " a" + (s / 2) + " " + (s / 2) + " 0 0 1 0 " + (-s);
    return '<path class="cloud" d="' + d + ' Z"/>';
  }

  var annoKey = "";
  function buildAnno(force) {
    if (MODE !== "draw") { if (annoKey !== "") { annoSvg.innerHTML = ""; annoKey = ""; } return; }
    var w = innerWidth, h = innerHeight, mm = MM_PER_PX(), small = mob();
    sizeSvg(annoSvg, w, h);
    var actId = activeId || "hero";
    var key = actId + "|" + Math.round(w) + "|" + Math.round(h);
    if (key === annoKey && !force) return;
    annoKey = key;

    var out = [], m = small ? 14 : 26, i;

    /* sheet border + crop marks + bleed */
    out.push('<rect class="hair" x="' + m + '" y="' + m + '" width="' + (w - m * 2) + '" height="' + (h - m * 2) + '" stroke-dasharray="5 4"/>');
    out.push('<rect class="hair" x="' + (m - 9) + '" y="' + (m - 9) + '" width="' + (w - m * 2 + 18) + '" height="' + (h - m * 2 + 18) + '" opacity=".55"/>');
    var corners = [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]];
    corners.forEach(function (c) {
      out.push('<g class="mark"><line x1="' + c[0] + '" y1="' + (c[1] + 16 * c[3]) + '" x2="' + c[0] + '" y2="' + (c[1] + 30 * c[3]) + '"/>' +
        '<line x1="' + (c[0] + 16 * c[2]) + '" y1="' + c[1] + '" x2="' + (c[0] + 30 * c[2]) + '" y2="' + c[1] + '"/></g>');
    });
    out.push('<text x="' + (m + 2) + '" y="' + (m - 14) + '">Bleed 3 mm</text>');
    out.push(cross(w / 2, m, 5)); out.push(cross(w / 2, h - m, 5));
    out.push(cross(m, h / 2, 5)); out.push(cross(w - m, h / 2, 5));

    /* figure leader to the character */
    if (!small) {
      var AR = 16 / 9, fwPx = (w / h < AR) ? w * 1.035 : h * 1.035 * AR;
      out.push(leader(w / 2, h / 2, Math.min(w - m - 132, w / 2 + fwPx * 0.30), h / 2 - h * 0.30,
        "Fig. 01 — character ref · " + NF + " positions · 180°", false));
    }

    /* live dimensions on whatever section is up */
    function mmv(px) { var v = px * mm; return (v < 10 ? v.toFixed(1) : Math.round(v)) + " mm"; }

    if (!small && actId === "intro") {
      var b = R($(".big")), r1 = R($("#n1"));
      if (b) {
        out.push(dimH(b.left, b.right, b.bottom + 26, "Sign face " + mmv(b.width), false));
        out.push(dimV(b.top, b.bottom, b.left - 26, mmv(b.height), true));
      }
      if (r1) out.push(leader(r1.left + 4, r1.top + 6, r1.left - 70, r1.top - 46,
        "Cap height " + mmv(r1.height * 0.72), true));
      var dot = R($(".dot"));
      if (dot) out.push(leader(dot.left + 3, dot.top + 3, dot.left + 150, dot.top - 40,
        "⌀12 LED · 22.4 mA · IP65", true));
    }
    if (!small && actId === "about") {
      var ab = R($(".ab")), at = R($("#aTitle"));
      if (ab) out.push(dimH(ab.left, ab.right, ab.bottom + 22, mmv(ab.width), false));
      if (at) {
        out.push(cloud(at.left - 12, at.top - 12, at.width + 24, at.height + 24, 9));
        out.push('<text class="an" x="' + (at.right - 4) + '" y="' + (at.top - 20) + '" text-anchor="end">Rev C — 15.11.26</text>');
      }
      var st = R($(".statrow"));
      if (st) out.push(leader(st.left + 12, st.top, st.left - 40, st.top - 44,
        "Counter units · 1:20", false));
      var br = R($(".x-brk"));
      if (br) out.push(leader(br.left + br.width / 2, br.bottom - 6, br.left + br.width / 2 + 120, br.bottom + 34,
        "Fig. 02 — cantilever bracket, 6 mm MS, zinc plated", true));
    }
    if (!small && actId === "work") {
      var cards = $$(".card"), c0 = R(cards[0]), c1 = R(cards[1]);
      if (c0 && c1) {
        out.push(dimH(c0.left, c1.left, c0.top - 26, "Pitch " + mmv(c1.left - c0.left), false));
      }
      if (c0) {
        out.push(dimV(c0.top, c0.bottom, c0.left - 22, mmv(c0.height), false));
        out.push(leader(c0.left + c0.width / 2, c0.top + 10, c0.left + c0.width / 2 - 60, c0.top - 62,
          "⌀6 bit · 3 mm radial offset · ±0.5", true));
      }
      var last = R(cards[cards.length - 1]);
      if (last) out.push(leader(last.right - 12, last.bottom - 12, last.right + 40, last.bottom + 40,
        "Panel 5 of 5 · ACM 3 mm", false));
      var wh = R($(".whead"));
      if (wh) out.push(dimH(wh.left, wh.right, wh.top - 16, mmv(wh.width), false));
    }
    if (!small && actId === "skills") {
      var ch = R($(".chips"));
      if (ch) {
        out.push(dimH(ch.left, ch.right, ch.bottom + 24, mmv(ch.width), false));
        out.push(leader(ch.left + 18, ch.top + 8, ch.left - 30, ch.top - 46,
          "Min reproduction 12 mm · weeded by hand", true));
      }
      var sk = R($("#s-skills h2"));
      if (sk) out.push(cloud(sk.left - 12, sk.top - 12, sk.width + 24, sk.height + 24, 9));
    }
    if (!small && actId === "resume") {
      var pp = R($(".paper"));
      if (pp) {
        out.push(dimH(pp.left, pp.right, pp.bottom + 24, "210 mm", false));
        out.push(dimV(pp.top, pp.bottom, pp.right + 24, "297 mm", false));
        out.push(leader(pp.left + 18, pp.top + 14, pp.left - 60, pp.top - 44,
          "A4 · 120 gsm · uncoated", false));
      }
      var dl = R($(".dl"));
      if (dl) out.push(leader(dl.left + 8, dl.bottom - 4, dl.left + 130, dl.bottom + 34,
        "Issue button · pdf/a-1b", true));
    }
if (!small && actId === "contact") {
      var ct = R($(".ctitle")), cm = R($("#cMail")), fs2 = R($("#frameSvg rect"));
      if (ct) out.push(dimH(ct.left, ct.right, ct.top - 22, "Channel letters " + mmv(ct.height * 0.7), true));
      if (cm) out.push(leader(cm.left + 10, cm.bottom, cm.left - 40, cm.bottom + 44,
        "Vinyl · drag to apply · ΔE ≤ 3.0", true));
      if (fs2) out.push(dimV(fs2.top, fs2.bottom, fs2.right + 20, mmv(fs2.height), false));
    }

    /* safe margin + scale bar */
    if (!small) {
      out.push(dimV(m, h - m, m + 46, "A1 · 594 mm", false));
      var sbMM = 200, sbw = sbMM * mm;
      while (sbw > 150 && sbMM > 20) { sbMM -= 20; sbw = sbMM * mm; }
      var sbx = m + 96, sby = m + 52;
      out.push('<g class="dim"><line x1="' + sbx + '" y1="' + sby + '" x2="' + (sbx + sbw) + '" y2="' + sby + '"/>');
      for (i = 0; i <= 4; i++) {
        out.push('<line x1="' + (sbx + sbw * i / 4) + '" y1="' + (sby - (i % 2 ? 4 : 7)) + '" x2="' + (sbx + sbw * i / 4) + '" y2="' + sby + '"/>');
      }
      out.push('<text x="' + sbx + '" y="' + (sby - 11) + '">0</text>' +
               '<text x="' + (sbx + sbw) + '" y="' + (sby - 11) + '" text-anchor="end">' + sbMM + ' mm</text></g>');
    }

    /* title block */
    var tw = 236, th = 96, tx = w - m - tw - 8, ty = h - m - th - 62;
    if (small) { tw = 178; th = 84; tx = w - m - tw; ty = m + 26; }
    out.push('<rect class="tb" x="' + tx + '" y="' + ty + '" width="' + tw + '" height="' + th + '"/>');
    out.push('<line class="hair" x1="' + tx + '" y1="' + (ty + 22) + '" x2="' + (tx + tw) + '" y2="' + (ty + 22) + '"/>');
    out.push('<line class="hair" x1="' + tx + '" y1="' + (ty + 44) + '" x2="' + (tx + tw) + '" y2="' + (ty + 44) + '"/>');
    out.push('<line class="hair" x1="' + tx + '" y1="' + (ty + 66) + '" x2="' + (tx + tw) + '" y2="' + (ty + 66) + '"/>');
    out.push('<line class="hair" x1="' + (tx + tw * 0.58) + '" y1="' + (ty + 44) + '" x2="' + (tx + tw * 0.58) + '" y2="' + (ty + th) + '"/>');
    out.push('<text class="tbv" x="' + (tx + 9) + '" y="' + (ty + 15) + '">ArtViSiON Production Design</text>');
    out.push('<text class="tbl" x="' + (tx + 9) + '" y="' + (ty + 37) + '">' + (small ? "Project — Portfolio" : "Project — Ranjan Sarkar · Portfolio") + '</text>');
    out.push('<text class="tbl" x="' + (tx + 9) + '" y="' + (ty + 59) + '">Sheet A-101</text>');
    out.push('<text class="tbl" x="' + (tx + 9) + '" y="' + (ty + 81) + '">Drawn RS · Chk RS</text>');
    out.push('<text class="tbv" x="' + (tx + tw * 0.58 + 9) + '" y="' + (ty + 59) + '">Scale 1:20</text>');
    out.push('<text class="tbv" x="' + (tx + tw * 0.58 + 9) + '" y="' + (ty + 81) + '">15.11.2026</text>');

    /* the stamp */
    if (!small) {
      var sx = w - m - 208, sy = m + 40;
      out.push('<g transform="rotate(-7 ' + sx + ' ' + sy + ')">' +
        '<rect class="stamp" x="' + sx + '" y="' + sy + '" width="196" height="26" rx="2"/>' +
        '<rect class="stamp" x="' + (sx + 3) + '" y="' + (sy + 3) + '" width="190" height="20" rx="1" opacity=".55"/>' +
        '<text class="stampt" x="' + (sx + 98) + '" y="' + (sy + 17) + '" text-anchor="middle">Issued for fabrication</text></g>');
    }

    annoSvg.innerHTML = out.join("");
  }

  /* ════════════════════════ 09 · TYPE + OBJECT CRAFT ═════════════ */
  function splitWords(node) {
    if (!node || node.dataset.xsplit) return;
    var parts = String(node.innerHTML).split(/<br\s*\/?>/i);
    var n = 0;
    node.innerHTML = parts.map(function (line) {
      return line.trim().split(/\s+/).filter(Boolean).map(function (wd) {
        n++;
        return '<span class="x-w"><i style="transition-delay:' + (n * 42) + 'ms">' + wd + "</i></span>";
      }).join(" ");
    }).join("<br>");
    node.dataset.xsplit = "1";
  }
  ["#aTitle", "#wTitle", ".ctitle", "#s-skills h2", "#n1", "#n2"].forEach(function (s) {
    var n = $(s); if (n) splitWords(n);
  });

  /* mechanical odometer for the stats */
  var odos = [];
  (function () {
    $$(".statrow .n").forEach(function (node) {
      var txt = (node.textContent || "").trim();
      if (!txt) return;
      node.innerHTML = "";
      var wrap = el("span", "odo");
      txt.split("").forEach(function (ch) {
        if (ch >= "0" && ch <= "9") {
          var c = el("span", "oc"), s = el("span", "os"), d;
          for (d = 0; d < 10; d++) { var b = document.createElement("b"); b.textContent = d; s.appendChild(b); }
          c.appendChild(s); c.dataset.d = ch; wrap.appendChild(c);
        } else {
          wrap.appendChild(el("span", "oc flat" + (ch === "+" ? " plus" : ""), ch));
        }
      });
      node.appendChild(wrap);
      odos.push({ node: node, rolled: false });
    });
  })();
  function rollOdo(go) {
    odos.forEach(function (o) {
      if (o.rolled === go) return;
      o.rolled = go;
      $$(".oc", o.node).forEach(function (c, k) {
        var s = $(".os", c); if (!s) return;
        s.style.transitionDelay = (k * 78) + "ms";
        s.style.transform = go ? "translateY(" + (-parseInt(c.dataset.d, 10)) + "em)" : "translateY(0)";
      });
      if (go) SND.tick();
    });
  }

  /* the bracket that holds the headline up */
  (function () {
    var t = $("#aTitle");
    if (!t) return;
    var b = el("div", "x-brk");
    b.innerHTML =
      '<svg width="150" height="52" viewBox="0 0 150 52" aria-hidden="true">' +
        '<path d="M6 8 H110 a14 14 0 0 1 14 14 V48" style="--dl:160"/>' +
        '<path d="M6 20 H98 a14 14 0 0 1 14 14 V48" style="--dl:140" opacity=".42"/>' +
        '<line x1="6" y1="8" x2="6" y2="48" style="--dl:42"/>' +
        '<circle class="bolt" cx="24" cy="14" r="4" style="--dl:26"/>' +
        '<circle class="bolt" cx="56" cy="14" r="4" style="--dl:26"/>' +
        '<circle class="bolt" cx="117" cy="30" r="4" style="--dl:26"/>' +
        '<line x1="100" y1="40" x2="128" y2="40" opacity=".45" style="--dl:30"/>' +
        '<text x="7" y="51">R14 · 6 mm MS · ±0.5</text>' +
      '</svg>' +
      '<span class="cap">Fig. 02 — the bracket that holds it up.<br>6 mm mild steel, zinc plated, M8 through-bolted.</span>';
    t.parentNode.insertBefore(b, t.nextSibling);
  })();

  /* laminated card tilt + specular */
  var cards = $$(".card"), tiltOn = false;
  function armCards(on) {
    if (on === tiltOn) return;
    tiltOn = on;
    cards.forEach(function (c) {
      c.classList.toggle("x-live", on);
      if (!on) c.style.transform = "";
    });
  }
  if (FINE.matches && !reduced) {
    cards.forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        if (!tiltOn || seqOn) return;
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty("--x-mx", (px * 100).toFixed(1) + "%");
        c.style.setProperty("--x-my", (py * 100).toFixed(1) + "%");
        c.style.transform = "rotateY(" + ((px - 0.5) * 10).toFixed(2) + "deg) rotateX(" +
          ((0.5 - py) * 8).toFixed(2) + "deg) translateZ(14px) scale(1.02)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* magnetic nav + magnetic email */
  if (FINE.matches && !reduced) {
    $$("#bar nav button, .cmail, .dl").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        b.style.transform = "translate(" + clamp(dx, -7, 7).toFixed(2) + "px," +
          clamp(dy, -5, 5).toFixed(2) + "px)";
        b.style.transition = "transform .12s ease-out, color .25s";
      });
      b.addEventListener("pointerleave", function () {
        b.style.transform = ""; b.style.transition = "transform .5s cubic-bezier(.16,1,.3,1), color .25s";
      });
    });
  }

  /* vinyl squeegee over the email */
  (function () {
    var mail = $("#cMail");
    if (!mail) return;
    var sq = el("span", "x-sq");
    mail.parentNode.insertBefore(sq, mail);
    sq.appendChild(mail);
    sq.insertAdjacentHTML("beforeend",
      '<span class="mask"></span><span class="squeegee"></span>' +
      '<span class="prompt"><span class="lg">Drag right to apply the vinyl ▸</span>' +
      '<span class="sm">Drag to apply ▸</span></span>' +
      '<span class="ok">✓ Applied · ΔE 2.1 · 12 mm min</span>');
    sq.style.setProperty("touch-action", "pan-y");
    var mask = $(".mask", sq), sqg = $(".squeegee", sq);
    var p = 0, x0 = 0, dragging = false, done = false;

    function apply(v) {
      p = clamp(v, 0, 1);
      mask.style.clipPath = "inset(0 0 0 " + (p * 100).toFixed(1) + "%)";
      mask.style.webkitClipPath = mask.style.clipPath;
      sqg.style.left = (p * 100).toFixed(1) + "%";
      if (p >= 0.985) finish();
    }
    function finish() {
      if (done) return;
      done = true; sq.classList.add("done");
      sq.classList.remove("drag"); root.classList.remove("x-dragging");
      dragging = false;
      coach.classList.remove("on"); clearTimeout(tipT);
      SND.peel(); tipSeen("squeegee");
    }
    sq.addEventListener("pointerdown", function (e) {
      if (done) return;
      e.preventDefault();                    /* the anchor must not start a native drag */
      dragging = true; x0 = e.clientX; sq.classList.add("drag");
      root.classList.add("x-dragging");
      mask.style.transition = "none";
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging || done) return;
      var w = Math.max(60, sq.offsetWidth);
      apply((e.clientX - x0) / (w * 0.82));
    }, { passive: true });
    window.addEventListener("pointerup", function () {
      if (!dragging || done) return;
      dragging = false; sq.classList.remove("drag");
      root.classList.remove("x-dragging");
      mask.style.transition = "clip-path .5s cubic-bezier(.16,1,.3,1)";
      apply(0);
    });
    mail.addEventListener("click", function () { finish(); });
    /* never hold the address hostage */
    setTimeout(function () {
      var obs = setInterval(function () {
        if ($("#s-contact") && $("#s-contact").classList.contains("on")) {
          clearInterval(obs);
          setTimeout(function () { if (!done) finish(); }, 9000);
        }
      }, 600);
    }, 2000);
    /* keep it square on the page */
    var st = document.createElement("style");
    st.textContent = ".x-sq #cMail{margin-top:0}";
    document.head.appendChild(st);
  })();

  /* ════════════════════════ 10 · FILM GATE ══════════════════════ */
  var ticks = [];
  (function () {
    var holdTs = C.holds.map(function (h) { return h.at; });
    F.forEach(function (f, i) {
      var t = el("div", "tk" + (holdTs.indexOf(f.t) >= 0 ? " hold" : ""));
      t.dataset.i = i;
      t.innerHTML = '<span class="cap">' + (f.a || "frame " + i) + "</span>";
      t.addEventListener("click", function () {
        window.scrollTo({ top: scrollAtTime(f.t), behavior: reduced ? "auto" : "smooth" });
        SND.tick();
      });
      t.addEventListener("pointerenter", function (e) {
        var r = t.getBoundingClientRect();
        peep.style.left = (r.left - 78) + "px";
        peep.style.top = r.top + "px";
        peep.style.backgroundImage = "url(" + f.src + ")";
        peepCap.textContent = (f.a || "") + " · t " + f.t.toFixed(1) + "s";
        peep.classList.add("on");
        strip.classList.add("hot");
      });
      t.addEventListener("pointerleave", function () {
        peep.classList.remove("on"); strip.classList.remove("hot");
      });
      strip.appendChild(t); ticks.push(t);
    });
  })();
  var stripIdx = -1;
  function markStrip(i) {
    if (i === stripIdx) return;
    if (ticks[stripIdx]) ticks[stripIdx].classList.remove("on");
    stripIdx = i;
    if (ticks[i]) ticks[i].classList.add("on");
  }

  /* ════════════════════════ 11 · COACH + EGGS + KEYS ═════════════ */
  var seen = {};
  (function () {
    var s = store.get("x-seen", "");
    s.split(",").forEach(function (k) { if (k) seen[k] = 1; });
  })();
  function tipSeen(k) { if (k) { seen[k] = 1; store.set("x-seen", Object.keys(seen).join(",")); } }
  var TIPS = [
    { id: "drag", test: function (a) { return a === "intro"; },
      html: "Grab him and <em>drag sideways</em> — " + NF + " keyframes" },
    { id: "draw", test: function (a) { return a === "about" || a === "work"; },
      html: "Press <em>2</em> — the page becomes its own shop drawing" },
    { id: "replay", test: function (a) { return a === "work" || a === "skills"; },
      html: "Press <em>3</em> or tap <em>Replay Intro</em> — spin, jump &amp; dance" },
    { id: "squeegee", test: function (a) { return a === "contact"; },
      html: "The email is masked. <em>Drag it</em> to apply the vinyl" }
  ];
  var tipT = null, tipUntil = 0;
  function showTip(a) {
    if (toast.classList.contains("on")) return;
    for (var i = 0; i < TIPS.length; i++) {
      var t = TIPS[i];
      if (!seen[t.id] && t.test(a)) {
        coach.innerHTML = t.html;
        coach.classList.add("on");
        clearTimeout(tipT);
        tipT = setTimeout(function () { coach.classList.remove("on"); }, 6200);
        tipUntil = performance.now() + 6400;
        tipSeen(t.id);
        return;
      }
    }
    coach.classList.remove("on");
  }

  var buf = "";
  function eggFire(name) {
    if (name === "av") {
      egg.classList.add("on"); SND.chime();
      setTimeout(function () { egg.classList.remove("on"); }, 2600);
      say("<b>ArtViSiON</b> · production design · Indore");
    }
  }

  window.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (window.RJWorkshop.active() || $(".rg-zoom[open]")) return;
    if (caseOpen) {
      if (e.defaultPrevented || (introOpen && introFullscreen())) return;
      if (k === "Escape") { e.preventDefault(); closeCase(); }
      else if (!introOpen && !e.target.closest("select") && (k === "ArrowRight" || k === "ArrowLeft")) {
        e.preventDefault(); gallery.step(k === "ArrowRight" ? 1 : -1);
      }
      return;
    }
    if (k === "1") { setMode("shop"); return; }
    if (k === "2") { setMode("draw"); return; }
    if (k === "3" || k === "r" || k === "R") { if (replay.on) stopReplay(false); else startReplayIntro(); return; }
    if (k === "0") { stopReplay(false); setMode("shop"); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (k === "s" || k === "S") { $("#x-snd").click(); return; }
    if (k === "p" || k === "P") { setCinema(!cin.on); return; }
    if (cin.on && k.length === 1) setCinema(false);
    if (k === "Escape") {
      marks.length = 0; egg.classList.remove("on"); coach.classList.remove("on"); return;
    }
    if (/^[a-zA-Z0-9]$/.test(k)) {
      buf = (buf + k.toUpperCase()).slice(-9);
      if (buf.indexOf("CNC") >= 0) { buf = ""; setMode("draw");
        say("<b>Toolpath loaded</b> · ⌀6 bit · 3 mm radial offset · one setup"); SND.plunge(); }
      else if (buf.indexOf("ARTVISION") >= 0 || buf.slice(-2) === "AV") { buf = ""; eggFire("av"); }
    }
  });


  /* ════════════════ 11b · WAVE 2 — THE NIGHT INSTALL ═══════════════
     The work hold is 1.7× longer than the others for a reason: across
     it, the five services are INSTALLED. A site clock runs 22:00→06:00,
     each panel is hoisted up, its roller shutter opens slat by slat,
     then the lamps strike — and the site log tells you what went up.  */
  var seqOn = false, clockT = null, logT = null;
  var INST = [
    { t: "22:40", log: "22:40 · C21 Mall · fascia 01 of 14 up · lamps struck" },
    { t: "23:55", log: "23:55 · ratio drawing holds · shopfront 212 of 300" },
    { t: "01:20", log: "01:20 · mark + construction grid released to production" },
    { t: "03:05", log: "03:05 · router running · ±0.5 mm over 2400 mm · one setup" },
    { t: "04:50", log: "04:50 · backlit panel married to the screen · ΔE 2.1" }
  ];
  (function buildSeq() {
    var wh = $(".whead");
    if (wh) {
      wh.insertAdjacentHTML("beforeend",
        '<div class="x-siteclock"><span class="led"></span><span id="x-clock">22:00</span>' +
        '<span class="x-log" id="x-log">site log · one night, five installs · scroll</span></div>');
      clockT = $("#x-clock"); logT = $("#x-log");
    }
    cards.forEach(function (c, i) {
      if (INST[i]) c.insertAdjacentHTML("beforeend",
        '<span class="x-stamp">LIT ' + INST[i].t + "</span>");
    });
  })();

  function workHold() {
    for (var k = 0; k < blocks.length; k++)
      if (blocks[k].kind === "hold" && blocks[k].id === "work") return blocks[k];
    return null;
  }
  function updateSeq() {
    var want = activeId === "work" && !mob() && !reduced;
    var p = 0, hold = want ? workHold() : null;
    if (hold) p = clamp(((window.scrollY || 0) - hold.s0) / hold.px, 0, 1);
    if (want !== seqOn) {
      seqOn = want;
      var cw = $(".cards");
      if (cw) cw.classList.toggle("x-seq", seqOn);
      if (!seqOn) cards.forEach(function (c) {
        c.style.transform = ""; c.style.opacity = "";
        c.classList.remove("x-lit-on");
        var w = $(".imw", c); if (w) w.style.removeProperty("--slat");
        var bd = $(".bd", c); if (bd) bd.style.opacity = "";
      });
    }
    if (!seqOn) return;
    for (var i = 0; i < cards.length; i++) {
      var q = clamp((p - i * 0.165) / 0.24, 0, 1);
      var q1 = smooth(clamp(q / 0.45, 0, 1));
      var q2 = smooth(clamp((q - 0.34) / 0.46, 0, 1));
      var c = cards[i];
      c.style.opacity = (0.05 + 0.95 * q1).toFixed(3);
      c.style.transform = "translateY(" + ((1 - q1) * 54).toFixed(1) +
        "px) rotateX(" + ((1 - q1) * 7).toFixed(2) + "deg)";
      var w = $(".imw", c);
      if (w) w.style.setProperty("--slat", (12 * q2).toFixed(2) + "px");
      var bd = $(".bd", c);
      if (bd) bd.style.opacity = (0.15 + 0.85 * q2).toFixed(3);
      var lit = q > 0.82;
      if (lit !== c.classList.contains("x-lit-on")) {
        c.classList.toggle("x-lit-on", lit);
        if (lit) SND.tick();
      }
    }
    var mins = (22 * 60 + p * 8 * 60) % 1440;
    var hms = ("0" + Math.floor(mins / 60)).slice(-2) + ":" + ("0" + Math.floor(mins % 60)).slice(-2);
    if (clockT && clockT.textContent !== hms) clockT.textContent = hms;
    var lg = INST[clamp(Math.floor(p * 5), 0, 4)].log;
    if (logT && logT.textContent !== lg) logT.textContent = lg;
  }

  /* ── Replay Intro + Dance Celebration (triggered by Replay Intro button) ── */
  var replay = { on: false, raf: null, t0: 0, lastBeat: -1 };
  function findFrameIdx(part) {
    for (var i = 0; i < F.length; i++) {
      if (F[i].src.indexOf(part) >= 0) return i;
    }
    return 0;
  }
  var DANCE_MOVES = [
    findFrameIdx("x2a_step1"),
    findFrameIdx("x7a_reach"),
    findFrameIdx("x_jump_air"),
    findFrameIdx("x8_pull"),
    findFrameIdx("x2b_step2"),
    findFrameIdx("x_run_right"),
    findFrameIdx("x7a_reach"),
    findFrameIdx("x_jump_air"),
    findFrameIdx("x8_pull"),
    findFrameIdx("x9_wave")
  ];

  function stopReplay(finished) {
    if (!replay.on) return;
    replay.on = false;
    if (replay.raf) { cancelAnimationFrame(replay.raf); replay.raf = null; }
    window.__RJ_DANCE = null;
    if (window.__RJ_TICK) window.__RJ_TICK();
    var b = $("#x-replay");
    if (b) { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); }
    if (finished) {
      say("<b>Intro + Dance complete</b> · scroll down to explore", 2400);
    }
  }

  function startReplayIntro() {
    setCinema(false);
    if (MODE === "draw") setMode("shop", true);
    replay.on = true;
    replay.t0 = performance.now();
    replay.lastBeat = -1;
    var b = $("#x-replay");
    if (b) { b.classList.add("on"); b.setAttribute("aria-pressed", "true"); }
    SND.chime();
    say("<b>Replaying Intro</b> · Run · 360° Spin · Jump · Dance!", 2800);

    var introEndY = scrollAtTime(7.6);
    var stage1Ms = 4600;
    var stage2Ms = 3000;

    function step(now) {
      if (!replay.on) return;
      var elapsed = now - replay.t0;
      if (elapsed < stage1Ms) {
        var u = elapsed / stage1Ms;
        // gentle easing across Run -> Spin -> Jump+RedWaves -> Wave
        var ease = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        window.scrollTo(0, introEndY * ease);
        window.__RJ_DANCE = null;
        var beat1 = Math.floor(elapsed / 380);
        if (beat1 !== replay.lastBeat) { replay.lastBeat = beat1; SND.tick(); }
        replay.raf = requestAnimationFrame(step);
      } else if (elapsed < stage1Ms + stage2Ms) {
        window.scrollTo(0, introEndY);
        var dEl = elapsed - stage1Ms;
        var stepDur = 300;
        var moveIdx = Math.min(DANCE_MOVES.length - 1, Math.floor(dEl / stepDur));
        var beatFrac = (dEl % stepDur) / stepDur;
        var bounce = -Math.abs(Math.sin(beatFrac * Math.PI)) * (mob() ? 18 : 26);
        var sway = Math.sin((dEl / stepDur) * Math.PI) * 14;
        var tilt = Math.sin((dEl / stepDur) * Math.PI) * 5.2;
        window.__RJ_DANCE = {
          active: true,
          frameIdx: DANCE_MOVES[moveIdx],
          dy: bounce,
          dx: sway,
          rot: tilt,
          beatFrac: beatFrac
        };
        if (window.__RJ_TICK) window.__RJ_TICK();
        if (moveIdx !== replay.lastBeat) {
          replay.lastBeat = moveIdx;
          if (moveIdx % 2 === 0) SND.thud(); else SND.detent();
        }
        replay.raf = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, introEndY);
        stopReplay(true);
      }
    }
    replay.raf = requestAnimationFrame(step);
  }

  /* ── the reel: press P and the film plays itself, hands off ── */
  var cin = { on: false, y: 0, dwell: 0, hudT: 0 };
  function fmtT(t) {
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
  }
  function setCinema(on) {
    if (on === cin.on) return;
    cin.on = on; cin.dwell = 0;
    body.classList.toggle("x-cinema", on);
    var b = $("#x-play");
    if (b) { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); }
    if (on) {
      cin.y = window.scrollY || 0;
      coach.classList.remove("on"); clearTimeout(tipT);
      SND.chime();
      say("<b>Reel playing</b> · hands off · P or a scroll stops it", 2400);
    } else {
      luxT.textContent = LUX[MODE];
      lux.classList.toggle("on", !!LUX[MODE]);
      say("Reel stopped");
    }
  }
  function updateCinema(dt) {
    if (!cin.on) return;
    var y = cin.y, k, b = null;
    for (k = 0; k < blocks.length; k++)
      if (y >= blocks[k].s0 && y < blocks[k].s1) { b = blocks[k]; break; }
    if (!b) {
      setCinema(false);
      say("<b>End of reel</b> · 00:" + C.filmDuration + " · thanks for watching", 3200);
      return;
    }
    if (b.kind === "seg") {
      cin.y = y + 185 * (dt / 1000);
      if (cin.y > b.s1) cin.y = b.s1;
    } else {
      cin.dwell += dt;
      if (cin.dwell > 1400 + b.px * 1.9) { cin.dwell = 0; cin.y = b.s1; }
    }
    window.scrollTo(0, cin.y);
    if (performance.now() - cin.hudT > 240) {
      cin.hudT = performance.now();
      luxT.textContent = "\u25b6 " + fmtT(timeFromDisplay(cin.y)) + " / " +
        fmtT(C.filmDuration) + " \u00b7 reel \u00b7 P stops";
    }
  }
  ["wheel", "touchmove"].forEach(function (ev) {
    window.addEventListener(ev, function () {
      if (cin.on) setCinema(false);
      if (replay.on) stopReplay(false);
    }, { passive: true });
  });

  /* 11c · The Workshop: cinematic entry and shared service gallery. */
  var CASES = window.RJCases.cases;

  /* deck DOM, built once */
  var caseEl = el("div"); caseEl.id = "x-case";
  caseEl.setAttribute("role", "dialog"); caseEl.setAttribute("aria-modal", "true");
  caseEl.setAttribute("aria-labelledby", "xc-t");
  caseEl.inert = true;
  caseEl.innerHTML =
    '<span class="xc-focus-edge" id="xc-first-edge" tabindex="0"></span>' +
    '<div class="xc-top"><div class="xc-id"><b id="xc-k"></b><span id="xc-t"></span></div>' +
    '<div class="xc-switch">' +
      '<button type="button" class="xc-tab xc-intro-tab" id="xc-intro-btn" aria-expanded="false" aria-controls="xc-intro">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 2.6 13 8 5 13.4Z" fill="currentColor"/></svg>Intro Video</button>' +
      '<div class="xc-tabs" id="xc-tabs" role="group" aria-label="Switch service"></div></div>' +
    '<div class="xc-prog" id="xc-prog"></div>' +
    '<button type="button" class="xc-x" id="xc-x">Close ✕<kbd>esc</kbd></button></div>' +
    '<div class="xc-gallery" id="xc-gallery-scroll"><article class="rg-desktop" id="xc-gallery"></article></div>' +
    '<section class="xc-intro" id="xc-intro" aria-labelledby="xc-intro-title" hidden>' +
      '<div class="xc-intro-inner">' +
        '<div class="xc-intro-head"><div class="xc-intro-titles"><p class="xc-intro-kicker"><span id="xc-edition">Bharat edition</span> · <span data-intro-duration></span></p>' +
          '<h2 id="xc-intro-title">ArtViSiON Introduction</h2></div>' +
          '<div class="xc-intro-langs" role="group" aria-labelledby="xc-audio-label">' +
            '<span class="xc-intro-lang-label" id="xc-audio-label">Film language</span>' +
            '<div class="xc-intro-lang-buttons" data-intro-language-slot>' +
            '</div></div></div>' +
        '<div class="xc-intro-screen">' +
          '<video id="xc-intro-video" controls playsinline preload="none" tabindex="0" aria-label="ArtViSiON Introduction, Hindi edition">' +
            'This browser does not support inline video.</video>' +
          '<button type="button" id="xc-intro-start" hidden><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
            '<path d="M5 2.6 13 8 5 13.4Z" fill="currentColor"/></svg>Play video</button>' +
        '</div>' +
        '<p id="xc-intro-status" role="status" hidden></p>' +
        '<p class="xc-intro-note">Language changes both the picture and narration. Use fullscreen for a larger view.</p>' +
        '<div class="av-film-chapters" role="group" aria-label="Jump to a technical chapter" data-intro-chapter-slot></div>' +
      '</div></section>' +
    '<span class="xc-focus-edge" id="xc-last-edge" tabindex="0"></span>';
  body.appendChild(caseEl);

  var caseOpen = false, caseI = -1;
  var caseOpener = null, caseBackground = [];
  var introOpen = false;
  var watchIntro = $("#av-watch-intro"), introBtn = $("#xc-intro-btn", caseEl);
  var introPanel = $("#xc-intro", caseEl), introVideo = $("#xc-intro-video", caseEl);
  var introStart = $("#xc-intro-start", caseEl);
  var player = window.RJIntro.create({
    video: introVideo, start: introStart, status: $("#xc-intro-status", caseEl),
    edition: $("#xc-edition", caseEl), scope: caseEl
  });
  var xcTabs = $("#xc-tabs", caseEl), galleryScroll = $("#xc-gallery-scroll", caseEl);
  var gallery = window.RJGallery.create($("#xc-gallery",caseEl),{heading:'xc-workshop-title',nextCase:function (i) {openCase(i);}});
  xcTabs.innerHTML = CASES.map(function (c, idx) {
    return '<button type="button" class="xc-tab" aria-pressed="false" data-ci="' + idx + '">' + c.key + ' · ' + c.title + '</button>';
  }).join("");

  function openCaseShell(trigger) {
    if (caseOpen) return;
    caseOpen = true;
    caseOpener = trigger || document.activeElement;
    caseBackground = Array.prototype.filter.call(body.children, function (node) {
      return node !== caseEl && !node.hasAttribute("inert");
    });
    caseBackground.forEach(function (node) { node.setAttribute("inert", ""); });
    root.classList.add("x-noscroll");
    body.classList.add("x-cased");
    caseEl.inert = false;
    caseEl.classList.add("on");
  }
  // Wrap focus without intercepting Tab inside the browser's video controls.
  $("#xc-last-edge", caseEl).addEventListener("focus", function () { introBtn.focus(); });
  $("#xc-first-edge", caseEl).addEventListener("focus", function () {
    var beforeFilm = $(".av-prelude:not([hidden]) [data-av-skip]", caseEl);
    var jump = $(".av-film-chapters button:last-child", caseEl);
    var last = introOpen ? (beforeFilm || jump || (introStart.hidden ? introVideo : introStart)) : ($(".rg-end a",caseEl) || $("#xc-x",caseEl));
    last.focus({ preventScroll: true });
  });
  function introFullscreen() { return player.fullscreen(); }
  var introOffered = false;
  function showIntro(trigger, playNow) {
    var loader = $("#loader");
    if (loader && !loader.classList.contains("done")) return;
    var wasOpen = caseOpen;
    introOffered = true;
    stopReplay(false);
    if (cin.on) setCinema(false);
    openCaseShell(trigger || (document.activeElement === body ? watchIntro : document.activeElement));
    introOpen = true;
    caseEl.setAttribute("aria-labelledby","xc-t");
    SND.setQuiet(true);
    caseEl.classList.add("intro-on");
    introPanel.hidden = false;
    introBtn.setAttribute("aria-expanded", "true");
    introBtn.classList.add("on");
    $$(".xc-tab", xcTabs).forEach(function (tab) { tab.classList.remove("on"); tab.setAttribute("aria-pressed","false"); });
    $("#xc-k", caseEl).textContent = "AV";
    $("#xc-t", caseEl).textContent = "Intro Video";
    player.open(playNow);
    $(wasOpen ? "#xc-intro-btn" : "#xc-x", caseEl).focus({ preventScroll: true });
  }
  function hideIntro() {
    if (!introOpen) return;
    introOpen = false;
    player.close();
    introPanel.hidden = true;
    introBtn.setAttribute("aria-expanded", "false");
    introBtn.classList.remove("on");
    caseEl.classList.remove("intro-on");
    SND.setQuiet(false);
  }
  introBtn.addEventListener("click", function () { showIntro(introBtn, true); });
  if (watchIntro) {
    watchIntro.addEventListener("click", function () { showIntro(watchIntro, true); });
    watchIntro.hidden = false;
    function timedIntro() {
      if (introOffered || caseOpen || cin.on || replay.on || window.RJWorkshop.active()) return;
      if (document.hidden) {
        document.addEventListener("visibilitychange", timedIntro, { once: true });
        return;
      }
      var loader = $("#loader");
      if (loader && !loader.classList.contains("done")) { setTimeout(timedIntro, 100); return; }
      // 10 seconds from navigation, with sound gated behind a click.
      showIntro(null, false);
    }
    setTimeout(timedIntro, Math.max(0, 10000 - performance.now()));
  }

  function openCase(i, trigger, reveal) {
    var c = CASES[i]; if (!c) return;
    var board = introOpen && i === caseI ? gallery.index() : 0;
    hideIntro(); caseI = i; introOffered = true;
    caseEl.setAttribute("aria-labelledby","xc-workshop-title");
    $("#xc-k", caseEl).textContent = c.key;
    $("#xc-t", caseEl).textContent = "The Workshop";
    $("#xc-prog", caseEl).textContent = c.boards.length + " BOARDS";
    $$(".xc-tab",xcTabs).forEach(function (t,idx) {t.classList.toggle("on",i===idx); t.setAttribute("aria-pressed",String(i===idx));});
    if (cin.on) setCinema(false);
    caseEl.classList.toggle("rg-entry-cut",!!reveal);
    openCaseShell(trigger);
    gallery.load(i,board,reveal); galleryScroll.scrollTop = 0;
    SND.peel(); gallery.focus();
  }
  function enterCase(i,trigger) {
    if (caseOpen || window.RJWorkshop.active() || !CASES[i]) return;
    stopReplay(false);
    if (cin.on) setCinema(false);
    window.RJGallery.warm(i);
    window.RJWorkshop.play(CASES[i],trigger,function (reveal) {openCase(i,trigger,reveal);});
  }
  function closeCase() {
    if (!caseOpen) return;
    caseOpen = false;
    gallery.closeDetail();
    hideIntro();
    caseEl.inert = true;
    caseEl.classList.remove("on");
    root.classList.remove("x-noscroll");
    body.classList.remove("x-cased");
    caseBackground.forEach(function (node) { node.removeAttribute("inert"); });
    caseBackground = [];
    if (caseOpener && caseOpener.isConnected) caseOpener.focus({ preventScroll: true });
    caseOpener = null;
    SND.tick();
  }
  xcTabs.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var ci = +b.dataset.ci;
    if (introOpen || ci !== caseI) openCase(ci);
  });
  $("#xc-x", caseEl).addEventListener("click", closeCase);

  // The Work shortcut lands on the lit end of the hold. Manual scroll still scrubs the night install.
  $("#nav").addEventListener("click",function (e) {
    if (!e.target.closest('[data-go="work"]')) return;
    var hold = workHold(); if (!hold) return;
    e.preventDefault(); e.stopImmediatePropagation();
    stopReplay(false); if (cin.on) setCinema(false);
    window.scrollTo({top:hold.s0+.94*hold.px,behavior:reduced ? "auto" : "smooth"});
  },true);

  // Both the image and title/content of each pillar use the same entry route.
  cards.forEach(function (c,i) {
    c.dataset.workshopCase = String(i);
    var imw = $(".imw", c);
    if (imw) {
      imw.insertAdjacentHTML("beforeend", '<span class="xc-open">Enter gallery ↗</span>');
      imw.setAttribute("role","button"); imw.setAttribute("tabindex","0"); imw.setAttribute("aria-haspopup","dialog");
      imw.setAttribute("aria-label","Enter the " + CASES[i].title + " gallery");
      imw.addEventListener("keydown",function (e) {
        if (e.key === "Enter" || e.key === " ") {e.preventDefault(); if (!e.repeat) enterCase(i,imw);}
      });
      imw.addEventListener("focus",window.RJWorkshop.warm);
    }
    c.addEventListener("pointerenter",window.RJWorkshop.warm,{once:true,passive:true});
    c.addEventListener("click",function (e) {
      if (e.target.closest("a,button") || performance.now()-turn.release < 340) return;
      enterCase(i,imw);
    });
  });

  /* ════════════════════════ 12 · MAIN LOOP ══════════════════════ */
  var lastAct = "", lastT = 0, annoT = 0, parX = 0, parY = 0;
  function loop(ts) {
    var dt = lastT ? Math.min(70, ts - lastT) : 16.7;
    lastT = ts;
    // The desktop scroll film stays at its current frame behind full-screen overlays.
    if (caseOpen || window.RJWorkshop.active() || document.hidden) {
      requestAnimationFrame(loop);
      return;
    }
    updateVelocity(ts, dt);
    updateSeq();
    updateCinema(dt);

    var actId = readActive();
    if (actId !== lastAct) {
      lastAct = actId; activeId = actId;
      rollOdo(actId === "about");
      armCards(false);
      if (actId === "work") {
        window.RJWorkshop.warm();
        setTimeout(function () {if (lastAct === "work") armCards(true);},reduced ? 0 : 1050);
      }
      /* the panels are still flying in: re-measure the drawing as they land */
      buildAnno(true);
      [320, 760, 1250].forEach(function (d) {
        setTimeout(function () { if (lastAct === actId) buildAnno(true); }, d);
      });
      coach.classList.remove("on");
      clearTimeout(tipT);
      tipT = setTimeout(function () { showTip(actId); }, 1400);
    }
    if (MODE === "draw" && ts - annoT > 400) { annoT = ts; buildAnno(); }

    updateTurn(ts);

    /* cursor spring */
    if (FINE.matches) {
      ptr.cx = lerp(ptr.cx, ptr.x, 0.42);
      ptr.cy = lerp(ptr.cy, ptr.y, 0.42);
      cur.style.transform = "translate3d(" + ptr.cx.toFixed(1) + "px," + ptr.cy.toFixed(1) + "px,0)";
      cur.style.opacity = ptr.inside ? "" : "0";
      drawTool(ts);
    }

    /* parallax on the whole world */
    if (FINE.matches && !reduced) {
      var tx = (ptr.x / innerWidth - 0.5) * -13, ty = (ptr.y / innerHeight - 0.5) * -9;
      parX = lerp(parX, tx, 0.06); parY = lerp(parY, ty, 0.06);
      stage.style.transform = "translate3d(" + parX.toFixed(2) + "px," + parY.toFixed(2) + "px,0)";
    }

    /* keep the gate strip honest when the scrollbar is driving */
    if (!turn.active) markStrip(displayedIndex());

    requestAnimationFrame(loop);
  }

  /* ════════════════════════ 13 · BOOT ═══════════════════════════ */
  function relayout() {
    buildBlocks();
    sizeTool();
    buildGrid();
    buildAnno(true);
  }
  var rzT = null;
  window.addEventListener("resize", function () {
    clearTimeout(rzT);
    rzT = setTimeout(relayout, 140);
    annoKey = "";
  });

  /* wave-14: the about experience strip — twelve years, five
     disciplines, branded casing kept exactly as written */
  (function () {
    var Cf = window.CONFIG; if (!Cf || !Cf.aboutStripLead) return;
    var p = $("#aText"); if (!p || !p.parentNode) return;
    var d = el("div"); d.className = "x-strip";
    d.innerHTML = '<span class="x-strip-l">' + Cf.aboutStripLead + "</span>";
    p.parentNode.insertBefore(d, p.nextSibling);
  })();
  /* wave-13: the credit block, re-ordered — the promise first,
     the city beneath it; and the 🇮 becomes an inline SVG tricolour
     (emoji flags are box-glyphs on Windows / no-emoji-font boxes) */
  (function () {
    var st = $("#iStatus"); if (!st) return;
    var t = st.textContent, sep = t.indexOf(" · ");
    var city = sep > -1 ? t.slice(0, sep) : "";
    var status = sep > -1 ? t.slice(sep + 3) : t;
    city = city.replace("🇮🇳", "");
    var flag =
      '<svg class="x-flag" viewBox="0 0 22 15" role="img" aria-label="India">' +
      '<rect width="22" height="5" fill="#FF9933"/><rect y="5" width="22" height="5" fill="#FFFFFF"/>' +
      '<rect y="10" width="22" height="5" fill="#138808"/>' +
      '<circle cx="11" cy="7.5" r="2" fill="none" stroke="#000080" stroke-width=".6"/>' +
      '<circle cx="11" cy="7.5" r=".5" fill="#000080"/></svg>';
    st.textContent = "";
    st.insertAdjacentHTML("beforeend",
      '<span class="x-cred-line">' + status + "</span>" +
      '<span class="x-cred-line x-cred-city">' + city + flag + "</span>");
  })();
  /* wave-11: the status line leaves the role row and becomes a
     credit block beneath it — long copy must not fight the film */
  (function () {
    var st = $("#iStatus"), row = $(".rolerow");
    if (st && row && row.parentNode) {
      st.classList.add("x-cred");
      row.parentNode.insertBefore(st, row.nextSibling);
    }
  })();
  relayout();
  markStrip(0);
  luxT.textContent = LUX.shop;
  lux.classList.toggle("on", !!LUX.shop);

  /* restored preferences */
  var m0 = store.get("x-mode", "shop");
  if (m0 === "draw") setMode("draw", true);
  lux.classList.toggle("on", !!luxT.textContent);
  if (store.get("x-sound", "0") === "1") {
    /* browsers need a gesture; arm it on the first one */
    var arm = function () {
      if (!SND.isOn()) SND.toggle();
      var b = $("#x-snd"); if (b) { b.classList.add("on"); b.setAttribute("aria-pressed", "true"); }
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("touchstart", arm);
      window.removeEventListener("keydown", arm);
    };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("touchstart", arm, { passive: true });
    window.addEventListener("keydown", arm);
  }

  /* wait for the loader to clear, then start */
  (function waitBoot(n) {
    var ld = $("#loader");
    if (!ld || ld.classList.contains("done") || n > 90) {
      requestAnimationFrame(loop);
      setTimeout(function () {
        if (luxT.textContent) lux.classList.add("on");
        showTip("");
      }, 900);
      return;
    }
    setTimeout(function () { waitBoot(n + 1); }, 120);
  })(0);

  if (RM.addEventListener) RM.addEventListener("change", function (e) { reduced = e.matches; });
  window.addEventListener("blur", function () { if (SND.isOn()) SND.spin(0); });

  /* a small handle for debugging from the console */
  window.X = {
    setMode: setMode, sound: SND, anno: buildAnno, mode: function () { return MODE; },
    openCase: openCase, closeCase: closeCase,
    to: function (t) { window.scrollTo({ top: scrollAtTime(t), behavior: "smooth" }); }
  };
})();

/* ═════════ 26 · WAVE 15 — Execution sits with its siblings ═════════
   The fifth card leaves the landscape niche: same anatomy as A–D —
   photo over title / tech / line, nothing clamped or hidden — while
   keeping its watch above Designing from the header row. On phones
   it rides the snap-strip again as the fifth card. Content is the
   user's supplied copy only (config.js `projects`), nothing added.  */
(function () {
  var cardsBox = document.getElementById("wCards");
  var inner = document.querySelector("#s-work .inner");
  var whead = document.querySelector("#s-work .whead");
  if (!cardsBox || !inner || !whead) return;
  var E = cardsBox.children[4];
  if (!E) return;
  E.classList.add("x-e");
  var mq = window.matchMedia("(min-width: 761px)");
  function place() {
    if (mq.matches) {
      if (E.parentNode !== inner) whead.parentNode.insertBefore(E, whead.nextSibling);
    } else if (E.parentNode !== cardsBox) cardsBox.appendChild(E);
  }
  if (mq.addEventListener) mq.addEventListener("change", place);
  else if (mq.addListener) mq.addListener(place);
  place();
  /* the night-install scrub already orders the reveal — no extra delay */
})();

/* ═════════ 28 · FINAL PASS — PICTOGRAM SYSTEM (user's icon sheet) ═════════
   24×24 grid, 1.5 u stroke, one red per glyph — the user's own vector
   set, inlined as a sprite and set across the site like a vector
   artist's portfolio: service titles, section eyebrows, dock keys,
   skill chips and the résumé button. Stroke rides currentColor.   */
(function () {
  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    "<symbol id=\"pi-advertising\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"5\" width=\"20\" height=\"11\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"7\" y1=\"16\" x2=\"7\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"17\" y1=\"16\" x2=\"17\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"1.5\"/><circle cx=\"19\" cy=\"7.5\" r=\"1.5\" fill=\"#E30613\"/></symbol><symbol id=\"pi-branding\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"2\" width=\"9\" height=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"13\" y=\"2\" width=\"9\" height=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"2\" y=\"13\" width=\"9\" height=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"13\" y=\"13\" width=\"9\" height=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><circle cx=\"6.5\" cy=\"6.5\" r=\"2.0\" fill=\"#E30613\"/></symbol><symbol id=\"pi-creative\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\" stroke=\"currentColor\" stroke-width=\"0.75\"/><polygon points=\"12,7 16,12 12,17 8,12\" fill=\"#E30613\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-designing\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"2\" y1=\"21\" x2=\"22\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"2\" y1=\"19.5\" x2=\"2\" y2=\"22.5\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"22\" y1=\"19.5\" x2=\"22\" y2=\"22.5\" stroke=\"currentColor\" stroke-width=\"0.75\"/><circle cx=\"12\" cy=\"12\" r=\"1.6\" fill=\"#E30613\"/></symbol><symbol id=\"pi-execution\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><line x1=\"3\" y1=\"21\" x2=\"21\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"6\" y1=\"21\" x2=\"6\" y2=\"6\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"6\" y1=\"6\" x2=\"19\" y2=\"6\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"19\" y1=\"6\" x2=\"19\" y2=\"11\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"16\" y=\"11\" width=\"6\" height=\"5\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-brief\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"8\" y1=\"8\" x2=\"16\" y2=\"8\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"8\" y1=\"12\" x2=\"16\" y2=\"12\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"8\" y1=\"16\" x2=\"13\" y2=\"16\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-concept\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"3\" y1=\"9\" x2=\"21\" y2=\"9\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"9\" y1=\"9\" x2=\"9\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"0.75\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\" fill=\"#E30613\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-grid\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"8.67\" y1=\"2\" x2=\"8.67\" y2=\"22\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"15.33\" y1=\"2\" x2=\"15.33\" y2=\"22\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"2\" y1=\"8.67\" x2=\"22\" y2=\"8.67\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"2\" y1=\"15.33\" x2=\"22\" y2=\"15.33\" stroke=\"currentColor\" stroke-width=\"0.75\"/><rect x=\"8.67\" y=\"8.67\" width=\"6.66\" height=\"6.66\" fill=\"#E30613\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-card\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"6\" y1=\"11\" x2=\"12\" y2=\"11\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"6\" y1=\"14\" x2=\"10\" y2=\"14\" stroke=\"currentColor\" stroke-width=\"0.75\"/><circle cx=\"17\" cy=\"12\" r=\"2.4\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-dispatch\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"8\" width=\"12\" height=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><polyline points=\"14,11 19,11 22,14 22,17 14,17\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linejoin=\"miter\"/><circle cx=\"7\" cy=\"19\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"0.75\"/><circle cx=\"18\" cy=\"19\" r=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"0.75\"/><circle cx=\"4.5\" cy=\"11\" r=\"1.2\" fill=\"#E30613\"/></symbol><symbol id=\"pi-kiosk\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><polyline points=\"3,9 12,3 21,9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linejoin=\"miter\"/><rect x=\"5\" y=\"9\" width=\"14\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"9\" y=\"13\" width=\"6\" height=\"8\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"0.75\"/><line x1=\"2\" y1=\"21\" x2=\"22\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"0.75\"/></symbol><symbol id=\"pi-drawing\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"4\" y=\"7\" width=\"16\" height=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"4\" y1=\"3.5\" x2=\"20\" y2=\"3.5\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"4\" y1=\"2\" x2=\"4\" y2=\"5\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"20\" y1=\"2\" x2=\"20\" y2=\"5\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"2\" y1=\"21\" x2=\"22\" y2=\"21\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-clock\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"12\" y1=\"7\" x2=\"12\" y2=\"12\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"12\" y1=\"12\" x2=\"16\" y2=\"14\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-neon\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><path d=\"M3 16 C 6 6, 11 6, 12 12 C 13 18, 18 18, 21 8\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"2.2\"/><line x1=\"3\" y1=\"20\" x2=\"21\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"0.75\"/></symbol><symbol id=\"pi-daynight\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><circle cx=\"8\" cy=\"12\" r=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"8\" y1=\"3\" x2=\"8\" y2=\"5.5\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"8\" y1=\"18.5\" x2=\"8\" y2=\"21\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"1.5\" y1=\"12\" x2=\"3.5\" y2=\"12\" stroke=\"currentColor\" stroke-width=\"0.75\"/><path d=\"M20 7 a 6 6 0 1 0 0 10 a 7.4 7.4 0 0 1 0 -10 z\" fill=\"#E30613\"/></symbol><symbol id=\"pi-cutfile\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><polyline points=\"3,18 9,8 15,14 21,5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linejoin=\"miter\"/><rect x=\"1.6\" y=\"16.6\" width=\"2.8\" height=\"2.8\" fill=\"#E30613\" stroke=\"#E30613\" stroke-width=\"0.75\"/><rect x=\"7.6\" y=\"6.6\" width=\"2.8\" height=\"2.8\" fill=\"#E30613\" stroke=\"#E30613\" stroke-width=\"0.75\"/><rect x=\"13.6\" y=\"12.6\" width=\"2.8\" height=\"2.8\" fill=\"#E30613\" stroke=\"#E30613\" stroke-width=\"0.75\"/><rect x=\"19.6\" y=\"3.6\" width=\"2.8\" height=\"2.8\" fill=\"#E30613\" stroke=\"#E30613\" stroke-width=\"0.75\"/></symbol><symbol id=\"pi-colour\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"7\" width=\"9\" height=\"10\" fill=\"currentColor\" fill-opacity=\".16\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"13\" y=\"7\" width=\"9\" height=\"10\" fill=\"#E30613\" stroke=\"#E30613\" stroke-width=\"1.5\"/><line x1=\"2\" y1=\"20\" x2=\"22\" y2=\"20\" stroke=\"currentColor\" stroke-width=\"0.75\"/></symbol><symbol id=\"pi-acp\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"7\" width=\"20\" height=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"2\" y=\"9\" width=\"20\" height=\"6\" fill=\"currentColor\" fill-opacity=\".16\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"2\" y=\"15\" width=\"20\" height=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"2\" y1=\"20\" x2=\"22\" y2=\"20\" stroke=\"#E30613\" stroke-width=\"0.75\"/><line x1=\"2\" y1=\"18.6\" x2=\"2\" y2=\"21.4\" stroke=\"#E30613\" stroke-width=\"0.75\"/><line x1=\"22\" y1=\"18.6\" x2=\"22\" y2=\"21.4\" stroke=\"#E30613\" stroke-width=\"0.75\"/></symbol><symbol id=\"pi-cnc\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"9\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"9.5\" y=\"9\" width=\"5\" height=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><polygon points=\"9.5,14 14.5,14 12,18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"3\" y1=\"21\" x2=\"21\" y2=\"21\" stroke=\"#E30613\" stroke-width=\"1.5\"/></symbol><symbol id=\"pi-steel\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"4\" y1=\"4\" x2=\"8\" y2=\"8\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"20\" y1=\"4\" x2=\"16\" y2=\"8\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"4\" y1=\"20\" x2=\"8\" y2=\"16\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"20\" y1=\"20\" x2=\"16\" y2=\"16\" stroke=\"currentColor\" stroke-width=\"0.75\"/></symbol><symbol id=\"pi-flex\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><circle cx=\"5.5\" cy=\"7.5\" r=\"1\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"0.75\"/><circle cx=\"18.5\" cy=\"7.5\" r=\"1\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"0.75\"/><circle cx=\"5.5\" cy=\"16.5\" r=\"1\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"0.75\"/><circle cx=\"18.5\" cy=\"16.5\" r=\"1\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"0.75\"/><line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\" stroke=\"currentColor\" stroke-width=\"0.75\"/></symbol><symbol id=\"pi-recce\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><rect x=\"2\" y=\"9\" width=\"20\" height=\"6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"7\" y1=\"9\" x2=\"7\" y2=\"12\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\" stroke=\"currentColor\" stroke-width=\"0.75\"/><line x1=\"17\" y1=\"9\" x2=\"17\" y2=\"12\" stroke=\"currentColor\" stroke-width=\"0.75\"/><circle cx=\"12\" cy=\"19\" r=\"1.8\" fill=\"#E30613\"/></symbol><symbol id=\"pi-qc\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><polyline points=\"7.5,12 11,15.5 17,8.5\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"2.0\" stroke-linejoin=\"miter\"/></symbol><symbol id=\"pi-vinyl\" viewBox=\"0 0 24 24\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\"><circle cx=\"8\" cy=\"12\" r=\"6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"8\" y1=\"6\" x2=\"20\" y2=\"6\" stroke=\"currentColor\" stroke-width=\"1.5\"/><line x1=\"8\" y1=\"18\" x2=\"20\" y2=\"18\" stroke=\"currentColor\" stroke-width=\"1.5\"/><circle cx=\"8\" cy=\"12\" r=\"1.6\" fill=\"none\" stroke=\"#E30613\" stroke-width=\"1.5\"/><line x1=\"20\" y1=\"6\" x2=\"20\" y2=\"18\" stroke=\"currentColor\" stroke-width=\"0.75\"/></symbol>" + '</svg>';
  document.body.insertAdjacentHTML("afterbegin", sprite);
  var use = function (id) { return '<svg class="pi" aria-hidden="true"><use href="#pi-' + id + '"/></svg>'; };
  var SS = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };
  var q1 = function (sel) { return document.querySelector(sel); };
  var MAP = {"cards": {"Advertising": "advertising", "Branding": "branding", "Creative": "creative", "Designing": "designing", "Execution": "execution"}, "eyebrows": {"s-about": "brief", "s-work": "concept", "s-skills": "grid", "s-resume": "card", "s-contact": "dispatch"}, "dock": {"shop": "kiosk", "draw": "drawing", "replay": "neon", "snd": "neon", "play": "daynight"}, "chips": {"CorelDRAW": "cutfile", "Illustrator": "concept", "Photoshop": "colour", "Affinity": "grid", "Canva": "colour", "Microsoft Office": "brief", "GitHub": "cutfile", "Wix": "grid", "Printing Machine": "vinyl", "Product and Packaging": "card", "ACP Fabrication": "acp", "CNC Routing": "cnc", "Signage Engineering": "steel", "Brand Identity": "branding", "Retail Rollout": "flex", "Site Recce": "recce", "Quality Control": "qc", "Vinyl & Large Format": "vinyl"}};
  SS("#s-work .card .t").forEach(function (t) {
    var k = MAP.cards[t.textContent.trim()];
    if (k) t.insertAdjacentHTML("afterbegin", use(k));
  });
  Object.keys(MAP.eyebrows).forEach(function (sec) {
    var e = document.querySelector("#" + sec + " .eyebrow");
    if (e) e.insertAdjacentHTML("afterbegin", use(MAP.eyebrows[sec]));
  });
  SS("#x-dock button").forEach(function (b) {
    var k = b.id === "x-snd" ? MAP.dock.snd : b.id === "x-play" ? MAP.dock.play : b.id === "x-replay" ? MAP.dock.replay : MAP.dock[b.getAttribute("data-mode")];
    var dot = b.querySelector("i");
    if (k && dot) dot.insertAdjacentHTML("afterend", use(k));
  });
  SS("#s-skills .chip").forEach(function (c) {
    var k = MAP.chips[c.textContent.trim()];
    if (k) c.insertAdjacentHTML("afterbegin", use(k));
  });
  var dl = q1("#rDl");
  if (dl) dl.insertAdjacentHTML("afterbegin", use("card"));
})();

/* ═════════ 29 · SMOOTH-SCRUB GUARD ═════════
   Turntable frames are WebP (fast decode) — and we still warm every
   frame during idle time so the first scrub never pays a decode:
   chunked img.decode() off the critical path, silence failures.   */
(function () {
  var ims = Array.prototype.slice.call(document.querySelectorAll("#film .fr, #film img"));
  var i = 0;
  function step(deadline) {
    while (i < ims.length && (!deadline || deadline.timeRemaining() > 6)) {
      (function (im) {
        im.decoding = "async";
        if (im.decode) im.decode().catch(function () {});
      })(ims[i++]);
    }
    if (i < ims.length) schedule();
  }
  function schedule() {
    if (window.requestIdleCallback) requestIdleCallback(step, { timeout: 1500 });
    else setTimeout(function () { step(null); }, 240);
  }
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule);
})();

/* ═════════ 29b · ONE MASK, NOT FORTY-SIX ═════════
   The edge-fade mask used to raster per frame-layer; now a single
   gate div carries it and the frames sit plain inside — same look,
   one masked layer for the compositor instead of 46.             */
(function () {
  var film = document.getElementById("film");
  if (!film || film.querySelector(".x-gate")) return;
  var gate = document.createElement("div");
  gate.className = "x-gate";
  while (film.firstChild) gate.appendChild(film.firstChild);
  film.appendChild(gate);
})();



/* ═════════ 31 · CAPABILITY CHIPS — NEW TOOL GLYPHS (user's list) ═════════
   The 03 — Capability row gained six user-named tools: Affinity, Canva,
   Microsoft Office, GitHub, Wix and Printing Machine. Each gets a glyph
   drawn in the same house style as block 28 — 24×24 grid, 1.5 u stroke,
   butt caps, mitre joins, exactly one #E30613 accent per mark — and is
   set into its chip exactly like the original pictogram set.          */
(function () {
  var S = function (id, inner) {
    return '<symbol id="pi2-' + id + '" viewBox="0 0 24 24" stroke-linecap="butt" stroke-linejoin="miter">' + inner + '</symbol>';
  };
  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    S("affinity", '<path d="M12 3 L20.5 19.5 L3.5 19.5 Z" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="3" x2="12" y2="10" stroke="currentColor" stroke-width="0.75"/><circle cx="12" cy="14" r="2.6" fill="none" stroke="#E30613" stroke-width="1.5"/>') +
    S("canva", '<path d="M17.8 7.2 A 7.6 7.6 0 1 0 17.8 16.8" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="12" x2="16.5" y2="12" stroke="currentColor" stroke-width="0.75"/><circle cx="19.6" cy="12" r="1.7" fill="#E30613"/>') +
    S("office", '<rect x="3" y="4" width="12" height="16" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="7" width="6" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="6" y="8" width="4.5" height="4.5" fill="#E30613"/><line x1="6" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="0.75"/>') +
    S("github", '<circle cx="7" cy="5.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="18.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17" cy="7.5" r="2.2" fill="none" stroke="#E30613" stroke-width="1.5"/><line x1="7" y1="7.7" x2="7" y2="16.3" stroke="currentColor" stroke-width="1.5"/><path d="M17 9.7 C17 14 7 12.5 7 16.3" fill="none" stroke="currentColor" stroke-width="1.5"/>') +
    S("wix", '<rect x="3" y="4" width="18" height="16" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" stroke-width="0.75"/><polyline points="7,11.5 9.5,16.5 12,11.5 14.5,16.5 17,11.5" fill="none" stroke="#E30613" stroke-width="1.5"/>') +
    S("press", '<rect x="4" y="3" width="16" height="7" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="14" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="14" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="10" y1="14" x2="14" y2="14" stroke="currentColor" stroke-width="0.75"/><rect x="7" y="17.5" width="10" height="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="6.5" r="1.4" fill="#E30613"/>') +
    S("pack", '<path d="M4 8 L7 4 L17 4 L20 8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="4" y="8" width="16" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="0.75"/><line x1="12" y1="8" x2="12" y2="20" stroke="#E30613" stroke-width="1.5"/>') +
    '</svg>';
  document.body.insertAdjacentHTML("afterbegin", sprite);
  var use = function (id) { return '<svg class="pi" aria-hidden="true"><use href="#pi2-' + id + '"/></svg>'; };
  var M = { "Affinity": "affinity", "Canva": "canva", "Microsoft Office": "office",
            "GitHub": "github", "Wix": "wix", "Printing Machine": "press",
            "Product and Packaging": "pack" };
  Array.prototype.slice.call(document.querySelectorAll("#s-skills .chip")).forEach(function (c) {
    var k = M[c.textContent.trim()];
    if (k && !c.querySelector(".pi")) c.insertAdjacentHTML("afterbegin", use(k));
  });
})();
