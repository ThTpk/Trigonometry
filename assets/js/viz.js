/* =========================================================================
   viz.js — เครื่องมือวาดกราฟ/รูปเรขาคณิตบน <canvas> สำหรับทุก widget ในเว็บนี้
   ไม่พึ่งไลบรารีภายนอก  ใช้ได้ทั้ง desktop และ touch
   ========================================================================= */
(function (global) {
  'use strict';

  /* ---------- สีกลาง ใช้ให้ตรงกับ CSS ---------- */
  var C = {
    sin:  '#1d4ed8',
    cos:  '#c2410c',
    tan:  '#047857',
    hyp:  '#7c3aed',
    accent: '#b45309',
    ink:  '#1c1c1a',
    soft: '#55534d',
    faint:'#8a8880',
    grid: '#ebe9e1',
    gridMinor: '#f4f2ec',
    axis: '#9c9890',
    paper:'#ffffff',
    fill: 'rgba(29,78,216,.10)',
    fill2:'rgba(194,65,12,.10)',
    fill3:'rgba(4,120,87,.10)'
  };

  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function d2r(d) { return d * Math.PI / 180; }
  function r2d(r) { return r * 180 / Math.PI; }
  function nf(v, n) {
    if (!isFinite(v)) return '∞';
    var s = v.toFixed(n === undefined ? 3 : n);
    if (s === '-0.000' || s === '-0.00' || s === '-0.0' || s === '-0') s = s.slice(1);
    return s;
  }

  /* คืนสตริงเรเดียนสวย ๆ เช่น "π/6", "5π/4", "0" */
  function radLabel(x) {
    var k = x / Math.PI;
    if (Math.abs(k) < 1e-9) return '0';
    var dens = [1, 2, 3, 4, 6, 12];
    for (var i = 0; i < dens.length; i++) {
      var d = dens[i], n = k * d;
      if (Math.abs(n - Math.round(n)) < 1e-7) {
        n = Math.round(n);
        var sign = n < 0 ? '−' : '';
        n = Math.abs(n);
        var num = (n === 1 ? 'π' : n + 'π');
        return sign + (d === 1 ? num : num + '/' + d);
      }
    }
    return nf(x, 2);
  }

  /* =====================================================================
     Plot — ระบบพิกัดบน canvas
     ===================================================================== */
  function Plot(canvas, opts) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.o = Object.assign({
      xmin: -1, xmax: 1, ymin: -1, ymax: 1,
      equal: false,        // true = สเกลแกน x และ y เท่ากัน (สำหรับรูปเรขาคณิต)
      pad: 16,
      ratio: 0.58,         // สัดส่วนความสูง/ความกว้าง เมื่อไม่ระบุ height
      minH: 230, maxH: 430
    }, opts || {});
    this.W = 0; this.H = 0;
  }

  Plot.prototype.setBounds = function (b) {
    Object.assign(this.o, b);
    this._transform();
  };

  Plot.prototype.resize = function (cssW) {
    var o = this.o;
    var h = o.height || clamp(cssW * o.ratio, o.minH, o.maxH);
    var dpr = Math.min(global.devicePixelRatio || 1, 2.5);
    this.W = cssW; this.H = h;
    this.cv.width = Math.round(cssW * dpr);
    this.cv.height = Math.round(h * dpr);
    this.cv.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._transform();
  };

  Plot.prototype._transform = function () {
    var o = this.o, pad = o.pad;
    var W = this.W - 2 * pad, H = this.H - 2 * pad;
    var sx = W / (o.xmax - o.xmin);
    var sy = H / (o.ymax - o.ymin);
    if (o.equal) { var s = Math.min(sx, sy); sx = s; sy = s; }
    this.sx = sx; this.sy = sy;
    this.ox = pad + (W - sx * (o.xmax - o.xmin)) / 2 - sx * o.xmin;
    this.oy = pad + (H - sy * (o.ymax - o.ymin)) / 2 + sy * o.ymax;
  };

  Plot.prototype.X = function (x) { return this.ox + this.sx * x; };
  Plot.prototype.Y = function (y) { return this.oy - this.sy * y; };
  Plot.prototype.iX = function (px) { return (px - this.ox) / this.sx; };
  Plot.prototype.iY = function (py) { return (this.oy - py) / this.sy; };

  Plot.prototype.clear = function (bg) {
    var c = this.ctx;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.cv.width, this.cv.height);
    c.restore();
    if (bg !== false) { c.fillStyle = bg || C.paper; c.fillRect(0, 0, this.W, this.H); }
  };

  /* ---------- เส้นกริด ---------- */
  Plot.prototype.grid = function (stepX, stepY, color) {
    var c = this.ctx, o = this.o, i;
    c.save();
    c.strokeStyle = color || C.grid; c.lineWidth = 1;
    c.beginPath();
    if (stepX) {
      for (i = Math.ceil(o.xmin / stepX) * stepX; i <= o.xmax + 1e-9; i += stepX) {
        var px = Math.round(this.X(i)) + .5;
        c.moveTo(px, this.Y(o.ymin)); c.lineTo(px, this.Y(o.ymax));
      }
    }
    if (stepY) {
      for (i = Math.ceil(o.ymin / stepY) * stepY; i <= o.ymax + 1e-9; i += stepY) {
        var py = Math.round(this.Y(i)) + .5;
        c.moveTo(this.X(o.xmin), py); c.lineTo(this.X(o.xmax), py);
      }
    }
    c.stroke(); c.restore();
  };

  /* ---------- แกน ----------
     opt: {xStep, yStep, xLabel:'num'|'pi'|'deg'|false, yLabel, xName, yName, digits} */
  Plot.prototype.axes = function (opt) {
    opt = opt || {};
    var c = this.ctx, o = this.o, i;
    var y0 = clamp(0, o.ymin, o.ymax), x0 = clamp(0, o.xmin, o.xmax);
    c.save();
    c.strokeStyle = C.axis; c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(this.X(o.xmin), Math.round(this.Y(y0)) + .5);
    c.lineTo(this.X(o.xmax), Math.round(this.Y(y0)) + .5);
    c.moveTo(Math.round(this.X(x0)) + .5, this.Y(o.ymin));
    c.lineTo(Math.round(this.X(x0)) + .5, this.Y(o.ymax));
    c.stroke();

    c.fillStyle = C.faint;
    c.font = '11px "JetBrains Mono", ui-monospace, monospace';
    var dg = opt.digits === undefined ? 0 : opt.digits;

    if (opt.xStep && opt.xLabel !== false) {
      c.textAlign = 'center'; c.textBaseline = 'top';
      for (i = Math.ceil(o.xmin / opt.xStep) * opt.xStep; i <= o.xmax + 1e-9; i += opt.xStep) {
        if (Math.abs(i) < 1e-9) continue;
        var lx = opt.xLabel === 'pi' ? radLabel(i)
               : opt.xLabel === 'deg' ? Math.round(i) + '°' : nf(i, dg);
        c.beginPath();
        c.strokeStyle = C.axis;
        c.moveTo(Math.round(this.X(i)) + .5, this.Y(y0) - 3);
        c.lineTo(Math.round(this.X(i)) + .5, this.Y(y0) + 3);
        c.stroke();
        c.fillText(lx, this.X(i), this.Y(y0) + 6);
      }
    }
    if (opt.yStep && opt.yLabel !== false) {
      c.textAlign = 'right'; c.textBaseline = 'middle';
      for (i = Math.ceil(o.ymin / opt.yStep) * opt.yStep; i <= o.ymax + 1e-9; i += opt.yStep) {
        if (Math.abs(i) < 1e-9) continue;
        var ly = opt.yLabel === 'pi' ? radLabel(i) : nf(i, opt.yDigits === undefined ? dg : opt.yDigits);
        c.beginPath();
        c.strokeStyle = C.axis;
        c.moveTo(this.X(x0) - 3, Math.round(this.Y(i)) + .5);
        c.lineTo(this.X(x0) + 3, Math.round(this.Y(i)) + .5);
        c.stroke();
        c.fillText(ly, this.X(x0) - 7, this.Y(i));
      }
    }
    if (opt.xName) {
      c.textAlign = 'right'; c.textBaseline = 'bottom';
      c.fillStyle = C.soft; c.font = 'italic 12px Georgia, serif';
      c.fillText(opt.xName, this.X(o.xmax) - 2, this.Y(y0) - 5);
    }
    if (opt.yName) {
      c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillStyle = C.soft; c.font = 'italic 12px Georgia, serif';
      c.fillText(opt.yName, this.X(x0) + 6, this.Y(o.ymax) + 2);
    }
    c.restore();
  };

  /* ---------- เส้น / รูปหลายเหลี่ยม ---------- */
  Plot.prototype.line = function (x1, y1, x2, y2, opt) {
    opt = opt || {};
    var c = this.ctx;
    c.save();
    c.strokeStyle = opt.color || C.ink;
    c.lineWidth = opt.w || 2;
    c.lineCap = opt.cap || 'round';
    if (opt.dash) c.setLineDash(opt.dash);
    c.beginPath();
    c.moveTo(this.X(x1), this.Y(y1));
    c.lineTo(this.X(x2), this.Y(y2));
    c.stroke();
    c.restore();
  };

  Plot.prototype.poly = function (pts, opt) {
    opt = opt || {};
    var c = this.ctx, i;
    if (!pts.length) return;
    c.save();
    if (opt.dash) c.setLineDash(opt.dash);
    c.beginPath();
    c.moveTo(this.X(pts[0][0]), this.Y(pts[0][1]));
    for (i = 1; i < pts.length; i++) c.lineTo(this.X(pts[i][0]), this.Y(pts[i][1]));
    if (opt.close !== false) c.closePath();
    if (opt.fill) { c.fillStyle = opt.fill; c.fill(); }
    if (opt.color) { c.strokeStyle = opt.color; c.lineWidth = opt.w || 2; c.lineJoin = 'round'; c.stroke(); }
    c.restore();
  };

  /* ---------- กราฟฟังก์ชัน f(x) ----------
     ตัดเส้นอัตโนมัติเมื่อค่ากระโดด (เช่น เส้นกำกับของ tan) */
  Plot.prototype.func = function (f, opt) {
    opt = opt || {};
    var c = this.ctx, o = this.o;
    var a = opt.from === undefined ? o.xmin : opt.from;
    var b = opt.to === undefined ? o.xmax : opt.to;
    var n = opt.steps || Math.max(240, Math.round(this.W * 1.4));
    var dx = (b - a) / n;
    var jump = opt.jump === undefined ? (o.ymax - o.ymin) * 0.55 : opt.jump;
    c.save();
    c.strokeStyle = opt.color || C.sin;
    c.lineWidth = opt.w || 2.4;
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (opt.dash) c.setLineDash(opt.dash);
    if (opt.alpha !== undefined) c.globalAlpha = opt.alpha;
    c.beginPath();
    var pen = false, prev = null;
    for (var i = 0; i <= n; i++) {
      var x = a + i * dx, y = f(x);
      if (!isFinite(y) || y > o.ymax + jump * 3 || y < o.ymin - jump * 3) { pen = false; prev = null; continue; }
      if (prev !== null && Math.abs(y - prev) > jump) pen = false;
      var px = this.X(x), py = this.Y(clamp(y, o.ymin - jump, o.ymax + jump));
      if (!pen) { c.moveTo(px, py); pen = true; } else c.lineTo(px, py);
      prev = y;
    }
    c.stroke();
    c.restore();
  };

  /* ---------- วงกลม / จุด ---------- */
  Plot.prototype.circle = function (cx, cy, r, opt) {
    opt = opt || {};
    var c = this.ctx;
    c.save();
    if (opt.dash) c.setLineDash(opt.dash);
    c.beginPath();
    c.ellipse(this.X(cx), this.Y(cy), r * this.sx, r * this.sy, 0, 0, TAU);
    if (opt.fill) { c.fillStyle = opt.fill; c.fill(); }
    if (opt.color) { c.strokeStyle = opt.color; c.lineWidth = opt.w || 2; c.stroke(); }
    c.restore();
  };

  Plot.prototype.dot = function (x, y, opt) {
    opt = opt || {};
    var c = this.ctx, r = opt.r || 6;
    c.save();
    c.beginPath();
    c.arc(this.X(x), this.Y(y), r, 0, TAU);
    c.fillStyle = opt.fill || opt.color || C.ink; c.fill();
    c.lineWidth = opt.w || 2.5;
    c.strokeStyle = opt.ring || C.paper; c.stroke();
    if (opt.halo) {
      c.beginPath(); c.arc(this.X(x), this.Y(y), r + 5, 0, TAU);
      c.strokeStyle = opt.halo; c.lineWidth = 1.5; c.globalAlpha = .45; c.stroke();
    }
    c.restore();
  };

  /* ---------- ส่วนโค้ง (ใช้วาดมุม) ----------
     a0,a1 เป็นเรเดียนวัดทวนเข็มจากแกน x บวก */
  Plot.prototype.arc = function (cx, cy, r, a0, a1, opt) {
    opt = opt || {};
    var c = this.ctx;
    c.save();
    if (opt.dash) c.setLineDash(opt.dash);
    c.beginPath();
    c.arc(this.X(cx), this.Y(cy), r * this.sx, -a0, -a1, a1 > a0);
    if (opt.fill) {
      c.lineTo(this.X(cx), this.Y(cy)); c.closePath();
      c.fillStyle = opt.fill; c.fill();
      c.beginPath(); c.arc(this.X(cx), this.Y(cy), r * this.sx, -a0, -a1, a1 > a0);
    }
    if (opt.color) { c.strokeStyle = opt.color; c.lineWidth = opt.w || 1.8; c.stroke(); }
    c.restore();
  };

  /* ---------- สัญลักษณ์มุมฉาก ---------- */
  Plot.prototype.rightAngle = function (cx, cy, ux, uy, vx, vy, size, color) {
    var s = size || 13, c = this.ctx;
    var px = this.X(cx), py = this.Y(cy);
    var u = norm2(ux, uy), v = norm2(vx, vy);
    c.save();
    c.strokeStyle = color || C.faint; c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(px + u[0] * s, py - u[1] * s);
    c.lineTo(px + u[0] * s + v[0] * s, py - u[1] * s - v[1] * s);
    c.lineTo(px + v[0] * s, py - v[1] * s);
    c.stroke(); c.restore();
  };
  function norm2(x, y) { var m = Math.hypot(x, y) || 1; return [x / m, y / m]; }

  /* ---------- ข้อความ ----------
     opt: {dx,dy,color,size,align,base,bg,weight,italic} — dx,dy เป็นพิกเซล */
  Plot.prototype.text = function (x, y, str, opt) {
    opt = opt || {};
    var c = this.ctx;
    var px = this.X(x) + (opt.dx || 0), py = this.Y(y) + (opt.dy || 0);
    c.save();
    var fam = opt.mono ? '"JetBrains Mono", ui-monospace, monospace' : '"Sarabun", system-ui, sans-serif';
    c.font = (opt.italic ? 'italic ' : '') + (opt.weight || 600) + ' ' + (opt.size || 12) + 'px ' + fam;
    c.textAlign = opt.align || 'center';
    c.textBaseline = opt.base || 'middle';
    if (opt.bg) {
      var m = c.measureText(str), w = m.width + 8, h = (opt.size || 12) + 7;
      var bx = c.textAlign === 'center' ? px - w / 2 : (c.textAlign === 'right' ? px - w + 4 : px - 4);
      var by = c.textBaseline === 'middle' ? py - h / 2 : (c.textBaseline === 'bottom' ? py - h : py);
      c.fillStyle = opt.bg;
      if (c.roundRect) { c.beginPath(); c.roundRect(bx, by, w, h, 4); c.fill(); }
      else c.fillRect(bx, by, w, h);
    }
    c.fillStyle = opt.color || C.ink;
    c.fillText(str, px, py);
    c.restore();
  };

  /* ---------- ลูกศร ---------- */
  Plot.prototype.arrow = function (x1, y1, x2, y2, opt) {
    opt = opt || {};
    this.line(x1, y1, x2, y2, opt);
    var c = this.ctx;
    var ax = this.X(x2), ay = this.Y(y2);
    var ang = Math.atan2(this.Y(y1) - ay, this.X(x1) - ax);
    var s = opt.head || 9;
    c.save();
    c.fillStyle = opt.color || C.ink;
    c.beginPath();
    c.moveTo(ax, ay);
    c.lineTo(ax + Math.cos(ang - .38) * s, ay + Math.sin(ang - .38) * s);
    c.lineTo(ax + Math.cos(ang + .38) * s, ay + Math.sin(ang + .38) * s);
    c.closePath(); c.fill(); c.restore();
  };

  /* ---------- ลูกศรเส้นโค้ง (quadratic bézier) ----------
     (x0,y0) จุดเริ่ม · (cx,cy) จุดควบคุมความโค้ง · (x1,y1) ปลายลูกศร */
  Plot.prototype.curveArrow = function (x0, y0, cx, cy, x1, y1, opt) {
    opt = opt || {};
    var c = this.ctx;
    var X0 = this.X(x0), Y0 = this.Y(y0);
    var CX = this.X(cx), CY = this.Y(cy);
    var X1 = this.X(x1), Y1 = this.Y(y1);
    c.save();
    c.strokeStyle = opt.color || C.ink;
    c.lineWidth = opt.w || 2;
    c.lineCap = 'round';
    if (opt.dash) c.setLineDash(opt.dash);
    c.beginPath();
    c.moveTo(X0, Y0);
    c.quadraticCurveTo(CX, CY, X1, Y1);
    c.stroke();
    c.setLineDash([]);
    /* หัวลูกศรวางตามทิศสัมผัสที่ปลายเส้น */
    var tx = X1 - CX, ty = Y1 - CY, m = Math.hypot(tx, ty) || 1;
    tx /= m; ty /= m;
    var s = opt.head || 9, w = s * 0.46;
    c.fillStyle = opt.color || C.ink;
    c.beginPath();
    c.moveTo(X1, Y1);
    c.lineTo(X1 - tx * s + ty * w, Y1 - ty * s - tx * w);
    c.lineTo(X1 - tx * s - ty * w, Y1 - ty * s + tx * w);
    c.closePath();
    c.fill();
    c.restore();
  };

  /* ---------- แถบมาตราส่วนกำกับความยาว (brace แบบง่าย) ---------- */
  Plot.prototype.measure = function (x1, y1, x2, y2, off, label, color) {
    var c = this.ctx;
    var p1 = [this.X(x1), this.Y(y1)], p2 = [this.X(x2), this.Y(y2)];
    var dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy) || 1;
    var nx = -dy / L * off, ny = dx / L * off;
    c.save();
    c.strokeStyle = color || C.faint; c.lineWidth = 1.2; c.setLineDash([3, 3]);
    c.beginPath();
    c.moveTo(p1[0], p1[1]); c.lineTo(p1[0] + nx, p1[1] + ny);
    c.moveTo(p2[0], p2[1]); c.lineTo(p2[0] + nx, p2[1] + ny);
    c.stroke();
    c.setLineDash([]);
    c.beginPath();
    c.moveTo(p1[0] + nx, p1[1] + ny); c.lineTo(p2[0] + nx, p2[1] + ny);
    c.stroke();
    if (label) {
      c.font = '600 12px "Sarabun", system-ui, sans-serif';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      var mx = (p1[0] + p2[0]) / 2 + nx, my = (p1[1] + p2[1]) / 2 + ny;
      var w = c.measureText(label).width + 8;
      c.fillStyle = C.paper; c.fillRect(mx - w / 2, my - 9, w, 18);
      c.fillStyle = color || C.soft; c.fillText(label, mx, my);
    }
    c.restore();
  };

  /* =====================================================================
     widget() — สร้าง DOM ของ widget ทั้งชุดจาก spec เดียว
     ===================================================================== */
  function widget(sel, spec) {
    var host = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!host) return null;

    var state = {};
    (spec.controls || []).forEach(function (c) { if (c.key !== undefined) state[c.key] = c.value; });

    /* ---- หัว ---- */
    if (spec.title) {
      var head = el('div', 'widget-head');
      var t = el('div', 'wt');
      if (spec.badge) t.appendChild(el('span', 'badge', spec.badge));
      t.appendChild(document.createTextNode(spec.title));
      head.appendChild(t);
      if (spec.desc) head.appendChild(el('div', 'wd', spec.desc));
      host.appendChild(head);
    }

    /* ---- canvas ---- */
    var wrap = el('div', 'widget-canvas');
    var canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', spec.title || 'ภาพประกอบเชิงโต้ตอบ');
    wrap.appendChild(canvas);
    host.appendChild(wrap);

    var plot = new Plot(canvas, spec.plot || {});

    /* ---- readout ---- */
    var readout = null, statEls = {};
    if (spec.stats !== false) { readout = el('div', 'readout'); host.appendChild(readout); }

    /* ---- controls ---- */
    var ctrlBar = null;
    if (spec.controls && spec.controls.length) {
      ctrlBar = el('div', 'widget-controls');
      host.appendChild(ctrlBar);
    }

    if (spec.hint) host.appendChild(el('div', 'hint', spec.hint));

    var api = {
      state: state,
      plot: plot,
      redraw: render,
      set: function (k, v) { state[k] = v; syncControls(); render(); },
      stats: setStats,
      animate: animate,
      stopAnim: stopAnim,
      isAnimating: function () { return raf !== 0; }
    };

    /* ---- สร้างตัวควบคุม ---- */
    var refresh = [];
    (spec.controls || []).forEach(function (c) {
      if (c.type === 'range') {
        var box = el('div', 'ctrl');
        var lab = el('label');
        lab.appendChild(document.createTextNode(c.label));
        var val = el('span', 'val');
        lab.appendChild(val);
        var inp = document.createElement('input');
        inp.type = 'range'; inp.min = c.min; inp.max = c.max;
        inp.step = c.step === undefined ? 1 : c.step; inp.value = c.value;
        inp.addEventListener('input', function () {
          state[c.key] = parseFloat(inp.value);
          stopAnim();
          val.textContent = fmtOf(c)(state[c.key]);
          render();
        });
        box.appendChild(lab); box.appendChild(inp);
        ctrlBar.appendChild(box);
        refresh.push(function () { inp.value = state[c.key]; val.textContent = fmtOf(c)(state[c.key]); });
      } else if (c.type === 'seg') {
        var segBox = el('div', 'ctrl');
        segBox.style.flex = '0 0 auto'; segBox.style.minWidth = '0';
        if (c.label) segBox.appendChild(el('label', null, c.label));
        var seg = el('div', 'seg');
        var btns = c.options.map(function (op) {
          var b = document.createElement('button');
          b.textContent = op[1]; b.type = 'button';
          b.addEventListener('click', function () {
            state[c.key] = op[0]; syncControls(); render();
            if (c.onchange) c.onchange(api);
          });
          seg.appendChild(b);
          return { b: b, v: op[0] };
        });
        segBox.appendChild(seg); ctrlBar.appendChild(segBox);
        refresh.push(function () {
          btns.forEach(function (x) { x.b.classList.toggle('on', state[c.key] === x.v); });
        });
      } else if (c.type === 'select') {
        var selBox = el('div', 'ctrl');
        if (c.label) selBox.appendChild(el('label', null, c.label));
        var sl = document.createElement('select');
        sl.className = 'btn';
        sl.style.width = '100%';
        sl.style.cursor = 'pointer';
        c.options.forEach(function (op, i) {
          var o2 = document.createElement('option');
          o2.value = String(i); o2.textContent = op[1];
          sl.appendChild(o2);
        });
        sl.addEventListener('change', function () {
          state[c.key] = c.options[parseInt(sl.value, 10)][0];
          render();
        });
        selBox.appendChild(sl);
        if (c.wide) { selBox.style.flex = '1 1 320px'; selBox.style.minWidth = '260px'; }
        ctrlBar.appendChild(selBox);
        refresh.push(function () {
          for (var i = 0; i < c.options.length; i++) {
            if (c.options[i][0] === state[c.key]) { sl.value = String(i); break; }
          }
        });
      } else if (c.type === 'check') {
        var lab2 = el('label', 'chk');
        var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!c.value;
        cb.addEventListener('change', function () { state[c.key] = cb.checked; render(); });
        lab2.appendChild(cb); lab2.appendChild(document.createTextNode(c.label));
        lab2.style.flex = '0 0 auto';
        ctrlBar.appendChild(lab2);
        refresh.push(function () { cb.checked = !!state[c.key]; });
      } else if (c.type === 'button') {
        var bt = document.createElement('button');
        bt.type = 'button';
        bt.className = 'btn' + (c.primary ? ' primary' : '');
        bt.textContent = c.label;
        bt.addEventListener('click', function () { c.action(api, bt); });
        ctrlBar.appendChild(bt);
        if (c.ref) c.ref(bt);
      }
    });

    function fmtOf(c) { return c.fmt || function (v) { return String(v); }; }
    function syncControls() { refresh.forEach(function (f) { f(); }); }

    /* ---- readout ---- */
    var lastKeys = '';
    function setStats(obj) {
      if (!readout) return;
      var keys = Object.keys(obj);
      var sig = keys.join('|');
      if (sig !== lastKeys) {
        readout.innerHTML = ''; statEls = {};
        keys.forEach(function (k) {
          var s = el('div', 'stat');
          s.appendChild(el('div', 'k', k));
          var v = el('div', 'v');
          s.appendChild(v); readout.appendChild(s);
          statEls[k] = v;
        });
        lastKeys = sig;
      }
      keys.forEach(function (k) {
        var it = obj[k];
        if (it && typeof it === 'object') {
          statEls[k].textContent = it.v;
          statEls[k].style.color = it.color || '';
        } else {
          statEls[k].textContent = it;
        }
      });
    }

    /* ---- แอนิเมชัน ---- */
    var raf = 0, t0 = 0;
    function animate(step) {
      stopAnim();
      t0 = performance.now();
      var loop = function (now) {
        var dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
        if (step(dt, api) === false) { raf = 0; syncControls(); render(); return; }
        syncControls(); render();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    function stopAnim() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    /* ---- pointer ---- */
    if (spec.onPointer) {
      var dragging = false;
      var pos = function (e) {
        var r = canvas.getBoundingClientRect();
        return [plot.iX(e.clientX - r.left), plot.iY(e.clientY - r.top)];
      };
      canvas.addEventListener('pointerdown', function (e) {
        var p = pos(e);
        if (spec.onPointer(plot, state, p[0], p[1], 'down', api) !== false) {
          dragging = true; canvas.setPointerCapture(e.pointerId);
          stopAnim(); syncControls(); render(); e.preventDefault();
        }
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var p = pos(e);
        spec.onPointer(plot, state, p[0], p[1], 'move', api);
        syncControls(); render(); e.preventDefault();
      });
      var up = function (e) {
        if (!dragging) return;
        dragging = false;
        spec.onPointer(plot, state, 0, 0, 'up', api);
        syncControls(); render();
      };
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointercancel', up);
    } else {
      canvas.style.cursor = 'default';
    }

    /* ---- วาด ---- */
    function render() {
      if (!plot.W) return;
      plot.clear();
      spec.draw(plot, state, api);
    }

    function doResize() {
      var w = wrap.clientWidth;
      if (!w) return;
      plot.resize(w);
      render();
    }

    if (global.ResizeObserver) {
      var ro = new ResizeObserver(function () { doResize(); });
      ro.observe(wrap);
    } else {
      global.addEventListener('resize', doResize);
    }

    syncControls();
    doResize();
    /* วาดซ้ำเมื่อฟอนต์ไทยโหลดเสร็จ ไม่งั้นข้อความบน canvas จะใช้ฟอนต์สำรอง */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
    if (spec.init) spec.init(api);
    return api;
  }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt !== undefined && txt !== null) e.textContent = txt;
    return e;
  }

  global.TV = {
    C: C, Plot: Plot, widget: widget,
    clamp: clamp, d2r: d2r, r2d: r2d, nf: nf, radLabel: radLabel, TAU: TAU, el: el
  };
})(window);
