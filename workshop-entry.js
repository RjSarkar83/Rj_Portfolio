/* ArtViSiON // Workshop entry. Four original plates, one continuous camera route. */
(function () {
  'use strict';
  var dir = 'media/artvision-workshop/';
  var filenames = ['iris','car','cockpit','shop'];
  var motion = matchMedia('(prefers-reduced-motion: reduce)');
  var work = null, shots = [], images = null, run = null;
  var duration = 3320;
  var marks = [0,920,2310,duration];
  // Pupil blackout → open door → driver POV → matched door jambs/workshop aisle.
  var cuts = [
    {at:0,end:932,origin:'50.2% 50%',inTime:125,out:100},
    {at:850,end:1575,origin:'51.5% 49%',inTime:152,out:155},
    {at:1455,end:2460,origin:'50% 39.8%',inTime:150,out:150},
    {at:2310,end:duration,origin:'50% 51%',inTime:165,out:215}
  ];
  var words = [
    ['01 / FOCUS','Look closer.'],['02 / TRANSIT','Take the seat.'],
    ['02 / TRANSIT','Follow the light.'],['03 / ARRIVAL','Into the workshop.']
  ];
  function capable() {
    var link = navigator.connection;
    return !motion.matches && !!(window.HTMLDialogElement && HTMLDialogElement.prototype.showModal) &&
      !(link && (link.saveData || /(^|-)2g$/.test(link.effectiveType || '')));
  }
  function prepared() {
    if (images) return images;
    images = Promise.all(filenames.map(function (name) {
      return new Promise(function (resolve,reject) {
        var im = new Image(); im.decoding = 'async';
        im.className = 'rw-plate'; im.alt = '';
        im.onload = function () {
          if (im.decode) im.decode().then(function () {resolve(im);},function () {resolve(im);});
          else resolve(im);
        };
        im.onerror = reject; im.src = dir+name+'.webp';
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
      '<div class="rw-top"><div class="rw-studio"><span class="rw-mark" aria-hidden="true"><img src="media/artvision-mobile/mark.webp" alt="" width="40" height="26"></span><span><strong>ArtViSiON</strong><small>WORKSHOP ENTRY</small></span></div>'+
      '<div class="rw-actions"><button type="button" class="rw-skip" aria-label="Skip to gallery" autofocus>Skip<span> to gallery</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 5 9 7-9 7m12-14v14"/></svg></button>'+
      '<button type="button" class="rw-close" aria-label="Close transition"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div></div>'+
      '<div class="rw-reticle" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'+
      '<div class="rw-copy"><p class="rw-cue">WORKSHOP ENTRY</p><div class="rw-line" aria-hidden="true">Opening the gallery.</div><p class="rw-service"></p></div>'+
      '<div class="rw-route" aria-hidden="true">'+['Focus','Transit','Arrival'].map(function (name,i) {
        return '<div><span><i></i></span><small>0'+(i+1)+' <b>'+name+'</b></small></div>';
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
    if (i===0) return 'scale('+(1+0.082*t+10.6*Math.pow(t,4.4))+')';
    if (i===1) return 'translate3d('+(-2.6*t)+'%, '+(1.6*t)+'%,0) scale('+(1+1.30*Math.pow(t,1.75))+')';
    if (i===2) return 'scale('+(1+1.06*Math.pow(t,1.31))+')';
    return 'scale('+(1.02+0.78*Math.pow(t,1.1))+')';
  }
  function frame(now) {
    var r = run;
    if (!r) return;
    if (motion.matches) {settle(true); return;}
    var t = Math.max(0,now-r.start), beat = 0;
    for (var i=0;i<cuts.length;i++) {
      var c = cuts[i], p = clamp((t-c.at)/(c.end-c.at));
      if (t >= c.at+40) beat=i;
      var a = t<c.at || t>=c.end ? 0 : ease((t-c.at)/c.inTime)*ease((c.end-t)/c.out);
      // At the windshield cut, hold the outgoing frame underneath the incoming one.
      if (i===2 && t>=cuts[3].at && t<c.end) a=1;
      var plate = shots[i];
      if (a>0) plate.style.transform=camera(i,p);
      plate.style.opacity=a;
    }
    if (beat!==r.beat) {
      r.beat=beat; work.dataset.shot=filenames[beat];
      r.cue.textContent=words[beat][0]; r.line.textContent=words[beat][1];
    }
    r.rules.forEach(function (bar,j) {bar.style.transform='scaleX('+clamp((t-marks[j])/(marks[j+1]-marks[j]))+')';});
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
        el.style.transformOrigin = cuts[i].origin; scene.appendChild(el);
      });
      r.start = performance.now(); r.frame=requestAnimationFrame(frame);
    });
  }
  window.RJWorkshop = { play:play, active:function () {return !!run;}, cancel:function () {settle(false,false);},
    warm:function () {if (capable()) prepared();} };
})();
