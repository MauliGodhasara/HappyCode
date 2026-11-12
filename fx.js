// =====================================================
// FX — shared, purely visual effects for every page.
// Floating hearts, cursor sparkles, click bursts,
// page transitions, scroll reveals, wavy titles.
// (No game logic lives here.)
// =====================================================
(() => {
  'use strict';

  const doc = document;
  const body = doc.body;
  const mq = (q) => (window.matchMedia ? window.matchMedia(q).matches : false);
  const reduce = mq('(prefers-reduced-motion: reduce)');
  const finePointer = mq('(pointer: fine)');
  const FX = { reduce, finePointer };

  // ---------- helpers ----------
  function spawn(x, y, cls, text, vars) {
    const s = doc.createElement('span');
    s.className = cls;
    s.textContent = text;
    s.setAttribute('aria-hidden', 'true');
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    if (vars) for (const k in vars) s.style.setProperty(k, vars[k]);
    body.appendChild(s);
    s.addEventListener('animationend', () => s.remove(), { once: true });
    setTimeout(() => s.remove(), 4000); // safety net
    return s;
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- floating hearts background ----------
  (function floatLayer() {
    const count = parseInt(body.dataset.fxHearts || '16', 10);
    if (reduce || !count) return;
    const glyphs = (body.dataset.fxGlyphs || '💗,💕,💖,🤍,✨,🌸').split(',');
    const layer = doc.createElement('div');
    layer.className = 'fx-float';
    layer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < count; i++) {
      const s = doc.createElement('span');
      s.textContent = glyphs[i % glyphs.length];
      s.style.setProperty('--x', rand(0, 100).toFixed(2) + 'vw');
      s.style.setProperty('--size', rand(14, 34).toFixed(0) + 'px');
      s.style.setProperty('--dur', rand(13, 26).toFixed(1) + 's');
      s.style.setProperty('--delay', (-rand(0, 26)).toFixed(1) + 's');
      s.style.setProperty('--sway', (rand(20, 70) * (Math.random() < 0.5 ? -1 : 1)).toFixed(0) + 'px');
      s.style.setProperty('--op', rand(0.25, 0.7).toFixed(2));
      layer.appendChild(s);
    }
    body.prepend(layer);
  })();

  // ---------- cursor sparkle trail (mouse only) ----------
  if (!reduce && finePointer) {
    let last = 0;
    const colors = ['#ff6f9f', '#ffb6c1', '#e84378', '#ffd1dc', '#ff9ec4'];
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      spawn(e.clientX, e.clientY, 'fx-trail', Math.random() < 0.55 ? '✦' : '♥', {
        '--c': pick(colors),
        '--dx': rand(-14, 14).toFixed(0) + 'px',
        '--s': rand(0.6, 1.2).toFixed(2),
      });
    }, { passive: true });
  }

  // ---------- heart burst ----------
  FX.burst = (x, y, n = 10, glyphs = ['💖', '💗', '💕', '✨'], spread = 1) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + rand(-0.3, 0.3);
      const d = rand(40, 110) * spread;
      spawn(x, y, 'fx-burst', glyphs[i % glyphs.length], {
        '--dx': (Math.cos(a) * d).toFixed(0) + 'px',
        '--dy': (Math.sin(a) * d).toFixed(0) + 'px',
        '--r': rand(-60, 60).toFixed(0) + 'deg',
        '--s': rand(0.7, 1.4).toFixed(2),
      });
    }
  };

  window.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest('[data-no-burst]')) return;
    FX.burst(e.clientX, e.clientY, 7, ['💗', '💕', '✨', '💖'], 0.7);
  }, { passive: true });

  // ---------- page transitions ----------
  const curtain = doc.createElement('div');
  curtain.className = 'fx-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<span>💗</span>';
  body.appendChild(curtain);

  FX.navigate = (url) => {
    if (reduce) { window.location.href = url; return; }
    curtain.classList.add('is-active');
    setTimeout(() => { window.location.href = url; }, 650);
  };
  // script.js defines goTo(page); keep the same behaviour, just animated.
  if (typeof window.goTo === 'function') window.goTo = FX.navigate;

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) curtain.classList.remove('is-active');
  });

  // ---------- music button "playing" state ----------
  const mt = doc.getElementById('music-toggle');
  if (mt) {
    mt.setAttribute('aria-label', 'Toggle music');
    mt.setAttribute('data-no-burst', '');
    const sync = () => mt.classList.toggle('is-playing', mt.textContent.trim() === '🔊');
    new MutationObserver(sync).observe(mt, { childList: true, characterData: true, subtree: true });
    sync();
  }

  // ---------- wavy titles: <h1 data-wave> ----------
  doc.querySelectorAll('[data-wave]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    let i = 0;
    text.split(/\s+/).forEach((word, w, all) => {
      const ws = doc.createElement('span');
      ws.className = 'fx-word';
      ws.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach((ch) => {
        const c = doc.createElement('span');
        c.className = 'fx-char';
        c.textContent = ch;
        c.style.setProperty('--i', i++);
        ws.appendChild(c);
      });
      el.appendChild(ws);
      if (w < all.length - 1) el.appendChild(doc.createTextNode(' '));
    });
  });

  // ---------- scroll reveal: [data-reveal] ----------
  FX.reveal = (nodes, options) => {
    nodes = Array.from(nodes);
    if (reduce || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, Object.assign({ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }, options));
    nodes.forEach((n) => io.observe(n));
  };
  FX.reveal(doc.querySelectorAll('[data-reveal]'));

  FX.spawn = spawn;
  window.FX = FX;
})();
