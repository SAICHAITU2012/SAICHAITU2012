// =========================================================================
// 🌸✨ S. SADHASRI — ENCHANTED PASTEL DREAMSCAPE 3D PORTFOLIO v5.2
// Masterpiece Floral Bouquet · Saturated Sunset · Cozy 3D Studio
// =========================================================================

// --- 01. AUDIO ENGINE (PLAYFUL SYNTH CHIMES) ---
let audioCtx = null, soundEnabled = true;
function initAudio() {
  if (!audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtor) audioCtx = new AudioCtor();
  }
}
const CHIME_PITCHES = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
function playChime(pitchMultiplier = 1) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;
  if (audioCtx.state !== 'running') audioCtx.resume();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const baseFreq = CHIME_PITCHES[Math.floor(Math.random() * CHIME_PITCHES.length)];
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * pitchMultiplier, audioCtx.currentTime);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch(e) {}
}

window.toggleAudio = function() {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById('sound-icon');
  const label = document.getElementById('sound-label');
  if (icon) icon.textContent = soundEnabled ? '🎵' : '🔇';
  if (label) label.textContent = soundEnabled ? 'Sound: ON' : 'Sound: OFF';
  if (soundEnabled) playChime(1.2);
};

// --- 02. THREE.JS SCENE & CAMERA SETUP ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// Camera framed directly on the hero floral island & laptop
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 800);
camera.position.set(0, 8.5, 33);
camera.lookAt(0, 2.0, 0);

// WebGL Renderer with sRGB encoding and ACES filmic tone mapping
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

// --- 03. VIBRANT SUNSET SKY DOME (CANVAS TEXTURE) ---
(function initSunsetSky() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  
  // Rich vertical sunset gradient (Lilac Twilight -> Magenta Rose -> Sunset Coral -> Warm Peach -> Golden Sunrise)
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0.00, '#321E56'); // Deep celestial violet
  g.addColorStop(0.20, '#5C2D7E'); // Rich royal lilac
  g.addColorStop(0.38, '#993574'); // Vivid orchid
  g.addColorStop(0.55, '#D63C6A'); // Saturated cotton-candy rose
  g.addColorStop(0.72, '#F06363'); // Radiant sunset coral
  g.addColorStop(0.86, '#FFA05A'); // Warm peach
  g.addColorStop(1.00, '#FFDC88'); // Golden sunrise cream
  
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  
  // Paint twinkling stars in upper celestial sky
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let i = 0; i < 95; i++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 260;
    const sr = Math.random() * 1.6 + 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const skyTex = new THREE.CanvasTexture(c);
  skyTex.generateMipmaps = true;
  scene.background = skyTex;
})();

// Distant warm fog: Starts far away (110 units)
scene.fog = new THREE.Fog(0xFFA090, 110, 300);

// --- 04. VIBRANT LIGHTING (BALANCED, NO BLOWOUT) ---
const ambientLight = new THREE.AmbientLight(0xFFE0E8, 0.65);
scene.add(ambientLight);

// Golden sunlight from top right
const sunLight = new THREE.DirectionalLight(0xFFF0D4, 1.35);
sunLight.position.set(20, 32, 24);
scene.add(sunLight);

// Saturated Magenta-Pink fill light from left-front
const pinkFill = new THREE.PointLight(0xFF2266, 1.7, 75);
pinkFill.position.set(-20, 12, 20);
scene.add(pinkFill);

// Saturated Violet-Lavender fill light from right-back
const lavFill = new THREE.PointLight(0x8B5CF6, 1.5, 75);
lavFill.position.set(24, 12, -16);
scene.add(lavFill);

// Warm Peach under-glow
const peachUnder = new THREE.PointLight(0xFF8833, 1.1, 55);
peachUnder.position.set(0, -10, 10);
scene.add(peachUnder);

// --- 05. DREAM ARCH PORTAL & 3D ART SHAPES (REFERENCE 03) ---
const portalGroup = new THREE.Group();
portalGroup.position.set(2, 10, -42);
portalGroup.rotation.y = -0.12;
scene.add(portalGroup);

// Main Arch (Lilac-Lavender Torus)
const archGeo = new THREE.TorusGeometry(21, 1.8, 24, 64, Math.PI);
const archMat = new THREE.MeshStandardMaterial({
  color: 0x9333EA,
  roughness: 0.32,
  metalness: 0.12,
  emissive: 0x6B21A8,
  emissiveIntensity: 0.3
});
const archMesh = new THREE.Mesh(archGeo, archMat);
archMesh.rotation.z = Math.PI;
portalGroup.add(archMesh);

// Inner decorative thin gold/pink ring
const innerRingGeo = new THREE.TorusGeometry(17.8, 0.35, 16, 64, Math.PI);
const innerRingMat = new THREE.MeshStandardMaterial({
  color: 0xF472B6,
  roughness: 0.2,
  metalness: 0.3,
  emissive: 0xDB2777,
  emissiveIntensity: 0.45
});
const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
innerRing.rotation.z = Math.PI;
innerRing.position.z = 0.35;
portalGroup.add(innerRing);

// Glowing portal disc
const portalDiscMat = new THREE.MeshBasicMaterial({
  color: 0xFBCFE8,
  transparent: true,
  opacity: 0.28,
  side: THREE.DoubleSide,
  depthWrite: false
});
const portalDisc = new THREE.Mesh(new THREE.CircleGeometry(19.5, 48, 0, Math.PI), portalDiscMat);
portalDisc.rotation.z = Math.PI;
portalDisc.position.z = -0.7;
portalGroup.add(portalDisc);

// Arch Base Plinth
const archBase = new THREE.Mesh(
  new THREE.BoxGeometry(46, 1.2, 4),
  new THREE.MeshStandardMaterial({ color: 0xA855F7, roughness: 0.5, metalness: 0.05 })
);
archBase.position.y = -0.6;
portalGroup.add(archBase);

// Floating Torus Knot (Creative 3D shape from Reference 03)
const knotGeo = new THREE.TorusKnotGeometry(3.6, 1.0, 80, 20, 2, 3);
const knotMat = new THREE.MeshStandardMaterial({
  color: 0x8B5CF6,
  roughness: 0.25,
  metalness: 0.2,
  emissive: 0x6D28D9,
  emissiveIntensity: 0.25
});
const knotMesh = new THREE.Mesh(knotGeo, knotMat);
knotMesh.position.set(-26, 18, -34);
scene.add(knotMesh);

// Floating pastel spheres at varied depths (Reference 03)
const floatSpheres = [];
const sphereConfigs = [
  { pos: [-16, 20, -28], r: 3.0, color: 0xFF2D6F, emissive: 0xBE123C, rough: 0.3 },
  { pos: [22, 23, -36],  r: 2.7, color: 0xF97316, emissive: 0xC2410C, rough: 0.4 },
  { pos: [-10, 5, -22],  r: 1.8, color: 0xA855F7, emissive: 0x7E22CE, rough: 0.35 },
  { pos: [28, 12, -30],  r: 3.5, color: 0xEC4899, emissive: 0xBE185D, rough: 0.3 },
  { pos: [-24, 11, -20], r: 1.6, color: 0x6366F1, emissive: 0x4338CA, rough: 0.3 },
  { pos: [14, 26, -40],  r: 2.5, color: 0xFBBF24, emissive: 0xD97706, rough: 0.4 },
  { pos: [-7, 28, -36],  r: 2.0, color: 0xF43F5E, emissive: 0xBE123C, rough: 0.35 },
  { pos: [32, 5, -24],   r: 1.9, color: 0x10B981, emissive: 0x047857, rough: 0.35 },
  { pos: [-20, -2, -15], r: 2.2, color: 0xC084FC, emissive: 0x7E22CE, rough: 0.4 },
  { pos: [9, -3, -11],   r: 1.2, color: 0xF59E0B, emissive: 0xB45309, rough: 0.3 },
  { pos: [-32, 21, -38], r: 1.9, color: 0xFB7185, emissive: 0xBE123C, rough: 0.35 },
  { pos: [23, -1, -9],   r: 1.4, color: 0x38BDF8, emissive: 0x0284C7, rough: 0.3 }
];
sphereConfigs.forEach(cfg => {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(cfg.r, 32, 32),
    new THREE.MeshStandardMaterial({
      color: cfg.color,
      roughness: cfg.rough,
      metalness: 0.15,
      emissive: cfg.emissive,
      emissiveIntensity: 0.18
    })
  );
  m.position.set(...cfg.pos);
  m.userData = {
    initY: cfg.pos[1],
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.4,
    amp: 0.6 + Math.random() * 1.3
  };
  scene.add(m);
  floatSpheres.push(m);
});

// --- 06. COTTON CANDY CLOUDS (FRAMING LEFT & RIGHT FLANKS) ---
const cloudGroup = new THREE.Group();
scene.add(cloudGroup);

const CLOUD_COLORS = [
  0xF472B6, // Vibrant Rose
  0xA78BFA, // Lavender Lilac
  0xFB923C, // Sunset Peach
  0x38BDF8, // Baby Sky Blue
  0xFF2D6F, // Bubblegum Pink
  0xFBBF24  // Soft Butter Gold
];

function createCottonCandyCloud(x, y, z, scale, colorIdx) {
  const grp = new THREE.Group();
  const puffCount = 8 + Math.floor(Math.random() * 5);
  const col = CLOUD_COLORS[colorIdx % CLOUD_COLORS.length];
  const mat = new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.88,
    metalness: 0,
    transparent: true,
    opacity: 0.90,
    depthWrite: false
  });
  for (let i = 0; i < puffCount; i++) {
    const r = (1.5 + Math.random() * 1.7) * scale;
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat);
    puff.position.set(
      (Math.random() - 0.5) * 5.2 * scale,
      (Math.random() - 0.5) * 2.0 * scale,
      (Math.random() - 0.5) * 2.8 * scale
    );
    grp.add(puff);
  }
  grp.position.set(x, y, z);
  grp.userData = {
    initY: y,
    speed: 0.3 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.007
  };
  return grp;
}

const cloudPlacements = [
  [-32, 15, -17, 1.9, 0], [34, 17, -21, 2.1, 1],
  [-24, -5, -9, 1.7, 2],  [26, -7, -7, 1.8, 3],
  [-42, 6, -26, 2.4, 4],  [40, 7, -28, 2.3, 5],
  [-15, 27, -36, 1.7, 0], [19, 25, -32, 1.8, 1],
  [-28, -6, -15, 1.5, 3], [30, 13, -19, 1.7, 4]
];
const clouds = cloudPlacements.map(cp => {
  const cl = createCottonCandyCloud(...cp);
  cloudGroup.add(cl);
  return cl;
});

// --- 07. FLOATING ISLAND & STUDIO DESK PLATFORM (REFERENCE 01) ---
const islandGroup = new THREE.Group();
islandGroup.position.set(0, 0, 0);
scene.add(islandGroup);

// Rounded dual-tier island pedestal
const baseMat = new THREE.MeshStandardMaterial({
  color: 0xB95349, // Rich terracotta contrast
  roughness: 0.65,
  metalness: 0.04
});
const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(13.2, 9.2, 3.8, 44), baseMat);
baseMesh.position.y = -3.0;
islandGroup.add(baseMesh);

// Middle bevel tier (warm apricot)
const midTierMat = new THREE.MeshStandardMaterial({
  color: 0xE28B78,
  roughness: 0.55
});
const midTier = new THREE.Mesh(new THREE.CylinderGeometry(14.2, 13.2, 0.9, 44), midTierMat);
midTier.position.y = -0.85;
islandGroup.add(midTier);

// Top surface deck (Creamy blush surface)
const deckMat = new THREE.MeshStandardMaterial({
  color: 0xFFF0F5,
  roughness: 0.5,
  metalness: 0.02,
  emissive: 0xFFB6C1,
  emissiveIntensity: 0.1
});
const deck = new THREE.Mesh(new THREE.CylinderGeometry(14.6, 14.2, 0.7, 48), deckMat);
deck.position.y = -0.32;
islandGroup.add(deck);

// Vivid Strawberry Glowing Accent Rim
const rimMat = new THREE.MeshStandardMaterial({
  color: 0xFF1493,
  roughness: 0.25,
  metalness: 0.2,
  emissive: 0xFF1493,
  emissiveIntensity: 0.5
});
const rim = new THREE.Mesh(new THREE.TorusGeometry(14.4, 0.22, 12, 64), rimMat);
rim.rotation.x = Math.PI / 2;
rim.position.y = 0.03;
islandGroup.add(rim);

// Magical halo aura behind island
const islandAura = new THREE.Mesh(
  new THREE.CircleGeometry(19, 48),
  new THREE.MeshBasicMaterial({
    color: 0xFFD1DC,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    side: THREE.DoubleSide
  })
);
islandAura.position.set(0, 2.5, -4);
islandGroup.add(islandAura);

// --- 08. MASTERPIECE 3D FLORAL BOUQUET (INSPIRED BY REFERENCE 01) ---
// Multi-tiered, tilted, highly saturated blossoms exploding around the laptop!
const flowerGroup = new THREE.Group();
islandGroup.add(flowerGroup);

// Petal geometry builder with CAMERA-FACING TILT and rich depth
function createSculptedFlower(x, y, z, scale, petalCol, centerCol, tiltX = 0.5, tiltY = 0) {
  const flower = new THREE.Group();
  flower.position.set(x, y, z);
  flower.scale.setScalar(scale);
  // Tilt blossom face towards the camera (tiltX) so colors are prominently visible!
  flower.rotation.set(tiltX, tiltY, 0);

  // Glowing golden/amber center
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 10),
    new THREE.MeshStandardMaterial({
      color: centerCol,
      roughness: 0.25,
      emissive: centerCol,
      emissiveIntensity: 0.55
    })
  );
  flower.add(center);

  // Layer 1: Inner 5 petals
  const innerPetalGeo = new THREE.SphereGeometry(0.3, 10, 8);
  innerPetalGeo.scale(1.5, 0.5, 0.8);
  const innerMat = new THREE.MeshStandardMaterial({
    color: petalCol,
    roughness: 0.35,
    metalness: 0.05,
    emissive: petalCol,
    emissiveIntensity: 0.25
  });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const p = new THREE.Mesh(innerPetalGeo, innerMat);
    p.position.set(Math.cos(a) * 0.42, 0.1, Math.sin(a) * 0.42);
    p.rotation.y = a;
    p.rotation.z = 0.35; // upward cup
    flower.add(p);
  }

  // Layer 2: Outer 7 fuller petals for lush volume
  const outerPetalGeo = new THREE.SphereGeometry(0.36, 10, 8);
  outerPetalGeo.scale(1.8, 0.4, 0.9);
  const outerMat = new THREE.MeshStandardMaterial({
    color: petalCol,
    roughness: 0.4,
    metalness: 0.02,
    emissive: petalCol,
    emissiveIntensity: 0.2
  });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.4;
    const p = new THREE.Mesh(outerPetalGeo, outerMat);
    p.position.set(Math.cos(a) * 0.72, 0.0, Math.sin(a) * 0.72);
    p.rotation.y = a;
    p.rotation.z = 0.18;
    flower.add(p);
  }

  // Stem connecting down
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.09, 1.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x1E7B34, roughness: 0.6 })
  );
  stem.position.set(0, -0.6, 0);
  stem.rotation.x = -tiltX * 0.5;
  flower.add(stem);

  return flower;
}

// Leaf generator with emerald contrast
function createSculptedLeaf(x, y, z, scale, rotX, rotY, rotZ, leafColor = 0x16A34A) {
  const leafGeo = new THREE.SphereGeometry(0.4, 8, 6);
  leafGeo.scale(2.4, 0.16, 1.0);
  const leafMat = new THREE.MeshStandardMaterial({
    color: leafColor,
    roughness: 0.45,
    metalness: 0.05,
    emissive: 0x064E3B,
    emissiveIntensity: 0.12
  });
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.set(x, y, z);
  leaf.scale.setScalar(scale);
  leaf.rotation.set(rotX, rotY, rotZ);
  return leaf;
}

const flowersList = [];

// Vibrant saturated flower bouquets clustering around the laptop like Reference 01!
const bouquetFlowers = [
  // Hinge & Left of laptop (rising upright and facing camera!)
  [-5.2, 1.4, 0.2,  1.35, 0xE11D48, 0xFBBF24, 0.5, -0.2], // Deep Rose
  [-4.2, 2.2, -1.2, 1.5,  0xFF1493, 0xFDE047, 0.6, -0.3], // Deep Pink
  [-2.8, 2.6, -2.4, 1.4,  0xF97316, 0xFDE047, 0.55, 0.1], // Coral Peach
  [ 0.0, 2.9, -2.8, 1.6,  0xBE123C, 0xFBBF24, 0.5, 0.0],  // Crimson Peony
  [ 2.6, 2.5, -2.2, 1.4,  0x9333EA, 0xFDE047, 0.55, 0.2], // Royal Purple
  [ 4.5, 1.8, -1.0, 1.45, 0xEC4899, 0xFBBF24, 0.6, 0.3], // Vivid Fuchsia
  [ 5.5, 1.2,  0.5, 1.3,  0xF97316, 0xFDE047, 0.5, 0.4], // Vivid Peach

  // Cascading along left side of laptop to front
  [-4.8, 0.8, 2.2,  1.4,  0xFF2D6F, 0xFBBF24, 0.6, -0.3],
  [-3.6, 0.7, 3.6,  1.5,  0xFB7185, 0xFDE047, 0.65, -0.2],
  [-2.2, 0.6, 4.6,  1.4,  0xE11D48, 0xFBBF24, 0.7, -0.1],
  [ 0.2, 0.6, 4.8,  1.45, 0xC084FC, 0xFDE047, 0.7, 0.1],
  [ 2.2, 0.7, 4.2,  1.35, 0xFF1493, 0xFBBF24, 0.65, 0.2],
  [ 3.8, 0.8, 3.2,  1.45, 0xEA580C, 0xFDE047, 0.6, 0.3],

  // Overflowing over desk rim (left)
  [-7.8, 0.5, 2.8,  1.4,  0xBE123C, 0xFBBF24, 0.5, -0.4],
  [-9.2, 0.3, 1.2,  1.5,  0xFF2D6F, 0xFDE047, 0.5, -0.5],
  [-9.8, 0.2, -0.8, 1.35, 0x7E22CE, 0xFBBF24, 0.45, -0.4],
  [-8.6, 0.4, -2.6, 1.4,  0xF43F5E, 0xFDE047, 0.45, -0.3],

  // Overflowing over desk rim (right)
  [ 7.5, 0.5, 3.5,  1.4,  0x9333EA, 0xFBBF24, 0.5, 0.4],
  [ 9.2, 0.3, 1.8,  1.55, 0xE11D48, 0xFDE047, 0.5, 0.5],
  [10.0, 0.2, -0.4, 1.35, 0xEA580C, 0xFDE047, 0.45, 0.4],
  [ 9.0, 0.4, -2.5, 1.45, 0xDB2777, 0xFBBF24, 0.45, 0.3],

  // Front desk lip blooms
  [-4.0, 0.4, 6.8,  1.4,  0xFF1493, 0xFBBF24, 0.7, -0.2],
  [-1.5, 0.3, 7.8,  1.55, 0xBE123C, 0xFDE047, 0.75, 0.0],
  [ 1.5, 0.3, 8.0,  1.5,  0x9333EA, 0xFDE047, 0.75, 0.1],
  [ 4.0, 0.4, 7.0,  1.4,  0xEA580C, 0xFBBF24, 0.7, 0.2]
];

bouquetFlowers.forEach(([x, y, z, sc, petalCol, centerCol, tx, ty]) => {
  const fl = createSculptedFlower(x, y, z, sc, petalCol, centerCol, tx, ty);
  fl.userData = {
    initY: y,
    phase: Math.random() * Math.PI * 2,
    swaySpd: 1.0 + Math.random() * 1.5
  };
  flowerGroup.add(fl);
  flowersList.push(fl);
});

// Deep emerald & jade foliage nestled beneath the blossoms
const bouquetLeaves = [
  [-5.8, 1.1, 0.0,  1.8, 0.4, 0.5, -0.3, 0x15803D],
  [-4.8, 1.8, -1.8, 1.7, 0.3, -0.4, 0.2, 0x166534],
  [ 0.0, 2.3, -3.2, 1.9, 0.5, 0.0, 0.0,  0x15803D],
  [ 4.8, 1.4, -1.6, 1.8, 0.3, 0.4, -0.2, 0x166534],
  [-5.2, 0.5, 2.5,  1.7, 0.4, 1.0, 0.2,  0x16A34A],
  [ 4.5, 0.5, 2.8,  1.7, 0.3, -0.9, -0.2, 0x16A34A],
  [-8.8, 0.3, 2.2,  1.8, 0.3, 1.2, -0.2, 0x15803D],
  [ 8.8, 0.3, 2.5,  1.8, 0.3, -1.1, 0.2, 0x15803D],
  [-0.2, 0.3, 8.5,  2.0, 0.5, 0.0, 0.1,  0x166534]
];
bouquetLeaves.forEach(([x, y, z, sc, rx, ry, rz, col]) => {
  flowerGroup.add(createSculptedLeaf(x, y, z, sc, rx, ry, rz, col));
});

// --- 09. CUTE DESK OBJECTS & MODERN LAPTOP ---

// 9A. MODERN PASTEL LAPTOP (PROMINENT HERO CENTERPIECE)
const laptopGroup = new THREE.Group();
laptopGroup.position.set(-0.5, 0.06, 0.7);
laptopGroup.rotation.y = 0.16;
laptopGroup.scale.setScalar(1.3);
islandGroup.add(laptopGroup);

const laptopChassisMat = new THREE.MeshStandardMaterial({
  color: 0xFCE7F3,
  roughness: 0.28,
  metalness: 0.25
});

// Base keyboard chassis
const lapBase = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.24, 4.4), laptopChassisMat);
laptopGroup.add(lapBase);

// Keyboard well (darker mauve inset)
const kbWell = new THREE.Mesh(
  new THREE.BoxGeometry(5.6, 0.04, 2.6),
  new THREE.MeshStandardMaterial({ color: 0xDDD6FE, roughness: 0.6 })
);
kbWell.position.set(0, 0.13, -0.4);
laptopGroup.add(kbWell);

// Trackpad
const trackpad = new THREE.Mesh(
  new THREE.BoxGeometry(2.0, 0.02, 1.1),
  new THREE.MeshStandardMaterial({ color: 0xF5D0FE, roughness: 0.4 })
);
trackpad.position.set(0, 0.13, 1.3);
laptopGroup.add(trackpad);

// Screen lid
const lidGroup = new THREE.Group();
lidGroup.position.set(0, 0.12, -2.15);
lidGroup.rotation.x = -0.26; // tilted open for high visibility
laptopGroup.add(lidGroup);

const screenLid = new THREE.Mesh(new THREE.BoxGeometry(6.4, 4.4, 0.18), laptopChassisMat);
screenLid.position.set(0, 2.2, 0);
lidGroup.add(screenLid);

// Glowing Screen Display (Canvas Texture with Cute Code & Hearts!)
const screenCanvas = document.createElement('canvas');
screenCanvas.width = 512;
screenCanvas.height = 340;
const sctx = screenCanvas.getContext('2d');

function updateScreenTexture() {
  sctx.fillStyle = '#1E0B2E'; // Deep purple screen background
  sctx.fillRect(0, 0, 512, 340);
  
  // Cute browser tab bar
  sctx.fillStyle = '#321448';
  sctx.fillRect(0, 0, 512, 38);
  sctx.fillStyle = '#FF1493';
  sctx.beginPath(); sctx.arc(20, 19, 6.5, 0, Math.PI * 2); sctx.fill();
  sctx.fillStyle = '#FBBF24';
  sctx.beginPath(); sctx.arc(38, 19, 6.5, 0, Math.PI * 2); sctx.fill();
  sctx.fillStyle = '#10B981';
  sctx.beginPath(); sctx.arc(56, 19, 6.5, 0, Math.PI * 2); sctx.fill();

  // Screen text
  sctx.fillStyle = '#F472B6';
  sctx.font = 'bold 22px "Quicksand", sans-serif';
  sctx.fillText('🌸 sadhasri.studio · v5.2', 76, 26);

  sctx.fillStyle = '#FFFFFF';
  sctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
  sctx.fillText('Crafting Joy with Code ✨', 30, 92);

  sctx.fillStyle = '#E9D5FF';
  sctx.font = 'bold 19px "JetBrains Mono", monospace';
  sctx.fillText('const engineer  = "S. SadhaSri";', 30, 138);
  sctx.fillText('const specialty = ["Web", "ML", "3D"];', 30, 174);
  sctx.fillText('const mission   = "Delight & Impact 🌸";', 30, 210);

  // Mini project badge
  sctx.fillStyle = 'rgba(255, 20, 147, 0.32)';
  sctx.fillRect(30, 244, 250, 56);
  sctx.strokeStyle = '#FF1493';
  sctx.lineWidth = 2.5;
  sctx.strokeRect(30, 244, 250, 56);

  sctx.fillStyle = '#F472B6';
  sctx.font = 'bold 18px "Quicksand", sans-serif';
  sctx.fillText('🚀 My Anime Shelf (Live)', 45, 280);

  // Big cute heart in right corner
  sctx.fillStyle = '#FF1493';
  sctx.font = '58px sans-serif';
  sctx.fillText('💖', 405, 270);
}
updateScreenTexture();

const screenTexture = new THREE.CanvasTexture(screenCanvas);
const screenMat = new THREE.MeshStandardMaterial({
  map: screenTexture,
  roughness: 0.2,
  metalness: 0.05,
  emissive: 0xFF1493,
  emissiveIntensity: 0.55
});
const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 3.9), screenMat);
screenMesh.position.set(0, 2.2, 0.1);
lidGroup.add(screenMesh);

// Screen Light Glow
const screenLight = new THREE.PointLight(0xFF2D6F, 1.6, 20);
screenLight.position.set(0, 2.5, 1.2);
laptopGroup.add(screenLight);

// 9B. CUTE CERAMIC MUG WITH HEART & STEAM
const mugGroup = new THREE.Group();
mugGroup.position.set(6.4, 0.05, 2.0);
islandGroup.add(mugGroup);

const mugMat = new THREE.MeshStandardMaterial({
  color: 0xFFF0F5,
  roughness: 0.25,
  metalness: 0.05
});
// Mug body
const mugBody = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.8, 1.9, 24), mugMat);
mugBody.position.y = 0.95;
mugGroup.add(mugBody);

// Mug handle
const mugHandle = new THREE.Mesh(
  new THREE.TorusGeometry(0.48, 0.1, 10, 20, Math.PI),
  mugMat
);
mugHandle.rotation.set(Math.PI / 2, Math.PI / 2, 0);
mugHandle.position.set(1.0, 1.0, 0);
mugGroup.add(mugHandle);

// Warm tea surface inside
const teaSurface = new THREE.Mesh(
  new THREE.CircleGeometry(0.88, 20),
  new THREE.MeshStandardMaterial({
    color: 0xC87D55,
    roughness: 0.2,
    emissive: 0x9C4920,
    emissiveIntensity: 0.35
  })
);
teaSurface.rotation.x = -Math.PI / 2;
teaSurface.position.y = 1.82;
mugGroup.add(teaSurface);

// Little 3D heart on the mug
const mugHeart = new THREE.Mesh(
  new THREE.SphereGeometry(0.24, 10, 8),
  new THREE.MeshStandardMaterial({ color: 0xFF1493, emissive: 0xBE123C, emissiveIntensity: 0.4 })
);
mugHeart.scale.set(1.2, 1.0, 0.4);
mugHeart.position.set(0, 0.95, 0.92);
mugGroup.add(mugHeart);

// 9C. COLORFUL STACK OF PASTEL BOOKS (COZY DESK VIBES)
const bookGroup = new THREE.Group();
bookGroup.position.set(6.6, 0.05, -2.5);
bookGroup.rotation.y = -0.42;
islandGroup.add(bookGroup);

const bookColors = [
  { col: 0xFF2D6F, thick: 0.58, w: 3.0, l: 4.0 }, // Rose book
  { col: 0x818CF8, thick: 0.52, w: 2.8, l: 3.8 }, // Periwinkle book
  { col: 0x10B981, thick: 0.55, w: 3.1, l: 3.9 }, // Mint green book
  { col: 0xFBBF24, thick: 0.50, w: 2.7, l: 3.6 }  // Sunny gold book
];

let currentBookY = 0;
bookColors.forEach((bk, i) => {
  const bMesh = new THREE.Mesh(
    new THREE.BoxGeometry(bk.w, bk.thick, bk.l),
    new THREE.MeshStandardMaterial({
      color: bk.col,
      roughness: 0.45,
      metalness: 0.05,
      emissive: bk.col,
      emissiveIntensity: 0.15
    })
  );
  bMesh.position.set((i - 1.5) * 0.09, currentBookY + bk.thick / 2, (i - 1.5) * 0.07);
  bMesh.rotation.y = (i - 1.5) * 0.08;
  bookGroup.add(bMesh);
  currentBookY += bk.thick;
});

// Dangling ribbon bookmark
const ribbon = new THREE.Mesh(
  new THREE.BoxGeometry(0.2, 0.05, 1.5),
  new THREE.MeshStandardMaterial({ color: 0xFF1493, roughness: 0.4, emissive: 0xBE123C, emissiveIntensity: 0.4 })
);
ribbon.position.set(0.7, currentBookY + 0.02, 1.3);
bookGroup.add(ribbon);

// 9D. CUTE POTTED SUCCULENT PLANT
const plantGroup = new THREE.Group();
plantGroup.position.set(-6.8, 0.05, -3.0);
islandGroup.add(plantGroup);

// Fluted lilac pot
const potMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(1.5, 1.1, 1.9, 20),
  new THREE.MeshStandardMaterial({
    color: 0xC084FC,
    roughness: 0.35,
    metalness: 0.05,
    emissive: 0x9333EA,
    emissiveIntensity: 0.18
  })
);
potMesh.position.y = 0.95;
plantGroup.add(potMesh);

// Soil
const soil = new THREE.Mesh(
  new THREE.CylinderGeometry(1.4, 1.4, 0.2, 16),
  new THREE.MeshStandardMaterial({ color: 0x54382A, roughness: 0.9 })
);
soil.position.y = 1.85;
plantGroup.add(soil);

// Lush succulent fleshy leaves in rosette
for (let layer = 0; layer < 3; layer++) {
  const count = 6 + layer * 2;
  const leafScale = 1.0 - layer * 0.2;
  const yOffset = 1.95 + layer * 0.32;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + layer * 0.4;
    const leafM = new THREE.Mesh(
      new THREE.SphereGeometry(0.48 * leafScale, 8, 6),
      new THREE.MeshStandardMaterial({
        color: layer === 0 ? 0x16A34A : (layer === 1 ? 0x22C55E : 0x4ADE80),
        roughness: 0.4,
        emissive: 0x15803D,
        emissiveIntensity: 0.15
      })
    );
    leafM.scale.set(1.9, 0.5, 0.9);
    leafM.position.set(Math.cos(angle) * (0.85 * leafScale), yOffset, Math.sin(angle) * (0.85 * leafScale));
    leafM.rotation.y = angle;
    leafM.rotation.z = -0.35 + layer * 0.15;
    plantGroup.add(leafM);
  }
}

// 9E. FLOATING 3D EXTRUDED HEARTS ABOVE LAPTOP
const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0.4);
heartShape.bezierCurveTo(0, 0.8, -0.7, 1.15, -1.15, 0.8);
heartShape.bezierCurveTo(-1.6, 0.4, -1.4, -0.4, 0, -1.3);
heartShape.bezierCurveTo(1.4, -0.4, 1.6, 0.4, 1.15, 0.8);
heartShape.bezierCurveTo(0.7, 1.15, 0, 0.8, 0, 0.4);

const heartExtrudeOpts = {
  depth: 0.36,
  bevelEnabled: true,
  bevelSegments: 4,
  steps: 1,
  bevelSize: 0.1,
  bevelThickness: 0.1
};
const heartGeo = new THREE.ExtrudeGeometry(heartShape, heartExtrudeOpts);
const heartMat = new THREE.MeshStandardMaterial({
  color: 0xFF1493,
  roughness: 0.25,
  metalness: 0.2,
  emissive: 0xBE123C,
  emissiveIntensity: 0.5
});

const heroHeart = new THREE.Mesh(heartGeo, heartMat);
heroHeart.scale.setScalar(0.75);
heroHeart.position.set(2.8, 4.4, 2.2);
islandGroup.add(heroHeart);

const miniHeart = new THREE.Mesh(heartGeo, new THREE.MeshStandardMaterial({
  color: 0xC084FC,
  roughness: 0.3,
  metalness: 0.15,
  emissive: 0x9333EA,
  emissiveIntensity: 0.45
}));
miniHeart.scale.setScalar(0.46);
miniHeart.position.set(-4.5, 3.8, 3.4);
islandGroup.add(miniHeart);

// --- 10. GOLDEN SPARKLES & TWINKLING STARS ---
const sparkleGroup = new THREE.Group();
scene.add(sparkleGroup);

// Ambient golden dust
const DUST_COUNT = 240;
const dustPos = new Float32Array(DUST_COUNT * 3);
for (let i = 0; i < DUST_COUNT; i++) {
  dustPos[i * 3 + 0] = (Math.random() - 0.5) * 110;
  dustPos[i * 3 + 1] = Math.random() * 65 - 15;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 85;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustPoints = new THREE.Points(
  dustGeo,
  new THREE.PointsMaterial({
    color: 0xFFDF70,
    size: 0.6,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false
  })
);
sparkleGroup.add(dustPoints);

// 40 Floating 3D Octahedron Stars
const starsList = [];
const STAR_COLORS = [0xFFDF00, 0xFF1493, 0xC084FC, 0x38BDF8, 0xFDE047];
for (let i = 0; i < 40; i++) {
  const col = STAR_COLORS[i % STAR_COLORS.length];
  const star = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.35 + Math.random() * 0.4, 0),
    new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.75,
      roughness: 0.2
    })
  );
  star.position.set(
    (Math.random() - 0.5) * 95,
    Math.random() * 60 - 10,
    (Math.random() - 0.5) * 75
  );
  star.scale.set(1, 1.8, 1);
  star.userData = {
    rotSpd: 0.02 + Math.random() * 0.03,
    pulseSpd: 1.2 + Math.random() * 2.0
  };
  scene.add(star);
  starsList.push(star);
}

// --- 11. SAKURA PETAL RAIN (RICH COLORED) ---
const petalGroup = new THREE.Group();
scene.add(petalGroup);

const PETAL_COLORS = [0xFF1493, 0xFF69B4, 0xFB7185, 0xF97316, 0xC084FC];
const petalBaseGeo = new THREE.SphereGeometry(0.26, 6, 6);
petalBaseGeo.scale(1.8, 0.25, 0.9);

const petalsList = [];
for (let i = 0; i < 140; i++) {
  const col = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
  const pMesh = new THREE.Mesh(
    petalBaseGeo,
    new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85 + Math.random() * 0.15,
      side: THREE.DoubleSide
    })
  );
  pMesh.position.set(
    (Math.random() - 0.5) * 95,
    Math.random() * 70 - 15,
    (Math.random() - 0.5) * 75
  );
  pMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  pMesh.userData = {
    fallSpd: 0.045 + Math.random() * 0.055,
    swaySpd: 0.8 + Math.random() * 1.6,
    swayAmp: 0.025 + Math.random() * 0.03,
    rotX: (Math.random() - 0.5) * 0.03,
    rotY: (Math.random() - 0.5) * 0.03
  };
  petalGroup.add(pMesh);
  petalsList.push(pMesh);
}

// --- 12. INTERACTIVE CLICK/TOUCH BURSTS ---
const clickBursts = [];
function spawnInteractiveBurst(x, y, z) {
  playChime(1.15);
  const count = 9;
  for (let i = 0; i < count; i++) {
    const isHeart = Math.random() > 0.45;
    const geo = isHeart ? new THREE.ShapeGeometry(heartShape) : new THREE.OctahedronGeometry(0.24, 0);
    const col = isHeart
      ? [0xFF1493, 0xFF2D6F, 0xE11D48][Math.floor(Math.random() * 3)]
      : [0xFBBF24, 0xC084FC, 0x38BDF8][Math.floor(Math.random() * 3)];
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: col, transparent: true, side: THREE.DoubleSide })
    );
    mesh.scale.setScalar(0.45);
    mesh.position.set(x, y, z);
    mesh.userData = {
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.45,
        0.25 + Math.random() * 0.45,
        (Math.random() - 0.5) * 0.45
      ),
      rotV: (Math.random() - 0.5) * 0.15,
      life: 1.0
    };
    scene.add(mesh);
    clickBursts.push(mesh);
  }
}

// --- 13. MOUSE / TOUCH ORBIT CONTROLS ---
let isDragging = false;
let prevPointer = { x: 0, y: 0 };
let targetRotY = 0.12;
let targetRotX = 0.04;

function handlePointerDown(cx, cy, e) {
  if (e && (e.target.closest('.hud-nav') || e.target.closest('.hud-section') || e.target.closest('.modal-backdrop') || e.target.closest('.hud-footer') || e.target.closest('#btn-toggle-hud'))) {
    return;
  }
  isDragging = true;
  prevPointer = { x: cx, y: cy };

  const ray = new THREE.Raycaster();
  ray.setFromCamera(
    new THREE.Vector2((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1),
    camera
  );
  const intersectPt = new THREE.Vector3();
  ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -4), intersectPt);
  if (intersectPt) {
    spawnInteractiveBurst(intersectPt.x, intersectPt.y, intersectPt.z);
  }
}

window.addEventListener('mousedown', e => handlePointerDown(e.clientX, e.clientY, e));
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  targetRotY += (e.clientX - prevPointer.x) * 0.0065;
  targetRotX += (e.clientY - prevPointer.y) * 0.0045;
  targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX));
  prevPointer = { x: e.clientX, y: e.clientY };
});

window.addEventListener('wheel', e => {
  camera.position.z += e.deltaY * 0.025;
  camera.position.z = Math.max(20, Math.min(65, camera.position.z));
}, { passive: true });

window.addEventListener('touchstart', e => {
  if (e.touches.length === 1) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, e);
}, { passive: true });
window.addEventListener('touchmove', e => {
  if (!isDragging || e.touches.length !== 1) return;
  targetRotY += (e.touches[0].clientX - prevPointer.x) * 0.007;
  targetRotX += (e.touches[0].clientY - prevPointer.y) * 0.005;
  targetRotX = Math.max(-0.35, Math.min(0.35, targetRotX));
  prevPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
window.addEventListener('touchend', () => { isDragging = false; });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- 14. ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Island smooth rotation & gentle bobbing
  if (!isDragging) {
    targetRotY += 0.0016; // Gentle idle spin
  }
  islandGroup.rotation.y += (targetRotY - islandGroup.rotation.y) * 0.07;
  islandGroup.rotation.x += (targetRotX - islandGroup.rotation.x) * 0.07;
  islandGroup.position.y = Math.sin(t * 1.2) * 0.45;

  // Knot rotation
  knotMesh.rotation.x = t * 0.4;
  knotMesh.rotation.y = t * 0.3;

  // Floating hearts animation
  heroHeart.position.y = 4.4 + Math.sin(t * 2.4) * 0.35;
  heroHeart.rotation.y = t * 1.4;
  miniHeart.position.y = 3.8 + Math.cos(t * 2.0) * 0.28;
  miniHeart.rotation.y = -t * 1.2;

  // Flower blossoms swaying gently
  flowersList.forEach(f => {
    f.position.y = f.userData.initY + Math.sin(t * f.userData.swaySpd + f.userData.phase) * 0.07;
    f.rotation.z = Math.sin(t * 0.9 + f.userData.phase) * 0.05;
  });

  // Floating spheres bobbing
  floatSpheres.forEach(s => {
    s.position.y = s.userData.initY + Math.sin(t * s.userData.speed + s.userData.phase) * s.userData.amp;
  });

  // Clouds drifting and breathing
  clouds.forEach(c => {
    c.position.y = c.userData.initY + Math.sin(t * c.userData.speed + c.userData.phase) * 1.2;
    c.position.x += c.userData.driftX;
    if (c.position.x > 50) c.position.x = -50;
    if (c.position.x < -50) c.position.x = 50;
  });

  // Twinkling stars
  starsList.forEach(s => {
    s.rotation.y += s.userData.rotSpd;
    const pulse = 1 + Math.sin(t * s.userData.pulseSpd) * 0.22;
    s.scale.set(pulse, pulse * 1.8, pulse);
  });

  // Falling sakura petals
  petalsList.forEach(p => {
    p.position.y -= p.userData.fallSpd;
    p.position.x += Math.sin(t * p.userData.swaySpd) * p.userData.swayAmp;
    p.rotation.x += p.userData.rotX;
    p.rotation.y += p.userData.rotY;
    if (p.position.y < -22) {
      p.position.y = 44;
      p.position.x = (Math.random() - 0.5) * 95;
      p.position.z = (Math.random() - 0.5) * 75;
    }
  });

  // Sparkles spin
  sparkleGroup.rotation.y = t * 0.01;

  // Dynamic light pulses
  pinkFill.intensity = 1.6 + Math.sin(t * 1.8) * 0.3;
  lavFill.intensity = 1.4 + Math.sin(t * 1.4 + 1) * 0.25;

  // Bursts update
  for (let i = clickBursts.length - 1; i >= 0; i--) {
    const b = clickBursts[i];
    b.position.add(b.userData.vel);
    b.userData.vel.y -= 0.009; // gravity
    b.rotation.z += b.userData.rotV;
    b.userData.life -= 0.015;
    b.material.opacity = b.userData.life;
    if (b.userData.life <= 0) {
      scene.remove(b);
      clickBursts.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}
animate();

// --- 15. UI / SECTION NAVIGATION ---
let currentSection = 'hero';
window.switchSection = function(secId) {
  playChime(1.0);
  currentSection = secId;
  document.querySelectorAll('.hud-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('sec-' + secId);
  if (target) {
    target.classList.add('active');
  }
  const hudMain = document.querySelector('.hud-main');
  if (hudMain) hudMain.classList.remove('hidden-hud');
  const toggleBtn = document.getElementById('btn-toggle-hud');
  if (toggleBtn) toggleBtn.innerHTML = '👁️ Hide HUD';
};

window.toggleHUD = function() {
  playChime(1.2);
  const hudMain = document.querySelector('.hud-main');
  const toggleBtn = document.getElementById('btn-toggle-hud');
  if (hudMain) {
    const isHidden = hudMain.classList.toggle('hidden-hud');
    if (toggleBtn) {
      toggleBtn.innerHTML = isHidden ? '🌸 Show Portfolio' : '👁️ Hide HUD';
    }
  }
};

// --- 16. DETAILED PROJECT MODALS ---
const PROJECT_MODAL_DATA = {
  animeshelf: {
    badge: '01 // FULL-STACK WEB CRAFT',
    emoji: '✨',
    title: 'My Anime Shelf',
    tagline: 'Interactive anime discovery, rating, and tracking platform with custom user profiles, responsive modern UI design tokens, and real-time cloud data.',
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
    tagline: 'Multi-horizon atmospheric PM2.5 forecasting across 12 Beijing monitoring stations using machine learning regression and meteorological feature engineering.',
    highlights: [
      '<b>Time-Series Feature Engineering:</b> Engineered meteorological vectors for machine learning regression models.',
      '<b>UCI PRSA Dataset:</b> Processed extensive historical multi-station sensor records for Beijing air quality analysis.',
      '<b>Robust Data Pipeline:</b> Outlier filtering, categorical weather encoding, and cross-validated statistical benchmarks.'
    ],
    stack: ['Python 3.8+', 'Scikit-Learn', 'Pandas', 'NumPy', 'Matplotlib'],
    repo: 'https://github.com/SadhaSri697/Air-Quality-Trend-Predictor',
    demo: null
  },
  studenteda: {
    badge: '03 // DATA SCIENCE',
    emoji: '📊',
    title: 'Student Health Analytics',
    tagline: 'Interactive Python analytical tool exploring demographic, academic, and lifestyle factors tied to student mental health and well-being.',
    highlights: [
      '<b>Correlation Mining:</b> Uncovered relationships between academic pressures, sleep disruption, and reported depression indicators.',
      '<b>Interactive CLI:</b> Structured command-line workflow for cohort filtering and dynamic statistical summary generation.',
      '<b>Automated Preprocessing:</b> Missing data imputation, encoding, and statistical clustering pipeline.'
    ],
    stack: ['Python', 'EDA', 'Statistical Modeling', 'CLI Architecture'],
    repo: 'https://github.com/SadhaSri697/Student-Depression-Analysis',
    demo: null
  },
  web2skill: {
    badge: '04 // AI AGENT TOOLING',
    emoji: '🪄',
    title: 'web2skill (w2s)',
    tagline: 'Automated skill generator turning websites into comprehensive structured references for AI coding agents.',
    highlights: [
      '<b>Agent Readiness:</b> Converts web platforms into hierarchical SKILL.md specifications documenting every interactive element.',
      '<b>DOM Exploration:</b> Automatically maps forms, routes, and edge cases to eliminate manual agent priming.'
    ],
    stack: ['Python', 'Web Scraping', 'AI Agent Skills', 'Markdown Parser'],
    repo: 'https://github.com/SadhaSri697/Webtoskill',
    demo: null
  }
};

window.openModal = function(id) {
  playChime(1.15);
  const data = PROJECT_MODAL_DATA[id];
  if (!data) return;
  const demoBtn = data.demo ? `<a href="${data.demo}" target="_blank" rel="noopener" class="cute-btn cute-btn-primary" style="font-size:12px;padding:7px 16px;">Live Demo ↗</a>` : '';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      <span style="font-size:32px">${data.emoji}</span>
      <div>
        <span class="proj-tag tag-pink" style="display:inline-block;margin-bottom:4px;">${data.badge}</span>
        <h3 style="font-size:20px;font-weight:800;color:#24122E;">${data.title}</h3>
      </div>
    </div>
    <p style="font-size:13px;color:#4A2858;line-height:1.65;margin-bottom:16px;">${data.tagline}</p>
    <div style="background:rgba(255,240,245,0.7);border:1px solid rgba(255,180,210,0.4);border-radius:14px;padding:14px;margin-bottom:16px;">
      <h5 style="font-size:10px;font-family:var(--font-mono);color:#9F2B68;letter-spacing:1.5px;margin-bottom:8px;">✦ KEY ENGINEERING CONTRIBUTIONS</h5>
      <ul style="font-size:12px;color:#3B1F48;line-height:1.65;padding-left:16px;">
        ${data.highlights.map(h => `<li style="margin-bottom:6px;">${h}</li>`).join('')}
      </ul>
    </div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:20px;">
      ${data.stack.map(s => `<span class="skill-pill">${s}</span>`).join('')}
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;">
      <a href="${data.repo}" target="_blank" rel="noopener" class="cute-btn cute-btn-secondary" style="font-size:12px;padding:7px 16px;">View Code ↗</a>
      ${demoBtn}
    </div>
  `;
  document.getElementById('project-modal').classList.add('open');
};

window.closeModal = function(e) {
  if (!e || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close-btn')) {
    document.getElementById('project-modal').classList.remove('open');
  }
};
