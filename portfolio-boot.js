/* Layout dispatcher. The phone never runs the desktop loader or animation loop. */
(function () {
  'use strict';
  var root = document.documentElement;
  var mobile = root.dataset.rjLayout === 'mobile';
  var revision = '?v=' + root.dataset.rjRelease;
  var mount = document.getElementById('rj-' + (mobile ? 'mobile' : 'desktop') + '-template');
  function script(url) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement('script'); el.src = url; el.async = false;
      el.onload = resolve; el.onerror = function () { reject(new Error(url)); }; document.body.appendChild(el);
    });
  }
  window.rjStyles.then(function () {
    if (!window.CONFIG || !window.RJIntro || !window.RJCases || !window.RJGallery || !window.RJWorkshop) throw new Error('A required portfolio script is missing');
    mount.parentNode.replaceChild(mount.content, mount);
    window.RJIntro.labelDuration(document);
    if (mobile) return script('mobile.js' + revision);
    return script('app.js').then(function () { return script('enhance.js' + revision); }).then(function () {
      var caseLink = location.hash.match(/^#work\/([a-e])$/i);
      if (caseLink && window.X) window.X.openCase(caseLink[1].toUpperCase().charCodeAt(0) - 65, document.getElementById('av-watch-intro'));
    });
  }).catch(function (e) {
    console.error(e);
    var loader = document.getElementById('loader'); if (loader) loader.hidden = true;
    document.getElementById('rj-boot-error').hidden = false;
  });
})();
