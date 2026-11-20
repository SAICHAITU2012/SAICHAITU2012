/* ═══════════════════════════════════════════════════════════════
   S. SadhaSri // Engineering Portfolio — v6.0 "TERMINAL"
   app.js — vanilla JS, no dependencies
   modules: boot · constellation · typed roles · terminal ·
            scroll · reveal · counters · ⌘K palette
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const PARAMS = new URLSearchParams(location.search);
  const REDUCED =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    PARAMS.has("static"); // render everything instantly (testing / no-JS-style preview)
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  if (PARAMS.has("static")) {
    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.classList.add("static-render"); // freeze all CSS animation for capture
  }

  let countersStarted = false;

  /* ── 1 · boot sequence ─────────────────────────────────────── */

  const boot = $("#boot-overlay");
  const bootLines = $(".boot-lines", boot);
  const bootFill = $(".boot-bar-fill", boot);

  const BOOT_SCRIPT = [
    "$ init sadhasri.sys --env=portfolio",
    "loading modules .......... <ok>[ok]</ok>",
    "constellation engine ..... <ok>[ok]</ok>",
    "open-source index ........ <hl>13 repos</hl>",
    "ready. <hl>> welcome, visitor</hl>",
  ];

  function finishBoot() {
    boot.classList.add("done");
    setTimeout(() => boot.remove(), 500);
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
      }, 120 + i * 170);
    });
    setTimeout(finishBoot, 120 + BOOT_SCRIPT.length * 170 + 350);
    boot.addEventListener("click", finishBoot, { once: true });
  }

  /* ── 2 · background scene ──────────────────────────────────── */
  /* cinematic 3D background lives in scene3d.js (Three.js);
     replaced the flat 2D constellation layer */

  /* ── 3 · typed roles ───────────────────────────────────────── */

  const typedEl = $("#typed-roles");
  const ROLES = [
    "full-stack developer",
    "ml & data-science enthusiast",
    "agent-tooling builder",
    "creative technologist",
  ];

  if (REDUCED) {
    typedEl.textContent = ROLES[0];
  } else {
    let roleIdx = 0, charIdx = 0, deleting = false;

    function typeTick() {
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
    }
    typeTick();
  }

  /* ── 4 · terminal card ─────────────────────────────────────── */

  const term = $("#terminal-screen");

  const TERM_SCRIPT = [
    { cmd: "whoami", out: '<span class="t-out">S. SadhaSri · full-stack engineer · India</span>' },
    { cmd: "ls ./focus", out: '<span class="t-path">web-craft/  ml-pipelines/  agent-tooling/</span>' },
    { cmd: "gh repo list --public", out: '<span class="t-hl">13 repos · 100% open source</span>' },
    { cmd: "./contact --init", out: '<span class="t-hl">→</span> <span class="t-out">jnanasadhasri.s@gmail.com</span>' },
  ];

  function renderTerminalInstant() {
    term.innerHTML = TERM_SCRIPT.map(
      (s) => `<span class="t-prompt">$</span> <span class="t-cmd">${s.cmd}</span>\n${s.out}\n`
    ).join("") + '<span class="t-prompt">$</span> <span class="typed-caret">▌</span>';
  }

  if (REDUCED) {
    renderTerminalInstant();
  } else {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        io.disconnect();
        runTerminal();
      }
    }, { threshold: 0.35 });
    io.observe(term);

    function runTerminal() {
      let li = 0;

      function runLine() {
        if (li >= TERM_SCRIPT.length) {
          const cursor = document.createElement("div");
          cursor.innerHTML = '<span class="t-prompt">$</span> <span class="typed-caret">▌</span>';
          term.appendChild(cursor);
          return;
        }
        const step = TERM_SCRIPT[li++];
        const line = document.createElement("div");
        line.innerHTML = `<span class="t-prompt">$</span> <span class="t-cmd"></span>`;
        term.appendChild(line);
        const cmdSpan = line.querySelector(".t-cmd");
        let ci = 0;

        (function typeCmd() {
          cmdSpan.textContent = step.cmd.slice(0, ++ci);
          if (ci < step.cmd.length) {
            setTimeout(typeCmd, 26);
          } else {
            setTimeout(() => {
              const out = document.createElement("div");
              out.innerHTML = step.out;
              term.appendChild(out);
              setTimeout(runLine, 260);
            }, 140);
          }
        })();
      }
      runLine();
    }
  }

  /* ── 5 · scroll: progress bar, nav state, active section ───── */

  const progress = $("#scroll-progress");
  const nav = $("#site-nav");
  const navLinks = $$(".nav-links a");

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
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
  ["about", "projects", "stack", "contact"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionIO.observe(el);
  });

  /* ── 6 · reveal on scroll ──────────────────────────────────── */

  if (REDUCED) {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  } else {
    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealIO.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    $$(".reveal").forEach((el) => revealIO.observe(el));
  }

  /* ── 7 · hero stat counters ────────────────────────────────── */

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

  /* ── 8 · ⌘K command palette ────────────────────────────────── */

  const cmdk = $("#cmdk");
  const cmdkInput = $("#cmdk-input");
  const cmdkList = $("#cmdk-list");
  let cmdkOpen = false, selectedIndex = 0, filtered = [];

  const COMMANDS = [
    { glyph: "→", label: "go: about", hint: "01", kw: "about story profile", run: () => scrollToSel("#about") },
    { glyph: "→", label: "go: selected work", hint: "02", kw: "projects work portfolio builds", run: () => scrollToSel("#projects") },
    { glyph: "→", label: "go: stack inventory", hint: "03", kw: "stack skills tech technologies", run: () => scrollToSel("#stack") },
    { glyph: "→", label: "go: contact", hint: "04", kw: "contact email hello message", run: () => scrollToSel("#contact") },
    { glyph: "$", label: "whoami", hint: "meta", kw: "whoami identity about user", run: () => scrollToSel("#about") },
    { glyph: "$", label: "ls ./projects", hint: "meta", kw: "ls list projects dir", run: () => scrollToSel("#projects") },
    { glyph: "↗", label: "open github @SadhaSri697", hint: "ext", kw: "github repo code open source", run: () => window.open("https://github.com/SadhaSri697", "_blank") },
    { glyph: "✉", label: "email jnanasadhasri.s@gmail.com", hint: "ext", kw: "email mail hello contact write", run: () => (location.href = "mailto:jnanasadhasri.s@gmail.com?subject=Hello%20SadhaSri") },
    { glyph: "↑", label: "sudo hire-me", hint: "fun", kw: "hire job recruit offer sudo fun", run: () => (location.href = "mailto:jnanasadhasri.s@gmail.com?subject=%5Bhire%5D%20Let's%20talk%20—%20via%20sudo%20hire-me") },
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

  /* ── 9 · misc ──────────────────────────────────────────────── */

  $("#year").textContent = new Date().getFullYear();

  if (PARAMS.has("flat")) { // screenshot hook: ?static=1&flat — normal section flow in a tall window
    const hero = document.getElementById("hero");
    if (hero) hero.style.minHeight = "760px";
  }
  if (PARAMS.get("scroll")) { // screenshot hook: ?static=1&scroll=projects
    const el = document.getElementById(PARAMS.get("scroll"));
    if (el) el.scrollIntoView();
  }
  if (PARAMS.has("cmdk")) openCmdk(); // screenshot hook: ?static=1&cmdk=1
})();
