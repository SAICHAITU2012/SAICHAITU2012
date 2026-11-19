// =========================================================================
// 🌸✨ SADHASRI — COTTON CANDY DREAMSCAPE 3D PORTFOLIO v3.0
// Warm · Cute · Light · Professional · Ethereal
// =========================================================================

// --- 01. AUDIO ---
let audioCtx = null, soundEnabled = true;
function initAudio() {
  if (!audioCtx) { const A = window.AudioContext || window.webkitAudioContext; if (A) audioCtx = new A(); }
}
const chimeFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
function playChime() {
  if (!soundEnabled) return; initAudio(); if (!audioCtx) return;
  if (audioCtx.state !== 'running') audioCtx.resume();
  try {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)], audioCtx.currentTime);
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + 0.65);
  } catch (e) {}
}
window.toggleAudio = function () {
  soundEnabled = !soundEnabled;
  document.getElementById('sound-icon').textContent = soundEnabled ? '🎵' : '🔇';
  document.getElementById('sound-label').textContent = soundEnabled ? 'ON' : 'OFF';
  if (soundEnabled) playChime();
};

// --- 02. SCENE SETUP ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// WARM GRADIENT SKY (canvas texture)
(function createGradientSky() {
  const c = document.createElement('canvas');
  c.width = 2; c.height = 512;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0,    '#C0B0E0'); // top: soft violet
  grad.addColorStop(0.15, '#D0B8D8'); // upper: dusty mauve
  grad.addColorStop(0.35, '#E8C8D8'); // mid-upper: rose
  grad.addColorStop(0.55, '#F8D8D0'); // mid: blush pink
  grad.addColorStop(0.75, '#FFE4D4'); // lower: peach
  grad.addColorStop(1,    '#FFF0E8'); // bottom: warm cream
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 512);
  scene.background = new THREE.CanvasTexture(c);
})();

// Warm atmospheric fog
scene.fog = new THREE.Fog(0xFFE4D8, 55, 180);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 14, 48);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
// No harsh shadows — soft illustrated look
renderer.shadowMap.enabled = false;

// --- 03. WARM LIGHTING ---
// Ambient — warm cream fill
scene.add(new THREE.AmbientLight(0xFFF0E0, 1.6));

// Golden sun key light
const sunLight = new THREE.DirectionalLight(0xFFE8C8, 2.2);
sunLight.position.set(20, 40, 25);
scene.add(sunLight);

// Pink fill from left
const pinkFill = new THREE.PointLight(0xFFB0C8, 2.5, 80);
pinkFill.position.set(-28, 15, 20);
scene.add(pinkFill);

// Lavender fill from right
const lavFill = new THREE.PointLight(0xD0B8F0, 2.0, 70);
lavFill.position.set(28, 10, -18);
scene.add(lavFill);

// Warm under-fill
const warmFill = new THREE.PointLight(0xFFD8B0, 1.5, 60);
warmFill.position.set(0, -12, 15);
scene.add(warmFill);

// --- 04. DREAM ARCH PORTAL (Background) ---
const archGroup = new THREE.Group();
archGroup.position.set(5, 8, -55);
archGroup.rotation.y = -0.15;
scene.add(archGroup);

// Main arch — large matte semicircle
const archGeo = new THREE.TorusGeometry(22, 1.6, 20, 60, Math.PI);
const archMat = new THREE.MeshStandardMaterial({
  color: 0xD8C8E0, roughness: 0.75, metalness: 0.02
});
const arch = new THREE.Mesh(archGeo, archMat);
arch.rotation.z = Math.PI; // flip so arch opens upward
archGroup.add(arch);

// Inner glow plane behind arch
const archGlowGeo = new THREE.CircleGeometry(20, 40, 0, Math.PI);
const archGlowMat = new THREE.MeshBasicMaterial({
  color: 0xFFE8F0, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false
});
const archGlow = new THREE.Mesh(archGlowGeo, archGlowMat);
archGlow.rotation.z = Math.PI;
archGlow.position.z = -1;
archGroup.add(archGlow);

// Arch base platform (subtle)
const archBase = new THREE.Mesh(
  new THREE.BoxGeometry(44, 0.6, 3),
  new THREE.MeshStandardMaterial({ color: 0xD0C0D8, roughness: 0.8 })
);
archBase.position.y = 0;
archGroup.add(archBase);

// --- 05. FLOATING SPHERES (Dreamy matte orbs) ---
const floatSpheres = [];
const sphereConfigs = [
  { pos: [-18, 20, -40], r: 3.5, color: 0xF0E8F0 },
  { pos: [22, 25, -48], r: 2.8, color: 0xFFE8E0 },
  { pos: [-12, 5, -35], r: 2.0, color: 0xE8D8F0 },
  { pos: [30, 12, -42], r: 4.0, color: 0xFFECE4 },
  { pos: [-28, 16, -30], r: 1.5, color: 0xE0D0E8 },
  { pos: [15, 28, -55], r: 3.2, color: 0xFFF0F0 },
  { pos: [-8, 30, -50], r: 2.2, color: 0xF8E0F0 },
  { pos: [35, 8, -38], r: 1.8, color: 0xFFE4E0 },
  { pos: [-25, -2, -25], r: 2.5, color: 0xE8E0F0 },
  { pos: [8, -5, -20], r: 1.2, color: 0xFFF0E8 },
  { pos: [-35, 22, -52], r: 2.0, color: 0xF0E0E8 },
  { pos: [25, -4, -15], r: 1.4, color: 0xE8E8F8 },
];

sphereConfigs.forEach(cfg => {
  const geo = new THREE.SphereGeometry(cfg.r, 28, 28);
  const mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.82, metalness: 0.02 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...cfg.pos);
  mesh.userData = {
    initY: cfg.pos[1],
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.5,
    amp: 0.5 + Math.random() * 1.2
  };
  scene.add(mesh);
  floatSpheres.push(mesh);
});

// --- 06. COTTON CANDY CLOUDS ---
const cloudGroup = new THREE.Group();
scene.add(cloudGroup);

const cloudColors = [0xFFFFFF, 0xFFE8F0, 0xFFF0E8, 0xF0E0F8, 0xFFF8F4, 0xFFE0E8, 0xF8F0FF];

function createCottonCloud(x, y, z, scale, colorIdx) {
  const group = new THREE.Group();
  const count = 10 + Math.floor(Math.random() * 6);
  const color = cloudColors[colorIdx % cloudColors.length];
  const mat = new THREE.MeshStandardMaterial({
    color, roughness: 0.95, metalness: 0, transparent: true,
    opacity: 0.92 - scale * 0.03, depthWrite: false
  });

  for (let i = 0; i < count; i++) {
    const r = (1.5 + Math.random() * 2.0) * scale;
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12), mat);
    m.position.set(
      (Math.random() - 0.5) * 6 * scale,
      (Math.random() - 0.5) * 2 * scale,
      (Math.random() - 0.5) * 3 * scale
    );
    group.add(m);
  }
  group.position.set(x, y, z);
  group.userData = {
    initY: y, speed: 0.4 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.012
  };
  return group;
}

const cloudConfigs = [
  [-35, 18, -20, 2.2, 0], [38, 22, -30, 2.6, 1],
  [-22, -4, -12, 1.8, 2], [28, -6, -8, 2.0, 3],
  [-48, 6, -35, 3.0, 4], [45, 8, -40, 2.8, 5],
  [-12, 28, -45, 2.4, 6], [20, 26, -38, 2.0, 0],
  [0, 32, -55, 3.2, 1], [-30, -8, -18, 1.6, 2],
  [32, 14, -25, 1.9, 3], [-40, 14, -50, 2.5, 4],
];

const clouds = cloudConfigs.map(c => {
  const cloud = createCottonCloud(...c);
  cloudGroup.add(cloud);
  return cloud;
});

// --- 07. FLOATING ISLAND PLATFORM ---
const islandGroup = new THREE.Group();
scene.add(islandGroup);

// Warm cream base layers
const baseGeo = new THREE.CylinderGeometry(13, 10, 3.5, 36);
const baseMat = new THREE.MeshStandardMaterial({ color: 0xF0D8C8, roughness: 0.7, metalness: 0.02 });
const islandBase = new THREE.Mesh(baseGeo, baseMat);
islandBase.position.y = -3;
islandGroup.add(islandBase);

// Upper rim (slightly wider)
const rimGeo = new THREE.CylinderGeometry(13.5, 13, 0.8, 36);
const rimMat = new THREE.MeshStandardMaterial({ color: 0xF8E0D0, roughness: 0.65 });
const islandRim = new THREE.Mesh(rimGeo, rimMat);
islandRim.position.y = -1.0;
islandGroup.add(islandRim);

// Grass/surface top — soft warm green
const grassGeo = new THREE.CylinderGeometry(13.8, 13.5, 0.5, 40);
const grassMat = new THREE.MeshStandardMaterial({ color: 0xC8E8C0, roughness: 0.8, metalness: 0 });
const islandGrass = new THREE.Mesh(grassGeo, grassMat);
islandGrass.position.y = -0.4;
islandGroup.add(islandGrass);

// Subtle pink trim ring on top
const trimGeo = new THREE.TorusGeometry(12.5, 0.2, 10, 50);
const trimMat = new THREE.MeshStandardMaterial({ color: 0xFFD0D8, roughness: 0.5 });
const islandTrim = new THREE.Mesh(trimGeo, trimMat);
islandTrim.rotation.x = Math.PI / 2;
islandTrim.position.y = -0.1;
islandGroup.add(islandTrim);

// --- 08. CUTE DESK OBJECTS ---

// 8A. LAPTOP (warm cream body, colorful screen)
const laptopGroup = new THREE.Group();
laptopGroup.position.set(-2.5, 0, 1.5);
laptopGroup.rotation.y = Math.PI / 7;
islandGroup.add(laptopGroup);

// Keyboard base
const lapBase = new THREE.Mesh(
  new THREE.BoxGeometry(5.8, 0.25, 4.2),
  new THREE.MeshStandardMaterial({ color: 0xFFF0E8, roughness: 0.35 })
);
laptopGroup.add(lapBase);

// Keyboard area (darker inset)
const kbArea = new THREE.Mesh(
  new THREE.BoxGeometry(5.0, 0.03, 3.4),
  new THREE.MeshStandardMaterial({ color: 0xE8D8D0, roughness: 0.5 })
);
kbArea.position.y = 0.14;
laptopGroup.add(kbArea);

// Screen lid (tilted back)
const lapLid = new THREE.Mesh(
  new THREE.BoxGeometry(5.8, 4.2, 0.2),
  new THREE.MeshStandardMaterial({ color: 0xFFF0E8, roughness: 0.35 })
);
lapLid.position.set(0, 2.2, -2.0);
lapLid.rotation.x = -Math.PI / 10;
laptopGroup.add(lapLid);

// Screen display (warm pink glow)
const screenMat = new THREE.MeshStandardMaterial({
  color: 0xFFD0E0, roughness: 0.3, emissive: 0xFFB0C8, emissiveIntensity: 0.3
});
const screen = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.6), screenMat);
screen.position.set(0, 2.2, -1.88);
screen.rotation.x = -Math.PI / 10;
laptopGroup.add(screen);

// Screen light emanation
const screenLight = new THREE.PointLight(0xFFD0E8, 0.8, 12);
screenLight.position.set(0, 3, -1);
laptopGroup.add(screenLight);

// 8B. BOOK STACK (3 colorful books)
const bookGroup = new THREE.Group();
bookGroup.position.set(5.5, 0, -1.5);
bookGroup.rotation.y = -0.3;
islandGroup.add(bookGroup);

const bookColors = [0xFFB8C8, 0xC8B8F0, 0xB8E8D0];
bookColors.forEach((col, i) => {
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.5, 3.6),
    new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })
  );
  book.position.set((i - 1) * 0.08, i * 0.52, (i - 1) * 0.1);
  book.rotation.y = (i - 1) * 0.05;
  bookGroup.add(book);
});

// Tiny bookmark ribbon
const ribbon = new THREE.Mesh(
  new THREE.BoxGeometry(0.15, 0.08, 1.2),
  new THREE.MeshStandardMaterial({ color: 0xFF8898, roughness: 0.5 })
);
ribbon.position.set(0.5, 1.56, 1.0);
bookGroup.add(ribbon);

// 8C. TEA CUP with saucer
const cupGroup = new THREE.Group();
cupGroup.position.set(5, 0, 3);
islandGroup.add(cupGroup);

// Saucer
const saucer = new THREE.Mesh(
  new THREE.CylinderGeometry(1.5, 1.5, 0.15, 24),
  new THREE.MeshStandardMaterial({ color: 0xFFF0E8, roughness: 0.4 })
);
saucer.position.y = 0.08;
cupGroup.add(saucer);

// Cup body
const cupBody = new THREE.Mesh(
  new THREE.CylinderGeometry(0.85, 0.65, 1.6, 20),
  new THREE.MeshStandardMaterial({ color: 0xFFF0E8, roughness: 0.35 })
);
cupBody.position.y = 0.95;
cupGroup.add(cupBody);

// Tea liquid (warm amber)
const tea = new THREE.Mesh(
  new THREE.CylinderGeometry(0.78, 0.78, 0.1, 16),
  new THREE.MeshStandardMaterial({ color: 0xE8A860, roughness: 0.3 })
);
tea.position.y = 1.68;
cupGroup.add(tea);

// Cup handle
const handleGeo = new THREE.TorusGeometry(0.4, 0.08, 10, 16, Math.PI);
const handle = new THREE.Mesh(handleGeo,
  new THREE.MeshStandardMaterial({ color: 0xFFF0E8, roughness: 0.4 })
);
handle.position.set(0.9, 1.0, 0);
handle.rotation.y = Math.PI / 2;
handle.rotation.x = Math.PI / 2;
cupGroup.add(handle);

// 8D. POTTED PLANT
const plantGroup = new THREE.Group();
plantGroup.position.set(-6, 0, -3);
islandGroup.add(plantGroup);

// Pot (lavender)
const pot = new THREE.Mesh(
  new THREE.CylinderGeometry(1.2, 0.9, 1.6, 20),
  new THREE.MeshStandardMaterial({ color: 0xD8C0E8, roughness: 0.5 })
);
pot.position.y = 0.8;
plantGroup.add(pot);

// Pot rim
const potRim = new THREE.Mesh(
  new THREE.TorusGeometry(1.2, 0.12, 8, 24),
  new THREE.MeshStandardMaterial({ color: 0xC8B0D8, roughness: 0.5 })
);
potRim.rotation.x = Math.PI / 2;
potRim.position.y = 1.6;
plantGroup.add(potRim);

// Soil
const soil = new THREE.Mesh(
  new THREE.CylinderGeometry(1.1, 1.1, 0.15, 14),
  new THREE.MeshStandardMaterial({ color: 0x8B6E5A, roughness: 0.9 })
);
soil.position.y = 1.68;
plantGroup.add(soil);

// Stem
const stem = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.1, 2.2, 8),
  new THREE.MeshStandardMaterial({ color: 0x68B060, roughness: 0.7 })
);
stem.position.y = 2.78;
plantGroup.add(stem);

// Leaves (green ellipsoids)
for (let i = 0; i < 5; i++) {
  const angle = (i / 5) * Math.PI * 2 + 0.3;
  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0x78C870, roughness: 0.7 })
  );
  leaf.scale.set(1.6, 0.4, 0.8);
  leaf.position.set(Math.cos(angle) * 0.5, 3.6 + i * 0.15, Math.sin(angle) * 0.5);
  leaf.rotation.z = (Math.random() - 0.5) * 0.6;
  leaf.rotation.y = angle;
  plantGroup.add(leaf);
}

// 8E. FLOWER BOUQUET (cherry blossoms on island)
function createFlower(x, y, z, petalColor, centerColor, scale) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.scale.setScalar(scale || 1);

  // Center
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 10),
    new THREE.MeshStandardMaterial({ color: centerColor, roughness: 0.4 })
  );
  center.position.y = 0;
  group.add(center);

  // Petals
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      new THREE.MeshStandardMaterial({ color: petalColor, roughness: 0.5 })
    );
    petal.scale.set(1.5, 0.5, 0.5);
    petal.position.set(Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38);
    petal.rotation.y = a;
    group.add(petal);
  }

  // Short stem
  const fStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.6, 6),
    new THREE.MeshStandardMaterial({ color: 0x68B060, roughness: 0.7 })
  );
  fStem.position.y = -0.3;
  group.add(fStem);

  return group;
}

// Flower clusters around island edges
const flowers = [];
const flowerPositions = [
  [-7, 0.3, 5, 0xFFB8CC, 0xFFE066, 0.9],
  [-9, 0.3, 3, 0xFFC8D8, 0xFFD050, 0.75],
  [-8, 0.3, 7, 0xFFD0E0, 0xFFE080, 0.85],
  [7, 0.3, 5, 0xE0C0FF, 0xFFE066, 0.8],
  [8, 0.3, 3, 0xFFB8CC, 0xFFD050, 0.7],
  [9, 0.3, 7, 0xFFC8E8, 0xFFE080, 0.9],
  [-3, 0.3, 8, 0xFFD0D8, 0xFFE066, 0.75],
  [3, 0.3, 8, 0xE8C8FF, 0xFFD050, 0.8],
  [-5, 0.3, -7, 0xFFB8D0, 0xFFE066, 0.85],
  [0, 0.3, -9, 0xFFC8E0, 0xFFE080, 0.7],
  [5, 0.3, -7, 0xD8C0FF, 0xFFD050, 0.8],
  [-10, 0.3, 0, 0xFFD0D8, 0xFFE066, 0.75],
  [10, 0.3, 0, 0xFFC0D8, 0xFFE080, 0.85],
  [-6, 0.3, 9, 0xFFB0C8, 0xFFE066, 0.9],
  [6, 0.3, 9, 0xE0B8FF, 0xFFD050, 0.8],
];

flowerPositions.forEach(fp => {
  const f = createFlower(...fp);
  f.userData = { initY: fp[1], phase: Math.random() * Math.PI * 2 };
  islandGroup.add(f);
  flowers.push(f);
});

// 8F. PENCIL CUP
const pencilCup = new THREE.Mesh(
  new THREE.CylinderGeometry(0.6, 0.5, 1.4, 14),
  new THREE.MeshStandardMaterial({ color: 0xFFD8C0, roughness: 0.5 })
);
pencilCup.position.set(-6.5, 0.7, 2.5);
islandGroup.add(pencilCup);

// Pencils sticking out
const pencilColors = [0xFF8888, 0x88BBFF, 0xFFDD66];
pencilColors.forEach((col, i) => {
  const pencil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 2.0, 6),
    new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
  );
  pencil.position.set(-6.5 + (i - 1) * 0.2, 2.2, 2.5);
  pencil.rotation.z = (i - 1) * 0.1;
  pencil.rotation.x = (i - 1) * 0.05;
  islandGroup.add(pencil);
});

// 8G. TINY HEART on island
const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0.4);
heartShape.bezierCurveTo(0, 0.7, -0.6, 1.0, -1.0, 0.7);
heartShape.bezierCurveTo(-1.4, 0.3, -1.2, -0.4, 0, -1.2);
heartShape.bezierCurveTo(1.2, -0.4, 1.4, 0.3, 1.0, 0.7);
heartShape.bezierCurveTo(0.6, 1.0, 0, 0.7, 0, 0.4);

const tinyHeart = new THREE.Mesh(
  new THREE.ExtrudeGeometry(heartShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3 }),
  new THREE.MeshStandardMaterial({ color: 0xFF8898, roughness: 0.4 })
);
tinyHeart.scale.setScalar(0.5);
tinyHeart.position.set(2, 2.5, 4);
tinyHeart.rotation.set(0, 0.5, 0);
islandGroup.add(tinyHeart);

// --- 09. GOLDEN SPARKLE PARTICLES ---
const sparkleGroup = new THREE.Group();
scene.add(sparkleGroup);

const sparkleCount = 180;
const sparklePositions = new Float32Array(sparkleCount * 3);
const sparkleSizes = [];
for (let i = 0; i < sparkleCount; i++) {
  sparklePositions[i * 3] = (Math.random() - 0.5) * 100;
  sparklePositions[i * 3 + 1] = Math.random() * 60 - 15;
  sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
  sparkleSizes.push(0.3 + Math.random() * 0.5);
}
const sparkleGeo = new THREE.BufferGeometry();
sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
const sparkleMat = new THREE.PointsMaterial({
  color: 0xFFE8A0, size: 0.4, transparent: true, opacity: 0.75,
  sizeAttenuation: true, depthWrite: false
});
sparkleGroup.add(new THREE.Points(sparkleGeo, sparkleMat));

// Extra bright sparkle octahedrons
const brightStars = [];
for (let i = 0; i < 30; i++) {
  const starCol = [0xFFE880, 0xFFD0E0, 0xE0D0FF, 0xD0F0E0][Math.floor(Math.random() * 4)];
  const star = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.25 + Math.random() * 0.3, 0),
    new THREE.MeshStandardMaterial({ color: starCol, emissive: starCol, emissiveIntensity: 0.4, roughness: 0.3 })
  );
  star.position.set(
    (Math.random() - 0.5) * 80,
    Math.random() * 50 - 10,
    (Math.random() - 0.5) * 60
  );
  star.scale.set(1, 1.6, 1);
  star.userData = { rotSpd: 0.02 + Math.random() * 0.03, pulseSpd: 1 + Math.random() * 2 };
  scene.add(star);
  brightStars.push(star);
}

// --- 10. PETAL RAIN (Warm colors) ---
const petalGroup = new THREE.Group();
scene.add(petalGroup);

const petalColors = [0xFFD0E0, 0xFFE0D0, 0xFFE8E0, 0xE8D0F0, 0xFFC8D0, 0xFFD8C8];
const petalGeo = new THREE.SphereGeometry(0.25, 6, 6);
petalGeo.scale(1.8, 0.3, 1.0);

const petals = [];
for (let i = 0; i < 100; i++) {
  const col = petalColors[Math.floor(Math.random() * petalColors.length)];
  const petal = new THREE.Mesh(petalGeo,
    new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, transparent: true, opacity: 0.7 + Math.random() * 0.3, side: THREE.DoubleSide })
  );
  petal.position.set(
    (Math.random() - 0.5) * 85,
    Math.random() * 60 - 20,
    (Math.random() - 0.5) * 60
  );
  petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  petal.userData = {
    fallSpd: 0.04 + Math.random() * 0.06,
    rotX: (Math.random() - 0.5) * 0.03,
    rotY: (Math.random() - 0.5) * 0.03,
    swaySpd: 0.6 + Math.random() * 1.5,
    swayAmp: 0.02 + Math.random() * 0.03
  };
  petalGroup.add(petal);
  petals.push(petal);
}

// --- 11. CLICK-TO-SPAWN HEARTS & SPARKLE BURSTS ---
const burstParticles = [];
const heartGeoBase = new THREE.ShapeGeometry(heartShape);

function spawnBurst(x, y, z) {
  playChime();
  for (let i = 0; i < 8; i++) {
    const type = Math.random() > 0.4 ? 'heart' : 'star';
    const geo = type === 'heart' ? heartGeoBase : new THREE.OctahedronGeometry(0.2, 0);
    const col = type === 'heart'
      ? [0xFFB0C8, 0xFF8898, 0xFFC0D0][Math.floor(Math.random() * 3)]
      : [0xFFE080, 0xFFD0A0, 0xE0C0FF][Math.floor(Math.random() * 3)];

    const mesh = new THREE.Mesh(geo,
      new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide })
    );
    mesh.scale.setScalar(0.35);
    mesh.position.set(x, y, z);
    mesh.userData = {
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.2 + Math.random() * 0.4, (Math.random() - 0.5) * 0.4),
      rotV: (Math.random() - 0.5) * 0.12,
      life: 1.0
    };
    scene.add(mesh);
    burstParticles.push(mesh);
  }
}

// --- 12. MOUSE / TOUCH INTERACTION ---
let isDragging = false, prevMouse = { x: 0, y: 0 };
let targetRotY = 0, targetRotX = 0;

function onPointerDown(x, y, e) {
  if (e && (e.target.closest('.hud-nav') || e.target.closest('.hud-section') || e.target.closest('.modal-backdrop') || e.target.closest('.hud-footer'))) return;
  isDragging = true;
  prevMouse = { x, y };
  const mx = (x / window.innerWidth) * 2 - 1;
  const my = -(y / window.innerHeight) * 2 + 1;
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(mx, my), camera);
  const pt = new THREE.Vector3();
  ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -5), pt);
  if (pt) spawnBurst(pt.x, pt.y, pt.z);
}

window.addEventListener('mousedown', e => onPointerDown(e.clientX, e.clientY, e));
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  targetRotY += (e.clientX - prevMouse.x) * 0.006;
  targetRotX += (e.clientY - prevMouse.y) * 0.004;
  targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX));
  prevMouse = { x: e.clientX, y: e.clientY };
});
window.addEventListener('wheel', e => {
  camera.position.z += e.deltaY * 0.025;
  camera.position.z = Math.max(28, Math.min(80, camera.position.z));
});
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
// Touch support
window.addEventListener('touchstart', e => { if (e.touches.length === 1) onPointerDown(e.touches[0].clientX, e.touches[0].clientY, e); });
window.addEventListener('touchmove', e => {
  if (!isDragging || e.touches.length !== 1) return;
  targetRotY += (e.touches[0].clientX - prevMouse.x) * 0.007;
  targetRotX += (e.touches[0].clientY - prevMouse.y) * 0.005;
  targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX));
  prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
window.addEventListener('touchend', () => { isDragging = false; });

// --- 13. ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Island gentle float & rotation
  if (!isDragging) targetRotY += 0.002;
  islandGroup.rotation.y += (targetRotY - islandGroup.rotation.y) * 0.07;
  islandGroup.rotation.x += (targetRotX - islandGroup.rotation.x) * 0.07;
  islandGroup.position.y = Math.sin(t * 1.2) * 0.5;

  // Laptop screen color shift (warm pulse)
  const hue = 0.93 + Math.sin(t * 0.4) * 0.04;
  screenMat.color.setHSL(hue, 0.6, 0.8);
  screenMat.emissive.setHSL(hue, 0.5, 0.5);
  screenMat.emissiveIntensity = 0.25 + Math.sin(t * 2) * 0.08;

  // Tea cup gentle bob
  cupGroup.position.y = Math.sin(t * 1.8 + 1) * 0.05;

  // Plant sway
  plantGroup.rotation.z = Math.sin(t * 1.0) * 0.03;

  // Tiny heart float
  tinyHeart.position.y = 2.5 + Math.sin(t * 2.5) * 0.3;
  tinyHeart.rotation.y = t * 1.2;

  // Flowers gentle sway
  flowers.forEach(f => {
    f.position.y = f.userData.initY + Math.sin(t * 1.5 + f.userData.phase) * 0.08;
    f.rotation.z = Math.sin(t * 0.8 + f.userData.phase) * 0.05;
  });

  // Clouds drift
  clouds.forEach(c => {
    c.position.y = c.userData.initY + Math.sin(t * c.userData.speed + c.userData.phase) * 1.5;
    c.position.x += c.userData.driftX;
    if (c.position.x > 55) c.position.x = -55;
    if (c.position.x < -55) c.position.x = 55;
  });

  // Floating spheres bob
  floatSpheres.forEach(s => {
    s.position.y = s.userData.initY + Math.sin(t * s.userData.speed + s.userData.phase) * s.userData.amp;
  });

  // Arch glow pulse
  archGlowMat.opacity = 0.12 + Math.sin(t * 0.8) * 0.05;

  // Bright stars spin & pulse
  brightStars.forEach(s => {
    s.rotation.y += s.userData.rotSpd;
    const sc = 1 + Math.sin(t * s.userData.pulseSpd) * 0.2;
    s.scale.set(sc, sc * 1.6, sc);
  });

  // Petals fall & sway
  petals.forEach(p => {
    p.position.y -= p.userData.fallSpd;
    p.position.x += Math.sin(t * p.userData.swaySpd) * p.userData.swayAmp;
    p.rotation.x += p.userData.rotX;
    p.rotation.y += p.userData.rotY;
    if (p.position.y < -25) {
      p.position.y = 40;
      p.position.x = (Math.random() - 0.5) * 85;
      p.position.z = (Math.random() - 0.5) * 60;
    }
  });

  // Sparkle group gentle rotation
  sparkleGroup.rotation.y = t * 0.008;

  // Burst particles
  for (let i = burstParticles.length - 1; i >= 0; i--) {
    const bp = burstParticles[i];
    bp.position.addScaledVector(bp.userData.vel, 1);
    bp.userData.vel.y -= 0.008;
    bp.rotation.z += bp.userData.rotV;
    bp.userData.life -= 0.014;
    bp.material.opacity = bp.userData.life;
    if (bp.userData.life <= 0) {
      scene.remove(bp);
      burstParticles.splice(i, 1);
    }
  }

  // Light pulse
  pinkFill.intensity = 2.3 + Math.sin(t * 1.5) * 0.3;
  lavFill.intensity = 1.8 + Math.sin(t * 1.2 + 1) * 0.3;

  renderer.render(scene, camera);
}
animate();

// --- 14. UI SECTION NAVIGATION ---
window.switchSection = function (secId) {
  playChime();
  document.querySelectorAll('.hud-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('sec-' + secId);
  if (target) target.classList.add('active');
};

// --- 15. PROJECT MODALS ---
const projectData = {
  animeshelf: {
    badge: '01 // FULL-STACK WEB', emoji: '✨', title: 'My Anime Shelf',
    tagline: 'Interactive anime discovery, rating, and tracking platform with custom user profiles and responsive modern UI.',
    highlights: [
      '<b>AniList GraphQL Integration:</b> Real-time dynamic search, metadata fetching, and categorization across thousands of anime series.',
      '<b>Modern CSS Design Tokens:</b> Custom property system ensuring cohesive spacing, colors, and responsive layout across all screen sizes.',
      '<b>Firebase v11 Cloud State:</b> Authenticated personal list synchronization, persistent user profiles, and real-time updates.'
    ],
    stack: ['Vanilla JavaScript ES6+', 'HTML5', 'CSS3 Tokens', 'AniList GraphQL', 'Firebase v11'],
    repo: 'https://github.com/SadhaSri697/My-Anime-Self',
    demo: 'https://sadhasri697.github.io/My-Anime-Self/'
  },
  airquality: {
    badge: '02 // MACHINE LEARNING', emoji: '🌫️', title: 'Air Quality Trend Predictor',
    tagline: 'Multi-horizon atmospheric PM2.5 forecasting across 12 Beijing monitoring stations using machine learning regression.',
    highlights: [
      '<b>Time-Series Feature Engineering:</b> Engineered meteorological vectors for ML regression models.',
      '<b>UCI PRSA Dataset:</b> Processed extensive historical multi-station sensor records for Beijing air quality analysis.',
      '<b>Robust Data Pipeline:</b> Outlier filtering, categorical weather encoding, and cross-validated statistical benchmarks.'
    ],
    stack: ['Python 3.8+', 'Scikit-Learn', 'Pandas', 'NumPy', 'Matplotlib'],
    repo: 'https://github.com/SadhaSri697/Air-Quality-Trend-Predictor'
  },
  studenteda: {
    badge: '03 // DATA SCIENCE', emoji: '📊', title: 'Student Health Analytics',
    tagline: 'Interactive Python analytical tool exploring demographic, academic, and lifestyle factors tied to student mental health.',
    highlights: [
      '<b>Correlation Mining:</b> Uncovered relationships between academic pressures, sleep disruption, and reported depression indicators.',
      '<b>Interactive CLI:</b> Structured command-line workflow for cohort filtering and dynamic statistical summary generation.',
      '<b>Automated Preprocessing:</b> Missing data imputation, encoding, and statistical clustering pipeline.'
    ],
    stack: ['Python', 'EDA', 'Statistical Modeling', 'CLI Architecture'],
    repo: 'https://github.com/SadhaSri697/Student-Depression-Analysis'
  },
  web2skill: {
    badge: '04 // AUTOMATION & AI', emoji: '🪄', title: 'web2skill (w2s)',
    tagline: 'Automated skill generator turning websites into comprehensive structured references for AI coding agents.',
    highlights: [
      '<b>Agent Readiness:</b> Converts web platforms into hierarchical SKILL.md specifications documenting every interactive element.',
      '<b>DOM Exploration:</b> Automatically maps forms, routes, and edge cases to eliminate manual agent priming.'
    ],
    stack: ['Python', 'Web Scraping', 'AI Agent Skills', 'Markdown Parser'],
    repo: 'https://github.com/SadhaSri697/Webtoskill'
  }
};

window.openModal = function (id) {
  playChime();
  const d = projectData[id]; if (!d) return;
  const demoBtn = d.demo ? `<a href="${d.demo}" target="_blank" rel="noopener" class="cute-btn cute-btn-primary" style="font-size:12px;padding:7px 16px;">Live Demo ↗</a>` : '';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <span style="font-size:32px">${d.emoji}</span>
      <div>
        <span class="proj-tag tag-pink" style="display:inline-block;margin-bottom:4px;">${d.badge}</span>
        <h3 style="font-size:20px;font-weight:800;color:#2A1A32;line-height:1.2;">${d.title}</h3>
      </div>
    </div>
    <p style="font-size:13px;color:#5A4064;line-height:1.65;margin-bottom:16px;">${d.tagline}</p>
    <div style="background:rgba(230,215,240,0.35);border:1px solid rgba(200,170,220,0.25);border-radius:14px;padding:14px;margin-bottom:16px;">
      <h5 style="font-size:10px;font-family:var(--font-mono);color:#9A6898;letter-spacing:1.5px;margin-bottom:8px;">✦ KEY CONTRIBUTIONS</h5>
      <ul style="font-size:12px;color:#4A3858;line-height:1.65;padding-left:16px;">
        ${d.highlights.map(h => `<li style="margin-bottom:6px;">${h}</li>`).join('')}
      </ul>
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:20px;">
      ${d.stack.map(s => `<span class="skill-pill">${s}</span>`).join('')}
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;">
      <a href="${d.repo}" target="_blank" rel="noopener" class="cute-btn cute-btn-secondary" style="font-size:12px;padding:7px 16px;">View Code ↗</a>
      ${demoBtn}
    </div>`;
  document.getElementById('project-modal').classList.add('open');
};

window.closeModal = function (e) {
  if (!e || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close-btn'))
    document.getElementById('project-modal').classList.remove('open');
};
