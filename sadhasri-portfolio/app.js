// =========================================================================
// 🌸✨ SADHASRI — ENCHANTED PASTEL DREAMSCAPE 3D PORTFOLIO v2.0 ✨🌸
// Built with Three.js r128 | Full scene overhaul with aurora, galaxy, crystals
// =========================================================================

// --- 01. AUDIO SYNTHESIZER (WEB AUDIO API) ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
}

// Pentatonic chime scale (F, G, A, C, D) — dreamy and pleasant
const chimeFreqs = [349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99, 880.00, 1046.50];

function playSparkleSound(vol) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state !== 'running') audioCtx.resume();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(vol || 0.07, audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.75);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {}
}

window.toggleAudio = function () {
  soundEnabled = !soundEnabled;
  document.getElementById('sound-icon').textContent = soundEnabled ? '🎵' : '🔇';
  document.getElementById('sound-label').textContent = soundEnabled ? 'Sound: ON' : 'Sound: OFF';
  if (soundEnabled) playSparkleSound();
};

// --- 02. SCENE & RENDERER SETUP ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// Deep cosmic lavender-nebula sky
scene.background = new THREE.Color(0x0D0719);
scene.fog = new THREE.FogExp2(0x0D0719, 0.009);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(0, 18, 58);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// --- 03. CINEMATIC LIGHTING SETUP ---
// Ambient — warm lavender dusk
const ambientLight = new THREE.AmbientLight(0x1A0A2E, 2.0);
scene.add(ambientLight);

// Sun-like key light (golden hour)
const keyLight = new THREE.DirectionalLight(0xFFE4F5, 2.0);
keyLight.position.set(25, 50, 30);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
scene.add(keyLight);

// Neon fill lights
const pinkFill = new THREE.PointLight(0xFF6EB4, 3.5, 70);
pinkFill.position.set(-30, 20, 15);
scene.add(pinkFill);

const lavFill = new THREE.PointLight(0xAA5CF0, 3.0, 70);
lavFill.position.set(30, 12, -25);
scene.add(lavFill);

const cyanRim = new THREE.PointLight(0x7FFFD4, 2.0, 55);
cyanRim.position.set(0, -18, 20);
scene.add(cyanRim);

const goldAccent = new THREE.PointLight(0xFFD700, 1.8, 50);
goldAccent.position.set(15, 30, 25);
scene.add(goldAccent);

// --- 04. PROCEDURAL GALAXY STARFIELD ---
// Thousands of tiny stars in a galaxy disc formation
const starfieldGroup = new THREE.Group();
scene.add(starfieldGroup);

// Layer 1: Dense tiny background stars
(function createDeepStarfield() {
  const starCount = 2800;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  const starColors = [
    [1.0, 0.95, 1.0],   // white
    [0.9, 0.8, 1.0],    // lavender
    [1.0, 0.85, 0.9],   // rose
    [0.8, 0.9, 1.0],    // icy blue
    [1.0, 1.0, 0.85],   // warm yellow
    [0.85, 1.0, 0.95],  // mint
  ];

  for (let i = 0; i < starCount; i++) {
    // Spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 180 + Math.random() * 320;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const col = starColors[Math.floor(Math.random() * starColors.length)];
    colors[i * 3] = col[0];
    colors[i * 3 + 1] = col[1];
    colors[i * 3 + 2] = col[2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.55,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    sizeAttenuation: true
  });

  starfieldGroup.add(new THREE.Points(geo, mat));
})();

// Layer 2: Medium bright stars with glow effect
(function createMidStars() {
  const count = 320;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 100 + Math.random() * 200;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = 1.2 + Math.random() * 1.8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.5,
    color: 0xFFEEFF,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true
  });
  starfieldGroup.add(new THREE.Points(geo, mat));
})();

// --- 05. AURORA BOREALIS (Animated Procedural Planes) ---
const auroraGroup = new THREE.Group();
scene.add(auroraGroup);

function createAuroraPanel(zOffset, hue1, hue2, yPos, scaleX) {
  const geo = new THREE.PlaneGeometry(220, 45, 60, 20);
  const posAttr = geo.attributes.position;

  // Undulate vertices to create wavy curtain shape
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    posAttr.setZ(i, Math.sin(x * 0.08) * 6 + Math.cos(y * 0.12) * 3);
  }
  posAttr.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({
    color: hue1,
    transparent: true,
    opacity: 0.09,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, yPos, zOffset);
  mesh.rotation.x = -Math.PI / 12;
  mesh.userData = { hue1, hue2, phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.3 };
  auroraGroup.add(mesh);
  return mesh;
}

const auroraLayers = [
  createAuroraPanel(-90, 0x9B59B6, 0xFF69B4, 25, 1),
  createAuroraPanel(-75, 0x1ABC9C, 0x87CEEB, 35, 1.2),
  createAuroraPanel(-60, 0xE91E8C, 0xC084FC, 20, 0.9),
  createAuroraPanel(-105, 0x00CED1, 0x9370DB, 30, 1.1),
  createAuroraPanel(-45, 0xFF69B4, 0x20B2AA, 15, 0.85),
];

// --- 06. NEBULA CLOUD VOLUMES ---
(function createNebulaVolumes() {
  const nebulaColors = [0x8B1A6B, 0x4B0082, 0x1A3A6B, 0x6B1A4B, 0x2A1A6B];
  for (let n = 0; n < 5; n++) {
    const cloudGroup = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const r = 15 + Math.random() * 25;
      const geo = new THREE.SphereGeometry(r, 12, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: nebulaColors[n % nebulaColors.length],
        transparent: true,
        opacity: 0.015 + Math.random() * 0.025,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30
      );
      cloudGroup.add(m);
    }
    cloudGroup.position.set(
      (Math.random() - 0.5) * 160,
      (Math.random() - 0.5) * 60 + 10,
      -100 - Math.random() * 80
    );
    scene.add(cloudGroup);
  }
})();

// --- 07. ENCHANTED FLOATING ISLAND (REDESIGNED) ---
const islandGroup = new THREE.Group();
scene.add(islandGroup);

// Island base — candy gradient layers
const islandLayerMats = [
  new THREE.MeshStandardMaterial({ color: 0x3D1A6E, roughness: 0.6, metalness: 0.15 }),  // Deep base
  new THREE.MeshStandardMaterial({ color: 0x6B2FA0, roughness: 0.5, metalness: 0.1 }),   // Mid
  new THREE.MeshStandardMaterial({ color: 0x9B4ED0, roughness: 0.45, metalness: 0.08 }), // Upper-mid
];

// Rock layers stacked for depth
const rock1 = new THREE.Mesh(new THREE.CylinderGeometry(13.5, 10.5, 2.0, 32), islandLayerMats[0]);
rock1.position.y = -4;
islandGroup.add(rock1);

const rock2 = new THREE.Mesh(new THREE.CylinderGeometry(14.0, 13.5, 1.5, 32), islandLayerMats[1]);
rock2.position.y = -2.5;
islandGroup.add(rock2);

const rock3 = new THREE.Mesh(new THREE.CylinderGeometry(14.5, 14.0, 1.0, 32), islandLayerMats[2]);
rock3.position.y = -1.5;
islandGroup.add(rock3);

// Dreamy candy-pink grass top
const grassGeo = new THREE.CylinderGeometry(14.8, 14.5, 0.9, 48);
const grassMat = new THREE.MeshStandardMaterial({
  color: 0xFFB7D5,
  roughness: 0.65,
  metalness: 0.03,
  emissive: 0xFF80C0,
  emissiveIntensity: 0.12
});
const islandTop = new THREE.Mesh(grassGeo, grassMat);
islandTop.position.y = -0.6;
islandGroup.add(islandTop);

// Soft lavender inner ring on top (decorative trim)
const trimGeo = new THREE.TorusGeometry(13.5, 0.55, 12, 60);
const trimMat = new THREE.MeshStandardMaterial({
  color: 0xDDA0DD,
  emissive: 0xC084FC,
  emissiveIntensity: 0.3,
  roughness: 0.3
});
const islandTrim = new THREE.Mesh(trimGeo, trimMat);
islandTrim.rotation.x = Math.PI / 2;
islandTrim.position.y = -0.1;
islandGroup.add(islandTrim);

// Glowing orbital ring (tilted)
const ringGeo = new THREE.TorusGeometry(21, 0.45, 18, 80);
const ringMat = new THREE.MeshStandardMaterial({
  color: 0xFF80AB,
  emissive: 0xF472B6,
  emissiveIntensity: 0.65,
  roughness: 0.15,
  metalness: 0.3
});
const orbitRing = new THREE.Mesh(ringGeo, ringMat);
orbitRing.rotation.x = Math.PI / 2.4;
orbitRing.position.y = -1.5;
islandGroup.add(orbitRing);

// Second thinner ring (lavender)
const ring2Geo = new THREE.TorusGeometry(19, 0.22, 12, 70);
const ring2Mat = new THREE.MeshStandardMaterial({
  color: 0xC084FC,
  emissive: 0xA855F7,
  emissiveIntensity: 0.5,
  roughness: 0.2
});
const orbitRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
orbitRing2.rotation.x = Math.PI / 1.9;
orbitRing2.rotation.z = Math.PI / 6;
orbitRing2.position.y = -1.5;
islandGroup.add(orbitRing2);

// Orbiting moons
function createMoon(radius, color, emissiveColor) {
  const geo = new THREE.SphereGeometry(radius, 20, 20);
  const mat = new THREE.MeshStandardMaterial({ color, emissive: emissiveColor, emissiveIntensity: 0.4, roughness: 0.5 });
  return new THREE.Mesh(geo, mat);
}
const moon1 = createMoon(1.3, 0xFFE4F0, 0xF9A8D4);
const moon2 = createMoon(0.9, 0xEDE9FE, 0xC084FC);
const moon3 = createMoon(0.65, 0xE0F7FF, 0x7DD3FC);
islandGroup.add(moon1, moon2, moon3);

// --- 08. CUTE 3D OBJECTS ON THE ISLAND ---

// 1. REDESIGNED MAGICAL LAPTOP (more detailed, glowing screen)
const laptopGroup = new THREE.Group();
laptopGroup.position.set(-3, 0.4, 2);
laptopGroup.rotation.y = Math.PI / 6;
islandGroup.add(laptopGroup);

// Keyboard base
const lapBaseGeo = new THREE.BoxGeometry(6.5, 0.3, 4.8);
const lapMat = new THREE.MeshStandardMaterial({ color: 0xFFF0F5, roughness: 0.25, metalness: 0.05 });
const lapBase = new THREE.Mesh(lapBaseGeo, lapMat);
laptopGroup.add(lapBase);

// Screen lid (tilted back)
const lapLidGeo = new THREE.BoxGeometry(6.5, 4.6, 0.22);
const lapLid = new THREE.Mesh(lapLidGeo, lapMat);
lapLid.position.set(0, 2.4, -2.3);
lapLid.rotation.x = -Math.PI / 9;
laptopGroup.add(lapLid);

// Screen bezel (dark inner frame)
const bezelGeo = new THREE.PlaneGeometry(6.0, 4.1);
const bezelMat = new THREE.MeshBasicMaterial({ color: 0x1A0A2E });
const bezel = new THREE.Mesh(bezelGeo, bezelMat);
bezel.position.set(0, 2.4, -2.19);
bezel.rotation.x = -Math.PI / 9;
laptopGroup.add(bezel);

// Glowing screen (animated gradient via emissive)
const screenGeo = new THREE.PlaneGeometry(5.6, 3.7);
const screenMat = new THREE.MeshBasicMaterial({ color: 0xFF69B4 });
const lapScreen = new THREE.Mesh(screenGeo, screenMat);
lapScreen.position.set(0, 2.4, -2.17);
lapScreen.rotation.x = -Math.PI / 9;
laptopGroup.add(lapScreen);

// Screen glow halo (additive plane behind screen)
const haloGeo = new THREE.PlaneGeometry(8, 6);
const haloMat = new THREE.MeshBasicMaterial({
  color: 0xFF4499,
  transparent: true,
  opacity: 0.08,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
const screenHalo = new THREE.Mesh(haloGeo, haloMat);
screenHalo.position.set(0, 2.4, -2.3);
screenHalo.rotation.x = -Math.PI / 9;
laptopGroup.add(screenHalo);

// Floating code icon (holographic sphere)
const codeOrb = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.75, 1),
  new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFF80C0, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.3, wireframe: false })
);
codeOrb.position.set(0, 5.4, -2.0);
laptopGroup.add(codeOrb);

// 2. REDESIGNED BOBA CUP (more detailed, cute)
const bobaGroup = new THREE.Group();
bobaGroup.position.set(5.8, 0.4, 1.5);
islandGroup.add(bobaGroup);

// Cup body (tapered glass)
const cupGeo = new THREE.CylinderGeometry(1.1, 0.75, 2.8, 32);
const cupMat = new THREE.MeshPhysicalMaterial({
  color: 0xFFE4EF,
  transmission: 0.5,
  opacity: 0.9,
  transparent: true,
  roughness: 0.05,
  ior: 1.4
});
const cup = new THREE.Mesh(cupGeo, cupMat);
cup.position.y = 1.4;
bobaGroup.add(cup);

// Strawberry milk liquid
const milkGeo = new THREE.CylinderGeometry(1.0, 0.68, 2.0, 24);
const milkMat = new THREE.MeshStandardMaterial({ color: 0xFF8DB4, roughness: 0.5, emissive: 0xFF4488, emissiveIntensity: 0.1 });
const milk = new THREE.Mesh(milkGeo, milkMat);
milk.position.y = 1.2;
bobaGroup.add(milk);

// Boba pearls (tiny dark spheres at bottom)
for (let i = 0; i < 7; i++) {
  const pearl = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x3A1A2E, roughness: 0.6 })
  );
  const angle = (i / 7) * Math.PI * 2;
  pearl.position.set(Math.cos(angle) * 0.4, 0.4, Math.sin(angle) * 0.3);
  bobaGroup.add(pearl);
}

// Cup dome lid (cute rounded top)
const lidGeo = new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
const lidMat = new THREE.MeshPhysicalMaterial({ color: 0xFFD5E8, transparent: true, opacity: 0.85, roughness: 0.1 });
const cupLid = new THREE.Mesh(lidGeo, lidMat);
cupLid.position.y = 2.78;
bobaGroup.add(cupLid);

// Spiral straw (purple)
const strawGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.5, 12);
const strawMat = new THREE.MeshStandardMaterial({ color: 0xAA55FF, roughness: 0.4, emissive: 0x8833DD, emissiveIntensity: 0.2 });
const straw = new THREE.Mesh(strawGeo, strawMat);
straw.position.set(0.25, 2.5, 0.1);
straw.rotation.z = -0.22;
bobaGroup.add(straw);

// 3. CUTE MAGIC FLOWER POT (more elaborate)
const plantGroup = new THREE.Group();
plantGroup.position.set(3.5, 0.4, -4.5);
islandGroup.add(plantGroup);

const potGeo = new THREE.CylinderGeometry(1.4, 1.0, 1.8, 24);
const potMat = new THREE.MeshStandardMaterial({ color: 0xE0CCFF, roughness: 0.4, metalness: 0.05, emissive: 0xC084FC, emissiveIntensity: 0.07 });
const pot = new THREE.Mesh(potGeo, potMat);
pot.position.y = 0.9;
plantGroup.add(pot);

// Pot rim
const potRimGeo = new THREE.TorusGeometry(1.4, 0.18, 10, 30);
const potRim = new THREE.Mesh(potRimGeo, new THREE.MeshStandardMaterial({ color: 0xC084FC, emissive: 0xA855F7, emissiveIntensity: 0.2, roughness: 0.3 }));
potRim.rotation.x = Math.PI / 2;
potRim.position.y = 1.8;
plantGroup.add(potRim);

// Soil
const soilGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16);
const soil = new THREE.Mesh(soilGeo, new THREE.MeshStandardMaterial({ color: 0x5C3A1E, roughness: 0.9 }));
soil.position.y = 1.9;
plantGroup.add(soil);

// Stem
const stemGeo = new THREE.CylinderGeometry(0.1, 0.12, 2.5, 10);
const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0x4ADE80, roughness: 0.6 }));
stem.position.y = 3.1;
plantGroup.add(stem);

// SAKURA FLOWER on top
const flowerCenter = new THREE.Mesh(
  new THREE.SphereGeometry(0.42, 14, 14),
  new THREE.MeshStandardMaterial({ color: 0xFFE566, emissive: 0xFFCC00, emissiveIntensity: 0.4, roughness: 0.3 })
);
flowerCenter.position.set(0, 4.4, 0);
plantGroup.add(flowerCenter);

for (let i = 0; i < 6; i++) {
  const angle = (i / 6) * Math.PI * 2;
  const petal = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xFFCCE0, emissive: 0xFF80AA, emissiveIntensity: 0.18, roughness: 0.5 })
  );
  petal.scale.set(1.6, 0.6, 0.35);
  petal.position.set(Math.cos(angle) * 0.75, 4.4, Math.sin(angle) * 0.75);
  petal.rotation.y = angle;
  plantGroup.add(petal);
}

// Extra tiny sparkle sphere on flower
const sparkOrb = new THREE.Mesh(
  new THREE.SphereGeometry(0.22, 10, 10),
  new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFDD88, emissiveIntensity: 0.9 })
);
sparkOrb.position.set(0, 5.0, 0);
plantGroup.add(sparkOrb);

// 4. MAGICAL OPEN BOOK (new object)
const bookGroup = new THREE.Group();
bookGroup.position.set(-6.5, 0.4, -3.0);
bookGroup.rotation.y = -Math.PI / 5;
islandGroup.add(bookGroup);

// Left page
const pageL = new THREE.Mesh(
  new THREE.BoxGeometry(2.8, 0.08, 3.5),
  new THREE.MeshStandardMaterial({ color: 0xFFF5F9, roughness: 0.3 })
);
pageL.position.set(-1.4, 0.04, 0);
pageL.rotation.z = -0.1;
bookGroup.add(pageL);

// Right page
const pageR = new THREE.Mesh(
  new THREE.BoxGeometry(2.8, 0.08, 3.5),
  new THREE.MeshStandardMaterial({ color: 0xFFF0F8, roughness: 0.3 })
);
pageR.position.set(1.4, 0.04, 0);
pageR.rotation.z = 0.1;
bookGroup.add(pageR);

// Book spine
const spine = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.3, 3.5),
  new THREE.MeshStandardMaterial({ color: 0xFF8DB4, roughness: 0.5, emissive: 0xF472B6, emissiveIntensity: 0.15 })
);
bookGroup.add(spine);

// Tiny lines on pages (decorative)
for (let i = 0; i < 6; i++) {
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.02, 0.06),
    new THREE.MeshBasicMaterial({ color: 0xFFCCDD })
  );
  line.position.set(-1.4, 0.1, -1.3 + i * 0.5);
  bookGroup.add(line);
}

// Floating heart above book
const bookHeart = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.3, 0),
  new THREE.MeshStandardMaterial({ color: 0xFF4488, emissive: 0xFF2266, emissiveIntensity: 0.7 })
);
bookHeart.position.set(0, 1.6, 0);
bookGroup.add(bookHeart);

// 5. SPINNING CRYSTAL CLUSTER (new object)
const crystalGroup = new THREE.Group();
crystalGroup.position.set(-4.5, 0.4, 5.5);
islandGroup.add(crystalGroup);

const crystalColors = [0xFF80C0, 0xC084FC, 0x60D0FF, 0xFFD700, 0x80FFD0];
for (let i = 0; i < 5; i++) {
  const h = 1.5 + Math.random() * 2;
  const crystalGeo = new THREE.ConeGeometry(0.3 + Math.random() * 0.2, h, 6);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: crystalColors[i],
    emissive: crystalColors[i],
    emissiveIntensity: 0.4,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  const angle = (i / 5) * Math.PI * 2;
  crystal.position.set(Math.cos(angle) * 0.9, h / 2, Math.sin(angle) * 0.9);
  crystal.rotation.z = (Math.random() - 0.5) * 0.5;
  crystal.rotation.x = (Math.random() - 0.5) * 0.3;
  crystalGroup.add(crystal);
}

// Center big crystal
const bigCrystal = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.9, 0),
  new THREE.MeshStandardMaterial({
    color: 0xFFCCEE,
    emissive: 0xFF80C0,
    emissiveIntensity: 0.6,
    roughness: 0.08,
    metalness: 0.4,
    transparent: true,
    opacity: 0.9
  })
);
bigCrystal.position.y = 2.5;
crystalGroup.add(bigCrystal);

// --- 09. RAINBOW ARCH (Iconic cute element) ---
const rainbowGroup = new THREE.Group();
rainbowGroup.position.set(0, 5, -18);
rainbowGroup.rotation.y = Math.PI / 12;
scene.add(rainbowGroup);

const rainbowColors = [0xFF4444, 0xFF9933, 0xFFEE00, 0x44FF44, 0x44AAFF, 0x8833FF, 0xFF44DD];
rainbowColors.forEach((col, i) => {
  const arcRadius = 10.5 + i * 1.5;
  const arcGeo = new THREE.TorusGeometry(arcRadius, 0.38, 10, 60, Math.PI);
  const arcMat = new THREE.MeshStandardMaterial({
    color: col,
    emissive: col,
    emissiveIntensity: 0.35,
    roughness: 0.4,
    transparent: true,
    opacity: 0.75
  });
  const arc = new THREE.Mesh(arcGeo, arcMat);
  arc.rotation.z = Math.PI; // flip arch to point up
  rainbowGroup.add(arc);
});

// --- 10. PROCEDURAL DREAM CLOUDS (More Gorgeous) ---
const cloudGroup = new THREE.Group();
scene.add(cloudGroup);

function createDreamCloud(x, y, z, scale, color, opacity) {
  const cloud = new THREE.Group();
  const count = 8 + Math.floor(Math.random() * 5);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    transparent: true,
    opacity: opacity || 0.88,
    depthWrite: false
  });

  for (let i = 0; i < count; i++) {
    const r = (1.8 + Math.random() * 1.8) * scale;
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 14), mat);
    m.position.set(
      (Math.random() - 0.5) * 5 * scale,
      (Math.random() - 0.5) * 1.6 * scale,
      (Math.random() - 0.5) * 2.5 * scale
    );
    cloud.add(m);
  }
  cloud.position.set(x, y, z);
  cloud.userData = { initY: y, speed: 0.5 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2, driftX: (Math.random() - 0.5) * 0.008 };
  return cloud;
}

const dreamClouds = [
  createDreamCloud(-36, 16, -14, 2.0, 0xFFE4F2, 0.90),
  createDreamCloud(38, 20, -22, 2.4, 0xEDE9FE, 0.88),
  createDreamCloud(-22, -6, -10, 1.6, 0xE0F7FF, 0.85),
  createDreamCloud(28, -8, -6, 1.8, 0xFFE4F2, 0.87),
  createDreamCloud(-48, 4, -32, 2.8, 0xEDE9FE, 0.80),
  createDreamCloud(42, 6, -38, 3.0, 0xFFE4F2, 0.75),
  createDreamCloud(-15, 28, -40, 2.2, 0xE0F7FF, 0.72),
  createDreamCloud(20, 24, -35, 1.9, 0xEDE9FE, 0.70),
];

dreamClouds.forEach(c => cloudGroup.add(c));

// --- 11. SAKURA PETAL RAIN (More Dense & Varied) ---
const petalGroup = new THREE.Group();
scene.add(petalGroup);

const petalColors = [0xFFB3CC, 0xFFCCE0, 0xF9A8D4, 0xFFD5EA, 0xFFC0CB, 0xFFAACC];
const petalGeos = petalColors.map(c => {
  const g = new THREE.SphereGeometry(0.3, 8, 8);
  g.scale(2.0, 0.35, 1.1);
  return g;
});

const petals = [];
for (let i = 0; i < 160; i++) {
  const colIdx = Math.floor(Math.random() * petalColors.length);
  const petal = new THREE.Mesh(
    petalGeos[colIdx],
    new THREE.MeshStandardMaterial({
      color: petalColors[colIdx],
      roughness: 0.5,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.3,
      side: THREE.DoubleSide,
      emissive: petalColors[colIdx],
      emissiveIntensity: 0.05
    })
  );
  petal.position.set(
    (Math.random() - 0.5) * 95,
    Math.random() * 70 - 25,
    (Math.random() - 0.5) * 70
  );
  petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  petal.userData = {
    fallSpeed: 0.055 + Math.random() * 0.08,
    rotX: (Math.random() - 0.5) * 0.045,
    rotY: (Math.random() - 0.5) * 0.04,
    swaySpd: 0.8 + Math.random() * 2.2,
    swayAmp: 0.025 + Math.random() * 0.04
  };
  petalGroup.add(petal);
  petals.push(petal);
}

// --- 12. DECORATIVE OCTAHEDRON STARS ---
const starGroup = new THREE.Group();
scene.add(starGroup);

const sparkStars = [];
for (let i = 0; i < 50; i++) {
  const starCol = [0xFFE566, 0xFFBBDD, 0xBBDDFF, 0xBBFFDD, 0xFFCCFF][Math.floor(Math.random() * 5)];
  const star = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.5 + Math.random() * 0.5, 0),
    new THREE.MeshStandardMaterial({
      color: starCol,
      emissive: starCol,
      emissiveIntensity: 0.55,
      roughness: 0.2
    })
  );
  star.position.set(
    (Math.random() - 0.5) * 85,
    Math.random() * 55 - 20,
    (Math.random() - 0.5) * 60
  );
  star.scale.set(1, 1.9, 1);
  star.userData = { rotSpd: 0.018 + Math.random() * 0.035, pulseSpd: 1.2 + Math.random() * 2.5 };
  starGroup.add(star);
  sparkStars.push(star);
}

// --- 13. FLOATING MAGIC PARTICLES (Tiny glowing orbs everywhere) ---
const particleGroup = new THREE.Group();
scene.add(particleGroup);
const magicParticles = [];

const orb_colors = [0xFF80C0, 0xC084FC, 0x60D0FF, 0xFFD700, 0x80FFD0, 0xFF80FF];
for (let i = 0; i < 80; i++) {
  const col = orb_colors[Math.floor(Math.random() * orb_colors.length)];
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.15 + Math.random() * 0.2, 8, 8),
    new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9, roughness: 0.1 })
  );
  orb.position.set(
    (Math.random() - 0.5) * 60,
    Math.random() * 40 - 10,
    (Math.random() - 0.5) * 40
  );
  orb.userData = {
    phase: Math.random() * Math.PI * 2,
    floatAmp: 0.5 + Math.random() * 1.5,
    floatSpd: 0.5 + Math.random() * 1.5,
    initY: orb.position.y
  };
  particleGroup.add(orb);
  magicParticles.push(orb);
}

// --- 14. CLICK-TO-SPAWN HEARTS & SPARKLE BURSTS ---
const burstParticles = [];

const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0.5);
heartShape.bezierCurveTo(0, 0.8, -0.65, 1.1, -1.1, 0.8);
heartShape.bezierCurveTo(-1.5, 0.4, -1.3, -0.4, 0, -1.3);
heartShape.bezierCurveTo(1.3, -0.4, 1.5, 0.4, 1.1, 0.8);
heartShape.bezierCurveTo(0.65, 1.1, 0, 0.8, 0, 0.5);

const heartGeoBase = new THREE.ShapeGeometry(heartShape);

const burstShapes = ['heart', 'star', 'orb'];

function spawnBurst(x, y, z) {
  playSparkleSound();
  const count = 10;
  for (let i = 0; i < count; i++) {
    const type = burstShapes[Math.floor(Math.random() * burstShapes.length)];
    let geo, col;

    if (type === 'heart') {
      geo = heartGeoBase;
      col = [0xFF4488, 0xFF80AA, 0xFF66BB][Math.floor(Math.random() * 3)];
    } else if (type === 'star') {
      geo = new THREE.OctahedronGeometry(0.25, 0);
      col = [0xFFD700, 0xFFEE55, 0xFFBB33][Math.floor(Math.random() * 3)];
    } else {
      geo = new THREE.SphereGeometry(0.2, 8, 8);
      col = [0xC084FC, 0xFF80C0, 0x60CCFF][Math.floor(Math.random() * 3)];
    }

    const mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(0.4, 0.4, 0.4);
    mesh.position.set(x, y, z);
    mesh.userData = {
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        0.25 + Math.random() * 0.45,
        (Math.random() - 0.5) * 0.5
      ),
      rotV: (Math.random() - 0.5) * 0.15,
      life: 1.0
    };
    scene.add(mesh);
    burstParticles.push(mesh);
  }
}

// --- 15. MOUSE / TOUCH INTERACTION ---
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let targetRotY = 0, targetRotX = 0;

window.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.hud-nav') && !e.target.closest('.hud-section') && !e.target.closest('.modal-backdrop') && !e.target.closest('.hud-footer')) {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };

    const mx = (e.clientX / window.innerWidth) * 2 - 1;
    const my = -(e.clientY / window.innerHeight) * 2 + 1;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(mx, my), camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -5);
    const pt = new THREE.Vector3();
    ray.ray.intersectPlane(plane, pt);
    if (pt) spawnBurst(pt.x, pt.y, pt.z);
  }
});

window.addEventListener('mouseup', () => { isDragging = false; });

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  targetRotY += (e.clientX - prevMouse.x) * 0.0065;
  targetRotX += (e.clientY - prevMouse.y) * 0.0045;
  targetRotX = Math.max(-0.45, Math.min(0.45, targetRotX));
  prevMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('wheel', (e) => {
  camera.position.z += e.deltaY * 0.028;
  camera.position.z = Math.max(28, Math.min(90, camera.position.z));
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Touch support
window.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    isDragging = true;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
});
window.addEventListener('touchmove', (e) => {
  if (!isDragging || e.touches.length !== 1) return;
  targetRotY += (e.touches[0].clientX - prevMouse.x) * 0.007;
  targetRotX += (e.touches[0].clientY - prevMouse.y) * 0.005;
  targetRotX = Math.max(-0.45, Math.min(0.45, targetRotX));
  prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
window.addEventListener('touchend', () => { isDragging = false; });

// --- 16. ANIMATION LOOP ---
const clock = new THREE.Clock();
let frameCount = 0;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  frameCount++;

  // ~~~ ISLAND GROUP ~~~
  if (!isDragging) targetRotY += 0.0022;
  islandGroup.rotation.y += (targetRotY - islandGroup.rotation.y) * 0.08;
  islandGroup.rotation.x += (targetRotX - islandGroup.rotation.x) * 0.08;
  islandGroup.position.y = Math.sin(t * 1.3) * 0.65;

  // ~~~ ORBITAL RINGS pulse ~~~
  orbitRing.material.emissiveIntensity = 0.5 + Math.sin(t * 2.5) * 0.2;
  orbitRing2.material.emissiveIntensity = 0.4 + Math.sin(t * 2.0 + 1) * 0.2;
  orbitRing.rotation.z = t * 0.15;
  orbitRing2.rotation.z = -t * 0.12;

  // ~~~ MOONS orbit ~~~
  moon1.position.set(Math.cos(t * 1.1) * 21, -2 + Math.sin(t * 1.1) * 2.5, Math.sin(t * 1.1) * 21);
  moon2.position.set(Math.cos(-t * 0.8 + 2) * 20, -2 + Math.sin(-t * 0.8 + 2) * 2, Math.sin(-t * 0.8 + 2) * 20);
  moon3.position.set(Math.cos(t * 1.4 + 1) * 22, -2 + Math.sin(t * 1.4 + 1) * 1.5, Math.sin(t * 1.4 + 1) * 22);

  // ~~~ LAPTOP screen color shift ~~~
  const screenHue = (t * 0.4) % 1;
  screenMat.color.setHSL(0.9 + Math.sin(t * 0.5) * 0.1, 0.9, 0.65);
  screenHalo.material.opacity = 0.06 + Math.sin(t * 2) * 0.03;

  // ~~~ CODE ORB spin + pulse ~~~
  codeOrb.rotation.y = t * 2.5;
  codeOrb.rotation.x = Math.sin(t * 1.5) * 0.5;
  codeOrb.position.y = 5.4 + Math.sin(t * 3.2) * 0.4;
  codeOrb.material.emissiveIntensity = 0.7 + Math.sin(t * 4) * 0.3;

  // ~~~ BOBA bobble ~~~
  bobaGroup.position.y = 0.4 + Math.sin(t * 2.0 + 0.8) * 0.14;
  bobaGroup.rotation.y = Math.sin(t * 0.7) * 0.08;

  // ~~~ PLANT sway ~~~
  plantGroup.rotation.z = Math.sin(t * 1.1) * 0.04;
  sparkOrb.material.emissiveIntensity = 0.7 + Math.sin(t * 5) * 0.3;

  // ~~~ CRYSTAL cluster spin + pulse ~~~
  crystalGroup.rotation.y = t * 0.5;
  bigCrystal.rotation.y = t * 2;
  bigCrystal.rotation.x = Math.sin(t * 1.5) * 0.5;
  bigCrystal.material.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.3;

  // ~~~ BOOK floating ~~~
  bookGroup.position.y = 0.4 + Math.sin(t * 1.8 + 2) * 0.12;
  bookHeart.position.y = 1.6 + Math.sin(t * 3.5) * 0.25;
  bookHeart.rotation.y = t * 2.2;

  // ~~~ RAINBOW ARCH pulse ~~~
  rainbowGroup.children.forEach((arc, i) => {
    arc.material.emissiveIntensity = 0.25 + Math.sin(t * 1.5 + i * 0.5) * 0.15;
    arc.material.opacity = 0.65 + Math.sin(t * 1.2 + i * 0.4) * 0.12;
  });
  rainbowGroup.position.y = 5 + Math.sin(t * 0.6) * 0.8;

  // ~~~ AURORA WAVES animate ~~~
  auroraLayers.forEach((aurora, i) => {
    aurora.material.opacity = 0.07 + Math.sin(t * aurora.userData.speed + aurora.userData.phase) * 0.045;
    aurora.position.x = Math.sin(t * 0.15 + i * 1.2) * 15;
    aurora.position.y = aurora.position.y + Math.sin(t * 0.3 + i) * 0.005;
    // Color shift
    const hue = (0.75 + Math.sin(t * 0.2 + i) * 0.15) % 1;
    aurora.material.color.setHSL(hue, 0.9, 0.5);
  });

  // ~~~ STARFIELD gentle rotation ~~~
  starfieldGroup.rotation.y = t * 0.012;
  starfieldGroup.rotation.x = Math.sin(t * 0.008) * 0.04;

  // ~~~ DREAM CLOUDS ~~~
  dreamClouds.forEach(c => {
    c.position.y = c.userData.initY + Math.sin(t * c.userData.speed + c.userData.phase) * 1.8;
    c.position.x += c.userData.driftX;
    if (c.position.x > 60) c.position.x = -60;
    if (c.position.x < -60) c.position.x = 60;
  });

  // ~~~ SAKURA PETALS ~~~
  petals.forEach(p => {
    p.position.y -= p.userData.fallSpeed;
    p.position.x += Math.sin(t * p.userData.swaySpd) * p.userData.swayAmp;
    p.rotation.x += p.userData.rotX;
    p.rotation.y += p.userData.rotY;
    if (p.position.y < -30) {
      p.position.y = 42;
      p.position.x = (Math.random() - 0.5) * 95;
      p.position.z = (Math.random() - 0.5) * 70;
    }
  });

  // ~~~ DECORATIVE STARS ~~~
  sparkStars.forEach(s => {
    s.rotation.y += s.userData.rotSpd;
    const sc = 1 + Math.sin(t * s.userData.pulseSpd) * 0.28;
    s.scale.set(sc, sc * 2, sc);
  });

  // ~~~ MAGIC PARTICLES ~~~
  magicParticles.forEach(p => {
    p.position.y = p.userData.initY + Math.sin(t * p.userData.floatSpd + p.userData.phase) * p.userData.floatAmp;
    p.material.emissiveIntensity = 0.7 + Math.sin(t * 2 + p.userData.phase) * 0.3;
  });

  // ~~~ POINT LIGHTS animate (subtle pulse) ~~~
  pinkFill.intensity = 3.0 + Math.sin(t * 2.2) * 0.6;
  lavFill.intensity = 2.7 + Math.sin(t * 1.8 + 1) * 0.5;
  cyanRim.intensity = 1.8 + Math.sin(t * 2.6 + 2) * 0.4;

  // ~~~ BURST PARTICLES ~~~
  for (let i = burstParticles.length - 1; i >= 0; i--) {
    const bp = burstParticles[i];
    bp.position.addScaledVector(bp.userData.vel, 1);
    bp.userData.vel.y -= 0.012; // gentle gravity
    bp.rotation.z += bp.userData.rotV;
    bp.userData.life -= 0.016;
    bp.material.opacity = bp.userData.life;
    if (bp.userData.life <= 0) {
      scene.remove(bp);
      burstParticles.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

animate();

// --- 17. UI OVERLAY SECTION NAVIGATION ---
window.switchSection = function (secId) {
  playSparkleSound();
  document.querySelectorAll('.hud-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('sec-' + secId);
  if (target) {
    target.classList.add('active');
    target.style.animation = 'none';
    requestAnimationFrame(() => { target.style.animation = ''; });
  }
};

// --- 18. PROJECT MODALS ---
const projectData = {
  animeshelf: {
    badge: '01 // FULL-STACK WEB CRAFT',
    emoji: '✨',
    title: 'My Anime Shelf',
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
    badge: '02 // MACHINE LEARNING',
    emoji: '🌫️',
    title: 'Air Quality Trend Predictor',
    tagline: 'Multi-horizon atmospheric PM2.5 forecasting across 12 Beijing monitoring stations using machine learning regression.',
    highlights: [
      '<b>Time-Series Feature Engineering:</b> Engineered meteorological vectors (temperature, dew point, pressure, wind) for ML regression models.',
      '<b>UCI PRSA Dataset:</b> Processed extensive historical multi-station sensor records for Beijing air quality analysis.',
      '<b>Robust Data Pipeline:</b> Outlier filtering, categorical weather encoding, and cross-validated statistical benchmarks.'
    ],
    stack: ['Python 3.8+', 'Scikit-Learn', 'Pandas', 'NumPy', 'Matplotlib'],
    repo: 'https://github.com/SadhaSri697/Air-Quality-Trend-Predictor'
  },
  studenteda: {
    badge: '03 // DATA SCIENCE',
    emoji: '📊',
    title: 'Student Health Analytics',
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
    badge: '04 // AUTOMATION & AI',
    emoji: '🪄',
    title: 'web2skill (w2s)',
    tagline: 'Automated skill generator turning websites into comprehensive structured references for AI coding agents.',
    highlights: [
      '<b>Agent Readiness:</b> Converts web platforms into hierarchical SKILL.md specifications documenting every interactive element and state.',
      '<b>DOM Exploration:</b> Automatically maps forms, routes, and edge cases to eliminate manual agent priming and configuration.'
    ],
    stack: ['Python', 'Web Scraping', 'AI Agent Skills', 'Markdown Parser'],
    repo: 'https://github.com/SadhaSri697/Webtoskill'
  }
};

window.openModal = function (id) {
  playSparkleSound();
  const d = projectData[id];
  if (!d) return;
  const demoBtn = d.demo ? `<a href="${d.demo}" target="_blank" rel="noopener" class="cute-btn cute-btn-primary" style="font-size:12px;padding:7px 18px;">Live Demo ↗</a>` : '';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <span style="font-size:36px">${d.emoji}</span>
      <div>
        <span class="proj-tag tag-pink" style="display:inline-block;margin-bottom:4px;">${d.badge}</span>
        <h3 style="font-size:22px;font-weight:800;color:#FFF0F8;line-height:1.2;">${d.title}</h3>
      </div>
    </div>
    <p style="font-size:13.5px;color:#E2C8E8;line-height:1.65;margin-bottom:18px;">${d.tagline}</p>
    <div style="background:rgba(50,20,80,0.6);border:1px solid rgba(255,128,192,0.2);border-radius:16px;padding:16px;margin-bottom:18px;">
      <h5 style="font-size:10px;font-family:var(--font-mono);color:#FF8DB4;letter-spacing:1.5px;margin-bottom:10px;">✦ KEY CONTRIBUTIONS</h5>
      <ul style="font-size:12.5px;color:#EDE0F5;line-height:1.65;padding-left:16px;">
        ${d.highlights.map(h => `<li style="margin-bottom:7px;">${h}</li>`).join('')}
      </ul>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:22px;">
      ${d.stack.map(s => `<span class="skill-pill">${s}</span>`).join('')}
    </div>
    <div style="display:flex;justify-content:flex-end;gap:10px;">
      <a href="${d.repo}" target="_blank" rel="noopener" class="cute-btn cute-btn-secondary" style="font-size:12px;padding:7px 18px;">View Code ↗</a>
      ${demoBtn}
    </div>
  `;
  document.getElementById('project-modal').classList.add('open');
};

window.closeModal = function (e) {
  if (!e || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close-btn')) {
    document.getElementById('project-modal').classList.remove('open');
  }
};
