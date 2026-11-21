/* ═══════════════════════════════════════════════════════════════
   S. SADHASRI — SHADOW ARC v7.0 "THE ARCANE ENGINEER"
   app.js — boot · typed roles · counters · reveals · audio ·
            shadow-mode ⌘K palette · QA hooks — vanilla JS
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const PARAMS = new URLSearchParams(location.search);
  const REDUCED =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    PARAMS.has("static");
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  if (PARAMS.has("static")) {
    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.classList.add("static-render"); // freeze CSS animation for capture
  }

  let countersStarted = false;

  /* ── 1 · boot: releasing the seal ───────────────────────────── */

  const boot = $("#boot");
  const bootLines = $(".boot-lines", boot);
  const bootFill = $(".boot-bar-fill", boot);

  const BOOT_SCRIPT = [
    "releasing the seal <hl>解</hl> .......... <ok>[ok]</ok>",
    "loading shadow techniques .............. <ok>[ok]</ok>",
    "summoning interface .................... <ok>[ok]</ok>",
    "arc 01 — <hl>the awakening</hl>. welcome, visitor.",
  ];

  function finishBoot() {
    boot.classList.add("done");
    setTimeout(() => boot.remove(), 520);
    startCounters();
  }

  if (REDUCED) {
    boot.remove();
    startCounters();
  } else {
    BOOT_SCRIPT.forEach((line, i) => {
      setTimeout(() => {
        const el = document.createElement("div");
        el.className = "boot-line";
        el.innerHTML = line
          .replace(/<ok>/g, '<span class="ok">')
          .replace(/<\/ok>/g, "</span>")
          .replace(/<hl>/g, '<span class="hl">')
          .replace(/<\/hl>/g, "</span>");
        bootLines.appendChild(el);
        bootFill.style.width = `${((i + 1) / BOOT_SCRIPT.length) * 100}%`;
      }, 140 + i * 190);
    });
    setTimeout(finishBoot, 140 + BOOT_SCRIPT.length * 190 + 380);
    boot.addEventListener("click", finishBoot, { once: true });
  }

  /* ── 2 · typed roles ────────────────────────────────────────── */

  const typedEl = $("#typed");
  const ROLES = [
    "full-stack developer",
    "ml & data-science enthusiast",
    "agent-tooling builder",
    "the arcane engineer",
  ];

  if (REDUCED) {
    typedEl.textContent = ROLES[0];
  } else {
    let roleIdx = 0, charIdx = 0, deleting = false;
    (function typeTick() {
      const word = ROLES[roleIdx];
      charIdx += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, charIdx);
      let delay = deleting ? 34 : 62;
      if (!deleting && charIdx === word.length) { delay = 2100; deleting = true; }
      else if (deleting && charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % ROLES.length;
        delay = 420;
      }
      setTimeout(typeTick, delay);
    })();
  }

  /* ── 3 · reveal on scroll + affinities ──────────────────────── */

  if (REDUCED) {
    $$(".reveal").forEach((el) => el.classList.add("in"));
    $$(".af").forEach((el) => el.classList.add("visible"));
  } else {
    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            if (e.target.closest("#file")) {
              $$(".af", e.target.closest("#file")).forEach((el) => el.classList.add("visible"));
            }
            revealIO.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    $$(".reveal").forEach((el) => revealIO.observe(el));
  }

  /* ── 4 · hero stat counters ─────────────────────────────────── */

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    $$(".stat-n").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      if (REDUCED) { el.textContent = target + suffix; return; }
      const t0 = performance.now();
      const dur = 950;
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* ── 5 · nav state + active section ─────────────────────────── */

  const nav = $("#site-nav");
  const navLinks = $$(".nav-links a");

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const sectionIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.dataset.section === e.target.id)
          );
        }
      }
    },
    { rootMargin: "-38% 0px -55% 0px" }
  );
  ["file", "missions", "techniques", "summon"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionIO.observe(el);
  });

  /* ── 6 · audio — pentatonic chimes ──────────────────────────── */

  let audioCtx = null;
  function playChime(mult = 1) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state !== "running") audioCtx.resume();
      const notes = [220.0, 261.63, 293.66, 329.63, 392.0]; // A minor pentatonic
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(
        notes[Math.floor(Math.random() * notes.length)] * mult,
        audioCtx.currentTime
      );
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch (e) {}
  }

  /* ── 7 · shadow mode easter egg ─────────────────────────────── */

  let shadowTimer = null;
  function shadowMode() {
    playChime(0.5);
    document.body.classList.add("shadow-mode");
    clearTimeout(shadowTimer);
    shadowTimer = setTimeout(() => document.body.classList.remove("shadow-mode"), 2400);
  }

  /* ── 8 · ⌘K command palette ─────────────────────────────────── */

  const cmdk = $("#cmdk");
  const cmdkInput = $("#cmdk-input");
  const cmdkList = $("#cmdk-list");
  let cmdkOpen = false, selectedIndex = 0, filtered = [];

  const COMMANDS = [
    { glyph: "→", label: "go: character file", hint: "01", kw: "about file origin identity whoami", run: () => scrollToSel("#file") },
    { glyph: "→", label: "go: mission board", hint: "02", kw: "projects work missions missions list", run: () => scrollToSel("#missions") },
    { glyph: "→", label: "go: technique scrolls", hint: "03", kw: "stack skills tech techniques scrolls", run: () => scrollToSel("#techniques") },
    { glyph: "→", label: "go: the summon", hint: "04", kw: "contact email hello message summon", run: () => scrollToSel("#summon") },
    { glyph: "↗", label: "open github @SadhaSri697", hint: "ext", kw: "github repo code open source", run: () => window.open("https://github.com/SadhaSri697", "_blank") },
    { glyph: "✉", label: "summon by email", hint: "ext", kw: "email mail hello contact write", run: () => (location.href = "mailto:jnanasadhasri.s@gmail.com?subject=Summon%20—%20from%20your%20portfolio") },
    { glyph: "影", label: "shadow mode", hint: "fun", kw: "shadow solo dark mode fun easter", run: () => shadowMode() },
    { glyph: "⌂", label: "back to top", hint: "nav", kw: "top home hero start up", run: () => scrollToSel("#hero") },
  ];

  function scrollToSel(sel) {
    const el = $(sel);
    if (el) el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  }

  function renderList() {
    cmdkList.innerHTML = "";
    filtered.forEach((c, i) => {
      const li = document.createElement("li");
      li.className = "cmdk-item" + (i === selectedIndex ? " selected" : "");
      li.innerHTML = `<span class="cmdk-glyph">${c.glyph}</span><span>${c.label}</span><span class="cmdk-hint">${c.hint}</span>`;
      li.addEventListener("click", () => execCommand(c));
      li.addEventListener("mousemove", () => {
        selectedIndex = i;
        $$(".cmdk-item", cmdkList).forEach((el, k) => el.classList.toggle("selected", k === i));
      });
      cmdkList.appendChild(li);
    });
  }

  function filterCommands(q) {
    const query = q.trim().toLowerCase();
    filtered = !query
      ? COMMANDS.slice()
      : COMMANDS.filter((c) => (c.label + " " + c.kw).toLowerCase().includes(query));
    selectedIndex = 0;
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

  function execCommand(c) {
    closeCmdk();
    c.run();
  }

  $("#cmdk-open").addEventListener("click", openCmdk);
  cmdk.addEventListener("click", (e) => { if (e.target === cmdk) closeCmdk(); });
  cmdkInput.addEventListener("input", () => filterCommands(cmdkInput.value));

  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      cmdkOpen ? closeCmdk() : openCmdk();
      return;
    }
    if (!cmdkOpen) return;
    if (e.key === "Escape") { closeCmdk(); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      selectedIndex = Math.min(filtered.length - 1, Math.max(0, selectedIndex + dir));
      $$(".cmdk-item", cmdkList).forEach((el, k) =>
        el.classList.toggle("selected", k === selectedIndex)
      );
      const selEl = $$(".cmdk-item", cmdkList)[selectedIndex];
      if (selEl) selEl.scrollIntoView({ block: "nearest" });
      return;
    }
    if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      execCommand(filtered[selectedIndex]);
    }
  });

  /* ── 9 · misc + QA hooks ────────────────────────────────────── */

  $("#year").textContent = new Date().getFullYear();

  if (PARAMS.has("flat")) { // screenshot hook: ?static=1&flat
    const hero = document.getElementById("hero");
    if (hero) hero.style.minHeight = "760px";
  }
  if (PARAMS.get("scroll")) { // screenshot hook: ?static=1&scroll=missions
    const el = document.getElementById(PARAMS.get("scroll"));
    if (el) el.scrollIntoView();
  }
  if (PARAMS.has("cmdk")) openCmdk();
})();
