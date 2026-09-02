/* =========================================================================
   widgets.js — ภาพประกอบเชิงโต้ตอบทั้งหมดของเว็บ
   แต่ละหน้าเพียงวาง <div class="widget" id="w-xxx"></div> ไว้ในเนื้อหา
   ถ้าไม่มี id นั้นในหน้า widget ตัวนั้นจะถูกข้ามไปเอง
   ========================================================================= */
(function () {
  'use strict';

  var C = TV.C, d2r = TV.d2r, r2d = TV.r2d, nf = TV.nf, clamp = TV.clamp;
  var PI = Math.PI, TAU = TV.TAU;
  var sin = Math.sin, cos = Math.cos, tan = Math.tan;

  function degFmt(v) { return nf(v, 0) + '°'; }

  /* คืนรูป π เฉพาะเมื่อค่านั้นเป็นผลคูณของ π/12 จริง ๆ ไม่งั้นคืน null
     (ป้องกันการแสดง "π/3" ทั้งที่ค่าคือ 1.00 rad) */
  function exactPi(x) {
    var k = Math.round(x / (PI / 12));
    return Math.abs(x - k * PI / 12) < 1e-3 ? TV.radLabel(k * PI / 12) : null;
  }
  function quadrantOf(deg) {
    var t = ((deg % 360) + 360) % 360;
    if (t === 0 || t === 90 || t === 180 || t === 270) return '—';
    return t < 90 ? 'I' : t < 180 ? 'II' : t < 270 ? 'III' : 'IV';
  }
  function refAngle(deg) {
    var t = ((deg % 360) + 360) % 360;
    if (t <= 90) return t;
    if (t <= 180) return 180 - t;
    if (t <= 270) return t - 180;
    return 360 - t;
  }

  /* =====================================================================
     บทที่ 1 — สามเหลี่ยมมุมฉาก
     ===================================================================== */

  /* 1.1 สามเหลี่ยมคล้าย: อัตราส่วนไม่ขึ้นกับขนาด */
  TV.widget('#w-similar', {
    title: 'ทำไมอัตราส่วนถึงไม่ขึ้นกับขนาดสามเหลี่ยม',
    badge: 'ลากเลื่อนได้',
    desc: 'สามเหลี่ยมสามรูปนี้มีมุม θ เท่ากันทุกรูป ต่างกันแค่ขนาด — ลองเลื่อนมุมดูว่าอัตราส่วน ข้างตรงข้าม/ด้านตรงข้ามมุมฉาก ของทั้งสามรูปเปลี่ยนไปพร้อมกันหรือไม่',
    plot: { xmin: -0.3, xmax: 6.35, ymin: -0.8, ymax: 3.1, equal: true, ratio: 0.55, minH: 270, maxH: 380 },
    controls: [
      { type: 'range', key: 'th', label: 'มุม θ', min: 8, max: 78, step: 0.5, value: 35, fmt: degFmt }
    ],
    hint: 'ทั้งสามรูปเป็นสามเหลี่ยมคล้าย (similar triangles) — ด้านทุกคู่จึงเป็นสัดส่วนกัน อัตราส่วนของสองด้านในรูปเดียวกันจึงเท่ากันเสมอ นี่คือเหตุผลที่ sin θ เป็นฟังก์ชันของ θ อย่างเดียว',
    draw: function (p, s, api) {
      var th = d2r(s.th);
      var hyps = [1.05, 1.95, 2.85];
      var cols = ['#9ab8f6', '#4a7ce0', C.sin];
      var names = ['เล็ก', 'กลาง', 'ใหญ่'];
      p.grid(0.5, 0.5, '#f5f3ed');
      p.axes({ xStep: 1, yStep: 1, digits: 0, xLabel: false, yLabel: false });

      for (var i = hyps.length - 1; i >= 0; i--) {
        var h = hyps[i], bx = h * cos(th), by = h * sin(th);
        p.poly([[0, 0], [bx, 0], [bx, by]], {
          fill: i === 2 ? 'rgba(29,78,216,.06)' : 'rgba(29,78,216,.05)',
          color: cols[i], w: i === 2 ? 2.4 : 1.8
        });
        p.rightAngle(bx, 0, -1, 0, 0, 1, 9, C.faint);
        p.dot(bx, by, { fill: cols[i], r: 4.5 });
        p.text(bx / 2, by / 2, names[i], {
          dx: -10, dy: -10, align: 'right', color: cols[i], size: 11, bg: 'rgba(255,255,255,.85)'
        });
      }
      p.arc(0, 0, 0.42, 0, th, { fill: 'rgba(180,83,9,.13)', color: C.accent, w: 1.8 });
      p.text(0.55 * cos(th / 2), 0.55 * sin(th / 2), 'θ = ' + nf(s.th, 1) + '°', {
        dx: 26, align: 'left', color: C.accent, size: 12.5, bg: 'rgba(255,255,255,.9)'
      });

      /* แผงเปรียบเทียบอัตราส่วนทางขวา */
      var px = 3.55, py = 2.55, dy = -0.55;
      p.text(px, py + 0.42, 'อัตราส่วน  ด้านตรงข้าม ÷ ด้านตรงข้ามมุมฉาก', { align: 'left', color: C.soft, size: 11.5 });
      hyps.forEach(function (h, i) {
        var y = py + i * dy;
        p.poly([[px, y - 0.19], [px + 2.7, y - 0.19], [px + 2.7, y + 0.23], [px, y + 0.23]], {
          fill: i === 2 ? 'rgba(29,78,216,.06)' : 'rgba(0,0,0,.015)', color: '#eeece5', w: 1
        });
        p.text(px + 0.08, y, names[i], { align: 'left', color: cols[i], size: 11.5 });
        p.text(px + 0.72, y, nf(h * sin(th), 3) + ' ÷ ' + nf(h, 2) + '  =', { align: 'left', color: C.soft, size: 11.5, mono: true });
        p.text(px + 2.6, y, nf(sin(th), 4), { align: 'right', color: cols[i], size: 12.5, mono: true });
      });
      p.line(px, py + 2 * dy - 0.32, px + 2.7, py + 2 * dy - 0.32, { color: C.accent, w: 1.6 });
      p.text(px + 1.35, py + 2 * dy - 0.62, 'เท่ากันทั้งสามรูป  =  sin θ', { color: C.accent, size: 12.5 });

      api.stats({
        'θ': nf(s.th, 1) + '°',
        'sin θ': { v: nf(sin(th), 4), color: C.sin },
        'cos θ': { v: nf(cos(th), 4), color: C.cos },
        'tan θ': { v: nf(tan(th), 4), color: C.tan }
      });
    }
  });

  /* 1.2 นิยาม sin cos tan จากสามเหลี่ยมที่ลากได้ */
  TV.widget('#w-ratios', {
    title: 'นิยามของ sin, cos, tan',
    badge: 'ลากจุดได้',
    desc: 'ลากจุดสีม่วงเพื่อเปลี่ยนรูปสามเหลี่ยม สังเกตว่าด้านทั้งสามถูกเรียกชื่อ “เทียบกับมุม θ” เสมอ',
    plot: { xmin: -0.35, xmax: 3.6, ymin: -0.6, ymax: 3.4, equal: true, ratio: 0.8, minH: 300, maxH: 430 },
    controls: [
      { type: 'range', key: 'th', label: 'มุม θ', min: 5, max: 85, step: 0.5, value: 38, fmt: degFmt },
      { type: 'range', key: 'h', label: 'ความยาวด้านตรงข้ามมุมฉาก', min: 1, max: 3.2, step: 0.02, value: 2.6, fmt: function (v) { return nf(v, 2); } }
    ],
    hint: 'จำด้วย SOH–CAH–TOA : Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj',
    onPointer: function (p, s, wx, wy) {
      var d = Math.hypot(wx, wy);
      if (d < 0.25) return false;
      s.h = clamp(d, 1, 3.2);
      s.th = clamp(r2d(Math.atan2(Math.max(wy, 0.001), Math.max(wx, 0.001))), 5, 85);
      return true;
    },
    draw: function (p, s, api) {
      var th = d2r(s.th), adj = s.h * cos(th), opp = s.h * sin(th);
      p.grid(0.5, 0.5, '#f5f3ed');
      p.axes({ xStep: 1, yStep: 1, digits: 0 });

      p.poly([[0, 0], [adj, 0], [adj, opp]], { fill: 'rgba(124,58,237,.06)' });
      p.line(0, 0, adj, 0, { color: C.cos, w: 4.5 });
      p.line(adj, 0, adj, opp, { color: C.sin, w: 4.5 });
      p.line(0, 0, adj, opp, { color: C.hyp, w: 4.5 });
      p.rightAngle(adj, 0, -1, 0, 0, 1, 12, C.soft);
      p.arc(0, 0, 0.42, 0, th, { fill: 'rgba(180,83,9,.13)', color: C.accent, w: 1.8 });
      p.text(0, 0, 'θ', { dx: 58, dy: -16, color: C.accent, size: 15 });

      p.text(adj / 2, 0, 'ข้างเคียง ' + nf(adj, 2), { dy: 18, color: C.cos, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.text(adj, opp / 2, 'ข้างตรงข้าม ' + nf(opp, 2), { dx: 12, color: C.sin, size: 12, align: 'left', bg: 'rgba(255,255,255,.9)' });
      p.text(adj / 2, opp / 2, 'ด้านตรงข้ามมุมฉาก ' + nf(s.h, 2), { dx: -14, dy: -14, color: C.hyp, size: 12, align: 'right', bg: 'rgba(255,255,255,.9)' });

      p.dot(adj, opp, { fill: C.hyp, r: 8, halo: C.hyp });

      api.stats({
        'θ': nf(s.th, 1) + '°',
        'sin θ = opp/hyp': { v: nf(opp, 2) + '/' + nf(s.h, 2) + ' = ' + nf(sin(th), 4), color: C.sin },
        'cos θ = adj/hyp': { v: nf(adj, 2) + '/' + nf(s.h, 2) + ' = ' + nf(cos(th), 4), color: C.cos },
        'tan θ = opp/adj': { v: nf(opp, 2) + '/' + nf(adj, 2) + ' = ' + nf(tan(th), 4), color: C.tan }
      });
    }
  });

  /* ---------------------------------------------------------------------
     แผนภาพช่วยจำหกฟังก์ชัน
     กฎ: แต่ละมุมเกิดจากด้านสองด้าน → ให้อัตราส่วนสองแบบที่เป็นส่วนกลับกัน
         ลูกศรพุ่งทะลุด้านใด ด้านนั้นคือ "ตัวส่วน"
     --------------------------------------------------------------------- */
  /* from = ด้านตัวตั้ง (จุดเริ่มลูกศร) · to = ด้านตัวหาร (ลูกศรพุ่งทะลุออก)
     band = ส่วนโค้งวงในหรือวงนอก ทำให้ลูกศรสองเส้นที่มุมเดียวกันซ้อนกันโดยไม่ตัดกัน */
  var MN_ITEMS = [
    { grp: 'A',     key: 'cos',   col: C.cos, from: 'base', to: 'hyp',  band: 'in'  },
    { grp: 'A',     key: 'sec',   col: C.cos, from: 'hyp',  to: 'base', band: 'out' },
    { grp: 'top',   key: 'sin',   col: C.sin, from: 'vert', to: 'hyp',  band: 'in'  },
    { grp: 'top',   key: 'cosec', col: C.sin, from: 'hyp',  to: 'vert', band: 'out' },
    { grp: 'right', key: 'cot',   col: C.tan, from: 'base', to: 'vert', band: 'in'  },
    { grp: 'right', key: 'tan',   col: C.tan, from: 'vert', to: 'base', band: 'out' }
  ];

  var MN_GRPCOL = { A: C.cos, top: C.sin, right: C.tan };
  var MN_SIDES = { A: ['base', 'hyp'], top: ['hyp', 'vert'], right: ['base', 'vert'] };

  function drawMnemonic(p, o) {
    var W = o.W, H = o.H;
    var th = Math.atan2(H, W);
    var nrm = { hyp: [-sin(th), cos(th)], base: [0, -1], vert: [1, 0] };
    var sel = o.sel || 'all';
    var lit = function (g) { return sel === 'all' || sel === g; };
    var col = function (g, c) { return lit(g) ? c : '#dcd9d0'; };

    var L = Math.hypot(W, H);
    /* ส่วนโค้งทั้งหกวัดรัศมีจากจุดยอด โดยอิงด้านที่สั้นกว่าในสองด้านที่ประกอบมุมนั้น
       ค่าน้อย ๆ นี้ทำให้ทุกเส้นเกาะอยู่ชิดมุมเสมอ ไม่ว่าสามเหลี่ยมจะแบนหรือแคบ */
    var F_IN = 0.14, F_OUT = 0.30;
    var RAD = { A: Math.min(W, L), top: Math.min(L, H), right: Math.min(W, H) };
    var rad = function (g, band) { return (band === 'in' ? F_IN : F_OUT) * RAD[g]; };
    /* จุดยอด และมุมของด้านแต่ละด้านเมื่อมองออกไปจากจุดยอดนั้น */
    var VTX = { A: [0, 0], top: [W, H], right: [W, 0] };
    var ANG = {
      A:     { base: 0,      hyp: th },
      top:   { hyp: PI + th, vert: PI * 1.5 },
      right: { base: PI,     vert: PI * 0.5 }
    };

    p.setBounds({ xmin: -1.25, xmax: W + 1.95, ymin: -1.45, ymax: H + 1.0 });

    /* ตัวสามเหลี่ยม — ด้านที่ประกอบมุมที่เลือกจะถูกเน้น */
    var hi = MN_SIDES[sel] || [];
    var hc = MN_GRPCOL[sel];
    var sw = function (s) { return hi.indexOf(s) >= 0 ? 5 : 2.2; };
    var sc = function (s) { return hi.indexOf(s) >= 0 ? hc : '#4a4842'; };

    p.poly([[0, 0], [W, 0], [W, H]], { fill: 'rgba(0,0,0,.022)' });
    p.line(0, 0, W, 0, { color: sc('base'), w: sw('base') });
    p.line(W, 0, W, H, { color: sc('vert'), w: sw('vert') });
    p.line(0, 0, W, H, { color: sc('hyp'), w: sw('hyp') });

    /* จุดยอดทั้งสาม ระบายสีตามคู่ฟังก์ชันที่อยู่ตรงนั้น
       รัศมีเล็กกว่าส่วนโค้งวงในสุดเสมอ จะได้ไม่ถูกลูกศรพาดทับ */
    var rA = 0.60 * rad('A', 'in'), rT = 0.60 * rad('top', 'in');
    /* ป้ายมุม A วางกึ่งกลางระหว่างส่วนโค้งสองเส้นพอดี */
    var rMidA = (rad('A', 'in') + rad('A', 'out')) / 2;
    p.arc(0, 0, rA, 0, th, {
      fill: lit('A') ? 'rgba(194,65,12,.13)' : null, color: col('A', C.cos), w: lit('A') ? 2.2 : 1.4
    });
    p.text(rMidA * cos(th / 2), rMidA * sin(th / 2), 'A', { color: col('A', C.cos), size: 15, bg: 'rgba(255,255,255,.8)' });
    p.arc(W, H, rT, PI + th, PI * 1.5, {
      fill: lit('top') ? 'rgba(29,78,216,.13)' : null, color: col('top', C.sin), w: lit('top') ? 2.2 : 1.4
    });
    var rSq = clamp(p.sx * 0.52 * rad('right', 'in'), 6, 13);
    p.rightAngle(W, 0, -1, 0, 0, 1, rSq, col('right', C.tan));
    p.rightAngle(W, 0, -1, 0, 0, 1, rSq * 0.68, col('right', C.tan));
    if (o.topLab) {
      /* วางเยื้องขวาของจุดยอดบน ซึ่งเป็นที่ว่างเสมอไม่ว่าสามเหลี่ยมจะแบนหรือสูง
         (เหนือจุดยอดตรง ๆ จะชนหางลูกศร sin เมื่อสามเหลี่ยมแบนมาก) */
      p.text(W + 0.50, H + 0.14, o.topLab, {
        align: 'left', color: col('top', C.sin), size: 12, bg: 'rgba(255,255,255,.85)'
      });
    }

    /* ป้ายชื่อด้าน — adj กับ opp วางในรูป ส่วน hyp วางนอกรูป
       ทั้งสามอยู่ตรงกลางด้าน ซึ่งเป็นบริเวณที่ลูกศร (ซึ่งเกาะอยู่ตามมุม) ไปไม่ถึง */
    var lb = { color: '#6b6961', size: 12, bg: 'rgba(255,255,255,.85)' };
    p.text(W * 0.52, 0, o.sideLab.adj, Object.assign({ dy: -15 }, lb));
    p.text(W, H * 0.5, o.sideLab.opp, Object.assign({ dx: -13, align: 'right' }, lb));
    p.text(W * 0.5 + nrm.hyp[0] * 0.30, H * 0.5 + nrm.hyp[1] * 0.30, o.sideLab.hyp, lb);

    /* ลูกศรหกตัว — ส่วนโค้งอ้อมมุมจากด้านตัวตั้งไปยังด้านตัวหาร แล้วต่อด้วย
       เส้นตรงสั้น ๆ พุ่งตั้งฉากออกจากด้านตัวหาร (เส้นสัมผัสของส่วนโค้งตรงนั้น
       ตั้งฉากกับด้านพอดี รอยต่อจึงเรียบสนิท) */
    MN_ITEMS.forEach(function (it) {
      var V = VTX[it.grp], r = rad(it.grp, it.band), c = col(it.grp, it.col);
      var a0 = ANG[it.grp][it.from], a1 = ANG[it.grp][it.to];
      var S = [V[0] + r * cos(a0), V[1] + r * sin(a0)];
      var P = [V[0] + r * cos(a1), V[1] + r * sin(a1)];
      var n = nrm[it.to];
      /* หางของมุมฉากยื่นยาวกว่า ป้ายบนด้านเดียวกันจึงอยู่คนละแถวเสมอ */
      var ext = it.grp === 'right' ? 0.80 : 0.44;
      p.arc(V[0], V[1], r, a0, a1, { color: c, w: 2.2 });
      p.arrow(P[0], P[1], P[0] + n[0] * ext, P[1] + n[1] * ext, { color: c, w: 2.2, head: 9.5 });
      /* จุดกลมกำกับต้นทาง = ด้านที่เป็นตัวตั้ง */
      p.dot(S[0], S[1], { fill: c, r: 4.5, w: 2, ring: '#ffffff' });
      p.text(P[0] + n[0] * (ext + 0.42), P[1] + n[1] * (ext + 0.42), it.key + o.suffix, {
        color: c, size: 13, bg: 'rgba(255,255,255,.9)'
      });
    });
  }

  /* 1.3 แผนภาพช่วยจำ — แบบทั่วไป */
  TV.widget('#w-mnemonic', {
    title: 'แผนภาพช่วยจำทั้งหกฟังก์ชัน',
    badge: 'เลือกมุมดูได้',
    desc: 'อ่านลูกศรเป็นสูตรได้ทั้งเส้น — เริ่มที่จุดกลมบนด้านที่เป็น “ตัวเศษ” แล้วโค้งอ้อมมุมไปทะลุออกที่ด้านที่เป็น “ตัวส่วน”',
    plot: { equal: true, ratio: 0.56, minH: 300, maxH: 430, pad: 14 },
    controls: [
      {
        type: 'seg', key: 'sel', label: 'เน้นที่มุม',
        options: [['all', 'ทั้งหมด'], ['A', 'มุม A'], ['top', 'มุมยอด'], ['right', 'มุมฉาก']], value: 'all'
      },
      { type: 'range', key: 'th', label: 'มุม A', min: 15, max: 60, step: 1, value: 30, fmt: degFmt }
    ],
    hint: 'ที่มุมเดียวกันจะมีส่วนโค้งสองเส้นซ้อนกัน แต่กวาดสวนทางกัน นั่นคือคู่ส่วนกลับกันเสมอ: cos ↔ sec · sin ↔ cosec · tan ↔ cot',
    draw: function (p, s, api) {
      var th = d2r(s.th), Lh = 3.5;
      drawMnemonic(p, {
        W: Lh * cos(th), H: Lh * sin(th), sel: s.sel, suffix: ' A',
        sideLab: { adj: 'adj', opp: 'opp', hyp: 'hyp' },
        topLab: '90° − A'
      });
      api.stats({
        'cos A = adj/hyp': { v: nf(cos(th), 3), color: C.cos },
        'sec A = hyp/adj': { v: nf(1 / cos(th), 3), color: C.cos },
        'sin A = opp/hyp': { v: nf(sin(th), 3), color: C.sin },
        'cosec A = hyp/opp': { v: nf(1 / sin(th), 3), color: C.sin },
        'tan A = opp/adj': { v: nf(tan(th), 3), color: C.tan },
        'cot A = adj/opp': { v: nf(1 / tan(th), 3), color: C.tan }
      });
    }
  });

  /* 1.4 แผนภาพช่วยจำ — ใช้กับมุมพิเศษ */
  var SPECIAL = {
    '30': {
      adj: '√3', opp: '1', hyp: '2', a: Math.sqrt(3), o: 1, h: 2, top: '60°',
      v: { cos: '√3/2 ≈ 0.866', sec: '2/√3 ≈ 1.155', sin: '1/2 = 0.500',
           cosec: '2', tan: '1/√3 ≈ 0.577', cot: '√3 ≈ 1.732' }
    },
    '45': {
      adj: '1', opp: '1', hyp: '√2', a: 1, o: 1, h: Math.sqrt(2), top: '45°',
      v: { cos: '√2/2 ≈ 0.707', sec: '√2 ≈ 1.414', sin: '√2/2 ≈ 0.707',
           cosec: '√2 ≈ 1.414', tan: '1', cot: '1' }
    },
    '60': {
      adj: '1', opp: '√3', hyp: '2', a: 1, o: Math.sqrt(3), h: 2, top: '30°',
      v: { cos: '1/2 = 0.500', sec: '2', sin: '√3/2 ≈ 0.866',
           cosec: '2/√3 ≈ 1.155', tan: '√3 ≈ 1.732', cot: '1/√3 ≈ 0.577' }
    }
  };

  TV.widget('#w-mnemonic-special', {
    title: 'ใช้แผนภาพกับมุม 30°, 45°, 60°',
    badge: 'สลับมุมได้',
    desc: 'เติมความยาวด้านที่แน่นอนลงในรูปเดิม แล้วอ่านค่าทั้งหกตามลูกศรได้ทันที — ความยาวตรงจุดกลมคือตัวเศษ ความยาวตรงด้านที่ลูกศรทะลุออกคือตัวส่วน',
    plot: { equal: true, ratio: 0.58, minH: 310, maxH: 440, pad: 14 },
    controls: [
      {
        type: 'seg', key: 'm', label: 'มุม A',
        options: [['30', '30°'], ['45', '45°'], ['60', '60°']], value: '30'
      },
      {
        type: 'seg', key: 'sel', label: 'เน้นที่มุม',
        options: [['all', 'ทั้งหมด'], ['A', 'มุม A'], ['top', 'มุมยอด'], ['right', 'มุมฉาก']], value: 'all'
      }
    ],
    hint: 'สังเกตว่ามุมยอดคือ 90° − A เสมอ ค่าที่มุมยอดจึงเป็นค่าของมุมนั้น เช่น sin 30° = cos 60° — นี่คือที่มาของสูตรโคฟังก์ชัน',
    draw: function (p, s, api) {
      var d = SPECIAL[s.m], k = 3.5 / d.h;
      drawMnemonic(p, {
        W: d.a * k, H: d.o * k, sel: s.sel, suffix: ' ' + s.m + '°',
        sideLab: { adj: 'adj = ' + d.adj, opp: 'opp = ' + d.opp, hyp: 'hyp = ' + d.hyp },
        topLab: d.top
      });
      var out = {};
      ['cos', 'sec', 'sin', 'cosec', 'tan', 'cot'].forEach(function (fn) {
        var g = (fn === 'cos' || fn === 'sec') ? C.cos : (fn === 'sin' || fn === 'cosec') ? C.sin : C.tan;
        out[fn + ' ' + s.m + '°'] = { v: d.v[fn], color: g };
      });
      api.stats(out);
    }
  });

  /* 1.5 มุมพิเศษ 30-45-60 มาจากไหน */
  TV.widget('#w-special', {
    title: 'มุมพิเศษ 30°, 45°, 60° มาจากไหน',
    badge: 'สลับดูได้',
    desc: 'ค่าตรีโกณของมุมพิเศษไม่ได้มาจากการท่องจำ แต่มาจากการผ่าครึ่งรูปสี่เหลี่ยมจัตุรัสและสามเหลี่ยมด้านเท่า',
    plot: { xmin: -0.4, xmax: 2.45, ymin: -0.5, ymax: 2.1, equal: true, ratio: 0.66, minH: 270, maxH: 380 },
    controls: [
      {
        type: 'seg', key: 'm', label: 'เลือกมุม',
        options: [['45', '45°'], ['30', '30°'], ['60', '60°']], value: '45'
      },
      { type: 'check', key: 'parent', label: 'แสดงรูปต้นแบบ', value: true }
    ],
    hint: 'ค่าที่ได้เป็นค่าที่แน่นอน (exact value) ไม่ใช่ค่าประมาณ — ควรตอบเป็นรูปกรณฑ์เสมอเว้นแต่โจทย์สั่งเป็นทศนิยม',
    draw: function (p, s, api) {
      var R3 = Math.sqrt(3);

      if (s.m === '45') {
        /* รูปเรขาคณิตล้วน ไม่มีแกนพิกัด ความยาวบนรูปจึงตรงกับป้ายกำกับพอดี */
        p.setBounds({ xmin: -0.3, xmax: 1.62, ymin: -0.32, ymax: 1.4 });
        if (s.parent) {
          p.poly([[0, 0], [1, 0], [1, 1], [0, 1]], { color: '#c1beb4', w: 1.6, dash: [5, 4] });
          p.text(0.5, 1, 'สี่เหลี่ยมจัตุรัส ด้านยาว 1', { dy: -12, color: C.faint, size: 11.5 });
        }
        p.poly([[0, 0], [1, 0], [1, 1]], { fill: 'rgba(29,78,216,.08)', color: C.sin, w: 2.4 });
        p.rightAngle(1, 0, -1, 0, 0, 1, 12, C.soft);
        p.arc(0, 0, 0.3, 0, PI / 4, { fill: 'rgba(180,83,9,.14)', color: C.accent, w: 1.8 });
        p.text(0, 0, '45°', { dx: 52, dy: -20, color: C.accent, size: 13 });
        p.arc(1, 1, 0.3, PI, PI * 1.25, { color: C.faint, w: 1.5 });
        p.text(1, 1, '45°', { dx: -34, dy: 16, color: C.faint, size: 12 });
        p.text(0.5, 0, '1', { dy: 17, color: C.cos, size: 15, mono: true });
        p.text(1, 0.5, '1', { dx: 14, color: C.sin, size: 15, mono: true, align: 'left' });
        p.text(0.5, 0.5, '√2', { dx: -16, dy: -14, color: C.hyp, size: 15, align: 'right', bg: 'rgba(255,255,255,.9)' });
        api.stats({
          'sin 45°': { v: '√2/2 ≈ 0.7071', color: C.sin },
          'cos 45°': { v: '√2/2 ≈ 0.7071', color: C.cos },
          'tan 45°': { v: '1', color: C.tan }
        });
      } else {
        p.setBounds({ xmin: -0.34, xmax: 2.42, ymin: -0.36, ymax: 2.02 });
        if (s.parent) {
          p.poly([[0, 0], [2, 0], [1, R3]], { color: '#c1beb4', w: 1.6, dash: [5, 4] });
          p.text(1.5, R3 / 2, 'สามเหลี่ยมด้านเท่า ด้านละ 2', { dx: 14, dy: -6, color: C.faint, size: 11.5, align: 'left' });
        }
        p.poly([[0, 0], [1, 0], [1, R3]], { fill: 'rgba(29,78,216,.08)', color: C.sin, w: 2.4 });
        p.rightAngle(1, 0, -1, 0, 0, 1, 12, C.soft);
        var hot = s.m === '60';
        p.arc(0, 0, 0.34, 0, PI / 3, { fill: hot ? 'rgba(180,83,9,.14)' : null, color: hot ? C.accent : C.faint, w: hot ? 2 : 1.4 });
        p.text(0, 0, '60°', { dx: 34, dy: -30, color: hot ? C.accent : C.faint, size: 13 });
        p.arc(1, R3, 0.34, PI + PI / 3 + 0.02, PI * 1.5, { fill: !hot ? 'rgba(180,83,9,.14)' : null, color: !hot ? C.accent : C.faint, w: !hot ? 2 : 1.4 });
        p.text(1, R3, '30°', { dx: -16, dy: 32, color: !hot ? C.accent : C.faint, size: 13 });
        p.text(0.5, 0, '1', { dy: 17, color: hot ? C.cos : C.sin, size: 15, mono: true });
        p.text(1, R3 / 2, '√3', { dx: 14, color: hot ? C.sin : C.cos, size: 15, mono: true, align: 'left' });
        p.text(0.5, R3 / 2, '2', { dx: -14, dy: -12, color: C.hyp, size: 15, align: 'right', bg: 'rgba(255,255,255,.9)' });
        if (hot) {
          api.stats({
            'sin 60°': { v: '√3/2 ≈ 0.8660', color: C.sin },
            'cos 60°': { v: '1/2 = 0.5000', color: C.cos },
            'tan 60°': { v: '√3 ≈ 1.7321', color: C.tan }
          });
        } else {
          api.stats({
            'sin 30°': { v: '1/2 = 0.5000', color: C.sin },
            'cos 30°': { v: '√3/2 ≈ 0.8660', color: C.cos },
            'tan 30°': { v: '1/√3 ≈ 0.5774', color: C.tan }
          });
        }
      }
    }
  });

  /* 1.4 มุมเงย — โจทย์ประยุกต์ */
  TV.widget('#w-elevation', {
    title: 'มุมเงยกับการวัดความสูง',
    badge: 'ปรับค่าได้',
    desc: 'ผู้สังเกตยืนห่างจากตึกเป็นระยะ d แล้วเงยหน้ามองยอดตึกเป็นมุม θ — ปรับสองค่านี้แล้วดูว่าความสูงตึกที่คำนวณได้เปลี่ยนไปอย่างไร',
    plot: { xmin: 0, xmax: 30, ymin: -3, ymax: 20, equal: true, ratio: 0.6, minH: 280, maxH: 400 },
    controls: [
      { type: 'range', key: 'd', label: 'ระยะห่าง d (เมตร)', min: 5, max: 30, step: 0.5, value: 18, fmt: function (v) { return nf(v, 1) + ' ม.'; } },
      { type: 'range', key: 'th', label: 'มุมเงย θ', min: 8, max: 62, step: 0.5, value: 32, fmt: degFmt }
    ],
    hint: 'อย่าลืมบวกความสูงระดับตา — สูตรคือ ความสูงตึก = ความสูงระดับตา + d · tan θ',
    draw: function (p, s, api) {
      var eye = 1.6, th = d2r(s.th);
      var rise = s.d * tan(th), H = eye + rise;
      var top = Math.max(H * 1.14, 8);
      var bw = Math.max(s.d * 0.15, 2.2);
      var X1 = s.d + bw + 5.5;
      p.setBounds({ xmin: -3.5, xmax: X1, ymin: -top * 0.15, ymax: top });

      /* พื้น */
      p.poly([[-40, 0], [X1 + 40, 0], [X1 + 40, -top], [-40, -top]], { fill: '#f1efe7' });
      p.line(-40, 0, X1 + 40, 0, { color: '#b3afa4', w: 2 });

      /* ตึก */
      p.poly([[s.d, 0], [s.d + bw, 0], [s.d + bw, H], [s.d, H]], { fill: 'rgba(124,58,237,.10)', color: C.hyp, w: 2 });
      for (var f = H / 6; f < H - H / 10; f += H / 6) {
        p.line(s.d + bw * 0.16, f, s.d + bw * 0.84, f, { color: 'rgba(124,58,237,.28)', w: 1 });
      }

      /* คน */
      p.line(0, 0, 0, eye * 0.74, { color: C.ink, w: 2.5 });
      p.circle(0, eye * 0.9, top * 0.026, { fill: C.ink });

      /* เส้นสายตา + เส้นแนวระดับ */
      p.line(0, eye, s.d, eye, { color: C.faint, w: 1.4, dash: [6, 5] });
      p.line(0, eye, s.d, H, { color: C.accent, w: 2.4 });
      p.arc(0, eye, s.d * 0.3, 0, th, { fill: 'rgba(180,83,9,.13)', color: C.accent, w: 1.8 });
      p.text(s.d * 0.3 * cos(th / 2), eye + s.d * 0.3 * sin(th / 2), nf(s.th, 1) + '°', {
        dx: 24, dy: -4, color: C.accent, size: 12.5, align: 'left', bg: 'rgba(255,255,255,.85)'
      });

      /* ส่วนสูงที่ tan ให้ */
      p.line(s.d, eye, s.d, H, { color: C.sin, w: 3 });
      p.rightAngle(s.d, eye, -1, 0, 0, 1, 11, C.soft);
      p.measure(0, 0, s.d, 0, 30, 'd = ' + nf(s.d, 1) + ' ม.', C.cos);
      p.measure(s.d + bw, 0, s.d + bw, H, 34, 'สูง ' + nf(H, 2) + ' ม.', C.hyp);
      p.text(s.d, (eye + H) / 2, 'd·tan θ = ' + nf(rise, 2), { dx: -10, color: C.sin, size: 11.5, align: 'right', bg: 'rgba(255,255,255,.9)' });
      p.text(0, eye, '1.6 ม.', { dx: -8, dy: -2, color: C.faint, size: 10.5, align: 'right' });

      api.stats({
        'tan θ': { v: nf(tan(th), 4), color: C.tan },
        'd · tan θ': { v: nf(rise, 2) + ' ม.', color: C.sin },
        'ความสูงตึก': { v: nf(H, 2) + ' ม.', color: C.hyp },
        'ระยะสายตา': nf(Math.hypot(s.d, rise), 2) + ' ม.'
      });
    }
  });

  /* =====================================================================
     บทที่ 2 — วงกลมหนึ่งหน่วย
     ===================================================================== */

  /* 2.1 วงกลมหนึ่งหน่วย — widget หลักของเว็บ */
  /* มุมมาตรฐานที่ออกสอบบ่อย — ปุ่มจะเปลี่ยนป้ายตามหน่วยที่เลือก (องศา ↔ เรเดียน) */
  var UC_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

  TV.widget('#w-unitcircle', {
    title: 'วงกลมหนึ่งหน่วย',
    badge: 'กดปุ่ม · ลากจุดได้',
    desc: 'ลากจุดสีม่วงไปรอบวงกลม หรือกดปุ่มมุมมาตรฐานด้านล่าง — cos θ คือระยะในแนวนอน (สีส้ม) และ sin θ คือระยะในแนวตั้ง (สีน้ำเงิน) ของจุดนั้น ค่าที่ได้แสดงเป็นค่าที่แน่นอน ไม่ใช่ทศนิยม',
    plot: { xmin: -1.72, xmax: 1.98, ymin: -1.45, ymax: 1.45, equal: true, ratio: 0.62, minH: 320, maxH: 460 },
    controls: [
      { type: 'range', key: 'th', label: 'มุม θ', min: 0, max: 360, step: 0.5, value: 40, fmt: degFmt },
      { type: 'seg', key: 'u', label: 'หน่วยมุม', options: [['deg', 'องศา'], ['rad', 'เรเดียน']], value: 'deg' },
      {
        type: 'chips', key: 'th', label: 'มุมมาตรฐาน', wide: true,
        options: UC_ANGLES.map(function (a) {
          return {
            v: a,
            label: function (st) { return st.u === 'rad' ? TV.radLabel(d2r(a)) : a + '°'; }
          };
        }),
        /* ไฮไลต์ปุ่มเมื่อมุมปัจจุบันตรงกับปุ่มนั้น (คิดแบบวนรอบ 360°) */
        isOn: function (st, v) {
          var dd = (((st.th - v) % 360) + 360) % 360;
          return Math.min(dd, 360 - dd) < 0.25;
        }
      },
      { type: 'check', key: 'astc', label: 'ป้ายควอดรันต์', value: true },
      { type: 'check', key: 'ref', label: 'มุมอ้างอิง', value: false },
      { type: 'check', key: 'tg', label: 'เส้น tan', value: false },
      {
        type: 'button', label: 'หมุนอัตโนมัติ', primary: true,
        action: function (api, btn) {
          if (api.isAnimating()) { api.stopAnim(); btn.textContent = 'หมุนอัตโนมัติ'; return; }
          btn.textContent = 'หยุด';
          api.animate(function (dt) {
            api.state.th = (api.state.th + dt * 55) % 360;
            if (!document.body.contains(btn)) return false;
          });
        }
      }
    ],
    hint: 'สังเกตเครื่องหมาย: ควอดรันต์ที่ 2 มี cos ติดลบแต่ sin ยังบวก — ท่องว่า A-S-T-C (ทั้งหมด, Sin, Tan, Cos เป็นบวก)',
    onPointer: function (p, s, wx, wy) {
      if (Math.hypot(wx, wy) > 1.5) return false;
      var a = r2d(Math.atan2(wy, wx));
      s.th = (a + 360) % 360;
      return true;
    },
    draw: function (p, s, api) {
      var th = d2r(s.th), x = cos(th), y = sin(th);
      var tv = Math.abs(cos(th)) < 1e-9 ? Infinity : tan(th);

      p.grid(0.5, 0.5, '#f6f4ee');
      p.axes({ xStep: 1, yStep: 1, digits: 0, xName: 'x', yName: 'y' });

      if (s.astc) {
        var q = [['I', 1.42, 1.2, 'A'], ['II', -1.42, 1.2, 'S'], ['III', -1.42, -1.2, 'T'], ['IV', 1.42, -1.2, 'C']];
        q.forEach(function (Q) {
          p.text(Q[1], Q[2], Q[0], { color: '#c9c5bb', size: 20, weight: 700, dy: -8 });
          p.text(Q[1], Q[2], Q[3] + ' เป็นบวก', { color: '#bdb8ac', size: 10, dy: 10 });
        });
      }

      p.circle(0, 0, 1, { color: '#b8b4aa', w: 2 });

      /* เส้น tan */
      if (s.tg) {
        p.line(1, -1.4, 1, 1.4, { color: '#ded9cf', w: 1.5, dash: [4, 4] });
        if (isFinite(tv) && Math.abs(tv) < 1e4) {
          var ty = clamp(tv, -1.38, 1.38);
          p.line(1, 0, 1, ty, { color: C.tan, w: 4.5 });
          if (Math.abs(tv) <= 1.38) {
            p.line(0, 0, 1, tv, { color: C.tan, w: 1.3, dash: [5, 4] });
            p.dot(1, tv, { fill: C.tan, r: 4.5 });
          }
          p.text(1, ty / 2, 'tan θ' + (Math.abs(tv) > 1.38 ? ' (เกินกรอบ)' : ' = ' + (TV.exact(tv) || nf(tv, 2))), {
            dx: 10, color: C.tan, size: 11.5, align: 'left', bg: 'rgba(255,255,255,.9)'
          });
        } else {
          p.text(1, 0.8, 'tan θ ไม่นิยาม', { dx: 10, color: C.tan, size: 11.5, align: 'left', bg: 'rgba(255,255,255,.9)' });
        }
      }

      /* มุม */
      p.arc(0, 0, 0.3, 0, th, { fill: 'rgba(180,83,9,.13)', color: C.accent, w: 2 });
      if (s.ref) {
        var r0 = d2r(refAngle(s.th));
        var base = (s.th > 90 && s.th < 270) ? PI : (s.th > 270 ? TAU : 0);
        /* มุมอ้างอิงวัดจากแกน x ที่ใกล้ที่สุด เข้าหาแขนสิ้นสุดเสมอ */
        var dir = (s.th <= 90 || (s.th > 180 && s.th <= 270)) ? 1 : -1;
        p.arc(0, 0, 0.56, base, base + dir * r0, { color: C.hyp, w: 2.4 });
        var mid = base + dir * r0 / 2;
        p.text(0.56 * cos(mid), 0.56 * sin(mid), nf(refAngle(s.th), 1) + '°', {
          dx: 26 * cos(mid), dy: -26 * sin(mid), color: C.hyp, size: 11.5, bg: 'rgba(255,255,255,.92)'
        });
      }

      /* เส้นฉาย */
      p.line(x, 0, x, y, { color: C.sin, w: 5 });
      p.line(0, 0, x, 0, { color: C.cos, w: 5 });
      p.line(0, y, x, y, { color: C.sin, w: 1.2, dash: [4, 4] });
      p.line(0, 0, x, y, { color: C.hyp, w: 2.6 });
      if (Math.abs(x) > 0.06 && Math.abs(y) > 0.06) p.rightAngle(x, 0, -Math.sign(x), 0, 0, Math.sign(y), 10, C.soft);

      p.dot(x, y, { fill: C.hyp, r: 8, halo: C.hyp });
      p.dot(0, 0, { fill: C.ink, r: 3.5 });

      p.text(x / 2, 0, 'cos θ', { dy: y >= 0 ? 15 : -15, color: C.cos, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.text(x, y / 2, 'sin θ', { dx: x >= 0 ? 12 : -12, align: x >= 0 ? 'left' : 'right', color: C.sin, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.text(x, y, '(' + (TV.exact(x) || nf(x, 3)) + ', ' + (TV.exact(y) || nf(y, 3)) + ')', {
        dx: x >= 0 ? 14 : -14, dy: y >= 0 ? -14 : 14,
        align: x >= 0 ? 'left' : 'right', color: C.hyp, size: 11.5, mono: true, bg: 'rgba(255,255,255,.92)'
      });
      var lab = s.u === 'deg' ? nf(s.th, 1) + '°' : (exactPi(th) || nf(th, 2)) + ' rad';
      p.text(0.3 * cos(th / 2), 0.3 * sin(th / 2), lab, { dx: 22 * cos(th / 2), dy: -22 * sin(th / 2), color: C.accent, size: 12.5, bg: 'rgba(255,255,255,.9)' });

      var ref = refAngle(s.th);
      api.stats({
        'θ': s.u === 'deg' ? nf(s.th, 1) + '°' : (exactPi(th) || nf(th, 4)) + ' rad',
        'sin θ': { v: TV.exact(y) || nf(y, 4), color: C.sin },
        'cos θ': { v: TV.exact(x) || nf(x, 4), color: C.cos },
        'tan θ': { v: !isFinite(tv) || Math.abs(tv) > 1e4 ? 'ไม่นิยาม' : (TV.exact(tv) || nf(tv, 4)), color: C.tan },
        'ควอดรันต์': quadrantOf(s.th),
        'มุมอ้างอิง': s.u === 'deg' ? nf(ref, 1) + '°' : TV.radLabel(d2r(ref)) + ' rad'
      });
    }
  });

  /* 2.2 เรเดียนคืออะไร */
  TV.widget('#w-radian', {
    title: 'เรเดียนคืออะไร',
    badge: 'ปรับค่าได้',
    desc: '1 เรเดียน คือมุมที่ทำให้ส่วนโค้งยาวเท่ากับรัศมีพอดี — แถบด้านล่างคือส่วนโค้งที่ถูก “คลี่” ออกมาเป็นเส้นตรง',
    plot: { xmin: -1.5, xmax: 5.3, ymin: -2.15, ymax: 1.35, equal: true, ratio: 0.5, minH: 240, maxH: 340 },
    controls: [
      { type: 'range', key: 't', label: 'มุม θ (เรเดียน)', min: 0, max: 6.2832, step: 0.01, value: 1, fmt: function (v) { return nf(v, 2) + ' rad'; } },
      {
        type: 'button', label: 'ตั้งเป็น 1 rad',
        action: function (api) { api.set('t', 1); }
      },
      {
        type: 'button', label: 'ตั้งเป็น π',
        action: function (api) { api.set('t', PI); }
      }
    ],
    hint: 'เรเดียนไม่มีหน่วย เพราะเป็นอัตราส่วนความยาวส่วนโค้งต่อรัศมี (s/r) — นี่คือเหตุผลที่สูตรแคลคูลัสของ sin, cos ใช้ได้เฉพาะเมื่อมุมเป็นเรเดียน',
    draw: function (p, s, api) {
      var t = s.t, X0 = -1.25, Y0 = -1.72;
      p.circle(0, 0, 1, { color: '#ddd8ce', w: 1.8 });
      p.line(-1.25, 0, 1.25, 0, { color: '#e6e2d8', w: 1 });
      p.line(0, -1.25, 0, 1.25, { color: '#e6e2d8', w: 1 });

      p.arc(0, 0, 1, 0, t, { fill: 'rgba(180,83,9,.10)' });
      p.arc(0, 0, 1, 0, t, { color: C.accent, w: 5 });
      p.line(0, 0, 1, 0, { color: C.hyp, w: 2.4 });
      p.line(0, 0, cos(t), sin(t), { color: C.hyp, w: 2.4 });
      p.measure(0, 0, 1, 0, -22, 'r = 1', C.hyp);

      /* ขีดทุก 1 เรเดียนบนส่วนโค้ง */
      for (var k = 1; k <= 6; k++) {
        if (k > t + 1e-9) break;
        p.line(cos(k) * 0.92, sin(k) * 0.92, cos(k) * 1.08, sin(k) * 1.08, { color: C.ink, w: 2 });
        p.text(cos(k) * 1.22, sin(k) * 1.22, String(k), { color: C.soft, size: 11, mono: true });
      }
      p.dot(cos(t), sin(t), { fill: C.accent, r: 6 });

      /* ส่วนโค้งที่คลี่ออกมา */
      p.line(X0, Y0, X0 + 6.2832, Y0, { color: '#e2ded4', w: 3 });
      p.line(X0, Y0, X0 + t, Y0, { color: C.accent, w: 6 });
      for (var j = 0; j <= 6; j++) {
        p.line(X0 + j, Y0 - 0.1, X0 + j, Y0 + 0.1, { color: '#b8b4aa', w: 1.5 });
        p.text(X0 + j, Y0 - 0.24, String(j), { color: C.faint, size: 10.5, mono: true });
      }
      p.line(X0, Y0 + 0.58, X0 + 1, Y0 + 0.58, { color: C.hyp, w: 3 });
      p.text(X0 + 0.5, Y0 + 0.58, 'ยาว = r', { dy: -12, color: C.hyp, size: 11 });
      p.text(X0 + t / 2, Y0, 'ความยาวส่วนโค้ง s = ' + nf(t, 2), { dy: -15, color: C.accent, size: 12, bg: 'rgba(255,255,255,.92)' });

      api.stats({
        'θ (เรเดียน)': { v: nf(t, 3), color: C.accent },
        'θ (องศา)': nf(r2d(t), 1) + '°',
        'รูปกรณฑ์ π': exactPi(t) || '— (ไม่ลงตัว)',
        's = rθ (r=1)': { v: nf(t, 3), color: C.hyp },
        'พื้นที่เซกเตอร์': nf(0.5 * t, 3)
      });
    }
  });

  /* ---- โรงงานสร้าง widget “คลี่วงกลมเป็นกราฟ” (ใช้ทั้งบท 2 และ 3) ---- */
  function unwrap(sel, cfg) {
    var isTan = cfg.fn === 'tan';
    var YM = isTan ? 2.7 : 1.4;
    TV.widget(sel, {
      title: cfg.title,
      badge: 'กดเล่นได้',
      desc: cfg.desc,
      plot: { xmin: -1.25, xmax: 1.55 + TAU + 0.45, ymin: -YM, ymax: YM, equal: true, ratio: isTan ? 0.52 : 0.34, minH: isTan ? 260 : 205, maxH: isTan ? 360 : 280 },
      controls: [
        { type: 'range', key: 't', label: 'มุม θ', min: 0, max: 359.5, step: 0.5, value: 55, fmt: degFmt },
        cfg.pick ? { type: 'seg', key: 'f', label: 'ฟังก์ชัน', options: [['sin', 'sin'], ['cos', 'cos']], value: cfg.fn } : null,
        {
          type: 'button', label: 'เล่น', primary: true,
          action: function (api, btn) {
            if (api.isAnimating()) { api.stopAnim(); btn.textContent = 'เล่น'; return; }
            btn.textContent = 'หยุด';
            api.animate(function (dt) {
              api.state.t += dt * 48;
              if (api.state.t >= 359.5) { api.state.t = 0; }
              if (!document.body.contains(btn)) return false;
            });
          }
        }
      ].filter(Boolean),
      hint: cfg.hint,
      draw: function (p, s, api) {
        var f = s.f || cfg.fn;
        var col = f === 'sin' ? C.sin : f === 'cos' ? C.cos : C.tan;
        var fn = f === 'sin' ? sin : f === 'cos' ? cos : tan;
        var t = d2r(s.t), X0 = 1.55;
        var x = cos(t), y = sin(t), v = fn(t);

        /* --- ฝั่งวงกลม --- */
        p.line(-1.18, 0, 1.18, 0, { color: '#e6e2d8', w: 1 });
        p.line(0, -1.18, 0, 1.18, { color: '#e6e2d8', w: 1 });
        p.circle(0, 0, 1, { color: '#c6c2b8', w: 1.8 });
        p.arc(0, 0, 0.22, 0, t, { fill: 'rgba(180,83,9,.14)', color: C.accent, w: 1.5 });
        p.line(0, 0, x, y, { color: C.hyp, w: 2 });
        if (f === 'sin') p.line(x, 0, x, y, { color: C.sin, w: 4 });
        else if (f === 'cos') p.line(0, 0, x, 0, { color: C.cos, w: 4 });
        else {
          p.line(1, -YM * .95, 1, YM * .95, { color: '#e6e2d8', w: 1, dash: [4, 4] });
          if (isFinite(v) && Math.abs(v) < YM) {
            p.line(1, 0, 1, v, { color: C.tan, w: 4 });
            p.line(0, 0, 1, v, { color: C.tan, w: 1.1, dash: [4, 4] });
          }
        }
        p.dot(x, y, { fill: C.hyp, r: 6 });

        /* --- ฝั่งกราฟ --- */
        p.line(X0, 0, X0 + TAU + 0.3, 0, { color: C.axis, w: 1.4 });
        p.line(X0, -YM * .95, X0, YM * .95, { color: C.axis, w: 1.4 });
        for (var k = 1; k <= 4; k++) {
          var gx = X0 + k * PI / 2;
          p.line(gx, -0.07, gx, 0.07, { color: C.axis, w: 1.2 });
          p.text(gx, 0, TV.radLabel(k * PI / 2), { dy: 13, color: C.faint, size: 10, mono: true });
          p.text(gx, 0, (k * 90) + '°', { dy: 26, color: '#c2beb4', size: 9.5, mono: true });
        }
        [1, -1].forEach(function (u) {
          p.line(X0 - 0.07, u, X0 + 0.07, u, { color: C.axis, w: 1.2 });
          p.text(X0, u, String(u), { dx: -9, align: 'right', color: C.faint, size: 10, mono: true });
        });
        if (isTan) p.line(X0, -YM * .95, X0 + TAU + 0.3, -YM * .95, { color: 'transparent' });

        /* เส้นกำกับของ tan */
        if (isTan) {
          [PI / 2, 3 * PI / 2].forEach(function (a) {
            p.line(X0 + a, -YM * .95, X0 + a, YM * .95, { color: '#f0b8b0', w: 1.4, dash: [5, 5] });
          });
        }

        /* กราฟเต็มแบบจาง + ส่วนที่ลากมาแล้ว */
        p.func(function (u) { return fn(u - X0); }, { from: X0, to: X0 + TAU, color: col, w: 2, alpha: 0.22, jump: YM });
        p.func(function (u) { return fn(u - X0); }, { from: X0, to: X0 + t, color: col, w: 2.8, jump: YM });

        /* เส้นเชื่อมวงกลม → กราฟ */
        if (isFinite(v) && Math.abs(v) < YM * 0.99) {
          if (f === 'cos') {
            var hy = YM * 0.86;
            p.poly([[x, 0], [x, hy], [X0 + t, hy], [X0 + t, v]], { close: false, color: 'rgba(194,65,12,.5)', w: 1.3, dash: [4, 4] });
          } else {
            var sx0 = f === 'tan' ? 1 : x;
            p.line(sx0, v, X0 + t, v, { color: col, w: 1.3, dash: [4, 4] });
          }
          p.dot(X0 + t, v, { fill: col, r: 6 });
          p.text(X0 + t, v, nf(v, 3), { dx: 0, dy: v >= 0 ? -16 : 16, color: col, size: 11, mono: true, bg: 'rgba(255,255,255,.92)' });
        }
        p.line(X0 + t, 0, X0 + t, clamp(v, -YM * .95, YM * .95), { color: 'rgba(0,0,0,.10)', w: 1 });

        p.text(X0 + TAU / 2, -YM * 0.88, 'y = ' + f + ' θ', { color: col, size: 13 });

        var out = { 'θ': nf(s.t, 1) + '°  (' + nf(t, 3) + ' rad)' };
        out[f + ' θ'] = { v: isFinite(v) && Math.abs(v) < 1e4 ? nf(v, 4) : 'ไม่นิยาม', color: col };
        out['ควอดรันต์'] = quadrantOf(s.t);
        api.stats(out);
      }
    });
  }

  unwrap('#w-unwrap', {
    fn: 'sin', pick: true,
    title: 'คลี่วงกลมออกมาเป็นกราฟ',
    desc: 'ด้านซ้ายคือจุดที่วิ่งรอบวงกลม ด้านขวาคือกราฟที่เกิดจากการบันทึกค่าของจุดนั้นเทียบกับมุม — กดปุ่ม “เล่น” เพื่อดูกราฟถูกวาดขึ้นมา',
    hint: 'กราฟฟังก์ชันตรีโกณไม่ได้มาจากไหน มันคือ “ประวัติการเคลื่อนที่” ของจุดบนวงกลมนั่นเอง'
  });

  unwrap('#w-tangraph', {
    fn: 'tan',
    title: 'กราฟ tan กับเส้นกำกับ',
    desc: 'tan θ คือความยาวบนเส้นสัมผัสวงกลมที่ x = 1 — เมื่อ θ เข้าใกล้ 90° เส้นรัศมีเกือบขนานกับเส้นสัมผัส ค่าจึงพุ่งไปไม่มีที่สิ้นสุด',
    hint: 'เส้นประสีแดงคือเส้นกำกับ (asymptote) ที่ θ = 90°, 270° — ตำแหน่งที่ cos θ = 0 ทำให้ tan θ = sin θ / cos θ ไม่นิยาม'
  });

  /* =====================================================================
     บทที่ 3 — กราฟฟังก์ชันตรีโกณ
     ===================================================================== */

  /* 3.1 Wave Builder */
  TV.widget('#w-wave', {
    title: 'เครื่องสร้างคลื่น — y = A·f(B(x − C)) + D',
    badge: 'ปรับ 4 ค่า',
    desc: 'ลองปรับทีละตัวแล้วสังเกตว่าค่าไหนควบคุมอะไร: ความสูง ความถี่ การเลื่อนซ้ายขวา และการเลื่อนขึ้นลง',
    plot: { xmin: -PI, xmax: 3 * PI, ymin: -4.4, ymax: 4.4, ratio: 0.52, minH: 300, maxH: 400, pad: 20 },
    controls: [
      { type: 'seg', key: 'f', label: 'ฟังก์ชัน', options: [['sin', 'sin'], ['cos', 'cos']], value: 'sin' },
      { type: 'range', key: 'A', label: 'A — แอมพลิจูด', min: -3, max: 3, step: 0.1, value: 1, fmt: function (v) { return nf(v, 1); } },
      { type: 'range', key: 'B', label: 'B — ควบคุมคาบ', min: 0.25, max: 4, step: 0.05, value: 1, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 'Cd', label: 'C — เลื่อนแนวนอน', min: -180, max: 180, step: 5, value: 0, fmt: degFmt },
      { type: 'range', key: 'D', label: 'D — เลื่อนแนวตั้ง', min: -1.4, max: 1.4, step: 0.1, value: 0, fmt: function (v) { return nf(v, 1); } },
      {
        type: 'button', label: 'รีเซ็ต', action: function (api) {
          api.state.A = 1; api.state.B = 1; api.state.Cd = 0; api.state.D = 0;
          api.set('f', 'sin');
        }
      }
    ],
    hint: 'ระวัง: ตำราหลายเล่มเขียนเป็น y = A sin(Bx − C) + D ซึ่ง C ในรูปนั้นไม่ใช่ระยะเลื่อน — ระยะเลื่อนจริงคือ C/B เสมอ',
    draw: function (p, s, api) {
      var f = s.f === 'sin' ? sin : cos;
      var Cr = d2r(s.Cd), per = TAU / s.B, amp = Math.abs(s.A);
      p.grid(PI / 4, 1, '#f4f2ec');
      p.grid(PI, null, '#e6e2d8');
      p.axes({ xStep: PI / 2, yStep: 1, xLabel: 'pi', digits: 0, xName: 'x', yName: 'y' });

      /* เส้นอ้างอิง */
      p.line(-PI, s.D, 3 * PI, s.D, { color: C.faint, w: 1.4, dash: [7, 5] });
      p.line(-PI, s.D + amp, 3 * PI, s.D + amp, { color: '#e0dcd2', w: 1, dash: [3, 4] });
      p.line(-PI, s.D - amp, 3 * PI, s.D - amp, { color: '#e0dcd2', w: 1, dash: [3, 4] });
      p.text(3 * PI, s.D, 'เส้นกึ่งกลาง y = ' + nf(s.D, 1), { dx: -6, dy: -10, align: 'right', color: C.faint, size: 11 });

      /* กราฟตั้งต้น */
      p.func(f, { color: '#c9c5bb', w: 1.6, dash: [5, 4] });
      /* กราฟจริง */
      var g = function (x) { return s.A * f(s.B * (x - Cr)) + s.D; };
      p.func(g, { color: s.f === 'sin' ? C.sin : C.cos, w: 3.2 });

      /* แสดงคาบ */
      var x0 = Cr + (s.f === 'sin' ? per / 4 : 0);
      while (x0 - per > -PI) x0 -= per;
      if (x0 + per < 3 * PI) {
        var yb = s.D + amp;
        p.measure(x0, yb, x0 + per, yb, -20, 'คาบ = ' + nf(per, 2), C.tan);
      }
      /* แสดงแอมพลิจูด */
      if (amp > 0.05) p.measure(x0, s.D, x0, s.D + s.A, 24, '|A| = ' + nf(amp, 1), C.accent);

      /* สมการ */
      var eq = 'y = ' + nf(s.A, 1) + ' ' + s.f + '( ' + nf(s.B, 2) + '(x ' + (s.Cd >= 0 ? '− ' : '+ ') + nf(Math.abs(Cr), 2) + ') ) ' + (s.D >= 0 ? '+ ' : '− ') + nf(Math.abs(s.D), 1);
      p.text(-PI, 5.3, eq, { dx: 10, dy: 16, align: 'left', color: C.ink, size: 13, mono: true, bg: 'rgba(255,255,255,.9)' });

      api.stats({
        'แอมพลิจูด': { v: nf(amp, 2), color: C.accent },
        'คาบ = 2π/B': { v: nf(per, 3), color: C.tan },
        'เลื่อนแนวนอน': { v: nf(Cr, 2) + ' (' + nf(s.Cd, 0) + '°)', color: C.hyp },
        'เส้นกึ่งกลาง': 'y = ' + nf(s.D, 1),
        'ค่าสูงสุด': nf(s.D + amp, 2),
        'ค่าต่ำสุด': nf(s.D - amp, 2)
      });
    }
  });

  /* 3.2 การประยุกต์ — น้ำขึ้นน้ำลง */
  TV.widget('#w-tide', {
    title: 'ของจริง: ระดับน้ำขึ้นน้ำลง',
    badge: 'ลากเส้นเวลาได้',
    desc: 'ระดับน้ำที่ท่าเรือแห่งหนึ่งประมาณได้ด้วย h(t) = 1.85 + 1.25 sin( 2π(t − 3.2) / 12.4 ) เมื่อ t คือเวลาเป็นชั่วโมงนับจากเที่ยงคืน',
    plot: { xmin: -0.6, xmax: 24.6, ymin: -0.35, ymax: 3.6, ratio: 0.46, minH: 260, maxH: 340, pad: 24 },
    controls: [
      { type: 'range', key: 't', label: 'เวลา', min: 0, max: 24, step: 0.1, value: 8, fmt: function (v) { var h = Math.floor(v), m = Math.round((v - h) * 60); return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; } },
      { type: 'range', key: 'lim', label: 'เรือต้องการน้ำลึกอย่างน้อย', min: 0.6, max: 3, step: 0.05, value: 2.2, fmt: function (v) { return nf(v, 2) + ' ม.'; } }
    ],
    hint: 'โจทย์แนวนี้ถามบ่อยว่า “เรือเข้าท่าได้ช่วงเวลาใดบ้าง” — ตอบด้วยการแก้อสมการ h(t) ≥ ระดับที่ต้องการ ซึ่งกลายเป็นสมการตรีโกณนั่นเอง',
    onPointer: function (p, s, wx) { s.t = clamp(wx, 0, 24); return true; },
    draw: function (p, s, api) {
      var M = 1.85, A = 1.25, T = 12.4, ph = 3.2;
      var h = function (t) { return M + A * sin(TAU * (t - ph) / T); };
      var hv = h(s.t);

      p.grid(2, 0.5, '#f4f2ec');
      /* พื้นที่น้ำ */
      var pts = [], i;
      for (i = 0; i <= 240; i++) { var x = i / 10; pts.push([x, h(x)]); }
      pts.push([24, 0], [0, 0]);
      p.poly(pts, { fill: 'rgba(29,78,216,.10)' });

      /* แถบที่เรือเข้าได้ */
      p.line(-0.6, s.lim, 24.6, s.lim, { color: C.tan, w: 1.8, dash: [7, 5] });
      var above = [];
      for (i = 0; i <= 2400; i++) {
        var xx = i / 100;
        if (h(xx) >= s.lim) above.push(xx);
      }
      if (above.length) {
        var runs = [], st = above[0], prev = above[0];
        above.forEach(function (v) { if (v - prev > 0.02) { runs.push([st, prev]); st = v; } prev = v; });
        runs.push([st, prev]);
        runs.forEach(function (r) {
          p.poly([[r[0], 0], [r[1], 0], [r[1], s.lim], [r[0], s.lim]], { fill: 'rgba(4,120,87,.10)' });
        });
        var txt = runs.map(function (r) { return hhmm(r[0]) + '–' + hhmm(r[1]); }).join('  ·  ');
        api._runs = txt;
      } else api._runs = 'ไม่มีช่วงเวลาที่น้ำลึกพอ';

      p.axes({ xStep: 3, yStep: 1, digits: 0, xName: 't (ชม.)', yName: 'h (ม.)' });
      p.func(h, { from: 0, to: 24, color: C.sin, w: 3 });

      /* จุดสูงสุด/ต่ำสุด */
      for (var k = -1; k < 3; k++) {
        var xmax = ph + T / 4 + k * T, xmin = ph + 3 * T / 4 + k * T;
        if (xmax > 0 && xmax < 24) { p.dot(xmax, M + A, { fill: C.accent, r: 4.5 }); p.text(xmax, M + A, 'น้ำขึ้นเต็มที่ ' + hhmm(xmax), { dy: -15, color: C.accent, size: 10.5, bg: 'rgba(255,255,255,.9)' }); }
        if (xmin > 0 && xmin < 24) { p.dot(xmin, M - A, { fill: C.faint, r: 4.5 }); p.text(xmin, M - A, 'น้ำลงต่ำสุด ' + hhmm(xmin), { dy: 15, color: C.faint, size: 10.5, bg: 'rgba(255,255,255,.9)' }); }
      }

      /* เส้นเวลาที่เลือก */
      p.line(s.t, 0, s.t, hv, { color: C.hyp, w: 2 });
      p.dot(s.t, hv, { fill: C.hyp, r: 7, halo: C.hyp });
      p.text(s.t, hv, nf(hv, 2) + ' ม.', { dx: 0, dy: -18, color: C.hyp, size: 11.5, mono: true, bg: 'rgba(255,255,255,.92)' });
      p.text(24.6, s.lim, 'ระดับที่ต้องการ', { dx: -4, dy: -10, align: 'right', color: C.tan, size: 10.5 });

      var rising = cos(TAU * (s.t - ph) / T) > 0;
      api.stats({
        'เวลา': hhmm(s.t),
        'ระดับน้ำ': { v: nf(hv, 2) + ' ม.', color: C.hyp },
        'แนวโน้ม': { v: rising ? 'กำลังขึ้น ▲' : 'กำลังลง ▼', color: rising ? C.tan : C.cos },
        'เข้าท่าได้ตอน': api._runs,
        'คาบ': nf(T, 1) + ' ชม.'
      });
    }
  });
  function hhmm(t) {
    t = ((t % 24) + 24) % 24;
    var h = Math.floor(t), m = Math.round((t - h) * 60);
    if (m === 60) { m = 0; h = (h + 1) % 24; }
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  /* =====================================================================
     บทที่ 4 — เอกลักษณ์ตรีโกณ
     ===================================================================== */

  /* 4.1 sin²θ + cos²θ = 1 */
  TV.widget('#w-pythag', {
    title: 'sin²θ + cos²θ = 1 คือทฤษฎีบทพีทาโกรัส',
    badge: 'ลากจุดได้',
    desc: 'สามเหลี่ยมในวงกลมหนึ่งหน่วยมีด้านตรงข้ามมุมฉากยาว 1 เสมอ — พีทาโกรัสจึงบังคับให้ผลรวมกำลังสองของอีกสองด้านเท่ากับ 1 ตลอดเวลา',
    plot: { xmin: -1.35, xmax: 2.75, ymin: -1.3, ymax: 1.3, equal: true, ratio: 0.52, minH: 280, maxH: 380 },
    controls: [
      { type: 'range', key: 'th', label: 'มุม θ', min: 0, max: 360, step: 0.5, value: 52, fmt: degFmt },
      {
        type: 'button', label: 'หมุนอัตโนมัติ', primary: true,
        action: function (api, btn) {
          if (api.isAnimating()) { api.stopAnim(); btn.textContent = 'หมุนอัตโนมัติ'; return; }
          btn.textContent = 'หยุด';
          api.animate(function (dt) {
            api.state.th = (api.state.th + dt * 50) % 360;
            if (!document.body.contains(btn)) return false;
          });
        }
      }
    ],
    hint: 'แถบด้านขวายาว 1 หน่วยเสมอ ไม่ว่า θ จะเป็นเท่าใด — สัดส่วนสีเท่านั้นที่เปลี่ยน นี่คือความหมายของคำว่า “เอกลักษณ์”',
    draw: function (p, s, api) {
      var th = d2r(s.th), x = cos(th), y = sin(th);
      p.line(-1.2, 0, 1.2, 0, { color: '#e6e2d8', w: 1 });
      p.line(0, -1.2, 0, 1.2, { color: '#e6e2d8', w: 1 });
      p.circle(0, 0, 1, { color: '#c6c2b8', w: 1.8 });
      p.poly([[0, 0], [x, 0], [x, y]], { fill: 'rgba(124,58,237,.07)' });
      p.line(0, 0, x, 0, { color: C.cos, w: 5 });
      p.line(x, 0, x, y, { color: C.sin, w: 5 });
      p.line(0, 0, x, y, { color: C.hyp, w: 2.6 });
      p.dot(x, y, { fill: C.hyp, r: 7, halo: C.hyp });
      p.text(x / 2, 0, '|cos θ| = ' + nf(Math.abs(x), 2), { dy: y >= 0 ? 15 : -15, color: C.cos, size: 11.5, bg: 'rgba(255,255,255,.9)' });
      p.text(x, y / 2, '|sin θ| = ' + nf(Math.abs(y), 2), { dx: x >= 0 ? 11 : -11, align: x >= 0 ? 'left' : 'right', color: C.sin, size: 11.5, bg: 'rgba(255,255,255,.9)' });

      /* แถบสะสม */
      var bx = 1.72, bw = 0.42, c2 = x * x, s2 = y * y;
      p.poly([[bx, -0.5], [bx + bw, -0.5], [bx + bw, -0.5 + c2], [bx, -0.5 + c2]], { fill: 'rgba(194,65,12,.75)', color: '#fff', w: 1 });
      p.poly([[bx, -0.5 + c2], [bx + bw, -0.5 + c2], [bx + bw, 0.5], [bx, 0.5]], { fill: 'rgba(29,78,216,.75)', color: '#fff', w: 1 });
      p.poly([[bx, -0.5], [bx + bw, -0.5], [bx + bw, 0.5], [bx, 0.5]], { color: C.ink, w: 1.8 });
      p.measure(bx + bw, -0.5, bx + bw, 0.5, 34, 'รวม = 1', C.ink);
      p.text(bx + bw / 2, -0.5 + c2 / 2, nf(c2, 2), { color: '#fff', size: 11.5, mono: true });
      p.text(bx + bw / 2, -0.5 + c2 + s2 / 2, nf(s2, 2), { color: '#fff', size: 11.5, mono: true });
      p.text(bx + bw / 2, 0.5, 'cos²θ + sin²θ', { dy: -14, color: C.soft, size: 11 });

      api.stats({
        'cos²θ': { v: nf(c2, 4), color: C.cos },
        'sin²θ': { v: nf(s2, 4), color: C.sin },
        'ผลรวม': { v: nf(c2 + s2, 4), color: C.ink },
        'θ': nf(s.th, 1) + '°'
      });
    }
  });

  /* 4.2 พิสูจน์ sin(A+B) แบบเรขาคณิต */
  TV.widget('#w-anglesum', {
    title: 'พิสูจน์ sin(A + B) ด้วยรูป',
    badge: 'ปรับมุมได้',
    desc: 'ความสูงของจุด P คือ sin(A+B) และรูปแสดงว่าความสูงนั้นแยกออกเป็นสองส่วนพอดี: sin A·cos B บวก cos A·sin B',
    plot: { xmin: -0.28, xmax: 1.3, ymin: -0.22, ymax: 1.28, equal: true, ratio: 0.85, minH: 300, maxH: 420 },
    controls: [
      { type: 'range', key: 'A', label: 'มุม A', min: 10, max: 50, step: 1, value: 32, fmt: degFmt },
      { type: 'range', key: 'B', label: 'มุม B', min: 10, max: 35, step: 1, value: 25, fmt: degFmt }
    ],
    hint: 'จำสูตรจากรูป: sin(A+B) = sin A cos B + cos A sin B  ส่วน cos(A+B) = cos A cos B − sin A sin B (ระยะในแนวนอนซึ่ง “หดสั้นลง” จึงเป็นเครื่องหมายลบ)',
    draw: function (p, s, api) {
      var A = d2r(s.A), B = d2r(s.B);
      var Q = [cos(B) * cos(A), cos(B) * sin(A)];
      var P = [cos(A + B), sin(A + B)];
      var T = [P[0], Q[1]];

      p.line(-0.25, 0, 1.25, 0, { color: '#ddd8ce', w: 1.4 });
      p.line(0, -0.2, 0, 1.25, { color: '#ddd8ce', w: 1.4 });
      p.circle(0, 0, 1, { color: '#eeece5', w: 1.4, dash: [4, 4] });

      p.poly([[0, 0], Q, P], { fill: 'rgba(124,58,237,.06)' });
      p.poly([Q, T, P], { fill: 'rgba(4,120,87,.10)' });

      /* มุม */
      p.arc(0, 0, 0.27, 0, A, { fill: 'rgba(194,65,12,.14)', color: C.cos, w: 1.7 });
      p.arc(0, 0, 0.27, A, A + B, { fill: 'rgba(29,78,216,.14)', color: C.sin, w: 1.7 });
      p.text(0.32 * cos(A / 2), 0.32 * sin(A / 2), 'A', { color: C.cos, size: 13 });
      p.text(0.34 * cos(A + B / 2), 0.34 * sin(A + B / 2), 'B', { color: C.sin, size: 13 });

      /* เส้นหลัก */
      p.line(0, 0, Q[0], Q[1], { color: C.cos, w: 3 });
      p.line(Q[0], Q[1], P[0], P[1], { color: C.sin, w: 3 });
      p.line(0, 0, P[0], P[1], { color: C.hyp, w: 2.4 });
      p.rightAngle(Q[0], Q[1], -cos(A), -sin(A), -sin(A), cos(A), 11, C.soft);

      /* เส้นช่วย */
      p.line(P[0], 0, P[0], P[1], { color: C.faint, w: 1.2, dash: [4, 4] });
      p.line(Q[0], 0, Q[0], Q[1], { color: C.faint, w: 1.2, dash: [4, 4] });
      p.line(Q[0], Q[1], T[0], T[1], { color: C.tan, w: 1.6, dash: [4, 3] });
      p.rightAngle(P[0], 0, -1, 0, 0, 1, 10, C.soft);

      /* ป้าย */
      p.text((0 + Q[0]) / 2, Q[1] / 2, 'cos B', { dx: 6, dy: -12, color: C.cos, size: 11.5, bg: 'rgba(255,255,255,.9)' });
      p.text((Q[0] + P[0]) / 2, (Q[1] + P[1]) / 2, 'sin B', { dx: -14, dy: -20, align: 'right', color: C.sin, size: 11.5, bg: 'rgba(255,255,255,.9)' });
      p.text(P[0] / 2, P[1] / 2, 'OP = 1', { dx: -6, dy: 14, align: 'right', color: C.hyp, size: 11, bg: 'rgba(255,255,255,.9)' });

      /* ค่าตัวเลขอยู่ในแถบด้านล่างแล้ว บนรูปจึงใส่แค่ชื่อก้อน ไม่ให้ป้ายชนกัน */
      p.measure(P[0], 0, P[0], Q[1], 32, 'sin A·cos B', C.cos);
      p.measure(P[0], Q[1], P[0], P[1], 32, 'cos A·sin B', C.tan);
      p.measure(0, 0, 0, P[1], -34, 'sin(A+B)', C.hyp);

      p.dot(Q[0], Q[1], { fill: C.cos, r: 5 });
      p.dot(P[0], P[1], { fill: C.hyp, r: 6.5 });
      p.text(P[0], P[1], 'P', { dx: 12, dy: -8, color: C.hyp, size: 13, align: 'left' });
      p.text(Q[0], Q[1], 'Q', { dx: 11, dy: 9, color: C.cos, size: 12, align: 'left' });

      api.stats({
        'A + B': nf(s.A + s.B, 0) + '°',
        'sin(A+B)': { v: nf(sin(A + B), 5), color: C.hyp },
        'sin A cos B': { v: nf(sin(A) * cos(B), 5), color: C.cos },
        'cos A sin B': { v: nf(cos(A) * sin(B), 5), color: C.tan },
        'ผลรวมสองก้อน': { v: nf(sin(A) * cos(B) + cos(A) * sin(B), 5), color: C.ink }
      });
    }
  });

  /* 4.3 ตรวจสอบเอกลักษณ์ด้วยกราฟ */
  var IDS = [
    { n: 'sin 2x = 2 sin x cos x', L: function (x) { return sin(2 * x); }, R: function (x) { return 2 * sin(x) * cos(x); }, ok: true },
    { n: 'cos 2x = cos²x − sin²x', L: function (x) { return cos(2 * x); }, R: function (x) { return cos(x) * cos(x) - sin(x) * sin(x); }, ok: true },
    { n: 'cos 2x = 1 − 2 sin²x', L: function (x) { return cos(2 * x); }, R: function (x) { return 1 - 2 * sin(x) * sin(x); }, ok: true },
    { n: 'sin²x = (1 − cos 2x)/2', L: function (x) { return sin(x) * sin(x); }, R: function (x) { return (1 - cos(2 * x)) / 2; }, ok: true },
    { n: 'sin(x + π/2) = cos x', L: function (x) { return sin(x + PI / 2); }, R: function (x) { return cos(x); }, ok: true },
    { n: 'sin 3x = 3 sin x − 4 sin³x', L: function (x) { return sin(3 * x); }, R: function (x) { return 3 * sin(x) - 4 * Math.pow(sin(x), 3); }, ok: true },
    { n: 'cos x + cos 3x = 2 cos 2x cos x', L: function (x) { return cos(x) + cos(3 * x); }, R: function (x) { return 2 * cos(2 * x) * cos(x); }, ok: true },
    { n: '⚠ sin 2x = 2 sin x   (ผิด)', L: function (x) { return sin(2 * x); }, R: function (x) { return 2 * sin(x); }, ok: false },
    { n: '⚠ cos(x + π/3) = cos x + cos π/3   (ผิด)', L: function (x) { return cos(x + PI / 3); }, R: function (x) { return cos(x) + cos(PI / 3); }, ok: false }
  ];

  TV.widget('#w-verify', {
    title: 'ตรวจสอบเอกลักษณ์ด้วยกราฟ',
    badge: 'เลือกดูได้',
    desc: 'เอกลักษณ์ที่จริงจะให้กราฟสองข้างทับกันสนิททุกจุด ส่วนสมการที่ไม่ใช่เอกลักษณ์จะเห็นเส้นแยกกันทันที — ลองเลือกอันที่มีเครื่องหมาย ⚠ ดู',
    plot: { xmin: -TAU, xmax: TAU, ymin: -2.6, ymax: 2.6, ratio: 0.44, minH: 250, maxH: 330, pad: 20 },
    controls: [
      { type: 'select', key: 'id', label: 'เลือกสมการ', wide: true, options: IDS.map(function (d) { return [d, d.n]; }), value: IDS[0] }
    ],
    hint: 'กราฟทับกันเป็นหลักฐานที่ดีแต่ยังไม่ใช่การพิสูจน์ — ในข้อสอบต้องแสดงการจัดรูปพีชคณิตจากข้างหนึ่งไปยังอีกข้างหนึ่งเสมอ',
    draw: function (p, s, api) {
      var d = s.id;
      p.grid(PI / 4, 0.5, '#f4f2ec');
      p.axes({ xStep: PI / 2, yStep: 1, xLabel: 'pi', digits: 0, xName: 'x', yName: 'y' });
      p.func(d.L, { color: C.sin, w: 8, alpha: 0.28 });
      p.func(d.R, { color: C.cos, w: 2.2, dash: [8, 5] });

      var err = 0;
      for (var i = 0; i <= 900; i++) {
        var x = -TAU + i * TAU * 2 / 900;
        var a = d.L(x), b = d.R(x);
        if (isFinite(a) && isFinite(b)) err = Math.max(err, Math.abs(a - b));
      }
      var good = err < 1e-9;
      p.text(-TAU, 2.6, good ? '✓ ทับกันสนิท — เป็นเอกลักษณ์' : '✗ ไม่ทับกัน — ไม่ใช่เอกลักษณ์', {
        dx: 12, dy: 15, align: 'left', size: 13,
        color: good ? C.tan : '#dc2626', bg: 'rgba(255,255,255,.92)'
      });
      p.text(TAU, -2.6, 'เส้นหนาจาง = ข้างซ้าย   เส้นประ = ข้างขวา', { dx: -8, dy: -12, align: 'right', color: C.faint, size: 10.5 });

      api.stats({
        'สมการ': d.n.replace('⚠ ', ''),
        'ค่าต่างสูงสุด |ซ้าย − ขวา|': { v: good ? '0 (ทุกจุด)' : nf(err, 4), color: good ? C.tan : '#dc2626' },
        'สรุป': { v: good ? 'เป็นเอกลักษณ์' : 'เป็นแค่สมการธรรมดา', color: good ? C.tan : '#dc2626' }
      });
    }
  });

  /* 4.6 พิสูจน์เอกลักษณ์มุมสัมพันธ์ 90°±θ, 180°±θ ด้วยวงกลมหนึ่งหน่วย
     แต่ละแบบคือการ “สะท้อน” (ax = มุมของเส้นสะท้อน) หรือ “หมุน” (rot = องศาที่หมุน)
     sw = true หมายถึงพิกัด x กับ y สลับที่กัน (กลุ่ม 90° และ 270° จึงเปลี่ยนเป็นโคฟังก์ชัน) */
  var REDUCE = [
    {
      n: '180° − θ', c: 180, d: -1, sw: false, ax: 90, rot: 0,
      map: function (x, y) { return [-x, y]; },
      how: 'สะท้อนข้ามแกน y', S: 'sin θ', K: '−cos θ', T: '−tan θ'
    },
    {
      n: '180° + θ', c: 180, d: 1, sw: false, ax: null, rot: 180,
      map: function (x, y) { return [-x, -y]; },
      how: 'หมุนครึ่งรอบ 180°', S: '−sin θ', K: '−cos θ', T: 'tan θ'
    },
    {
      n: '−θ (เท่ากับ 360° − θ)', c: 0, d: -1, sw: false, ax: 0, rot: 0,
      map: function (x, y) { return [x, -y]; },
      how: 'สะท้อนข้ามแกน x', S: '−sin θ', K: 'cos θ', T: '−tan θ'
    },
    {
      n: '90° − θ', c: 90, d: -1, sw: true, ax: 45, rot: 0,
      map: function (x, y) { return [y, x]; },
      how: 'สะท้อนข้ามเส้น y = x', S: 'cos θ', K: 'sin θ', T: 'cot θ'
    },
    {
      n: '90° + θ', c: 90, d: 1, sw: true, ax: null, rot: 90,
      map: function (x, y) { return [-y, x]; },
      how: 'หมุนทวนเข็ม 90°', S: 'cos θ', K: '−sin θ', T: '−cot θ'
    },
    {
      n: '270° − θ', c: 270, d: -1, sw: true, ax: 135, rot: 0,
      map: function (x, y) { return [-y, -x]; },
      how: 'สะท้อนข้ามเส้น y = −x', S: '−cos θ', K: '−sin θ', T: 'cot θ'
    },
    {
      n: '270° + θ', c: 270, d: 1, sw: true, ax: null, rot: -90,
      map: function (x, y) { return [y, -x]; },
      how: 'หมุนตามเข็ม 90°', S: '−cos θ', K: 'sin θ', T: '−cot θ'
    }
  ];

  TV.widget('#w-reduce', {
    title: 'พิสูจน์เอกลักษณ์มุมสัมพันธ์ด้วยวงกลมหนึ่งหน่วย',
    badge: 'เลือก · ลากได้',
    desc: 'P คือจุดของมุม θ ส่วน P′ คือจุดของมุมใหม่ — สามเหลี่ยมมุมฉากสองรูปนี้เท่ากันทุกประการเสมอ พิกัดของ P′ จึงเป็นชุดเดิม เปลี่ยนแค่เครื่องหมายหรือสลับที่ x กับ y',
    plot: { xmin: -1.78, xmax: 1.95, ymin: -1.5, ymax: 1.62, equal: true, ratio: 0.63, minH: 340, maxH: 480 },
    controls: [
      {
        type: 'select', key: 'r', label: 'มุมใหม่', wide: true,
        options: REDUCE.map(function (d) { return [d, d.n]; }), value: REDUCE[0]
      },
      { type: 'range', key: 'th', label: 'มุม θ', min: 8, max: 82, step: 0.5, value: 35, fmt: degFmt },
      { type: 'check', key: 'tri', label: 'สามเหลี่ยมมุมฉาก', value: true }
    ],
    hint: 'ไม่ต้องท่องสิบกว่าบรรทัด — วาดวงกลมแล้วอ่านพิกัดของ P′ ก็ได้ทั้ง sin และ cos พร้อมเครื่องหมายในคราวเดียว (รูปนี้ตั้ง θ เป็นมุมแหลมเพื่อให้เห็นภาพชัด ส่วนการพิสูจน์ที่ครอบคลุมทุกค่าของ θ ใช้สูตรผลบวกมุมจากหัวข้อ 4.3)',
    onPointer: function (p, s, wx, wy) {
      if (Math.hypot(wx, wy) > 1.6) return false;
      s.th = clamp(r2d(Math.atan2(Math.abs(wy), Math.abs(wx))), 8, 82);
      return true;
    },
    draw: function (p, s, api) {
      var d = s.r, th = d2r(s.th);
      var x = cos(th), y = sin(th);
      var q = d.map(x, y);
      var tgt = d.c + d.d * s.th;
      var tt = d2r(tgt);
      var name = d.n.split(' (')[0];

      p.grid(0.5, 0.5, '#f6f4ee');
      p.axes({ xStep: 1, yStep: 1, digits: 0, xName: 'x', yName: 'y' });
      p.circle(0, 0, 1, { color: '#b8b4aa', w: 2 });

      /* ---- เส้นสะท้อน หรือ ส่วนโค้งบอกการหมุน ---- */
      if (d.ax !== null) {
        var a = d2r(d.ax), L = 1.36;
        p.line(-L * cos(a), -L * sin(a), L * cos(a), L * sin(a), { color: C.tan, w: 1.7, dash: [7, 5] });
        p.text(-L * cos(a), -L * sin(a), d.how, {
          dy: d.ax === 0 ? -14 : 14, color: C.tan, size: 10.5, bg: 'rgba(255,255,255,.9)'
        });
      } else {
        var rr = d2r(d.rot), R = 1.22;
        p.arc(0, 0, R, th, th + rr, { color: C.tan, w: 1.8, dash: [6, 4] });
        var e0 = th + rr * 0.94;
        p.arrow(R * cos(e0), R * sin(e0), R * cos(th + rr), R * sin(th + rr), { color: C.tan, w: 1.8, head: 9 });
        var mid = th + rr / 2;
        p.text(R * cos(mid), R * sin(mid), d.how, { color: C.tan, size: 10.5, bg: 'rgba(255,255,255,.92)' });
      }

      /* ---- สามเหลี่ยมมุมฉากสองรูปที่เท่ากันทุกประการ ---- */
      if (s.tri) {
        p.poly([[0, 0], [x, 0], [x, y]], { fill: 'rgba(124,58,237,.09)', color: C.hyp, w: 1.3 });
        p.poly([[0, 0], [q[0], 0], [q[0], q[1]]], { fill: 'rgba(4,120,87,.10)', color: C.tan, w: 1.3, dash: [5, 4] });
        p.rightAngle(x, 0, -Math.sign(x), 0, 0, Math.sign(y), 9, C.soft);
        p.rightAngle(q[0], 0, -Math.sign(q[0]), 0, 0, Math.sign(q[1]), 9, C.soft);
      }

      /* ---- ด้านประกอบ: ระบายสีตาม “ความยาว” ไม่ใช่ตามทิศ จึงเห็นชัดว่าคู่ไหนสลับที่กัน ---- */
      var hCol = d.sw ? C.sin : C.cos;     /* สีของด้านแนวนอนของ P′ */
      var vCol = d.sw ? C.cos : C.sin;

      p.line(0, 0, x, 0, { color: C.cos, w: 5 });
      p.line(x, 0, x, y, { color: C.sin, w: 5 });
      p.line(0, 0, x, y, { color: C.hyp, w: 2.4 });

      p.line(0, 0, q[0], 0, { color: hCol, w: 5 });
      p.line(q[0], 0, q[0], q[1], { color: vCol, w: 5 });
      p.line(0, 0, q[0], q[1], { color: C.hyp, w: 2.4, dash: [7, 4] });

      /* ---- มุม θ และมุมใหม่ ---- */
      p.arc(0, 0, 0.3, 0, th, { fill: 'rgba(180,83,9,.14)', color: C.accent, w: 1.8 });
      p.text(0.3 * cos(th / 2), 0.3 * sin(th / 2), 'θ', {
        dx: 20 * cos(th / 2), dy: -20 * sin(th / 2), color: C.accent, size: 12.5
      });
      p.arc(0, 0, 0.62, 0, tt, { color: '#9ecabc', w: 1.6 });   /* มุมใหม่ วัดจากแกน x เหมือนกัน */

      /* ---- จุดและป้าย ---- */
      p.dot(x, y, { fill: C.hyp, r: 7, halo: C.hyp });
      p.dot(q[0], q[1], { fill: C.tan, r: 7, halo: C.tan });
      p.dot(0, 0, { fill: C.ink, r: 3.5 });

      p.text(x, y, 'P (cos θ, sin θ)', {
        dx: 13, dy: -13, align: 'left', color: C.hyp, size: 11.5, bg: 'rgba(255,255,255,.92)'
      });
      p.text(q[0], q[1], 'P′ (' + d.K + ', ' + d.S + ')', {
        dx: q[0] >= 0 ? 13 : -13, dy: q[1] >= 0 ? -13 : 15,
        align: q[0] >= 0 ? 'left' : 'right', color: C.tan, size: 11.5, bg: 'rgba(255,255,255,.92)'
      });

      /* ป้ายความยาวด้าน — ของ P′ เลื่อนลงอีกชั้นเมื่อทับแถวเดียวกับของ P */
      p.text(x / 2, 0, 'cos θ', { dy: 15, color: C.cos, size: 11, bg: 'rgba(255,255,255,.9)' });
      p.text(x, y / 2, 'sin θ', { dx: 11, align: 'left', color: C.sin, size: 11, bg: 'rgba(255,255,255,.9)' });
      p.text(q[0] / 2, 0, d.sw ? 'sin θ' : 'cos θ', {
        dy: q[1] >= 0 ? (q[0] > 0 ? 33 : 15) : (q[0] > 0 ? -32 : -15),
        color: hCol, size: 11, bg: 'rgba(255,255,255,.9)'
      });
      /* ถ้า P′ อยู่ควอดรันต์เดียวกับ P (กรณี 90° − θ) ให้ป้ายหลบไปอีกฝั่งของด้าน จะได้ไม่ทับกัน */
      var same = Math.sign(q[0]) === Math.sign(x) && Math.sign(q[1]) === Math.sign(y);
      var vdx = (q[0] >= 0 ? 11 : -11) * (same ? -1 : 1);
      p.text(q[0], q[1] / 2, d.sw ? 'cos θ' : 'sin θ', {
        dx: vdx, align: vdx >= 0 ? 'left' : 'right',
        color: vCol, size: 11, bg: 'rgba(255,255,255,.9)'
      });

      /* ---- เอกลักษณ์ที่อ่านได้จากรูปตรง ๆ ---- */
      p.text(-1.78, 1.62, 'cos(' + name + ') = ' + d.K, {
        dx: 8, dy: 13, align: 'left', color: C.cos, size: 12.5, bg: 'rgba(255,255,255,.92)'
      });
      p.text(-1.78, 1.62, 'sin(' + name + ') = ' + d.S, {
        dx: 8, dy: 33, align: 'left', color: C.sin, size: 12.5, bg: 'rgba(255,255,255,.92)'
      });

      api.stats({
        'มุมใหม่': nf(tgt, 1) + '°',
        'การแปลงจุด': d.how,
        'P (มุม θ)': { v: '(' + nf(x, 3) + ', ' + nf(y, 3) + ')', color: C.hyp },
        'P′ (มุมใหม่)': { v: '(' + nf(q[0], 3) + ', ' + nf(q[1], 3) + ')', color: C.tan },
        'cos มุมใหม่ = พิกัด x': { v: nf(q[0], 3) + ' = ' + d.K, color: C.cos },
        'sin มุมใหม่ = พิกัด y': { v: nf(q[1], 3) + ' = ' + d.S, color: C.sin },
        'tan มุมใหม่': { v: d.T, color: C.tan }
      });
    }
  });

  /* 4.4 รวมคลื่น a sin x + b cos x */
  TV.widget('#w-combine', {
    title: 'รวมสองคลื่นเป็นคลื่นเดียว',
    badge: 'ปรับ a, b',
    desc: 'a·sin x + b·cos x บวกกันได้เป็นคลื่นรูปไซน์ลูกเดียวเสมอ คือ R·sin(x + α) — เส้นประสีเขียวคือคลื่นลูกเดียวนั้น ทับกับผลบวกพอดี',
    plot: { xmin: -PI, xmax: 3 * PI, ymin: -4.6, ymax: 4.6, ratio: 0.48, minH: 270, maxH: 360, pad: 20 },
    controls: [
      { type: 'range', key: 'a', label: 'a — สัมประสิทธิ์ของ sin x', min: -3, max: 3, step: 0.1, value: 3, fmt: function (v) { return nf(v, 1); } },
      { type: 'range', key: 'b', label: 'b — สัมประสิทธิ์ของ cos x', min: -3, max: 3, step: 0.1, value: 2, fmt: function (v) { return nf(v, 1); } },
      { type: 'check', key: 'parts', label: 'แสดงคลื่นย่อย', value: true }
    ],
    hint: 'R = √(a² + b²) และ tan α = b/a — เทคนิคนี้ใช้แก้สมการอย่าง 3 sin x + 4 cos x = 2 ได้ทันที เพราะแปลงเหลือ sin ตัวเดียว',
    draw: function (p, s, api) {
      var R = Math.hypot(s.a, s.b), al = Math.atan2(s.b, s.a);
      p.grid(PI / 4, 1, '#f4f2ec');
      p.axes({ xStep: PI / 2, yStep: 1, xLabel: 'pi', digits: 0, xName: 'x', yName: 'y' });

      if (s.parts) {
        p.func(function (x) { return s.a * sin(x); }, { color: C.sin, w: 1.7, dash: [6, 4], alpha: .85 });
        p.func(function (x) { return s.b * cos(x); }, { color: C.cos, w: 1.7, dash: [6, 4], alpha: .85 });
      }
      p.func(function (x) { return s.a * sin(x) + s.b * cos(x); }, { color: C.hyp, w: 4.5, alpha: .35 });
      p.func(function (x) { return R * sin(x + al); }, { color: C.tan, w: 2.2, dash: [9, 5] });

      p.line(-PI, R, 3 * PI, R, { color: '#e0dcd2', w: 1, dash: [3, 4] });
      p.line(-PI, -R, 3 * PI, -R, { color: '#e0dcd2', w: 1, dash: [3, 4] });
      var xp = -al + PI / 2;
      while (xp < -PI) xp += TAU;
      while (xp > 3 * PI) xp -= TAU;
      p.dot(xp, R, { fill: C.tan, r: 5.5 });
      p.measure(xp, 0, xp, R, 26, 'R = ' + nf(R, 3), C.tan);

      p.text(-PI, 4.6, 'y = ' + nf(s.a, 1) + ' sin x ' + (s.b >= 0 ? '+ ' : '− ') + nf(Math.abs(s.b), 1) + ' cos x  =  ' + nf(R, 2) + ' sin(x ' + (al >= 0 ? '+ ' : '− ') + nf(Math.abs(al), 2) + ')', {
        dx: 10, dy: 15, align: 'left', color: C.ink, size: 12.5, mono: true, bg: 'rgba(255,255,255,.92)'
      });

      api.stats({
        'R = √(a²+b²)': { v: nf(R, 4), color: C.tan },
        'α': { v: nf(r2d(al), 2) + '°  (' + nf(al, 3) + ' rad)', color: C.hyp },
        'ค่าสูงสุด': nf(R, 3),
        'ค่าต่ำสุด': nf(-R, 3)
      });
    }
  });

  /* =====================================================================
     บทที่ 5 — สมการตรีโกณ
     ===================================================================== */

  /* หาคำตอบทั้งหมดของ f(x) = k ในช่วง [lo, hi] */
  function solveTrig(f, k, lo, hi) {
    var out = [], n, a;
    if (f === 'tan') {
      a = Math.atan(k);
      for (n = -5; n <= 5; n++) out.push(n * PI + a);
    } else if (Math.abs(k) <= 1) {
      if (f === 'sin') {
        a = Math.asin(k);
        for (n = -3; n <= 3; n++) { out.push(2 * n * PI + a); out.push((2 * n + 1) * PI - a); }
      } else {
        a = Math.acos(k);
        for (n = -3; n <= 3; n++) { out.push(2 * n * PI + a); out.push(2 * n * PI - a); }
      }
    }
    return out
      .filter(function (x) { return x >= lo - 1e-9 && x <= hi + 1e-9; })
      .sort(function (p, q) { return p - q; })
      .filter(function (x, i, arr) { return i === 0 || Math.abs(x - arr[i - 1]) > 1e-6; });
  }

  /* เขียนคำตอบเป็นข้อความ ตามหน่วยที่เลือก */
  function solText(x, unit) {
    return unit === 'deg' ? nf(r2d(x), 1) + '°' : (exactPi(x) || nf(x, 3));
  }
  function solList(arr, unit) {
    return arr.length ? arr.map(function (x) { return solText(x, unit); }).join(', ') : '— ไม่มี';
  }

  var GEN_FORM = {
    sin: 'x = 2nπ + α  หรือ  x = (2n+1)π − α',
    cos: 'x = 2nπ + α  หรือ  x = 2nπ − α',
    tan: 'x = nπ + α'
  };

  /* 5.1 สมการพื้นฐานและคำตอบทั่วไป */
  TV.widget('#w-solve', {
    title: 'สมการพื้นฐาน f(x) = k มีคำตอบกี่ตัว',
    badge: 'ปรับค่าได้',
    desc: 'เลื่อนค่า k แล้วนับจุดตัด — เส้นตรงตัดกราฟกี่จุด สมการก็มีคำตอบเท่านั้น และเพราะกราฟซ้ำตัวเองไปเรื่อย ๆ คำตอบจึงไม่มีวันหมด',
    plot: { xmin: -TAU - 0.35, xmax: TAU + 0.35, ymin: -1.75, ymax: 1.75, ratio: 0.4, minH: 280, maxH: 360, pad: 20 },
    controls: [
      { type: 'seg', key: 'f', label: 'ฟังก์ชัน', options: [['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan']], value: 'sin' },
      { type: 'range', key: 'k', label: 'ค่า k', min: -1.3, max: 1.3, step: 0.01, value: 0.5, fmt: function (v) { return nf(v, 2); } },
      { type: 'seg', key: 'u', label: 'หน่วย', options: [['deg', 'องศา'], ['rad', 'เรเดียน']], value: 'deg' },
      { type: 'check', key: 'win', label: 'เน้นช่วง [0, 2π)', value: true }
    ],
    hint: 'จุดตัดในช่วง [0, 2π) คือ “คำตอบหลัก” ส่วนจุดที่เหลือคือคำตอบเดิมบวกลบไปทีละหนึ่งคาบ — นี่คือที่มาของตัว n ในคำตอบทั่วไป',
    draw: function (p, s, api) {
      var isTan = s.f === 'tan';
      var YM = isTan ? 3.2 : 1.75;
      p.setBounds({ ymin: -YM, ymax: YM });
      var fn = s.f === 'sin' ? sin : s.f === 'cos' ? cos : tan;
      var col = s.f === 'sin' ? C.sin : s.f === 'cos' ? C.cos : C.tan;

      p.grid(PI / 4, isTan ? 1 : 0.5, '#f4f2ec');
      if (s.win) {
        p.poly([[0, -YM], [TAU, -YM], [TAU, YM], [0, YM]], { fill: 'rgba(29,78,216,.045)' });
      }
      p.axes({ xStep: PI / 2, yStep: isTan ? 1 : 0.5, xLabel: 'pi', digits: 1, yDigits: isTan ? 0 : 1, xName: 'x', yName: 'y' });

      if (isTan) {
        for (var a = -1.5 * PI; a <= 1.5 * PI + 0.1; a += PI) {
          p.line(a, -YM, a, YM, { color: '#f0b8b0', w: 1.3, dash: [5, 5] });
        }
      }
      p.func(fn, { color: col, w: 2.8, jump: YM });
      p.line(-TAU - 0.35, s.k, TAU + 0.35, s.k, { color: C.accent, w: 2, dash: [8, 5] });
      p.text(-TAU - 0.35, s.k, 'y = ' + nf(s.k, 2), { dx: 8, dy: -11, align: 'left', color: C.accent, size: 12, bg: 'rgba(255,255,255,.9)' });

      var all = solveTrig(s.f, s.k, -TAU, TAU);
      var main = solveTrig(s.f, s.k, 0, TAU - 1e-6);
      all.forEach(function (x) {
        var inWin = x >= -1e-9 && x < TAU - 1e-9;
        var c = (s.win && !inWin) ? '#c9c5bb' : col;
        p.line(x, 0, x, s.k, { color: c, w: 1.2, dash: [4, 4] });
        p.dot(x, s.k, { fill: c, r: inWin ? 6 : 4.5 });
        if (inWin) {
          p.text(x, 0, solText(x, s.u), { dy: s.k >= 0 ? 16 : -16, color: col, size: 11, bg: 'rgba(255,255,255,.92)' });
        }
      });

      if (!all.length) {
        p.text(0, YM * 0.62, '|k| > 1 จึงไม่มีคำตอบ — เพราะ ' + s.f + ' มีค่าอยู่ระหว่าง −1 ถึง 1 เท่านั้น', {
          color: '#dc2626', size: 13, bg: 'rgba(255,255,255,.92)'
        });
      }

      var alpha = s.f === 'sin' ? Math.asin(clamp(s.k, -1, 1))
                : s.f === 'cos' ? Math.acos(clamp(s.k, -1, 1)) : Math.atan(s.k);
      api.stats({
        'สมการ': s.f + ' x = ' + nf(s.k, 2),
        'α (จากเครื่องคิดเลข)': { v: all.length ? solText(alpha, s.u) : '—', color: C.accent },
        'คำตอบใน [0, 2π)': { v: solList(main, s.u), color: col },
        'จำนวนคำตอบต่อหนึ่งคาบ': all.length ? main.length : 0,
        'คำตอบทั่วไป': { v: all.length ? GEN_FORM[s.f] : 'ไม่มีคำตอบ', color: all.length ? C.hyp : '#dc2626' }
      });
    }
  });

  /* 5.2 สมการมุมหลายเท่า */
  TV.widget('#w-multiangle', {
    title: 'สมการมุมหลายเท่า sin(Bx) = k',
    badge: 'ปรับ B',
    desc: 'เพิ่มค่า B แล้วนับจุดตัดในช่วง [0, 2π) — ทุกครั้งที่ B เพิ่มขึ้นหนึ่ง จำนวนคำตอบจะเพิ่มขึ้นเป็นเท่าตัวตาม เพราะกราฟบีบให้ครบรอบมากขึ้นในช่วงเดิม',
    plot: { xmin: -0.35, xmax: TAU + 0.35, ymin: -1.75, ymax: 1.75, ratio: 0.36, minH: 250, maxH: 320, pad: 20 },
    controls: [
      { type: 'range', key: 'B', label: 'B — ตัวคูณมุม', min: 1, max: 5, step: 1, value: 2, fmt: function (v) { return nf(v, 0); } },
      { type: 'range', key: 'k', label: 'ค่า k', min: -0.98, max: 0.98, step: 0.02, value: 0.5, fmt: function (v) { return nf(v, 2); } },
      { type: 'seg', key: 'u', label: 'หน่วย', options: [['deg', 'องศา'], ['rad', 'เรเดียน']], value: 'deg' }
    ],
    hint: 'วิธีทำที่ถูกต้อง: แทน u = Bx ก่อน แล้วสังเกตว่าถ้า x วิ่งใน [0, 2π) แปลว่า u วิ่งใน [0, 2πB) — ต้องหาคำตอบของ u ให้ครบทุกรอบ แล้วค่อยหารด้วย B',
    draw: function (p, s, api) {
      p.grid(PI / 4, 0.5, '#f4f2ec');
      p.axes({ xStep: PI / 2, yStep: 0.5, xLabel: 'pi', digits: 1, yDigits: 1, xName: 'x', yName: 'y' });
      p.func(function (x) { return sin(s.B * x); }, { from: 0, to: TAU, color: C.sin, w: 2.8 });
      p.line(-0.35, s.k, TAU + 0.35, s.k, { color: C.accent, w: 2, dash: [8, 5] });

      var sols = solveTrig('sin', s.k, 0, TAU * s.B - 1e-6).map(function (u) { return u / s.B; });
      sols.forEach(function (x) {
        p.line(x, 0, x, s.k, { color: C.sin, w: 1.1, dash: [4, 4] });
        p.dot(x, s.k, { fill: C.sin, r: 5.5 });
      });
      p.text(TAU / 2, -1.75, 'y = sin(' + s.B + 'x)', { dy: -14, color: C.sin, size: 13 });
      p.text(TAU + 0.35, s.k, 'y = ' + nf(s.k, 2), { dx: -6, dy: -11, align: 'right', color: C.accent, size: 12, bg: 'rgba(255,255,255,.9)' });

      api.stats({
        'สมการ': 'sin(' + s.B + 'x) = ' + nf(s.k, 2),
        'ช่วงของ u = Bx': { v: '[0, ' + (2 * s.B) + 'π)', color: C.hyp },
        'จำนวนคำตอบใน [0, 2π)': { v: String(sols.length), color: C.accent },
        'คำตอบ': { v: solList(sols, s.u), color: C.sin }
      });
    }
  });

  /* 5.3 กับดักคำตอบหาย */
  TV.widget('#w-lost-roots', {
    title: 'กับดัก: หารทิ้งแล้วคำตอบหาย',
    badge: 'สลับวิธีดู',
    desc: 'แก้ sin 2x = sin x ในช่วง [0, 2π] — สองวิธีนี้ต่างกันแค่บรรทัดเดียว แต่ได้คำตอบไม่เท่ากัน ลองสลับดูว่าหายไปกี่ตัว',
    plot: { xmin: -0.35, xmax: TAU + 0.35, ymin: -1.5, ymax: 1.5, ratio: 0.4, minH: 260, maxH: 340, pad: 20 },
    controls: [
      {
        type: 'seg', key: 'm', label: 'วิธีทำ',
        options: [['bad', 'หารด้วย sin x'], ['good', 'แยกตัวประกอบ']], value: 'bad'
      }
    ],
    hint: 'กฎเหล็ก: ห้ามหารทั้งสองข้างด้วยนิพจน์ที่อาจเป็นศูนย์ — ให้ย้ายมาข้างเดียวกันแล้วแยกตัวประกอบเสมอ',
    draw: function (p, s, api) {
      var keep = [PI / 3, 5 * PI / 3];          /* จาก cos x = 1/2 */
      var lost = [0, PI, TAU];                   /* จาก sin x = 0 */
      p.grid(PI / 4, 0.5, '#f4f2ec');
      p.axes({ xStep: PI / 2, yStep: 0.5, xLabel: 'pi', digits: 1, yDigits: 1, xName: 'x', yName: 'y' });
      p.func(function (x) { return sin(2 * x); }, { from: 0, to: TAU, color: C.sin, w: 2.6 });
      p.func(sin, { from: 0, to: TAU, color: C.cos, w: 2.6, dash: [8, 5] });
      p.text(PI / 4, 1.5, 'y = sin 2x', { dy: 14, color: C.sin, size: 12 });
      p.text(PI / 2, 1, 'y = sin x', { dx: 16, dy: -12, align: 'left', color: C.cos, size: 12 });

      keep.forEach(function (x) {
        p.dot(x, sin(x), { fill: C.tan, r: 7, halo: C.tan });
        p.text(x, sin(x), TV.radLabel(x), { dy: sin(x) >= 0 ? -17 : 17, color: C.tan, size: 11.5, bg: 'rgba(255,255,255,.92)' });
      });
      lost.forEach(function (x) {
        var bad = s.m === 'bad';
        p.dot(x, 0, { fill: bad ? '#ffffff' : C.tan, r: 7, ring: bad ? '#dc2626' : '#ffffff', w: 2.5, halo: bad ? '#dc2626' : C.tan });
        p.text(x, 0, (bad ? '✗ ' : '') + TV.radLabel(x), {
          dy: 20, color: bad ? '#dc2626' : C.tan, size: 11.5, bg: 'rgba(255,255,255,.92)'
        });
      });

      var bad = s.m === 'bad';
      p.text(TAU / 2, -1.5, bad ? 'หารด้วย sin x  →  cos x = 1/2  →  ได้แค่ 2 คำตอบ' :
                                  'sin x (2 cos x − 1) = 0  →  ได้ครบ 5 คำตอบ', {
        dy: -12, color: bad ? '#dc2626' : C.tan, size: 13, bg: 'rgba(255,255,255,.92)'
      });

      api.stats({
        'วิธีที่ใช้': bad ? 'หารทั้งสองข้างด้วย sin x' : 'ย้ายข้างแล้วแยกตัวประกอบ',
        'คำตอบที่ได้': { v: bad ? '2 ตัว' : '5 ตัว', color: bad ? '#dc2626' : C.tan },
        'คำตอบที่หายไป': { v: bad ? '0, π, 2π  (จุดวงแดง)' : 'ไม่มี', color: bad ? '#dc2626' : C.tan },
        'สาเหตุ': bad ? 'sin x เป็นศูนย์ได้ จึงหารไม่ได้' : 'ผลคูณเป็นศูนย์ ⇒ ตัวใดตัวหนึ่งเป็นศูนย์'
      });
    }
  });

  /* 5.4 สมการรูป a sin x + b cos x = c */
  TV.widget('#w-linear-combo', {
    title: 'สมการรูป a sin x + b cos x = c',
    badge: 'ปรับ a, b, c',
    desc: 'รวมสองพจน์เป็นคลื่นลูกเดียว R sin(x + α) ก่อน แล้วสมการก็เหลือแบบพื้นฐาน — ลองดันค่า c ให้เกินแถบ ±R ดูว่าเกิดอะไรขึ้น',
    plot: { xmin: -0.35, xmax: TAU + 0.35, ymin: -6.6, ymax: 6.6, ratio: 0.44, minH: 280, maxH: 360, pad: 20 },
    controls: [
      { type: 'range', key: 'a', label: 'a (สัมประสิทธิ์ sin x)', min: -4, max: 4, step: 0.1, value: 3, fmt: function (v) { return nf(v, 1); } },
      { type: 'range', key: 'b', label: 'b (สัมประสิทธิ์ cos x)', min: -4, max: 4, step: 0.1, value: 4, fmt: function (v) { return nf(v, 1); } },
      { type: 'range', key: 'c', label: 'c (ข้างขวา)', min: -6, max: 6, step: 0.1, value: 2, fmt: function (v) { return nf(v, 1); } },
      { type: 'seg', key: 'u', label: 'หน่วย', options: [['deg', 'องศา'], ['rad', 'เรเดียน']], value: 'deg' }
    ],
    hint: 'เงื่อนไขมีคำตอบคือ |c| ≤ R เท่านั้น — โจทย์ที่ถามว่า “สมการนี้มีคำตอบหรือไม่” ตอบได้ทันทีโดยไม่ต้องแก้ เพียงเทียบ |c| กับ √(a²+b²)',
    draw: function (p, s, api) {
      var R = Math.hypot(s.a, s.b), al = Math.atan2(s.b, s.a);
      var g = function (x) { return s.a * sin(x) + s.b * cos(x); };
      p.grid(PI / 4, 1, '#f4f2ec');
      p.axes({ xStep: PI / 2, yStep: 1, xLabel: 'pi', digits: 0, xName: 'x', yName: 'y' });

      p.poly([[-0.35, -R], [TAU + 0.35, -R], [TAU + 0.35, R], [-0.35, R]], { fill: 'rgba(4,120,87,.06)' });
      [R, -R].forEach(function (y) {
        p.line(-0.35, y, TAU + 0.35, y, { color: C.tan, w: 1.4, dash: [4, 4] });
      });
      p.text(TAU + 0.35, R, 'R = ' + nf(R, 2), { dx: -6, dy: -11, align: 'right', color: C.tan, size: 11.5, bg: 'rgba(255,255,255,.9)' });

      p.func(g, { from: 0, to: TAU, color: C.hyp, w: 3 });
      p.line(-0.35, s.c, TAU + 0.35, s.c, { color: C.accent, w: 2, dash: [8, 5] });

      var sols = R < 1e-9 ? [] : solveTrig('sin', s.c / R, 0, TAU - 1e-6).map(function (u) {
        var x = u - al;
        while (x < 0) x += TAU;
        while (x >= TAU) x -= TAU;
        return x;
      }).sort(function (m, n) { return m - n; });

      sols.forEach(function (x) {
        p.line(x, 0, x, s.c, { color: C.hyp, w: 1.1, dash: [4, 4] });
        p.dot(x, s.c, { fill: C.hyp, r: 6 });
        p.text(x, s.c, solText(x, s.u), { dy: s.c >= 0 ? -16 : 16, color: C.hyp, size: 11, bg: 'rgba(255,255,255,.92)' });
      });

      var ok = Math.abs(s.c) <= R + 1e-9;
      p.text(-0.35, 6.6, (ok ? '✓ |c| ≤ R จึงมีคำตอบ' : '✗ |c| > R เส้นตรงอยู่นอกแถบ จึงไม่มีคำตอบ'), {
        dx: 10, dy: 15, align: 'left', size: 13, color: ok ? C.tan : '#dc2626', bg: 'rgba(255,255,255,.92)'
      });

      api.stats({
        'R = √(a²+b²)': { v: nf(R, 4), color: C.tan },
        'α': { v: solText(al, s.u), color: C.hyp },
        'แปลงเป็น': nf(R, 2) + ' sin(x + α) = ' + nf(s.c, 1),
        'sin(x + α) =': { v: R < 1e-9 ? '—' : nf(s.c / R, 3), color: C.accent },
        'จำนวนคำตอบใน [0, 2π)': { v: String(sols.length), color: ok ? C.tan : '#dc2626' },
        'คำตอบ': { v: solList(sols, s.u), color: C.hyp }
      });
    }
  });

  /* =====================================================================
     บทที่ 6 — กฎไซน์และกฎโคไซน์
     ===================================================================== */

  /* ด้านและมุมของสามเหลี่ยมจากพิกัดจุดยอดสามจุด (ด้าน a อยู่ตรงข้ามมุม A) */
  function triSolve(A, B, Cv) {
    var a = Math.hypot(B[0] - Cv[0], B[1] - Cv[1]);
    var b = Math.hypot(A[0] - Cv[0], A[1] - Cv[1]);
    var c = Math.hypot(A[0] - B[0], A[1] - B[1]);
    var AA = Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c), -1, 1));
    var BB = Math.acos(clamp((a * a + c * c - b * b) / (2 * a * c), -1, 1));
    return { a: a, b: b, c: c, A: AA, B: BB, C: PI - AA - BB };
  }

  /* จุดศูนย์กลางและรัศมีของวงกลมล้อมรอบ */
  function circumCircle(A, B, Cv) {
    var d = 2 * (A[0] * (B[1] - Cv[1]) + B[0] * (Cv[1] - A[1]) + Cv[0] * (A[1] - B[1]));
    if (Math.abs(d) < 1e-9) return null;
    var A2 = A[0] * A[0] + A[1] * A[1], B2 = B[0] * B[0] + B[1] * B[1], C2 = Cv[0] * Cv[0] + Cv[1] * Cv[1];
    var ux = (A2 * (B[1] - Cv[1]) + B2 * (Cv[1] - A[1]) + C2 * (A[1] - B[1])) / d;
    var uy = (A2 * (Cv[0] - B[0]) + B2 * (A[0] - Cv[0]) + C2 * (B[0] - A[0])) / d;
    return [ux, uy, Math.hypot(ux - A[0], uy - A[1])];
  }

  /* วาดส่วนโค้งมุมภายในที่จุดยอด V ระหว่างแขนที่ชี้ไป P1 และ P2 · คืนมุมกึ่งกลางไว้วางป้าย */
  function arcAt(p, V, P1, P2, r, opt) {
    var a1 = Math.atan2(P1[1] - V[1], P1[0] - V[0]);
    var a2 = Math.atan2(P2[1] - V[1], P2[0] - V[0]);
    var d = a2 - a1;
    while (d <= -PI) d += TAU;
    while (d > PI) d -= TAU;
    p.arc(V[0], V[1], r, a1, a1 + d, opt);
    return a1 + d / 2;
  }

  /* 6.1 กฎของไซน์ — สามอัตราส่วนที่เท่ากันเสมอ */
  function seedTri(s) {
    if (s.ax === undefined) {
      s.ax = 0.5; s.ay = 0.5; s.bx = 4.4; s.by = 0.5; s.cx = 3.1; s.cy = 3.1; s.d = -1;
    }
  }

  TV.widget('#w-lawsines', {
    title: 'กฎของไซน์ — สามอัตราส่วนที่เท่ากันเสมอ',
    badge: 'ลากจุดยอดได้',
    desc: 'ลากจุดยอดให้เป็นสามเหลี่ยมรูปไหนก็ได้ แล้วดูสามค่าในแถบด้านล่าง — ไม่ว่าจะบิดรูปอย่างไร ทั้งสามก็เท่ากันเสมอ และเท่ากับเส้นผ่านศูนย์กลางของวงกลมล้อมรอบพอดี',
    plot: { xmin: -1.4, xmax: 6.6, ymin: -1.4, ymax: 4.8, equal: true, ratio: 0.68, minH: 300, maxH: 430 },
    controls: [
      { type: 'check', key: 'circ', label: 'แสดงวงกลมล้อมรอบ', value: true },
      {
        type: 'button', label: 'รีเซ็ตรูป', action: function (api) {
          var s = api.state;
          s.ax = 0.5; s.ay = 0.5; s.bx = 4.4; s.by = 0.5; s.cx = 3.1; s.cy = 3.1;
          api.redraw();
        }
      }
    ],
    hint: 'ค่าที่เท่ากันทั้งสามนั้นคือ 2R เมื่อ R เป็นรัศมีวงกลมล้อมรอบ — นี่คือเหตุผลเชิงเรขาคณิตว่าทำไมกฎไซน์ถึงเป็นจริง ไม่ใช่เรื่องบังเอิญ',
    onPointer: function (p, s, wx, wy, phase) {
      seedTri(s);
      if (phase === 'up') { s.d = -1; return; }
      var pts = [[s.ax, s.ay], [s.bx, s.by], [s.cx, s.cy]];
      if (phase === 'down') {
        var best = -1, bd = 0.6;
        pts.forEach(function (v, i) {
          var dd = Math.hypot(v[0] - wx, v[1] - wy);
          if (dd < bd) { bd = dd; best = i; }
        });
        s.d = best;
        return best >= 0;
      }
      if (s.d < 0) return;
      pts[s.d] = [clamp(wx, -0.3, 5.9), clamp(wy, -0.3, 4.1)];
      var ar = Math.abs((pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) -
                        (pts[2][0] - pts[0][0]) * (pts[1][1] - pts[0][1])) / 2;
      if (ar < 1.1) return;   /* กันรูปแบนจนวงกลมล้อมรอบใหญ่เกินกรอบ */
      s.ax = pts[0][0]; s.ay = pts[0][1];
      s.bx = pts[1][0]; s.by = pts[1][1];
      s.cx = pts[2][0]; s.cy = pts[2][1];
    },
    draw: function (p, s, api) {
      seedTri(s);
      var A = [s.ax, s.ay], B = [s.bx, s.by], Cv = [s.cx, s.cy];
      var t = triSolve(A, B, Cv);
      var cc = circumCircle(A, B, Cv);

      p.grid(1, 1, '#f5f3ed');
      if (s.circ && cc) {
        p.circle(cc[0], cc[1], cc[2], { color: '#c9c5bb', w: 1.6, dash: [6, 5] });
        p.dot(cc[0], cc[1], { fill: '#c9c5bb', r: 3.5 });
        p.text(cc[0], cc[1], 'R = ' + nf(cc[2], 2), { dy: 16, color: C.faint, size: 11, bg: 'rgba(255,255,255,.85)' });
      }
      p.poly([A, B, Cv], { fill: 'rgba(29,78,216,.05)', color: '#4a4842', w: 2.4 });

      /* มุมทั้งสาม */
      var mA = arcAt(p, A, B, Cv, 0.55, { fill: 'rgba(194,65,12,.13)', color: C.cos, w: 2 });
      var mB = arcAt(p, B, Cv, A, 0.55, { fill: 'rgba(29,78,216,.13)', color: C.sin, w: 2 });
      var mC = arcAt(p, Cv, A, B, 0.55, { fill: 'rgba(4,120,87,.13)', color: C.tan, w: 2 });
      p.text(A[0] + 0.85 * cos(mA), A[1] + 0.85 * sin(mA), 'A ' + nf(r2d(t.A), 0) + '°', { color: C.cos, size: 12.5, bg: 'rgba(255,255,255,.85)' });
      p.text(B[0] + 0.85 * cos(mB), B[1] + 0.85 * sin(mB), 'B ' + nf(r2d(t.B), 0) + '°', { color: C.sin, size: 12.5, bg: 'rgba(255,255,255,.85)' });
      p.text(Cv[0] + 0.85 * cos(mC), Cv[1] + 0.85 * sin(mC), 'C ' + nf(r2d(t.C), 0) + '°', { color: C.tan, size: 12.5, bg: 'rgba(255,255,255,.85)' });

      /* ชื่อด้าน วางกลางด้าน เยื้องออกนอกรูป */
      var mid = function (P, Q, O) {
        var mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2;
        var vx = mx - O[0], vy = my - O[1], m = Math.hypot(vx, vy) || 1;
        return [mx + vx / m * 0.34, my + vy / m * 0.34];
      };
      var pa = mid(B, Cv, A), pb = mid(A, Cv, B), pc = mid(A, B, Cv);
      p.text(pa[0], pa[1], 'a = ' + nf(t.a, 2), { color: C.cos, size: 12, bg: 'rgba(255,255,255,.85)' });
      p.text(pb[0], pb[1], 'b = ' + nf(t.b, 2), { color: C.sin, size: 12, bg: 'rgba(255,255,255,.85)' });
      p.text(pc[0], pc[1], 'c = ' + nf(t.c, 2), { color: C.tan, size: 12, bg: 'rgba(255,255,255,.85)' });

      [[A, C.cos], [B, C.sin], [Cv, C.tan]].forEach(function (v) {
        p.dot(v[0][0], v[0][1], { fill: v[1], r: 7, halo: v[1] });
      });

      api.stats({
        'a / sin A': { v: nf(t.a / sin(t.A), 4), color: C.cos },
        'b / sin B': { v: nf(t.b / sin(t.B), 4), color: C.sin },
        'c / sin C': { v: nf(t.c / sin(t.C), 4), color: C.tan },
        '2R (เส้นผ่านศูนย์กลาง)': { v: cc ? nf(2 * cc[2], 4) : '—', color: C.hyp },
        'ผลรวมมุม': nf(r2d(t.A + t.B + t.C), 1) + '°'
      });
    }
  });

  /* 6.2 กรณีกำกวม SSA */
  TV.widget('#w-ambiguous', {
    title: 'กรณีกำกวม — ข้อมูลชุดเดียวแต่ได้สองรูป',
    badge: 'ปรับค่าได้',
    desc: 'รู้มุม A กับด้าน b (ประกอบมุม) และด้าน a (ตรงข้ามมุม A) — ลองเลื่อน a ดูว่าวงกลมตัดเส้นฐานกี่จุด นั่นคือจำนวนสามเหลี่ยมที่เป็นไปได้',
    plot: { xmin: -0.8, xmax: 8.2, ymin: -1.6, ymax: 5.4, equal: true, ratio: 0.6, minH: 300, maxH: 420 },
    controls: [
      { type: 'range', key: 'A', label: 'มุม A', min: 15, max: 80, step: 1, value: 35, fmt: degFmt },
      { type: 'range', key: 'b', label: 'ด้าน b (ประกอบมุม A)', min: 2, max: 4.4, step: 0.05, value: 3.6, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 'a', label: 'ด้าน a (ตรงข้ามมุม A)', min: 0.4, max: 6, step: 0.05, value: 2.6, fmt: function (v) { return nf(v, 2); } },
      { type: 'button', label: 'ให้ได้ 0 รูป', action: function (api) { api.set('a', Math.round(api.state.b * sin(d2r(api.state.A)) * 0.62 * 20) / 20); } },
      { type: 'button', label: 'ให้ได้ 2 รูป', action: function (api) { var h = api.state.b * sin(d2r(api.state.A)); api.set('a', Math.round((h + api.state.b) / 2 * 20) / 20); } },
      { type: 'button', label: 'ให้ได้ 1 รูป', action: function (api) { api.set('a', Math.round(api.state.b * 1.2 * 20) / 20); } }
    ],
    hint: 'เกณฑ์ตัดสินคือความสูง h = b sin A · ถ้า a < h ไม่มีรูป · a = h ได้รูปมุมฉากหนึ่งรูป · h < a < b ได้สองรูป · a ≥ b ได้รูปเดียว',
    draw: function (p, s, api) {
      var Ar = d2r(s.A), Apt = [0, 0];
      var Cv = [s.b * cos(Ar), s.b * sin(Ar)];
      var h = s.b * sin(Ar);
      var disc = s.a * s.a - h * h;

      p.grid(1, 1, '#f5f3ed');
      p.line(-0.8, 0, 8.2, 0, { color: '#b3afa4', w: 2 });                 /* เส้นฐาน */
      p.line(0, 0, Cv[0] * 1.25, Cv[1] * 1.25, { color: '#c9c5bb', w: 1.4, dash: [6, 5] });
      p.line(0, 0, Cv[0], Cv[1], { color: C.sin, w: 3 });
      p.circle(Cv[0], Cv[1], s.a, { color: C.cos, w: 1.6, dash: [6, 5] });
      p.line(Cv[0], Cv[1], Cv[0], 0, { color: C.tan, w: 1.8, dash: [4, 4] });
      p.text(Cv[0], h / 2, 'h = ' + nf(h, 2), { dx: 9, align: 'left', color: C.tan, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.rightAngle(Cv[0], 0, -1, 0, 0, 1, 9, C.tan);

      var xs = [];
      if (disc >= -1e-9) {
        var r = Math.sqrt(Math.max(disc, 0));
        [Cv[0] - r, Cv[0] + r].forEach(function (x) { if (x > 1e-6) xs.push(x); });
        xs = xs.filter(function (x, i, arr) { return i === 0 || Math.abs(x - arr[0]) > 1e-6; });
      }

      var cols = [C.hyp, C.accent];
      xs.forEach(function (x, i) {
        var Bp = [x, 0];
        p.poly([Apt, Bp, Cv], { fill: i === 0 ? 'rgba(124,58,237,.08)' : 'rgba(180,83,9,.08)', color: cols[i], w: 2.4 });
        p.dot(x, 0, { fill: cols[i], r: 7, halo: cols[i] });
        p.text(x, 0, (xs.length > 1 ? 'B' + (i + 1) : 'B'), { dy: 20, color: cols[i], size: 13 });
        p.text(x, 0, 'c = ' + nf(x, 2), { dy: 38, color: cols[i], size: 11, bg: 'rgba(255,255,255,.9)' });
      });

      arcAt(p, Apt, [1, 0], Cv, 0.62, { fill: 'rgba(29,78,216,.13)', color: C.sin, w: 2 });
      p.text(0.95 * cos(Ar / 2), 0.95 * sin(Ar / 2), 'A = ' + nf(s.A, 0) + '°', { color: C.sin, size: 12.5, bg: 'rgba(255,255,255,.88)' });
      p.text(Cv[0] / 2, Cv[1] / 2, 'b = ' + nf(s.b, 2), { dx: -12, dy: -10, align: 'right', color: C.sin, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.dot(Cv[0], Cv[1], { fill: C.sin, r: 7 });
      p.text(Cv[0], Cv[1], 'C', { dx: -6, dy: -16, color: C.sin, size: 13 });
      p.text(0, 0, 'A', { dx: -14, dy: 10, color: C.sin, size: 13 });

      var verdict = s.a < h - 1e-6 ? 'a < h  →  วงกลมไปไม่ถึงเส้นฐาน ไม่มีสามเหลี่ยม'
                  : Math.abs(s.a - h) < 1e-6 ? 'a = h  →  สัมผัสพอดี ได้สามเหลี่ยมมุมฉากหนึ่งรูป'
                  : s.a < s.b - 1e-6 ? 'h < a < b  →  ตัดสองจุด ได้สองสามเหลี่ยม'
                  : 'a ≥ b  →  จุดตัดอีกจุดตกหลังจุด A จึงใช้ไม่ได้ เหลือรูปเดียว';
      api.stats({
        'h = b sin A': { v: nf(h, 3), color: C.tan },
        'a': { v: nf(s.a, 2), color: C.cos },
        'b': { v: nf(s.b, 2), color: C.sin },
        'จำนวนสามเหลี่ยม': { v: String(xs.length), color: xs.length === 0 ? '#dc2626' : xs.length === 2 ? C.accent : C.hyp },
        'เหตุผล': verdict
      });
    }
  });

  /* 6.3 กฎโคไซน์เป็นพีทาโกรัสฉบับขยาย */
  TV.widget('#w-lawcos', {
    title: 'กฎโคไซน์คือพีทาโกรัสที่ถูกขยาย',
    badge: 'หมุนมุม C',
    desc: 'เลื่อนมุม C ผ่าน 90° แล้วเทียบแถบสองอัน — ตรง 90° พอดีสองแถบยาวเท่ากันเป๊ะ นั่นคือพีทาโกรัส ส่วนมุมอื่นจะมีพจน์แก้ 2ab cos C มาชดเชย',
    plot: { xmin: -3.8, xmax: 10.4, ymin: -2.5, ymax: 3.8, equal: true, ratio: 0.44, minH: 280, maxH: 380 },
    controls: [
      { type: 'range', key: 'a', label: 'ด้าน a', min: 1.2, max: 3.2, step: 0.05, value: 2.6, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 'b', label: 'ด้าน b', min: 1.2, max: 3.2, step: 0.05, value: 2.1, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 'C', label: 'มุม C', min: 12, max: 168, step: 1, value: 60, fmt: degFmt },
      { type: 'button', label: 'ตั้งเป็น 90°', primary: true, action: function (api) { api.set('C', 90); } }
    ],
    hint: 'จำง่าย ๆ ว่ากฎโคไซน์คือพีทาโกรัสบวกพจน์แก้ — มุมแหลมทำให้ด้านตรงข้ามสั้นลง มุมป้านทำให้ยาวขึ้น และมุมฉากทำให้พจน์แก้หายไปพอดี',
    draw: function (p, s, api) {
      var Cr = d2r(s.C);
      var Cv = [0, 0], B = [s.a, 0], A = [s.b * cos(Cr), s.b * sin(Cr)];
      var c2 = s.a * s.a + s.b * s.b - 2 * s.a * s.b * cos(Cr);
      var cc = Math.sqrt(c2), ab2 = s.a * s.a + s.b * s.b;

      p.poly([Cv, B, A], { fill: 'rgba(124,58,237,.07)', color: '#4a4842', w: 2.4 });
      p.line(0, 0, s.a, 0, { color: C.cos, w: 3.5 });
      p.line(0, 0, A[0], A[1], { color: C.sin, w: 3.5 });
      p.line(A[0], A[1], s.a, 0, { color: C.hyp, w: 3.5 });
      arcAt(p, Cv, B, A, 0.5, { fill: 'rgba(4,120,87,.14)', color: C.tan, w: 2 });
      if (Math.abs(s.C - 90) < 0.6) p.rightAngle(0, 0, 1, 0, 0, 1, 12, C.tan);
      p.text(1.15 * cos(Cr / 2), 1.15 * sin(Cr / 2), 'C = ' + nf(s.C, 0) + '°', { color: C.tan, size: 12.5, bg: 'rgba(255,255,255,.88)' });
      p.text(s.a / 2, 0, 'a', { dy: 16, color: C.cos, size: 13 });
      p.text(A[0] / 2, A[1] / 2, 'b', { dx: -13, dy: -8, align: 'right', color: C.sin, size: 13 });
      p.text((A[0] + s.a) / 2, A[1] / 2, 'c = ' + nf(cc, 2), { dx: 12, align: 'left', color: C.hyp, size: 12.5, bg: 'rgba(255,255,255,.9)' });

      /* แถบเปรียบเทียบ */
      var X0 = 4.3, W = 5.4, sc = W / ((s.a + s.b) * (s.a + s.b));
      var bar = function (y, len, col, lab) {
        p.poly([[X0, y], [X0 + len * sc, y], [X0 + len * sc, y + 0.62], [X0, y + 0.62]],
               { fill: col, color: '#ffffff', w: 1 });
        p.text(X0, y + 0.31, lab, { dx: 6, align: 'left', color: '#ffffff', size: 12 });
      };
      bar(1.5, ab2, 'rgba(29,78,216,.75)', 'a² + b² = ' + nf(ab2, 2));
      bar(0.4, c2, 'rgba(124,58,237,.75)', 'c² = ' + nf(c2, 2));
      var e1 = X0 + ab2 * sc, e2 = X0 + c2 * sc;
      p.line(e1, 0.3, e1, 2.3, { color: C.sin, w: 1.2, dash: [4, 4] });
      p.line(e2, 0.3, e2, 2.3, { color: C.hyp, w: 1.2, dash: [4, 4] });
      p.text((e1 + e2) / 2, 2.55, 'ผลต่าง = 2ab cos C = ' + nf(2 * s.a * s.b * cos(Cr), 2), {
        color: C.accent, size: 12, bg: 'rgba(255,255,255,.9)'
      });
      p.text(X0 + W / 2, -0.5, Math.abs(s.C - 90) < 0.6 ? '✓ มุมฉากพอดี — พจน์แก้เป็นศูนย์ เหลือ c² = a² + b²'
             : (s.C < 90 ? 'มุมแหลม → c² น้อยกว่า a² + b²' : 'มุมป้าน → c² มากกว่า a² + b²'), {
        color: Math.abs(s.C - 90) < 0.6 ? C.tan : C.accent, size: 12.5, bg: 'rgba(255,255,255,.9)'
      });

      api.stats({
        'a² + b²': { v: nf(ab2, 3), color: C.sin },
        '2ab cos C': { v: nf(2 * s.a * s.b * cos(Cr), 3), color: C.accent },
        'c² = a²+b²−2ab cos C': { v: nf(c2, 3), color: C.hyp },
        'c': { v: nf(cc, 3), color: C.hyp }
      });
    }
  });

  /* 6.4 พื้นที่สามเหลี่ยม */
  TV.widget('#w-area', {
    title: 'พื้นที่ = ครึ่งหนึ่งของ ฐาน × สูง',
    badge: 'หมุนมุม C',
    desc: 'ความสูงของสามเหลี่ยมคือ b sin C พอดี สูตรพื้นที่ ½ab sin C จึงเป็นแค่สูตร ½ × ฐาน × สูง ที่เขียนใหม่ ไม่ใช่สูตรใหม่',
    plot: { xmin: -3.6, xmax: 4.6, ymin: -1.5, ymax: 3.8, equal: true, ratio: 0.6, minH: 280, maxH: 380 },
    controls: [
      { type: 'range', key: 'a', label: 'ฐาน a', min: 1.2, max: 3.4, step: 0.05, value: 3, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 'b', label: 'ด้าน b', min: 1.2, max: 3.4, step: 0.05, value: 2.4, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 'C', label: 'มุม C ระหว่างสองด้าน', min: 10, max: 170, step: 1, value: 55, fmt: degFmt }
    ],
    hint: 'สังเกตว่าพื้นที่สูงสุดเกิดตอน C = 90° เพราะ sin C มีค่ามากที่สุดตรงนั้น — โจทย์ที่ถามว่า “พื้นที่มากที่สุดเท่าใด” จึงตอบได้ทันทีว่า ½ab',
    draw: function (p, s, api) {
      var Cr = d2r(s.C);
      var Cv = [0, 0], B = [s.a, 0], A = [s.b * cos(Cr), s.b * sin(Cr)];
      var h = s.b * sin(Cr), foot = [A[0], 0];
      var area = 0.5 * s.a * h;
      var sp = (s.a + s.b + Math.hypot(A[0] - s.a, A[1])) / 2;
      var her = Math.sqrt(Math.max(sp * (sp - s.a) * (sp - s.b) * (sp - Math.hypot(A[0] - s.a, A[1])), 0));

      p.grid(1, 1, '#f5f3ed');
      if (A[0] < 0) p.line(A[0] - 0.2, 0, 0, 0, { color: '#c9c5bb', w: 1.4, dash: [5, 4] });
      p.poly([Cv, B, A], { fill: 'rgba(4,120,87,.12)', color: C.tan, w: 2.4 });
      p.line(0, 0, s.a, 0, { color: C.cos, w: 3.5 });
      p.line(0, 0, A[0], A[1], { color: C.sin, w: 3.5 });
      p.line(A[0], A[1], foot[0], foot[1], { color: C.hyp, w: 2, dash: [5, 4] });
      p.rightAngle(foot[0], foot[1], A[0] >= 0 ? -1 : 1, 0, 0, 1, 9, C.hyp);

      arcAt(p, Cv, B, A, 0.52, { fill: 'rgba(4,120,87,.16)', color: C.tan, w: 2 });
      p.text(0.88 * cos(Cr / 2), 0.88 * sin(Cr / 2), 'C = ' + nf(s.C, 0) + '°', { color: C.tan, size: 12.5, bg: 'rgba(255,255,255,.88)' });
      p.text(s.a / 2, 0, 'ฐาน a = ' + nf(s.a, 2), { dy: 17, color: C.cos, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.text(A[0] / 2, A[1] / 2, 'b = ' + nf(s.b, 2), { dx: A[0] >= 0 ? -12 : 12, dy: -8, align: A[0] >= 0 ? 'right' : 'left', color: C.sin, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.text(A[0], h / 2, 'สูง = b sin C = ' + nf(h, 2), { dx: A[0] >= 0 ? 10 : -10, align: A[0] >= 0 ? 'left' : 'right', color: C.hyp, size: 12, bg: 'rgba(255,255,255,.92)' });
      p.dot(A[0], A[1], { fill: C.sin, r: 6 });

      api.stats({
        'ฐาน a': { v: nf(s.a, 2), color: C.cos },
        'สูง = b sin C': { v: nf(h, 3), color: C.hyp },
        'พื้นที่ = ½ a b sin C': { v: nf(area, 4), color: C.tan },
        'สูตรเฮรอน': { v: nf(her, 4), color: C.tan },
        'พื้นที่มากที่สุด (C = 90°)': nf(0.5 * s.a * s.b, 4)
      });
    }
  });

  /* =====================================================================
     เสริมบทที่ 3 — กราฟฟังก์ชันส่วนกลับ
     ===================================================================== */
  TV.widget('#w-reciprocal', {
    title: 'กราฟของ csc, sec และ cot',
    badge: 'สลับดูได้',
    desc: 'ฟังก์ชันส่วนกลับไม่มีอะไรใหม่ — ตรงไหนที่ตัวตั้งเป็นศูนย์ ส่วนกลับจะพุ่งไปอนันต์ และตรงไหนที่ตัวตั้งเป็น ±1 ทั้งสองกราฟจะแตะกันพอดี',
    plot: { xmin: -TAU - 0.3, xmax: TAU + 0.3, ymin: -3.6, ymax: 3.6, ratio: 0.42, minH: 280, maxH: 360, pad: 20 },
    controls: [
      {
        type: 'seg', key: 'f', label: 'ฟังก์ชัน',
        options: [['csc', 'csc'], ['sec', 'sec'], ['cot', 'cot']], value: 'csc'
      },
      { type: 'check', key: 'base', label: 'แสดงฟังก์ชันตัวตั้ง', value: true }
    ],
    hint: 'จุดที่กราฟทั้งสองแตะกันคือจุดที่ค่าเป็น ±1 พอดี เพราะ 1/1 = 1 และ 1/(−1) = −1 — เป็นจุดยึดที่ช่วยวาดกราฟส่วนกลับด้วยมือได้เร็ว',
    draw: function (p, s, api) {
      var base = s.f === 'csc' ? sin : s.f === 'sec' ? cos : tan;
      var recip = function (x) { return 1 / base(x); };
      var baseName = s.f === 'csc' ? 'sin' : s.f === 'sec' ? 'cos' : 'tan';
      var col = s.f === 'csc' ? C.sin : s.f === 'sec' ? C.cos : C.tan;

      p.grid(PI / 4, 1, '#f4f2ec');
      /* เส้นกำกับตรงที่ตัวตั้งเป็นศูนย์ */
      var zeros = [];
      var k;
      if (s.f === 'csc' || s.f === 'cot') { for (k = -2; k <= 2; k++) zeros.push(k * PI); }
      else { for (k = -2; k <= 2; k++) zeros.push(PI / 2 + k * PI); }
      zeros.forEach(function (z) {
        if (z >= -TAU - 0.3 && z <= TAU + 0.3) p.line(z, -3.6, z, 3.6, { color: '#f0b8b0', w: 1.3, dash: [5, 5] });
      });
      p.axes({ xStep: PI / 2, yStep: 1, xLabel: 'pi', digits: 0, xName: 'x', yName: 'y' });
      [1, -1].forEach(function (u) { p.line(-TAU - 0.3, u, TAU + 0.3, u, { color: '#ded9cf', w: 1, dash: [3, 4] }); });

      if (s.base) p.func(base, { color: '#b9b5aa', w: 1.8, dash: [7, 5], jump: 3.6 });
      p.func(recip, { color: col, w: 2.8, jump: 3.6 });

      /* จุดที่แตะกัน */
      var touch = [];
      if (s.f === 'csc') { for (k = -2; k <= 2; k++) touch.push(PI / 2 + k * PI); }
      else if (s.f === 'sec') { for (k = -2; k <= 2; k++) touch.push(k * PI); }
      else { for (k = -2; k <= 2; k++) touch.push(PI / 4 + k * PI / 2); }
      touch.forEach(function (x) {
        if (x < -TAU || x > TAU) return;
        var y = base(x);
        if (Math.abs(Math.abs(y) - 1) < 1e-6) p.dot(x, y, { fill: col, r: 5 });
      });

      p.text(TAU + 0.3, -3.6, 'y = ' + s.f + ' x', { dx: -8, dy: 16, align: 'right', color: col, size: 13 });
      if (s.base) p.text(-TAU - 0.3, -3.6, 'เส้นประเทา = ' + baseName + ' x', { dx: 10, dy: 16, align: 'left', color: C.faint, size: 11.5 });

      api.stats({
        'ฟังก์ชัน': 'y = ' + s.f + ' x = 1 / ' + baseName + ' x',
        'คาบ': s.f === 'cot' ? 'π' : '2π',
        'เส้นกำกับที่': { v: s.f === 'sec' ? 'x = π/2 + kπ' : 'x = kπ', color: '#dc2626' },
        'เรนจ์': { v: s.f === 'cot' ? 'จำนวนจริงทุกจำนวน' : '(−∞, −1] ∪ [1, ∞)', color: col }
      });
    }
  });

  /* =====================================================================
     บทที่ 7 — ฟังก์ชันผกผัน
     ===================================================================== */

  var INV = {
    sin: { f: sin, inv: Math.asin, dom: '[−1, 1]', ran: '[−π/2, π/2]', lo: -PI / 2, hi: PI / 2, col: C.sin, name: 'arcsin' },
    cos: { f: cos, inv: Math.acos, dom: '[−1, 1]', ran: '[0, π]', lo: 0, hi: PI, col: C.cos, name: 'arccos' },
    tan: { f: tan, inv: Math.atan, dom: 'จำนวนจริงทุกจำนวน', ran: '(−π/2, π/2)', lo: -PI / 2 + 0.001, hi: PI / 2 - 0.001, col: C.tan, name: 'arctan' }
  };

  /* 7.1 กราฟผกผันคือการสะท้อนข้ามเส้น y = x */
  TV.widget('#w-inverse-graph', {
    title: 'กราฟผกผันคือภาพสะท้อนข้ามเส้น y = x',
    badge: 'ลากจุดได้',
    desc: 'ส่วนที่เข้มคือช่วงที่เราเลือกเก็บไว้ (ช่วงหลัก) เมื่อพับกระดาษตามเส้นประ y = x ส่วนนั้นจะทับกับกราฟผกผันพอดี — ลากจุดสีเข้มดูว่าคู่ของมันไปอยู่ตรงไหน',
    plot: { xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5, equal: true, ratio: 0.8, minH: 320, maxH: 440 },
    controls: [
      { type: 'seg', key: 'f', label: 'ฟังก์ชัน', options: [['sin', 'arcsin'], ['cos', 'arccos'], ['tan', 'arctan']], value: 'sin' },
      { type: 'range', key: 't', label: 'ตำแหน่งจุด', min: 0.02, max: 0.98, step: 0.005, value: 0.68, fmt: function (v) { return nf(v, 2); } },
      { type: 'check', key: 'full', label: 'แสดงกราฟเต็ม', value: true }
    ],
    hint: 'เหตุผลที่ต้องตัดช่วง: ถ้าเก็บกราฟไว้ทั้งเส้น เส้นแนวนอนเส้นเดียวจะตัดกราฟหลายจุด แปลว่าค่าหนึ่งค่าจะมีมุมตอบได้หลายมุม ซึ่งผิดนิยามของฟังก์ชัน',
    onPointer: function (p, s, wx) {
      var d = INV[s.f];
      s.t = clamp((wx - d.lo) / (d.hi - d.lo), 0.02, 0.98);
      return true;
    },
    draw: function (p, s, api) {
      var d = INV[s.f];
      var x0 = d.lo + s.t * (d.hi - d.lo), y0 = d.f(x0);

      p.grid(1, 1, '#f4f2ec');
      p.line(-3.5, -3.5, 3.5, 3.5, { color: '#c9c5bb', w: 1.5, dash: [6, 5] });
      p.text(3.1, 3.1, 'y = x', { dx: -6, dy: -12, align: 'right', color: C.faint, size: 11.5 });
      p.axes({ xStep: 1, yStep: 1, digits: 0, xName: 'x', yName: 'y' });

      /* กราฟเต็ม (จาง) และกราฟผกผันที่ยังไม่ตัดช่วง */
      if (s.full) {
        p.func(d.f, { color: d.col, w: 1.6, alpha: 0.22, jump: 3.5 });
      }
      /* ช่วงหลักของฟังก์ชันต้นแบบ */
      p.func(d.f, { from: d.lo, to: d.hi, color: d.col, w: 3, jump: 3.5 });
      /* กราฟผกผัน = สะท้อนข้าม y = x */
      var pts = [], i, n = 220;
      for (i = 0; i <= n; i++) {
        var u = d.lo + (d.hi - d.lo) * i / n;
        pts.push([d.f(u), u]);
      }
      p.poly(pts, { close: false, color: C.hyp, w: 3 });

      /* จุดคู่กัน */
      p.line(x0, y0, y0, x0, { color: '#c9c5bb', w: 1.2, dash: [4, 4] });
      p.dot(x0, y0, { fill: d.col, r: 7, halo: d.col });
      p.dot(y0, x0, { fill: C.hyp, r: 7, halo: C.hyp });
      p.text(x0, y0, '(' + nf(x0, 2) + ', ' + nf(y0, 2) + ')', { dy: -18, color: d.col, size: 11, mono: true, bg: 'rgba(255,255,255,.92)' });
      p.text(y0, x0, '(' + nf(y0, 2) + ', ' + nf(x0, 2) + ')', { dy: 18, color: C.hyp, size: 11, mono: true, bg: 'rgba(255,255,255,.92)' });

      p.text(-3.5, 3.5, 'y = ' + s.f + ' x  (ช่วงหลัก)', { dx: 10, dy: 14, align: 'left', color: d.col, size: 12.5, bg: 'rgba(255,255,255,.9)' });
      p.text(-3.5, 3.5, 'y = ' + d.name + ' x', { dx: 10, dy: 34, align: 'left', color: C.hyp, size: 12.5, bg: 'rgba(255,255,255,.9)' });

      var o = {};
      o['ช่วงหลักของ ' + s.f] = { v: d.ran, color: d.col };
      o['โดเมนของ ' + d.name] = { v: d.dom, color: C.hyp };
      o['เรนจ์ของ ' + d.name] = { v: d.ran, color: C.hyp };
      o[d.name + '(' + nf(y0, 2) + ')'] = { v: nf(x0, 4) + ' rad = ' + nf(r2d(x0), 1) + '°', color: C.accent };
      api.stats(o);
    }
  });

  /* 7.2 arcsin(sin x) ไม่ได้เท่ากับ x เสมอ */
  TV.widget('#w-arcsinsin', {
    title: 'arcsin(sin x) เท่ากับ x จริงหรือ',
    badge: 'เลื่อนดูได้',
    desc: 'ถ้าใส่แล้วถอดออก น่าจะได้ค่าเดิมกลับมา — แต่กราฟบอกว่าจริงเฉพาะในช่วงหลักเท่านั้น นอกจากนั้นจะถูกพับกลับเข้ามา',
    plot: { xmin: -3 * PI - 0.3, xmax: 3 * PI + 0.3, ymin: -3.6, ymax: 3.6, ratio: 0.34, minH: 250, maxH: 320, pad: 20 },
    controls: [
      { type: 'seg', key: 'f', label: 'ฟังก์ชัน', options: [['sin', 'arcsin(sin x)'], ['cos', 'arccos(cos x)'], ['tan', 'arctan(tan x)']], value: 'sin' },
      { type: 'range', key: 'x', label: 'ค่า x', min: -9.4, max: 9.4, step: 0.02, value: 4, fmt: function (v) { return nf(v, 2); } }
    ],
    hint: 'ข้อสอบชอบถามค่าอย่าง arcsin(sin 200°) — คำตอบไม่ใช่ 200° แต่ต้องพับกลับเข้าช่วง [−90°, 90°] ก่อน ซึ่งได้ −20°',
    draw: function (p, s, api) {
      var d = INV[s.f];
      var g = function (x) { return d.inv(d.f(x)); };
      var X = clamp(s.x, -3 * PI, 3 * PI);
      var gy = g(X);

      p.grid(PI / 2, 1, '#f4f2ec');
      p.poly([[d.lo, -3.6], [d.hi, -3.6], [d.hi, 3.6], [d.lo, 3.6]], { fill: 'rgba(29,78,216,.05)' });
      p.axes({ xStep: PI, yStep: 1, xLabel: 'pi', digits: 0, xName: 'x', yName: 'y' });
      p.func(function (x) { return x; }, { color: '#c9c5bb', w: 1.6, dash: [7, 5] });
      p.func(g, { color: C.hyp, w: 2.8, jump: 3.6 });

      p.line(X, 0, X, gy, { color: C.accent, w: 1.2, dash: [4, 4] });
      p.dot(X, gy, { fill: C.hyp, r: 7, halo: C.hyp });
      p.dot(X, X > 3.6 || X < -3.6 ? clamp(X, -3.5, 3.5) : X, { fill: '#c9c5bb', r: 5 });

      var same = Math.abs(gy - X) < 1e-6;
      p.text(0, 3.6, same ? '✓ อยู่ในช่วงหลัก จึงได้ค่าเดิมกลับมา' : '✗ อยู่นอกช่วงหลัก ค่าถูกพับกลับเข้ามา', {
        dy: 15, color: same ? C.tan : '#dc2626', size: 12.5, bg: 'rgba(255,255,255,.92)'
      });
      p.text(d.hi, -3.6, 'แถบสีฟ้า = ช่วงหลัก', { dx: 8, dy: 16, align: 'left', color: C.faint, size: 11 });

      var out = {};
      out['x'] = { v: nf(X, 3) + ' rad = ' + nf(r2d(X), 1) + '°', color: C.ink };
      out[s.f + ' x'] = { v: nf(d.f(X), 4), color: d.col };
      out[d.name + '(' + s.f + ' x)'] = { v: nf(gy, 3) + ' rad = ' + nf(r2d(gy), 1) + '°', color: C.hyp };
      out['เท่ากับ x หรือไม่'] = { v: same ? 'เท่ากัน' : 'ไม่เท่า', color: same ? C.tan : '#dc2626' };
      api.stats(out);
    }
  });

  /* 7.3 ฟังก์ชันประกอบ — ใช้สามเหลี่ยมช่วยคิด */
  TV.widget('#w-composite', {
    title: 'คิด sin(arccos x) ด้วยสามเหลี่ยมรูปเดียว',
    badge: 'เลื่อน x',
    desc: 'ตั้งมุม θ ให้เท่ากับค่าผกผันที่โจทย์ให้มา แล้ววาดสามเหลี่ยมมุมฉากที่ให้ค่านั้นพอดี — ค่าที่เหลือทั้งหมดอ่านจากรูปได้เลย ไม่ต้องใช้เครื่องคิดเลข',
    plot: { xmin: -1.5, xmax: 3.6, ymin: -0.6, ymax: 2.0, equal: true, ratio: 0.5, minH: 260, maxH: 340 },
    controls: [
      { type: 'seg', key: 'b', label: 'ตั้งจาก', options: [['cos', 'θ = arccos x'], ['sin', 'θ = arcsin x']], value: 'cos' },
      { type: 'range', key: 'x', label: 'ค่า x', min: -0.95, max: 0.95, step: 0.01, value: 0.6, fmt: function (v) { return nf(v, 2); } }
    ],
    hint: 'เทคนิคนี้เปลี่ยนโจทย์ผกผันที่ดูน่ากลัวให้กลายเป็นการอ่านค่าจากสามเหลี่ยมธรรมดา ใช้ได้กับทุกฟังก์ชันประกอบ',
    draw: function (p, s, api) {
      var th = s.b === 'cos' ? Math.acos(s.x) : Math.asin(s.x);
      var adj = cos(th), opp = sin(th);
      var K = 2.4;   /* ตัวคูณให้รูปใหญ่พอมองเห็น (ด้านตรงข้ามมุมฉาก = K) */
      var Ax = adj * K, Ay = opp * K;

      p.line(-1.5, 0, 3.6, 0, { color: '#e2ded4', w: 1 });
      p.line(0, -0.6, 0, 2.0, { color: '#e2ded4', w: 1 });
      p.poly([[0, 0], [Ax, 0], [Ax, Ay]], { fill: 'rgba(124,58,237,.07)', color: '#4a4842', w: 2.2 });
      p.line(0, 0, Ax, 0, { color: C.cos, w: 4 });
      p.line(Ax, 0, Ax, Ay, { color: C.sin, w: 4 });
      p.line(0, 0, Ax, Ay, { color: C.hyp, w: 3 });
      if (Math.abs(Ax) > 0.08) p.rightAngle(Ax, 0, -Math.sign(Ax) || -1, 0, 0, 1, 11, C.soft);
      p.arc(0, 0, 0.42, 0, th, { fill: 'rgba(180,83,9,.13)', color: C.accent, w: 1.8 });
      p.text(0.72 * cos(th / 2), 0.72 * sin(th / 2), 'θ', { color: C.accent, size: 15, bg: 'rgba(255,255,255,.85)' });

      p.text(Ax / 2, 0, 'ข้างเคียง = ' + nf(adj, 3), { dy: 17, color: C.cos, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.text(Ax, Ay / 2, 'ข้างตรงข้าม = ' + nf(opp, 3), { dx: 11, align: 'left', color: C.sin, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.text(Ax / 2, Ay / 2, 'ด้านตรงข้ามมุมฉาก = 1', { dx: -12, dy: -12, align: 'right', color: C.hyp, size: 12, bg: 'rgba(255,255,255,.9)' });

      var given = s.b === 'cos' ? 'cos θ = x = ' + nf(s.x, 2) : 'sin θ = x = ' + nf(s.x, 2);
      p.text(-1.5, 2.0, 'กำหนดให้ ' + given + '  →  θ = ' + nf(r2d(th), 1) + '°', {
        dx: 10, dy: 12, align: 'left', color: C.accent, size: 12.5, bg: 'rgba(255,255,255,.9)'
      });

      var o = {};
      o['θ'] = { v: nf(th, 3) + ' rad = ' + nf(r2d(th), 1) + '°', color: C.accent };
      o['sin(' + (s.b === 'cos' ? 'arccos' : 'arcsin') + ' x)'] = { v: nf(opp, 4), color: C.sin };
      o['cos(' + (s.b === 'cos' ? 'arccos' : 'arcsin') + ' x)'] = { v: nf(adj, 4), color: C.cos };
      o['tan(' + (s.b === 'cos' ? 'arccos' : 'arcsin') + ' x)'] = { v: Math.abs(adj) < 1e-6 ? 'ไม่นิยาม' : nf(opp / adj, 4), color: C.tan };
      o['รูปกรณฑ์'] = s.b === 'cos' ? 'sin = √(1 − x²)' : 'cos = √(1 − x²)';
      api.stats(o);
    }
  });

  /* =====================================================================
     บทที่ 8 — พิกัดเชิงขั้วและจำนวนเชิงซ้อน
     ===================================================================== */

  /* วาดตารางเชิงขั้ว: วงกลมซ้อนและรัศมีทุก 30° */
  function polarGrid(p, rmax) {
    var i;
    for (i = 1; i <= rmax; i++) p.circle(0, 0, i, { color: '#eeece5', w: 1 });
    for (i = 0; i < 12; i++) {
      var a = i * PI / 6;
      p.line(0, 0, rmax * cos(a), rmax * sin(a), { color: '#f2f0e9', w: 1 });
    }
    p.line(-rmax, 0, rmax, 0, { color: C.axis, w: 1.3 });
    p.line(0, -rmax, 0, rmax, { color: C.axis, w: 1.3 });
  }

  /* 8.1 พิกัดเชิงขั้ว */
  TV.widget('#w-polar', {
    title: 'พิกัดเชิงขั้ว (r, θ) กับพิกัดฉาก (x, y)',
    badge: 'ลากจุดได้',
    desc: 'จุดเดียวกันเรียกได้สองชื่อ — บอกเป็น “ไปทางไหน ไกลแค่ไหน” หรือบอกเป็น “ขวาเท่าไร ขึ้นเท่าไร” ลากจุดแล้วดูทั้งสองชื่อเปลี่ยนไปพร้อมกัน',
    plot: { xmin: -3.6, xmax: 3.6, ymin: -3.6, ymax: 3.6, equal: true, ratio: 0.86, minH: 320, maxH: 440 },
    controls: [
      { type: 'range', key: 'r', label: 'รัศมี r', min: 0.3, max: 3, step: 0.05, value: 2.2, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 'th', label: 'มุม θ', min: 0, max: 360, step: 1, value: 55, fmt: degFmt },
      { type: 'check', key: 'proj', label: 'แสดงเส้นฉาย', value: true }
    ],
    hint: 'สูตรแปลง: x = r cos θ · y = r sin θ · r = √(x² + y²) · tan θ = y/x — สังเกตว่าสองสูตรแรกคือนิยาม cos กับ sin จากบทที่ 2 ตรง ๆ',
    onPointer: function (p, s, wx, wy) {
      var r = Math.hypot(wx, wy);
      if (r > 3.4) return false;
      s.r = clamp(r, 0.3, 3);
      s.th = (r2d(Math.atan2(wy, wx)) + 360) % 360;
      return true;
    },
    draw: function (p, s, api) {
      var a = d2r(s.th), x = s.r * cos(a), y = s.r * sin(a);
      polarGrid(p, 3.4);
      for (var i = 1; i <= 3; i++) p.text(i, 0, String(i), { dy: 13, color: C.faint, size: 10, mono: true });

      p.arc(0, 0, 0.55, 0, a, { fill: 'rgba(180,83,9,.13)', color: C.accent, w: 1.8 });
      p.line(0, 0, x, y, { color: C.hyp, w: 3 });
      if (s.proj) {
        p.line(x, 0, x, y, { color: C.sin, w: 2, dash: [5, 4] });
        p.line(0, 0, x, 0, { color: C.cos, w: 3 });
        p.text(x / 2, 0, 'x = ' + nf(x, 2), { dy: y >= 0 ? 16 : -16, color: C.cos, size: 11.5, bg: 'rgba(255,255,255,.9)' });
        p.text(x, y / 2, 'y = ' + nf(y, 2), { dx: x >= 0 ? 10 : -10, align: x >= 0 ? 'left' : 'right', color: C.sin, size: 11.5, bg: 'rgba(255,255,255,.9)' });
      }
      p.text(x / 2, y / 2, 'r = ' + nf(s.r, 2), { dx: -10, dy: -12, align: 'right', color: C.hyp, size: 12, bg: 'rgba(255,255,255,.9)' });
      p.text(0.8 * cos(a / 2), 0.8 * sin(a / 2), nf(s.th, 0) + '°', { color: C.accent, size: 12.5, bg: 'rgba(255,255,255,.88)' });
      p.dot(x, y, { fill: C.hyp, r: 8, halo: C.hyp });

      api.stats({
        'พิกัดเชิงขั้ว': { v: '(' + nf(s.r, 2) + ', ' + nf(s.th, 0) + '°)', color: C.hyp },
        'พิกัดฉาก': { v: '(' + nf(x, 3) + ', ' + nf(y, 3) + ')', color: C.ink },
        'x = r cos θ': { v: nf(x, 4), color: C.cos },
        'y = r sin θ': { v: nf(y, 4), color: C.sin },
        'r = √(x²+y²)': nf(Math.hypot(x, y), 4)
      });
    }
  });

  /* 8.2 กราฟเชิงขั้ว */
  var POLAR_PRESET = [
    { n: 'วงกลม  r = 2', a: 2, b: 0, k: 1 },
    { n: 'คาร์ดิออยด์  r = 1 + cos θ', a: 1, b: 1, k: 1 },
    { n: 'ลิมาซองมีห่วง  r = 0.6 + 1.4 cos θ', a: 0.6, b: 1.4, k: 1 },
    { n: 'กุหลาบ 3 กลีบ  r = 2 cos 3θ', a: 0, b: 2, k: 3 },
    { n: 'กุหลาบ 8 กลีบ  r = 2 cos 4θ', a: 0, b: 2, k: 4 }
  ];

  TV.widget('#w-polar-graph', {
    title: 'กราฟเชิงขั้ว r = a + b cos(kθ)',
    badge: 'ปรับสูตรได้',
    desc: 'สมการสั้น ๆ ในพิกัดเชิงขั้วให้รูปที่เขียนด้วยพิกัดฉากได้ยากมาก — ลองเปลี่ยน k เป็นเลขคี่กับเลขคู่ดูว่าจำนวนกลีบต่างกันอย่างไร',
    plot: { xmin: -3.4, xmax: 3.4, ymin: -3.4, ymax: 3.4, equal: true, ratio: 0.86, minH: 320, maxH: 440 },
    controls: [
      { type: 'select', key: 'pre', label: 'รูปสำเร็จ', wide: true, options: POLAR_PRESET.map(function (d) { return [d, d.n]; }), value: POLAR_PRESET[1],
        onchange: function (api) { var d = api.state.pre; api.state.a = d.a; api.state.b = d.b; api.state.k = d.k; } },
      { type: 'range', key: 'a', label: 'a', min: 0, max: 2, step: 0.1, value: 1, fmt: function (v) { return nf(v, 1); } },
      { type: 'range', key: 'b', label: 'b', min: 0, max: 2, step: 0.1, value: 1, fmt: function (v) { return nf(v, 1); } },
      { type: 'range', key: 'k', label: 'k', min: 1, max: 6, step: 1, value: 1, fmt: function (v) { return nf(v, 0); } }
    ],
    hint: 'กฎของกลีบกุหลาบ r = b cos kθ : ถ้า k เป็นเลขคี่จะได้ k กลีบ แต่ถ้าเป็นเลขคู่จะได้ 2k กลีบ เพราะกลีบครึ่งหลังไม่ทับกับครึ่งแรก',
    draw: function (p, s, api) {
      polarGrid(p, 3.2);
      var pts = [], i, n = 900, rmax = 0;
      for (i = 0; i <= n; i++) {
        var t = i / n * TAU * 2;
        var r = s.a + s.b * cos(s.k * t);
        rmax = Math.max(rmax, Math.abs(r));
        pts.push([r * cos(t), r * sin(t)]);
      }
      p.poly(pts, { close: false, color: C.hyp, w: 2.6 });
      p.text(-3.4, 3.4, 'r = ' + nf(s.a, 1) + ' + ' + nf(s.b, 1) + ' cos(' + s.k + 'θ)', {
        dx: 10, dy: 14, align: 'left', color: C.hyp, size: 13, mono: true, bg: 'rgba(255,255,255,.9)'
      });

      var petals = s.a === 0 && s.b > 0 ? (s.k % 2 === 1 ? s.k : 2 * s.k) : null;
      api.stats({
        'สมการ': 'r = ' + nf(s.a, 1) + ' + ' + nf(s.b, 1) + ' cos(' + s.k + 'θ)',
        'รัศมีมากที่สุด': { v: nf(rmax, 3), color: C.hyp },
        'ชนิดของกราฟ': { v: s.b === 0 ? 'วงกลม' : s.a === 0 ? 'กุหลาบ' : (s.a > s.b ? 'ลิมาซองไม่มีห่วง' : (Math.abs(s.a - s.b) < 1e-9 ? 'คาร์ดิออยด์' : 'ลิมาซองมีห่วง')), color: C.accent },
        'จำนวนกลีบ': petals === null ? '—' : String(petals)
      });
    }
  });

  /* 8.3 คูณจำนวนเชิงซ้อน = หมุนแล้วขยาย */
  TV.widget('#w-complex-mult', {
    title: 'คูณจำนวนเชิงซ้อน = บวกมุมแล้วคูณขนาด',
    badge: 'ปรับสองตัว',
    desc: 'ในระนาบเชิงซ้อน การคูณไม่ใช่แค่การคำนวณ แต่เป็นการ “หมุนแล้วขยาย” — ปรับมุมของ z₂ แล้วดูว่าผลคูณหมุนตามอย่างไร',
    plot: { xmin: -3.6, xmax: 3.6, ymin: -3.6, ymax: 3.6, equal: true, ratio: 0.86, minH: 320, maxH: 440 },
    controls: [
      { type: 'range', key: 'r1', label: 'ขนาดของ z₁', min: 0.4, max: 2, step: 0.05, value: 1.4, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 't1', label: 'มุมของ z₁', min: 0, max: 350, step: 5, value: 30, fmt: degFmt },
      { type: 'range', key: 'r2', label: 'ขนาดของ z₂', min: 0.4, max: 2, step: 0.05, value: 1.2, fmt: function (v) { return nf(v, 2); } },
      { type: 'range', key: 't2', label: 'มุมของ z₂', min: 0, max: 350, step: 5, value: 50, fmt: degFmt }
    ],
    hint: 'จับหลักนี้ไว้: |z₁z₂| = |z₁||z₂| และ arg(z₁z₂) = arg z₁ + arg z₂ — ทฤษฎีบทเดอมัวร์เป็นเพียงการใช้กฎนี้ซ้ำ n ครั้ง',
    draw: function (p, s, api) {
      var a1 = d2r(s.t1), a2 = d2r(s.t2);
      var R = s.r1 * s.r2, A = a1 + a2;
      polarGrid(p, 3.4);
      p.text(3.4, 0, 'Re', { dx: -4, dy: -12, align: 'right', color: C.faint, size: 11, italic: true });
      p.text(0, 3.4, 'Im', { dx: 12, dy: 6, align: 'left', color: C.faint, size: 11, italic: true });

      var draw1 = function (r, a, col, lab) {
        p.arrow(0, 0, r * cos(a), r * sin(a), { color: col, w: 2.6, head: 10 });
        p.dot(r * cos(a), r * sin(a), { fill: col, r: 6 });
        p.text(r * cos(a), r * sin(a), lab, { dx: 12 * cos(a), dy: -12 * sin(a) - 10, color: col, size: 12.5, bg: 'rgba(255,255,255,.9)' });
      };
      draw1(s.r1, a1, C.sin, 'z₁');
      draw1(s.r2, a2, C.cos, 'z₂');
      draw1(Math.min(R, 3.3), A, C.hyp, R > 3.3 ? 'z₁z₂ (เกินกรอบ)' : 'z₁z₂');
      p.arc(0, 0, 0.5, 0, a1, { color: C.sin, w: 1.6 });
      p.arc(0, 0, 0.68, a1, A, { color: C.cos, w: 1.6 });

      api.stats({
        'z₁': { v: nf(s.r1, 2) + ' ∠ ' + nf(s.t1, 0) + '°', color: C.sin },
        'z₂': { v: nf(s.r2, 2) + ' ∠ ' + nf(s.t2, 0) + '°', color: C.cos },
        'ขนาดผลคูณ': { v: nf(s.r1, 2) + ' × ' + nf(s.r2, 2) + ' = ' + nf(R, 3), color: C.hyp },
        'มุมผลคูณ': { v: nf(s.t1, 0) + '° + ' + nf(s.t2, 0) + '° = ' + nf((s.t1 + s.t2) % 360, 0) + '°', color: C.hyp },
        'รูปพิกัดฉาก': nf(R * cos(A), 3) + (R * sin(A) >= 0 ? ' + ' : ' − ') + nf(Math.abs(R * sin(A)), 3) + 'i'
      });
    }
  });

  /* 8.4 รากที่ n จากทฤษฎีบทเดอมัวร์ */
  TV.widget('#w-demoivre', {
    title: 'รากที่ n กระจายตัวเท่า ๆ กันบนวงกลม',
    badge: 'เปลี่ยน n',
    desc: 'จำนวนเชิงซ้อนหนึ่งตัวมีรากที่ n อยู่ n ตัวเสมอ และทั้งหมดวางตัวห่างเท่า ๆ กันบนวงกลมเดียว — เป็นรูปหลายเหลี่ยมด้านเท่าพอดี',
    plot: { xmin: -3.2, xmax: 3.2, ymin: -3.2, ymax: 3.2, equal: true, ratio: 0.86, minH: 320, maxH: 440 },
    controls: [
      { type: 'range', key: 'r', label: 'ขนาดของ z', min: 0.3, max: 8, step: 0.1, value: 4, fmt: function (v) { return nf(v, 1); } },
      { type: 'range', key: 'th', label: 'มุมของ z', min: 0, max: 350, step: 5, value: 60, fmt: degFmt },
      { type: 'range', key: 'n', label: 'หารากที่ n', min: 2, max: 8, step: 1, value: 4, fmt: function (v) { return nf(v, 0); } }
    ],
    hint: 'สูตร: รากตัวที่ k คือ r^(1/n) [cos((θ+360°k)/n) + i sin((θ+360°k)/n)] เมื่อ k = 0, 1, …, n−1 — มุมระหว่างรากที่ติดกันคือ 360°/n เสมอ',
    draw: function (p, s, api) {
      var rr = Math.pow(s.r, 1 / s.n), a0 = d2r(s.th) / s.n, step = TAU / s.n;
      polarGrid(p, 3.0);
      p.circle(0, 0, rr, { color: C.hyp, w: 1.8, dash: [6, 5] });

      var pts = [], i;
      for (i = 0; i < s.n; i++) {
        var a = a0 + i * step;
        pts.push([rr * cos(a), rr * sin(a)]);
      }
      p.poly(pts, { fill: 'rgba(124,58,237,.07)', color: '#c9c5bb', w: 1.4 });
      pts.forEach(function (q, i) {
        p.line(0, 0, q[0], q[1], { color: i === 0 ? C.accent : '#d8d4ca', w: i === 0 ? 2.2 : 1.2 });
        p.dot(q[0], q[1], { fill: i === 0 ? C.accent : C.hyp, r: i === 0 ? 7 : 6 });
        p.text(q[0], q[1], 'k=' + i, { dx: 14 * (q[0] >= 0 ? 1 : -1), dy: -12, align: q[0] >= 0 ? 'left' : 'right', color: i === 0 ? C.accent : C.hyp, size: 11, bg: 'rgba(255,255,255,.9)' });
      });

      p.text(-3.2, 3.2, 'z = ' + nf(s.r, 1) + ' ∠ ' + nf(s.th, 0) + '°   ·   รากที่ ' + s.n, {
        dx: 10, dy: 14, align: 'left', color: C.ink, size: 12.5, bg: 'rgba(255,255,255,.9)'
      });

      api.stats({
        'ขนาดของราก': { v: nf(s.r, 1) + '^(1/' + s.n + ') = ' + nf(rr, 4), color: C.hyp },
        'มุมของรากตัวแรก': { v: nf(s.th, 0) + '° ÷ ' + s.n + ' = ' + nf(s.th / s.n, 1) + '°', color: C.accent },
        'มุมห่างกันทีละ': { v: '360° ÷ ' + s.n + ' = ' + nf(360 / s.n, 1) + '°', color: C.tan },
        'จำนวนราก': String(s.n),
        'รูปที่ได้': s.n === 2 ? 'อยู่ตรงข้ามกัน' : s.n === 3 ? 'สามเหลี่ยมด้านเท่า' : s.n === 4 ? 'สี่เหลี่ยมจัตุรัส' : s.n + ' เหลี่ยมด้านเท่า'
      });
    }
  });
})();
