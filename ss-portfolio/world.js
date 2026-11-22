/* ═══════════════════════════════════════════════════════════════════════
   THE LANTERN SEA — world.js
   A procedural night ocean: one lighthouse, a fleet of lanterns,
   a star chart and a gate. Built on Three.js r132, zero downloaded
   assets — every surface is generated at runtime.

   Design notes
   · No PBR, no lights, no tone mapping. Every material is unlit or a
     hand-written shader, so the whole image is colour-directed by hand
     and nothing can blow out.
   · No shadows. Depth is carried by fog, silhouette and emissive falloff.
   · One continuous camera curve, driven by scroll, eased in app space.
   ═══════════════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const canvas = document.getElementById("world");
  if (!canvas || !window.THREE) {
    document.documentElement.classList.add("no-world");
    return;
  }

  const T = window.THREE;
  const params = new URLSearchParams(location.search);

  // deterministic scatter: the same sky on every load (and in screenshots)
  let seed = 20261122;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const REDUCED =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    params.has("static");
  const MOBILE =
    window.matchMedia("(max-width: 860px)").matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  const smoothstep = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  /* ── renderer ─────────────────────────────────────────────────────── */

  let renderer;
  try {
    renderer = new T.WebGLRenderer({
      canvas,
      antialias: !MOBILE,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!renderer.getContext()) throw new Error("no context");
  } catch (err) {
    document.documentElement.classList.add("no-world");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x04070f, 1);

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0x08131c, 0.004);
  const camera = new T.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.1,
    6000
  );
  const clock = new T.Clock();

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    document.documentElement.classList.add("no-world");
  });

  /* ── palette ──────────────────────────────────────────────────────── */

  const C = {
    abyss: 0x04070f,
    deep: 0x07121a,
    sea: 0x0b2b36,
    seaFar: 0x081820,
    fog: 0x08131c,
    gold: 0xf3b673,
    amber: 0xe08a4e,
    goldHot: 0xffd9a3,
    cyan: 0x86dbe8,
    teal: 0x2f7d8c,
    pale: 0xd6e4ea,
  };

  const moonDir = new T.Vector3(0.55, 0.5, -0.67).normalize();
  const gateDir = new T.Vector3(0.1, 0.12, -1).normalize();

  // shared handle so builders can stash materials for the frame loop
  const world = { starMat: null, beamMat: null, gateMat: null };

  /* ── shared textures ──────────────────────────────────────────────── */

  function glowTexture(stops) {
    const size = 128;
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const ctx = cv.getContext("2d");
    const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([at, colour]) => grd.addColorStop(at, colour));
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    const tex = new T.CanvasTexture(cv);
    tex.needsUpdate = true;
    return tex;
  }

  const TEX_GLOW = glowTexture([
    [0, "rgba(255,255,255,1)"],
    [0.18, "rgba(255,255,255,0.55)"],
    [0.45, "rgba(255,255,255,0.14)"],
    [1, "rgba(255,255,255,0)"],
  ]);

  const TEX_SOFT = glowTexture([
    [0, "rgba(255,255,255,0.85)"],
    [0.5, "rgba(255,255,255,0.18)"],
    [1, "rgba(255,255,255,0)"],
  ]);

  function sprite(colour, scale, tex = TEX_GLOW, opacity = 1) {
    const mat = new T.SpriteMaterial({
      map: tex,
      color: colour,
      transparent: true,
      opacity,
      blending: T.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      fog: false,
    });
    const s = new T.Sprite(mat);
    s.scale.setScalar(scale);
    return s;
  }

  /* ── sky ──────────────────────────────────────────────────────────── */

  const skyUniforms = {
    uZenith: { value: new T.Color(0x03060d) },
    uHorizon: { value: new T.Color(0x123039) },
    uFog: { value: new T.Color(C.fog) },
    uMoonDir: { value: moonDir },
    uMoonColor: { value: new T.Color(0xdbe8f2) },
    uGlowDir: { value: gateDir },
    uGlowColor: { value: new T.Color(C.cyan) },
    uTime: { value: 0 },
  };

  const sky = new T.Mesh(
    new T.SphereGeometry(2200, 48, 32),
    new T.ShaderMaterial({
      uniforms: skyUniforms,
      side: T.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uZenith, uHorizon, uFog, uMoonDir, uMoonColor, uGlowDir, uGlowColor;
        uniform float uTime;
        varying vec3 vDir;

        void main() {
          vec3 d = normalize(vDir);
          float h = clamp(d.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uZenith, pow(h, 0.55));

          // below the waterline the dome fades into the sea fog
          col = mix(col, uFog, smoothstep(0.05, -0.04, d.y));

          // moon: a hard disc, a tight halo, a broad breath
          float md = max(dot(d, normalize(uMoonDir)), 0.0);
          col += uMoonColor * pow(md, 1500.0) * 1.55;
          col += uMoonColor * pow(md, 55.0) * (0.09 + 0.03 * sin(uTime * 0.4));
          col += uMoonColor * pow(md, 6.0) * 0.03;

          // a faint cold glow where the gate sits on the horizon
          float gd = max(dot(d, normalize(uGlowDir)), 0.0);
          col += uGlowColor * pow(gd, 120.0) * 0.2;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  );
  sky.frustumCulled = false;
  scene.add(sky);

  /* ── stars ────────────────────────────────────────────────────────── */

  (function buildStars() {
    const count = MOBILE ? 1500 : 3200;
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const tint = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = rnd() * Math.PI * 2;
      const phi = Math.acos(1 - rnd() * 0.94); // upper hemisphere, denser overhead
      const r = 1750;
      const y = Math.cos(phi);
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = y * r * 0.92 + 20;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      const bright = Math.pow(rnd(), 2.6);
      size[i] = 0.9 + bright * 3.1;
      phase[i] = rnd() * Math.PI * 2;
      tint[i] = rnd();
    }

    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new T.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new T.BufferAttribute(phase, 1));
    geo.setAttribute("aTint", new T.BufferAttribute(tint, 1));

    const mat = new T.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDpr: { value: renderer.getPixelRatio() },
        uOpacity: { value: 1 },
      },
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      fog: false,
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        attribute float aTint;
        uniform float uTime;
        uniform float uDpr;
        varying float vA;
        varying float vT;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uDpr;
          vA = 0.5 + 0.5 * sin(uTime * 0.55 + aPhase);
          vT = aTint;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vA;
        varying float vT;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.02, d);
          a *= a;
          vec3 cool = vec3(0.80, 0.89, 0.94);
          vec3 warm = vec3(0.98, 0.82, 0.62);
          vec3 cyan = vec3(0.62, 0.86, 0.92);
          vec3 c = mix(cool, mix(warm, cyan, vT), 0.45);
          gl_FragColor = vec4(c, a * (0.35 + 0.65 * vA) * uOpacity);
        }
      `,
    });

    const stars = new T.Points(geo, mat);
    stars.frustumCulled = false;
    scene.add(stars);
    world.starMat = mat;
  })();

  /* ── the sea ──────────────────────────────────────────────────────── */

  const seaUniforms = {
    uTime: { value: 0 },
    uCam: { value: new T.Vector3() },
    uDeep: { value: new T.Color(0x061620) },
    uShallow: { value: new T.Color(0x11414f) },
    uSky: { value: new T.Color(0x123540) },
    uMoonDir: { value: moonDir },
    uMoonCol: { value: new T.Color(0xffd7a8) },
    uFogCol: { value: new T.Color(C.fog) },
    uFogDen: { value: 0.0042 },
  };

  const sea = new T.Mesh(
    new T.PlaneGeometry(3600, 3600, MOBILE ? 90 : 170, MOBILE ? 90 : 170),
    new T.ShaderMaterial({
      uniforms: seaUniforms,
      fog: false,
      vertexShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vWorld;
        varying vec3 vN;

        float heightAt(vec2 p, out vec2 grad) {
          grad = vec2(0.0);
          float y = 0.0;

          vec2 d1 = normalize(vec2(1.0, 0.38));
          float ph1 = dot(p, d1) * 0.042 + uTime * 0.55;
          y += 0.50 * sin(ph1);
          grad += 0.50 * cos(ph1) * 0.042 * d1;

          vec2 d2 = normalize(vec2(-0.55, 1.0));
          float ph2 = dot(p, d2) * 0.075 + uTime * 0.82;
          y += 0.26 * sin(ph2);
          grad += 0.26 * cos(ph2) * 0.075 * d2;

          vec2 d3 = normalize(vec2(0.3, -1.0));
          float ph3 = dot(p, d3) * 0.165 + uTime * 1.35;
          y += 0.10 * sin(ph3);
          grad += 0.10 * cos(ph3) * 0.165 * d3;

          vec2 d4 = normalize(vec2(1.0, -0.2));
          float ph4 = dot(p, d4) * 0.36 + uTime * 2.1;
          y += 0.035 * sin(ph4);
          grad += 0.035 * cos(ph4) * 0.36 * d4;

          return y;
        }

        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vec2 p = wp.xz;
          vec2 g;
          float y = heightAt(p, g);
          wp.y += y;
          vWorld = wp.xyz;
          vN = normalize(vec3(-g.x, 1.0, -g.y));
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uCam, uDeep, uShallow, uSky, uMoonDir, uMoonCol, uFogCol;
        uniform float uFogDen, uTime;
        varying vec3 vWorld;
        varying vec3 vN;

        void main() {
          vec3 V = normalize(uCam - vWorld);

          // fine ripple detail, independent of the mesh resolution
          vec2 q = vWorld.xz;
          float r1 = sin(q.x * 0.85 + uTime * 1.6) * cos(q.y * 0.63 - uTime * 1.1);
          float r2 = sin(q.x * 2.10 - uTime * 2.3) * cos(q.y * 1.75 + uTime * 1.9);
          float r3 = sin(q.x * 4.40 + uTime * 3.1) * cos(q.y * 3.90 - uTime * 2.7);
          vec3 N = normalize(normalize(vN) + vec3(r1 * 0.07 + r2 * 0.05, 0.0, r2 * 0.07 + r3 * 0.04));

          float up = clamp(N.y, 0.0, 1.0);
          float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

          vec3 base = mix(uDeep, uShallow, smoothstep(0.55, 1.0, up));
          vec3 col = mix(base, uSky, fres * 0.9);

          vec3 R = reflect(-V, N);
          vec3 L = normalize(uMoonDir);

          // a broken glitter path, not a solid pool
          float facing = max(dot(R, L), 0.0);
          float glint = pow(facing, 22.0);
          float sparkle = pow(facing, 300.0);
          float shimmer = 0.55 + 0.45 * sin(q.x * 3.1 + uTime * 2.2) * sin(q.y * 2.7 - uTime * 1.7);
          col += uMoonCol * (glint * 0.10 * shimmer + sparkle * 0.55);

          // a cold sheen from the gate side of the sky
          col += vec3(0.10, 0.34, 0.40) * pow(max(R.y, 0.0), 5.0) * 0.55;

          float d = length(uCam - vWorld);
          float f = 1.0 - exp(-pow(d * uFogDen, 2.0));
          col = mix(col, uFogCol, clamp(f, 0.0, 1.0));

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.frustumCulled = false;
  scene.add(sea);

  /* ── light streaks on the water ───────────────────────────────────── */

  const streakUniforms = [];
  function streak(width, length, colour, opacity, y = 0.08) {
    const uniforms = {
      uTime: { value: 0 },
      uColor: { value: new T.Color(colour) },
      uOpacity: { value: opacity },
    };
    streakUniforms.push(uniforms);
    const mat = new T.ShaderMaterial({
      uniforms,
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false,
      fog: false,
      side: T.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime, uOpacity;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float across = smoothstep(0.5, 0.0, abs(vUv.x - 0.5) * 2.0);
          across = pow(across, 2.2);
          float along = smoothstep(0.0, 0.18, vUv.y) * pow(1.0 - vUv.y, 1.6);
          float ripple = 0.62 + 0.38 * sin(vUv.y * 46.0 + uTime * 1.6);
          float a = across * along * ripple * uOpacity;
          gl_FragColor = vec4(uColor, a);
        }
      `,
    });
    const m = new T.Mesh(new T.PlaneGeometry(width, length), mat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = Math.PI; // bright end nearest the light
    m.position.y = y;
    scene.add(m);
    return m;
  }

  /* ── the beacon ───────────────────────────────────────────────────── */

  const BEACON = { x: -26, z: -150, h: 40 };
  const beamGroup = new T.Group();

  (function buildBeacon() {
    const g = new T.Group();
    g.position.set(BEACON.x, 0, BEACON.z);

    const dark = new T.MeshBasicMaterial({ color: 0x081720 });
    const darker = new T.MeshBasicMaterial({ color: 0x050f16 });

    // the rock it stands on
    const rockGeo = new T.CylinderGeometry(9.5, 13.5, 7, 14, 1);
    const rock = new T.Mesh(rockGeo, darker);
    rock.position.y = -0.6;
    g.add(rock);

    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + 0.3;
      const r = 8.6 + rnd() * 3.4;
      const shard = new T.Mesh(
        new T.ConeGeometry(1.2 + rnd() * 1.8, 3 + rnd() * 6, 5),
        dark
      );
      shard.position.set(Math.cos(a) * r, 1 + rnd() * 1.4, Math.sin(a) * r);
      shard.rotation.y = rnd() * Math.PI;
      shard.rotation.z = (rnd() - 0.5) * 0.22;
      g.add(shard);
    }

    // tower
    const tower = new T.Mesh(
      new T.CylinderGeometry(3.0, 4.5, 33, 30, 1, true),
      new T.MeshBasicMaterial({ color: 0x0b1e26, side: T.DoubleSide })
    );
    tower.position.y = 19.5;
    g.add(tower);

    // ribs
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rib = new T.Mesh(new T.BoxGeometry(0.16, 33, 0.16), dark);
      rib.position.set(Math.cos(a) * 3.75, 19.5, Math.sin(a) * 3.75);
      g.add(rib);
    }

    // three warm window slits, low on the tower — they flicker softly
    const winMats = [];
    for (let i = 0; i < 3; i++) {
      const wMat = new T.MeshBasicMaterial({ color: 0xffc98a, transparent: true, opacity: 0.55 });
      winMats.push({ m: wMat, p: i * 1.7 });
      const w = new T.Mesh(
        new T.PlaneGeometry(0.5, 2.6),
        wMat
      );
      const a = 0.7 + i * 0.35;
      w.position.set(Math.cos(a) * 4.1, 9 + i * 4.5, Math.sin(a) * 4.1);
      w.rotation.y = -a + Math.PI / 2;
      g.add(w);
    }

    // lantern room
    const room = new T.Mesh(
      new T.CylinderGeometry(3.5, 3.5, 5.4, 24, 1, true),
      new T.MeshBasicMaterial({
        color: 0x2a6f7c,
        transparent: true,
        opacity: 0.4,
        side: T.DoubleSide,
      })
    );
    room.position.y = 38.4;
    g.add(room);

    const roomTop = new T.Mesh(new T.CylinderGeometry(3.9, 3.9, 0.35, 24), dark);
    roomTop.position.y = 41.2;
    g.add(roomTop);

    const roof = new T.Mesh(new T.ConeGeometry(4.4, 4.6, 24), darker);
    roof.position.y = 43.6;
    g.add(roof);

    const finial = new T.Mesh(new T.SphereGeometry(0.42, 10, 8), new T.MeshBasicMaterial({ color: 0xffd9a3 }));
    finial.position.y = 46.1;
    g.add(finial);

    // the light itself
    const core = new T.Mesh(
      new T.SphereGeometry(1.35, 18, 14),
      new T.MeshBasicMaterial({ color: 0xfff0d2 })
    );
    core.position.y = 38.4;
    g.add(core);

    const halo = sprite(0xffcf94, 26, TEX_GLOW, 0.85);
    halo.position.y = 38.4;
    g.add(halo);

    const spill = sprite(0xffb066, 60, TEX_SOFT, 0.32);
    spill.position.y = 38.4;
    g.add(spill);

    const foot = sprite(0x6fd6e6, 30, TEX_SOFT, 0.16);
    foot.position.y = 1.2;
    g.add(foot);

    // beams — crossed additive cones, apex at the lantern
    const beamGeo = new T.ConeGeometry(55, 320, 40, 1, true);
    beamGeo.translate(0, 160, 0); // apex at origin
    beamGeo.rotateX(-Math.PI / 2); // axis along +Z

    const beamMat = new T.ShaderMaterial({
      uniforms: {
        uColor: { value: new T.Color(0xffd2a0) },
        uIntensity: { value: 0.95 },
        uLen: { value: 320 },
        uTime: { value: 0 },
      },
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uIntensity, uLen, uTime;
        varying vec3 vPos;
        void main() {
          float t = clamp(vPos.z / uLen, 0.0, 1.0);
          float body = smoothstep(0.0, 0.26, t) * pow(1.0 - t, 1.25);
          float breathe = 0.85 + 0.15 * sin(uTime * 1.3);
          gl_FragColor = vec4(uColor, body * uIntensity * breathe);
        }
      `,
    });

    beamGroup.position.set(BEACON.x, 38.4, BEACON.z);
    beamGroup.rotation.set(-0.05, 1.45, 0); // opening pose: sweeping across the frame
    const b1 = new T.Mesh(beamGeo, beamMat);
    const b2 = new T.Mesh(beamGeo, beamMat);
    b2.rotation.z = Math.PI / 2;
    const b3 = new T.Mesh(beamGeo, beamMat.clone());
    b3.material.uniforms.uIntensity.value = 0.18;
    b3.rotation.z = Math.PI / 4;

    // a hot core inside the wide cone, so the beam has a spine
    const coreGeo = new T.ConeGeometry(11, 320, 24, 1, true);
    coreGeo.translate(0, 160, 0);
    coreGeo.rotateX(-Math.PI / 2);
    const coreMat = beamMat.clone();
    coreMat.uniforms.uIntensity.value = 0.5;
    const b4 = new T.Mesh(coreGeo, coreMat);
    const b5 = new T.Mesh(coreGeo, coreMat);
    b5.rotation.z = Math.PI / 2;

    beamGroup.add(b1, b2, b3, b4, b5);
    scene.add(beamGroup);
    world.beamMat = beamMat;

    world.winMats = winMats;
    scene.add(g);

    // the beacon's reflection on the water
    const s = streak(26, 210, 0xffc78a, 0.34);
    s.position.set(BEACON.x, 0.09, BEACON.z + 105);
  })();

  /* ── the fleet ────────────────────────────────────────────────────── */

  const FLEET = [
    { id: "w2s", name: "web2skill", berth: "01", colour: 0xffc27a, pos: [26, -236], scale: 1.0 },
    { id: "pi", name: "pi context", berth: "02", colour: 0x8fe0ea, pos: [52, -250], scale: 0.92 },
    { id: "dna", name: "dna spec", berth: "03", colour: 0xffd9a3, pos: [78, -266], scale: 0.86 },
    { id: "genui", name: "genui", berth: "04", colour: 0x9be3d6, pos: [40, -284], scale: 0.95 },
    { id: "auto", name: "auto-breakthrough", berth: "05", colour: 0xf0a86a, pos: [66, -298], scale: 0.9 },
    { id: "anime", name: "my anime shelf", berth: "06", colour: 0xffcf94, pos: [32, -310], scale: 1.05 },
  ];

  const lanterns = [];

  (function buildFleet() {
    const hullMat = new T.MeshBasicMaterial({ color: 0x061118 });

    FLEET.forEach((f) => {
      const g = new T.Group();
      g.position.set(f.pos[0], 0, f.pos[1]);

      // a paper lantern floating on the water
      const base = new T.Mesh(new T.BoxGeometry(1.3, 0.16, 1.3), hullMat);
      base.position.y = 0.1;
      g.add(base);

      const body = new T.Mesh(
        new T.BoxGeometry(0.95, 1.05, 0.95),
        new T.MeshBasicMaterial({
          color: f.colour,
          transparent: true,
          opacity: 0.62,
          blending: T.AdditiveBlending,
          depthWrite: false,
        })
      );
      body.position.y = 0.75;
      g.add(body);

      const roof = new T.Mesh(new T.ConeGeometry(0.86, 0.52, 4), hullMat);
      roof.position.y = 1.5;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);

      const light = sprite(f.colour, 4.2 * f.scale, TEX_GLOW, 0.9);
      light.position.set(0, 0.9, 0);
      light.userData = { id: f.id, name: f.name };
      g.add(light);

      const core = sprite(0xfff2dd, 1.1 * f.scale, TEX_GLOW, 0.9);
      core.position.copy(light.position);
      g.add(core);

      const halo = sprite(f.colour, 11 * f.scale, TEX_SOFT, 0.2);
      halo.position.copy(light.position);
      g.add(halo);

      const s = streak(6 * f.scale, 42 * f.scale, f.colour, 0.24);
      s.position.set(f.pos[0], 0.075, f.pos[1] + 20 * f.scale);
      var streakMat = s.material, streakBase = 0.24;

      scene.add(g);
      lanterns.push({ group: g, light, halo, base: 3.9, phase: rnd() * Math.PI * 2, id: f.id, data: f, streakMat, streakBase });
    });

    // distant lights, no geometry — pure depth
    const count = MOBILE ? 60 : 120;
    for (let i = 0; i < count; i++) {
      const angle = rnd() * Math.PI * 2;
      const dist = 120 + rnd() * 620;
      let x = Math.cos(angle) * dist;
      const z = -Math.abs(Math.sin(angle) * dist) - 40;
      // keep the near water in front of the panels clear of big foreground lights
      if (dist < 330 && Math.abs(x) < 140) x = (x < 0 ? -1 : 1) * (140 + rnd() * 90);
      const warm = rnd() > 0.28;
      const s = sprite(warm ? 0xffb877 : 0x7fd0dd, 1.4 + rnd() * 3.4, TEX_GLOW, 0.5 + rnd() * 0.4);
      s.position.set(x, 0.9 + rnd() * 0.8, z);
      scene.add(s);
    }
  })();

  /* ── the star chart ───────────────────────────────────────────────── */

  const CONSTELLATIONS = [
    {
      name: "languages",
      colour: 0x8fe0ea,
      origin: [-24, 172, -350],
      stars: [
        [0, 0], [16, 9], [30, 4], [44, 14], [56, 2], [42, -10], [24, -8], [10, -12], [0, 0],
      ],
    },
    {
      name: "web",
      colour: 0xffd9a3,
      origin: [56, 148, -366],
      stars: [
        [0, 0], [12, 14], [26, 10], [36, 20], [50, 12], [46, -2], [28, -4], [14, -8], [0, 0],
      ],
    },
    {
      name: "data",
      colour: 0x9be3d6,
      origin: [132, 190, -384],
      stars: [
        [0, 0], [14, -6], [28, 2], [40, -8], [52, 4], [38, 16], [20, 12], [0, 0],
      ],
    },
    {
      name: "agents",
      colour: 0xf0a86a,
      origin: [-92, 128, -338],
      stars: [
        [0, 0], [12, 10], [26, 6], [34, 18], [48, 14], [42, 0], [24, -6], [0, 0],
      ],
    },
  ];

  const chartParts = []; // constellation materials, faded in at station 03
  const chartGroups = [];

  (function buildConstellations() {
    CONSTELLATIONS.forEach((c) => {
      const g = new T.Group();
      g.position.set(c.origin[0], c.origin[1], c.origin[2]);
      g.rotation.z = (rnd() - 0.5) * 0.12;

      const pts = [];
      c.stars.forEach(([x, y]) => pts.push(new T.Vector3(x, y, 0)));

      const lineGeo = new T.BufferGeometry().setFromPoints(pts);
      const lineMat = new T.LineBasicMaterial({
        color: c.colour,
        transparent: true,
        opacity: 0.22,
        blending: T.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      chartParts.push({ m: lineMat, base: 0.22 });
      g.add(new T.Line(lineGeo, lineMat));

      // a node light at each vertex
      const nodeGeo = new T.BufferGeometry().setFromPoints(pts.slice(0, -1));
      const nodeMat = new T.PointsMaterial({
        color: c.colour,
        size: 2.4,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.95,
        blending: T.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      chartParts.push({ m: nodeMat, base: 0.95 });
      g.add(new T.Points(nodeGeo, nodeMat));

      // soft bloom on the anchor stars
      pts.slice(0, 3).forEach((p, i) => {
        const s = sprite(c.colour, 16 - i * 4, TEX_SOFT, 0.16);
        s.position.copy(p);
        chartParts.push({ m: s.material, base: 0.16 });
        g.add(s);
      });

      scene.add(g);
    });
  })();

  /* ── the gate ─────────────────────────────────────────────────────── */

  const GATE = { x: 40, y: 40, z: -540, r: 34 };
  const gateParts = []; // { u } for uniforms or { m } for materials, plus a base value

  (function buildGate() {
    const g = new T.Group();
    g.position.set(GATE.x, GATE.y, GATE.z);

    const ringMat = new T.MeshBasicMaterial({ color: 0x9fe6f0, transparent: true, opacity: 0 });
    gateParts.push({ m: ringMat, base: 1 });
    const ring = new T.Mesh(new T.TorusGeometry(GATE.r, 1.0, 8, 120), ringMat);
    g.add(ring);

    const ring2Mat = new T.MeshBasicMaterial({ color: 0x6fc6d4, transparent: true, opacity: 0 });
    gateParts.push({ m: ring2Mat, base: 0.55 });
    const ringInner = new T.Mesh(new T.TorusGeometry(GATE.r - 3.4, 0.32, 6, 120), ring2Mat);
    g.add(ringInner);
    world.gateRingInner = ringInner;

    const ring3Mat = new T.MeshBasicMaterial({ color: 0x6fc6d4, transparent: true, opacity: 0 });
    gateParts.push({ m: ring3Mat, base: 0.3 });
    const ringOuter = new T.Mesh(new T.TorusGeometry(GATE.r + 5.2, 0.14, 6, 120), ring3Mat);
    g.add(ringOuter);
    world.gateRingOuter = ringOuter;

    // the surface of the gate
    const discMat = new T.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFade: { value: 0 },
        uColorA: { value: new T.Color(0x0a2b34) },
        uColorB: { value: new T.Color(0x9fe6f0) },
      },
      transparent: true,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uFade;
        uniform vec3 uColorA, uColorB;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv - 0.5;
          float r = length(p) * 2.0;
          float rings = 0.5 + 0.5 * sin(r * 26.0 - uTime * 1.4);
          float body = smoothstep(1.0, 0.05, r);
          float core = smoothstep(0.75, 0.0, r);
          vec3 col = mix(uColorA, uColorB, core * 0.85 + rings * 0.12);
          float a = body * (0.16 + core * 0.34 + rings * 0.05);
          gl_FragColor = vec4(col, a * uFade);
        }
      `,
    });
    const disc = new T.Mesh(new T.CircleGeometry(GATE.r - 1, 96), discMat);
    g.add(disc);
    world.gateMat = discMat;
    gateParts.push({ u: discMat.uniforms.uFade, base: 1 });

    const glow = sprite(0x9fe6f0, GATE.r * 2.6, TEX_SOFT, 0);
    gateParts.push({ m: glow.material, base: 0.14 });
    g.add(glow);

    // a faint shaft rising from the water
    const shaftMat = new T.ShaderMaterial({
      uniforms: { uColor: { value: new T.Color(0x6fc6d4) }, uOpacity: { value: 0 } },
      transparent: true,
      blending: T.AdditiveBlending,
      depthWrite: false,
      side: T.DoubleSide,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float across = smoothstep(0.5, 0.0, abs(vUv.x - 0.5) * 2.0);
          float up = pow(1.0 - vUv.y, 1.4);
          gl_FragColor = vec4(uColor, across * up * uOpacity);
        }
      `,
    });
    const shaft = new T.Mesh(new T.PlaneGeometry(30, 70), shaftMat);
    shaft.position.y = -GATE.y + 34;
    g.add(shaft);
    gateParts.push({ u: shaftMat.uniforms.uOpacity, base: 0.14 });

    scene.add(g);

    const s = streak(34, 190, 0x9fe6f0, 0);
    s.position.set(GATE.x, 0.085, GATE.z + 95);
    gateParts.push({ u: s.material.uniforms.uOpacity, base: 0.22 });
  })();

  /* ── night clouds — slow silhouettes drifting through the moon glow ── */

  const nightClouds = [];
  (function buildNightClouds() {
    // self-contained: this build must not depend on helpers defined later
    const tex = (() => {
      const cv = document.createElement("canvas");
      const w = 256, h = 128;
      cv.width = w; cv.height = h;
      const x = cv.getContext("2d");
      for (let i = 0; i < 12; i++) {
        const cx = 30 + Math.random() * (w - 60);
        const cy = 40 + Math.random() * (h - 80);
        const rr = 20 + Math.random() * 42;
        const grad = x.createRadialGradient(cx, cy, 0, cx, cy, rr);
        grad.addColorStop(0, "rgba(10, 22, 30, 0.9)");
        grad.addColorStop(0.6, "rgba(12, 26, 36, 0.5)");
        grad.addColorStop(1, "rgba(12, 26, 36, 0)");
        x.fillStyle = grad;
        x.beginPath();
        x.arc(cx, cy, rr, 0, Math.PI * 2);
        x.fill();
      }
      const t = new T.CanvasTexture(cv);
      t.needsUpdate = true;
      return t;
    })();
    const N = MOBILE ? 7 : 14;
    for (let i = 0; i < N; i++) {
      const c = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, color: 0x2a4450, transparent: true, opacity: 0.5, depthWrite: false, fog: false })
      );
      // cluster along the moon / gate side of the sky, far away
      const a = -0.2 - Math.random() * 0.9;
      const dist = 620 + Math.random() * 320;
      c.position.set(Math.sin(a) * dist * 0.6, 120 + Math.random() * 160, -Math.abs(Math.cos(a)) * dist);
      const sc = 220 + Math.random() * 260;
      c.scale.set(sc, sc * 0.36, 1);
      c.userData = { v: 6 + Math.random() * 10 };
      scene.add(c);
      nightClouds.push(c);
    }
  })();

  /* ── drifting motes ───────────────────────────────────────────────── */

  const moteMat = new T.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uDpr: { value: renderer.getPixelRatio() } },
    transparent: true,
    blending: T.AdditiveBlending,
    depthWrite: false,
    fog: false,
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uDpr;
      varying float vA;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.22 + aPhase) * 1.8;
        p.x += cos(uTime * 0.16 + aPhase * 1.7) * 2.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uDpr * (220.0 / max(-mv.z, 1.0));
        vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 0.9 + aPhase));
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(0.95, 0.86, 0.72, a * vA * 0.5);
      }
    `,
  });

  (function buildMotes() {
    const count = MOBILE ? 90 : 220;
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 200;
      pos[i * 3 + 1] = 1 + rnd() * 26;
      pos[i * 3 + 2] = 60 - rnd() * 500;
      size[i] = 1 + rnd() * 2.6;
      phase[i] = rnd() * Math.PI * 2;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new T.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new T.BufferAttribute(phase, 1));
    const pts = new T.Points(geo, moteMat);
    pts.frustumCulled = false;
    scene.add(pts);
  })();

  /* ── camera path ──────────────────────────────────────────────────── */

  const STOPS = [
    { p: new T.Vector3(0, 4.8, 82), l: new T.Vector3(-45, 9, -30) },
    { p: new T.Vector3(-4, 8.6, -56), l: new T.Vector3(14, 26, -150) },
    { p: new T.Vector3(2, 11.0, -150), l: new T.Vector3(2, 6, -238) },
    { p: new T.Vector3(0, 9.0, -240), l: new T.Vector3(130, 130, -330) },
    { p: new T.Vector3(0, 7.0, -368), l: new T.Vector3(-25, 34, -540) },
  ];

  const posCurve = new T.CatmullRomCurve3(STOPS.map((s) => s.p), false, "catmullrom", 0.4);
  const lookCurve = new T.CatmullRomCurve3(STOPS.map((s) => s.l), false, "catmullrom", 0.4);

  // per-station atmosphere: fog density + sky tint
  const ATMOS = [
    { den: 0.0036, horizon: 0x14323c, zenith: 0x04070f },
    { den: 0.0052, horizon: 0x0f2a34, zenith: 0x03060d },
    { den: 0.0040, horizon: 0x102c36, zenith: 0x03060d },
    { den: 0.0026, horizon: 0x081a24, zenith: 0x02040a },
    { den: 0.0046, horizon: 0x123843, zenith: 0x03070e },
  ];

  const camPos = new T.Vector3();
  const camLook = new T.Vector3();
  const tmpColA = new T.Color();
  const tmpColB = new T.Color();

  let target = 0;
  let progress = 0;
  let station = 0;
  let mouseX = 0;
  let mouseY = 0;
  let mouseEX = 0;
  let mouseEY = 0;
  let elapsed = 0;
  let running = true;

  /* scroll → progress
     Each station's centre maps to one camera stop, so a station always lands
     on its own composition no matter how tall its panel happens to be. */
  let anchors = [];

  function measureStations() {
    anchors = [...document.querySelectorAll(".station")].map((el) => {
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2;
    });
  }

  function progressFromScroll() {
    const y = window.scrollY + window.innerHeight * 0.5;
    const a = anchors;
    if (a.length < 2) {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return clamp(window.scrollY / max, 0, 1);
    }
    if (y <= a[0]) return 0;
    for (let i = 1; i < a.length; i++) {
      if (y <= a[i]) {
        const span = Math.max(1, a[i] - a[i - 1]);
        return clamp((i - 1 + (y - a[i - 1]) / span) / (a.length - 1), 0, 1);
      }
    }
    return 1;
  }

  function readScroll() {
    target = progressFromScroll();
  }

  function applyAtmosphere(p) {
    const n = ATMOS.length - 1;
    const x = clamp(p, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(x));
    const f = ease(x - i);
    const a = ATMOS[i];
    const b = ATMOS[i + 1];

    seaUniforms.uFogDen.value = lerp(a.den, b.den, f);
    scene.fog.density = lerp(a.den, b.den, f) * 0.95;
    tmpColA.setHex(a.horizon);
    tmpColB.setHex(b.horizon);
    skyUniforms.uHorizon.value.copy(tmpColA).lerp(tmpColB, f);
    // the sea fades into exactly the horizon colour, so the waterline is seamless
    seaUniforms.uFogCol.value.copy(skyUniforms.uHorizon.value).multiplyScalar(0.92);
    tmpColA.setHex(a.zenith);
    tmpColB.setHex(b.zenith);
    skyUniforms.uZenith.value.copy(tmpColA).lerp(tmpColB, f);
  }

  function placeCamera(p) {
    const t = clamp(p, 0, 1);
    posCurve.getPoint(t, camPos);
    lookCurve.getPoint(t, camLook);

    // breathing + parallax
    const sway = REDUCED ? 0 : 1;
    camPos.y += Math.sin(elapsed * 0.42) * 0.16 * sway;
    camPos.x += Math.sin(elapsed * 0.27 + 1.1) * 0.22 * sway;
    camPos.x += mouseEX * 1.1 * sway;
    camPos.y += -mouseEY * 0.7 * sway;

    camera.position.copy(camPos);
    camLook.x += mouseEX * 2.6 * sway;
    camLook.y += -mouseEY * 1.8 * sway;
    camera.lookAt(camLook);
    seaUniforms.uCam.value.copy(camPos);
  }

  function updateGate(p) {
    const fade = smoothstep(0.56, 0.9, p);
    for (const part of gateParts) {
      if (part.u) part.u.value = part.base * fade;
      else part.m.opacity = part.base * fade;
    }
  }

  // the star chart only exists while you are standing under it
  function updateChart(p) {
    const fade = smoothstep(0.34, 0.56, p) * (1 - smoothstep(0.9, 0.99, p));
    for (const part of chartParts) part.m.opacity = part.base * fade;
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    // ease the scroll value so the flight never snaps
    progress += (target - progress) * (1 - Math.pow(0.001, dt));
    station = clamp(Math.round(progress * (STOPS.length - 1)), 0, STOPS.length - 1);

    mouseEX += (mouseX - mouseEX) * Math.min(1, dt * 3);
    mouseEY += (mouseY - mouseEY) * Math.min(1, dt * 3);

    placeCamera(progress);
    applyAtmosphere(progress);

    // keep the sky centred on the camera so it never clips
    sky.position.copy(camera.position);

    seaUniforms.uTime.value = elapsed;
    skyUniforms.uTime.value = elapsed;
    moteMat.uniforms.uTime.value = elapsed;
    if (world.starMat) world.starMat.uniforms.uTime.value = elapsed;
    if (world.gateMat) world.gateMat.uniforms.uTime.value = elapsed;
    streakUniforms.forEach((u) => (u.uTime.value = elapsed));

    // the beam sweeps, the lanterns bob, windows flicker
    beamGroup.rotation.y = 1.45 + elapsed * 0.14;
    if (world.beamMat) world.beamMat.uniforms.uTime.value = elapsed;
    if (world.winMats) {
      for (const w of world.winMats) {
        w.m.opacity = 0.42 + 0.16 * Math.sin(elapsed * 2.1 + w.p) + 0.08 * Math.sin(elapsed * 7.3 + w.p * 3.0);
      }
    }
    if (world.gateRingInner) world.gateRingInner.rotation.z = elapsed * 0.06;
    if (world.gateRingOuter) world.gateRingOuter.rotation.z = -elapsed * 0.035;
    chartGroups.forEach((g, i) => {
      g.rotation.z = g.userData.baseZ + Math.sin(elapsed * 0.07 + i * 1.3) * 0.018;
    });
    for (const c of nightClouds) {
      c.position.x += c.userData.v * dt;
      if (c.position.x > 900) c.position.x = -900;
    }

    // the gate only lights as you approach it
    updateGate(progress);
    updateChart(progress);

    for (const l of lanterns) {
      l.group.position.y = Math.sin(elapsed * 0.6 + l.phase) * 0.22;
      l.group.rotation.z = Math.sin(elapsed * 0.5 + l.phase) * 0.03;
      const pulse = 0.86 + 0.14 * Math.sin(elapsed * 1.1 + l.phase);
      l.light.material.opacity = pulse;
      l.halo.material.opacity = 0.18 + 0.08 * pulse;
      if (l.group.userData.hot) {
        l.light.scale.setScalar(5.8 * l.data.scale);
        l.halo.material.opacity = 0.32;
      } else {
        l.light.scale.setScalar(4.2 * l.data.scale);
      }
    }

    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    frame();
    requestAnimationFrame(loop);
  }

  /* ── resize · visibility · input ──────────────────────────────────── */

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 1.75));
    renderer.setSize(w, h, false);
    measureStations();
    readScroll();
    if (REDUCED) renderOnce();
  }
  window.addEventListener("resize", resize, { passive: true });

  function renderOnce() {
    // reduced motion: no easing loop, so land on the scroll position directly
    progress = target;
    placeCamera(progress);
    applyAtmosphere(progress);
    sky.position.copy(camera.position);
    seaUniforms.uTime.value = elapsed;
    streakUniforms.forEach((u) => (u.uTime.value = elapsed));
    updateGate(progress);
    updateChart(progress);
    renderer.render(scene, camera);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
    } else if (!REDUCED) {
      running = true;
      clock.getDelta();
      loop();
    }
  });

  window.addEventListener(
    "pointermove",
    (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  window.addEventListener("scroll", readScroll, { passive: true });

  /* ── public API ───────────────────────────────────────────────────── */

  world.highlight = (id) => {
    lanterns.forEach((l) => {
      l.group.userData.hot = l.id === id;
      if (l.streakMat) l.streakMat.uniforms.uOpacity.value = l.streakBase * (l.id === id ? 2.3 : 1);
    });
  };
  // QA aid: where a world point lands on screen (px)
  world.project = (x, y, z) => {
    const v = new T.Vector3(x, y, z).project(camera);
    return [
      Math.round((v.x * 0.5 + 0.5) * window.innerWidth),
      Math.round((-v.y * 0.5 + 0.5) * window.innerHeight),
    ];
  };
  Object.defineProperties(world, {
    station: { get: () => station },
    progress: { get: () => progress },
  });
  window.__world = world;

  measureStations();
  readScroll();
  progress = target;

  // webfonts and late layout shift the station centres — re-anchor once settled
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      measureStations();
      readScroll();
      if (REDUCED) renderOnce();
    });
  }

  // ?at=N lands on a station immediately (deep link + screenshot hook)
  const atParam = parseInt(params.get("at"), 10);
  if (Number.isFinite(atParam)) {
    progress = target = clamp(atParam / (STOPS.length - 1), 0, 1);
  }

  applyAtmosphere(progress);
  placeCamera(progress);
  sky.position.copy(camera.position);
  updateGate(progress);
  updateChart(progress);
  renderer.render(scene, camera);

  if (REDUCED) {
    document.documentElement.classList.add("frozen-world");
    window.addEventListener("scroll", () => requestAnimationFrame(renderOnce), { passive: true });
  } else {
    clock.start();
    loop();
  }
})();
