/* Layout dispatcher. The phone never runs the desktop loader or animation loop. */
(function () {
  'use strict';
  var mobile = document.documentElement.dataset.rjLayout === 'mobile';
  var mount = document.getElementById('rj-' + (mobile ? 'mobile' : 'desktop') + '-template');
  function script(url) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement('script'); el.src = url; el.async = false;
      el.onload = resolve; el.onerror = function () { reject(new Error(url)); }; document.body.appendChild(el);
    });
  }
  window.rjStyles.then(function () {
    mount.parentNode.replaceChild(mount.content, mount);
    if (mobile) return script('mobile.js?v=mobile-webm-1');
    return script('app.js').then(function () { return script('enhance.js?v=mobile-webm-1'); }).then(function () {
      var caseLink = location.hash.match(/^#work\/([a-e])$/i);
      if (caseLink && window.X) window.X.openCase(caseLink[1].toUpperCase().charCodeAt(0) - 65, document.getElementById('av-watch-intro'));
    });
  }).catch(function (e) {
    console.error(e);
    var loader = document.getElementById('loader'); if (loader) loader.hidden = true;
    document.getElementById('rj-boot-error').hidden = false;
  });
})();
