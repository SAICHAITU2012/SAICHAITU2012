import * as THREE from 'three';

// ============================================================
// 01. SCENE — adaptive quality, pauses when tab hidden
// ============================================================
const canvas = document.getElementById('webgl-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030712, 0.0021);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, 78);

const renderer = new THREE.WebGLRenderer({
  canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance'
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));

// ============================================================
// 02. CORE MESH — nested wireframe solids + glowing nucleus
// ============================================================
const coreGroup = new THREE.Group();
scene.add(coreGroup);

const icoMesh = new THREE.Mesh(
  new THREE.IcosahedronGeometry(22, 1),
  new THREE.MeshBasicMaterial({ color: 0x00F2FE, wireframe: true, transparent: true, opacity: 0.32 })
);
coreGroup.add(icoMesh);

const octMesh = new THREE.Mesh(
  new THREE.OctahedronGeometry(13, 0),
  new THREE.MeshBasicMaterial({ color: 0x8B5CF6, wireframe: true, transparent: true, opacity: 0.55 })
);
coreGroup.add(octMesh);

const nucPoints = new THREE.Points(
  new THREE.SphereGeometry(6, 18, 18),
  new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.45, transparent: true, opacity: 0.85 })
);
coreGroup.add(nucPoints);

// Orbit rings
const rings = [
  { radius: 32, tiltX: Math.PI / 3, tiltZ: 0.4, color: 0x00F2FE, speed: 0.0022 },
  { radius: 38, tiltX: -Math.PI / 4, tiltZ: -0.6, color: 0x8B5CF6, speed: -0.0016 },
  { radius: 45, tiltX: Math.PI / 6, tiltZ: 1.2, color: 0x38BDF8, speed: 0.0011 }
].map(cfg => {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(cfg.radius, cfg.radius + 0.25, 72),
    new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
  );
  ring.rotation.x = cfg.tiltX;
  ring.rotation.z = cfg.tiltZ;
  scene.add(ring);
  return { mesh: ring, speed: cfg.speed };
});

// ============================================================
// 03. STARFIELD + CONSTELLATION LINKS (new in v2)
// ============================================================
const particleCount = isMobile ? 700 : 1500;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < positions.length; i += 3) {
  positions[i] = (Math.random() - 0.5) * 360;
  positions[i + 1] = (Math.random() - 0.5) * 360;
  positions[i + 2] = (Math.random() - 0.5) * 280;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
  color: 0x38BDF8, size: 0.75, transparent: true, opacity: 0.45
}));
scene.add(stars);

// Faint lines connecting nearby stars — constellation feel
const linkCount = isMobile ? 120 : 260;
const linkPositions = new Float32Array(linkCount * 6);
for (let i = 0; i < linkCount; i++) {
  const a = Math.floor(Math.random() * particleCount) * 3;
  const b = Math.floor(Math.random() * particleCount) * 3;
  linkPositions.set([positions[a], positions[a + 1], positions[a + 2],
                     positions[b], positions[b + 1], positions[b + 2]], i * 6);
}
const linkGeo = new THREE.BufferGeometry();
linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3));
const links = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({
  color: 0x38BDF8, transparent: true, opacity: 0.08
}));
scene.add(links);

// ============================================================
// 04. INTERACTION — parallax + drag orbit (with inertia)
// ============================================================
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
let isDragging = false, prev = { x: 0, y: 0 };
let velX = 0, velY = 0;

addEventListener('mousemove', e => {
  mouseX = (e.clientX - innerWidth / 2) * 0.0008;
  mouseY = (e.clientY - innerHeight / 2) * 0.0008;
  if (isDragging) {
    velY = (e.clientX - prev.x) * 0.005;
    velX = (e.clientY - prev.y) * 0.005;
    coreGroup.rotation.y += velY;
    coreGroup.rotation.x += velX;
    prev = { x: e.clientX, y: e.clientY };
  }
});
addEventListener('mousedown', e => {
  if (e.target.closest('button, a, .card, .modal-card')) return;
  isDragging = true; prev = { x: e.clientX, y: e.clientY };
});
addEventListener('mouseup', () => { isDragging = false; });

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
});

// ============================================================
// 05. RENDER LOOP — pauses when tab hidden, honors reduced motion
// ============================================================
const clock = new THREE.Clock();
let running = true;
document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (running) { clock.getDelta(); loop(); }
});

function loop() {
  if (!running) return;
  requestAnimationFrame(loop);
  const t = clock.getElapsedTime();

  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;
  camera.position.x = targetX * 25;
  camera.position.y = -targetY * 25;
  camera.lookAt(0, 0, 0);

  if (!isDragging) {
    // inertia decay after drag release
    velX *= 0.95; velY *= 0.95;
    coreGroup.rotation.y += 0.002 + velY;
    coreGroup.rotation.x += 0.001 + velX;
  }
  icoMesh.rotation.y = t * 0.12;
  octMesh.rotation.y = -t * 0.18;
  octMesh.rotation.z = t * 0.1;
  const s = 1 + Math.sin(t * 2) * 0.08;
  nucPoints.scale.set(s, s, s);
  rings.forEach(r => { r.mesh.rotation.z += r.speed; });
  stars.rotation.y = t * 0.015;
  links.rotation.y = t * 0.015;

  renderer.render(scene, camera);
}

if (reducedMotion) {
  renderer.render(scene, camera); // single static frame
} else {
  loop();
}

// ============================================================
// 06. PROJECT DATA + MODAL (Esc / backdrop / focus return)
// ============================================================
const projectDetails = {
  multibot: {
    title: 'MultiBot-PPO (Heterogeneous Swarm Robotics)',
    badge: 'EMBODIED AI · GENESIS WORLD v1.4.5',
    summary: 'A heterogeneous robot team pushing 7 kg crates into a target delivery zone, coordinated by a local LLM planner and learned PPO low-level skills.',
    highlights: [
      '<b>Physics Engine:</b> Built on Genesis World v1.4.5; trained on Apple M4 silicon with zero paid cloud APIs.',
      '<b>Measured Drop Accuracy:</b> 0.549 m and 0.547 m against a 0.55 m zone (4/4 deterministic test runs).',
      '<b>Local Commander:</b> qwen2.5:1.5b running locally via Ollama generating high-level planning actions for low-level RL controllers.'
    ],
    stack: ['Python 3.12', 'Genesis World', 'PyTorch', 'PPO', 'Ollama', 'Qwen 2.5'],
    repo: 'https://github.com/SAICHAITU2012/MultiBot-Proximal-Policy-Optimization'
  },
  humanoid: {
    title: 'Humanoid-LfD (Unitree G1 Imitation Learning)',
    badge: 'HUMANOID ROBOTICS · MUJOCO 3.17',
    summary: 'Teaching a 23-DoF Unitree G1 humanoid robot complex manipulation and locomotion behaviors using Learning from Demonstration (LfD).',
    highlights: [
      '<b>Challenge:</b> Engineered for the "Teach a Humanoid With Your Own Hands" challenge (Awign × Armature AI Labs).',
      '<b>Simulation Fidelity:</b> MuJoCo 3.17 physics solver, custom demonstration recorder, and joint trajectory replay.',
      '<b>Robotics:</b> Forward/Inverse kinematics, balance stabilization, and contact dynamics.'
    ],
    stack: ['PyTorch', 'MuJoCo 3.17', 'Python 3.12', 'Kinematics', 'Imitation Learning'],
    repo: 'https://github.com/SAICHAITU2012/Humanoid-LfD'
  },
  sovereign: {
    title: 'Sovereign Agentic AI Workbench (SIH26117)',
    badge: 'CONFIDENTIAL AI · ON-PREMISE AIR-GAP',
    summary: 'Air-gapped on-premise agentic AI workbench using open-weight multimodal LLMs for confidential industrial workflows (MRPL specs).',
    highlights: [
      '<b>Air-Gap Enforcement:</b> Strict OS socket filtering; 100% of inference, document parsing, embeddings, and RAG execution stay on-device.',
      '<b>Multimodal Support:</b> Local vision and document processing for confidential industrial diagrams and telemetry.',
      '<b>Audit Trail:</b> Cryptographically hashed execution logs ensuring traceable, auditable tool use.'
    ],
    stack: ['Python', 'Ollama', 'FastAPI', 'Local RAG', 'Docker', 'Network Isolation'],
    repo: 'https://github.com/SAICHAITU2012/Sovereign-Agentic-AI-Workbench'
  },
  spaceverse: {
    title: 'SpaceVerse (Celestial Gravitational Simulator)',
    badge: 'SPATIAL 3D · REACT NATIVE & THREE.JS',
    summary: 'Phone-first interactive 3D astronomy learning prototype with real-time planetary gravitational simulation and orbital mechanics.',
    highlights: [
      '<b>Mobile WebGL:</b> Fluid 60 FPS performance powered by @react-three/fiber/native and custom Three.js shader pipelines.',
      '<b>Interactive Physics Lab:</b> Real-time parameter tweaking for mass, radius, velocity vectors, and n-body gravitational attraction.',
      '<b>Celestial Fidelity:</b> Accurate planetary orbital scale models and camera tracking.'
    ],
    stack: ['TypeScript', 'React Native', 'Expo', 'Three.js', 'React Three Fiber'],
    repo: 'https://github.com/SAICHAITU2012/Space-Simulator'
  },
  decisionlens: {
    title: 'DecisionLens (Continuous Architectural Memory)',
    badge: 'ORGANIZATIONAL INTELLIGENCE · SUPERMEMORY',
    summary: 'Platform transforming engineering conversations, Slack threads, and GitHub pull requests into structured architectural memory.',
    highlights: [
      '<b>Architectural Graph:</b> Surfaces rationale behind past architectural decisions and detects recurring unresolved debates.',
      '<b>Supermemory Local:</b> Private on-device vector graph indexing without transmitting corporate codebase data to third-party clouds.',
      '<b>Developer Context:</b> Integrates seamlessly with daily engineering communication channels.'
    ],
    stack: ['React', 'TypeScript', 'FastAPI', 'Supermemory', 'Knowledge Graphs'],
    repo: 'https://github.com/SAICHAITU2012/decisionlens'
  },
  shell: {
    title: 'Custom POSIX Shell in C++',
    badge: 'SYSTEMS PROGRAMMING · POSIX C++17',
    summary: 'POSIX-compliant shell architecture built from scratch in modern C++, featuring AST command parsing, pipelines, and redirection.',
    highlights: [
      '<b>POSIX Standard:</b> Implemented parser, pipeline execution with fork/exec, file redirection (>, 2>, >>), and builtins (cd, pwd, echo, type).',
      '<b>Systems Concurrency:</b> Process signal handling, zombie process reaping, and path resolution.',
      '<b>Verification:</b> Rigorously validated against CodeCrafters challenge conformance suites.'
    ],
    stack: ['C++17', 'POSIX API', 'Linux Syscalls', 'Process Concurrency'],
    repo: 'https://github.com/SAICHAITU2012/OS_Project-codecrafters-shell-cpp'
  }
};

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
let lastFocus = null;

function openModal(id) {
  const p = projectDetails[id];
  if (!p) return;
  modalContent.innerHTML = `
    <span class="m-badge">${p.badge}</span>
    <h2 class="m-title">${p.title}</h2>
    <p class="m-sum">${p.summary}</p>
    <div class="m-box">
      <h4>// KEY ARCHITECTURAL CONTRIBUTIONS</h4>
      <ul>${p.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
    </div>
    <div class="pills" style="margin-bottom:24px">${p.stack.map(s => `<span>${s}</span>`).join('')}</div>
    <div class="m-foot">
      <a href="${p.repo}" target="_blank" rel="noopener" class="btn btn-accent btn-lg">View on GitHub →</a>
    </div>`;
  lastFocus = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus();
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

document.querySelectorAll('[data-open]').forEach(btn =>
  btn.addEventListener('click', () => openModal(btn.dataset.open)));
document.getElementById('modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

// ============================================================
// 07. FILTERS — animated hide/show
// ============================================================
const pills = document.querySelectorAll('.pill');
const cards = document.querySelectorAll('.card');
pills.forEach(btn => {
  btn.addEventListener('click', () => {
    pills.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hide', !show);
    });
  });
});

// ============================================================
// 08. SCROLL REVEAL + COUNTERS + NAV STATE + CARD GLOW
// ============================================================
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    en.target.querySelectorAll('[data-count]').forEach(el => {
      const end = +el.dataset.count;
      let n = 0;
      const step = () => {
        n += Math.max(1, Math.ceil(end / 30));
        el.textContent = Math.min(n, end);
        if (n < end) requestAnimationFrame(step);
      };
      step();
    });
    io.unobserve(en.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });

// cursor-tracked glow position on cards
cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});
