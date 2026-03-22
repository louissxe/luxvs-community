'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const rand = (min, max) => Math.random() * (max - min) + min;

/* ══════════════════════════════════════════════════════════════
   INJECT KEYFRAMES & UTILITY STYLES
══════════════════════════════════════════════════════════════ */
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes blink-cursor  { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes ripple-out    { 0%{transform:scale(0);opacity:0.5} 100%{transform:scale(3.5);opacity:0} }
    @keyframes float-y       { 0%,100%{transform:translateY(0px) rotate(var(--r,0deg))} 50%{transform:translateY(-12px) rotate(var(--r2,15deg))} }
    @keyframes shimmer-move  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes slide-up-fade { 0%{opacity:0;transform:translateY(32px) scale(0.97)} 100%{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes rubber-band   {
      0%   { transform: scaleX(1) scaleY(1); }
      30%  { transform: scaleX(1.25) scaleY(0.75); }
      40%  { transform: scaleX(0.75) scaleY(1.25); }
      50%  { transform: scaleX(1.15) scaleY(0.85); }
      65%  { transform: scaleX(0.95) scaleY(1.05); }
      75%  { transform: scaleX(1.05) scaleY(0.95); }
      100% { transform: scaleX(1) scaleY(1); }
    }
    @keyframes jelly {
      0%,100%{transform:scaleX(1) scaleY(1)}
      25%{transform:scaleX(0.94) scaleY(1.06)}
      50%{transform:scaleX(1.06) scaleY(0.94)}
      75%{transform:scaleX(0.97) scaleY(1.03)}
    }
    @keyframes hero-badge-enter {
      0%  { opacity:0; transform:translateY(10px) scale(0.85); }
      60% { transform:translateY(-4px) scale(1.04); }
      100%{ opacity:1; transform:translateY(0) scale(1); }
    }

    /* section cinematic reveal */
    .section-animate {
      opacity: 0;
      transform: translateY(44px) scale(0.977);
      filter: blur(7px);
      transition:
        opacity   0.8s cubic-bezier(0.16,1,0.3,1),
        transform 0.8s cubic-bezier(0.16,1,0.3,1),
        filter    0.8s ease;
    }
    .section-animate.in-view { opacity:1; transform:none; filter:blur(0); }
    .section-animate.in-view > * { animation: slide-up-fade 0.62s cubic-bezier(0.16,1,0.3,1) both; }
    .section-animate.in-view > *:nth-child(1){animation-delay:.05s}
    .section-animate.in-view > *:nth-child(2){animation-delay:.13s}
    .section-animate.in-view > *:nth-child(3){animation-delay:.20s}
    .section-animate.in-view > *:nth-child(4){animation-delay:.27s}
    .section-animate.in-view > *:nth-child(5){animation-delay:.33s}

    /* bounce reveal */
    .bounce-reveal {
      opacity: 0;
      transform: translateY(22px) scale(0.96);
      transition:
        opacity   0.55s cubic-bezier(0.34,1.56,0.64,1),
        transform 0.55s cubic-bezier(0.34,1.56,0.64,1);
    }
    .bounce-reveal.in { opacity:1; transform:none; }

    /* scroll progress */
    #scroll-progress {
      position:fixed; top:0; left:0; height:2px; width:0%;
      background: linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.08));
      z-index:10000; pointer-events:none;
      border-radius:0 2px 2px 0;
      transition: width 0.09s linear;
    }

    /* shapes canvas */
    #shapes-canvas {
      position:fixed; inset:0;
      z-index:0; pointer-events:none;
    }

    /* pc-btn spring */
    .pc-btn {
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                  color 0.15s, border-color 0.15s,
                  background 0.15s, box-shadow 0.25s !important;
    }
    .pc-btn:hover  { transform: translateY(-3px) scale(1.05) !important; }
    .pc-btn:active { transform: scale(0.95) !important; }

    /* contact card pop */
    .contact-card {
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                  background 0.22s, border-color 0.22s, box-shadow 0.35s !important;
    }
    .contact-card:hover {
      transform: translateY(-7px) scale(1.03) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.28) !important;
    }

    /* extra pill pop */
    .extra-pill {
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                  background 0.18s, border-color 0.18s !important;
      position:relative; overflow:hidden;
    }
    .extra-pill:hover { transform: translateY(-4px) scale(1.07) !important; }

    /* team member slide */
    .team-member { transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1) !important; }
    .team-member:hover { transform: translateX(7px) !important; }

    /* tcard pop */
    .tcard {
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.3s ease, border-color 0.25s !important;
    }
    .tcard:hover { transform: translateY(-6px) scale(1.025) !important; box-shadow: 0 6px 18px rgba(0,0,0,0.22) !important; }

    /* hto-steps pop */
    .hto-steps li { transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1) !important; }
    .hto-steps li:hover { transform: scale(1.03) !important; }

    /* pricing card overflow */
    .pricing-card { overflow: hidden; }
  `;
  document.head.appendChild(s);
})();

/* ══════════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════════════════════════ */
(function () {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════
   BACKGROUND — FLOATING GEOMETRIC SHAPES
   Organic bezier-curve drift. No teleport, no jitter.
══════════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'shapes-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };

  const SHAPES = ['diamond', 'square', 'cross', 'ring', 'plus'];

  const makeShape = () => {
    const x = rand(0, W), y = rand(0, H);
    return {
      type:  SHAPES[Math.floor(rand(0, SHAPES.length))],
      ox: x, oy: y,           // home position
      x, y,
      size:  rand(5, 14),
      alpha: rand(0.04, 0.13),
      rot:   rand(0, Math.PI * 2),
      rotSpd:(rand(0.0003, 0.0011)) * (Math.random() < .5 ? 1 : -1),
      t:     rand(0, 1),
      spd:   rand(0.00018, 0.00042),
      // control point offsets (relative to home)
      c1x: rand(-110, 110), c1y: rand(-110, 110),
      c2x: rand(-110, 110), c2y: rand(-110, 110),
      // slow drift of control points
      c1xs: rand(-0.05, 0.05), c1ys: rand(-0.05, 0.05),
      c2xs: rand(-0.05, 0.05), c2ys: rand(-0.05, 0.05),
    };
  };

  let shapes = [];
  const init = () => { resize(); shapes = Array.from({ length: 36 }, makeShape); };

  /* cubic bezier scalar */
  const bez = (t, p0, p1, p2, p3) => {
    const u = 1 - t;
    return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
  };

  const updateShape = s => {
    s.t += s.spd;
    if (s.t > 1) s.t -= 1;

    // drift control points slowly
    s.c1x += s.c1xs; s.c1y += s.c1ys;
    s.c2x += s.c2xs; s.c2y += s.c2ys;
    if (Math.abs(s.c1x) > 160) s.c1xs *= -1;
    if (Math.abs(s.c1y) > 160) s.c1ys *= -1;
    if (Math.abs(s.c2x) > 160) s.c2xs *= -1;
    if (Math.abs(s.c2y) > 160) s.c2ys *= -1;

    // position on bezier loop
    s.x = bez(s.t, s.ox, s.ox + s.c1x, s.ox + s.c2x, s.ox);
    s.y = bez(s.t, s.oy, s.oy + s.c1y, s.oy + s.c2y, s.oy);

    // gentle edge nudge
    if (s.x < -30)  s.ox += 25;
    if (s.x > W+30) s.ox -= 25;
    if (s.y < -30)  s.oy += 25;
    if (s.y > H+30) s.oy -= 25;

    s.rot += s.rotSpd;
  };

  const drawShape = s => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.globalAlpha = s.alpha;
    ctx.strokeStyle = 'rgba(255,255,255,1)';
    ctx.lineWidth   = 0.9;
    ctx.beginPath();
    const z = s.size;

    if (s.type === 'diamond') {
      ctx.moveTo(0, -z); ctx.lineTo(z*.6, 0); ctx.lineTo(0, z); ctx.lineTo(-z*.6, 0); ctx.closePath(); ctx.stroke();

    } else if (s.type === 'square') {
      const h = z * .62; ctx.rect(-h, -h, h*2, h*2); ctx.stroke();

    } else if (s.type === 'cross') {
      const t = z*.22, a = z;
      ctx.moveTo(-t,-a); ctx.lineTo(t,-a); ctx.lineTo(t,-t); ctx.lineTo(a,-t);
      ctx.lineTo(a,t);   ctx.lineTo(t,t);  ctx.lineTo(t,a);  ctx.lineTo(-t,a);
      ctx.lineTo(-t,t);  ctx.lineTo(-a,t); ctx.lineTo(-a,-t);ctx.lineTo(-t,-t);
      ctx.closePath(); ctx.stroke();

    } else if (s.type === 'ring') {
      ctx.arc(0, 0, z*.75, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, z*.35, 0, Math.PI*2); ctx.stroke();

    } else if (s.type === 'plus') {
      const w = z*.28, a = z;
      ctx.moveTo(-w,-a); ctx.lineTo(w,-a); ctx.lineTo(w,-w); ctx.lineTo(a,-w);
      ctx.lineTo(a,w);   ctx.lineTo(w,w);  ctx.lineTo(w,a);  ctx.lineTo(-w,a);
      ctx.lineTo(-w,w);  ctx.lineTo(-a,w); ctx.lineTo(-a,-w);ctx.lineTo(-w,-w);
      ctx.closePath(); ctx.stroke();
    }

    ctx.restore();
  };

  let raf;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    shapes.forEach(s => { updateShape(s); drawShape(s); });
    raf = requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    document.hidden ? cancelAnimationFrame(raf) : (raf = requestAnimationFrame(draw));
  });
  init(); draw();
})();

/* ══════════════════════════════════════════════════════════════
   HERO CANVAS — subtle dot network (untouched original logic)
══════════════════════════════════════════════════════════════ */
(function () {
  const canvas = $('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.style.opacity = '0.05';
  let W, H, raf;
  const mouse = { x: -999, y: -999 };
  let pts = [];

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  const make = () => ({
    x: rand(0,W||800), y: rand(0,H||600),
    vx: (Math.random()-.5)*.25, vy: (Math.random()-.5)*.25,
    r: rand(.25,1.1), o: rand(.07,.55),
  });
  const init = () => { resize(); pts = Array.from({ length: clamp(Math.floor((W||800)/11), 50, 105) }, make); };
  const REPEL = 130, CONNECT = 100;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const ddx=p.x-mouse.x, ddy=p.y-mouse.y, d2=ddx*ddx+ddy*ddy;
      if (d2 < REPEL*REPEL) { const d=Math.sqrt(d2), f=(REPEL-d)/REPEL*.28; p.vx+=ddx/d*f; p.vy+=ddy/d*f; }
      p.vx*=.983; p.vy*=.983; p.x+=p.vx; p.y+=p.vy;
      if (p.x<-4) p.x=W+4; if (p.x>W+4) p.x=-4;
      if (p.y<-4) p.y=H+4; if (p.y>H+4) p.y=-4;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${p.o})`; ctx.fill();
      for (let j=i+1; j<pts.length; j++) {
        const q=pts[j], ex=p.x-q.x, ey=p.y-q.y, ed=Math.sqrt(ex*ex+ey*ey);
        if (ed<CONNECT) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle=`rgba(255,255,255,${(1-ed/CONNECT)*.08})`; ctx.lineWidth=.5; ctx.stroke(); }
      }
    }
    raf = requestAnimationFrame(draw);
  };
  window.addEventListener('mousemove', e=>{ mouse.x=e.clientX; mouse.y=e.clientY; }, {passive:true});
  window.addEventListener('resize', resize, {passive:true});
  document.addEventListener('visibilitychange', ()=>{ document.hidden ? cancelAnimationFrame(raf) : (raf=requestAnimationFrame(draw)); });
  init(); draw();
})();

/* ══════════════════════════════════════════════════════════════
   CLICK BURST — tiny shapes scatter from click point
══════════════════════════════════════════════════════════════ */
(function () {
  const symbols = ['◆', '▪', '◇', '+', '▸'];
  document.addEventListener('click', e => {
    for (let i = 0; i < 6; i++) {
      const el    = document.createElement('span');
      const angle = (i / 6) * Math.PI * 2;
      const dist  = rand(30, 68);
      const dx    = Math.cos(angle) * dist;
      const dy    = Math.sin(angle) * dist - rand(5, 28);
      const dur   = rand(460, 680);
      el.textContent = symbols[Math.floor(rand(0, symbols.length))];
      Object.assign(el.style, {
        position:'fixed', left:e.clientX+'px', top:e.clientY+'px',
        fontSize: rand(7,13)+'px',
        color:`rgba(255,255,255,${rand(0.3,0.65)})`,
        pointerEvents:'none', zIndex:'9999', userSelect:'none',
        transform:'translate(-50%,-50%)',
        transition:`transform ${dur}ms cubic-bezier(0.16,1,0.3,1), opacity ${dur}ms ease`,
      });
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`;
        el.style.opacity   = '0';
      });
      setTimeout(() => el.remove(), dur + 50);
    }
  });
})();

/* ══════════════════════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════════════════════ */
(function () {
  const el = $('#loading');
  if (!el) return;
  const hide = () => {
    el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1)';
    el.style.opacity = '0';
    setTimeout(() => { el.style.visibility='hidden'; el.style.pointerEvents='none'; }, 750);
  };
  document.readyState === 'complete' ? setTimeout(hide, 300) : window.addEventListener('load', () => setTimeout(hide, 300));
})();

/* ══════════════════════════════════════════════════════════════
   HERO ENTRANCE
══════════════════════════════════════════════════════════════ */
(function () {
  const items = [
    $('.hero-eyebrow'), $('.hero-copy h1'), $('.hero-sub'),
    $('.hero-actions'), $('.hero-stats'), $('.hero-visual'),
  ].filter(Boolean);
  items.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(30px) scale(0.97)';
    el.style.transition = 'opacity 0.78s cubic-bezier(0.34,1.45,0.64,1), transform 0.78s cubic-bezier(0.34,1.45,0.64,1)';
  });
  items.forEach((el, i) => setTimeout(() => { el.style.opacity='1'; el.style.transform='none'; }, 500 + i*115));
})();

/* ══════════════════════════════════════════════════════════════
   HERO BADGES BOUNCE-IN
══════════════════════════════════════════════════════════════ */
(function () {
  $$('.hero-badge-float').forEach((b, i) => {
    b.style.opacity = '0';
    setTimeout(() => {
      b.style.animation = `hero-badge-enter 0.7s cubic-bezier(0.34,1.45,0.64,1) forwards, float-y ${6.5+i*1.5}s ease-in-out infinite ${0.8+i*0.8}s`;
    }, 1000 + i * 220);
  });
})();

/* ══════════════════════════════════════════════════════════════
   HEADER SCROLL
══════════════════════════════════════════════════════════════ */
(function () {
  const h = $('#header'); if (!h) return;
  let t = false;
  window.addEventListener('scroll', () => {
    if (t) return;
    requestAnimationFrame(() => { h.classList.toggle('scrolled', window.scrollY > 36); t=false; });
    t = true;
  }, {passive:true});
})();

/* ══════════════════════════════════════════════════════════════
   ACTIVE NAV LINK
══════════════════════════════════════════════════════════════ */
(function () {
  const links = $$('.nav-link');
  const secs  = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if (!secs.length) return;
  secs.forEach(s => new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin:'-40% 0px -55% 0px' }).observe(s));
})();

/* ══════════════════════════════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════════════════════════════ */
(function () {
  const toggle = $('#menuToggle'), nav = $('#navLinks');
  if (!toggle || !nav) return;
  let open = false;
  const set = s => { open=s; nav.classList.toggle('open',open); toggle.classList.toggle('open',open); toggle.setAttribute('aria-expanded',open); };
  toggle.addEventListener('click', () => set(!open));
  $$('a', nav).forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('click', e => { if (open && !$('#header').contains(e.target)) set(false); });
})();

/* ══════════════════════════════════════════════════════════════
   SMOOTH SCROLL
══════════════════════════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 64, behavior:'smooth' });
  });
});

/* ══════════════════════════════════════════════════════════════
   CINEMATIC SECTION REVEAL
══════════════════════════════════════════════════════════════ */
(function () {
  const sections = $$('section');
  sections.forEach(s => s.classList.add('section-animate'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
      } else {
        e.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.06, rootMargin:'0px 0px -40px 0px' });
  sections.forEach(s => obs.observe(s));
})();

/* ══════════════════════════════════════════════════════════════
   BOUNCE REVEAL
══════════════════════════════════════════════════════════════ */
(function () {
  const targets = $$(
    '.pricing-card, .sc-card, .extra-pill, .team-member, ' +
    '.contact-card, .hto-steps li, .tcard, .about-left p, ' +
    '.about-badges span, .section-label, .hero-stats .stat'
  );
  targets.forEach(el => el.classList.add('bounce-reveal'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement
          ? $$(':scope > *', entry.target.parentElement).filter(el => targets.includes(el)) : [];
        const delay = clamp(siblings.indexOf(entry.target) * 70, 0, 420);
        setTimeout(() => entry.target.classList.add('in'), delay);
      } else {
        entry.target.classList.remove('in');
      }
    });
  }, { rootMargin:'0px 0px -40px 0px', threshold:0.06 });
  targets.forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════════════════════════════════
   STAT COUNT-UP + SPRING POP
══════════════════════════════════════════════════════════════ */
(function () {
  const easeOut = t => 1 - Math.pow(1-t, 3);
  $$('.stat-num').forEach(el => {
    const original = el.textContent.trim();
    const numMatch = original.match(/[\d,]+/); if (!numMatch) return;
    const target = parseInt(numMatch[0].replace(/,/g,''), 10);
    const suffix = original.replace(/[\d,]/g,'');
    const animate = () => {
      const dur=1100, start=performance.now();
      const tick = now => {
        const p = clamp((now-start)/dur, 0, 1);
        el.textContent = Math.round(easeOut(p)*target).toLocaleString()+suffix;
        if (p < 1) requestAnimationFrame(tick);
        else {
          el.textContent = original;
          el.animate([
            {transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(0.95)'},{transform:'scale(1)'}
          ], {duration:420, easing:'cubic-bezier(0.34,1.56,0.64,1)'});
        }
      };
      requestAnimationFrame(tick);
    };
    new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animate();
      });
    }, {threshold:0.6}).observe(el);
  });
})();

/* ══════════════════════════════════════════════════════════════
   REVIEWS MARQUEE — pause on hover
══════════════════════════════════════════════════════════════ */
(function () {
  $$('.reviews-row').forEach(row => {
    row.addEventListener('mouseenter', () => { row.style.animationPlayState = 'paused'; });
    row.addEventListener('mouseleave', () => { row.style.animationPlayState = 'running'; });
  });
})();

/* ══════════════════════════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════════════════════════ */
(function () {
  const btn = $('#backToTop'); if (!btn) return;
  let t = false;
  window.addEventListener('scroll', () => {
    if (t) return;
    requestAnimationFrame(()=>{btn.classList.toggle('visible',window.scrollY>420);t=false;});
    t=true;
  }, {passive:true});
  btn.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
})();

/* ══════════════════════════════════════════════════════════════
   BUTTON MAGNETIC + RUBBER-BAND CLICK
══════════════════════════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  $$('.btn, .slider-arrow, .back-to-top, .pc-btn, .nav-cta').forEach(btn => {
    let b;
    btn.addEventListener('mouseenter', ()=>{ b=btn.getBoundingClientRect(); });
    btn.addEventListener('mousemove', e=>{
      if (!b) return;
      const dx=(e.clientX-(b.left+b.width/2))/b.width*9;
      const dy=(e.clientY-(b.top+b.height/2))/b.height*9;
      btn.style.transform=`translate(${dx}px,${dy-2}px)`;
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform=''; b=null; });
    btn.addEventListener('click', ()=>{
      btn.style.animation='rubber-band 0.5s ease';
      btn.addEventListener('animationend',()=>btn.style.animation='',{once:true});
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   PRICING CARD SPOTLIGHT
══════════════════════════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  $$('.pricing-card').forEach(card => {
    card.addEventListener('mousemove', e=>{
      const r=card.getBoundingClientRect();
      card.style.backgroundImage=`radial-gradient(220px circle at ${e.clientX-r.left}px ${e.clientY-r.top}px,rgba(255,255,255,0.046) 0%,transparent 70%)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.backgroundImage=''; });
  });
})();

/* ══════════════════════════════════════════════════════════════
   SC-CARD 3D TILT
══════════════════════════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  $$('.sc-card').forEach(card=>{
    let b;
    card.addEventListener('mouseenter',()=>{ b=card.getBoundingClientRect(); card.style.transition='transform 0.12s ease,border-color 0.25s,box-shadow 0.35s'; });
    card.addEventListener('mousemove',e=>{
      if (!b) return;
      const rx=((e.clientY-b.top)/b.height-.5)*-7;
      const ry=((e.clientX-b.left)/b.width-.5)*7;
      card.style.transform=`translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.015)`;
    });
    card.addEventListener('mouseleave',()=>{ card.style.transition='transform 0.55s cubic-bezier(0.34,1.45,0.64,1),border-color 0.25s,box-shadow 0.35s'; card.style.transform=''; b=null; });
  });
})();

/* ══════════════════════════════════════════════════════════════
   CONTACT CARD ICON COLOR
══════════════════════════════════════════════════════════════ */
(function () {
  const colorMap={'fa-discord':'#5865F2','fa-tiktok':'#ff0050','fa-instagram':'#E1306C'};
  $$('.contact-card').forEach(card=>{
    const icon=card.querySelector('.cc-icon i'); if (!icon) return;
    const cls=Object.keys(colorMap).find(c=>icon.classList.contains(c)); if (!cls) return;
    card.addEventListener('mouseenter',()=>{ icon.style.transition='color 0.25s ease,transform 0.3s cubic-bezier(0.34,1.56,0.64,1)'; icon.style.color=colorMap[cls]; icon.style.transform='scale(1.2) rotate(-8deg)'; });
    card.addEventListener('mouseleave',()=>{ icon.style.color=''; icon.style.transform=''; });
  });
})();

/* ══════════════════════════════════════════════════════════════
   SECTION TITLE UNDERLINE WIPE
══════════════════════════════════════════════════════════════ */
(function () {
  $$('.section-title em.gradient-text').forEach(el=>{
    el.style.position='relative';
    const line=document.createElement('span');
    line.style.cssText=`position:absolute;left:0;bottom:-3px;height:1.5px;width:0;background:linear-gradient(90deg,#fff,#666);border-radius:1px;transition:width 0.75s cubic-bezier(0.16,1,0.3,1);pointer-events:none;`;
    el.appendChild(line);
    new IntersectionObserver((entries,obs)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ setTimeout(()=>line.style.width='100%',250); obs.disconnect(); }});
    },{threshold:0.5}).observe(el);
  });
})();

/* ══════════════════════════════════════════════════════════════
   HERO CODE CARD — LINE REVEAL + BLINK CURSOR
══════════════════════════════════════════════════════════════ */
(function () {
  const body=$('.hcard-body'); if (!body) return;
  const lines=$$('p',body);
  lines.forEach(p=>{ p.style.opacity='0'; p.style.transform='translateX(-8px)'; p.style.transition='opacity 0.38s ease,transform 0.38s cubic-bezier(0.16,1,0.3,1)'; });
  const cursor=document.createElement('span');
  cursor.style.cssText=`display:inline-block;width:7px;height:13px;background:rgba(195,232,141,0.9);border-radius:1px;margin-left:3px;vertical-align:middle;animation:blink-cursor 1.1s step-end infinite;`;
  new IntersectionObserver((entries,obs)=>{
    entries.forEach(e=>{
      if (!e.isIntersecting) return;
      lines.forEach((p,i)=>setTimeout(()=>{ p.style.opacity='1'; p.style.transform='none'; if(i===lines.length-1)p.appendChild(cursor); },550+i*95));
      obs.disconnect();
    });
  },{threshold:0.3}).observe(body);
})();

/* ══════════════════════════════════════════════════════════════
   TEAM MEMBER AVATAR RIPPLE
══════════════════════════════════════════════════════════════ */
(function () {
  $$('.team-member').forEach(member=>{
    const avatar=member.querySelector('.tm-avatar'); if (!avatar) return;
    avatar.style.position='relative';
    const ripple=document.createElement('span');
    ripple.style.cssText=`position:absolute;inset:-6px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.15);opacity:0;pointer-events:none;`;
    avatar.appendChild(ripple);
    member.addEventListener('mouseenter',()=>{ ripple.style.animation='ripple-out 0.72s ease forwards'; });
    member.addEventListener('mouseleave',()=>{ ripple.style.animation=''; });
  });
})();

/* ══════════════════════════════════════════════════════════════
   FOOTER SOCIAL BOUNCE
══════════════════════════════════════════════════════════════ */
(function () {
  $$('.footer-socials a').forEach(a=>{
    a.addEventListener('mouseenter',()=>{
      a.animate([
        {transform:'translateY(0) scale(1)'},{transform:'translateY(-7px) scale(1.2)'},
        {transform:'translateY(-3px) scale(1.05)'},{transform:'translateY(-5px) scale(1.12)'},{transform:'translateY(0) scale(1)'}
      ],{duration:520,easing:'ease',fill:'forwards'});
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   EXTRA PILL SHIMMER
══════════════════════════════════════════════════════════════ */
(function () {
  $$('.extra-pill').forEach(pill=>{
    const shimmer=document.createElement('span');
    shimmer.style.cssText=`position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.09) 50%,transparent 70%);background-size:200% 100%;opacity:0;pointer-events:none;border-radius:inherit;`;
    pill.appendChild(shimmer);
    pill.addEventListener('mouseenter',()=>{ shimmer.style.opacity='1'; shimmer.style.animation='shimmer-move 0.65s ease forwards'; });
    pill.addEventListener('mouseleave',()=>{ shimmer.style.opacity='0'; shimmer.style.animation=''; });
  });
})();

/* ══════════════════════════════════════════════════════════════
   NAV LINK CLICK RIPPLE
══════════════════════════════════════════════════════════════ */
(function () {
  $$('.nav-link').forEach(link=>{
    link.style.overflow='hidden';
    link.addEventListener('click',e=>{
      const r=link.getBoundingClientRect();
      const dot=document.createElement('span');
      Object.assign(dot.style,{position:'absolute',width:'6px',height:'6px',borderRadius:'50%',background:'rgba(255,255,255,0.3)',left:(e.clientX-r.left-3)+'px',top:(e.clientY-r.top-3)+'px',transform:'scale(0)',animation:'ripple-out 0.55s ease forwards',pointerEvents:'none'});
      link.appendChild(dot);
      setTimeout(()=>dot.remove(),600);
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   MARQUEE PAUSE ON HOVER
══════════════════════════════════════════════════════════════ */
(function () {
  const track=$('.marquee-track'), strip=$('.marquee-strip');
  if (!track) return;
  strip?.addEventListener('mouseenter',()=>{ track.style.animationPlayState='paused'; });
  strip?.addEventListener('mouseleave',()=>{ track.style.animationPlayState='running'; });
})();

/* ══════════════════════════════════════════════════════════════
   LOGO JELLY CLICK
══════════════════════════════════════════════════════════════ */
(function () {
  const logo=$('.logo'); if (!logo) return;
  logo.addEventListener('click',()=>{
    logo.style.animation='jelly 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    logo.addEventListener('animationend',()=>logo.style.animation='',{once:true});
  });
})();