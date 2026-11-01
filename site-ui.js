/* SSC26/HSC26 CTG shared UI: theme toggle, roll lookup, share button, sticky rank column.
   <script src="site-ui.js" data-features="theme,lookup" data-exam="all|ssc|hsc"></script> */
(function () {
  'use strict';
  var me = document.currentScript;
  var feats = ((me && me.getAttribute('data-features')) || '').split(',').map(function (s) { return s.trim(); });
  var exam = (me && me.getAttribute('data-exam')) || 'all';
  var has = function (f) { return feats.indexOf(f) > -1; };
  var root = document.documentElement;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  /* ---- theme: light by default ---- */
  if (has('theme')) root.setAttribute('data-theme', store('ctg-theme') === 'dark' ? 'dark' : 'light');

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'ui-toast'; t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('on'); });
    setTimeout(function () { t.classList.remove('on'); setTimeout(function () { t.remove(); }, 300); }, 1800);
  }

  function ready() {
    if (has('sticky')) document.body.classList.add('ui-sticky');

    if (has('theme')) {
      var b = document.createElement('button'); b.className = 'theme-fab'; b.type = 'button';
      var sync = function () {
        var light = root.getAttribute('data-theme') === 'light';
        b.textContent = light ? '🌙' : '☀️';
        b.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      };
      b.onclick = function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next); store('ctg-theme', next); sync();
      };
      sync(); document.body.appendChild(b);
    }

    if (has('lookup')) {
      var panel = document.querySelector('.panel'); if (!panel) return;
      var all = [
        ['ssc', 'SSC 2026 • Science', 'science-details.html'],
        ['ssc', 'SSC 2026 • Business Studies', 'business-details.html'],
        ['ssc', 'SSC 2026 • Humanities', 'humanities-details.html'],
        ['hsc', 'HSC 2026 • Science', 'hsc-science-details.html']
      ].filter(function (o) { return exam === 'all' || o[0] === exam; });
      var box = document.createElement('div'); box.className = 'lk';
      box.innerHTML = '<div class="lk-t"><b>নিজের Result খুঁজুন</b><span>Roll নম্বর দিয়ে সরাসরি Individual Result খুলুন</span></div>' +
        '<form novalidate><select aria-label="Exam and group">' +
        all.map(function (o) { return '<option value="' + o[2] + '">' + o[1] + '</option>'; }).join('') +
        '</select><input inputmode="numeric" autocomplete="off" placeholder="Roll নম্বর (যেমন 123456)" aria-label="Roll number"><button type="submit">Result দেখুন</button></form><div class="lk-msg" role="alert"></div>';
      panel.insertBefore(box, panel.firstChild);
      var sel = box.querySelector('select'), inp = box.querySelector('input'), msg = box.querySelector('.lk-msg');
      var last = store('ctg-last-group'); if (last) for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === last) sel.selectedIndex = i;
      box.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var v = inp.value.replace(/[০-৯]/g, function (d) { return '০১২৩৪৫৬৭৮৯'.indexOf(d); }).replace(/\s+/g, '');
        if (!/^\d{3,12}$/.test(v)) { msg.textContent = 'সঠিক Roll নম্বর দিন (শুধু সংখ্যা)।'; inp.focus(); return; }
        msg.textContent = ''; store('ctg-last-group', sel.value);
        location.href = sel.value + '?roll=' + encodeURIComponent(v);
      });
    }

    if (has('share')) {
      var tb = document.querySelector('.topbar'), back = tb && tb.querySelector('.back'); if (!tb || !back) return;
      var wrap = document.createElement('div'); wrap.className = 'tb-right';
      back.parentNode.insertBefore(wrap, back); wrap.appendChild(back);
      var s = document.createElement('button'); s.type = 'button'; s.className = 'share-btn'; s.textContent = '↗ Share';
      s.onclick = function () {
        var nm = (document.getElementById('sName') || {}).textContent || 'Result';
        var data = { title: nm + ' — Result', text: nm + ' এর Result দেখুন', url: location.href };
        if (navigator.share) { navigator.share(data).catch(function () {}); return; }
        var done = function () { toast('Link copy হয়েছে ✓'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(done, function () { prompt('Link copy করুন:', location.href); });
        else prompt('Link copy করুন:', location.href);
      };
      wrap.insertBefore(s, back);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
