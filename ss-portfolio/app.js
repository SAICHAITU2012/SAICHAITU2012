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

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const scrollBehavior = () => (REDUCED ? "auto" : "smooth");

  // hoisted: boot can end before section 3 is parsed (TDZ guard)
  let figuresDone = false;

  /* ── 1 · boot ───────────────────────────────────────────────────── */

  const boot = $("#boot");
  const bootLine = $("#boot-line");
  const bootFill = $(".boot-bar i", boot);

  const BOOT_LINES = ["lighting the lanterns", "charting the water"];

  function endBoot() {
    if (!boot || boot.classList.contains("done")) return;
    boot.classList.add("done");
    window.setTimeout(() => boot.remove(), 620);
    startFigures();
  }

  if (!boot || REDUCED) {
    if (boot) boot.remove();
    startFigures();
  } else {
    BOOT_LINES.forEach((line, i) => {
      window.setTimeout(() => {
        bootLine.textContent = line;
        bootFill.style.width = `${((i + 1) / BOOT_LINES.length) * 100}%`;
      }, 220 + i * 320);
    });
    window.setTimeout(endBoot, 220 + BOOT_LINES.length * 320 + 180);
    boot.addEventListener("click", endBoot, { once: true });
  }

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
