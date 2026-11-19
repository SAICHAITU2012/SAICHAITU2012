# 🪐 Krishna Chaitanya — Interactive 3D Developer Portfolio

A companion 3D spatial computing portfolio built with **Three.js**, custom GLSL-inspired particle shaders, and a dark obsidian cybernetic HUD interface.

---

## ⚡ Quick Start (Local Run)

You can launch and view this 3D portfolio locally in one command without needing Node.js or any build steps:

```bash
python3 -m http.server 8080 -d portfolio
```

Then open `http://localhost:8080` in your browser.

---

## 🚀 One-Click GitHub Pages Deployment

To host this 3D experience live for free on GitHub Pages:

1. In your GitHub repository `SAICHAITU2012/SAICHAITU2012`, go to **Settings** → **Pages**.
2. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / folder: `/portfolio` (or deploy via GitHub Actions).
3. Your live 3D portfolio will be accessible at:
   `https://saichaitu2012.github.io/SAICHAITU2012/portfolio/`

---

## 🛠️ Architecture & Tech Stack

- **Graphics Engine:** Three.js (r160) WebGL Renderer with antialiasing and fog depth.
- **3D Geometry:** Dual-nested wireframe icosahedron + octahedron core with pulsing inner point cloud.
- **Celestial Constellation:** 1,400 particle starfield with depth-buffered velocity drifting.
- **Interaction:** Dynamic raycasting, drag-to-orbit inertia, and mouse parallax tracking.
- **UI & HUD:** Glassmorphic dark obsidian cards, domain category filters, and detailed technical inspection drawer.
