/* =========================================================================
   site.js — โครงร่างร่วมของทุกหน้า: แถบบน, สารบัญข้าง, การเลื่อนตามหัวข้อ
   ========================================================================= */
(function () {
  'use strict';

  var CHAPTERS = [
    { file: 'index.html', n: '',    title: 'หน้าแรก' },
    { file: 'ch1.html',   n: 'บท 1', title: 'สามเหลี่ยมมุมฉาก' },
    { file: 'ch2.html',   n: 'บท 2', title: 'วงกลมหนึ่งหน่วย' },
    { file: 'ch3.html',   n: 'บท 3', title: 'กราฟฟังก์ชันตรีโกณ' },
    { file: 'ch4.html',   n: 'บท 4', title: 'เอกลักษณ์ตรีโกณ' },
    { file: 'ch5.html',   n: 'บท 5', title: 'สมการตรีโกณ' },
    { file: 'ch6.html',   n: 'บท 6', title: 'กฎไซน์–โคไซน์' }
  ];

  function currentFile() {
    var p = location.pathname.split('/').pop();
    return (!p || p === '') ? 'index.html' : p;
  }

  function build() {
    var here = currentFile();

    /* ---------- แถบบน ---------- */
    var bar = document.createElement('header');
    bar.className = 'topbar';
    var navHtml = CHAPTERS.slice(1).map(function (c) {
      return '<a href="' + c.file + '"' + (c.file === here ? ' class="active"' : '') + '>' +
             c.n + ' · ' + c.title + '</a>';
    }).join('');
    bar.innerHTML =
      '<button class="menu-btn" type="button" aria-label="เปิดสารบัญ">☰</button>' +
      '<a class="brand" href="index.html"><span class="mark">△</span>ตรีโกณมิติเห็นภาพ</a>' +
      '<nav>' + navHtml + '</nav>';
    document.body.insertBefore(bar, document.body.firstChild);

    /* ---------- สารบัญข้าง ---------- */
    var side = document.querySelector('.sidebar');
    if (side) {
      var html = '<h4>บทเรียน</h4>';
      CHAPTERS.forEach(function (c) {
        html += '<a href="' + c.file + '"' + (c.file === here ? ' class="active"' : '') + '>' +
                (c.n ? c.n + ' · ' : '') + c.title + '</a>';
      });
      var hs = document.querySelectorAll('main h2[id]');
      if (hs.length) {
        html += '<h4 style="margin-top:24px">ในบทนี้</h4>';
        hs.forEach(function (h) {
          html += '<a class="sub" href="#' + h.id + '" data-toc="' + h.id + '">' +
                  h.textContent.replace(/\s*¶\s*$/, '') + '</a>';
        });
      }
      side.innerHTML = html;
    }

    /* ---------- ปุ่มเมนูมือถือ ---------- */
    var btn = bar.querySelector('.menu-btn');
    btn.addEventListener('click', function () {
      if (side) side.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!side || !side.classList.contains('open')) return;
      if (side.contains(e.target) || btn.contains(e.target)) {
        if (e.target.tagName === 'A') side.classList.remove('open');
        return;
      }
      side.classList.remove('open');
    });

    /* ---------- ไฮไลต์หัวข้อที่กำลังอ่าน ---------- */
    var tocLinks = side ? side.querySelectorAll('a[data-toc]') : [];
    if (tocLinks.length && 'IntersectionObserver' in window) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
        var found = null;
        document.querySelectorAll('main h2[id]').forEach(function (h) {
          if (!found && seen[h.id]) found = h.id;
        });
        tocLinks.forEach(function (a) {
          a.classList.toggle('active', a.dataset.toc === found);
        });
      }, { rootMargin: '-70px 0px -70% 0px' });
      document.querySelectorAll('main h2[id]').forEach(function (h) { io.observe(h); });
    }

    /* ---------- ท้ายหน้า ---------- */
    if (!document.querySelector('footer')) {
      var f = document.createElement('footer');
      f.innerHTML = 'ตรีโกณมิติเห็นภาพ · สื่อการเรียนรู้แบบโต้ตอบสำหรับระดับมัธยมปลาย<br>' +
        'สร้างด้วย HTML/CSS/JavaScript ล้วน · เผยแพร่บน GitHub Pages';
      document.body.appendChild(f);
    }
  }

  /* ---------- KaTeX ---------- */
  function typeset() {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false,
        ignoredClasses: ['widget']
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else build();

  window.addEventListener('load', typeset);
  document.addEventListener('DOMContentLoaded', function () { setTimeout(typeset, 0); });
})();
