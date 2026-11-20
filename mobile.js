/* Rj Portfolio · mobile navigation, process boards, and film sheet. */
(function () {
  'use strict';
  var C = window.CONFIG, library = window.RJCases;
  var q = function (s,r) { return (r || document).querySelector(s); };
  var qs = function (s,r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (!C || !library || !window.RJIntro) { q('#rj-boot-error').hidden = false; return; }
  var pages = qs('[data-m-page]'), tabs = qs('[data-m-tab]'), cases = library.cases;
  var H = document.documentElement, main = q('#m-main');
  var route = null, board = 0, caseIndex = -1, savedScroll = Object.create(null), savedBoard = Object.create(null);
  var workReady = false, featuredReady = false;
  var picker = q('#m-board-select'), previous = q('#m-board-prev'), nextBoard = q('#m-board-next');
  var film = q('#m-film'), closeButton = q('.m-film-x'), nativeDialog = typeof film.showModal === 'function';
  var player = window.RJIntro.create({ video: q('#m-film-video'), start: q('#m-film-play'), status: q('#m-film-status'),
    edition: q('#m-film-edition'), choices: qs('[data-intro-lang]',film), scope: film, prime: false });
  var filmOpen = false, offered = false, opener = null, filmScroll = 0, scrollUntil = 0;
  var fallbackBackground = [];
  function icon(n) { return '<svg aria-hidden="true" focusable="false"><use href="#mi-' + n + '"/></svg>'; }
  function text(s) { return String(s == null ? '' : s).replace(/[&<>"']/g,function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function n2(n) { return ('0'+n).slice(-2); }
  function validKey(s) {
    var k = (s || '').replace(/^#/,'').toLowerCase();
    return /^(home|work|about|contact|work\/[a-e])$/.test(k) ? k : 'home';
  }
  function isCase(k) { return k.indexOf('work/') === 0; }
  function caseKey(i) { return 'work/' + cases[i].key.toLowerCase(); }
  function tapFilm(label) {
    return '<button type="button" class="m-text-link m-film-link" aria-controls="m-film" aria-haspopup="dialog" data-m-intro>'+icon('play')+text(label)+'</button>';
  }
  function coverSource(p) { return p.img.replace('/t/','/'); }
  function projectCard(p,i) {
    return '<a class="m-card" href="#'+caseKey(i)+'" aria-label="'+text(p.title)+' case study: '+text(p.tech)+'">' +
      '<span class="m-card-image"><img src="'+text(p.img)+'" width="640" height="360" alt="" loading="lazy" decoding="async"><span class="m-card-key" aria-hidden="true">'+text(p.key)+'</span></span>' +
      '<span class="m-card-copy"><span class="m-card-head"><span><strong>'+text(p.title)+'</strong><span class="m-card-tech">'+text(p.tech)+'</span></span><span class="m-card-arrow">'+icon('right')+'</span></span><span class="m-card-line">'+text(p.line)+'</span></span></a>';
  }
  function renderContactAndAbout() {
    q('#m-about-strap').textContent = C.aboutTitle;
    q('#m-about-bio').textContent = C.aboutText;
    q('#m-resume').href = C.resume;
    q('#m-stats').innerHTML = C.stats.map(function (s) { return '<div><strong>'+text(s.n)+'</strong><span>'+text(s.l)+'</span></div>'; }).join('');
    function historyLine(s) { return '<article>'+(s.yr ? '<time>'+text(s.yr)+'</time>' : '')+'<h3>'+text(s.role)+'</h3><p>'+text(s.org)+'</p></article>'; }
    q('#m-experience').innerHTML = C.experience.map(historyLine).join('');
    q('#m-education').innerHTML = C.education.map(historyLine).join('');
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
  function sheet(s) {
    return '<div class="m-board-sheet"><table role="table"><caption>'+text(s.doc)+'</caption><thead role="rowgroup"><tr role="row">'+
      s.head.map(function (h) { return '<th role="columnheader" scope="col">'+text(h)+'</th>'; }).join('')+'</tr></thead><tbody role="rowgroup">'+
      s.rows.map(function (r) { return '<tr role="row">'+r.map(function (cell,j) {return '<td role="cell"><span class="m-sheet-label" aria-hidden="true">'+text(s.head[j])+'</span>'+text(cell)+'</td>';}).join('')+'</tr>'; }).join('')+'</tbody></table></div>';
  }
  function renderBoard(k, reposition) {
    var c = cases[caseIndex]; if (!c) return;
    board = Math.max(0,Math.min(c.stages.length-1,k));
    var s = c.stages[board], visual, tag;
    if (s.kind === 'photo') {
      tag = s.tag || 'Campaign visual';
      visual = '<div class="m-board-media m-board-photo is-loading"><img src="'+text(s.img)+'" width="960" height="540" alt="'+text(s.n)+'" decoding="async">'+
        '<span class="m-photo-state" role="status">Loading board…</span>'+
        '<a href="'+text(s.img)+'" target="_blank" rel="noopener noreferrer" aria-label="Open original board image in new tab">'+icon('expand')+'</a></div>';
    } else if (s.kind === 'draw') {
      tag = 'Technical drawing';
      var draw = library.drawings[s.draw]().replace('<svg ','<svg role="img" aria-label="'+text(s.n)+'" ');
      visual = '<div class="m-board-media"><div class="m-drawing-scroll" id="m-drawing" role="region" aria-label="Technical drawing" tabindex="0">'+draw+'</div>'+
        '<button type="button" aria-label="Enlarge technical drawing" aria-controls="m-drawing" aria-pressed="false" data-m-enlarge>'+icon('expand')+'</button></div>';
    } else { tag = 'Production sheet'; visual = sheet(s); }
    var cap = s.cap && s.cap !== s.n ? '<p class="m-board-desc">'+text(s.cap)+'</p>' : '';
    var meta = (s.meta || []).length ? '<ul class="m-board-meta">'+s.meta.map(function (m) { return '<li>'+text(m)+'</li>'; }).join('')+'</ul>' : '';
    q('#m-board-content').innerHTML = '<figure class="m-board-figure m-board-figure-'+text(s.kind)+'">'+visual+
      '<figcaption><p class="m-board-label">'+text(tag)+'</p><h3>'+text(s.n)+'</h3>'+cap+meta+'</figcaption></figure>';
    var photo = q('.m-board-photo');
    if (photo) {
      var img = q('img',photo), status = q('.m-photo-state',photo);
      function settlePhoto() {
        photo.classList.remove('is-loading');
        status.hidden = !!img.naturalWidth;
        if (!img.naturalWidth) {
          img.style.visibility = 'hidden';
          status.textContent = 'Couldn’t open this board. Use the expand button to retry.';
        }
      }
      if (img.complete) settlePhoto();
      else { img.addEventListener('load',settlePhoto,{once:true}); img.addEventListener('error',settlePhoto,{once:true}); }
    }
    q('#m-board-index').textContent = n2(board+1)+' / '+n2(c.stages.length);
    picker.value = String(board);
    previous.disabled = board === 0;
    nextBoard.disabled = board >= c.stages.length-1;
    savedBoard[caseKey(caseIndex)] = board;
    if (reposition) {
      var controls = q('.m-board-picker');
      if (controls.getBoundingClientRect().top < q('.m-header').getBoundingClientRect().bottom) controls.scrollIntoView({block:'start'});
    }
  }
  function renderCase(i, restore) {
    caseIndex = i;
    var p = C.projects[i], c = cases[i], n = (i+1)%cases.length;
    var sourceWidth = i === 0 ? 1642 : 1376;
    q('#m-case-header-name').textContent = p.title;
    q('#m-case-intro').innerHTML = '<div class="m-page-lead m-case-head"><div class="m-kicker"><span class="m-signal"></span> CASE '+text(c.key)+' <span class="m-slash">/</span> '+text(p.tech)+'</div>'+
      '<h1 class="m-display m-sub-display" id="m-case-title" tabindex="-1">'+text(p.title)+'<span class="m-red">.</span></h1><div class="m-case-context">'+text(c.client)+'</div><p>'+text(p.line)+'</p></div>'+
      '<figure class="m-case-cover"><img src="'+text(p.img)+'" srcset="'+text(p.img)+' 640w, '+text(coverSource(p))+' '+sourceWidth+'w" sizes="(max-width:680px) 94vw, 920px" width="1280" height="720" alt="'+text(p.tech)+' portfolio campaign visual" decoding="async"><figcaption>ArtViSiON <span class="m-slash">/</span> Campaign visual</figcaption></figure>';
    picker.innerHTML = c.stages.map(function (b,k) { return '<option value="'+k+'">'+n2(k+1)+' · '+text(b.n)+'</option>'; }).join('');
    q('#m-next-case').href = '#'+caseKey(n);
    q('#m-next-case').innerHTML = text(C.projects[n].title)+' '+icon('right');
    q('#m-next-case').setAttribute('aria-label','Next case: '+C.projects[n].title);
    renderBoard(restore ? (savedBoard[caseKey(i)] || 0) : 0,false);
  }
  function render(k, options) {
    options = options || {};
    if (k === route && !options.force) return;
    route = k;
    var key = isCase(k) ? 'case' : k;
    if (key === 'work' && !workReady) { q('#m-work-cards').innerHTML = C.projects.map(projectCard).join(''); workReady = true; }
    if (key === 'home' && !featuredReady) { q('#m-featured').innerHTML = projectCard(C.projects[3],3); featuredReady = true; }
    if (key === 'case') renderCase(k.charCodeAt(5)-97, options.restore);
    pages.forEach(function (p) { p.hidden = p.dataset.mPage !== key; });
    tabs.forEach(function (a) { if (a.dataset.mTab === (key === 'case' ? 'work' : key)) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    q('.m-case-header').hidden = key !== 'case'; q('.m-brand').hidden = key === 'case';
    var heading = q('[data-m-page="'+key+'"] h1');
    document.title = key === 'home' ? 'Ranjan Sarkar — Creative Lead, Design to Execution' :
      ((key === 'case' ? C.projects[caseIndex].title : ({work:'Selected work',about:'About',contact:'Contact'})[key])+' — Ranjan Sarkar');
    scrollUntil = performance.now()+120;
    var y = options.restore ? (savedScroll[k] || options.historyY || 0) : 0;
    window.scrollTo(0,y);
    if (options.focus && heading) heading.focus({preventScroll:true});
  }
  function save() {
    if (!route) return;
    savedScroll[route] = filmOpen ? filmScroll : window.scrollY;
    try { history.replaceState(Object.assign({},history.state,{rjMobile:true,y:savedScroll[route]}),''); } catch (_) {}
  }
  function go(k, options) {
    options = options || {};
    if (filmOpen) dismiss(false);
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
    render(k,{focus:true,restore:options.fromPop || !!options.restore,historyY:(history.state || {}).y});
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
    if (offered || filmOpen) return;
    if (document.hidden) { document.addEventListener('visibilitychange',offerIntro,{once:true}); return; }
    // Offer on an idle landing view, not over a case someone is reading.
    if (route === 'home' && window.scrollY < 155) present(null,false);
  }
  picker.addEventListener('change',function () { renderBoard(Number(picker.value),false); });
  function step(delta,e) {
    renderBoard(board+delta,true);
    if (e.detail === 0 || e.currentTarget.disabled) picker.focus({preventScroll:true});
  }
  previous.addEventListener('click',function (e) { step(-1,e); });
  nextBoard.addEventListener('click',function (e) { step(1,e); });
  document.addEventListener('click',function (e) {
    var openButton=e.target.closest('[data-m-intro]');
    if (openButton) { e.preventDefault(); present(openButton,true); return; }
    var bigger=e.target.closest('[data-m-enlarge]');
    if (bigger) {
      var zoom = q('#m-drawing').classList.toggle('is-large');
      bigger.setAttribute('aria-pressed',String(zoom)); bigger.setAttribute('aria-label',zoom?'Fit technical drawing':'Enlarge technical drawing');
      return;
    }
    var a=e.target.closest('a[href^="#"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (a.classList.contains('m-skip')) { main.focus(); return; }
    if (a.hasAttribute('data-case-back')) { backToWork(); return; }
    go(validKey(a.hash),{tab:a.hasAttribute('data-m-tab')});
  });
  renderContactAndAbout();
  q('.m-case-links').insertAdjacentHTML('afterend','<div class="m-case-film-link">'+tapFilm('Watch Intro')+'</div>');
  render(validKey(location.hash),{force:true,restore:true,historyY:(history.state || {}).y});
  setTimeout(offerIntro,Math.max(0,10000-performance.now()));
})();
