/* Shared A–E boards, supplied campaign imagery, and original drawings. */
(function () {
  "use strict";
  var DW = {};
  function dH(x1, x2, y, lab) {
    return '<g class="d"><line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"/>' +
      '<line x1="' + x1 + '" y1="' + (y - 6) + '" x2="' + x1 + '" y2="' + (y + 6) + '"/>' +
      '<line x1="' + x2 + '" y1="' + (y - 6) + '" x2="' + x2 + '" y2="' + (y + 6) + '"/>' +
      '<text x="' + ((x1 + x2) / 2) + '" y="' + (y - 7) + '" text-anchor="middle">' + lab + "</text></g>";
  }
  function dV(y1, y2, x, lab) {
    return '<g class="d"><line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '"/>' +
      '<line x1="' + (x - 6) + '" y1="' + y1 + '" x2="' + (x + 6) + '" y2="' + y1 + '"/>' +
      '<line x1="' + (x - 6) + '" y1="' + y2 + '" x2="' + (x + 6) + '" y2="' + y2 + '"/>' +
      '<text x="' + (x - 8) + '" y="' + ((y1 + y2) / 2) + '" text-anchor="end">' + lab + "</text></g>";
  }
  function xwrap(inner, title) {
    return '<svg class="xd" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid meet">' +
      '<rect class="p" x="6" y="6" width="628" height="388" style="--dl:2000"/>' + inner +
      '<text class="tb" x="16" y="384">' + title + "</text></svg>";
  }
  DW.portal = function () {
    return xwrap(
      '<line class="p g" x1="40" y1="330" x2="600" y2="330" style="--dl:600"/>' +
      '<g class="h">' + [60, 120, 180, 240, 300, 360, 420, 480, 540].map(function (x) {
        return '<line x1="' + x + '" y1="330" x2="' + (x - 10) + '" y2="342"/>'; }).join("") + "</g>" +
      '<path class="p" d="M140 330 V170" style="--dl:200"/><path class="p" d="M500 330 V170" style="--dl:200"/>' +
      '<path class="p" d="M140 170 Q320 58 500 170" style="--dl:420"/>' +
      '<path class="p r" d="M126 176 Q320 44 514 176" style="--dl:440"/>' +
      '<line class="p c" x1="320" y1="36" x2="320" y2="344" style="--dl:300"/>' +
      '<circle class="n" cx="140" cy="170" r="3"/><circle class="n" cx="500" cy="170" r="3"/>' +
      dH(140, 500, 362, "6 400") + dV(114, 170, 566, "1 200") +
      '<g class="d"><line x1="430" y1="96" x2="520" y2="70"/><text x="524" y="68">Fascia band 900</text></g>' +
      '<text class="t" x="140" y="352">SPRING LINE</text>',
      "DRG A-201 · PORTAL ELEVATION · 1:50 · DRAWN RS");
  };
  DW.portalGA = function () {
    return xwrap(
      '<line class="p g" x1="60" y1="340" x2="600" y2="340" style="--dl:600"/>' +
      '<g class="h">' + [80, 140, 200, 260, 320, 380, 440, 500, 560].map(function (x) {
        return '<line x1="' + x + '" y1="340" x2="' + (x - 10) + '" y2="352"/>'; }).join("") + "</g>" +
      '<rect class="p" x="292" y="328" width="76" height="12" style="--dl:120"/>' +
      '<circle class="n" cx="304" cy="334" r="3"/><circle class="n" cx="356" cy="334" r="3"/>' +
      '<path class="p" d="M326 328 V120 M334 328 V120" style="--dl:300"/>' +
      '<path class="p" d="M330 120 H500 M330 160 H500" style="--dl:260"/>' +
      '<path class="p" d="M340 160 L370 120 L400 160 L430 120 L460 160 L490 120" style="--dl:340"/>' +
      '<rect class="p r" x="498" y="96" width="14" height="140" style="--dl:200"/>' +
      '<line class="p" x1="512" y1="104" x2="512" y2="228" style="--dl:140"/>' +
      dV(120, 160, 262, "400") + dH(330, 500, 84, "PROJ 450") +
      '<g class="d"><line x1="300" y1="334" x2="200" y2="300"/><text x="196" y="298" text-anchor="end">12 PL base · M12 ×8</text></g>' +
      '<g class="d"><line x1="505" y1="150" x2="548" y2="178"/><text x="622" y="182" text-anchor="end">ACM 3 on 20×20</text></g>',
      "DRG A-202 · PORTAL SECTION · 1:20 · ISSUED FOR FABRICATION");
  };
  DW.ratio = function () {
    var g = "", x;
    for (x = 120; x < 560; x += 40) g += '<line class="c" x1="' + x + '" y1="90" x2="' + x + '" y2="330"/>';
    return xwrap(
      '<rect class="p" x="80" y="90" width="480" height="240" style="--dl:900"/>' +
      '<rect class="p r" x="80" y="90" width="480" height="60" style="--dl:500"/>' + g +
      '<rect class="p" x="80" y="90" width="22" height="240" style="--dl:200"/>' +
      '<rect class="p" x="538" y="90" width="22" height="240" style="--dl:200"/>' +
      '<line class="p g" x1="40" y1="330" x2="600" y2="330" style="--dl:400"/>' +
      dH(80, 560, 362, "SHOPFRONT 12 000 TYP") + dH(80, 120, 72, "MOD 300") + dV(90, 150, 596, "900") +
      '<text class="t" x="92" y="126">SIGN BAND — ONE RATIO, ANY WIDTH</text>' +
      '<g class="d"><line x1="320" y1="210" x2="400" y2="250"/><text x="404" y="254">Pilaster module locks the grid</text></g>',
      "DRG B-101 · ROLLOUT RATIO STUDY · NTS · 15 SECTORS");
  };
  DW.grid = function () {
    var g = "", x;
    for (x = 160; x <= 480; x += 40) g += '<line class="c" x1="' + x + '" y1="110" x2="' + x + '" y2="290"/>';
    return xwrap(g +
      '<rect class="c" x="140" y="100" width="360" height="200"/>' +
      '<circle class="p" cx="280" cy="200" r="60" style="--dl:380"/>' +
      '<circle class="p" cx="360" cy="200" r="60" style="--dl:380"/>' +
      '<circle class="p r" cx="280" cy="200" r="34" style="--dl:220"/>' +
      '<circle class="p r" cx="360" cy="200" r="34" style="--dl:220"/>' +
      '<line class="c" x1="280" y1="120" x2="280" y2="280"/><line class="c" x1="200" y1="200" x2="440" y2="200"/>' +
      '<circle class="n" cx="280" cy="200" r="3"/><circle class="n" cx="360" cy="200" r="3"/>' +
      '<g class="d"><line x1="280" y1="200" x2="238" y2="158"/><text x="234" y="154" text-anchor="end">R 60</text></g>' +
      '<g class="d"><line x1="360" y1="200" x2="392" y2="238"/><text x="396" y="246">R 34</text></g>' +
      '<text class="t" x="140" y="322">CLEAR SPACE = 1 × R · MIN REPRO 12 MM</text>',
      "DRG C-101 · MARK CONSTRUCTION GRID · NTS");
  };
  DW.toolpath = function () {
    return xwrap(
      '<path class="p" d="M160 120 H440 A20 20 0 0 1 460 140 V260 H360 V220 H280 V260 H160 A20 20 0 0 1 140 240 V140 A20 20 0 0 1 160 120 Z" style="--dl:1200"/>' +
      '<path class="p r" d="M152 106 H448 A34 34 0 0 1 474 140 V274 H346 V234 H294 V274 H152 A34 34 0 0 1 126 240 V140 A34 34 0 0 1 152 106 Z" style="--dl:1300"/>' +
      [[160, 120], [440, 120], [460, 140], [460, 260], [360, 260], [360, 220], [280, 220], [280, 260], [160, 260], [140, 240], [140, 140]].map(function (n) {
        return '<circle class="n" cx="' + n[0] + '" cy="' + n[1] + '" r="2.6"/>'; }).join("") +
      '<path class="p r" d="M460 200 q26 6 20 30" style="--dl:80"/>' +
      '<g class="d"><line x1="480" y1="230" x2="524" y2="248"/><text x="622" y="252" text-anchor="end">Lead-in, off edge</text></g>' +
      '<g class="d"><line x1="300" y1="106" x2="300" y2="70"/><text x="304" y="66">Offset 3 mm radial</text></g>' +
      dH(140, 460, 330, "2 400 SHEET") +
      '<text class="t" x="140" y="356">NODES 206 · WAS 416 · TABS 0.5</text>',
      "DRG D-301 · CNC TOOLPATH · SCALE 1:10 · ONE SETUP");
  };
  DW.section = function () {
    var leds = "", x;
    for (x = 160; x <= 480; x += 64) leds += '<circle class="n r" cx="' + x + '" cy="230" r="4"/>' +
      '<line class="c" x1="' + x + '" y1="226" x2="' + (x - 14) + '" y2="128"/><line class="c" x1="' + x + '" y1="226" x2="' + (x + 14) + '" y2="128"/>';
    return xwrap(
      '<path class="p" d="M120 100 V320 M520 100 V320" style="--dl:400"/>' +
      '<line class="p" x1="120" y1="120" x2="520" y2="120" style="--dl:400"/>' +
      '<line class="p r" x1="120" y1="170" x2="520" y2="170" style="--dl:400"/>' + leds +
      '<rect class="p" x="120" y="280" width="400" height="40" style="--dl:500"/>' +
      '<rect class="p" x="440" y="286" width="70" height="28" style="--dl:120"/>' +
      dV(120, 170, 566, "110") + dV(170, 230, 566, "60") + dH(160, 224, 264, "PITCH 60") +
      '<g class="d"><line x1="470" y1="300" x2="534" y2="274"/><text x="622" y="270" text-anchor="end">PSU · 78% load</text></g>' +
      '<g class="d"><line x1="200" y1="120" x2="120" y2="70"/><text x="116" y="66" text-anchor="end">Face, backlit ACM</text></g>' +
      '<text class="t" x="120" y="352">RETURN 140 · IP65 · 6500 K</text>',
      "DRG E-401 · LIGHTBOX SECTION · 1:5 · 350 cd/m²");
  };

  var CASES = [
    { key: "A", title: "Advertising", tech: "Event design", client: "C21 Mall · Indore",
      stages: [

        { n: "Concept", kind: "draw", draw: "portal",
          cap: "One portal, one ratio. The arch is drawn to the atrium real 6 400 mm span, so nothing gets adjusted on site at two in the morning.",
          meta: ["span 6 400", "rise 1 200", "1 ratio"] },
        { n: "Working drawing", kind: "draw", draw: "portalGA",
          cap: "GA and section issued for fabrication: truss centres, base plates, anchor count, cable route, and the fascia module the vinyl is cut to.",
          meta: ["SHS 40×40", "12 PL base", "M12 ×8"] },
        { n: "Production design", kind: "sheet",
          doc: "CUT LIST · REV 2",
          head: ["Panel", "Size mm", "Material", "Finish", "Kit"],
          rows: [["P-01", "2 400 × 900", "ACM 3", "vinyl + backlit", "01"],
                 ["P-02", "2 400 × 900", "ACM 3", "vinyl + backlit", "02"],
                 ["P-03", "1 800 × 900", "ACM 3", "vinyl", "03"],
                 ["P-04 … 13", "1 800 × 900", "ACM 3", "vinyl", "04–13"],
                 ["P-14", "2 400 × 900", "ACM 3", "vinyl + backlit", "14"]],
          cap: "Cut list and panel schedule. Every fascia numbered, sized and sequenced to the lift order — the kit list is the install plan.",
          meta: ["14 panels", "ACM 3 mm", "seq 01→14"] },

      ] },
    { key: "B", title: "Branding", tech: "National retail rollout", client: "Xiaomi · Nokia · SBI · Havells · Pantaloons",
      stages: [
        { n: "Ratio study", kind: "draw", draw: "ratio",
          cap: "One ratio drawing: sign band, pilaster and module locked to a grid that survives any shopfront width in the chain.",
          meta: ["module 300", "band 900", "15 sectors"] },

        { n: "Rollout kit", kind: "sheet",
          doc: "ROLLOUT KIT · REV 4",
          head: ["Sector", "Stores", "Fascia band", "Note"],
          rows: [["Mobile", "118", "900", "6 width bands"],
                 ["Banking", "64", "900", "stone fixings"],
                 ["Electrical", "52", "750", "colonnade trim"],
                 ["Apparel", "41", "900", "double height"],
                 ["Others", "30+", "600–900", "kit covers all"]],
          cap: "Widths banded so any store falls into one of six fascia sizes. No bespoke drawing after the pilot — that is what makes 300 stores one job.",
          meta: ["300+ stores", "6 sizes", "15 sectors"] },

        { n: "Audit", kind: "sheet",
          doc: "NIGHT AUDIT · 1 PAGE",
          head: ["Check", "Method", "Result"],
          rows: [["Flatness", "straight edge 1200", "pass · 1.2 mm max"],
                 ["Sealant line", "visual, 1 m", "pass"],
                 ["Lamp-out", "night walk", "0 of 212"],
                 ["Colour", "meter, face", "ΔE 2.4"],
                 ["Fixings", "torque spot check", "pass"]],
          cap: "Night audit at store 212. The audit sheet is one page long and it never changed in three years of rollout.",
          meta: ["store 212/300", "1 page", "0 lamp-out"] },

      ] },
    { key: "C", title: "Creative", tech: "Startup identity", client: "150+ identities built",
      stages: [

        { n: "Construction", kind: "draw", draw: "grid",
          cap: "The survivor put on a construction grid: circles, centres and a clear-space rule, drawn so any vendor can rebuild it without me.",
          meta: ["R 60 / R 34", "clear space 1×R"] },
        { n: "Reproduction", kind: "sheet",
          doc: "REPRO LADDER · 12 MM FLOOR",
          head: ["Test", "Size", "Result"],
          rows: [["Emboss, blind", "12 mm", "pass"],
                 ["Single colour", "12 mm", "pass"],
                 ["Reverse on ACM", "12 mm", "pass"],
                 ["Photocopy ×3", "12 mm", "pass"],
                 ["Favicon", "16 px", "pass"]],
          cap: "The reproduction ladder. If it fails at 12 mm it is not a mark, it is a picture.",
          meta: ["12 mm min", "5 tests", "0 fails"] },
        { n: "Production files", kind: "sheet",
          doc: "DAY-ONE KIT · v1.0",
          head: ["File", "Content"],
          rows: [["AI / EPS", "mark + grid, outlined"],
                 ["PDF/X-4", "cut path + 3 mm bleed"],
                 ["SVG", "screen master"],
                 ["PNG", "raster master, 4 sizes"]],
          cap: "Day-one kit: the mark, the grid, the cut path and the colours — outlined, named and versioned so the first print is the right print.",
          meta: ["4 files", "v1.0", "day one"] },

      ] },
    { key: "D", title: "Designing", tech: "Architectural CNC", client: "±0.5 mm over 2400 mm",
      stages: [
        { n: "Artwork in", kind: "sheet",
          doc: "INTAKE LOG · BEFORE REDRAW",
          head: ["Received", "Issue"],
          rows: [["Client PDF", "RGB, not CMYK-safe"],
                 ["Paths", "open, 416 nodes"],
                 ["Outlines", "missing"],
                 ["Scale", "stretched 4%"]],
          cap: "What arrives is never what a router can cut. The log starts with everything that was wrong, in writing, before a line is redrawn.",
          meta: ["416 nodes", "0 outlines"] },
        { n: "Geometry redraw", kind: "draw", draw: "toolpath",
          cap: "Redrawn as geometry: open paths closed, nodes halved, 3 mm radial offset applied, lead-ins placed off the finished edge.",
          meta: ["206 nodes", "offset 3", "lead-ins 14"] },
        { n: "Tooling", kind: "sheet",
          doc: "TOOLING · TAPED TO THE MACHINE",
          head: ["Param", "Value"],
          rows: [["Bit", "⌀6 · 3 flute"],
                 ["Feed", "1 800 mm/min"],
                 ["Spindle", "18 000 rpm"],
                 ["Setups", "1"],
                 ["Tabs", "0.5 mm"]],
          cap: "One setup, one bit, one sheet. The tooling sheet is printed and taped to the machine — because the machine does not read emails.",
          meta: ["⌀6 bit", "1 setup"] },

      ] },
    { key: "E", title: "Execution", tech: "Digital–Physical integration", client: "350 cd/m² · 6500 K · ΔE ≤ 3.0",
      stages: [
        { n: "Luminance study", kind: "draw", draw: "section",
          cap: "Section through the box: LED pitch, diffuser distance and return depth calculated so the face reads even at four metres — no dots, no hotspots.",
          meta: ["pitch 60", "diffuser 110"] },
        { n: "Specification", kind: "sheet",
          doc: "SPEC vs MEASURED · FACE, NIGHT",
          head: ["Param", "Target", "Measured"],
          rows: [["Luminance", "350 cd/m²", "352"],
                 ["CCT", "6500 K", "6480 K"],
                 ["Colour diff", "ΔE ≤ 3.0", "2.1"],
                 ["Ingress", "IP65", "IP65"],
                 ["PSU load", "≤ 80%", "78%"]],
          cap: "The spec is a contract with the client eye. Measured on the face at night, not promised in a mail.",
          meta: ["352 cd/m²", "ΔE 2.1"] },


        { n: "Calibration", kind: "sheet",
          doc: "CALIBRATION · 10 PATCHES",
          head: ["Patch", "Screen", "Fascia", "ΔE"],
          rows: [["01 white", "352", "350", "1.8"],
                 ["04 red", "—", "—", "2.6"],
                 ["07 skin", "—", "—", "2.2"],
                 ["09 grey 50", "—", "—", "1.6"],
                 ["10 black", "0.4", "0.5", "1.1"]],
          cap: "Screen calibrated to the fascia, not to the room: ten patches, meter on the face, at night, with the mall lights as they will be.",
          meta: ["10 patches", "ΔE 2.1"] },

      ] }
  ];

  var CAMP = {"A": [{"n": "Site Recce & Measurement", "tag": "CAMPAIGN VISUAL", "cap": "Site Recce & Measurement", "img": "media/camp/a01.webp"}, {"n": "Print Artwork Processing", "tag": "PRODUCTION FILE", "cap": "Print Artwork Processing", "img": "media/camp/a02.webp"}, {"n": "CNC Cutting File", "tag": "PRODUCTION FILE", "cap": "CNC Cutting File", "img": "media/camp/a03.webp"}, {"n": "Approval — Site Before", "tag": "CAMPAIGN VISUAL", "cap": "Approval — Site Before", "img": "media/camp/a04.webp"}, {"n": "Approval — Adaptation After (Day)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Day)", "img": "media/camp/a05.webp"}, {"n": "Approval — Adaptation After (Night)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Night)", "img": "media/camp/a06.webp"}, {"n": "Workshop Production & Fabrication", "tag": "CAMPAIGN VISUAL", "cap": "Workshop Production & Fabrication", "img": "media/camp/a07.webp"}, {"n": "Overnight Site Installation", "tag": "CAMPAIGN VISUAL", "cap": "Overnight Site Installation", "img": "media/camp/a08.webp"}, {"n": "Final Execution — Portal, Morning", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Portal, Morning", "img": "media/camp/a09.webp"}, {"n": "Final Execution — Stand & Stage", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Stand & Stage", "img": "media/camp/a10.webp"}], "B": [{"n": "From artwork file to finished in-shop branding", "tag": "CAMPAIGN · ART", "cap": "From artwork file to finished in-shop branding — Retail graphics, file se production tak", "img": "media/camp/b11.webp"}, {"n": "From artwork file to finished in-shop branding", "tag": "CAMPAIGN · ART", "cap": "From artwork file to finished in-shop branding — Sheet acrylic se 3D / embossed effect letters kaise bante hain", "img": "media/camp/b12.webp"}, {"n": "Site Recce — Shopfront Measurement", "tag": "CAMPAIGN VISUAL", "cap": "Site Recce — Shopfront Measurement", "img": "media/camp/b13.webp"}, {"n": "Master Ratio Print Processing", "tag": "PRODUCTION FILE", "cap": "Master Ratio Print Processing", "img": "media/camp/b14.webp"}, {"n": "CNC ACP Fascia Cutting File", "tag": "PRODUCTION FILE", "cap": "CNC ACP Fascia Cutting File", "img": "media/camp/b15.webp"}, {"n": "Approval — Shopfront Before", "tag": "CAMPAIGN VISUAL", "cap": "Approval — Shopfront Before", "img": "media/camp/b16.webp"}, {"n": "Approval — Adaptation After (Day)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Day)", "img": "media/camp/b17.webp"}, {"n": "Approval — Adaptation After (Night)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Night)", "img": "media/camp/b18.webp"}, {"n": "Production — Batch Fabrication", "tag": "CAMPAIGN VISUAL", "cap": "Production — Batch Fabrication", "img": "media/camp/b19.webp"}, {"n": "Site — Shopfront Installation", "tag": "CAMPAIGN VISUAL", "cap": "Site — Shopfront Installation", "img": "media/camp/b20.webp"}, {"n": "Final Execution — Flagship Store Live", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Flagship Store Live", "img": "media/camp/b21.webp"}, {"n": "Final Execution — Multi-Format Rollout", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Multi-Format Rollout", "img": "media/camp/b22.webp"}], "C": [{"n": "Site Recce — Studio Measurement", "tag": "CAMPAIGN VISUAL", "cap": "Site Recce — Studio Measurement", "img": "media/camp/c23.webp"}, {"n": "Construction Grid Print Processing", "tag": "PRODUCTION FILE", "cap": "Construction Grid Print Processing", "img": "media/camp/c24.webp"}, {"n": "Die-Cut / Laser Cutting File", "tag": "PRODUCTION FILE", "cap": "Die-Cut / Laser Cutting File", "img": "media/camp/c25.webp"}, {"n": "Approval — Studio Before", "tag": "CAMPAIGN VISUAL", "cap": "Approval — Studio Before", "img": "media/camp/c26.webp"}, {"n": "Approval — Adaptation After (Day)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Day)", "img": "media/camp/c27.webp"}, {"n": "Approval — Adaptation After (Night)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Night)", "img": "media/camp/c28.webp"}, {"n": "Production — Print & Laser Packaging", "tag": "CAMPAIGN VISUAL", "cap": "Production — Print & Laser Packaging", "img": "media/camp/c29.webp"}, {"n": "Site — Studio Installation", "tag": "CAMPAIGN VISUAL", "cap": "Site — Studio Installation", "img": "media/camp/c30.webp"}, {"n": "Final Execution — Studio Day-One Live", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Studio Day-One Live", "img": "media/camp/c31.webp"}, {"n": "Final Execution — Day-One Identity System", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Day-One Identity System", "img": "media/camp/c32.webp"}], "D": [{"n": "Site Recce — Elevation Measurement", "tag": "CAMPAIGN VISUAL", "cap": "Site Recce — Elevation Measurement", "img": "media/camp/d33.webp"}, {"n": "Vector Geometry Print Proofing", "tag": "PRODUCTION FILE", "cap": "Vector Geometry Print Proofing", "img": "media/camp/d34.webp"}, {"n": "CNC Router Toolpath File", "tag": "PRODUCTION FILE", "cap": "CNC Router Toolpath File", "img": "media/camp/d35.webp"}, {"n": "Approval — Wall Before", "tag": "CAMPAIGN VISUAL", "cap": "Approval — Wall Before", "img": "media/camp/d36.webp"}, {"n": "Approval — Adaptation After (Day)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Day)", "img": "media/camp/d37.webp"}, {"n": "Approval — Adaptation After (Night)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Night)", "img": "media/camp/d38.webp"}, {"n": "Production — CNC Router Machining", "tag": "CAMPAIGN VISUAL", "cap": "Production — CNC Router Machining", "img": "media/camp/d39.webp"}, {"n": "Site — CNC Panel Installation", "tag": "CAMPAIGN VISUAL", "cap": "Site — CNC Panel Installation", "img": "media/camp/d40.webp"}, {"n": "Final Execution — Atrium CNC Live", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Atrium CNC Live", "img": "media/camp/d41.webp"}, {"n": "Final Execution — Macro Tolerance Detail", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Macro Tolerance Detail", "img": "media/camp/d42.webp"}], "E": [{"n": "Execution Guideline — Site Workflow", "tag": "GUIDELINE · PRESENTATION", "cap": "Execution Guideline Presentation — End-to-end 4-stage turnkey workflow from laser survey & load audit to night handover.", "img": "media/camp/e_guide_1.webp"}, {"n": "Execution Guideline — Wall Assembly", "tag": "GUIDELINE · PRESENTATION", "cap": "Execution Guideline Presentation — Exploded assembly showing MS sub-frame, IP65 LED matrix, 110mm diffuser & zero-bezel P1.8 lock.", "img": "media/camp/e_guide_2.webp"}, {"n": "Site Recce & Measurement", "tag": "CAMPAIGN VISUAL", "cap": "Site Recce & Measurement", "img": "media/camp/e43.webp"}, {"n": "Digital Print & Sync Processing", "tag": "PRODUCTION FILE", "cap": "Digital Print & Sync Processing", "img": "media/camp/e44.webp"}, {"n": "CNC Bezel Fabrication File", "tag": "CAMPAIGN · ART", "cap": "CNC Bezel Fabrication File", "img": "media/camp/e45.webp"}, {"n": "Approval — Site Before", "tag": "CAMPAIGN VISUAL", "cap": "Approval — Site Before", "img": "media/camp/e46.webp"}, {"n": "Approval — Adaptation After (Day)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Day)", "img": "media/camp/e47.webp"}, {"n": "Approval — Adaptation After (Night)", "tag": "PROPOSED · RENDER", "cap": "Approval — Adaptation After (Night)", "img": "media/camp/e48.webp"}, {"n": "Production — Backlit & Screen Integration", "tag": "CAMPAIGN VISUAL", "cap": "Production — Backlit & Screen Integration", "img": "media/camp/e49.webp"}, {"n": "Site — Installation & Commissioning", "tag": "CAMPAIGN VISUAL", "cap": "Site — Installation & Commissioning", "img": "media/camp/e50.webp"}, {"n": "Final Execution — Continuous Surface Live", "tag": "CAMPAIGN VISUAL", "cap": "Final Execution — Continuous Surface Live", "img": "media/camp/e51.webp"}, {"n": "ArtViSiON — Production Design to Execution", "tag": "CAMPAIGN · ART", "cap": "ArtViSiON — Production Design to Execution", "img": "media/camp/e52.webp"}]};
  CASES.forEach(function (c) {
    var camp = CAMP[c.key]; if (!camp) return;
    var drawn = c.stages.filter(function (st) { return st.kind !== "photo"; });
    c.stages = camp.slice(0, 1).concat(drawn, camp.slice(1).map(function (b) {
      return { n: b.n, kind: "photo", img: b.img, tag: b.tag, cap: b.cap, meta: [] };
    }));
    c.stages[0] = { n: camp[0].n, kind: "photo", img: camp[0].img, tag: camp[0].tag,
                    cap: camp[0].cap, meta: [] };
  });
  window.RJCases = { cases: CASES, drawings: DW };
})();
