/* ═══════════════════════════════════════════════════════════════
   S. SADHASRI — SHADOW ARC v7.0
   scene.js — elemental FX engine (2D canvas, zero deps)
   twilight sky · stars · rising embers · energy streaks ·
   cursor trail · click shockwaves
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const canvas = document.getElementById("fx");
  if (!canvas) return;

  const PARAMS = new URLSearchParams(location.search);
  const STATIC =
    PARAMS.has("static") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1;

  const MOBILE = window.innerWidth < 720;
  const isSmall = () => window.innerWidth < 720;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    makeSky();
  }

  /* ── pre-rendered sprites ───────────────────────────────────── */

  function makeGlow(r, g, b) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    const grad = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.35, `rgba(${r},${g},${b},0.55)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = grad;
    x.fillRect(0, 0, 64, 64);
    return c;
  }
  const SPR = {
    cyan: makeGlow(125, 232, 249),
    mag: makeGlow(232, 121, 249),
    ember: makeGlow(255, 150, 90),
    white: makeGlow(255, 255, 255),
  };

  /* ── multiverse: per-section atmospheres, interpolated by scroll ── */

  const THEMES = {
    hero:      { top: [6, 7, 20],    mid: [10, 10, 28],   bot: [27, 16, 48],  w: [0.62, 0.2, 0.18] },
    file:      { top: [9, 6, 24],    mid: [16, 10, 38],   bot: [30, 14, 62],  w: [0.3, 0.62, 0.08] },
    missions:  { top: [16, 7, 16],   mid: [26, 11, 24],   bot: [48, 18, 30],  w: [0.18, 0.14, 0.68] },
    techniques:{ top: [5, 12, 22],   mid: [8, 20, 38],    bot: [12, 30, 56],  w: [0.72, 0.14, 0.14] },
    summon:    { top: [10, 6, 26],   mid: [20, 12, 52],   bot: [36, 20, 80],  w: [0.4, 0.45, 0.15] },
  };
  const THEME_ORDER = ["hero", "file", "missions", "techniques", "summon"];
  let sectionMarks = [];

  function makeSky() {
    const count = isSmall() ? 60 : 110;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.75,
      r: Math.random() * 1.2 + 0.4,
      p: Math.random() * Math.PI * 2,
      s: 0.6 + Math.random() * 1.6,
      base: 0.2 + Math.random() * 0.45,
    }));
    computeMarks();
  }

  function computeMarks() {
    sectionMarks = THEME_ORDER.map((id) => {
      const el = document.getElementById(id);
      if (!el) return { y: 0 };
      const r = el.getBoundingClientRect();
      return { y: r.top + window.scrollY + r.height * 0.45 };
    });
  }

  const lerp = (a, b, f) => a + (b - a) * f;
  const lerp3 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];

  function currentTheme() {
    const pos = window.scrollY + H * 0.42;
    for (let i = 0; i < sectionMarks.length - 1; i++) {
      if (pos >= sectionMarks[i].y && pos < sectionMarks[i + 1].y) {
        const f = Math.min(1, Math.max(0, (pos - sectionMarks[i].y) / (sectionMarks[i + 1].y - sectionMarks[i].y)));
        const a = THEMES[THEME_ORDER[i]], b = THEMES[THEME_ORDER[i + 1]];
        const e = f * f * (3 - 2 * f); // smoothstep
        return {
          top: lerp3(a.top, b.top, e), mid: lerp3(a.mid, b.mid, e), bot: lerp3(a.bot, b.bot, e),
          w: lerp3(a.w, b.w, e), i, e,
        };
      }
    }
    return { top: THEMES.hero.top, mid: THEMES.hero.mid, bot: THEMES.hero.bot, w: THEMES.hero.w, i: 0, e: 0 };
  }

  function skyGradient(th) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgb(${th.top.map(Math.round).join(",")})`);
    g.addColorStop(0.45, `rgb(${th.mid.map(Math.round).join(",")})`);
    g.addColorStop(1, `rgb(${th.bot.map(Math.round).join(",")})`);
    return g;
  }

  /* ── rising embers ──────────────────────────────────────────── */

  const EMBER_TYPES = ["cyan", "mag", "ember"];
  let embers = [];

  let emberWeights = THEMES.hero.w;
  function spawnEmber(init, x, y, fast) {
    const roll = Math.random();
    let type = "cyan";
    if (roll < emberWeights[0]) type = "cyan";
    else if (roll < emberWeights[0] + emberWeights[1]) type = "mag";
    else type = "ember";
    if (x !== undefined) {
      return {
        x: x + (Math.random() - 0.5) * 90,
        y: (y !== undefined ? y : H) + 8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.5 + Math.random() * (fast ? 1.1 : 0.5)),
        size: 2 + Math.random() * 3.6,
        life: 1,
        decay: fast ? 0.006 + Math.random() * 0.006 : 0.0014 + Math.random() * 0.0024,
        swayP: Math.random() * Math.PI * 2,
        swayS: 0.7 + Math.random() * 1.3,
        type,
      };
    }
    return {
      x: Math.random() * W,
      y: init ? Math.random() * H : H + 12,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.28 + Math.random() * 0.5),
      size: 2.2 + Math.random() * 4.2,
      life: 1,
      decay: 0.0012 + Math.random() * 0.0022,
      swayP: Math.random() * Math.PI * 2,
      swayS: 0.7 + Math.random() * 1.3,
      type,
    };
  }

  function seedEmbers() {
    const n = isSmall() ? 20 : 40;
    embers = Array.from({ length: n }, () => spawnEmber(true));
  }

  /* ── energy streaks ─────────────────────────────────────────── */

  let streak = null;
  let streakTimer = 3;

  function spawnStreak() {
    const fromLeft = Math.random() < 0.5;
    streak = {
      x: fromLeft ? -60 : W + 60,
      y: 40 + Math.random() * H * 0.35,
      vx: (fromLeft ? 1 : -1) * (9 + Math.random() * 5),
      vy: 2.6 + Math.random() * 2.4,
      life: 1,
      hue: Math.random() < 0.5 ? "cyan" : "mag",
    };
  }

  /* ── cursor trail + shockwaves ──────────────────────────────── */

  let trail = [];
  let waves = [];
  const sparks = [];

  window.addEventListener(
    "mousemove",
    (e) => {
      if (STATIC) return;
      trail.push({ x: e.clientX, y: e.clientY, life: 1, size: 3 + Math.random() * 3 });
      if (trail.length > 42) trail.shift();
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerdown",
    (e) => {
      if (e.target.closest("#site-nav, .cmdk-overlay, a, button")) return;
      waves.push({ x: e.clientX, y: e.clientY, r: 4, life: 1 });
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
        sparks.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(a) * (2.4 + Math.random() * 2),
          vy: Math.sin(a) * (2.4 + Math.random() * 2),
          life: 1,
          hue: Math.random() < 0.6 ? "cyan" : "mag",
        });
      }
    },
    { passive: true }
  );

  /* ── main loop ──────────────────────────────────────────────── */

  const clock = { last: 0 };
  let frame = 0;

  function tick(now) {
    const dt = Math.min(0.05, (now - clock.last) / 1000 || 0.016);
    clock.last = now;
    const t = now / 1000;

    // sky — multiverse atmosphere
    const th = currentTheme();
    emberWeights = th.w;
    ctx.fillStyle = skyGradient(th);
    ctx.fillRect(0, 0, W, H);

    // stars
    for (const s of stars) {
      ctx.globalAlpha = s.base + Math.sin(t * s.s + s.p) * 0.18;
      ctx.fillStyle = "#cdd8f0";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // energy streak
    streakTimer -= dt;
    if (streakTimer <= 0 && !streak) { spawnStreak(); streakTimer = 6 + Math.random() * 4; }
    if (streak) {
      streak.x += streak.vx;
      streak.y += streak.vy;
      streak.life -= dt * 1.1;
      const spr = SPR[streak.hue === "cyan" ? "cyan" : "mag"];
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(streak.life, 0);
      const tail = 90;
      const grad = ctx.createLinearGradient(streak.x, streak.y, streak.x - streak.vx * (tail / 12), streak.y - streak.vy * (tail / 12));
      grad.addColorStop(0, streak.hue === "cyan" ? "rgba(190,240,252,0.95)" : "rgba(240,190,252,0.95)");
      grad.addColorStop(1, "rgba(190,240,252,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(streak.x - streak.vx * (tail / 12), streak.y - streak.vy * (tail / 12));
      ctx.stroke();
      ctx.drawImage(spr, streak.x - 10, streak.y - 10, 20, 20);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (streak.life <= 0 || streak.x < -100 || streak.x > W + 100) streak = null;
    }

    // embers
    ctx.globalCompositeOperation = "lighter";
    for (let i = embers.length - 1; i >= 0; i--) {
      const p = embers[i];
      p.swayP += p.swayS * dt;
      p.x += p.vx + Math.sin(p.swayP) * 0.35;
      p.y += p.vy;
      p.life -= p.decay;
      const flicker = 0.55 + Math.sin(t * 6 + p.swayP) * 0.25;
      ctx.globalAlpha = Math.max(0, p.life * flicker * 0.85);
      const d = p.size * 2.2;
      ctx.drawImage(SPR[p.type], p.x - d / 2, p.y - d / 2, d, d);
      if (p.life <= 0 || p.y < -20) embers[i] = spawnEmber(false);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // cursor trail
    ctx.globalCompositeOperation = "lighter";
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      p.life -= dt * 1.8;
      if (p.life <= 0) { trail.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.5;
      const d = p.size * 2.4 * p.life;
      ctx.drawImage(SPR.cyan, p.x - d / 2, p.y - d / 2, d, d);
    }

    // shockwaves
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.r += dt * 320;
      w.life -= dt * 1.7;
      if (w.life <= 0) { waves.splice(i, 1); continue; }
      ctx.globalAlpha = w.life * 0.6;
      ctx.strokeStyle = "rgba(103, 232, 249, 1)";
      ctx.lineWidth = 2 * w.life + 0.5;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(232, 121, 249, 1)";
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += dt * 4;
      s.life -= dt * 1.6;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = s.life;
      const d = 10 * s.life + 4;
      ctx.drawImage(SPR[s.hue], s.x - d / 2, s.y - d / 2, d, d);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    renderer_frame = frame;
    frame++;

    if (STATIC) {
      if (frame < 90) requestAnimationFrame(tick); // settle then freeze (2D canvas keeps bitmap)
      return;
    }
    requestAnimationFrame(tick);
  }

  let renderer_frame = 0;

  // cursed-energy aura when hovering mission cards
  window.__fx = {
    aura(x, y) {
      for (let i = 0; i < 7; i++) embers.push(spawnEmber(false, x, y, true));
    },
  };
  document.querySelectorAll(".mission-card").forEach((card) => {
    card.addEventListener("pointerenter", () => {
      const r = card.getBoundingClientRect();
      window.__fx.aura(r.left + Math.random() * r.width, r.top + window.scrollY + 6);
    });
  });

  window.addEventListener("resize", () => {
    resize();
    seedEmbers();
  });
  document.addEventListener("visibilitychange", () => {
    if (!STATIC) clock.last = performance.now();
  });

  resize();
  seedEmbers();
  requestAnimationFrame(tick);
})();
