/* ArtViSiON / Workshop Gallery — one curated collection for both layouts. */
(function () {
  'use strict';
  var lib = window.RJCases;
  var phases = lib.phases, cases = lib.cases;
  function two(n) { return ('0'+n).slice(-2); }
  function text(s) { return String(s == null ? '' : s).replace(/[&<>"']/g,function (c) {return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  var paths = {
    next:'M5 12h14m-6-6 6 6-6 6', prev:'M19 12H5m6 6-6-6 6-6',
    diag:'M6 18 18 6M8 6h10v10', expand:'M8 4H4v4m12-4h4v4M4 16v4h4m12 0h4v-4',
    close:'m6 6 12 12M18 6 6 18', chevron:'m7 9 5 5 5-5',
    draw:'M4 20 20 4v16H4Zm8-3 5-5v5h-5Z', sheet:'M6 3h9l3 3v15H6V3Zm3 8h6m-6 4h6'
  };
  function icon(name) {return '<svg class="rg-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="'+paths[name]+'"/></svg>';}
  function visual(b, detail) {
    if (b.img) return '<div class="rg-photo"><img src="'+text(b.img)+'" alt="'+text(b.label)+'" decoding="async" '+(detail?'':'fetchpriority="high"')+'><span class="rg-img-state" hidden>Board image unavailable.</span></div>';
    if (b.kind === 'draw') return '<div class="rg-dwg">'+lib.drawings[b.draw]().replace('<svg class="xd"','<svg role="img" aria-label="'+text(b.label)+'" class="xd"')+'</div>';
    return '<div class="rg-sheet"><table><caption>'+text(b.doc)+'</caption><thead><tr>'+b.head.map(function (x) {return '<th scope="col">'+text(x)+'</th>';}).join('')+'</tr></thead><tbody>'+
      b.rows.map(function (r) {return '<tr>'+r.map(function (x) {return '<td>'+text(x)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
  }
  function photoState(el) {
    var img = el.querySelector('.rg-photo img'); if (!img) return;
    var state = img.nextElementSibling;
    function failed() { img.hidden = true; state.hidden = false; }
    if (img.complete && !img.naturalWidth) failed();
    else img.addEventListener('error',failed,{once:true});
  }
  function warmBoard(board) {
    if (!board || !board.img) return;
    var im = new Image(); im.decoding='async'; im.fetchPriority='low'; im.src=board.img;
    if (im.decode) im.decode().catch(function () {});
  }
  function create(host, options) {
    var headId = options.heading, c = null, k = 0, shownPhase = -1, zoomFrom = null, touch = null;
    var q = function (s) {return host.querySelector(s);};
    var nextCase = options.nextCase;
    function overview(n, focus) {
      if (!c) return;
      set(n);
      if (focus) q('.rg-board-nav select').focus({preventScroll:true});
      var sc = host.closest('.xc-gallery');
      var dest = q('.rg-phase-nav'), r = dest.getBoundingClientRect();
      var top = sc ? sc.getBoundingClientRect().top : (document.querySelector('.m-header') || {getBoundingClientRect:function () {return {bottom:0};}}).getBoundingClientRect().bottom;
      var bottom = (window.visualViewport ? window.visualViewport.height : window.innerHeight)-80;
      if (r.top < top || r.bottom > bottom) dest.scrollIntoView({block:'start',inline:'nearest'});
    }
    function set(n) {
      if (!c) return;
      k = Math.max(0,Math.min(c.boards.length-1,n|0));
      var b = c.boards[k], p = b.phase, select = q('.rg-board-nav select');
      var prev = q('[data-rg-prev]'), next = q('[data-rg-next]');
      var title = q('.rg-board-title'), media = q('.rg-visual'), track = q('.rg-phase-boards');
      q('.rg-board-num').textContent = two(k+1);
      q('.rg-board-context').textContent = 'BOARD ' + two(k+1)+' OF '+two(c.boards.length);
      q('.rg-tag').textContent = b.displayTag;
      title.textContent = b.label;
      q('.rg-board-copy').textContent = b.description;
      q('.rg-board-phase').textContent = two(p+1)+' / '+phases[p][0];
      q('.rg-board-chips').innerHTML = (b.meta || []).map(function (x) {return '<li>'+text(x)+'</li>';}).join('');
      q('.rg-board-chips').hidden = !b.meta || !b.meta.length;
      q('.rg-meter > span').style.width = (100 * (k+1)/c.boards.length)+'%';
      media.dataset.kind = b.kind;
      media.parentElement.dataset.kind = b.kind;
      media.innerHTML = visual(b,false); photoState(media);
      if (media.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) media.animate([{opacity:.84},{opacity:1}],{duration:220,easing:'ease-out'});
      select.value = String(k);
      var nextFocus = (k === 0 && document.activeElement === prev) || (k === c.boards.length-1 && document.activeElement === next);
      prev.disabled = k === 0; next.disabled = k === c.boards.length-1;
      if (nextFocus) select.focus({preventScroll:true});
      host.querySelectorAll('[data-rg-phase]').forEach(function (el,j) {
        if (p === j) el.setAttribute('aria-current','step'); else el.removeAttribute('aria-current');
        el.classList.toggle('rg-passed',j<p);
      });
      q('.rg-phase-name').textContent = phases[p][0]+' boards';
      if (shownPhase !== p) {
        var start = c.starts[p], stop = c.starts[p+1] || c.boards.length;
        track.innerHTML = c.boards.slice(start,stop).map(function (item,j) {
          var idx = start+j;
          var pic = item.img ? '<img src="'+text(item.img)+'" alt="" loading="lazy" decoding="async">' : icon(item.kind === 'draw' ? 'draw' : 'sheet');
          return '<li><button type="button" data-rg-board="'+idx+'"><span class="rg-thumb" aria-hidden="true">'+pic+'</span><span><small>'+two(idx+1)+'</small><strong>'+text(item.label)+'</strong></span></button></li>';
        }).join('');
        shownPhase = p;
      }
      track.querySelectorAll('[data-rg-board]').forEach(function (el) {
        if (+el.dataset.rgBoard === k) el.setAttribute('aria-current','true'); else el.removeAttribute('aria-current');
      });
      q('.rg-current').textContent = two(k+1)+' of '+two(c.boards.length)+'. '+phases[p][0]+': '+b.label;
      q('[data-rg-zoom]').hidden = !b.img && typeof q('.rg-zoom').showModal !== 'function';
      warmBoard(c.boards[k+1]);
    }
    function closeDetail() {
      var detail = q('.rg-zoom');
      if (detail && detail.open) detail.close();
    }
    function showDetail() {
      var b = c.boards[k], detail = q('.rg-zoom');
      if (detail.open) return;
      if (typeof detail.showModal !== 'function') {
        if (b.img) window.open(b.img,'_blank','noopener,noreferrer');
        return;
      }
      zoomFrom = document.activeElement;
      q('.rg-zoom-title').textContent = b.label;
      var image = q('.rg-zoom-content'); image.innerHTML = visual(b,true); photoState(image);
      var original = q('.rg-original'); original.hidden = !b.img;
      if (b.img) original.href = b.img; else original.removeAttribute('href');
      detail.showModal(); detail.scrollTop = 0;
      q('[data-rg-zoom-close]').focus({preventScroll:true});
    }
    function load(i,n,reveal) {
      closeDetail(); c = cases[i]; if (!c) return;
      shownPhase = -1; host.classList.add('rg'); host.dataset.case = c.key;
      var next = cases[(i+1)%cases.length];
      host.innerHTML = '<header class="rg-head">'+
        '<div class="rg-head-main"><div class="rg-kicker"><i></i> THE WORKSHOP <span>/</span> FILE '+c.number+'</div>'+
        '<h1 id="'+headId+'" tabindex="-1">'+text(c.title)+'<span>.</span></h1><p>'+text(c.summary)+'</p></div>'+
        '<div class="rg-head-meta"><div><small>DISCIPLINE / '+c.key+'</small><strong>'+text(c.tech)+'</strong></div>'+
        '<button type="button" class="rg-outcome" data-rg-outcome>View outcome '+icon('diag')+'</button></div></header>'+
        '<nav class="rg-phase-nav" aria-label="Gallery phases">'+phases.map(function (p,j) {
          return '<button type="button" data-rg-phase="'+j+'" aria-label="'+two(j+1)+'. '+p[0]+': '+p[1]+'"><small>'+two(j+1)+'</small><strong>'+p[0]+'</strong></button>';
        }).join('')+'</nav>'+
        '<section class="rg-deck" aria-label="Current gallery board">'+
        '<div class="rg-frame"><div class="rg-visual"></div><button type="button" class="rg-zoom-btn" aria-label="Enlarge board" data-rg-zoom>'+icon('expand')+'</button></div>'+
        '<div class="rg-blurb"><div class="rg-board-meta"><span class="rg-tag"></span><span class="rg-board-phase"></span></div>'+
        '<div class="rg-board-text"><div class="rg-board-num" aria-hidden="true"></div><h2 class="rg-board-title"></h2><p class="rg-board-copy"></p><ul class="rg-board-chips"></ul></div>'+
        '<div class="rg-board-nav"><div class="rg-nav-status"><span class="rg-board-context"></span><span class="rg-meter" aria-hidden="true"><span></span></span></div>'+
        '<div class="rg-nav-buttons"><button type="button" aria-label="Previous board" data-rg-prev>'+icon('prev')+'</button>'+
        '<label><span class="rg-sr">Jump to board</span><select aria-label="Jump to board">'+phases.map(function (p,j) {
          return '<optgroup label="'+p[0]+'">'+c.boards.slice(c.starts[j],c.starts[j+1] || c.boards.length).map(function (b,idx) {
            return '<option value="'+(idx+c.starts[j])+'">'+two(idx+c.starts[j]+1)+' · '+text(b.label)+'</option>';
          }).join('')+'</optgroup>';
        }).join('')+'</select>'+icon('chevron')+'</label><button type="button" aria-label="Next board" data-rg-next>'+icon('next')+'</button></div></div></div></section>'+
        '<p class="rg-sr rg-current" role="status" aria-atomic="true"></p>'+
        '<section class="rg-track" aria-label="Boards in this phase"><div class="rg-track-label"><span class="rg-phase-name"></span><span>ARTVISION / PROCESS ARCHIVE</span></div><ol class="rg-phase-boards"></ol></section>'+
        '<nav class="rg-end" aria-label="Other services"><span>CASE '+c.key+' / '+two(c.boards.length)+' BOARDS</span><a href="'+next.url+'" data-rg-next-case="'+((i+1)%cases.length)+'">Next service <strong>'+text(next.title)+'</strong>'+icon('next')+'</a></nav>'+
        '<dialog class="rg-zoom" aria-label="Enlarged gallery board"><div class="rg-zoom-head"><strong class="rg-zoom-title"></strong><a class="rg-original" href="#" target="_blank" rel="noopener noreferrer">Original '+icon('diag')+'</a><button type="button" data-rg-zoom-close aria-label="Close enlarged board">'+icon('close')+'</button></div><div class="rg-zoom-content"></div></dialog>';
      var d = q('.rg-zoom'); d.addEventListener('close',function () {
        if (d.open) return;
        if (zoomFrom && zoomFrom.isConnected) zoomFrom.focus({preventScroll:true}); zoomFrom = null;
      });
      d.addEventListener('click',function (e) { if (e.target === d) {
        var r=d.getBoundingClientRect(); if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) d.close();
      }});
      set(n || 0);
      if (reveal && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        host.classList.remove('rg-arrive'); void host.offsetWidth; host.classList.add('rg-arrive');
      } else host.classList.remove('rg-arrive');
    }
    host.addEventListener('click',function (e) {
      var b = e.target.closest('button,a[data-rg-next-case]');
      if (!b || !host.contains(b) || !c) return;
      if (b.hasAttribute('data-rg-phase')) overview(c.starts[+b.dataset.rgPhase],false);
      else if (b.hasAttribute('data-rg-board')) overview(+b.dataset.rgBoard,false);
      else if (b.hasAttribute('data-rg-outcome')) overview(c.starts[phases.length-1],true);
      else if (b.hasAttribute('data-rg-prev')) set(k-1);
      else if (b.hasAttribute('data-rg-next')) set(k+1);
      else if (b.hasAttribute('data-rg-zoom')) showDetail();
      else if (b.hasAttribute('data-rg-zoom-close')) closeDetail();
      else if (b.hasAttribute('data-rg-next-case') && nextCase && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); nextCase(+b.dataset.rgNextCase); }
    });
    host.addEventListener('change',function (e) {if (e.target.matches('.rg-board-nav select')) set(Number(e.target.value));});
    host.addEventListener('keydown',function (e) {
      if (!c || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.target.closest('select, .rg-zoom')) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); set(k+(e.key === 'ArrowRight' ? 1 : -1));
      }
    });
    host.addEventListener('pointerdown',function (e) {
      touch = e.pointerType === 'touch' && e.isPrimary && e.target.closest('.rg-frame') && !e.target.closest('button') ? [e.clientX,e.clientY] : null;
    });
    host.addEventListener('pointercancel',function () {touch = null;});
    host.addEventListener('pointerup',function (e) {
      if (!touch) return;
      var dx = e.clientX-touch[0], dy = e.clientY-touch[1]; touch = null;
      if (Math.abs(dx)>52 && Math.abs(dx)>1.6*Math.abs(dy)) set(dx<0 ? k+1 : k-1);
    });
    return { load:load, step:function (d) {if (c) set(k+d);}, index:function () {return k;},
      closeDetail:closeDetail, focus:function () {var h=q('#'+headId); if (h) h.focus({preventScroll:true});} };
  }
  window.RJGallery = { create:create, warm:function (i) {if (cases[i]) warmBoard(cases[i].boards[0]);} };
})();
