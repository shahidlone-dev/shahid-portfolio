/* ═══════════════════════════════════════
   SHAHID LONE — main.js
   ═══════════════════════════════════════ */

/* ─── 1. LOADER ─── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.remove();
      document.body.classList.remove('loading');
    }, 900);
  }, 600);
});

/* ─── 2. HERO REVEAL ─── */
(function () {
  function go() {
    requestAnimationFrame(() => {
      document.querySelectorAll('#hero .fu, #hero .cr').forEach(el => el.classList.add('in'));
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', go)
    : go();
})();

/* ─── 3. SCROLL REVEAL — .fu, .cr, .sec-reveal ─── */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
  });
}, { threshold: 0.01, rootMargin: '8% 0px' });
document.querySelectorAll('.fu, .cr, .sec-reveal').forEach(el => revealIO.observe(el));

/* ─── 4. COUNTER ANIMATION ─── */
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.target, 10);
    if (!target) return;
    counterIO.unobserve(el);

    const duration = 900;
    const start    = performance.now();

    function step(now) {
      const p      = Math.min((now - start) / duration, 1);
      const eased  = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.mf-stat-num[data-target]').forEach(el => counterIO.observe(el));

/* ─── 5. ACTIVE NAV + SLIDING INDICATOR + GHOST NUMBER ─── */
const navLinksEl  = document.getElementById('nav-links');
const navInd      = document.getElementById('nav-ind');
const navLinks    = document.querySelectorAll('.n-links a[data-section]');
const ghostNum    = document.getElementById('ghost-num');
const sectionNums = { hero:'01', projects:'02', manifesto:'03', stack:'04', moments:'05', buildlog:'06', contact:'07' };

function moveInd(link) {
  if (!link) return;
  const lr = link.getBoundingClientRect();
  const pr = navLinksEl.getBoundingClientRect();
  navInd.style.left  = (lr.left - pr.left) + 'px';
  navInd.style.width = lr.width + 'px';
}

const secIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    navLinks.forEach(a => {
      const on = a.dataset.section === id;
      a.classList.toggle('active', on);
      if (on) moveInd(a);
    });
    if (sectionNums[id]) ghostNum.textContent = sectionNums[id];
  });
}, { threshold: 0.3 });
document.querySelectorAll('section[id]').forEach(s => secIO.observe(s));
setTimeout(() => moveInd(document.querySelector('.n-links a.active') || navLinks[0]), 80);

/* ─── 6. WEBGL GRAIN — resize bug fixed ─── */
(function () {
  const c  = document.getElementById('grain-canvas');
  const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
  if (!gl) { c.remove(); return; }

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, 'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}');
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, 'precision mediump float;uniform float t;uniform vec2 s;float h(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}void main(){vec2 uv=gl_FragCoord.xy/s;float g=h(uv+fract(t*.07));gl_FragColor=vec4(g*.06,g*.06,g*.06,g*.18);}');
  gl.compileShader(fs);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(ap);
  gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

  // Declared BEFORE resize so handler can reference them safely
  const ut = gl.getUniformLocation(prog, 't');
  const us = gl.getUniformLocation(prog, 's');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    c.width = innerWidth; c.height = innerHeight;
    gl.viewport(0, 0, c.width, c.height);
    gl.uniform2f(us, c.width, c.height);
  }
  resize();
  window.addEventListener('resize', resize);

  let i = 0;
  function renderGrain() {
    i++;
    gl.uniform1f(ut, i);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(renderGrain);
  }
  renderGrain();
})();

/* ─── 7. SCROLL VELOCITY DISTORTION ─── */
(function () {
  let last = scrollY, vel = 0, run = false;
  const imgs  = document.querySelectorAll('.mo img');
  const damps = Array.from(imgs).map((_, i) => 0.14 + (i % 3) * 0.035);

  function loop() {
    const cur = scrollY, raw = cur - last;
    last = cur;
    vel += (raw - vel) * 0.22;
    const clamp = Math.max(-18, Math.min(18, vel));

    imgs.forEach((img, i) => {
      img.style.setProperty('--sk', (clamp * damps[i]) + 'deg');
      img.style.setProperty('--sy', (1 + Math.abs(clamp) * 0.003) + '');
    });

    if (Math.abs(vel) < 0.05) {
      imgs.forEach(img => {
        img.style.setProperty('--sk', '0deg');
        img.style.setProperty('--sy', '1');
      });
      run = false;
      return;
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('scroll', () => { if (!run) { run = true; loop(); } }, { passive: true });
})();

/* ─── 8. CURSOR — mouse/hover devices only ─── */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dot  = document.getElementById('c-dot');
  const ring = document.getElementById('c-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function loop() {
    rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, .sk, .mo, .mag-btn, .proj-expand')) {
      dot.style.width = '14px'; dot.style.height = '14px';
      ring.style.width = '50px'; ring.style.height = '50px';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, .sk, .mo, .mag-btn, .proj-expand')) {
      dot.style.width = '6px'; dot.style.height = '6px';
      ring.style.width = '30px'; ring.style.height = '30px';
    }
  });
}

/* ─── 9. MAGNETIC BUTTONS — mouse only ─── */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.mag-btn').forEach(btn => {
    const inner = btn.querySelector('.mag-btn-inner');
    let raf;
    btn.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = btn.getBoundingClientRect();
        inner.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.28}px, ${(e.clientY - (r.top + r.height / 2)) * 0.28}px)`;
      });
    });
    btn.addEventListener('mouseleave', () => { inner.style.transform = 'translate(0,0)'; });
  });
}

/* ─── 10. SCROLL PROGRESS ─── */
const prog = document.getElementById('prog');
window.addEventListener('scroll', () => {
  prog.style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
}, { passive: true });

/* ─── 11. NAV HIDE — instant up, delayed down, skip when overlay open ─── */
let lastY = 0, navHideTimer = null;
const topNav = document.getElementById('top-nav');
window.addEventListener('scroll', () => {
  // Don't hide/show while mobile nav overlay is open
  if (document.body.classList.contains('nav-open')) return;
  const y = scrollY;
  if (y < lastY || y < 70) {
    clearTimeout(navHideTimer);
    topNav.classList.remove('nav-hidden');
  } else {
    clearTimeout(navHideTimer);
    navHideTimer = setTimeout(() => topNav.classList.add('nav-hidden'), 120);
  }
  lastY = y;
}, { passive: true });

/* ─── 12. GHOST PARALLAX — mouse only ─── */
const ghost = document.querySelector('.hero-ghost');
let gx = 0, gy = 0, gp = false;
if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    gx = (e.clientX / innerWidth  - 0.5) * 38;
    gy = (e.clientY / innerHeight - 0.5) * 38;
    if (!gp) {
      gp = true;
      requestAnimationFrame(() => {
        ghost.style.transform = `translate(${gx}px, ${gy}px)`;
        gp = false;
      });
    }
  });
}

/* ─── 13. PROJECT PREVIEW + EXPAND ─── */
const preview = document.getElementById('proj-preview');
const ppImg   = document.getElementById('pp-img');
const ppLabel = document.getElementById('pp-label');

// Hover preview — mouse-only devices only
const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (isHoverDevice && preview) {
  document.querySelectorAll('.proj-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      const src = row.dataset.preview;
      ppImg.src = src || '';
      ppImg.style.display = src ? 'block' : 'none';
      ppLabel.textContent = row.dataset.name || '';
      preview.classList.add('show');
    });
    row.addEventListener('mouseleave', () => preview.classList.remove('show'));
    row.addEventListener('mousemove', e => {
      preview.style.left = Math.min(e.clientX + 28, innerWidth  - preview.offsetWidth  - 20) + 'px';
      preview.style.top  = Math.max(20, Math.min(e.clientY - 80, innerHeight - preview.offsetHeight - 20)) + 'px';
    });
  });
}

// Expand/collapse — works on both touch and mouse
document.querySelectorAll('.proj-expand').forEach((btn, i) => {
  btn.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    const detail = document.getElementById('detail-' + i);
    const row    = btn.closest('.proj-row');
    if (!detail) return;
    const isOpen = detail.classList.contains('open');

    // Close all
    document.querySelectorAll('.proj-detail.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.proj-expand.open').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.proj-row.detail-open').forEach(r => r.classList.remove('detail-open'));

    // Open this one if it was closed
    if (!isOpen) {
      detail.classList.add('open');
      btn.classList.add('open');
      if (row) row.classList.add('detail-open');
      // On mobile, scroll the row into view after the panel opens
      if (!isHoverDevice) {
        setTimeout(() => {
          row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
      }
    }
  });
});

// Escape key closes any open detail
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.proj-detail.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.proj-expand.open').forEach(b => b.classList.remove('open'));
    document.querySelectorAll('.proj-row.detail-open').forEach(r => r.classList.remove('detail-open'));
  }
});

/* ─── 14. 3D TILT — STACK CARDS — mouse only ─── */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.sk').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top)  / r.height - 0.5) * 12;
      const ry = ((e.clientX - r.left) / r.width  - 0.5) * -12;
      card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ─── 15. MOMENTS MOUSE PARALLAX — mouse only ─── */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const moImgs = document.querySelectorAll('.mo img');
  const depths = [8, 6, 10, 7, 9, 6, 8];
  let pRaf = false, pmx = 0, pmy = 0;
  document.addEventListener('mousemove', e => {
    pmx = e.clientX; pmy = e.clientY;
    if (!pRaf) {
      pRaf = true;
      requestAnimationFrame(() => {
        moImgs.forEach((img, i) => {
          img.style.setProperty('--tx', (pmx / innerWidth  - 0.5) * depths[i] + 'px');
          img.style.setProperty('--ty', (pmy / innerHeight - 0.5) * depths[i] + 'px');
        });
        pRaf = false;
      });
    }
  });
}

/* ─── 16. CLOCK — Kashmir / IST ─── */
const ft = document.getElementById('f-time');
function tick() {
  ft.textContent = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date()) + ' SXR';
}
setInterval(tick, 1000);
tick();

/* ─── 17. FOOTER YEAR ─── */
document.getElementById('f-year').textContent = `Engineering from Kashmir · ${new Date().getFullYear()}`;

/* ─── MOBILE NAV — HAMBURGER TOGGLE ─── */
(function () {
  const toggle    = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const links     = document.querySelectorAll('.mobile-nav-link');

  if (!toggle || !mobileNav) return;

  function openNav() {
    mobileNav.classList.add('open');
    toggle.classList.add('open');
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    // Always show nav bar while overlay is open
    topNav.classList.remove('nav-hidden');
  }

  function closeNav() {
    mobileNav.classList.remove('open');
    toggle.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? closeNav() : openNav();
  });

  // Close on any link tap — small delay so smooth scroll starts first
  links.forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeNav, 80);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });
})();
