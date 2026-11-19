// =========================================================================
// 🌸 SADHASRI — PASTEL 3D CREATIVE DEVELOPER STUDIO
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

// Play cute sparkling chime notes (Pentatonic scale: F, G, A, C, D)
const chimeFreqs = [349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99, 880.00];

function playSparkleSound() {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx || audioCtx.state !== 'running') {
    if (audioCtx) audioCtx.resume();
  }
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    // Quick chime ramp up and smooth gentle decay
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.85);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

window.toggleAudio = function () {
  soundEnabled = !soundEnabled;
  document.getElementById('sound-icon').textContent = soundEnabled ? '🎵' : '🔇';
  document.getElementById('sound-label').textContent = soundEnabled ? 'Sound: ON' : 'Sound: OFF';
  if (soundEnabled) playSparkleSound();
};

// --- 02. THREE.JS SCENE SETUP ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

// Soft pastel background and fog
scene.background = new THREE.Color(0x181329);
scene.fog = new THREE.FogExp2(0x181329, 0.012);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 16, 54);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --- 03. LIGHTING (SOFT PASTEL AURA) ---
const ambientLight = new THREE.AmbientLight(0xFFE4E6, 1.2);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
mainLight.position.set(20, 40, 30);
mainLight.castShadow = true;
scene.add(mainLight);

// Pastel Rim Lights (Pink and Lavender)
const pinkLight = new THREE.PointLight(0xF472B6, 2.5, 60);
pinkLight.position.set(-25, 15, 20);
scene.add(pinkLight);

const purpleLight = new THREE.PointLight(0xC084FC, 2.5, 60);
purpleLight.position.set(25, 10, -20);
scene.add(purpleLight);

const blueLight = new THREE.PointLight(0x38BDF8, 1.8, 50);
blueLight.position.set(0, -15, 15);
scene.add(blueLight);

// --- 04. FLOATING STUDIO ISLAND (CENTERPIECE) ---
const islandGroup = new THREE.Group();
scene.add(islandGroup);

// Island Platform (Cylinder with beveled aesthetic)
const islandGeo = new THREE.CylinderGeometry(14, 11, 4, 32);
const islandMat = new THREE.MeshStandardMaterial({
  color: 0x2A1F45,
  roughness: 0.5,
  metalness: 0.1
});
const islandBase = new THREE.Mesh(islandGeo, islandMat);
islandBase.position.y = -2;
islandGroup.add(islandBase);

// Island Grass / Pastel Surface Top
const topGrassGeo = new THREE.CylinderGeometry(14.2, 14, 0.8, 32);
const topGrassMat = new THREE.MeshStandardMaterial({
  color: 0xF472B6,
  roughness: 0.7,
  metalness: 0.05
});
const topGrass = new THREE.Mesh(topGrassGeo, topGrassMat);
topGrass.position.y = 0.4;
islandGroup.add(topGrass);

// Glowing Rim Ring around the island
const ringGeo = new THREE.TorusGeometry(18, 0.35, 16, 64);
const ringMat = new THREE.MeshStandardMaterial({
  color: 0xC084FC,
  emissive: 0x8B5CF6,
  emissiveIntensity: 0.4,
  roughness: 0.2
});
const orbitRing = new THREE.Mesh(ringGeo, ringMat);
orbitRing.rotation.x = Math.PI / 2.3;
orbitRing.position.y = -1;
islandGroup.add(orbitRing);

// Orbiting Little Pastel Moons
const moon1Geo = new THREE.SphereGeometry(1.1, 16, 16);
const moon1Mat = new THREE.MeshStandardMaterial({ color: 0xFCE7F3, emissive: 0xF472B6, emissiveIntensity: 0.3 });
const moon1 = new THREE.Mesh(moon1Geo, moon1Mat);
islandGroup.add(moon1);

const moon2Geo = new THREE.SphereGeometry(0.8, 16, 16);
const moon2Mat = new THREE.MeshStandardMaterial({ color: 0xDDD6FE, emissive: 0xC084FC, emissiveIntensity: 0.3 });
const moon2 = new THREE.Mesh(moon2Geo, moon2Mat);
islandGroup.add(moon2);

// --- 05. CUTE 3D OBJECTS ON THE ISLAND ---

// 1. Cute Pastel Laptop
const laptopGroup = new THREE.Group();
laptopGroup.position.set(-2, 1.2, 2);
laptopGroup.rotation.y = Math.PI / 7;
islandGroup.add(laptopGroup);

// Laptop Base
const lapBaseGeo = new THREE.BoxGeometry(6, 0.3, 4.5);
const lapMat = new THREE.MeshStandardMaterial({ color: 0xFCE7F3, roughness: 0.3 });
const lapBase = new THREE.Mesh(lapBaseGeo, lapMat);
laptopGroup.add(lapBase);

// Laptop Screen Lid (Angled back)
const lapLidGeo = new THREE.BoxGeometry(6, 4.2, 0.25);
const lapLid = new THREE.Mesh(lapLidGeo, lapMat);
lapLid.position.set(0, 2.1, -2.1);
lapLid.rotation.x = -Math.PI / 10;
laptopGroup.add(lapLid);

// Glowing Screen
const screenGeo = new THREE.PlaneGeometry(5.4, 3.6);
const screenMat = new THREE.MeshBasicMaterial({ color: 0xF472B6 });
const lapScreen = new THREE.Mesh(screenGeo, screenMat);
lapScreen.position.set(0, 2.1, -1.96);
lapScreen.rotation.x = -Math.PI / 10;
laptopGroup.add(lapScreen);

// Floating Cute Emoji above Laptop Screen
const floatIconGeo = new THREE.SphereGeometry(0.7, 16, 16);
const floatIconMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xF472B6, emissiveIntensity: 0.6 });
const floatIcon = new THREE.Mesh(floatIconGeo, floatIconMat);
floatIcon.position.set(0, 5.2, -1.8);
laptopGroup.add(floatIcon);

// 2. Cute Boba / Strawberry Milk Tumbler
const bobaGroup = new THREE.Group();
bobaGroup.position.set(5.5, 1.2, 1.5);
islandGroup.add(bobaGroup);

const cupGeo = new THREE.CylinderGeometry(0.9, 0.7, 2.4, 24);
const cupMat = new THREE.MeshPhysicalMaterial({
  color: 0xFCE7F3,
  transmission: 0.6,
  opacity: 0.85,
  transparent: true,
  roughness: 0.1
});
const cup = new THREE.Mesh(cupGeo, cupMat);
cup.position.y = 1.2;
bobaGroup.add(cup);

// Strawberry Milk liquid inside
const liquidGeo = new THREE.CylinderGeometry(0.82, 0.65, 1.8, 20);
const liquidMat = new THREE.MeshStandardMaterial({ color: 0xF472B6, roughness: 0.4 });
const liquid = new THREE.Mesh(liquidGeo, liquidMat);
liquid.position.y = 1.0;
bobaGroup.add(liquid);

// Straw
const strawGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 12);
const strawMat = new THREE.MeshStandardMaterial({ color: 0xC084FC });
const straw = new THREE.Mesh(strawGeo, strawMat);
straw.position.set(0.1, 1.8, 0);
straw.rotation.z = -0.25;
bobaGroup.add(straw);

// 3. Cute Potted Cherry Blossom / Daisy
const plantGroup = new THREE.Group();
plantGroup.position.set(3, 1.2, -4);
islandGroup.add(plantGroup);

const potGeo = new THREE.CylinderGeometry(1.2, 0.9, 1.6, 18);
const potMat = new THREE.MeshStandardMaterial({ color: 0xDDD6FE, roughness: 0.5 });
const pot = new THREE.Mesh(potGeo, potMat);
pot.position.y = 0.8;
plantGroup.add(pot);

// Flower stem
const stemGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
const stemMat = new THREE.MeshStandardMaterial({ color: 0x34D399 });
const stem = new THREE.Mesh(stemGeo, stemMat);
stem.position.y = 2.2;
plantGroup.add(stem);

// Flower Center & Petals
const flowerCenter = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 12, 12),
  new THREE.MeshStandardMaterial({ color: 0xFDE047 })
);
flowerCenter.position.set(0, 3.2, 0);
plantGroup.add(flowerCenter);

for (let i = 0; i < 5; i++) {
  const angle = (i / 5) * Math.PI * 2;
  const petal = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xFCE7F3, emissive: 0xF472B6, emissiveIntensity: 0.2 })
  );
  petal.scale.set(1.4, 0.7, 0.3);
  petal.position.set(Math.cos(angle) * 0.65, 3.2 + Math.sin(angle) * 0.65, 0);
  petal.rotation.z = angle;
  plantGroup.add(petal);
}

// --- 06. PROCEDURAL FLUFFY 3D CLOUDS ---
const cloudGroup = new THREE.Group();
scene.add(cloudGroup);

function createFluffyCloud(x, y, z, scale = 1, color = 0xFCE7F3) {
  const cloud = new THREE.Group();
  const sphereCount = 6 + Math.floor(Math.random() * 4);
  const cloudMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.05,
    transparent: true,
    opacity: 0.88
  });

  for (let i = 0; i < sphereCount; i++) {
    const r = (1.5 + Math.random() * 1.5) * scale;
    const geo = new THREE.SphereGeometry(r, 16, 16);
    const mesh = new THREE.Mesh(geo, cloudMat);
    mesh.position.set(
      (Math.random() - 0.5) * 4 * scale,
      (Math.random() - 0.5) * 1.5 * scale,
      (Math.random() - 0.5) * 2.5 * scale
    );
    cloud.add(mesh);
  }
  cloud.position.set(x, y, z);
  cloud.userData = { initialY: y, floatSpeed: 0.6 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2 };
  return cloud;
}

const clouds = [
  createFluffyCloud(-32, 14, -18, 1.8, 0xFCE7F3),
  createFluffyCloud(34, 18, -25, 2.2, 0xEDE9FE),
  createFluffyCloud(-22, -8, -12, 1.4, 0xE0F2FE),
  createFluffyCloud(26, -10, -8, 1.6, 0xFCE7F3),
  createFluffyCloud(-40, 2, -35, 2.6, 0xEDE9FE),
  createFluffyCloud(38, 4, -40, 2.8, 0xFCE7F3)
];

clouds.forEach(c => cloudGroup.add(c));

// --- 07. FALLING SAKURA / CHERRY BLOSSOM PETALS ---
const petalCount = 110;
const petalGroup = new THREE.Group();
scene.add(petalGroup);

const petalGeometry = new THREE.SphereGeometry(0.35, 8, 8);
petalGeometry.scale(1.8, 0.4, 1.0); // Flatten into petal shape

const petalMaterial = new THREE.MeshStandardMaterial({
  color: 0xF472B6,
  roughness: 0.4,
  side: THREE.DoubleSide
});

const petals = [];
for (let i = 0; i < petalCount; i++) {
  const mesh = new THREE.Mesh(petalGeometry, petalMaterial);
  mesh.position.set(
    (Math.random() - 0.5) * 80,
    Math.random() * 60 - 20,
    (Math.random() - 0.5) * 60
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  mesh.userData = {
    fallSpeed: 0.06 + Math.random() * 0.07,
    rotX: (Math.random() - 0.5) * 0.04,
    rotY: (Math.random() - 0.5) * 0.04,
    swaySpeed: 1 + Math.random() * 2,
    swayAmp: 0.03 + Math.random() * 0.03
  };
  petalGroup.add(mesh);
  petals.push(mesh);
}

// --- 08. ROTATING 3D PASTEL SPARKLING STARS ---
const starGroup = new THREE.Group();
scene.add(starGroup);

const starGeometry = new THREE.OctahedronGeometry(0.65, 0);
const starMaterial = new THREE.MeshStandardMaterial({
  color: 0xFDE047,
  emissive: 0xFBBF24,
  emissiveIntensity: 0.5,
  roughness: 0.2
});

const stars = [];
for (let i = 0; i < 35; i++) {
  const mesh = new THREE.Mesh(starGeometry, starMaterial);
  mesh.position.set(
    (Math.random() - 0.5) * 70,
    Math.random() * 45 - 15,
    (Math.random() - 0.5) * 50
  );
  mesh.scale.set(1, 1.8, 1);
  mesh.userData = {
    rotSpeed: 0.02 + Math.random() * 0.03,
    pulseSpeed: 1.5 + Math.random() * 2
  };
  starGroup.add(mesh);
  stars.push(mesh);
}

// --- 09. CLICK-TO-SPAWN 3D HEARTS & BURSTS ---
const burstParticles = [];
const heartShape = new THREE.Shape();
// Parametric Heart curve
heartShape.moveTo(0, 0.4);
heartShape.bezierCurveTo(0, 0.7, -0.6, 1.0, -1.0, 0.7);
heartShape.bezierCurveTo(-1.4, 0.3, -1.2, -0.4, 0, -1.2);
heartShape.bezierCurveTo(1.2, -0.4, 1.4, 0.3, 1.0, 0.7);
heartShape.bezierCurveTo(0.6, 1.0, 0, 0.7, 0, 0.4);

const heartGeo = new THREE.ShapeGeometry(heartShape);
const heartMat = new THREE.MeshBasicMaterial({ color: 0xF472B6, side: THREE.DoubleSide, transparent: true });

function spawnHeartBurst(x, y, z) {
  playSparkleSound();
  const count = 7;
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(heartGeo, heartMat.clone());
    mesh.scale.set(0.35, 0.35, 0.35);
    mesh.position.set(x, y, z);
    mesh.userData = {
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        0.2 + Math.random() * 0.4,
        (Math.random() - 0.5) * 0.4
      ),
      rotVel: (Math.random() - 0.5) * 0.1,
      life: 1.0
    };
    scene.add(mesh);
    burstParticles.push(mesh);
  }
}

// --- 10. MOUSE & DRAG INTERACTION ---
let isDragging = false;
let previousMouse = { x: 0, y: 0 };
let targetIslandRotY = 0;
let targetIslandRotX = 0;

window.addEventListener('mousedown', (e) => {
  // Only drag if not clicking buttons or modals
  if (!e.target.closest('.hud-nav') && !e.target.closest('.hud-section') && !e.target.closest('.modal-backdrop')) {
    isDragging = true;
    previousMouse = { x: e.clientX, y: e.clientY };

    // Convert mouse to raycast to spawn hearts near click plane
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersect);
    if (intersect) {
      spawnHeartBurst(intersect.x, intersect.y, intersect.z);
    }
  }
});

window.addEventListener('mouseup', () => { isDragging = false; });

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.clientX - previousMouse.x;
    const deltaY = e.clientY - previousMouse.y;
    targetIslandRotY += deltaX * 0.007;
    targetIslandRotX += deltaY * 0.005;
    targetIslandRotX = Math.max(-0.4, Math.min(0.4, targetIslandRotX));
    previousMouse = { x: e.clientX, y: e.clientY };
  }
});

// Scroll to Zoom
window.addEventListener('wheel', (e) => {
  camera.position.z += e.deltaY * 0.03;
  camera.position.z = Math.max(30, Math.min(85, camera.position.z));
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- 11. ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Island Smooth Rotation & Tilt
  if (!isDragging) {
    targetIslandRotY += 0.0025;
  }
  islandGroup.rotation.y += (targetIslandRotY - islandGroup.rotation.y) * 0.08;
  islandGroup.rotation.x += (targetIslandRotX - islandGroup.rotation.x) * 0.08;

  // Gentle Island Floating Sine
  islandGroup.position.y = Math.sin(t * 1.4) * 0.6;

  // Orbiting Moons
  moon1.position.set(Math.cos(t * 1.2) * 18, -1 + Math.sin(t * 1.2) * 2, Math.sin(t * 1.2) * 18);
  moon2.position.set(Math.cos(-t * 0.9) * 18, -1 + Math.sin(-t * 0.9) * 2, Math.sin(-t * 0.9) * 18);

  // Laptop Floating Icon Pulse
  floatIcon.position.y = 5.2 + Math.sin(t * 3) * 0.35;
  floatIcon.rotation.y = t * 2;

  // Boba Tumbler Bob
  bobaGroup.position.y = 1.2 + Math.sin(t * 2.2 + 1) * 0.15;

  // Clouds Floating
  clouds.forEach(c => {
    c.position.y = c.userData.initialY + Math.sin(t * c.userData.floatSpeed + c.userData.phase) * 1.5;
    c.position.x += 0.015;
    if (c.position.x > 55) c.position.x = -55;
  });

  // Petals Fall & Sway
  petals.forEach(p => {
    p.position.y -= p.userData.fallSpeed;
    p.position.x += Math.sin(t * p.userData.swaySpeed) * p.userData.swayAmp;
    p.rotation.x += p.userData.rotX;
    p.rotation.y += p.userData.rotY;

    if (p.position.y < -25) {
      p.position.y = 35;
      p.position.x = (Math.random() - 0.5) * 80;
    }
  });

  // Stars Twinkle & Spin
  stars.forEach(s => {
    s.rotation.y += s.userData.rotSpeed;
    const scale = 1 + Math.sin(t * s.userData.pulseSpeed) * 0.25;
    s.scale.set(scale, scale * 1.8, scale);
  });

  // Heart Bursts Update
  for (let i = burstParticles.length - 1; i >= 0; i--) {
    const bp = burstParticles[i];
    bp.position.add(bp.userData.vel);
    bp.rotation.z += bp.userData.rotVel;
    bp.userData.life -= 0.018;
    bp.material.opacity = bp.userData.life;
    if (bp.userData.life <= 0) {
      scene.remove(bp);
      burstParticles.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

animate();

// --- 12. UI OVERLAY SECTION NAVIGATION ---
window.switchSection = function (secId) {
  playSparkleSound();
  document.querySelectorAll('.hud-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById('sec-' + secId);
  if (target) target.classList.add('active');
};

// --- 13. PROJECT MODAL DETAILS ---
const projectData = {
  animeshelf: {
    badge: '01 // FULL-STACK WEB CRAFT',
    title: 'My Anime Shelf ✨',
    tagline: 'Interactive anime discovery, rating, and tracking platform with custom user profiles and responsive modern UI.',
    highlights: [
      '<b>AniList GraphQL Integration:</b> Real-time dynamic search, metadata fetching, and categorization across thousands of series.',
      '<b>Modern Design Tokens:</b> Custom CSS system ensuring cohesive spacing, colors, and responsive layout across mobile and desktop.',
      '<b>Cloud State:</b> Firebase v11 authenticated personal list synchronization and persistent user profiles.'
    ],
    stack: ['Vanilla JavaScript ES6+', 'HTML5', 'CSS3 Tokens', 'AniList GraphQL', 'Firebase v11'],
    repo: 'https://github.com/SadhaSri697/My-Anime-Self',
    demo: 'https://sadhasri697.github.io/My-Anime-Self/'
  },
  airquality: {
    badge: '02 // MACHINE LEARNING & PREDICTION',
    title: 'Air Quality Trend Predictor 🌫️',
    tagline: 'Multi-horizon atmospheric particulate matter (PM2.5) forecasting across 12 Beijing monitoring stations.',
    highlights: [
      '<b>Time-Series Modeling:</b> Engineered meteorological feature vectors (temperature, dew point, pressure, wind vectors) for ML regression.',
      '<b>UCI PRSA Dataset:</b> Analyzed extensive historical multi-station sensor records.',
      '<b>Data Pipeline:</b> Handled outlier filtering, categorical weather encoding, and cross-validated statistical benchmarks.'
    ],
    stack: ['Python 3.8+', 'Scikit-Learn', 'Pandas', 'NumPy', 'Matplotlib'],
    repo: 'https://github.com/SadhaSri697/Air-Quality-Trend-Predictor'
  },
  studenteda: {
    badge: '03 // DATA SCIENCE & ANALYTICS',
    title: 'Student Health Analytics System 📊',
    tagline: 'Interactive analytical Python tool exploring demographic, academic, and lifestyle factors tied to student mental health.',
    highlights: [
      '<b>Correlation Mining:</b> Uncovered relationships between academic pressures, sleep disruption, and reported depression indicators.',
      '<b>Interactive CLI:</b> Structured command-line workflow for cohort filtering and dynamic summary generation.',
      '<b>Preprocessing:</b> Automated missing data imputation and statistical clustering.'
    ],
    stack: ['Python', 'EDA', 'Statistical Modeling', 'CLI Architecture'],
    repo: 'https://github.com/SadhaSri697/Student-Depression-Analysis'
  },
  web2skill: {
    badge: '04 // AUTOMATION & AI AGENT TOOLS',
    title: 'web2skill (w2s) 🪄',
    tagline: 'Automated skill generator turning websites into comprehensive structured references for AI coding agents.',
    highlights: [
      '<b>Agent Readiness:</b> Converts web platforms into hierarchical SKILL.md specs documenting every interactive element and state.',
      '<b>DOM Exploration:</b> Automatically maps forms, routes, and edge cases to eliminate manual agent priming.'
    ],
    stack: ['Python', 'Web Scraping', 'AI Agent Skills', 'Markdown Parser'],
    repo: 'https://github.com/SadhaSri697/Webtoskill'
  }
};

window.openModal = function (id) {
  playSparkleSound();
  const data = projectData[id];
  if (!data) return;

  const demoBtn = data.demo 
    ? `<a href="${data.demo}" target="_blank" rel="noopener" class="cute-btn cute-btn-primary" style="font-size: 12px; padding: 7px 18px;">Live Demo ↗</a>` 
    : '';

  document.getElementById('modal-body').innerHTML = `
    <span class="proj-tag tag-pink" style="margin-bottom: 12px; display: inline-block;">${data.badge}</span>
    <h3 style="font-size: 24px; font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">${data.title}</h3>
    <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6; margin-bottom: 20px;">${data.tagline}</p>
    
    <div style="background: rgba(36, 28, 58, 0.7); border: 1px solid rgba(244, 114, 182, 0.25); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
      <h5 style="font-size: 11px; font-family: var(--font-mono); color: #F472B6; letter-spacing: 1px; margin-bottom: 10px;">✦ KEY TECHNICAL CONTRIBUTIONS</h5>
      <ul style="font-size: 12.5px; color: #F1F5F9; line-height: 1.6; padding-left: 18px;">
        ${data.highlights.map(h => `<li style="margin-bottom: 8px;">${h}</li>`).join('')}
      </ul>
    </div>

    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px;">
      ${data.stack.map(s => `<span class="skill-pill" style="border-color: rgba(244, 114, 182, 0.3); color: #FCE7F3;">${s}</span>`).join('')}
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <a href="${data.repo}" target="_blank" rel="noopener" class="cute-btn cute-btn-secondary" style="font-size: 12px; padding: 7px 18px;">View on GitHub ↗</a>
      ${demoBtn}
    </div>
  `;

  document.getElementById('project-modal').classList.add('open');
};

window.closeModal = function () {
  document.getElementById('project-modal').classList.remove('open');
};
