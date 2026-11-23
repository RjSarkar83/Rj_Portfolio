/* ArtViSiON // Workshop entry. One matched move from pupil to aisle. */
(function () {
  'use strict';
  var dir = 'media/artvision-workshop/';
  var motion = matchMedia('(prefers-reduced-motion: reduce)');
  var work = null, shots = [], images = null, run = null;
  var duration = 2380;
  var scenes = [
    {name:'iris', start:0, end:1060, inTime:110, outTime:182, origin:'50.2% 50%', route:'Focus', cue:'01 / FOCUS', line:'Look closer.'},
    {name:'shop', start:898, end:duration, inTime:235, outTime:110, origin:'50% 50%', route:'Workshop', cue:'02 / WORKSHOP', line:'Step inside.'}
  ];
  function capable() {
    var link = navigator.connection;
    return !motion.matches && !!(window.HTMLDialogElement && HTMLDialogElement.prototype.showModal) &&
      !(link && (link.saveData || /(^|-)2g$/.test(link.effectiveType || '')));
  }
  function prepared() {
    if (images) return images;
    images = Promise.all(scenes.map(function (scene) {
      return new Promise(function (resolve,reject) {
        var im = new Image(); im.decoding = 'async';
        im.className = 'rw-plate'; im.alt = '';
        im.onload = function () {
          if (im.decode) im.decode().then(function () {resolve(im);},function () {resolve(im);});
          else resolve(im);
        };
        im.onerror = reject; im.src = dir+scene.name+'.webp';
      });
    })).catch(function () {images = null; return null;});
    return images;
  }
  function init() {
    if (work) return;
    work = document.createElement('dialog'); work.className = 'rw-entry';
    work.setAttribute('aria-labelledby','rw-title'); work.setAttribute('aria-describedby','rw-description');
    work.innerHTML = '<h1 class="rg-sr" id="rw-title">Enter the ArtViSiON workshop</h1><p class="rg-sr" id="rw-description">A short visual transition. Use Skip to gallery to enter immediately or Close to return to services.</p>'+
      '<div class="rw-scenes" aria-hidden="true"></div><div class="rw-shade" aria-hidden="true"></div>'+
      '<div class="rw-top"><div class="rw-studio"><span class="rw-mark" aria-hidden="true"><img src="media/artvision-mobile/mark-rj.svg" alt="" width="30" height="25"></span><span><strong>ArtViSiON</strong><small>WORKSHOP ENTRY</small></span></div>'+
      '<div class="rw-actions"><button type="button" class="rw-skip" aria-label="Skip to gallery" autofocus>Skip<span> to gallery</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 5 9 7-9 7m12-14v14"/></svg></button>'+
      '<button type="button" class="rw-close" aria-label="Close transition"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div></div>'+
      '<div class="rw-reticle" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'+
      '<div class="rw-copy"><p class="rw-cue">WORKSHOP ENTRY</p><div class="rw-line" aria-hidden="true">Opening the gallery.</div><p class="rw-service"></p></div>'+
      '<div class="rw-route" aria-hidden="true">'+scenes.map(function (scene,i) {
        return '<div><span><i></i></span><small>0'+(i+1)+' <b>'+scene.route+'</b></small></div>';
      }).join('')+'</div>';
    document.body.appendChild(work);
    work.querySelector('.rw-skip').addEventListener('click',function () {settle(true);});
    work.querySelector('.rw-close').addEventListener('click',function () {settle(false,true);});
    work.addEventListener('cancel',function (e) {e.preventDefault(); settle(false,true);});
    work.addEventListener('close',function () {if (!work.open && run) settle(false,true);});
    window.addEventListener('pagehide',function () {settle(false,false);});
    document.addEventListener('visibilitychange',function () {if (document.hidden && run) settle(true);});
  }
  function settle(complete,restore) {
    if (!run) return;
    var r = run; run = null;
    cancelAnimationFrame(r.frame); clearTimeout(r.deadline);
    document.documentElement.classList.remove('rw-playing');
    if (work.open) work.close();
    work.querySelector('.rw-scenes').replaceChildren(); shots = [];
    if (!complete && restore && r.trigger && r.trigger.isConnected) r.trigger.focus({preventScroll:true});
    if (complete) r.done(!!r.start);
  }
  function clamp(x) {return Math.max(0,Math.min(1,x));}
  function ease(x) {x=clamp(x); return x*x*(3-2*x);}
  function camera(i,t) {
    // Both cameras converge on the same point: the dark pupil resolves into the lit aisle.
    var scale = i===0 ? 1+.11*t+12*Math.pow(t,4.7) : 1.01+.72*Math.pow(t,1.08);
    return 'scale('+scale+')';
  }
  function frame(now) {
    var r = run;
    if (!r) return;
    if (motion.matches) {settle(true); return;}
    var t = Math.max(0,now-r.start), beat = t>=scenes[1].start+45 ? 1 : 0;
    scenes.forEach(function (scene,i) {
      var p = clamp((t-scene.start)/(scene.end-scene.start));
      var opacity = ease((t-scene.start)/scene.inTime)*ease((scene.end-t)/scene.outTime);
      if (opacity>0) shots[i].style.transform=camera(i,p);
      shots[i].style.opacity=opacity;
      var next = scenes[i+1] ? scenes[i+1].start : duration;
      r.rules[i].style.transform='scaleX('+clamp((t-scene.start)/(next-scene.start))+')';
    });
    if (beat!==r.beat) {
      var scene = scenes[beat];
      r.beat=beat; work.dataset.shot=scene.name;
      r.cue.textContent=scene.cue; r.line.textContent=scene.line;
    }
    if (t>=duration) settle(true);
    else r.frame=requestAnimationFrame(frame);
  }
  function play(c,trigger,done) {
    if (run) return;
    if (!capable() || document.hidden) {done(false); return;}
    init();
    var r = run = { done:done, trigger:trigger, beat:-1, start:0, frame:0 };
    r.cue = work.querySelector('.rw-cue'); r.line = work.querySelector('.rw-line');
    r.rules = Array.prototype.slice.call(work.querySelectorAll('.rw-route i'));
    work.dataset.shot = 'loading'; work.setAttribute('data-service',c.key);
    r.cue.textContent = 'WORKSHOP ENTRY'; r.line.textContent = 'Opening the gallery.';
    work.querySelector('.rw-service').textContent = 'FILE '+c.number+'  /  '+c.title;
    r.rules.forEach(function (el) {el.style.transform='scaleX(0)';});
    try {work.showModal();} catch (_) {run=null; done(false); return;}
    document.documentElement.classList.add('rw-playing');
    work.querySelector('.rw-skip').focus({preventScroll:true});
    r.deadline = setTimeout(function () {if (run===r) settle(true);},720);
    prepared().then(function (decoded) {
      if (run!==r) return;
      if (!decoded) {settle(true); return;}
      clearTimeout(r.deadline);
      var scene = work.querySelector('.rw-scenes');
      shots = decoded;
      shots.forEach(function (el,i) {
        el.style.opacity = 0; el.style.transform = camera(i,0);
        el.style.transformOrigin = scenes[i].origin; scene.appendChild(el);
      });
      r.start = performance.now(); r.frame=requestAnimationFrame(frame);
    });
  }
  window.RJWorkshop = { play:play, active:function () {return !!run;}, cancel:function () {settle(false,false);},
    warm:function () {if (capable()) prepared();} };
})();
