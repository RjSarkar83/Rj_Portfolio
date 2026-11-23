/* ============================================================
   rj-mobile-hero.js  ·  v1
   Mobile-only behaviour layer for Rj_Portfolio.
   - never runs on the desktop layout (data-rj-layout guard)
   - never blocks boot: everything is deferred + rAF driven
   - re-arms itself whenever mobile.js swaps pages (route aware)
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  if (root.dataset.rjLayout !== 'mobile') return;

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var buzz = function (ms) { if (navigator.vibrate && !reduce) { try { navigator.vibrate(ms); } catch (e) {} } };
  var FRAMES = 'media/frames/';
  var CUT = FRAMES;   /* site-log strip reuses the mobile frame cuts */

  /* ---------------------------------------------------------
     1 · scroll progress hairline
     --------------------------------------------------------- */
  var bar = document.createElement('div');
  bar.className = 'rjh-progress';
  bar.innerHTML = '<i></i>';
  document.body.appendChild(bar);
  var barFill = $('i', bar);

  function paintProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.pageYOffset / max)) : 0;
    barFill.style.width = (p * 100).toFixed(2) + '%';
    root.classList.toggle('rjh-scrolled', p > 0.015);
  }

  /* ---------------------------------------------------------
     2 · hero atmosphere + character rig
     --------------------------------------------------------- */
  var rig = null;

  function buildHero() {
    var hero = $('.m-hero'), stage = $('#m-char-stage'), img = $('#m-char-img');
    if (!hero || !stage || !img || stage.dataset.rjh === 'on') return;
    stage.dataset.rjh = 'on';

    /* atmosphere behind the display type */
    var aura = document.createElement('div'); aura.className = 'rjh-aura';
    var grid = document.createElement('div'); grid.className = 'rjh-grid';
    var spot = document.createElement('div'); spot.className = 'rjh-spot';
    hero.insertBefore(spot, hero.firstChild);
    hero.insertBefore(grid, hero.firstChild);
    hero.insertBefore(aura, hero.firstChild);

    hero.addEventListener('pointerdown', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--rjh-sx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--rjh-sy', ((e.clientY - r.top) / r.height * 100) + '%');
      spot.classList.add('on');
    });
    hero.addEventListener('pointerleave', function () { spot.classList.remove('on'); });

    /* card decoration */
    var wash = document.createElement('div'); wash.className = 'rjh-wash';
    stage.appendChild(wash);

    stage.insertAdjacentHTML('beforeend',
      '<svg class="rjh-bracket" viewBox="0 0 340 452" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
        '<g stroke="currentColor" stroke-width="1" stroke-dasharray="3 5" opacity=".55">' +
          '<circle cx="170" cy="196" r="118"/><circle cx="170" cy="196" r="80"/>' +
        '</g>' +
        '<g stroke="#ff646c" stroke-width="1" opacity=".6"><path d="M18 196h304" stroke-dasharray="2 6"/></g>' +
        '<g stroke="currentColor" stroke-width="1" opacity=".5">' +
          '<path d="M18 186v20M322 186v20M170 70v-8M170 322v8"/>' +
        '</g>' +
      '</svg>' +
      '<span class="rjh-spec rjh-spec--l">Fig. 01 — myself<b>Sheet A-101 · Rev C</b></span>' +
      '<span class="rjh-spec rjh-spec--r">41 keyframes<b>Rendered live</b></span>' +
      '<img class="rjh-pose" id="rjh-pose" alt="" aria-hidden="true" />' +
      '<div class="rjh-bubble" id="rjh-bubble" role="status" aria-live="polite"></div>');

    var pose = $('#rjh-pose', stage);
    var bubble = $('#rjh-bubble', stage);

    var sayTimer;
    function say(text, ms) {
      bubble.textContent = text;
      bubble.classList.add('show');
      clearTimeout(sayTimer);
      sayTimer = setTimeout(function () { bubble.classList.remove('show'); }, ms || 1600);
    }

    /* ---- pose machine -------------------------------------- */
    var busy = false, poseTimer;

    function showPose(src, hold) {
      pose.src = src;
      pose.classList.add('show');
      img.style.opacity = '0';
      clearTimeout(poseTimer);
      poseTimer = setTimeout(function () {
        pose.classList.remove('show');
        img.style.opacity = '';
      }, hold);
    }

    function wave() {
      if (busy) return;
      busy = true;
      buzz(10);
      showPose(FRAMES + 'x9_wave_m.webp', 2100);
      var lines = ['Hi 👋', 'Yes — I do site visits.', 'Tell me the city + deadline.'];
      say(lines[Math.floor(Math.random() * lines.length)], 1900);
      setTimeout(function () { busy = false; }, 2200);
    }

    function jump() {
      if (busy) return;
      busy = true;
      buzz([14, 26, 14]);
      showPose(FRAMES + 'x_jump_crouch_m.webp', 260);
      setTimeout(function () { showPose(FRAMES + 'x_jump_air_m.webp', 620); }, 250);
      setTimeout(function () { say('That was the 3 a.m. install energy 😄', 1700); }, 700);
      setTimeout(function () { busy = false; }, 1500);
    }

    /* tap = wave · long-press = jump · replay the loop on double tap */
    var pressTimer;
    stage.addEventListener('pointerdown', function () {
      pressTimer = setTimeout(jump, 420);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      stage.addEventListener(ev, function () { clearTimeout(pressTimer); });
    });
    stage.addEventListener('click', function (e) {
      e.preventDefault();
      if (!busy) wave();
    });
    stage.addEventListener('dblclick', function () {
      var first = $('#m-char-img');
      if (first) { first.dispatchEvent(new Event('rjh-replay')); say('Replaying the turn ↻', 1400); }
    });

    /* scroll: the card drifts + shrinks a touch as it leaves */
    rig = { stage: stage, img: img, pose: pose };
  }

  /* ---------------------------------------------------------
     3 · hero spec row
     --------------------------------------------------------- */
  function buildMetrics() {
    var char = $('.m-character');
    if (!char || $('.rjh-metrics')) return;
    var row = document.createElement('div');
    row.className = 'rjh-metrics rjh-reveal';
    row.innerHTML =
      '<div class="rjh-metric"><b>12</b><span>Years</span></div>' +
      '<div class="rjh-metric"><b>10k+</b><span>Signage</span></div>' +
      '<div class="rjh-metric"><b>150+</b><span>Identities</span></div>' +
      '<div class="rjh-metric"><b>15</b><span>Sectors</span></div>';
    char.parentNode.insertBefore(row, char.nextElementSibling);
  }

  /* ---------------------------------------------------------
     4 · site-log walking strip
     --------------------------------------------------------- */
  var walker = null;
  function buildStrip() {
    var metrics = $('.rjh-metrics');
    if (!metrics || $('.rjh-strip')) return;

    var log = ['21:40 · site recce', '22:00 · fascia lifted', '22:40 · lit + tested',
               '23:55 · snag list clear', '01:20 · handover', '03:05 · van loaded'];
    var items = log.concat(log).map(function (t) { return '<span>' + t + '</span>'; }).join('');

    var strip = document.createElement('div');
    strip.className = 'rjh-strip';
    strip.setAttribute('aria-hidden', 'true');
    strip.innerHTML =
      '<div class="rjh-strip__log"><div class="rjh-strip__track">' + items + '</div></div>' +
      '<div class="rjh-strip__note">Site log</div>' +
      '<div class="rjh-strip__ticks"></div>' +
      '<div class="rjh-strip__floor"></div>' +
      '<div class="rjh-strip__walker" id="rjh-walker">' +
        '<img class="on" src="' + CUT + 'x2_front_m.webp" alt="">' +
        '<img src="' + CUT + 'x2a_step1_m.webp" alt="">' +
        '<img src="' + CUT + 'x7_walk_m.webp" alt="">' +
        '<img src="' + CUT + 'x3_steps_m.webp" alt="">' +
      '</div>';
    metrics.parentNode.insertBefore(strip, metrics.nextElementSibling);

    walker = { el: $('#rjh-walker'), imgs: $$('#rjh-walker img'), x: -92, f: 0, t: 0, running: false };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { walker.running = e.isIntersecting; });
      }, { threshold: 0.06 }).observe(strip);
    } else {
      walker.running = true;
    }
  }

  /* one rAF loop for everything that moves */
  var lastY = 0;
  function loop() {
    if (walker && walker.running && !document.hidden) {
      var w = walker.el.parentNode.clientWidth;
      walker.x += 0.85;
      if (walker.x > w) walker.x = -92;
      walker.t++;
      if (walker.t % 7 === 0) {
        walker.imgs[walker.f].classList.remove('on');
        walker.f = (walker.f + 1) % walker.imgs.length;
        walker.imgs[walker.f].classList.add('on');
      }
      walker.el.style.transform = 'translateX(' + walker.x.toFixed(1) + 'px)';
    }
    requestAnimationFrame(loop);
  }

  /* ---------------------------------------------------------
     5 · reveal + parallax
     --------------------------------------------------------- */
  var io = null;
  function armReveals() {
    if (!('IntersectionObserver' in window)) {
      $$('.rjh-reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
    $$('.rjh-reveal').forEach(function (el) { io.observe(el); });
  }

  function parallax() {
    if (!rig || reduce) return;
    var r = rig.stage.getBoundingClientRect();
    var seen = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / (window.innerHeight * 0.6)));
    rig.stage.style.transform = 'translateY(' + (-seen * 10).toFixed(1) + 'px) scale(' + (1 - seen * 0.045).toFixed(3) + ')';
  }

  /* ---------------------------------------------------------
     6 · tab bar: dot marker + tap feedback + hide on scroll down
     --------------------------------------------------------- */
  function dressTabs() {
    $$('#m-tabbar a').forEach(function (a) {
      if (!$('.rjh-dot', a)) {
        var d = document.createElement('span');
        d.className = 'rjh-dot';
        a.appendChild(d);
      }
      if (a.dataset.rjhTap) return;
      a.dataset.rjhTap = 'on';
      a.addEventListener('pointerdown', function () {
        a.classList.add('rjh-tap');
        setTimeout(function () { a.classList.remove('rjh-tap'); }, 180);
        buzz(6);
      });
    });
  }

  /* ---------------------------------------------------------
     7 · film cover: label the still with a live frame
     --------------------------------------------------------- */
  function dressCover() {
    var cover = $('.m-cover');
    if (!cover || cover.dataset.rjh === 'on') return;
    cover.dataset.rjh = 'on';
  }

  /* ---------------------------------------------------------
     8 · footer signature
     --------------------------------------------------------- */
  function dressFooter() {
    var foot = $('.m-footer');
    if (!foot || $('.rjh-sig')) return;
    var sig = document.createElement('div');
    sig.className = 'rjh-sig';
    sig.innerHTML = '<span>Ranjan Sarkar · <b>ArtViSiON</b></span><span>Sheet A-101 · Rev C</span>';
    foot.parentNode.insertBefore(sig, foot.nextElementSibling);
  }

  /* ---------------------------------------------------------
     9 · page-aware re-arm (mobile.js swaps sections, we follow)
     --------------------------------------------------------- */
  function onRoute() {
    var home = $('[data-m-page="home"]');
    var visible = home && !home.hidden;
    if (visible) {
      buildHero();
      buildMetrics();
      buildStrip();
      dressCover();
    }
    dressTabs();
    dressFooter();
    $$('.m-section-head, .m-cards > *, .m-featured, #m-featured > *, .m-info, .m-contact-card, .m-page-lead')
      .forEach(function (el, i) {
        if (!el.classList.contains('rjh-reveal') && !el.closest('.m-hero')) {
          el.classList.add('rjh-reveal');
          el.style.transitionDelay = Math.min(i, 6) * 40 + 'ms';
        }
      });
    armReveals();
  }

  var scheduled = false;
  function scheduleRoute() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () { scheduled = false; onRoute(); });
  }

  /* ---------------------------------------------------------
     10 · boot
     --------------------------------------------------------- */
  var lastScroll = 0, ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      paintProgress();
      parallax();
      var y = window.pageYOffset;
      lastScroll = y;   /* the tab bar now stays put and follows the scroll instead */
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', function () { paintProgress(); }, { passive: true });

  /* watch for mobile.js re-rendering the page shell */
  var mo = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].addedNodes.length || muts[i].attributeName === 'hidden') { scheduleRoute(); return; }
    }
  });

  function start() {
    paintProgress();
    onRoute();
    var main = $('#m-main');
    if (main) mo.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    if (!reduce) requestAnimationFrame(loop);

    /* the flipbook loop in mobile.js restarts on tap; give it the replay hook */
    var img = $('#m-char-img');
    if (img) img.addEventListener('rjh-replay', function () { img.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  /* hand-rolled safety: if mobile.js lands late, re-check once */
  setTimeout(function () { scheduleRoute(); }, 1200);
})();
