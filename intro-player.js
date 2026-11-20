/* The Working Line — one player for both layouts. No video is fetched by the landing page. */
(function () {
  'use strict';
  var folder = 'media/artvision-working-line/';
  var revision = '?v=' + encodeURIComponent(document.documentElement.dataset.rjRelease);
  var length = '03:26';
  var films = {
    hi: { name: 'Hindi', edition: 'Bharat edition', file: 'ArtViSiON_Intro_Hindi_Bharat' },
    bn: { name: 'Bengali', edition: 'Kolkata edition', file: 'ArtViSiON_Intro_Bengali_Kolkata' },
    en: { name: 'English', edition: 'International edition', file: 'ArtViSiON_Intro_English_International' }
  };
  var chapters = [
    { title:'Footing', clock:'1:45', seconds:104.833333 },
    { title:'LED sizing', clock:'2:13', seconds:132.833333 }
  ];
  function labelDuration(root) {
    root.querySelectorAll('[data-intro-duration]').forEach(function (node) { node.textContent = length; });
    root.querySelectorAll('[data-intro-cover]').forEach(function (node) {
      var parts = length.split(':');
      node.setAttribute('aria-label','Watch the ArtViSiON Intro, The Working Line, ' + Number(parts[0]) + ' minutes ' + Number(parts[1]) + ' seconds');
    });
  }
  // A single, pausable text prelude precedes the selected language film.
  function createPrelude(o, onFinish) {
    var template = document.getElementById('av-intro-titles');
    var deck = o.video.closest('.m-film-body, .xc-intro-inner');
    if (!template || !template.content || !deck) return null;

    var box = template.content.firstElementChild.cloneNode(true);
    var scroller = deck.parentNode;
    scroller.insertBefore(box,deck);
    deck.setAttribute('data-av-film-deck','');
    var slides = Array.prototype.slice.call(box.querySelectorAll('[data-av-hold]'));
    var steps = box.querySelector('[data-av-steps]');
    var stage = box.querySelector('.ap-stage');
    var number = box.querySelector('[data-av-number]');
    var note = box.querySelector('[data-av-note]');
    var pause = box.querySelector('[data-av-pause]');
    var skip = box.querySelector('[data-av-skip]');
    var current = 0, duration = 0, elapsed = 0, last = null, frame = 0;
    var showing = false, paused = false;
    var numberOf = function (i) { return ('0'+i).slice(-2); };
    box.querySelector('[data-av-total]').textContent = numberOf(slides.length);
    var buttons = slides.map(function (slide,i) {
      var b = document.createElement('button'), n = document.createElement('b');
      b.type = 'button'; n.textContent = numberOf(i+1);
      b.appendChild(n); b.appendChild(document.createTextNode(slide.dataset.avName));
      steps.appendChild(b);
      b.addEventListener('click',function () { show(i); });
      return b;
    });

    function stopClock() { cancelAnimationFrame(frame); frame = 0; last = null; }
    function updateClock() {
      stopClock();
      box.toggleAttribute('data-av-suspended',document.hidden);
      if (showing && !paused && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function show(i) {
      if (!showing) return;
      current = i; duration = Number(slides[i].dataset.avHold); elapsed = 0;
      box.style.setProperty('--ap-progress','0');
      box.toggleAttribute('data-av-moving',!paused);
      slides.forEach(function (slide,j) { slide.hidden = i !== j; });
      buttons.forEach(function (b,j) { b.setAttribute('aria-current',i===j ? 'step' : 'false'); });
      stage.scrollTop = 0;
      number.textContent = numberOf(i+1);
      note.textContent = slides[i].dataset.avName+' title, '+(i+1)+' of '+slides.length;
      updateClock();
    }
    function tick(t) {
      if (!showing || paused || document.hidden) return;
      if (last !== null) elapsed += t-last;
      last = t;
      box.style.setProperty('--ap-progress',String(Math.min(1,elapsed/duration)));
      if (elapsed >= duration) {
        if (current+1 < slides.length) show(current+1);
        else finish();
      } else frame = requestAnimationFrame(tick);
    }
    function setPause(value) {
      paused = value;
      // If paused during a reveal, let the current copy become fully legible.
      if (value) box.removeAttribute('data-av-moving');
      pause.textContent = value ? 'Resume' : 'Pause';
      pause.setAttribute('aria-label',value ? 'Resume titles' : 'Pause titles');
      updateClock();
    }
    function hide() {
      stopClock(); showing = false;
      box.hidden = true; deck.hidden = false;
      o.scope.classList.remove('av-prelude-on');
      scroller.scrollTop = 0;
    }
    function finish() {
      if (!showing) return;
      var wasFocused = box.contains(document.activeElement);
      hide(); onFinish(wasFocused);
    }
    pause.addEventListener('click',function () { setPause(!paused); });
    skip.addEventListener('click',finish);
    return {
      get running() { return showing; },
      begin: function () {
        if (showing) return;
        showing = true;
        deck.hidden = true; box.hidden = false;
        o.scope.classList.add('av-prelude-on');
        scroller.scrollTop = 0;
        setPause(false); show(0);
      },
      cancel: function () { if (showing) hide(); },
      sync: updateClock
    };
  }
  function create(o) {
    var v = o.video, label = o.edition, scope = o.scope;
    var languages = scope.querySelector('[data-intro-language-slot]');
    var chapterBar = scope.querySelector('[data-intro-chapter-slot]');
    languages.innerHTML = Object.keys(films).map(function (id) {
      return '<button type="button" data-intro-lang="'+id+'" aria-pressed="'+(id==='hi')+'">'+films[id].name+'</button>';
    }).join('');
    chapterBar.innerHTML = chapters.map(function (c) {
      return '<button type="button" data-intro-seek="'+c.seconds+'">'+c.title+' <span>'+c.clock+'</span></button>';
    }).join('');
    var buttons = languages.querySelectorAll('button');
    labelDuration(scope);
    var lang = 'hi', open = false, active = null, lastPosition = 0, lastRate = 1;
    var intent = false, failed = false, played = false, openCount = 0;
    var titlesDone = false, needsGesture = false;
    var startLabel = o.start.querySelector('span') || o.start.lastChild;
    var prelude = createPrelude(o, function (fromControls) {
      if (!open) return;
      titlesDone = true;
      labelStart();
      if (fromControls) { o.start.hidden = false; o.start.focus({preventScroll:true}); }
      requestPlay();
    });
    function labelStart() {
      startLabel.textContent = prelude && !titlesDone && !active ? 'Start Intro' : 'Play video';
    }
    function startOrPlay() {
      if (!open) return;
      if (prelude && !titlesDone && !active) { prelude.begin(); return; }
      v.focus({preventScroll:true}); requestPlay();
    }
    var useWebM = !!(v.canPlayType('video/webm; codecs="vp9, opus"') || v.canPlayType('video/webm; codecs="vp09.00.40.08, opus"'));
    function status(text) {
      o.status.textContent = text;
      o.status.hidden = !text;
    }
    function fullscreen() {
      return !!(v.webkitDisplayingFullscreen || document.fullscreenElement || document.webkitFullscreenElement);
    }
    function paint() {
      var f = films[lang];
      o.scope.setAttribute('data-intro-edition',lang);
      label.textContent = f.edition;
      v.setAttribute('aria-label','ArtViSiON Introduction, ' + f.name + ' edition');
      v.poster = folder + 'poster-' + lang + '.webp';
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.introLang === lang)); });
    }
    function remember() {
      if (active && !active.ready) {
        lastPosition = active.time;
        lastRate = active.rate;
      } else if (active && !failed) {
        lastPosition = v.ended ? 0 : (Number.isFinite(v.currentTime) ? v.currentTime : lastPosition);
        lastRate = v.playbackRate || 1;
      }
    }
    function requestPlay() {
      if (!open || (prelude && prelude.running)) return;
      needsGesture = false;
      if (!active || failed) {
        attach(useWebM ? 'webm' : 'mp4', true);
        return;
      }
      intent = true;
      v.controls = true;
      var a = active, n = openCount;
      var p = v.play();
      if (p && p.catch) p.catch(function (e) {
        if (!open || active !== a || n !== openCount || e.name === 'AbortError' || v.error) return;
        intent = false;
        needsGesture = e.name === 'NotAllowedError';
        labelStart(); o.start.hidden = false;
        status(needsGesture ? 'Tap Play video to continue with sound.' : 'Unable to play. Tap Play video to try again.');
      });
    }
    function attach(format, resume) {
      v.pause();
      failed = false;
      var ext = format === 'webm' ? '.vp9.webm' : '.mp4';
      var url = new URL(folder + films[lang].file + ext + revision, document.baseURI).href;
      active = { url: url, format: format, time: lastPosition, rate: lastRate, ready: false };
      intent = resume;
      v.preload = resume ? 'auto' : 'metadata';
      v.controls = true;
      v.src = url;
      v.load();
      // Setting the start time before metadata also works on engines that queue the seek.
      // Recheck against the actual duration in loadedmetadata (and clamp near the end).
      if (lastPosition > 0) { try { v.currentTime = lastPosition; } catch (_) {} }
      v.playbackRate = lastRate;
      if (resume) requestPlay();
    }
    function change(next) {
      if (!open || !films[next] || (next === lang && !failed)) return;
      var resume = !failed && !!active && (!v.paused || (!active.ready && intent)) && !v.ended;
      remember();
      lang = next; paint();
      if (active) {
        status('Loading ' + films[lang].name + ' edition…');
        attach(useWebM ? 'webm' : 'mp4', resume);
      }
    }
    v.addEventListener('loadedmetadata',function () {
      if (!active || v.currentSrc !== active.url) return;
      active.ready = true;
      var t = Math.min(active.time,Math.max(0,v.duration-.06));
      if (Number.isFinite(t) && Math.abs(v.currentTime-t) > .12) v.currentTime = t;
      v.playbackRate = active.rate;
      if (open && !needsGesture) status('');
    });
    v.addEventListener('error',function () {
      if (!active || !v.error || v.error.code === 1 || (v.currentSrc && v.currentSrc !== active.url)) return;
      remember();
      if (active.format === 'webm' && open) {
        var resume = intent && !v.ended;
        // Browser support reporting is not always proof of successful decoding.
        status('Opening the compatible version…');
        attach('mp4',resume);
      } else {
        intent = false;
        failed = true;
        o.start.hidden = false;
        if (open) status('Couldn’t load this edition. Tap Play video or choose its language again to retry.');
      }
    });
    v.addEventListener('play',function () {
      if (!open || (prelude && prelude.running)) { v.pause(); return; }
      intent = true; needsGesture = false;
      if (document.activeElement === o.start) v.focus({preventScroll:true});
      o.start.hidden = true;
      played = true;
      if (active && active.ready) status('');
    });
    v.addEventListener('pause',function () {
      if (v.paused && (!active || active.ready) && !v.error) intent = false;
    });
    v.addEventListener('ended',function () { intent = false; lastPosition = 0; });
    buttons.forEach(function (b) {
      b.addEventListener('click',function () { change(b.dataset.introLang); });
    });
    var jumps = chapterBar.querySelectorAll('button');
    jumps.forEach(function (button) {
      button.addEventListener('click',function () {
        if (!open || (prelude && prelude.running)) return;
        var t = Number(button.dataset.introSeek);
        if (!Number.isFinite(t) || t < 0.05) return;
        titlesDone = true; labelStart();
        lastPosition = t;
        if (!active || failed) {
          attach(useWebM ? 'webm' : 'mp4',true);
          return;
        }
        var resume = !played || v.ended;
        if (Number.isFinite(v.duration)) t = Math.min(t,Math.max(0,v.duration-.1));
        active.time = t;
        // Keep chapter selections even while metadata or format fallback is in flight.
        try { v.currentTime = t; } catch (_) {}
        if (resume) requestPlay();
      });
    });
    o.start.addEventListener('click',startOrPlay);
    // The video is never allowed to keep speaking behind another page.
    window.addEventListener('pagehide',function () { if (prelude) prelude.cancel(); v.pause(); intent = false; });
    document.addEventListener('visibilitychange',function () {
      if (prelude && prelude.running) prelude.sync();
      if (document.hidden && open && !fullscreen()) { v.pause(); intent = false; }
    });
    return {
      fullscreen: fullscreen,
      open: function (playNow) {
        open = true;
        openCount++;
        paint(); status(''); labelStart();
        o.start.hidden = played && !failed && !needsGesture;
        if (playNow) startOrPlay();
        else if (!active) v.controls = false;
      },
      close: function () {
        open = false;
        if (prelude) prelude.cancel();
        intent = false;
        remember();
        v.pause();
      }
    };
  }
  window.RJIntro = { create:create, labelDuration:labelDuration };
})();
