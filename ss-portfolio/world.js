/* ═══════════════════════════════════════════════════════════════
   S. SADHASRI — THE FLOATING ISLES v8.5 "GOLDEN HOUR"
   world.js — organic fantasy islands · golden-hour cinematic grade
   lush vegetation · waterfalls + ponds · cloud sea · rainbow ·
   fairies · butterflies · petals · mushrooms · soft shadows
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const canvas = document.getElementById("world");
  if (!canvas || typeof THREE === "undefined") return;

  const PARAMS = new URLSearchParams(location.search);
  const STATIC = PARAMS.has("static");
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MOBILE = () => window.innerWidth < 720;

  /* ── renderer: warm cinematic grade ─────────────────────────── */

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MOBILE() ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xe2b98f, 0.006); // warm golden haze

  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1200);
  camera.position.set(4, 13.5, 36);

  /* ── lights: golden hour ────────────────────────────────────── */

  const sun = new THREE.DirectionalLight(0xffd9a6, 0.95);
  sun.position.set(70, 95, 55);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -180;
  sun.shadow.camera.right = 180;
  sun.shadow.camera.top = 180;
  sun.shadow.camera.bottom = -180;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 460;
  sun.shadow.bias = -0.0007;
  scene.add(sun);

  const hemiLights = new THREE.HemisphereLight(0x8fb8e8, 0x6a5040, 0.32);
  scene.add(hemiLights);
  scene.add(new THREE.AmbientLight(0xffe2c0, 0.18));
  const rimLight = new THREE.DirectionalLight(0xff9fd0, 0.5);
  rimLight.position.set(-60, 30, -70);
  scene.add(rimLight);

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
    cyan: glowSprite(140, 235, 249),
    mag: glowSprite(236, 150, 249),
    gold: glowSprite(255, 205, 120),
    white: glowSprite(255, 246, 225),
    pink: glowSprite(255, 183, 220),
  };

  function vnoise(x, y, z) {
    return (
      Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 0.5 +
      Math.sin(x * 4.7 + y * 9.3 + z * 6.1) * 0.5
    );
  }

  const lerp = (a, b, f) => a + (b - a) * f;

  const fairies = []; // declared early — decor registers fairy sprites

  /* ── sky: golden hour dome + magical twilight dome ──────────── */

  function skyTexture(stops) {
    return canvasTex(64, 512, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      stops.forEach(([o, c]) => g.addColorStop(o, c));
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
    });
  }

  const goldenTex = skyTexture([
    [0, "#1f3a80"], [0.35, "#4d62b0"], [0.62, "#b07090"],
    [0.8, "#f2a060"], [1, "#ffd08a"],
  ]);
  const duskTex = skyTexture([
    [0, "#241a4e"], [0.4, "#4a2d6e"], [0.7, "#94467c"],
    [0.88, "#e07a8a"], [1, "#f7b26e"],
  ]);

  const goldenDome = new THREE.Mesh(
    new THREE.SphereGeometry(430, 32, 20),
    new THREE.MeshBasicMaterial({ map: goldenTex, side: THREE.BackSide, fog: false, depthWrite: false })
  );
  scene.add(goldenDome);

  const duskDome = new THREE.Mesh(
    new THREE.SphereGeometry(424, 32, 20),
    new THREE.MeshBasicMaterial({
      map: duskTex, side: THREE.BackSide, fog: false, depthWrite: false,
      transparent: true, opacity: 0,
    })
  );
  scene.add(duskDome);

  /* stars — fade in during the twilight leg */
  const starCount = MOBILE() ? 300 : 620;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const el = Math.random() * Math.PI * 0.46;
    const r = 400;
    starPos[i * 3] = Math.cos(a) * Math.cos(el) * r;
    starPos[i * 3 + 1] = Math.sin(el) * r * 0.9 + 30;
    starPos[i * 3 + 2] = Math.sin(a) * Math.cos(el) * r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xe8eeff, map: SPR.white, size: 2.1, transparent: true, opacity: 0.1,
    depthWrite: false, blending: THREE.AdditiveBlending, fog: false, sizeAttenuation: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  const sunSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: SPR.gold, color: 0xffe3b0, transparent: true, opacity: 0.95, fog: false })
  );
  sunSprite.position.set(120, 74, -300);
  sunSprite.scale.set(190, 190, 1);
  scene.add(sunSprite);

  const moon = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: SPR.white, color: 0xe4e9ff, transparent: true, opacity: 0, fog: false })
  );
  moon.position.set(-150, 165, -300);
  moon.scale.set(56, 56, 1);
  scene.add(moon);

  /* ── rainbow at the great falls ─────────────────────────────── */

  {
    const geo = new THREE.TorusGeometry(34, 0.55, 8, 64, Math.PI * 0.85);
    const cols = new Float32Array(geo.attributes.position.count * 3);
    const rainbow = [0xff5f5f, 0xffb347, 0xfff16f, 0x7be07b, 0x5fb8ff, 0xa78bfa];
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const f = (i / geo.attributes.position.count) * rainbow.length;
      const c = new THREE.Color(rainbow[Math.floor(f) % rainbow.length]).lerp(
        new THREE.Color(rainbow[(Math.floor(f) + 1) % rainbow.length]), f % 1
      );
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const rb = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide,
      })
    );
    rb.position.set(0, -2, -46);
    rb.rotation.x = 0.12;
    scene.add(rb);
  }

  /* ── distant hazy mountains ─────────────────────────────────── */

  {
    const mMat = new THREE.MeshBasicMaterial({ color: 0x9a8ab8, fog: true });
    [
      [-180, -260, 60, 120], [-90, -300, 80, 150], [40, -320, 100, 170],
      [150, -280, 70, 130], [230, -220, 55, 110], [-250, -220, 65, 120],
    ].forEach(([x, z, r, h]) => {
      const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mMat);
      m.position.set(x, -30 + h / 2, z);
      scene.add(m);
    });
  }

  /* ── cloud sea below + drifting clouds ──────────────────────── */

  const cloudTex = canvasTex(256, 128, (x, w, h) => {
    for (let i = 0; i < 16; i++) {
      const cx = 30 + Math.random() * (w - 60);
      const cy = 34 + Math.random() * (h - 68);
      const rr = 16 + Math.random() * 36;
      const grad = x.createRadialGradient(cx, cy, 0, cx, cy, rr);
      grad.addColorStop(0, "rgba(255, 244, 224, 0.85)");
      grad.addColorStop(0.55, "rgba(255, 226, 200, 0.4)");
      grad.addColorStop(1, "rgba(255, 226, 200, 0)");
      x.fillStyle = grad;
      x.beginPath();
      x.arc(cx, cy, rr, 0, Math.PI * 2);
      x.fill();
    }
  });

  const clouds = [];
  const CLOUD_SEA = MOBILE() ? 26 : 52;
  for (let i = 0; i < CLOUD_SEA; i++) {
    const c = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.34 + Math.random() * 0.2, depthWrite: false, fog: false })
    );
    c.position.set((Math.random() - 0.5) * 340, -8 - Math.random() * 8, (Math.random() - 0.5) * 340);
    const sc = 75 + Math.random() * 95;
    c.scale.set(sc, sc * 0.42, 1);
    c.userData = { v: 0.5 + Math.random() * 0.6 };
    scene.add(c);
    clouds.push(c);
  }
  const CLOUD_HI = MOBILE() ? 5 : 9;
  for (let i = 0; i < CLOUD_HI; i++) {
    const c = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: 0.2, depthWrite: false, fog: false })
    );
    c.position.set((Math.random() - 0.5) * 150, 26 + Math.random() * 22, (Math.random() - 0.5) * 200 - 40);
    const sc = 40 + Math.random() * 50;
    c.scale.set(sc, sc * 0.4, 1);
    c.userData = { v: 0.3 + Math.random() * 0.4 };
    scene.add(c);
    clouds.push(c);
  }

  /* ── organic island factory ─────────────────────────────────── */

  const grassMats = [
    new THREE.MeshStandardMaterial({ color: 0x2f7a42, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x3f8f52, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x5aa868, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x5a4f98, roughness: 0.85 }),
  ];
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x5e4632, roughness: 0.92 });
  const rockDeep = new THREE.MeshStandardMaterial({ color: 0x463628, roughness: 0.95 });

  function organicRock(r, h, seed) {
    const geo = new THREE.CylinderGeometry(r * 0.92, r * 0.1, h, 12, 4);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
      const n = 1 + vnoise(vx + seed, vy + seed, vz + seed) * 0.22;
      pos.setX(i, vx * n);
      pos.setZ(i, vz * n);
      if (vy < 0) pos.setY(i, vy * (1 + Math.abs(vnoise(seed, vy, seed)) * 0.3));
    }
    geo.computeVertexNormals();
    return geo;
  }

  function grassCap(r, mat, seed) {
    const geo = new THREE.SphereGeometry(r, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2.4);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
      const n = 1 + vnoise(vx + seed * 2, vy, vz - seed) * 0.1;
      pos.setX(i, vx * n);
      pos.setZ(i, vz * n);
      pos.setY(i, vy * 0.5);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true;
    return m;
  }

  const islands = [];
  const crystals = [];

  function makeIsland(x, y, z, r, grassIdx, seed, decor) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const rock = new THREE.Mesh(organicRock(r, r * 1.15, seed), rockMat);
    rock.position.y = -r * 0.42;
    rock.castShadow = true;
    rock.receiveShadow = true;
    g.add(rock);
    const deep = new THREE.Mesh(organicRock(r * 0.4, r * 1.0, seed + 7), rockDeep);
    deep.position.y = -r * 1.05;
    g.add(deep);
    const cap = grassCap(r, grassMats[grassIdx % grassMats.length], seed);
    cap.position.y = -r * 0.06;
    g.add(cap);
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2;
      const vr = r * (0.72 + Math.random() * 0.16);
      const vine = new THREE.Mesh(
        new THREE.ConeGeometry(0.16 + Math.random() * 0.2, 1.4 + Math.random() * 2.6, 5),
        new THREE.MeshStandardMaterial({ color: 0x2e5e3a, roughness: 0.8 })
      );
      vine.position.set(Math.cos(a) * vr, -0.5 - Math.random() * 0.8, Math.sin(a) * vr);
      vine.rotation.x = Math.PI;
      g.add(vine);
    }
    if (decor) decor(g, r);
    scene.add(g);
    islands.push(g);
    return g;
  }

  /* vegetation registry (instanced after all islands are placed) */
  const treeSpots = [];
  function plantOn(group, cx, cz, r, count, kind) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = r * (0.35 + Math.random() * 0.45);
      treeSpots.push({
        x: group.position.x + cx + Math.cos(a) * d,
        y: group.position.y + 0.7,
        z: group.position.z + cz + Math.sin(a) * d,
        s: 1.0 + Math.random() * 0.6,
        type: kind,
      });
    }
  }

  const flowerGeo = new THREE.SphereGeometry(0.12, 6, 5);
  const flowerMats = [
    new THREE.MeshStandardMaterial({ color: 0xff8fb5, emissive: 0xff5f9e, emissiveIntensity: 0.35, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0xffe28a, emissive: 0xdfae4a, emissiveIntensity: 0.35, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0x9fd8ff, emissive: 0x4aa8e0, emissiveIntensity: 0.35, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xbfc9e8, emissiveIntensity: 0.3, roughness: 0.5 }),
  ];
  const tuftGeo = new THREE.ConeGeometry(0.16, 0.55, 5);
  const tuftMat = new THREE.MeshStandardMaterial({ color: 0x3f9a55, roughness: 0.8 });
  const mushStemGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.34, 6);
  const mushCapGeo = new THREE.SphereGeometry(0.16, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const mushMat = new THREE.MeshStandardMaterial({ color: 0x66e0d8, emissive: 0x2fb8c8, emissiveIntensity: 0.75, roughness: 0.4 });
  const mushStemMat = new THREE.MeshStandardMaterial({ color: 0xf2e6d8, roughness: 0.7 });

  function sprinkle(group, r, opts) {
    const { n, geoFn, mat, y0, sMin, sMax } = opts;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = r * (0.25 + Math.random() * 0.6);
      const m = new THREE.Mesh(geoFn, mat);
      m.position.set(Math.cos(a) * d, y0 + Math.random() * 0.25, Math.sin(a) * d);
      m.rotation.y = Math.random() * Math.PI * 2;
      m.scale.setScalar(sMin + Math.random() * (sMax - sMin));
      group.add(m);
    }
  }

  /* waterfall (texture-scroll plane + mist + pool) */
  const waterfallPlanes = [];
  function addWaterfall(g, x, y, z, w, h) {
    const tex = canvasTex(64, 256, (x2, w2, h2) => {
      x2.fillStyle = "rgba(190, 230, 250, 0.28)";
      x2.fillRect(0, 0, w2, h2);
      x2.strokeStyle = "rgba(255, 255, 255, 0.75)";
      for (let i = 0; i < 22; i++) {
        const lx = Math.random() * w2;
        x2.lineWidth = 1 + Math.random() * 1.6;
        x2.beginPath();
        x2.moveTo(lx, 0);
        x2.bezierCurveTo(lx + (Math.random() - 0.5) * 8, h2 * 0.4, lx + (Math.random() - 0.5) * 10, h2 * 0.7, lx + (Math.random() - 0.5) * 6, h2);
        x2.stroke();
      }
    });
    tex.wrapT = THREE.RepeatWrapping;
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      })
    );
    plane.position.set(x, y - h / 2, z);
    g.add(plane);
    waterfallPlanes.push({ tex, off: 0 });
    const mist = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: SPR.white, color: 0xeaf6ff, transparent: true, opacity: 0.4, depthWrite: false })
    );
    mist.position.set(x, y - h - 1.4, z);
    mist.scale.set(w * 2.4, w * 1.3, 1);
    g.add(mist);
    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(w * 0.85, 20),
      new THREE.MeshStandardMaterial({ color: 0x63c8e0, roughness: 0.15, metalness: 0.5, transparent: true, opacity: 0.9 })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(x, y - h + 0.12, z);
    g.add(pool);
  }

  /* rope bridge */
  function addBridge(a, b, sag) {
    const g = new THREE.Group();
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const mid = A.clone().add(B).multiplyScalar(0.5);
    mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
    const N = 14;
    for (let i = 0; i <= N; i++) {
      const p = curve.getPoint(i / N);
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.1, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.85 })
      );
      plank.position.copy(p);
      plank.lookAt(curve.getPoint(Math.min(1, i / N + 0.02)));
      plank.castShadow = true;
      g.add(plank);
      if (i % 3 === 0) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 1.1, 5),
          new THREE.MeshStandardMaterial({ color: 0x6e5344 })
        );
        post.position.set(p.x, p.y + 0.55, p.z);
        g.add(post);
      }
    }
    scene.add(g);
  }

  function addCrystal(g, x, y, z, s, hue) {
    const c = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.85 * s, 0),
      new THREE.MeshStandardMaterial({ color: hue, emissive: hue, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.2 })
    );
    c.position.set(x, y, z);
    c.userData = { p: Math.random() * Math.PI * 2, y0: y };
    g.add(c);
    crystals.push(c);
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

  function addTorii(g, x, z, s) {
    const mat = new THREE.MeshStandardMaterial({ color: 0xc4453c, roughness: 0.55 });
    const t = new THREE.Group();
    [
      [2.6, 0.28, 0.34, 0, 4.6, 0], [2.2, 0.2, 0.28, 0, 3.7, 0],
      [0.24, 1.5, 0.26, -1.5, 2.4, 0], [0.24, 1.5, 0.26, 1.5, 2.4, 0],
    ].forEach(([w, h, d, px, py, pz]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w * s, h * s, d * s), mat);
      m.position.set(px * s, py * s, pz);
      m.castShadow = true;
      t.add(m);
    });
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(5.4 * s, 0.07 * s, 0.36 * s),
      new THREE.MeshStandardMaterial({ color: 0x0e1220, roughness: 0.4 })
    );
    rim.position.set(0, 5.15 * s, 0);
    t.add(rim);
    t.position.set(x, 1.62, z);
    g.add(t);
  }

  /* ══════════════ THE ISLES ══════════════ */

  // hero isle — lush meadow, great tree with spirit lights, pond, twin falls, torii
  makeIsland(0, 7, 0, 15, 0, 3, (g, r) => {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.95, 5.4, 9),
      new THREE.MeshStandardMaterial({ color: 0x5e4630, roughness: 0.9 })
    );
    trunk.position.set(-4.4, 3.6, -2.2);
    trunk.castShadow = true;
    g.add(trunk);
    const leafMats = [0x4fae5c, 0x6cc470, 0x3f9a55];
    for (let i = 0; i < 6; i++) {
      const blob = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.5 + Math.random() * 1.1, 0),
        new THREE.MeshStandardMaterial({ color: leafMats[i % 3], roughness: 0.8, emissive: 0x1e4d30, emissiveIntensity: 0.3 })
      );
      blob.position.set(-4.4 + (Math.random() - 0.5) * 3.4, 6.2 + Math.random() * 2.2, -2.2 + (Math.random() - 0.5) * 3.2);
      blob.castShadow = true;
      g.add(blob);
    }
    // spirit lights among the branches
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: SPR.gold, color: 0xffe9a8, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      s.position.set(-4.4 + (Math.random() - 0.5) * 4, 5.6 + Math.random() * 2.6, -2.2 + (Math.random() - 0.5) * 3);
      s.scale.set(1.6, 1.6, 1);
      fairies.push({
        spr: s,
        cx: s.position.x, cy: s.position.y, cz: s.position.z,
        rx: 0.9, rz: 0.8, s1: 0.5 + Math.random() * 0.5, s2: 0.5 + Math.random() * 0.5,
        p1: Math.random() * Math.PI * 2, p2: Math.random() * Math.PI * 2,
        amp: 0.5, anchored: true,
      });
    }

    const pond = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 26),
      new THREE.MeshStandardMaterial({ color: 0x4fb8d8, roughness: 0.12, metalness: 0.55, transparent: true, opacity: 0.92 })
    );
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(8.6, 0.62, 1.2);
    pond.receiveShadow = true;
    g.add(pond);

    addWaterfall(g, 12.2, 0.9, 2.4, 2.4, 34);
    addWaterfall(g, 10.4, 0.9, 5.2, 2.4, 34);

    addTorii(g, 3.4, -3.4, 2.1);

    sprinkle(g, r, { n: 22, geoFn: flowerGeo, mat: flowerMats[0], y0: 0.95, sMin: 1.6, sMax: 2.8 });
    sprinkle(g, r, { n: 12, geoFn: flowerGeo, mat: flowerMats[1], y0: 0.95, sMin: 1.5, sMax: 2.6 });
    sprinkle(g, r, { n: 18, geoFn: tuftGeo, mat: tuftMat, y0: 0.95, sMin: 1.4, sMax: 2.4 });
    sprinkle(g, r, { n: 7, geoFn: mushStemGeo, mat: mushStemMat, y0: 0.98, sMin: 0.8, sMax: 1.3 });
    sprinkle(g, r, { n: 7, geoFn: mushCapGeo, mat: mushMat, y0: 1.18, sMin: 0.8, sMax: 1.3 });
    plantOn(g, -7.5, -5.5, 4.5, 3, "broad");
    plantOn(g, -8.5, -2, 3.5, 2, "pine");
    addCrystal(g, -1.5, 1.9, 4.6, 0.9, 0x67e8f9);
    addCrystal(g, 6.2, 2.6, -5.2, 0.75, 0xe879f9);
  });

  // observatory isle — lavender meadow + celestial rings
  makeIsland(-27, 12, -32, 9.5, 3, 11, (g) => {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 2.2, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xd8c8e8, roughness: 0.5 })
    );
    tower.position.y = 4;
    tower.castShadow = true;
    g.add(tower);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x9a7ad8, roughness: 0.3, metalness: 0.3 })
    );
    dome.position.y = 7;
    dome.castShadow = true;
    g.add(dome);
    const slit = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 2.8, 0.14),
      new THREE.MeshBasicMaterial({ color: 0xffd98a })
    );
    slit.position.y = 8.4;
    slit.rotation.z = 0.55;
    g.add(slit);
    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.05, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0.55 })
    );
    ringA.position.y = 9.6;
    ringA.rotation.x = Math.PI / 2.4;
    g.add(ringA);
    sprinkle(g, 9.5, { n: 18, geoFn: flowerGeo, mat: flowerMats[2], y0: 0.95, sMin: 0.8, sMax: 1.4 });
    sprinkle(g, 9.5, { n: 12, geoFn: tuftGeo, mat: tuftMat, y0: 0.95, sMin: 0.8, sMax: 1.5 });
    plantOn(g, 3.2, 2.2, 4.5, 3, "broad");
  });

  // archipelago — six varied mission islands
  const ARCH = [
    [12, 9, -52, 6.5, 1, 21], [21, 11.5, -60, 7, 2, 33], [30, 9, -68, 6, 0, 45],
    [39, 12, -75, 7, 3, 57], [47, 10, -85, 6, 1, 69], [54, 13, -96, 6.5, 2, 81],
  ];
  const beaconColors = [0xffd166, 0x67e8f9, 0xe879f9, 0xffd166, 0x67e8f9, 0xa78bfa];
  ARCH.forEach(([x, y, z, r, gi, seed], i) => {
    makeIsland(x, y, z, r, gi, seed, (g) => {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 12, 10),
        new THREE.MeshBasicMaterial({ color: beaconColors[i] })
      );
      orb.position.set(0, 2.8, 0);
      g.add(orb);
      const pillarTex = canvasTex(64, 256, (x2, w, h) => {
        const grad = x2.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.4, "rgba(255,255,255,0.8)");
        grad.addColorStop(1, "rgba(255,255,255,0.12)");
        x2.fillStyle = grad;
        x2.fillRect(0, 0, w, h);
      });
      const pillar = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: pillarTex, color: beaconColors[i], transparent: true, opacity: 0.45,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      pillar.position.set(0, 7.4, 0);
      pillar.scale.set(1.7, 10, 1);
      g.add(pillar);
      sprinkle(g, r, { n: 10, geoFn: flowerGeo, mat: flowerMats[i % 4], y0: 0.95, sMin: 0.7, sMax: 1.3 });
      sprinkle(g, r, { n: 10, geoFn: tuftGeo, mat: tuftMat, y0: 0.95, sMin: 0.7, sMax: 1.5 });
      if (i % 2 === 0) plantOn(g, 2.4, 0.6, r * 0.42, 2, "pine");
      else plantOn(g, -2.2, 0.8, r * 0.42, 2, "broad");
      addWaterfall(g, r * 0.78, 0.9, r * 0.3, 1.6, 22);
    });
  });

  for (let i = 0; i < ARCH.length - 1; i++) {
    const [x1, y1, z1] = ARCH[i], [x2, y2, z2] = ARCH[i + 1];
    addBridge([x1 + 2.2, y1 + 0.9, z1], [x2 - 2.2, y2 + 0.9, z2], 2.2);
  }

  // portal isle
  makeIsland(0, 12, -134, 9, 0, 91, (g) => {
    const portal = new THREE.Mesh(
      new THREE.TorusGeometry(3.8, 0.18, 14, 48),
      new THREE.MeshStandardMaterial({ color: 0x8b9cf5, emissive: 0x5b6cf5, emissiveIntensity: 0.85, roughness: 0.3, metalness: 0.4 })
    );
    portal.position.set(0, 5, 0);
    portal.castShadow = true;
    g.add(portal);
    const inner = new THREE.Mesh(
      new THREE.CircleGeometry(3.6, 32),
      new THREE.MeshBasicMaterial({ color: 0x9fb0ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    inner.position.set(0, 5, 0);
    g.add(inner);
    sprinkle(g, 9, { n: 16, geoFn: flowerGeo, mat: flowerMats[3], y0: 0.95, sMin: 0.7, sMax: 1.4 });
    sprinkle(g, 9, { n: 10, geoFn: tuftGeo, mat: tuftMat, y0: 0.95, sMin: 0.8, sMax: 1.5 });
    plantOn(g, -2.8, 1.6, 3.5, 3, "pine");
  });

  /* vegetation instancing */
  function buildVegetation() {
    const broad = treeSpots.filter((t) => t.type === "broad");
    const pines = treeSpots.filter((t) => t.type === "pine");

    const trunkIM = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.16, 0.26, 1.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x6e5344, roughness: 0.9 }),
      broad.length
    );
    const canopyIM = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1.15, 0),
      new THREE.MeshStandardMaterial({ roughness: 0.8, emissive: 0x123c22, emissiveIntensity: 0.25 }),
      broad.length * 2
    );
    const pineIM = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.8, 2.6, 7),
      new THREE.MeshStandardMaterial({ color: 0x2f7a4c, roughness: 0.8, emissive: 0x0f3c22, emissiveIntensity: 0.25 }),
      pines.length * 2
    );

    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const col = new THREE.Color();

    broad.forEach((t, i) => {
      q.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, 0));
      m4.compose(new THREE.Vector3(t.x, t.y + 0.7 * t.s, t.z), q, new THREE.Vector3(t.s, t.s, t.s));
      trunkIM.setMatrixAt(i, m4);
      trunkIM.castShadow = true;
      for (let k = 0; k < 2; k++) {
        q.setFromEuler(new THREE.Euler(Math.random(), Math.random() * Math.PI, Math.random()));
        m4.compose(
          new THREE.Vector3(t.x + (Math.random() - 0.5) * 0.9, t.y + (1.5 + k * 0.9) * t.s, t.z + (Math.random() - 0.5) * 0.9),
          q,
          new THREE.Vector3(t.s * (1.1 - k * 0.25), t.s * (0.9 - k * 0.2), t.s * (1.1 - k * 0.25))
        );
        canopyIM.setMatrixAt(i * 2 + k, m4);
        col.setHSL(0.3 + Math.random() * 0.08, 0.55, 0.3 + Math.random() * 0.14);
        canopyIM.setColorAt(i * 2 + k, col);
        canopyIM.castShadow = true;
      }
    });

    pines.forEach((t, i) => {
      for (let k = 0; k < 2; k++) {
        q.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, 0));
        m4.compose(
          new THREE.Vector3(t.x, t.y + (1.1 + k * 1.15) * t.s, t.z),
          q,
          new THREE.Vector3(t.s * (1 - k * 0.3), t.s, t.s * (1 - k * 0.3))
        );
        pineIM.setMatrixAt(i * 2 + k, m4);
        col.setHSL(0.34 + Math.random() * 0.05, 0.5, 0.32 + Math.random() * 0.14);
        pineIM.setColorAt(i * 2 + k, col);
        pineIM.castShadow = true;
      }
    });

    scene.add(trunkIM, canopyIM, pineIM);
  }
  buildVegetation();

  /* portal swirl */
  const SWIRL = MOBILE() ? 110 : 200;
  const swirlGeo = new THREE.BufferGeometry();
  const swirlData = [];
  {
    const arr = new Float32Array(SWIRL * 3);
    for (let i = 0; i < SWIRL; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 2.0;
      swirlData.push({ a, r, sp: 0.5 + Math.random() * 1.1, y: (Math.random() - 0.5) * 4.6 });
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = 5 + swirlData[i].y;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    swirlGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  }
  const swirl = new THREE.Points(
    swirlGeo,
    new THREE.PointsMaterial({
      color: 0xa5b8ff, map: SPR.cyan, size: 0.6, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })
  );
  swirl.position.set(0, 12, -134);
  scene.add(swirl);

  /* waterfall particles (hero falls) */
  const FALL = MOBILE() ? 110 : 200;
  const fallGeo = new THREE.BufferGeometry();
  const fallArr = new Float32Array(FALL * 3);
  const fallData = [];
  for (let i = 0; i < FALL; i++) {
    fallData.push({ x0: 12.2 + (Math.random() - 0.5) * 3.2, sp: 9 + Math.random() * 8, off: Math.random() * 36, z: 2.4 + (Math.random() - 0.5) * 2.8 });
    fallArr[i * 3] = fallData[i].x0;
    fallArr[i * 3 + 1] = 0.9 - Math.random() * 34;
    fallArr[i * 3 + 2] = fallData[i].z;
  }
  fallGeo.setAttribute("position", new THREE.BufferAttribute(fallArr, 3));
  const waterfall = new THREE.Points(
    fallGeo,
    new THREE.PointsMaterial({
      color: 0xd8f2ff, map: SPR.white, size: 0.7, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })
  );
  scene.add(waterfall);

  /* free-roaming fairies */
  const FAIRY_N = MOBILE() ? 10 : 22;
  for (let i = 0; i < FAIRY_N; i++) {
    const spr = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: [SPR.gold, SPR.cyan, SPR.pink][i % 3], transparent: true,
        opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    spr.position.set((Math.random() - 0.5) * 80, 8 + Math.random() * 10, -20 - Math.random() * 110);
    const sc = 1.5 + Math.random() * 1.1;
    spr.scale.set(sc, sc, 1);
    fairies.push({
      spr,
      cx: spr.position.x, cy: spr.position.y, cz: spr.position.z,
      rx: 2 + Math.random() * 4, rz: 2 + Math.random() * 4,
      s1: 0.3 + Math.random() * 0.5, s2: 0.3 + Math.random() * 0.5,
      p1: Math.random() * Math.PI * 2, p2: Math.random() * Math.PI * 2,
      amp: 1.2, anchored: false,
    });
  }

  /* butterflies */
  const butterflies = [];
  const wingGeo = new THREE.PlaneGeometry(0.55, 0.4);
  for (let i = 0; i < (MOBILE() ? 4 : 8); i++) {
    const b = new THREE.Group();
    const wMat = new THREE.MeshBasicMaterial({ color: [0xffb7d0, 0xffd98a, 0x9fd8ff][i % 3], side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
    const wl = new THREE.Mesh(wingGeo, wMat);
    const wr = new THREE.Mesh(wingGeo, wMat);
    wl.position.x = -0.26; wr.position.x = 0.26;
    b.add(wl, wr);
    b.userData = {
      orbit: { cx: (Math.random() - 0.5) * 40, cz: -6 - Math.random() * 90, r: 3 + Math.random() * 6, y: 10 + Math.random() * 6, sp: 0.25 + Math.random() * 0.3, p: Math.random() * Math.PI * 2 },
      wl, wr,
    };
    scene.add(b);
    butterflies.push(b);
  }

  /* drifting petals */
  const petalGeo = new THREE.PlaneGeometry(0.22, 0.3);
  const petals = [];
  for (let i = 0; i < (MOBILE() ? 14 : 30); i++) {
    const m = new THREE.Mesh(
      petalGeo,
      new THREE.MeshBasicMaterial({
        color: [0xffb7d0, 0xffe0ec, 0xffd98a][i % 3], side: THREE.DoubleSide, transparent: true, opacity: 0.85,
      })
    );
    m.position.set((Math.random() - 0.5) * 60, Math.random() * 26, (Math.random() - 0.5) * 60 + 5);
    m.userData = { sp: 0.6 + Math.random() * 0.8, sw: Math.random() * Math.PI * 2, rx: (Math.random() - 0.5) * 1.4, ry: (Math.random() - 0.5) * 1.4 };
    scene.add(m);
    petals.push(m);
  }

  /* ── camera flight path ─────────────────────────────────────── */

  const STATION_IDS = ["prologue", "file", "missions", "techniques", "summon"];
  const VIEWS = [
    { pos: [4, 13.5, 36], look: [-2, 7.5, 0] },
    { pos: [-15, 16, -14], look: [-27, 13, -32] },
    { pos: [4, 16, -36], look: [28, 11, -66] },
    { pos: [-4, 17, -92], look: [2, 30, -116] },
    { pos: [0, 16.5, -112], look: [0, 12.5, -134] },
  ];
  let stops = [];

  function computeStops() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const vh = window.innerHeight;
    stops = STATION_IDS.map((id, i) => {
      const el = document.getElementById(id);
      const p = Math.min(1, Math.max(0, (el.offsetTop - vh * 0.42) / max));
      return { p, pos: new THREE.Vector3(...VIEWS[i].pos), look: new THREE.Vector3(...VIEWS[i].look) };
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
    tmpPos.y += Math.sin(t * 0.5) * 0.22;
    tmpPos.x += Math.sin(t * 0.32) * 0.4;
  }

  /* ── interaction ────────────────────────────────────────────── */

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

  function spawnBurst(cx, cy) {
    raycaster.setFromCamera(new THREE.Vector2((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1), camera);
    const pt = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(26));
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: Math.random() < 0.55 ? SPR.gold : SPR.pink,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      s.position.copy(pt);
      s.scale.set(1.1, 1.1, 1);
      scene.add(s);
      bursts.push({
        mesh: s,
        v: new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, (Math.random() - 0.5) * 2),
        life: 1,
      });
    }
  }
  window.__fx = { burst: spawnBurst };

  window.addEventListener(
    "pointerdown",
    (e) => {
      if (e.target.closest("#site-nav, .cmdk-overlay, a, button, .panel")) return;
      spawnBurst(e.clientX, e.clientY);
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MOBILE() ? 1.5 : 2));
    computeStops();
  });

  /* ── main loop ──────────────────────────────────────────────── */

  const clock = new THREE.Clock();
  let curP = PARAMS.has("at") ? Math.min(1, Math.max(0, parseFloat(PARAMS.get("at")) / 4)) : 0;
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

    if (!stops.length) computeStops();
    cameraFor(curP, t);

    camera.position.x = tmpPos.x + mouse.x * 1.6;
    camera.position.y = tmpPos.y - mouse.y * 0.9;
    camera.position.z = tmpPos.z;
    camera.lookAt(tmpLook.x + mouse.x * 1.4, tmpLook.y - mouse.y * 0.7, tmpLook.z);

    // golden hour → magical twilight (gentle, stays colourful)
    const twi = Math.min(1, Math.max(0, (curP - 0.32) / 0.62));
    duskDome.material.opacity = twi * 0.8;
    starMat.opacity = 0.1 + twi * 0.55;
    moon.material.opacity = twi * 0.85;
    scene.fog.color.setRGB(lerp(0.66, 0.4, twi), lerp(0.5, 0.28, twi), lerp(0.38, 0.42, twi));
    sun.intensity = lerp(1.05, 0.85, twi);
    hemiLights.intensity = lerp(0.55, 0.42, twi);
    sunSprite.material.opacity = lerp(0.95, 0.55, twi);

    // living details
    crystals.forEach((c) => {
      c.position.y = c.userData.y0 + Math.sin(t * 1.2 + c.userData.p) * 0.26;
      c.rotation.y = t * 0.7 + c.userData.p;
    });

    swirl.rotation.y = t * 0.55;
    const sp = swirl.geometry.attributes.position.array;
    for (let i = 0; i < SWIRL; i++) {
      const d = swirlData[i];
      d.a += d.sp * dt;
      sp[i * 3] = Math.cos(d.a) * d.r;
      sp[i * 3 + 1] = 5 + d.y + Math.sin(t * 0.8 + i) * 0.2;
      sp[i * 3 + 2] = Math.sin(d.a) * d.r;
    }
    swirl.geometry.attributes.position.needsUpdate = true;

    const fa = fallGeo.attributes.position.array;
    for (let i = 0; i < FALL; i++) {
      const d = fallData[i];
      fa[i * 3 + 1] -= d.sp * dt;
      fa[i * 3] = d.x0 + Math.sin((fa[i * 3 + 1] + d.off) * 0.7) * 0.3;
      if (fa[i * 3 + 1] < -33) fa[i * 3 + 1] = 0.9;
    }
    fallGeo.attributes.position.needsUpdate = true;
    waterfallPlanes.forEach((w) => {
      w.off = (w.off + dt * 0.7) % 1;
      w.tex.offset.y = -w.off;
    });

    fairies.forEach((f) => {
      f.spr.position.x = f.cx + Math.sin(t * f.s1 + f.p1) * f.rx;
      f.spr.position.z = f.cz + Math.cos(t * f.s2 + f.p2) * f.rz;
      f.spr.position.y = (f.anchored ? f.cy : f.cy) + Math.sin(t * 1.1 + f.p1) * f.amp;
      f.spr.material.opacity = 0.75 + Math.sin(t * 2.6 + f.p1) * 0.25;
    });

    butterflies.forEach((b) => {
      const o = b.userData.orbit;
      const a = t * o.sp + o.p;
      b.position.set(o.cx + Math.cos(a) * o.r, o.y + Math.sin(a * 2.2) * 1.2, o.cz + Math.sin(a) * o.r);
      b.rotation.y = -a;
      const flap = Math.sin(t * 14 + o.p) * 0.9;
      b.userData.wl.rotation.y = flap;
      b.userData.wr.rotation.y = -flap;
    });

    petals.forEach((p) => {
      p.position.y -= p.userData.sp * dt;
      p.position.x += Math.sin(t * 0.9 + p.userData.sw) * 0.24;
      p.rotation.x += p.userData.rx * dt;
      p.rotation.y += p.userData.ry * dt;
      if (p.position.y < -4) {
        p.position.y = 24 + Math.random() * 8;
        p.position.x = (Math.random() - 0.5) * 60;
        p.position.z = (Math.random() - 0.5) * 50 + 8;
      }
    });

    clouds.forEach((c) => {
      c.position.x += c.userData.v * dt * 1.2;
      if (c.position.x > 170) c.position.x = -170;
      if (c.position.x < -170) c.position.x = 170;
    });

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.mesh.position.add(b.v.clone().multiplyScalar(dt));
      b.v.y -= dt * 2.6;
      b.life -= dt * 1.4;
      b.mesh.material.opacity = Math.max(0, b.life);
      b.mesh.scale.setScalar(1.1 * b.life + 0.3);
      if (b.life <= 0) {
        scene.remove(b.mesh);
        bursts.splice(i, 1);
      }
    }

    renderer.render(scene, camera);

    frame++;
    if (STATIC) {
      if (frame < 110) requestAnimationFrame(tick);
      return;
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MOBILE() ? 1.5 : 2));
    computeStops();
  });
  computeStops();
  tick();
})();
