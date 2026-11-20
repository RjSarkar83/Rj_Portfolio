/* ArtViSiON — five service plates. One inline SVG vocabulary for both layouts. */
(function () {
  'use strict';
  var plates = {
    // A — a braced event portal, raised stage and lit header.
    A:
      '<path class="av-datum" d="M88 38v-6m144 0v6M88 35h144M37 135h246"/>' +
      '<path class="av-base" d="M67 119h186l17 8v9H50v-9z"/>' +
      '<path class="av-detail" d="M51 127h218M60 137h200M79 130v5m162-5v5"/>' +
      '<path class="av-fill" d="M73 119V59l16-13h142l16 13v60h-18V72H91v47z"/>' +
      '<path class="av-detail" d="M73 60l18 13-18 13 18 13-18 13 18 7m156-59-18 13 18 13-18 13 18 13-18 7M89 46v12h142V46"/>' +
      '<path class="av-ink av-trace" pathLength="1" d="M73 119V59l16-13h142l16 13v60m-18 0V72H91v47"/>' +
      '<g class="av-piece av-2 av-up"><path class="av-wash" d="M118 73h14l11 46h-37zm70 0h14l12 46h-37z"/><path class="av-panel" d="M106 53h108v14H106z"/><path class="av-hot" d="M123 60h74"/><circle class="av-dot" cx="114" cy="60" r="2"/></g>' +
      '<path class="av-detail" d="M105 119h110m-91 0v5m72-5v5"/>',
    // B — differently sized bays built around the same fascia datum.
    B:
      '<path class="av-datum" d="M34 66h252M47 54V43m53 0v11m14 0V43m80 0v11m14 0V43m65 0v11M47 48h53m14 0h80m14 0h65"/>' +
      '<path class="av-fill" d="M42 64h63v62H42zM109 64h90v62h-90zM203 64h75v62h-75z"/>' +
      '<path class="av-ink av-trace" pathLength="1" d="M42 124V64h63v60m4 0V64h90v60m4 0V64h75v60M37 126h246"/>' +
      '<path class="av-detail" d="M49 88h49v30H49zm68 0h74v30h-74zm94 0h59v30h-59zM69 88v30m9-30v30m63-30v30m26-30v30m68-30v30m12-30v30M49 99h19m11 0h19m19 0h24m26 0h24m20 0h24m13 0h22"/>' +
      '<g class="av-piece av-1"><path class="av-panel" d="M47 69h53v13H47z"/><path class="av-hot" d="M59 75.5h29"/><circle class="av-dot" cx="53" cy="75.5" r="1.7"/></g>' +
      '<g class="av-piece av-2"><path class="av-panel" d="M114 69h80v13h-80z"/><path class="av-hot" d="M138 75.5h35"/><circle class="av-dot" cx="131" cy="75.5" r="1.7"/></g>' +
      '<g class="av-piece av-3"><path class="av-panel" d="M208 69h65v13h-65z"/><path class="av-hot" d="M227 75.5h32"/><circle class="av-dot" cx="220" cy="75.5" r="1.7"/></g>',
    // C — construction grid, abstract mark, and the file it ships on.
    C:
      '<path class="av-detail" d="M78 38h100v100H78zM78 63h100M78 88h100M78 113h100M103 38v100m25-100v100m25-100v100"/>' +
      '<path class="av-datum" d="M74 34l108 108m0-108L74 142m54-114v120M67 88h199M65 38h8m-8 100h8m-4-100v100"/>' +
      '<circle class="av-datum" cx="128" cy="88" r="50"/>' +
      '<g class="av-piece av-1 av-up"><path class="av-solid" d="M128 51l33 19v17l-33-19-33 19V70z"/></g>' +
      '<g class="av-piece av-2"><path class="av-rose" d="M128 108l33-19v17l-33 19-33-19V89z"/></g>' +
      '<path class="av-hot av-trace" pathLength="1" d="M95 87V70l33-19 33 19v17"/>' +
      '<g class="av-piece av-3 av-right"><path class="av-detail" d="M211 50h43l10 10v61h-53zM205 55h-6v72h60v-3"/><path class="av-fill" d="M211 50h43l10 10v61h-53z"/><path class="av-detail" d="M211 50h43l10 10v61h-53zM254 50v11h10M219 106h36m-36 6h21"/><path class="av-hot" d="m223 91 13-13 13 13"/><path class="av-detail" d="M223 83h26v16h-26z"/></g>',
    // D — tool touches down on the routed panel's offset contour.
    D:
      '<path class="av-fill" d="M78 125V68q82-62 164 0v57z"/>' +
      '<path class="av-detail" d="M104 85l12-12 12 12-12 12zm29-5 12-12 12 12-12 12zm30 0 12-12 12 12-12 12zm29 5 12-12 12 12-12 12zM116 109l14-13 14 13m2 0 14-13 14 13m2 0 14-13 14 13"/>' +
      '<path class="av-datum" d="M78 131v16m164-16v16M78 142h164m-168 4 8-8m156 8 8-8M57 69h13m-13 56h13m-8-56v56m98-72v73"/>' +
      '<path class="av-ink" d="M78 125V68q82-62 164 0v57z"/>' +
      '<path class="av-hot av-trace av-late" pathLength="1" d="M160 50q35 0 70 25v42H90V75q35-25 70-25z"/>' +
      '<g class="av-piece av-up av-1"><path class="av-panel" d="M152 24h16v15l-8 9-8-9z"/><path class="av-detail" d="M156 33h8m-10-9h12"/><circle class="av-dot" cx="160" cy="50" r="2.7"/></g>' +
      '<path class="av-detail" d="M74 129h172M94 111v5m132-5v5"/>',
    // E — one frame: diffused backlight balances the adjacent live screen.
    E:
      '<path class="av-datum" d="M62 136h198M62 130v12m198-12v12m-85-99v12m0 66v9"/>' +
      '<path class="av-base" d="M49 111V65l13-10h199l11 9v47l-11 9H62z"/>' +
      '<path class="av-fill" d="M62 62h198v52H62z"/>' +
      '<g class="av-piece av-1"><path class="av-fascia" d="M68 68h104v40H68z"/><path class="av-glint" d="M79 77h82m-82 22h82"/><path class="av-wash" d="M79 78h82v20H79z"/></g>' +
      '<g class="av-piece av-2 av-right"><path class="av-screen" d="M178 68h76v40h-76z"/><path class="av-detail" d="M184 78h64m-64 22h64m-55-22v22m15-22v22m15-22v22m15-22v22"/></g>' +
      '<path class="av-ink" d="M62 62h198v52H62zM175 62v52"/>' +
      '<path class="av-hot av-trace av-late" pathLength="1" d="M82 89h49l12-5 12 5h31l11-6 12 10 11-4h24"/>' +
      '<circle class="av-dot av-piece av-3" cx="175" cy="89" r="3"/>'
  };

  function draw(key) {
    var art = plates[key];
    if (!Object.prototype.hasOwnProperty.call(plates,key)) return '';
    // The execution drawing has a wider safe area for its flexible desktop slot.
    var wide = key === 'E';
    var crop = wide ? '32 42 256 104' : '0 0 320 180';
    var marks = wide ? 'M272 45h12v9M36 132v9h12m224 0h12v-9' : 'M286 24h12v11M22 145v11h12m252 0h12v-11M153 24h14m-14 132h14';
    return '<svg class="av-service-art' + (wide ? ' av-fit-wide' : '') + '" viewBox="' + crop + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' +
      '<path class="av-corners" d="' + marks + '"/>' + art + '</svg>';
  }

  // Desktop uses the existing scroll/installation cue. On the phone, draw the
  // plate once when a meaningful part of it is visible, not while offscreen.
  var observer;
  function watch(scope) {
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!observer) {
      observer = new IntersectionObserver(function (records) {
        records.forEach(function (r) {
          if (r.intersectionRatio < .3) return;
          var frame = r.target;
          observer.unobserve(frame);
          frame.classList.add('av-ink-in');
          // Leave the stable, finished drawing when revisiting the Work view.
          setTimeout(function () { frame.classList.remove('av-ink-in'); }, 1550);
        });
      }, {threshold:.3,rootMargin:'0px 0px -58px 0px'});
    }
    scope.querySelectorAll('.av-service-frame').forEach(function (frame) { observer.observe(frame); });
  }

  window.RJServicePlates = {draw:draw,watch:watch};
})();
