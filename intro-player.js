/* The Working Line — one player for both layouts. No video is fetched by the landing page. */
(function () {
  'use strict';
  var folder = 'media/artvision-working-line/';
  var films = {
    hi: { name: 'Hindi', edition: 'Bharat edition', file: 'ArtViSiON_Intro_Hindi_Bharat' },
    bn: { name: 'Bengali', edition: 'Kolkata edition', file: 'ArtViSiON_Intro_Bengali_Kolkata' },
    en: { name: 'English', edition: 'International edition', file: 'ArtViSiON_Intro_English_International' }
  };
  function create(o) {
    var v = o.video, label = o.edition, buttons = Array.prototype.slice.call(o.choices);
    var lang = 'hi', open = false, active = null, lastPosition = 0, lastRate = 1;
    var intent = false, failed = false, played = false, openCount = 0;
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
      if (!open) return;
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
        o.start.hidden = false;
        status(e.name === 'NotAllowedError' ? 'Tap Play video to continue with sound.' : 'Unable to play. Tap Play video to try again.');
      });
    }
    function attach(format, resume) {
      v.pause();
      failed = false;
      var ext = format === 'webm' ? '.vp9.webm' : '.mp4';
      var url = new URL(folder + films[lang].file + ext, document.baseURI).href;
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
      if (open) status('');
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
      if (!open) { v.pause(); return; }
      intent = true;
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
    o.start.addEventListener('click',function () { v.focus({preventScroll:true}); requestPlay(); });
    // The video is never allowed to keep speaking behind another page.
    window.addEventListener('pagehide',function () { v.pause(); intent = false; });
    document.addEventListener('visibilitychange',function () {
      if (document.hidden && open && !fullscreen()) { v.pause(); intent = false; }
    });
    return {
      fullscreen: fullscreen,
      open: function (playNow) {
        open = true;
        openCount++;
        paint(); status('');
        o.start.hidden = played && !failed;
        if (playNow) requestPlay();
        else if (o.prime && (!active || failed)) attach(useWebM ? 'webm' : 'mp4',false);
        else if (!active) v.controls = false;
      },
      close: function () {
        open = false;
        intent = false;
        remember();
        v.pause();
      }
    };
  }
  window.RJIntro = { create: create };
})();
