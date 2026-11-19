import * as THREE from 'three';

// -------------------------------------------------------------
// 01. THREE.JS 3D SCENE & ENGINE INITIALIZATION
// -------------------------------------------------------------
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030712, 0.0018);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 75);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// -------------------------------------------------------------
// 02. 3D CYBERNETIC MESHES & NEURAL CONSTELLATION
// -------------------------------------------------------------
const coreGroup = new THREE.Group();
scene.add(coreGroup);

// Core 1: Wireframe Icosahedron
const icoGeometry = new THREE.IcosahedronGeometry(22, 1);
const icoMaterial = new THREE.MeshBasicMaterial({
  color: 0x00F2FE,
  wireframe: true,
  transparent: true,
  opacity: 0.35
});
const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
coreGroup.add(icoMesh);

// Core 2: Inner Octahedron
const octGeometry = new THREE.OctahedronGeometry(13, 0);
const octMaterial = new THREE.MeshBasicMaterial({
  color: 0x8B5CF6,
  wireframe: true,
  transparent: true,
  opacity: 0.6
});
const octMesh = new THREE.Mesh(octGeometry, octMaterial);
coreGroup.add(octMesh);

// Core 3: Nucleus Point Cloud
const nucGeo = new THREE.SphereGeometry(6, 16, 16);
const nucMat = new THREE.PointsMaterial({
  color: 0xFFFFFF,
  size: 0.45,
  transparent: true,
  opacity: 0.8
});
const nucPoints = new THREE.Points(nucGeo, nucMat);
coreGroup.add(nucPoints);

// Orbiting Rings
function createOrbitRing(radius, tiltX, tiltZ, color, speed) {
  const ringGeo = new THREE.RingGeometry(radius, radius + 0.25, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = tiltX;
  ring.rotation.z = tiltZ;
  scene.add(ring);
  return { mesh: ring, speed };
}

const rings = [
  createOrbitRing(32, Math.PI / 3, 0.4, 0x00F2FE, 0.002),
  createOrbitRing(38, -Math.PI / 4, -0.6, 0x8B5CF6, -0.0015),
  createOrbitRing(45, Math.PI / 6, 1.2, 0x38BDF8, 0.001)
];

// 3D Starfield / Particle Constellation
const particleCount = 1400;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
  particlePositions[i] = (Math.random() - 0.5) * 360;
  particlePositions[i + 1] = (Math.random() - 0.5) * 360;
  particlePositions[i + 2] = (Math.random() - 0.5) * 280;
}

particleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(particlePositions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  color: 0x38BDF8,
  size: 0.75,
  transparent: true,
  opacity: 0.45
});

const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// -------------------------------------------------------------
// 03. INTERACTIVITY & MOUSE TRACKING
// -------------------------------------------------------------
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
  mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Drag Orbit Controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', (e) => {
  // Only start drag if not clicking on interactive buttons or cards
  if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && !e.target.closest('.project-card')) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    coreGroup.rotation.y += deltaX * 0.005;
    coreGroup.rotation.x += deltaY * 0.005;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

// -------------------------------------------------------------
// 04. ANIMATION LOOP
// -------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // Subtle Mouse Parallax
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  camera.position.x = targetX * 25;
  camera.position.y = -targetY * 25;
  camera.lookAt(0, 0, 0);

  // Core Rotations
  if (!isDragging) {
    coreGroup.rotation.y += 0.002;
    coreGroup.rotation.x += 0.001;
  }

  icoMesh.rotation.y = elapsedTime * 0.12;
  octMesh.rotation.y = -elapsedTime * 0.18;
  octMesh.rotation.z = elapsedTime * 0.1;

  // Pulse Inner Core
  const scale = 1 + Math.sin(elapsedTime * 2) * 0.08;
  nucPoints.scale.set(scale, scale, scale);

  // Rotate Rings
  rings.forEach((r) => {
    r.mesh.rotation.z += r.speed;
  });

  // Slowly rotate particle field
  particleSystem.rotation.y = elapsedTime * 0.015;

  renderer.render(scene, camera);
}

animate();

// -------------------------------------------------------------
// 05. PROJECT DETAILS DATA & MODAL LOGIC
// -------------------------------------------------------------
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

window.openModal = function (projectId) {
  const p = projectDetails[projectId];
  if (!p) return;

  const content = `
    <span class="card-status-badge" style="margin-bottom: 12px; display: inline-block;">${p.badge}</span>
    <h2 style="font-size: 22px; color: #FFFFFF; margin-bottom: 12px;">${p.title}</h2>
    <p style="color: #94A3B8; font-size: 14.5px; line-height: 1.6; margin-bottom: 20px;">${p.summary}</p>
    
    <div style="background: rgba(3, 7, 18, 0.7); border: 1px solid rgba(0, 242, 254, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h4 style="font-size: 12px; font-family: var(--font-mono); color: #00F2FE; letter-spacing: 1px; margin-bottom: 10px;">// KEY ARCHITECTURAL CONTRIBUTIONS</h4>
      <ul style="color: #CBD5E1; font-size: 13px; line-height: 1.6; padding-left: 20px;">
        ${p.highlights.map(h => `<li style="margin-bottom: 8px;">${h}</li>`).join('')}
      </ul>
    </div>

    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
      ${p.stack.map(s => `<span class="tech-pill">${s}</span>`).join('')}
    </div>

    <div style="display: flex; justify-content: flex-end;">
      <a href="${p.repo}" target="_blank" rel="noopener" class="hud-btn hud-btn-accent" style="padding: 10px 20px; font-size: 13px;">
        View on GitHub →
      </a>
    </div>
  `;

  document.getElementById('modal-content').innerHTML = content;
  document.getElementById('project-modal').classList.add('open');
};

window.closeModal = function () {
  document.getElementById('project-modal').classList.remove('open');
};

// Filter Buttons Handler
const filterButtons = document.querySelectorAll('.filter-pill');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
