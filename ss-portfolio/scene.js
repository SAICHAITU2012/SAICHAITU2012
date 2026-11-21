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

  /* ── twilight sky + stars (cached) ──────────────────────────── */

  let skyGrad = null;
  let stars = [];

  function makeSky() {
    skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, "#060714");
    skyGrad.addColorStop(0.45, "#0a0a1c");
    skyGrad.addColorStop(0.75, "#140f26");
    skyGrad.addColorStop(1, "#1b1030");

    const count = isSmall() ? 60 : 110;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.75,
      r: Math.random() * 1.2 + 0.4,
      p: Math.random() * Math.PI * 2,
      s: 0.6 + Math.random() * 1.6,
      base: 0.2 + Math.random() * 0.45,
    }));
  }

  /* ── rising embers ──────────────────────────────────────────── */

  const EMBER_TYPES = ["cyan", "mag", "ember"];
  let embers = [];

  function spawnEmber(init) {
    const type = EMBER_TYPES[Math.floor(Math.random() * (Math.random() < 0.55 ? 1 : 3))];
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

    // sky
    ctx.fillStyle = skyGrad;
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
