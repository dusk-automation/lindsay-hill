/* Lindsay Hill Constructions: design preview by Dusk. Visuals only, nothing is sent anywhere. */
(function () {
  'use strict';
  window.__lhc = true;

  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* moving between pages through the site's own links never replays the intro */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    var h = a.getAttribute('href') || '';
    if (/^(tel:|mailto:|https?:|#)/.test(h)) return;
    try { sessionStorage.setItem('lhc-nav', '1'); } catch (err) { /* private mode */ }
  });

  /* ---------- intro: plan lines, then the logo is built bar by bar ---------- */
  function runIntro(done) {
    var el = $('#intro');
    if (!el || !root.classList.contains('has-intro')) { if (el) el.parentNode.removeChild(el); done(); return; }
    var over = false, timer = 0;
    function finish() {
      if (over) return;
      over = true;
      clearTimeout(timer);
      el.classList.add('out');
      root.classList.remove('intro-lock');
      done();
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        root.classList.remove('has-intro');
        root.classList.add('no-intro');
      }, 1200);
    }
    function play() {
      if (over) return;
      el.classList.add('play');
      timer = setTimeout(finish, 2850);
    }
    el.addEventListener('click', finish);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
    /* give the wordmark's font a moment so the letters do not jump mid-animation */
    var started = false;
    var go = function () { if (!started) { started = true; play(); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    setTimeout(go, 500);
  }

  /* ---------- header, menu, phone call bar ---------- */
  var hdr = $('.hdr'), strip = $('.strip'), mbar = $('.mbar'), hero = $('.hero, .phero');
  var burger = $('.burger'), menu = $('#menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (burger) { burger.setAttribute('aria-expanded', open ? 'true' : 'false'); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
    if (menu) { if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', ''); }
  }
  if (burger && menu) {
    setMenu(false);
    burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1080) setMenu(false); });
  }

  /* ---------- scroll-driven pieces ---------- */
  var story = $('.story'), sLines = [], sSteps = [], sBadge = null, sPlan = null, sStep = -1;
  if (story) {
    sLines = $$('.plan .pl', story); sSteps = $$('.story-steps li', story);
    sBadge = $('.s-badge', story); sPlan = $('.plan', story);
  }
  var BADGES = ['Before', 'The plan', 'After'];
  function updStory() {
    if (!story || !motion) return;
    var r = story.getBoundingClientRect();
    var vh = window.innerHeight - (hdr ? hdr.offsetHeight : 0);
    var total = r.height - vh;
    if (total <= 0) return;
    var p = clamp(((hdr ? hdr.offsetHeight : 0) - r.top) / total, 0, 1);
    var w1 = smooth(.14, .32, p), d = smooth(.26, .58, p), w2 = smooth(.66, .88, p);
    story.style.setProperty('--p', p.toFixed(4));
    story.style.setProperty('--w1', w1.toFixed(4));
    story.style.setProperty('--w2', w2.toFixed(4));
    var edge = w2 > 0 ? w2 : w1, moving = (w1 > 0 && w1 < 1) || (w2 > 0 && w2 < 1);
    story.style.setProperty('--edge', edge.toFixed(4));
    story.style.setProperty('--edge-o', moving ? 1 : 0);
    var n = sLines.length;
    for (var i = 0; i < n; i++) {
      var o = (i / n) * .72;
      sLines[i].style.strokeDashoffset = (1 - clamp((d - o) / .28, 0, 1)).toFixed(3);
    }
    if (sPlan) sPlan.style.setProperty('--lab', smooth(.5, .6, p).toFixed(3));
    var step = p < .2 ? 0 : p < .72 ? 1 : 2;
    if (step !== sStep) {
      sStep = step;
      sSteps.forEach(function (li, k) { li.classList.toggle('on', k === step); });
      if (sBadge) sBadge.textContent = BADGES[step];
    }
  }

  var proc = $$('.proc');
  function updProc() {
    proc.forEach(function (ol) {
      var r = ol.getBoundingClientRect(), vh = window.innerHeight;
      var p = motion ? clamp((vh * .82 - r.top) / (r.height + vh * .3), 0, 1) : 1;
      ol.style.setProperty('--pp', p.toFixed(3));
      var items = $$('li', ol);
      items.forEach(function (li, i) { li.classList.toggle('on', p >= (i + .15) / items.length); });
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.pageYOffset || 0;
      if (hdr) hdr.classList.toggle('solid', y > (strip ? strip.offsetHeight : 0) + 24);
      if (mbar) mbar.classList.toggle('show', y > (hero ? hero.offsetHeight * .55 : 320));
      updStory();
      updProc();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- things that start once the intro is out of the way ---------- */
  function start() {
    root.classList.add('ready');

    var io = (motion && 'IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .1 }) : null;
    $$('.rv, .rv-img, .map').forEach(function (n) { if (io) io.observe(n); else n.classList.add('in'); });

    /* hero clip: a smaller file on phones, none at all on data saver */
    var v = $('.hero-v');
    if (v && motion && !(navigator.connection && navigator.connection.saveData)) {
      var small = window.matchMedia('(max-width: 760px)').matches;
      var src = v.getAttribute(small ? 'data-src-sm' : 'data-src');
      if (src) {
        v.muted = true; v.src = src;
        var playHero = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () { /* autoplay refused: the still frame stays */ }); };
        playHero();
        /* a page opened in a background tab has its clip held; start it when the page is looked at */
        document.addEventListener('visibilitychange', function () { if (!document.hidden && v.paused) playHero(); });
      }
    }
  }

  /* ---------- reel: plays while it is on screen ---------- */
  $$('.reel-frame').forEach(function (frame) {
    var vid = $('video', frame), btn = $('.reel-btn', frame), wanted = motion;
    if (!vid) return;
    vid.muted = true;
    function sync() { var on = !vid.paused; frame.classList.toggle('playing', on); if (btn) btn.setAttribute('aria-label', on ? 'Pause video' : 'Play video'); }
    vid.addEventListener('play', sync); vid.addEventListener('pause', sync);
    if (btn) btn.addEventListener('click', function () {
      if (vid.paused) { wanted = true; var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else { wanted = false; vid.pause(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && wanted) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }
          else if (!e.isIntersecting) vid.pause();
        });
      }, { threshold: .35 }).observe(frame);
    }
    sync();
  });

  /* ---------- work strip arrows ---------- */
  $$('.work').forEach(function (sec) {
    var stripEl = $('.work-strip', sec);
    if (!stripEl) return;
    $$('.work-arrows button', sec).forEach(function (b) {
      b.addEventListener('click', function () {
        var card = $('.work-card', stripEl), step = card ? card.getBoundingClientRect().width + 14 : 320;
        stripEl.scrollBy({ left: (b.getAttribute('data-dir') === 'prev' ? -1 : 1) * step, behavior: motion ? 'smooth' : 'auto' });
      });
    });
  });

  /* ---------- drag to compare ---------- */
  $$('.ba').forEach(function (ba) {
    var handle = $('.ba-handle', ba), drag = false, x = 50;
    function set(v) { x = clamp(v, 0, 100); ba.style.setProperty('--x', x + '%'); if (handle) handle.setAttribute('aria-valuenow', Math.round(x)); }
    function fromEvent(e) { var r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    ba.addEventListener('pointerdown', function (e) { drag = true; try { ba.setPointerCapture(e.pointerId); } catch (err) {} fromEvent(e); });
    ba.addEventListener('pointermove', function (e) { if (drag) fromEvent(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { ba.addEventListener(t, function () { drag = false; }); });
    if (handle) handle.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { set(x - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(x + 5); e.preventDefault(); }
      if (e.key === 'Home') { set(0); e.preventDefault(); }
      if (e.key === 'End') { set(100); e.preventDefault(); }
    });
    set(50);
    /* a small nudge the first time it comes on screen, so it reads as draggable */
    if (motion && 'IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        seen.disconnect();
        var t0 = 0;
        requestAnimationFrame(function tick(now) {
          if (drag) return;
          if (!t0) t0 = now;
          var k = clamp((now - t0) / 1500, 0, 1);
          set(50 + Math.sin(k * Math.PI * 2) * 16 * (1 - k * .4));
          if (k < 1) requestAnimationFrame(tick); else set(50);
        });
      }, { threshold: .5 });
      seen.observe(ba);
    }
  });

  /* ---------- gallery: filter and full-size viewer ---------- */
  var gal = $('.gal'), lb = $('#lb');
  if (gal) {
    var items = $$('.gal-item', gal), chips = $$('.chip');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-f');
        chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
        items.forEach(function (it) { it.hidden = !(f === 'all' || it.getAttribute('data-c') === f); });
      });
    });
    if (lb) {
      var img = $('img', lb), cap = $('.lb-cap', lb), at = 0, last = null;
      var shown = function () { return items.filter(function (it) { return !it.hidden; }); };
      var show = function (i) {
        var list = shown(); if (!list.length) return;
        at = (i + list.length) % list.length;
        var it = list[at], th = $('img', it);
        img.src = th.getAttribute('src'); img.alt = th.getAttribute('alt') || '';
        cap.textContent = ($('span', it) || {}).textContent || '';
      };
      var close = function () { lb.classList.remove('open'); root.classList.remove('lb-open'); if (last) last.focus(); };
      items.forEach(function (it) {
        it.addEventListener('click', function () {
          last = it; lb.classList.add('open'); root.classList.add('lb-open');
          show(shown().indexOf(it)); $('.lb-x', lb).focus();
        });
      });
      $('.lb-x', lb).addEventListener('click', close);
      $('.lb-p', lb).addEventListener('click', function () { show(at - 1); });
      $('.lb-n', lb).addEventListener('click', function () { show(at + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(at - 1);
        if (e.key === 'ArrowRight') show(at + 1);
      });
      var sx = null;
      lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx; sx = null;
        if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
      });
    }
  }

  /* ---------- today's hours ---------- */
  var day = new Date().getDay();
  $$('.hours').forEach(function (dl) {
    $$('[data-d]', dl).forEach(function (n) {
      if (n.getAttribute('data-d').split(',').indexOf(String(day)) > -1) n.classList.add('today');
    });
  });
  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- quote form: three steps, nothing leaves the page ---------- */
  var form = $('#quote');
  if (form) {
    var steps = $$('.q-step', form), prog = $$('.q-prog i', form), done = $('.q-done', form), cur = 0;
    var go = function (i, focus) {
      cur = i;
      steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      prog.forEach(function (b, k) { b.classList.toggle('on', k <= i); });
      if (focus) { var f = $('legend', steps[i]); if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); } form.scrollIntoView({ block: 'start', behavior: motion ? 'smooth' : 'auto' }); }
    };
    var fail = function (fld, msg) {
      var box = fld.closest('.fld') || fld.closest('.q-step'), err = $('.err', box);
      if (box.classList.contains('fld')) box.classList.toggle('bad', !!msg);
      if (err) err.textContent = msg || '';
      if (fld.setAttribute) fld.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    var check = function (i) {
      var ok = true, first = null, s = steps[i];
      if (i === 0) {
        var picked = $$('input[name="job"]:checked', s).length > 0;
        $('.err', s).textContent = picked ? '' : 'Pick at least one kind of job.';
        if (!picked) { ok = false; first = $('input[name="job"]', s); }
      }
      $$('[required]', s).forEach(function (f) {
        var v = (f.value || '').trim(), msg = '';
        if (!v) msg = 'This one is needed.';
        else if (f.type === 'tel' && v.replace(/\D/g, '').length < 8) msg = 'That phone number looks too short.';
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'That email address does not look right.';
        if (!fail(f, msg)) { ok = false; first = first || f; }
      });
      var em = $('input[type="email"]:not([required])', s);
      if (em && em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim())) { fail(em, 'That email address does not look right.'); ok = false; first = first || em; }
      else if (em) fail(em, '');
      if (first) first.focus();
      return ok;
    };
    $$('[data-next]', form).forEach(function (b) { b.addEventListener('click', function () { if (check(cur)) go(cur + 1, true); }); });
    $$('[data-back]', form).forEach(function (b) { b.addEventListener('click', function () { go(cur - 1, true); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check(cur)) return;
      var val = function (n) { var f = form.elements[n]; return f && f.value ? f.value.trim() : ''; };
      var jobs = $$('input[name="job"]:checked', form).map(function (c) { return c.value; }).join(', ');
      var rows = [['Job', jobs], ['Where', val('suburb')], ['When', val('timing')], ['Details', val('details')], ['Name', val('name')], ['Phone', val('phone')], ['Email', val('email')]];
      var dl = $('.q-sum', done);
      while (dl.firstChild) dl.removeChild(dl.firstChild);
      rows.forEach(function (r) {
        if (!r[1]) return;
        var dt = document.createElement('dt'), dd = document.createElement('dd');
        dt.textContent = r[0]; dd.textContent = r[1];
        dl.appendChild(dt); dl.appendChild(dd);
      });
      steps.forEach(function (s) { s.classList.remove('on'); });
      prog.forEach(function (b) { b.classList.add('on'); });
      done.classList.add('on');
      var h = $('h2', done); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      form.scrollIntoView({ block: 'start', behavior: motion ? 'smooth' : 'auto' });
    });
    var again = $('[data-again]', form);
    if (again) again.addEventListener('click', function () { form.reset(); done.classList.remove('on'); go(0, true); });
    /* a service link such as contact.html?job=Bathroom ticks that box */
    var want = (location.search.match(/[?&]job=([^&]+)/) || [])[1];
    if (want) { want = decodeURIComponent(want).toLowerCase(); $$('input[name="job"]', form).forEach(function (c) { if (c.value.toLowerCase() === want) c.checked = true; }); }
    go(0, false);
  }

  runIntro(start);
})();
