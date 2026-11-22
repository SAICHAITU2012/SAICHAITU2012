/* ═══════════════════════════════════════════════════════════════════════
   THE LANTERN SEA — app.js
   boot · typed roles · figures · station tracking · berth dossiers ·
   ⌘K course plotter · lantern highlighting · QA hooks
   Vanilla JS, no dependencies.
   ═══════════════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const PARAMS = new URLSearchParams(location.search);
  const REDUCED =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    PARAMS.has("static");
  const INTRO_SKIPPED = REDUCED || PARAMS.has("at");
  // world.js flags no-WebGL during its own execution, so decide after all
  // scripts have settled (DOMContentLoaded) — otherwise the class races.
  if (!INTRO_SKIPPED) {
    const addPending = () => {
      if (!window.__noWorld) document.documentElement.classList.add("intro-pending");
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addPending, { once: true });
    } else {
      addPending();
    }
  }

  // safety net: if world.js never arrives at all (404, blocked request),
  // nothing would ever clear intro-pending — a visitor would be left on a
  // black page. world.js decides synchronously (either __world or __noWorld
  // exists by DOMContentLoaded), so a beat later we can tell for sure and
  // run the same cleanup its no-world path does.
  const armWorldNet = () => window.setTimeout(() => {
    if (window.__world || window.__noWorld) return;
    window.__noWorld = true;
    document.documentElement.classList.remove("intro-pending");
    document.documentElement.classList.add("intro-done", "no-world");
  }, 900);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", armWorldNet, { once: true });
  } else {
    armWorldNet();
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const scrollBehavior = () => (REDUCED ? "auto" : "smooth");

  // hoisted: boot can end before section 3 is parsed (TDZ guard)
  let figuresDone = false;

  /* ── 1 · boot ───────────────────────────────────────────────────── */

  const boot = $("#boot");
  const bootLine = $("#boot-line");
  const bootFill = $(".boot-bar i", boot);

  const BOOT_LINES = [
    "lighting the lanterns",
    "charting the water",
    "waking the beacon",
    "raising the fleet",
    "opening the gate",
  ];

  /* ── the lantern emerges from darkness (boot visual) ─────────────
     2D canvas: warm glow → hanging lantern → light pool → embers.
     Light on purpose: the world behind the overlay is still loading. */
  const bootFx = document.getElementById("boot-fx");
  let bootFxRaf = null;
  const bootEmbers = Array.from({ length: 6 }, () => ({
    x: 170 + (Math.random() - 0.5) * 60, y: 200 + Math.random() * 30,
    sp: 0.4 + Math.random() * 0.5, s: 2 + Math.random() * 2.5, p: Math.random() * 500,
  }));
  const bootEmberSpr = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 32;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255, 214, 150, 1)");
    g.addColorStop(1, "rgba(255, 214, 150, 0)");
    x.fillStyle = g; x.fillRect(0, 0, 32, 32);
    return c;
  })();

  function drawLantern(now, final) {
    const bx = bootFx.getContext("2d");
    const S = 340;
    if (drawLantern.t0 === undefined) drawLantern.t0 = now;
    const raw = final ? 1 : Math.min(1, (now - drawLantern.t0) / 1900);
    const e = 1 - Math.pow(1 - raw, 3);
    bx.clearRect(0, 0, S, S);

    const cx = S / 2, lampY = 118;

    bx.strokeStyle = "rgba(243, 182, 115, 0.35)";
    bx.lineWidth = 1;
    bx.beginPath();
    bx.moveTo(cx, 18);
    bx.lineTo(cx, lampY - 32);
    bx.stroke();

    const glowR = 30 + 80 * e;
    const gr = bx.createRadialGradient(cx, lampY, 4, cx, lampY, glowR);
    gr.addColorStop(0, "rgba(255, 217, 163, " + (0.85 * e).toFixed(3) + ")");
    gr.addColorStop(0.4, "rgba(243, 182, 115, " + (0.32 * e).toFixed(3) + ")");
    gr.addColorStop(1, "rgba(243, 182, 115, 0)");
    bx.fillStyle = gr;
    bx.beginPath();
    bx.arc(cx, lampY, glowR, 0, Math.PI * 2);
    bx.fill();

    bx.fillStyle = "rgba(20, 16, 12, " + e.toFixed(3) + ")";
    bx.beginPath();
    bx.moveTo(cx - 13, lampY - 26);
    bx.lineTo(cx + 13, lampY - 26);
    bx.lineTo(cx + 9, lampY - 32);
    bx.lineTo(cx - 9, lampY - 32);
    bx.closePath();
    bx.fill();
    const glass = bx.createLinearGradient(cx - 11, lampY - 22, cx + 11, lampY + 22);
    glass.addColorStop(0, "rgba(243, 182, 115, " + (0.9 * e).toFixed(3) + ")");
    glass.addColorStop(1, "rgba(232, 138, 78, " + (0.75 * e).toFixed(3) + ")");
    bx.fillStyle = glass;
    bx.beginPath();
    bx.roundRect(cx - 11, lampY - 22, 22, 44, 6);
    bx.fill();
    bx.fillStyle = "rgba(255, 240, 210, " + e.toFixed(3) + ")";
    bx.beginPath();
    bx.arc(cx, lampY, 5.5 * (0.7 + 0.3 * Math.sin(now / 300)), 0, Math.PI * 2);
    bx.fill();

    bx.fillStyle = "rgba(255, 205, 130, " + (0.14 * e).toFixed(3) + ")";
    bx.beginPath();
    bx.ellipse(cx, lampY + 78, 60 * e, 10 * e, 0, 0, Math.PI * 2);
    bx.fill();

    for (const em of bootEmbers) {
      em.y -= em.sp;
      em.x += Math.sin((now + em.p) / 500) * 0.3;
      if (em.y < lampY - 90) { em.y = lampY + 40; em.x = cx + (Math.random() - 0.5) * 60; }
      bx.globalAlpha = 0.5 * e;
      bx.drawImage(bootEmberSpr, em.x - em.s, em.y - em.s, em.s * 2, em.s * 2);
    }
    bx.globalAlpha = 1;
  }

  function startBootFx() {
    if (!bootFx || bootFxRaf) return;
    if (REDUCED) { drawLantern(performance.now(), true); return; }
    bootFxRaf = requestAnimationFrame(function loop(now) {
      drawLantern(now, false);
      if (!boot.classList.contains("done")) bootFxRaf = requestAnimationFrame(loop);
    });
  }
  startBootFx();

  function endBoot() {
    if (bootFxRaf) cancelAnimationFrame(bootFxRaf);
    if (!boot || boot.classList.contains("done")) return;
    boot.classList.add("done");
    window.dispatchEvent(new Event("lantern:begin")); // world.js: start the descent
    window.setTimeout(() => boot.remove(), 620);
    startFigures();
  }

  if (!boot || REDUCED) {
    if (boot) boot.remove();
    window.dispatchEvent(new Event("lantern:begin"));
    startFigures();
  } else {
    // staged crossing: each line crossfades in as the bar breathes forward
    BOOT_LINES.forEach((line, i) => {
      window.setTimeout(() => {
        bootFill.style.width = `${((i + 1) / BOOT_LINES.length) * 100}%`;
        if (bootLine.textContent === line) return; // first stage: already showing
        bootLine.style.opacity = "0";
        window.setTimeout(() => {
          bootLine.textContent = line;
          bootLine.style.opacity = "1";
        }, 160);
      }, 240 + i * 420);
    });
    window.setTimeout(endBoot, 240 + BOOT_LINES.length * 420 + 140);
    boot.addEventListener("click", endBoot, { once: true });
    // any other interaction = "let me in" — skip straight to the descent
    ["pointerdown", "wheel", "touchstart", "keydown"].forEach((ev) =>
      boot.addEventListener(ev, (e) => {
        if (ev === "keydown" && (e.metaKey || e.ctrlKey)) return; // ⌘K stays with the palette
        endBoot();
      }, { passive: true }));
  }

  /* ── 1b · ambient audio — curated score over a procedural sea bed ────
     Track: "Floating Cities" — Kevin MacLeod (incompetech.com),
     CC-BY 4.0 (details in assets/CREDITS.md). The file ships with a
     baked 5 s tail→head crossfade, so Web Audio's loop=true is
     sample-accurate and gapless — no JS bridging, no restarts, no gaps.
     The buffer is fetched and decoded once, then never re-loaded. The
     procedural waves stay as a quiet bed under the piano; if the track
     can't be fetched or decoded, the experience degrades gracefully to
     the procedural ambience (waves + pad + chimes). Every fade runs on
     the audio clock — playback is fully independent of the render loop
     and of frame-rate fluctuations. */
  const soundBtn = $("#sound-toggle");
  const SOUND_KEY = "lantern-sound";
  const Ambient = (() => {
    const TRACK_URL = "assets/audio/lantern-sea-loop.mp3";
    const CHORDS = [
      [110.0, 164.81, 261.63], // A2 E3 C4 — the home tide
      [98.0, 146.83, 220.0],   // G2 D3 A3
      [130.81, 196.0, 329.63], // C3 G3 E4
      [164.81, 246.94, 329.63],// E3 B3 E4
    ];
    const CHIMES = [880, 1046.5, 1174.66, 1318.51];
    let ctx = null, master = null, running = false, timers = [];
    let bedGain = null, padG = null, padOscs = [];
    let trackReady = false, trackLoading = false, musicSrc = null, musicGain = null, trackBuf = null;

    function ensureCtx() {
      if (ctx) return;
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
    }

    function brownNoise(c) {
      const len = c.sampleRate * 3;
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = last * 3.5;
      }
      return buf;
    }

    function chime() {
      if (!running || trackReady || !ctx || !master) return; // chimes retire once the score is in
      const t = ctx.currentTime;
      const f = CHIMES[(Math.random() * CHIMES.length) | 0] * (Math.random() < 0.3 ? 2 : 1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 5.5);
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 2.756;
      const g2 = ctx.createGain(); g2.gain.value = 0.22;
      o.connect(g); o2.connect(g2); g2.connect(g);
      if (ctx.createStereoPanner) {
        const pan = ctx.createStereoPanner();
        pan.pan.value = Math.random() * 1.2 - 0.6;
        g.connect(pan); pan.connect(master);
      } else {
        g.connect(master);
      }
      o.start(t); o2.start(t); o.stop(t + 5.6); o2.stop(t + 5.6);
      timers.push(window.setTimeout(chime, 9000 + Math.random() * 11000));
    }

    function buildBed() {
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      bedGain = ctx.createGain();
      bedGain.gain.value = 1;
      bedGain.connect(master);
      // the ocean — brown noise breathing through a wandering lowpass
      const src = ctx.createBufferSource();
      src.buffer = brownNoise(ctx); src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380; lp.Q.value = 0.7;
      const wave = ctx.createGain(); wave.gain.value = 0.5;
      const swell = ctx.createOscillator(); swell.frequency.value = 0.05;
      const swellG = ctx.createGain(); swellG.gain.value = 0.3;
      swell.connect(swellG); swellG.connect(wave.gain);
      const wash = ctx.createOscillator(); wash.frequency.value = 0.07;
      const washG = ctx.createGain(); washG.gain.value = 160;
      wash.connect(washG); washG.connect(lp.frequency);
      src.connect(lp); lp.connect(wave); wave.connect(bedGain);
      src.start(); swell.start(); wash.start();
      // deep water — a 55 Hz drone under everything
      const sub = ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = 55;
      const subG = ctx.createGain(); subG.gain.value = 0.03;
      sub.connect(subG); subG.connect(bedGain); sub.start();
      // the pad — three slow voices that glide between chords
      const padLP = ctx.createBiquadFilter(); padLP.type = "lowpass"; padLP.frequency.value = 900;
      padG = ctx.createGain(); padG.gain.value = 0.05;
      padLP.connect(padG); padG.connect(bedGain);
      CHORDS[0].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f;
        const g = ctx.createGain(); g.gain.value = i === 0 ? 0.5 : 0.34;
        o.connect(g); g.connect(padLP); o.start();
        padOscs.push(o);
      });
    }

    function startTrack() {
      if (!ctx || trackLoading || trackReady) return;
      trackLoading = true;
      fetch(TRACK_URL)
        .then((r) => { if (!r.ok) throw new Error("http " + r.status); return r.arrayBuffer(); })
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => {
          trackLoading = false;
          trackReady = true;
          trackBuf = buf;
          if (running) playTrack(buf);
        })
        .catch(() => { trackLoading = false; }); // score unavailable — the bed carries on
    }

    function playTrack(buf) {
      if (musicSrc) return; // never more than one instance
      musicSrc = ctx.createBufferSource();
      musicSrc.buffer = buf;
      musicSrc.loop = true;
      musicGain = ctx.createGain();
      musicGain.gain.value = 0;
      musicSrc.connect(musicGain);
      musicGain.connect(master);
      musicSrc.start();
      const t = ctx.currentTime;
      musicGain.gain.setTargetAtTime(0.55, t, 1.5); // slow cinematic entrance
      bedGain.gain.setTargetAtTime(0.4, t, 1.8);    // the sea ducks beneath the piano
      if (padG) padG.gain.setTargetAtTime(0.015, t, 2.0);
    }

    function stopTrack() {
      if (!musicSrc || !musicGain) return;
      const t = ctx.currentTime;
      musicGain.gain.cancelScheduledValues(t);
      musicGain.gain.setTargetAtTime(0, t, 0.3);
      bedGain.gain.setTargetAtTime(1, t, 0.5);
      if (padG) padG.gain.setTargetAtTime(0.05, t, 0.5);
      const src = musicSrc;
      musicSrc = null;
      window.setTimeout(() => { try { src.stop(); } catch { /* already ended */ } }, 1500);
    }

    function start() {
      if (running) return;
      ensureCtx();
      if (!ctx) return;
      if (ctx.resume) ctx.resume();
      running = true;
      if (!master) buildBed();
      timers.push(window.setInterval(() => {
        if (!ctx || trackReady) return;
        const next = CHORDS[(Math.random() * CHORDS.length) | 0];
        padOscs.forEach((o, i) => o.frequency.setTargetAtTime(next[i], ctx.currentTime, 2.4));
      }, 26000));
      timers.push(window.setTimeout(chime, 3500));
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(0.2, t, 1.2); // gentle fade-in, never abrupt
      if (trackReady) playTrack(trackBuf); // prewarmed — plays instantly
      else startTrack(); // fetch + decode happen off the render path
    }

    // warm the score before any gesture: fetching and decoding need no
    // user interaction (only playback does), so visitors who left sound
    // on get music the instant they touch the page
    function prewarm() {
      ensureCtx();
      if (ctx && !trackReady && !trackLoading) startTrack();
    }

    function stop() {
      if (!running || !ctx) return;
      running = false;
      timers.forEach((tm) => { window.clearTimeout(tm); window.clearInterval(tm); });
      timers = [];
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(0, t, 0.35); // smooth fade-out
      stopTrack();
      window.setTimeout(() => {
        if (!running && ctx && ctx.state === "running" && ctx.suspend) ctx.suspend();
      }, 1600);
    }

    // iOS/Android: backgrounding suspends the context — wake it on return
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && running && ctx && ctx.state === "suspended" && ctx.resume) ctx.resume();
    });

    return {
      start,
      stop,
      prewarm,
      get on() { return running; },
      get mode() { return trackReady ? "score" : trackLoading ? "loading" : "bed"; },
    };
  })();

  function setSoundUi(on) {
    if (!soundBtn) return;
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.classList.toggle("is-on", on);
    $(".tgl-glyph", soundBtn).textContent = on ? "♫" : "♪";
  }

  soundBtn && soundBtn.addEventListener("click", () => {
    if (Ambient.on) { Ambient.stop(); setSoundUi(false); localStorage.setItem(SOUND_KEY, "0"); }
    else { Ambient.start(); setSoundUi(true); localStorage.setItem(SOUND_KEY, "1"); }
  });
  // a returning listener who opted in: begin on their first gesture.
  // Deliberate pauses (stored "0") are never overridden.
  if (!REDUCED && localStorage.getItem(SOUND_KEY) === "1") {
    setSoundUi(true);
    Ambient.prewarm(); // decode early — the first gesture plays instantly
    const arm = () => { if (!Ambient.on) Ambient.start(); };
    ["pointerdown", "keydown"].forEach((ev) =>
      window.addEventListener(ev, arm, { once: true, passive: true }));
  }

  /* ── 1c · panel boxes toggle — boxless by default ─────────────────
     ▢ boxless (default): editorial text directly over the ocean.
     ▣ boxes: brings back the golden-edged glass panels. Persisted. */
  const boxesBtn = $("#boxes-toggle");
  const BOXES_KEY = "lantern-boxes";

  function setBoxes(on, persist) {
    document.documentElement.classList.toggle("boxes-on", on);
    if (boxesBtn) {
      boxesBtn.setAttribute("aria-pressed", String(on));
      boxesBtn.classList.toggle("is-on", on);
      $(".tgl-glyph", boxesBtn).textContent = on ? "▣" : "▢";
    }
    if (persist) localStorage.setItem(BOXES_KEY, on ? "1" : "0");
  }

  setBoxes(localStorage.getItem(BOXES_KEY) === "1", false);
  boxesBtn && boxesBtn.addEventListener("click", () =>
    setBoxes(!document.documentElement.classList.contains("boxes-on"), true));

  // QA hooks (same spirit as window.__world)
  window.__ambient = Ambient;
  window.__setBoxes = setBoxes;

  /* ── 2 · typed roles ────────────────────────────────────────────── */

  const typed = $("#typed");
  const ROLES = [
    "full-stack developer",
    "agent-tooling builder",
    "ml & data explorer",
    "keeper of small lights",
  ];

  if (typed) {
    if (REDUCED) {
      typed.textContent = ROLES[0];
    } else {
      let role = 0;
      let char = 0;
      let deleting = false;
      (function tick() {
        const word = ROLES[role];
        char += deleting ? -1 : 1;
        typed.textContent = word.slice(0, char);
        let wait = deleting ? 32 : 58;
        if (!deleting && char === word.length) {
          wait = 2300;
          deleting = true;
        } else if (deleting && char === 0) {
          deleting = false;
          role = (role + 1) % ROLES.length;
          wait = 380;
        }
        window.setTimeout(tick, wait);
      })();
    }
  }

  /* ── 3 · figures ────────────────────────────────────────────────── */

  function startFigures() {
    if (figuresDone) return;
    figuresDone = true;
    $$("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (!Number.isFinite(target)) return;
      if (REDUCED) {
        el.textContent = String(target);
        return;
      }
      const t0 = performance.now();
      const dur = 900;
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ── 4 · stations · nav · hud ───────────────────────────────────── */

  const nav = $("#site-nav");
  const stations = $$(".station");
  const journeyLinks = $$(".journey a");
  const hudNum = $("#hud-num");
  const hudName = $("#hud-name");
  const hudFill = $("#hud-fill");

  const NAMES = ["the shore", "the beacon", "the fleet", "the star chart", "the gate"];

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 16);

    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, y / max));
    if (hudFill) hudFill.style.width = `${(p * 100).toFixed(1)}%`;

    // nearest station centre to the viewport centre
    let index = 0;
    let best = Infinity;
    const mid = y + window.innerHeight * 0.5;
    stations.forEach((el, i) => {
      const d = Math.abs(el.offsetTop + el.offsetHeight * 0.5 - mid);
      if (d < best) {
        best = d;
        index = i;
      }
    });

    journeyLinks.forEach((a, i) => a.classList.toggle("active", i === index));
    if (hudNum) hudNum.textContent = String(index).padStart(2, "0");
    if (hudName) hudName.textContent = NAMES[index] || "";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── 5 · berth dossiers ─────────────────────────────────────────── */

  const PROJECTS = {
    w2s: {
      kicker: "01 · agent tooling · python",
      title: "web2skill",
      summary:
        "A skill that produces skills. Load it into a coding agent, point it at a website, and it compiles a structured folder of SKILL.md references — every element, every state, every form, every edge case.",
      points: [
        "Output is a reference, not a recipe: the agent later reads it to know where a control is and what can go wrong.",
        "Splits the page model from workflow generation, so the same reference can drive many different tasks.",
        "Written as a portable skill, so it works across Claude Code, Codex and Cursor rather than one vendor's agent.",
      ],
      stack: "python · skill spec · markdown · cli",
      links: [{ label: "repo", href: "https://github.com/SadhaSri697/Webtoskill" }],
    },
    pi: {
      kicker: "02 · agent memory · typescript",
      title: "PI Project Context",
      summary:
        "A persistent project brain for coding agents. Each project gets a .pi/ directory of context, so the agent starts every session already knowing the codebase instead of re-deriving it.",
      points: [
        "File-based by design — no service, no network dependency, nothing to leak off the machine.",
        "Context lives next to the code it describes, so it travels with a clone and can be reviewed in a diff.",
        "Aimed at the real failure mode of agent work: losing the thread between sessions.",
      ],
      stack: "typescript · node ≥18 · filesystem",
      links: [{ label: "repo", href: "https://github.com/SadhaSri697/Pi-ppc-main" }],
    },
    dna: {
      kicker: "03 · spec-driven development · javascript",
      title: "DNA Spec",
      summary:
        "Software shouldn't be built from prompts. DNA Spec replaces them with a hierarchical specification — conversation → DNA → plan → tasks → code — where the DNA is the minimum information needed to rebuild the system.",
      points: [
        "Each layer narrows the problem: intent becomes a spec, the spec becomes a plan, the plan becomes tasks.",
        "Because the DNA is minimal and explicit, a system can be reconstructed rather than guessed at.",
        "Built for Pi, but the model is deliberately agent-agnostic.",
      ],
      stack: "javascript · specification design · agent workflow",
      links: [{ label: "repo", href: "https://github.com/SadhaSri697/Dna-spec-main" }],
    },
    genui: {
      kicker: "04 · visual artifacts · html + javascript",
      title: "genui",
      summary:
        "Generates beautiful, interactive web artifacts straight from CLI coding agents — so instead of describing an interface in prose, the agent renders one you can open and use.",
      points: [
        "Turns an agent's output into something inspectable, not a wall of markdown.",
        "Keeps the artifact self-contained: open the file and it runs.",
        "Tested with vitest; built as a small, focused tool rather than a framework.",
      ],
      stack: "html · javascript · cli · vitest",
      links: [{ label: "repo", href: "https://github.com/SadhaSri697/Genui-main" }],
    },
    auto: {
      kicker: "05 · autonomous research · javascript",
      title: "Auto-Breakthrough",
      summary:
        "Given a falsifiable claim and a testable procedure, it drives an agent through a structured research loop — designing the experiment, executing it, analysing the result — and returns a verdict.",
      points: [
        "Starts from falsifiability, so the loop has something real to fail against.",
        "Separates design, execution and analysis into stages an agent can be held to.",
        "Ships with a web studio for reading the resulting verdict.",
      ],
      stack: "javascript · agent orchestration · research method",
      links: [{ label: "repo", href: "https://github.com/SadhaSri697/Auto-breaktrough-main" }],
    },
    anime: {
      kicker: "06 · web platform · javascript",
      title: "My Anime Shelf",
      summary:
        "A personal anime universe: trending and popular discovery, full-catalogue search, show comparisons and a cloud-synced watched list — built in vanilla ES modules with no framework.",
      points: [
        "AniList GraphQL for metadata, including debounced live search with keyboard-accessible results.",
        "Firebase Authentication + Cloud Firestore keep the collection in sync across devices.",
        "The one project on this water with a public URL — worth opening.",
      ],
      stack: "javascript es modules · graphql · firebase · html5/css3",
      links: [
        { label: "live demo", href: "https://sadhasri697.github.io/My-Anime-Self/" },
        { label: "repo", href: "https://github.com/SadhaSri697/My-Anime-Self" },
      ],
    },
  };

  const overlay = $("#berth-overlay");
  const card = $(".berth-card", overlay);
  const elKicker = $("#berth-kicker");
  const elTitle = $("#berth-title");
  const elSummary = $("#berth-summary");
  const elPoints = $("#berth-points");
  const elStack = $("#berth-stack");
  const elLinks = $("#berth-links");
  const elSigil = $("#berth-sigil");
  let lastFocus = null;

  function openBerth(id) {
    const p = PROJECTS[id];
    if (!p || !overlay) return;
    lastFocus = document.activeElement;

    elKicker.textContent = p.kicker;
    elTitle.textContent = p.title;
    elSummary.textContent = p.summary;
    elPoints.innerHTML = "";
    p.points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      elPoints.appendChild(li);
    });
    elStack.textContent = p.stack;
    elLinks.innerHTML = "";
    p.links.forEach((link, i) => {
      const a = document.createElement("a");
      a.className = i === 0 ? "btn btn-solid" : "btn btn-line";
      a.href = link.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = `${link.label} <span aria-hidden="true">↗</span>`;
      elLinks.appendChild(a);
    });
    elSigil.src = `assets/sigil-${id}.svg`;
    elSigil.alt = `${p.title} constellation sigil`;

    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    $("#berth-close").focus();
  }

  function closeBerth() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => openBerth(btn.dataset.open));
  });

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (!card.contains(e.target)) closeBerth();
    });
    $("#berth-close").addEventListener("click", closeBerth);
  }

  // hovering a berth makes its lantern answer
  $$(".berth").forEach((row) => {
    const id = row.dataset.project;
    const light = () => window.__world && window.__world.highlight(id);
    const dim = () => window.__world && window.__world.highlight(null);
    row.addEventListener("pointerenter", light);
    row.addEventListener("pointerleave", dim);
    row.addEventListener("focusin", light);
    row.addEventListener("focusout", dim);
  });

  /* ── 6 · ⌘K course plotter ──────────────────────────────────────── */

  const cmdk = $("#cmdk");
  const cmdkInput = $("#cmdk-input");
  const cmdkList = $("#cmdk-list");
  const cmdkBtn = $("#cmdk-open");
  let cmdkOpen = false;
  let selected = 0;
  let filtered = [];

  const go = (sel) => {
    const el = $(sel);
    if (el) el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  };

  const COMMANDS = [
    { glyph: "◆", label: "sail to the shore", hint: "00", kw: "home start hero shore top", run: () => go("#shore") },
    { glyph: "◆", label: "sail to the beacon", hint: "01", kw: "about identity beacon whoami", run: () => go("#beacon") },
    { glyph: "◆", label: "sail to the fleet", hint: "02", kw: "projects work fleet berths", run: () => go("#fleet") },
    { glyph: "◆", label: "sail to the star chart", hint: "03", kw: "skills stack chart constellation", run: () => go("#chart") },
    { glyph: "◆", label: "sail to the gate", hint: "04", kw: "contact email gate portal", run: () => go("#gate") },
    { glyph: "◇", label: "open berth 01 — web2skill", hint: "proj", kw: "w2s web2skill skill agent website", run: () => openBerth("w2s") },
    { glyph: "◇", label: "open berth 02 — pi context", hint: "proj", kw: "pi memory context project brain", run: () => openBerth("pi") },
    { glyph: "◇", label: "open berth 03 — dna spec", hint: "proj", kw: "dna spec plan tasks", run: () => openBerth("dna") },
    { glyph: "◇", label: "open berth 04 — genui", hint: "proj", kw: "genui artifacts visual web", run: () => openBerth("genui") },
    { glyph: "◇", label: "open berth 05 — auto-breakthrough", hint: "proj", kw: "auto research verdict experiment", run: () => openBerth("auto") },
    { glyph: "◇", label: "open berth 06 — my anime shelf", hint: "proj", kw: "anime anilist firebase shelf", run: () => openBerth("anime") },
    { glyph: "↗", label: "github · @SadhaSri697", hint: "ext", kw: "github code repos", run: () => window.open("https://github.com/SadhaSri697", "_blank", "noopener") },
    { glyph: "✉", label: "email · jnanasadhasri.s@gmail.com", hint: "ext", kw: "email mail contact write hello", run: () => (location.href = "mailto:jnanasadhasri.s@gmail.com?subject=From%20the%20lantern%20sea") },
  ];

  function renderList() {
    cmdkList.innerHTML = "";
    filtered.forEach((cmd, i) => {
      const li = document.createElement("li");
      li.className = "cmdk-item" + (i === selected ? " selected" : "");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === selected ? "true" : "false");
      li.innerHTML = `<span class="cmdk-glyph">${cmd.glyph}</span><span>${cmd.label}</span><span class="cmdk-hint">${cmd.hint}</span>`;
      li.addEventListener("click", () => runCommand(cmd));
      li.addEventListener("pointermove", () => {
        selected = i;
        $$(".cmdk-item", cmdkList).forEach((el, k) => el.classList.toggle("selected", k === i));
      });
      cmdkList.appendChild(li);
    });
  }

  function filterCommands(q) {
    const query = q.trim().toLowerCase();
    filtered = query
      ? COMMANDS.filter((c) => `${c.label} ${c.kw}`.toLowerCase().includes(query))
      : COMMANDS.slice();
    selected = 0;
    renderList();
  }

  function openCmdk() {
    cmdkOpen = true;
    cmdk.hidden = false;
    cmdkInput.value = "";
    filterCommands("");
    cmdkInput.focus();
  }

  function closeCmdk() {
    cmdkOpen = false;
    cmdk.hidden = true;
  }

  function runCommand(cmd) {
    closeCmdk();
    cmd.run();
  }

  if (cmdk && cmdkInput && cmdkList) {
    cmdkBtn.addEventListener("click", openCmdk);
    cmdk.addEventListener("click", (e) => {
      if (e.target === cmdk) closeCmdk();
    });
    cmdkInput.addEventListener("input", () => filterCommands(cmdkInput.value));

    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        cmdkOpen ? closeCmdk() : openCmdk();
        return;
      }

      if (e.key === "Escape") {
        if (cmdkOpen) {
          closeCmdk();
          return;
        }
        closeBerth();
        return;
      }

      if (!cmdkOpen) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const dir = e.key === "ArrowDown" ? 1 : -1;
        selected = Math.min(filtered.length - 1, Math.max(0, selected + dir));
        $$(".cmdk-item", cmdkList).forEach((el, k) => el.classList.toggle("selected", k === selected));
        const active = $$(".cmdk-item", cmdkList)[selected];
        if (active) active.scrollIntoView({ block: "nearest" });
        return;
      }

      if (e.key === "Enter" && filtered[selected]) {
        e.preventDefault();
        runCommand(filtered[selected]);
      }
    });
  }

  /* ── 7 · misc + QA hooks ────────────────────────────────────────── */

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ?at=0..4 jumps to a station (deep-link + screenshot hook)
  if (PARAMS.has("at")) {
    const ids = ["shore", "beacon", "fleet", "chart", "gate"];
    const i = Math.min(4, Math.max(0, parseInt(PARAMS.get("at"), 10) || 0));
    const el = document.getElementById(ids[i]);
    if (el) {
      document.documentElement.style.scrollBehavior = "auto";
      const jump = () => {
        // land on the station centre: that is where the camera stop sits
        const r = el.getBoundingClientRect();
        const centre = r.top + window.scrollY + r.height / 2;
        window.scrollTo(0, Math.max(0, Math.round(centre - window.innerHeight / 2)));
      };
      jump();
      // layout can shift once webfonts land — land again, then hand back to CSS
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          jump();
          document.documentElement.style.scrollBehavior = "";
        });
      }
    }
  }
})();
