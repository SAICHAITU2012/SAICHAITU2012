/* ═══════════════════════════════════════════════════════════════
   S. SADHASRI — THE FLOATING ISLES v8.0
   world.js — procedural Three.js world · scroll-driven flight
   dusk→night sky · floating islands · waterfall · beacons ·
   constellation · portal · fireflies · parallax — zero assets
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const canvas = document.getElementById("world");
  if (!canvas || typeof THREE === "undefined") return;

  const PARAMS = new URLSearchParams(location.search);
  const STATIC = PARAMS.has("static");
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOBILE = () => window.innerWidth < 720;

  /* ── renderer / scene / camera ──────────────────────────────── */

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true, // stable capture
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MOBILE() ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e20, 0.011);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 900);
  camera.position.set(0, 11, 30);

  /* ── lights ─────────────────────────────────────────────────── */

  const ambient = new THREE.AmbientLight(0x9aa8c8, 0.6);
  scene.add(ambient);
  const moonlight = new THREE.DirectionalLight(0xbcd0f0, 0.75);
  moonlight.position.set(-30, 40, 20);
  scene.add(moonlight);
  const crystalLight = new THREE.PointLight(0x67e8f9, 1.1, 40);
  crystalLight.position.set(3, 9, 3);
  scene.add(crystalLight);
  const portalLight = new THREE.PointLight(0x8b9cf5, 1.3, 45);
  portalLight.position.set(0, 12.5, -128);
  scene.add(portalLight);

  /* ── helpers ────────────────────────────────────────────────── */

  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function glowSprite(r, g, b) {
    return canvasTex(64, 64, (x) => {
      const grad = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},0.5)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = grad;
      x.fillRect(0, 0, 64, 64);
    });
  }

  const SPR = {
    cyan: glowSprite(125, 232, 249),
    mag: glowSprite(232, 121, 249),
    gold: glowSprite(255, 209, 110),
    white: glowSprite(240, 244, 255),
  };

  /* ── sky dome: dusk + night crossfade ───────────────────────── */

  function skyTexture(top, mid, low, horizonGlow) {
    return canvasTex(64, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, top);
      g.addColorStop(0.55, mid);
      g.addColorStop(0.85, low);
      g.addColorStop(1, horizonGlow);
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
    });
  }

  const duskTex = skyTexture("#1b1436", "#3a2050", "#7a2f52", "#c96a5e");
  const nightTex = skyTexture("#04050e", "#070b1a", "#0c1326", "#12203e");

  const duskDome = new THREE.Mesh(
    new THREE.SphereGeometry(420, 32, 20),
    new THREE.MeshBasicMaterial({ map: duskTex, side: THREE.BackSide, fog: false, depthWrite: false })
  );
  scene.add(duskDome);

  const nightDome = new THREE.Mesh(
    new THREE.SphereGeometry(410, 32, 20),
    new THREE.MeshBasicMaterial({
      map: nightTex, side: THREE.BackSide, fog: false, depthWrite: false,
      transparent: true, opacity: 0,
    })
  );
  nightDome.renderOrder = -1;
  scene.add(nightDome);

  /* stars — appear as night falls */
  const starCount = MOBILE() ? 350 : 750;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const el = Math.random() * Math.PI * 0.48;
    const r = 380;
    starPos[i * 3] = Math.cos(a) * Math.cos(el) * r;
    starPos[i * 3 + 1] = Math.sin(el) * r * 0.9 + 20;
    starPos[i * 3 + 2] = Math.sin(a) * Math.cos(el) * r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xcdd8f0, map: SPR.white, size: 2.2, transparent: true, opacity: 0.2,
    depthWrite: false, blending: THREE.AdditiveBlending, fog: false, sizeAttenuation: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* moon — rises with the night */
  const moon = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: SPR.white, color: 0xdfe6ff, transparent: true, opacity: 0, fog: false })
  );
  moon.position.set(-90, 150, -330);
  moon.scale.set(60, 60, 1);
  scene.add(moon);

  /* ── the sea far below ──────────────────────────────────────── */

  const seaTex = canvasTex(256, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0c142c");
    g.addColorStop(1, "#060a18");
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(103, 232, 249, 0.05)";
    for (let i = 0; i < 24; i++) {
      const y = Math.random() * h;
      x.beginPath();
      x.moveTo(0, y);
      x.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 8, w * 0.7, y + (Math.random() - 0.5) * 8, w, y);
      x.stroke();
    }
  });
  seaTex.wrapS = seaTex.wrapT = THREE.RepeatWrapping;
  seaTex.repeat.set(6, 6);

  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(1400, 1400),
    new THREE.MeshBasicMaterial({ map: seaTex, fog: true })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -14;
  scene.add(sea);

  /* ── floating islands ───────────────────────────────────────── */

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x2a3050, roughness: 0.85, metalness: 0.05 });
  const rockDark = new THREE.MeshStandardMaterial({ color: 0x1e2440, roughness: 0.9 });
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x1d5c46, roughness: 0.8, emissive: 0x0d3a2c, emissiveIntensity: 0.35,
  });

  function makeIsland(x, y, z, r, decor) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.62, r * 0.16, r * 0.95, 11), rockMat);
    base.position.y = -r * 0.5;
    g.add(base);
    const chunk = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.1, r * 0.5, 8), rockDark);
    chunk.position.y = -r * 1.1;
    g.add(chunk);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.9, 1.2, 14), grassMat);
    top.position.y = 0.35;
    g.add(top);
    if (decor) decor(g, r);
    scene.add(g);
    return g;
  }

  const crystals = [];
  function addCrystal(g, x, y, z, s, hue) {
    const c = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.85 * s, 0),
      new THREE.MeshStandardMaterial({
        color: hue, emissive: hue, emissiveIntensity: 0.85, roughness: 0.2, metalness: 0.1,
      })
    );
    c.position.set(x, y, z);
    c.userData = { p: Math.random() * Math.PI * 2, y0: y };
    g.add(c);
    crystals.push(c);
    return c;
  }

  function addLantern(g, x, y, z) {
    const l = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xffc66e })
    );
    l.position.set(x, y, z);
    g.add(l);
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 1.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x141a30 })
    );
    post.position.set(x, y - 0.85, z);
    g.add(post);
  }

  function addBeacon(g, x, y, z, color, spr) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 10),
      new THREE.MeshBasicMaterial({ color })
    );
    orb.position.set(x, y + 2.6, z);
    g.add(orb);
    const pillarTex = canvasTex(64, 256, (x2, w, h) => {
      const grad = x2.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.35, "rgba(255,255,255,0.85)");
      grad.addColorStop(1, "rgba(255,255,255,0.1)");
      x2.fillStyle = grad;
      x2.fillRect(0, 0, w, h);
    });
    const pillar = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: pillarTex, color, transparent: true, opacity: 0.75,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    pillar.position.set(x, y + 6.4, z);
    pillar.scale.set(1.6, 9.5, 1);
    g.add(pillar);
    const aura = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: spr, color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    aura.position.set(x, y + 2.6, z);
    aura.scale.set(5, 5, 1);
    g.add(aura);
  }

  function addTorii(g, x, z, s) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x131a30, roughness: 0.6 });
    const t = new THREE.Group();
    const parts = [
      [2.6, 0.28, 0.34, 0, 4.6, 0],
      [2.2, 0.2, 0.28, 0, 3.7, 0],
      [0.24, 1.5, 0.26, -1.5, 2.4, 0],
      [0.24, 1.5, 0.26, 1.5, 2.4, 0],
      [0.18, 0.3, 0.2, 0, 4.05, 0],
    ];
    parts.forEach(([w, h, d, px, py, pz]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w * s, h * s, d * s), mat);
      m.position.set(px * s, py * s, pz);
      t.add(m);
    });
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(5.4 * s, 0.07 * s, 0.36 * s),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.7 })
    );
    rim.position.set(0, 5.15 * s, 0);
    t.add(rim);
    t.position.set(x, 1.62, z);
    g.add(t);
    return t;
  }

  /* hero isle */
  makeIsland(0, 6, 0, 14, (g, r) => {
    addTorii(g, 5.2, 3.4, 2.15);
    addCrystal(g, -6.5, 2.2, 2.5, 1.3, 0x67e8f9);
    addCrystal(g, 5.8, 3.1, -3.4, 1.0, 0xe879f9);
    addCrystal(g, 2.4, 1.7, 5.2, 0.8, 0xa78bfa);
    addLantern(g, -3.2, 1.35, 3.6);
    addLantern(g, 3.8, 1.35, 4.2);
    addLantern(g, 0.4, 1.35, 5.6);
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3, 0), rockDark);
    rock.position.set(-4.5, 1.1, -3.8);
    g.add(rock);
  });

  /* observatory isle */
  makeIsland(-26, 11, -31, 9, (g) => {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.9, 5.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a2240, roughness: 0.6 })
    );
    tower.position.y = 3.5;
    g.add(tower);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x241a3e, roughness: 0.4, emissive: 0x1a0f30, emissiveIntensity: 0.5 })
    );
    dome.position.y = 6.1;
    g.add(dome);
    const slit = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 2.4, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xe879f9 })
    );
    slit.position.set(0, 7.3, 0);
    slit.rotation.z = 0.5;
    g.add(slit);
    for (let i = 0; i < 4; i++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.8, 0.06),
        new THREE.MeshBasicMaterial({ color: 0xffd98a })
      );
      const a = (i / 4) * Math.PI * 2 + 0.4;
      win.position.set(Math.cos(a) * 1.6, 3.4, Math.sin(a) * 1.6);
      win.lookAt(0, 3.4, 0);
      g.add(win);
    }
    addLantern(g, -3, 1.3, 2.6);
    addLantern(g, 3.2, 1.3, -1.8);
  });

  /* archipelago — six mission islands */
  const ARCH = [
    [10, 8, -50, 5.5, 0xffd166], [18, 10, -57, 6, 0x67e8f9], [27, 8.5, -64, 5.5, 0xe879f9],
    [35, 11, -70, 6.5, 0xffd166], [42, 9, -78, 5.5, 0x67e8f9], [48, 12, -88, 6, 0xa78bfa],
  ];
  ARCH.forEach(([x, y, z, r, c], i) => {
    makeIsland(x, y, z, r, (g) => {
      addBeacon(g, 0, 0.8, 0, c, SPR.gold);
      if (i % 2 === 0) addTorii(g, -2.2, 1.2, 0.55);
      const tree = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 7), grassMat);
      tree.position.set(2.2, 1.8, -1);
      g.add(tree);
      if (i === 0) {
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 10, 8),
          new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
        );
        orb.position.set(-1.6, 1.6, 1);
        g.add(orb);
      }
    });
  });

  /* constellation inks (technique stars above the path) */
  const CONST = [
    [[-6, 30, -108], [0, 34, -112], [7, 31, -110], [12, 36, -114], [4, 40, -116]],
    [[-14, 34, -112], [-8, 38, -114], [-2, 35, -112], [3, 40, -115]],
  ];
  CONST.forEach((pts) => {
    const v = pts.map((p) => new THREE.Vector3(...p));
    const geo = new THREE.BufferGeometry().setFromPoints(v);
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.35 })
    );
    scene.add(line);
    v.forEach((p) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: SPR.white, color: 0xcfe4ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      s.position.copy(p);
      s.scale.set(3, 3, 1);
      scene.add(s);
    });
  });

  /* portal isle */
  makeIsland(0, 10, -132, 8, (g) => {
    const portal = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.16, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x8b9cf5 })
    );
    portal.position.set(0, 4.6, 0);
    g.add(portal);
    const inner = new THREE.Mesh(
      new THREE.CircleGeometry(3.45, 32),
      new THREE.MeshBasicMaterial({
        color: 0x1a1440, transparent: true, opacity: 0.62, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    inner.position.set(0, 4.6, 0);
    g.add(inner);
    addLantern(g, -3.4, 1.3, 1.8);
    addLantern(g, 3.4, 1.3, 1.8);
    addTorii(g, 0, 3.4, 0.5);
  });

  /* portal swirl particles */
  const SWIRL = MOBILE() ? 110 : 200;
  const swirlGeo = new THREE.BufferGeometry();
  const swirlData = [];
  {
    const arr = new Float32Array(SWIRL * 3);
    for (let i = 0; i < SWIRL; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.4 + Math.random() * 2.0;
      swirlData.push({ a, r, sp: 0.5 + Math.random() * 1.1, y: (Math.random() - 0.5) * 4.4 });
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = swirlData[i].y;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    swirlGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }
  const swirl = new THREE.Points(
    swirlGeo,
    new THREE.PointsMaterial({
      color: 0xa5b8ff, map: SPR.cyan, size: 0.55, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })
  );
  swirl.position.set(0, 12.6, -132);
  scene.add(swirl);

  /* waterfall off the hero isle */
  const FALL = MOBILE() ? 90 : 170;
  const fallGeo = new THREE.BufferGeometry();
  const fallArr = new Float32Array(FALL * 3);
  const fallData = [];
  for (let i = 0; i < FALL; i++) {
    const y = 6.4 - Math.random() * 30;
    fallData.push({ x0: 13.4 + (Math.random() - 0.5) * 1.4, sp: 8 + Math.random() * 7, off: Math.random() * 30 });
    fallArr[i * 3] = fallData[i].x0;
    fallArr[i * 3 + 1] = y;
    fallArr[i * 3 + 2] = 2.4 + (Math.random() - 0.5) * 1.4;
  }
  fallGeo.setAttribute("position", new THREE.BufferAttribute(fallArr, 3));
  const waterfall = new THREE.Points(
    fallGeo,
    new THREE.PointsMaterial({
      color: 0x9adbe9, map: SPR.cyan, size: 0.75, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })
  );
  scene.add(waterfall);

  /* fireflies along the journey */
  const FF = MOBILE() ? 140 : 300;
  const ffGeo = new THREE.BufferGeometry();
  const ffArr = new Float32Array(FF * 3);
  for (let i = 0; i < FF; i++) {
    ffArr[i * 3] = (Math.random() - 0.5) * 70;
    ffArr[i * 3 + 1] = Math.random() * 24 - 2;
    ffArr[i * 3 + 2] = 20 - Math.random() * 160;
  }
  ffGeo.setAttribute("position", new THREE.BufferAttribute(ffArr, 3));
  const fireflies = new THREE.Points(
    ffGeo,
    new THREE.PointsMaterial({
      color: 0xa9e8d0, map: SPR.cyan, size: 0.5, transparent: true, opacity: 0.65,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })
  );
  scene.add(fireflies);

  /* clouds — soft billboard sprites */
  const cloudTex = canvasTex(256, 128, (x, w, h) => {
    for (let i = 0; i < 14; i++) {
      const cx = 30 + Math.random() * (w - 60);
      const cy = 30 + Math.random() * (h - 60);
      const rr = 18 + Math.random() * 34;
      const grad = x.createRadialGradient(cx, cy, 0, cx, cy, rr);
      grad.addColorStop(0, "rgba(190, 205, 240, 0.55)");
      grad.addColorStop(1, "rgba(190, 205, 240, 0)");
      x.fillStyle = grad;
      x.beginPath();
      x.arc(cx, cy, rr, 0, Math.PI * 2);
      x.fill();
    }
  });
  const clouds = [];
  const CLOUD_N = MOBILE() ? 6 : 11;
  for (let i = 0; i < CLOUD_N; i++) {
    const c = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.16, depthWrite: false, fog: false })
    );
    c.position.set((Math.random() - 0.5) * 90, 14 + Math.random() * 18, 14 - Math.random() * 150);
    const sc = 26 + Math.random() * 34;
    c.scale.set(sc, sc * 0.42, 1);
    c.userData = { v: 0.4 + Math.random() * 0.5 };
    scene.add(c);
    clouds.push(c);
  }

  /* ── camera flight path (station-aligned) ───────────────────── */

  const STATION_IDS = ["prologue", "file", "missions", "techniques", "summon"];
  const VIEWS = [
    { pos: [0, 11.5, 31], look: [0, 6.5, 0] },
    { pos: [-13.5, 14.5, -9], look: [-26, 12, -31] },
    { pos: [3, 14, -33], look: [26, 9.5, -60] },
    { pos: [-2, 14, -84], look: [2, 26, -116] },
    { pos: [0, 14.5, -111], look: [0, 11.5, -132] },
  ];
  let stops = [];

  function computeStops() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const vh = window.innerHeight;
    stops = STATION_IDS.map((id, i) => {
      const el = document.getElementById(id);
      const p = Math.min(1, Math.max(0, (el.offsetTop - vh * 0.42) / max));
      const pos = new THREE.Vector3(...VIEWS[i].pos);
      const look = new THREE.Vector3(...VIEWS[i].look);
      return { p, pos, look };
    });
    stops[0].p = 0;
    for (let i = 1; i < stops.length; i++) {
      if (stops[i].p <= stops[i - 1].p) stops[i].p = stops[i - 1].p + 0.001;
    }
  }

  const smooth = (f) => f * f * (3 - 2 * f);
  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();

  function cameraFor(p, t) {
    let i = 0;
    while (i < stops.length - 2 && p > stops[i + 1].p) i++;
    const a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
    const span = Math.max(0.0001, b.p - a.p);
    const f = smooth(Math.min(1, Math.max(0, (p - a.p) / span)));
    tmpPos.lerpVectors(a.pos, b.pos, f);
    tmpLook.lerpVectors(a.look, b.look, f);
    // gentle flight bob
    tmpPos.y += Math.sin(t * 0.5) * 0.22;
    tmpPos.x += Math.sin(t * 0.3) * 0.35;
  }

  /* ── interaction: parallax + click sparkles ─────────────────── */

  const mouse = { x: 0, y: 0 };
  window.addEventListener(
    "mousemove",
    (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  const bursts = [];
  const raycaster = new THREE.Raycaster();
  const burstPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  function spawnBurst(cx, cy) {
      raycaster.setFromCamera(new THREE.Vector2((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1), camera);
      const dist = 24;
      const pt = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(dist));
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        bursts.push({
          mesh: (() => {
            const s = new THREE.Sprite(
              new THREE.SpriteMaterial({
                map: Math.random() < 0.6 ? SPR.cyan : SPR.mag,
                transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
              })
            );
            s.position.copy(pt);
            s.scale.set(1.2, 1.2, 1);
            scene.add(s);
            return s;
          })(),
          v: new THREE.Vector3(Math.cos(a) * 3, Math.sin(a) * 3, (Math.random() - 0.5) * 2),
          life: 1,
        });
      }
    }
  window.addEventListener(
    "pointerdown",
    (e) => {
      if (e.target.closest("#site-nav, .cmdk-overlay, a, button, .panel")) return;
      spawnBurst(e.clientX, e.clientY);
    },
    { passive: true }
  );
  window.__fx = { burst: spawnBurst };

  /* ── resize ─────────────────────────────────────────────────── */

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MOBILE() ? 1.5 : 2));
    computeStops();
  });

  /* ── main loop ──────────────────────────────────────────────── */

  const clock = new THREE.Clock();
  let curP = PARAMS.has("at") ? parseFloat(PARAMS.get("at")) / 4 : 0;
  let frame = 0;

  function tick() {
    const dt = Math.min(0.05, clock.getDelta() || 0.016);
    const t = clock.elapsedTime;

    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const targetP = PARAMS.has("at")
      ? Math.min(1, Math.max(0, parseFloat(PARAMS.get("at")) / 4))
      : Math.min(1, Math.max(0, window.scrollY / max));
    curP += (targetP - curP) * (STATIC ? 1 : 0.06);

    computeStopsOnce();
    cameraFor(curP, t);

    camera.position.x = tmpPos.x + mouse.x * 1.4;
    camera.position.y = tmpPos.y - mouse.y * 0.8;
    camera.position.z = tmpPos.z;
    camera.lookAt(tmpLook.x + mouse.x * 1.2, tmpLook.y - mouse.y * 0.6, tmpLook.z);

    // dusk → night
    const night = Math.min(1, Math.max(0, (curP - 0.18) / 0.7));
    nightDome.material.opacity = night;
    starMat.opacity = 0.2 + night * 0.8;
    moon.material.opacity = night * 0.95;
    ambient.intensity = 0.6 - night * 0.22;
    moonlight.intensity = 0.75 - night * 0.15;
    scene.fog.color.setRGB(
      0.04 + (1 - night) * 0.06,
      0.055 + (1 - night) * 0.045,
      0.125 + (1 - night) * 0.09
    );

    // living world
    crystals.forEach((c) => {
      c.position.y = c.userData.y0 + Math.sin(t * 1.1 + c.userData.p) * 0.24;
      c.rotation.y = t * 0.6 + c.userData.p;
    });
    islandBob = Math.sin(t * 0.62) * 0.16;
    swirl.rotation.y = t * 0.55;
    const sp = swirl.geometry.attributes.position.array;
    for (let i = 0; i < SWIRL; i++) {
      const d = swirlData[i];
      d.a += d.sp * dt;
      sp[i * 3] = Math.cos(d.a) * d.r;
      sp[i * 3 + 1] = d.y + Math.sin(t * 0.8 + i) * 0.18;
      sp[i * 3 + 2] = Math.sin(d.a) * d.r;
    }
    swirl.geometry.attributes.position.needsUpdate = true;

    const fa = fallGeo.attributes.position.array;
    for (let i = 0; i < FALL; i++) {
      const d = fallData[i];
      fa[i * 3 + 1] -= d.sp * dt;
      fa[i * 3] = d.x0 + Math.sin((fa[i * 3 + 1] + d.off) * 0.8) * 0.24;
      if (fa[i * 3 + 1] < -13.4) fa[i * 3 + 1] = 6.4;
    }
    fallGeo.attributes.position.needsUpdate = true;

    fireflies.rotation.y = t * 0.01;
    fireflies.position.y = Math.sin(t * 0.7) * 0.4;
    fireflies.material.opacity = 0.5 + Math.sin(t * 1.7) * 0.18;

    clouds.forEach((c) => {
      c.position.x += c.userData.v * dt * 1.4;
      if (c.position.x > 55) c.position.x = -55;
    });

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.mesh.position.add(b.v.clone().multiplyScalar(dt * 60 * 0.016 + 0.02));
      b.v.y -= dt * 3;
      b.life -= dt * 1.5;
      b.mesh.material.opacity = Math.max(0, b.life);
      b.mesh.scale.setScalar(1.2 * b.life + 0.3);
      if (b.life <= 0) {
        scene.remove(b.mesh);
        bursts.splice(i, 1);
      }
    }

    islandGroups.forEach((g) => { g.position.y = g.userData.baseY + islandBob * g.userData.bobK; });

    renderer.render(scene, camera);

    frame++;
    if (STATIC) {
      if (frame < 110) requestAnimationFrame(tick); // settle then freeze (buffer preserved)
      return;
    }
    requestAnimationFrame(tick);
  }

  let islandBob = 0;
  const islandGroups = [];

  function computeStopsOnce() {
    if (!stops.length) computeStops();
  }

  // tag island groups for shared bob
  scene.children.forEach((c) => {
    if (c.type === "Group" && c.children.some((m) => m.geometry && m.geometry.type === "CylinderGeometry")) {
      c.userData.bobK = 0.6 + Math.random() * 0.8;
      c.userData.baseY = c.position.y;
      islandGroups.push(c);
    }
  });

  window.addEventListener("resize", computeStops);
  computeStops();
  tick();
})();
