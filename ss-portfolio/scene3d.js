/* ═══════════════════════════════════════════════════════════════
   ss-portfolio v6.5 — "PERSONAL SYSTEMS INDEX"
   scene3d.js — mature cinematic background (Three.js, no deps)
   monolith · wireframe globe · grid floor · glow particles
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const canvas = document.getElementById("bg3d");
  if (!canvas || typeof THREE === "undefined") return;

  const PARAMS = new URLSearchParams(location.search);
  const STATIC =
    PARAMS.has("static") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── renderer / scene / camera ────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070d, 0.03);

  const camera = new THREE.PerspectiveCamera(
    46,
    window.innerWidth / window.innerHeight,
    0.1,
    300
  );
  camera.position.set(0, 4.2, 26);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true, // keep last frame alive for capture
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
  else if (THREE.outputColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ── lights (restrained) ──────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x8fa3bf, 0.55));
  const keyLight = new THREE.DirectionalLight(0xbfd9e8, 0.65);
  keyLight.position.set(12, 18, 14);
  scene.add(keyLight);
  const seamLight = new THREE.PointLight(0x67e8f9, 1.5, 26);
  seamLight.position.set(6.4, 5.2, -3.2);
  scene.add(seamLight);

  // ── the monolith ─────────────────────────────────────────────
  const mono = new THREE.Group();
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 9.5, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x0b111e, roughness: 0.55, metalness: 0.25 })
  );
  mono.add(slab);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(slab.geometry),
    new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.3 })
  );
  mono.add(edges);
  const seam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 7.6),
    new THREE.MeshBasicMaterial({
      color: 0x9beefc,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  seam.position.set(-0.58, 0.2, 0.78);
  mono.add(seam);
  mono.position.set(7.2, 4.55, -7);
  scene.add(mono);

  // ── wireframe globe ──────────────────────────────────────────
  const globe = new THREE.Group();
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 22, 14),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9, wireframe: true, transparent: true, opacity: 0.15 })
  );
  globe.add(wire);
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x0a0f1a, roughness: 0.45 })
  );
  globe.add(core);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.3, 0.02, 8, 72),
    new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.28 })
  );
  ring.rotation.x = Math.PI / 2.2;
  globe.add(ring);
  globe.position.set(-10.5, 5.4, -11);
  scene.add(globe);

  // ── grid floor ───────────────────────────────────────────────
  const grid = new THREE.GridHelper(110, 44, 0x1d3540, 0x0f1c28);
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  grid.position.y = -1.4;
  scene.add(grid);

  // ── glow particles ───────────────────────────────────────────
  function glowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  const N = 240;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * 95;
    pos[i * 3 + 1] = Math.random() * 26 - 2;
    pos[i * 3 + 2] = -Math.random() * 55 + 4;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0x9adbe9,
      map: glowTexture(),
      size: 0.65,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  scene.add(dust);

  // ── parallax + resize ────────────────────────────────────────
  const mouse = { x: 0, y: 0 };
  window.addEventListener(
    "mousemove",
    (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
  let rafId = null;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!rafId && !STATIC) {
      tick();
    }
  });

  // ── animation ────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let frame = 0;

  function tick() {
    const t = clock.getElapsedTime();

    globe.rotation.y = t * 0.08;
    ring.rotation.z = t * 0.12;
    seam.material.opacity = 0.72 + Math.sin(t * 1.8) * 0.22;
    seamLight.intensity = 1.35 + Math.sin(t * 1.8) * 0.35;
    dust.rotation.y = t * 0.008;
    grid.position.z = ((t * 0.6) % 2.5) - 1.25; // subtle forward drift, loops cleanly

    // gentle parallax
    camera.position.x += (mouse.x * 2.2 - camera.position.x) * 0.03;
    camera.position.y += (4.2 - mouse.y * 1.1 - camera.position.y) * 0.03;
    camera.lookAt(0, 4, -6);

    renderer.render(scene, camera);

    if (STATIC) {
      if (++frame < 120) requestAnimationFrame(tick); // settle then freeze
      return;
    }
    rafId = requestAnimationFrame(tick);
  }
  tick();
})();
