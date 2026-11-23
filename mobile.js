/* Rj Portfolio · mobile navigation, process boards, and film sheet. */
(function () {
  'use strict';
  var C = window.CONFIG, library = window.RJCases;
  var q = function (s,r) { return (r || document).querySelector(s); };
  var qs = function (s,r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (!C || !library || !window.RJIntro || !window.RJGallery || !window.RJWorkshop) { q('#rj-boot-error').hidden = false; return; }
  var pages = qs('[data-m-page]'), tabs = qs('[data-m-tab]'), cases = library.cases;
  var H = document.documentElement, main = q('#m-main');
  var route = null, caseIndex = -1, savedScroll = Object.create(null), savedBoard = Object.create(null);
  var workReady = false, featuredReady = false;
  var gallery = window.RJGallery.create(q('#m-workshop-gallery'),{heading:'m-case-title'});
  var film = q('#m-film'), closeButton = q('.m-film-x'), nativeDialog = typeof film.showModal === 'function';
  var player = window.RJIntro.create({ video: q('#m-film-video'), start: q('#m-film-play'), status: q('#m-film-status'),
    edition: q('#m-film-edition'), scope: film });
  var filmOpen = false, offered = false, opener = null, filmScroll = 0, scrollUntil = 0;
  var fallbackBackground = [];
  function icon(n) { return '<svg aria-hidden="true" focusable="false"><use href="#mi-' + n + '"/></svg>'; }
  function text(s) { return String(s == null ? '' : s).replace(/[&<>"']/g,function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function validKey(s) {
    var k = (s || '').replace(/^#/,'').toLowerCase();
    return /^(home|work|about|contact|work\/[a-e])$/.test(k) ? k : 'home';
  }
  function isCase(k) { return k.indexOf('work/') === 0; }
  function caseKey(i) { return 'work/' + cases[i].key.toLowerCase(); }
  function tapFilm(label) {
    return '<button type="button" class="m-text-link m-film-link" aria-controls="m-film" aria-haspopup="dialog" data-m-intro>'+icon('play')+text(label)+'</button>';
  }
  function projectCard(p,i) {
    return '<a class="m-card" data-workshop-case="'+i+'" href="#'+caseKey(i)+'" aria-label="Enter the '+text(p.title)+' gallery: '+text(p.tech)+'">' +
      '<span class="m-card-image av-service-frame">'+window.RJServicePlates.draw(p.key)+'<span class="m-card-key" aria-hidden="true">'+text(p.key)+'</span></span>' +
      '<span class="m-card-copy"><span class="m-card-head"><span><strong>'+text(p.title)+'</strong><span class="m-card-tech">'+text(p.tech)+'</span></span><span class="m-card-arrow">'+icon('right')+'</span></span><span class="m-card-line">'+text(p.line)+'</span></span></a>';
  }
  function renderContactAndAbout() {
    q('#m-about-strap').textContent = C.aboutTitle;
    q('#m-about-bio').textContent = C.aboutText;
    q('#m-resume').href = C.resume;
    q('#m-stats').innerHTML = C.stats.map(function (s) { return '<div><strong>'+text(s.n)+'</strong><span>'+text(s.l)+'</span></div>'; }).join('');
    function historyLine(s) { return '<article>'+(s.yr ? '<time>'+text(s.yr)+'</time>' : '')+'<h3>'+text(s.role)+'</h3><p>'+text(s.org)+'</p></article>'; }
    q('#m-experience').innerHTML = C.experience.map(historyLine).join('');
    var mEdu = q('#m-education');
    if (mEdu) mEdu.innerHTML = (C.education || []).map(historyLine).join('');
    q('#m-skills').innerHTML = C.skills.map(function (s) { return '<li>'+text(s)+'</li>'; }).join('');
    q('#m-email').href = 'mailto:'+C.email;
    var directly = ['Book Call','Studio Map','Brand Card','The Offer'];
    var wa = C.links.filter(function (l) { return l.label === 'WhatsApp'; })[0];
    if (wa) q('#m-whatsapp').href = wa.url;
    function ext(l) { return '<a href="'+text(l.url)+'" target="_blank" rel="noopener noreferrer">'+text(l.label)+icon('out')+'</a>'; }
    q('#m-direct-links').innerHTML = '<a href="tel:'+text(C.phone.replace(/\s/g,''))+'">'+text(C.phone)+icon('right')+'</a>' +
      '<a href="mailto:'+text(C.email)+'">'+text(C.email)+icon('mail')+'</a>' +
      C.links.filter(function (l) { return directly.indexOf(l.label) !== -1; }).map(ext).join('');
    q('#m-social').innerHTML = C.links.filter(function (l) { return l.label !== 'WhatsApp' && directly.indexOf(l.label) === -1; }).map(ext).join('');
    q('#m-ecosystem').innerHTML = (C.ecosystem || []).map(ext).join('');
    q('.m-section-rule').innerHTML = '<span>THE CASE STUDIES · 01–05</span>'+tapFilm('Watch Intro');
  }
  function renderCase(i, options) {
    caseIndex = i;
    q('#m-case-header-name').textContent = cases[i].title;
    gallery.load(i, options.restore ? (savedBoard[caseKey(i)] || 0) : 0, options.reveal);
  }
  function render(k, options) {
    options = options || {};
    if (k === route && !options.force) return;
    route = k;
    var key = isCase(k) ? 'case' : k;
    if (key === 'work' && !workReady) {
      var workCards = q('#m-work-cards');
      workCards.innerHTML = C.projects.map(projectCard).join('');
      window.RJServicePlates.watch(workCards); workReady = true;
    }
    if (key === 'home' && !featuredReady) {
      var featured = q('#m-featured');
      featured.innerHTML = projectCard(C.projects[3],3);
      window.RJServicePlates.watch(featured); featuredReady = true;
    }
    if (key === 'case') renderCase(k.charCodeAt(5)-97, options);
    if (key === 'work') window.RJWorkshop.warm();
    pages.forEach(function (p) { p.hidden = p.dataset.mPage !== key; });
    tabs.forEach(function (a) { if (a.dataset.mTab === (key === 'case' ? 'work' : key)) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    q('.m-case-header').hidden = key !== 'case'; q('.m-brand').hidden = key === 'case';
    var heading = q('[data-m-page="'+key+'"] h1');
    document.title = key === 'home' ? 'Ranjan Sarkar — Creative Lead, Design to Execution' :
      ((key === 'case' ? C.projects[caseIndex].title : ({work:'Selected work',about:'About',contact:'Contact'})[key])+' — Ranjan Sarkar');
    scrollUntil = performance.now()+120;
    setTimeout(function () { aimTabs(); paintTabs(); }, 140);
    var y = options.restore ? (savedScroll[k] || options.historyY || 0) : 0;
    window.scrollTo(0,y);
    if (options.focus && heading) heading.focus({preventScroll:true});
  }
  /* ── the tab bar tracks the scroll ──
     On a long page the bar stays visible and the "current" tab follows the
     section under the reader's eye: home → work → about → contact. Each tab
     gets a 0–1 heat value, so the highlight travels smoothly instead of
     snapping (and the home route's long particle stage stays on "Home"). */
  var heat = { home: 1, work: 0, about: 0, contact: 0 };
  var heatWant = { home: 1, work: 0, about: 0, contact: 0 };
  var heatOn = false;

  var ZONES = [                     /* what each tab owns while the home route runs */
    { k: 'home',    from: 0,    to: 0.62 },   /* hero, character, film card */
    { k: 'work',    from: 0.62, to: 0.80 },   /* selected work */
    { k: 'about',   from: 0.80, to: 0.91 },   /* the day job + the numbers */
    { k: 'contact', from: 0.91, to: 1.01 }    /* let's build something real */
  ];

  function aimTabs() {
    var y = window.scrollY + (window.innerHeight * 0.45);
    var doc = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, window.scrollY / doc));
    var live = 'home';
    if (route === 'home' || isCase(route)) {
      live = 'home';
      for (var i = 0; i < ZONES.length; i++) if (p >= ZONES[i].from) live = ZONES[i].k;
    } else {
      /* on work / about / contact the page is short: the eye sits on that page */
      live = route;
      var lead = q('[data-m-page="' + route + '"]');
      if (lead) {
        var top = lead.getBoundingClientRect().top + window.scrollY;
        if (y < top) live = route;   /* still the same page, nothing above it */
      }
    }
    heatWant = { home: 0, work: 0, about: 0, contact: 0 };
    heatWant[live] = 1;
    tabs.forEach(function (a) {
      var k = a.dataset.mTab;
      if (k === live) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    heatOn = true;
  }

  function paintTabs() {
    if (!heatOn) return;
    var k, moved = false;
    for (k in heat) {
      var d = heatWant[k] - heat[k];
      if (Math.abs(d) > 0.004) { heat[k] += d * 0.18; moved = true; }
      else heat[k] = heatWant[k];
    }
    tabs.forEach(function (a) {
      var v = heat[a.dataset.mTab] || 0;
      a.style.setProperty('--tab-heat', v.toFixed(3));
    });
    if (moved) requestAnimationFrame(paintTabs);
  }

  var tabTick = 0;
  window.addEventListener('scroll', function () {
    if (tabTick) return;
    tabTick = requestAnimationFrame(function () {
      tabTick = 0;
      aimTabs();
      paintTabs();
    });
  }, { passive: true });
  window.addEventListener('resize', function () { aimTabs(); paintTabs(); }, { passive: true });
  setTimeout(function () { aimTabs(); paintTabs(); }, 400);
  document.addEventListener('rj:route', function () { aimTabs(); paintTabs(); });

  function save() {
    if (!route) return;
    savedScroll[route] = filmOpen ? filmScroll : window.scrollY;
    try { history.replaceState(Object.assign({},history.state,{rjMobile:true,y:savedScroll[route]}),''); } catch (_) {}
  }
  function go(k, options) {
    options = options || {};
    if (filmOpen) dismiss(false);
    if (window.RJWorkshop.active()) window.RJWorkshop.cancel();
    if (route && isCase(route) && k !== route) { savedBoard[route]=gallery.index(); gallery.closeDetail(); }
    if (route === k && !options.fromPop) {
      if (options.tab) { window.scrollTo(0,0); savedScroll[k] = 0; }
      return;
    }
    if (!options.fromPop) {
      save();
      var restore = !!options.restore;
      try { history.pushState({ rjMobile:true,from:route,y:restore ? (savedScroll[k] || 0) : 0 },'','#'+k); }
      catch (_) { location.hash = k; }
    }
    render(k,{focus:true,restore:options.fromPop || !!options.restore,reveal:options.reveal,historyY:(history.state || {}).y});
  }
  function backToWork() {
    if (route && isCase(route) && history.state && history.state.rjMobile && history.state.from === 'work') history.back();
    else go('work',{restore:true});
  }
  try { history.scrollRestoration = 'manual'; } catch (_) {}
  window.addEventListener('popstate',function () { go(validKey(location.hash),{fromPop:true}); });
  window.addEventListener('hashchange',function () { var k=validKey(location.hash); if (k!==route) go(k,{fromPop:true}); });
  window.addEventListener('scroll',function () { if (route && !filmOpen && performance.now()>scrollUntil) savedScroll[route]=window.scrollY; },{passive:true});
  window.addEventListener('pagehide',save);
  function present(from,play) {
    if (filmOpen) return;
    offered = true; filmOpen = true; opener = from || document.activeElement;
    filmScroll = window.scrollY;
    document.body.style.setProperty('--m-lock-y',-filmScroll+'px');
    document.body.classList.add('m-scroll-locked'); H.classList.add('m-film-open');
    if (nativeDialog) film.showModal();
    else {
      film.setAttribute('open',''); film.setAttribute('role','dialog'); film.classList.add('m-film-legacy'); H.classList.add('m-legacy-dialog');
      fallbackBackground = qs('.m-header,.m-main,.m-tabbar,.m-skip');
      fallbackBackground.forEach(function (el) { el.setAttribute('aria-hidden','true'); el.setAttribute('inert',''); });
    }
    film.scrollTop = 0;
    closeButton.focus({preventScroll:true});
    player.open(play);
  }
  function dismiss(restoreFocus) {
    if (!filmOpen) return;
    player.close(); filmOpen = false;
    if (nativeDialog && film.open) film.close();
    else {
      film.removeAttribute('open'); H.classList.remove('m-legacy-dialog');
      fallbackBackground.forEach(function (el) { el.removeAttribute('aria-hidden'); el.removeAttribute('inert'); });
      fallbackBackground = [];
    }
    H.classList.remove('m-film-open'); document.body.classList.remove('m-scroll-locked'); document.body.style.removeProperty('--m-lock-y');
    scrollUntil=performance.now()+100; window.scrollTo(0,filmScroll);
    if (restoreFocus) {
      var target = opener && opener !== document.body && opener.isConnected ? opener : q('[data-m-tab][aria-current="page"]');
      if (target) target.focus({preventScroll:true});
    }
    opener = null;
  }
  closeButton.addEventListener('click',function () { dismiss(true); });
  film.addEventListener('cancel',function (e) { e.preventDefault(); if (!player.fullscreen()) dismiss(true); });
  film.addEventListener('close',function () { if (filmOpen && !film.open) dismiss(true); });
  film.addEventListener('click',function (e) {
    if (e.target !== film) return;
    var r=film.getBoundingClientRect();
    if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dismiss(true);
  });
  // On iOS versions before <dialog>, retain keyboard access to this same sheet.
  if (!nativeDialog) document.addEventListener('keydown',function (e) {
    if (!filmOpen || player.fullscreen()) return;
    if (e.key === 'Escape') { e.preventDefault(); dismiss(true); }
    if (e.key === 'Tab') {
      var f = qs('a[href],button:not([disabled]),video[controls]',film).filter(function (el) { return !el.hidden && el.getClientRects().length; });
      var i=f.indexOf(document.activeElement);
      if (i<0 || (i===0 && e.shiftKey) || (i===f.length-1 && !e.shiftKey)) { e.preventDefault(); f[e.shiftKey?f.length-1:0].focus(); }
    }
  });
  function offerIntro() {
    if (offered || filmOpen || window.RJWorkshop.active()) return;
    if (document.hidden) { document.addEventListener('visibilitychange',offerIntro,{once:true}); return; }
    // Offer on an idle landing view, not over a case someone is reading.
    if (route === 'home' && window.scrollY < 155) present(null,false);
  }
  document.addEventListener('click',function (e) {
    var openButton=e.target.closest('[data-m-intro]');
    if (openButton) { e.preventDefault(); present(openButton,true); return; }
    var a=e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (a.classList.contains('m-skip')) { main.focus(); return; }
    if (a.hasAttribute('data-case-back')) { backToWork(); return; }
    if (a.hasAttribute('data-workshop-case')) {
      if (window.RJWorkshop.active()) return;
      var i = Number(a.dataset.workshopCase), c = cases[i], dest = validKey(a.hash);
      if (!c) { go(dest); return; }
      window.RJGallery.warm(i);
      window.RJWorkshop.play(c,a,function (reveal) { go(dest,{reveal:reveal}); });
      return;
    }
    go(validKey(a.hash),{tab:a.hasAttribute('data-m-tab')});
  });
  /* ── Mobile character animation (myself) ──
     Desktop runs the scroll-scrubbed film in app.js; the phone never
     loads app.js, so the character was invisible on mobile. This
     lightweight auto-loop reuses the same mobile frames already
     shipped in media/frames/*_m.webp (config frames[].m). */
  (function initCharacter() {
    var stage = q('#m-char-stage'), img = q('#m-char-img'), angle = q('#m-char-angle');
    if (!stage || !img || !C.frames || !C.frames.length) return;
    var frames = C.frames.map(function (f) { return f.m || f.src; });
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var idx = 0, timer = null, visible = true;
    function preload() { frames.forEach(function (src) { var im = new Image(); im.src = src; }); }
    if (window.requestIdleCallback) requestIdleCallback(preload, { timeout: 2500 });
    else setTimeout(preload, 600);
    function show(i) {
      idx = ((i % frames.length) + frames.length) % frames.length;
      if (img.getAttribute('src') !== frames[idx]) img.src = frames[idx];
      if (angle && C.frames[idx] && C.frames[idx].a) angle.textContent = C.frames[idx].a;
    }
    function tick() {
      if (document.hidden || route !== 'home' || !visible || filmOpen) return;
      show(idx + 1);
    }
    function start() { if (!timer && !reduced) timer = setInterval(tick, 105); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    if (reduced) { show(5); return; } /* static front pose, no motion */
    show(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.15 }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    stage.addEventListener('click', function () { show(0); start(); });
    start();
  })();
  renderContactAndAbout();
  q('.m-case-links').insertAdjacentHTML('afterend','<div class="m-case-film-link">'+tapFilm('Watch Intro')+'</div>');
  render(validKey(location.hash),{force:true,restore:true,historyY:(history.state || {}).y});
  setTimeout(offerIntro,Math.max(0,10000-performance.now()));
})();
