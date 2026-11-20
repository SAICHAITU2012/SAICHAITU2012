<div align="center">

<!-- ═══════════ 00 · HERO ═══════════ -->
<a href="#03--selected-projects">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/v8/hero.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/v8/hero.svg">
    <img src="assets/v8/hero.svg" alt="Krishna Chaitanya — embodied AI and systems engineer. Personal systems index." width="100%" />
  </picture>
</a>

<br/>

<a href="https://github.com/SAICHAITU2012">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=400&size=18&duration=3000&pause=1300&color=67E8F9&center=true&vCenter=true&width=760&height=42&lines=embodied+ai+%E2%80%94+genesis+world+%C2%B7+mujoco+%C2%B7+unitree+g1;ppo-trained+swarms+with+local+llm+planners;air-gapped+agentic+workbenches+%C2%B7+zero+outbound;spatial+3d+%C2%B7+posix+systems+%C2%B7+web+engineering" alt="typing" />
</a>

<br/>

<p>
  <a href="#01--about"><b>01</b> about</a>　·　
  <a href="#02--core-domains"><b>02</b> domains</a>　·　
  <a href="#03--selected-projects"><b>03</b> projects</a>　·　
  <a href="#06--research-frontiers"><b>06</b> research</a>　·　
  <a href="#08--contact"><b>08</b> contact</a>
</p>

<img src="assets/v8/divider.svg" alt="" width="100%" />

</div>

## 01 — About

I'm **Krishna Chaitanya**, a computer science student at **Scaler School of Technology & BITS Pilani**, working at the intersection of embodied AI, reinforcement learning, and local-first agentic systems.

My operating thesis: *real intelligence is forged in physics.* I train policies inside simulators, command them with language models that run on my own machine, and I don't ship a number I haven't measured. Every claim on this page is tied to a benchmark, a dataset, or a conformance suite.

<div align="center">
<img src="assets/v8/divider.svg" alt="" width="100%" />
</div>

## 02 — Core Domains

<div align="center">
  <img src="assets/v8/domains.svg" alt="Core specialization domains — embodied AI, swarms and LLM planners, sovereign air-gapped systems, spatial 3D and core systems" width="100%" />
</div>

<br/>

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>01 · Embodied AI & Humanoid Robotics</h3>
      <ul>
        <li>Physics: Genesis World v1.4.5, MuJoCo 3.17, PyTorch.</li>
        <li>Methods: Proximal Policy Optimization, Learning from Demonstration, inverse kinematics.</li>
        <li>Targets: Unitree G1 humanoid, heterogeneous warehouse rovers, drone simulation.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>02 · Autonomous Swarms & Local Planners</h3>
      <ul>
        <li>Local LLM commanders (Qwen 2.5, Llama) planning over learned physical skills in real time.</li>
        <li>Shared memory boards, deterministic rule arbitration, independent verification.</li>
        <li>Air-gapped RAG: local vector stores, privacy-preserving tool invocation.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>03 · Sovereign Air-Gapped Workbenches</h3>
      <ul>
        <li>Industrial AI (SIH26117): confidential refinery workflows, 100% on-device inference.</li>
        <li>OS-level outbound socket blocking, cryptographically audited command execution.</li>
        <li>Organizational memory via Supermemory Local knowledge graphs.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>04 · Interactive 3D & Core Systems</h3>
      <ul>
        <li>Spatial graphics: Three.js, React Three Fiber, Expo, WebGL gravitational simulation.</li>
        <li>Systems: POSIX-compliant C++ shell — pipelines, redirection, fork/exec, signals.</li>
        <li>Full-stack: TypeScript, React, Next.js, FastAPI, Node.js, WebSockets.</li>
      </ul>
    </td>
  </tr>
</table>

<div align="center">
<img src="assets/v8/divider.svg" alt="" width="100%" />
</div>

## 03 — Selected Projects

<table>
  <tr>
    <td width="50%" valign="top">
      <div align="left">
        <img src="assets/v8/prj-01-multibot.svg" alt="PRJ-01 MultiBot-PPO" width="100%" />
        <ul>
          <li><b>Problem:</b> coordinate a heterogeneous robot team to deliver real payloads without a cloud planner.</li>
          <li><b>Approach:</b> PPO skills trained in Genesis World, commanded by a local Qwen 2.5 planner on Apple M4.</li>
          <li><b>Result:</b> 2/2 packages delivered across 4 independent runs — 0.549 m / 0.547 m drops against a 0.55 m zone.</li>
        </ul>
        <p>
          <a href="https://github.com/SAICHAITU2012/MultiBot-Proximal-Policy-Optimization">
            <img src="https://img.shields.io/badge/repository-0A0E18?style=flat-square&logo=github&logoColor=67E8F9" alt="repository" />
          </a>
        </p>
      </div>
    </td>
    <td width="50%" valign="top">
      <div align="left">
        <img src="assets/v8/prj-02-humanoid.svg" alt="PRJ-02 Humanoid-LfD" width="100%" />
        <ul>
          <li><b>Problem:</b> transfer human manipulation demonstrations to a 23-DoF bipedal platform.</li>
          <li><b>Approach:</b> trajectory replay and inverse kinematics in MuJoCo 3.17, high-fidelity sim-first pipeline.</li>
          <li><b>Result:</b> reproducible demonstration-to-execution pipeline for the Awign × Armature AI Labs challenge.</li>
        </ul>
        <p>
          <a href="https://github.com/SAICHAITU2012/Humanoid-LfD">
            <img src="https://img.shields.io/badge/repository-0A0E18?style=flat-square&logo=github&logoColor=67E8F9" alt="repository" />
          </a>
        </p>
      </div>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <div align="left">
        <img src="assets/v8/prj-03-sovereign.svg" alt="PRJ-03 Sovereign Agentic AI Workbench" width="100%" />
        <ul>
          <li><b>Problem:</b> enterprises need agentic AI that never leaks confidential documents.</li>
          <li><b>Approach:</b> open-weight multimodal LLMs, local RAG and tools on-device; outbound traffic blocked at socket level.</li>
          <li><b>Result:</b> a working air-gapped workbench built against Mangalore Refinery (MRPL) industrial specifications.</li>
        </ul>
        <p>
          <a href="https://github.com/SAICHAITU2012/Sovereign-Agentic-AI-Workbench">
            <img src="https://img.shields.io/badge/repository-0A0E18?style=flat-square&logo=github&logoColor=67E8F9" alt="repository" />
          </a>
        </p>
      </div>
    </td>
    <td width="50%" valign="top">
      <div align="left">
        <img src="assets/v8/prj-04-spaceverse.svg" alt="PRJ-04 SpaceVerse" width="100%" />
        <ul>
          <li><b>Problem:</b> interactive orbital physics usually dies on mobile hardware.</li>
          <li><b>Approach:</b> Three.js shader pipelines through @react-three/fiber/native on Expo, tuned for 60 FPS.</li>
          <li><b>Result:</b> phone-first gravitational sandbox with live planetary mass, radius and velocity parameters.</li>
        </ul>
        <p>
          <a href="https://github.com/SAICHAITU2012/Space-Simulator">
            <img src="https://img.shields.io/badge/repository-0A0E18?style=flat-square&logo=github&logoColor=67E8F9" alt="repository" />
          </a>
        </p>
      </div>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <div align="left">
        <img src="assets/v8/prj-05-decisionlens.svg" alt="PRJ-05 DecisionLens" width="100%" />
        <ul>
          <li><b>Problem:</b> architectural decisions evaporate across Slack threads and PR discussions.</li>
          <li><b>Approach:</b> continuous distillation into a searchable decision graph via Supermemory Local — zero cloud.</li>
          <li><b>Result:</b> surfacing of recurring technical friction, historical rationale and dependency maps on demand.</li>
        </ul>
        <p>
          <a href="https://github.com/SAICHAITU2012/decisionlens">
            <img src="https://img.shields.io/badge/repository-0A0E18?style=flat-square&logo=github&logoColor=67E8F9" alt="repository" />
          </a>
        </p>
      </div>
    </td>
    <td width="50%" valign="top">
      <div align="left">
        <img src="assets/v8/prj-06-shell.svg" alt="PRJ-06 Custom POSIX Shell" width="100%" />
        <ul>
          <li><b>Problem:</b> understand what a shell actually is — beneath the convenience of bash, down to the syscalls.</li>
          <li><b>Approach:</b> tokenizer, AST evaluation, fork/exec pipelines, path resolution, builtins and signal handling in C++17.</li>
          <li><b>Result:</b> shell validated against POSIX conformance suites via the CodeCrafters track.</li>
        </ul>
        <p>
          <a href="https://github.com/SAICHAITU2012/OS_Project-codecrafters-shell-cpp">
            <img src="https://img.shields.io/badge/repository-0A0E18?style=flat-square&logo=github&logoColor=67E8F9" alt="repository" />
          </a>
        </p>
      </div>
    </td>
  </tr>
</table>

<div align="center">
<img src="assets/v8/divider.svg" alt="" width="100%" />
</div>

## 04 — Technical Arsenal

<div align="center">

**languages**

<p>
  <img src="https://img.shields.io/badge/Python_3.12-0A0E18?style=flat-square&logo=python&logoColor=67E8F9" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-0A0E18?style=flat-square&logo=typescript&logoColor=67E8F9" alt="TypeScript" />
  <img src="https://img.shields.io/badge/C++17-0A0E18?style=flat-square&logo=c%2B%2B&logoColor=67E8F9" alt="C++" />
  <img src="https://img.shields.io/badge/C-0A0E18?style=flat-square&logo=c&logoColor=67E8F9" alt="C" />
  <img src="https://img.shields.io/badge/Bash-0A0E18?style=flat-square&logo=gnubash&logoColor=67E8F9" alt="Bash" />
  <img src="https://img.shields.io/badge/SQL-0A0E18?style=flat-square&logo=mysql&logoColor=67E8F9" alt="SQL" />
</p>

**ai & simulation**

<p>
  <img src="https://img.shields.io/badge/PyTorch-0A0E18?style=flat-square&logo=pytorch&logoColor=67E8F9" alt="PyTorch" />
  <img src="https://img.shields.io/badge/Genesis_World-0A0E18?style=flat-square&logo=opengl&logoColor=67E8F9" alt="Genesis World" />
  <img src="https://img.shields.io/badge/MuJoCo_3.17-0A0E18?style=flat-square&logo=deepmind&logoColor=67E8F9" alt="MuJoCo" />
  <img src="https://img.shields.io/badge/PPO-0A0E18?style=flat-square&logo=target&logoColor=67E8F9" alt="PPO" />
  <img src="https://img.shields.io/badge/Ollama-0A0E18?style=flat-square&logo=ollama&logoColor=67E8F9" alt="Ollama" />
  <img src="https://img.shields.io/badge/Hugging_Face-0A0E18?style=flat-square&logo=huggingface&logoColor=67E8F9" alt="Hugging Face" />
</p>

**spatial & infrastructure**

<p>
  <img src="https://img.shields.io/badge/Three.js-0A0E18?style=flat-square&logo=threedotjs&logoColor=67E8F9" alt="Three.js" />
  <img src="https://img.shields.io/badge/React-0A0E18?style=flat-square&logo=react&logoColor=67E8F9" alt="React" />
  <img src="https://img.shields.io/badge/Expo-0A0E18?style=flat-square&logo=expo&logoColor=67E8F9" alt="Expo" />
  <img src="https://img.shields.io/badge/FastAPI-0A0E18?style=flat-square&logo=fastapi&logoColor=67E8F9" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Docker-0A0E18?style=flat-square&logo=docker&logoColor=67E8F9" alt="Docker" />
  <img src="https://img.shields.io/badge/Linux-0A0E18?style=flat-square&logo=linux&logoColor=67E8F9" alt="Linux" />
  <img src="https://img.shields.io/badge/Git-0A0E18?style=flat-square&logo=git&logoColor=67E8F9" alt="Git" />
</p>

</div>

<div align="center">
<img src="assets/v8/divider.svg" alt="" width="100%" />
</div>

## 05 — Telemetry

<div align="center">

<table border="0">
  <tr>
    <td align="center" valign="middle">
      <img src="https://github-readme-stats.vercel.app/api?username=SAICHAITU2012&show_icons=true&hide_border=true&bg_color=00000000&text_color=8B96AB&title_color=67E8F9&icon_color=67E8F9&rank_icon=github" alt="GitHub stats" />
    </td>
    <td align="center" valign="middle">
      <img src="https://streak-stats.demolab.com?user=SAICHAITU2012&background=00000000&border=00000000&stroke=1C2433&ring=67E8F9&fire=67E8F9&currStreakNum=E6EAF2&sideNums=8B96AB&currStreakLabel=67E8F9&sideLabels=566074&dates=566074&border_radius=10" alt="Streak" />
    </td>
  </tr>
</table>

</div>

<div align="center">
<img src="assets/v8/divider.svg" alt="" width="100%" />
</div>

## 06 — Research Frontiers

<div align="center">
  <img src="assets/v8/research.svg" alt="Research frontiers orbital map — sim-to-real transfer, agent determinism, local inference throughput" width="100%" />
</div>

<br/>

* **Sim-to-Real Locomotion Transfer** — domain randomization and privileged teacher–student policy distillation in MuJoCo for robust bipedal walking over uneven terrain.
* **Multi-Agent Decision Determinism** — verification loops where local LLM planners emit structured JSON task specs, executed and validated by physics-bounded controllers.
* **High-Throughput Local Inference** — profiling token latency and KV-cache memory bandwidth on unified Apple Silicon memory for sub-millisecond robotic control loops.

<div align="center">
<img src="assets/v8/divider.svg" alt="" width="100%" />
</div>

## 07 — Interactive 3D Portfolio

An interactive WebGL complement to this index — real-time Three.js spatial physics, particle shader fields and interactive project modules.

<div align="center">
  <br/>
  <a href="https://saichaitu2012.github.io/SAICHAITU2012/"><b>launch the 3d portfolio →</b></a>
  <br/>
  <sub>webgl canvas · spatial raycasting · real-time shader physics · zero build step</sub>
</div>

<div align="center">
<img src="assets/v8/divider.svg" alt="" width="100%" />
</div>

## 08 — Contact

<div align="center">

<sub>open to collaborations, research problems and interesting systems work</sub>

<p>
  <b><a href="https://github.com/SAICHAITU2012">github — SAICHAITU2012</a></b>
  ·
  <b><a href="mailto:krishnachaitanya413710@gmail.com">krishnachaitanya413710@gmail.com</a></b>
  ·
  <b><a href="https://github.com/SAICHAITU2012?tab=repositories">repository archive</a></b>
</p>

<br/>

<img src="assets/v8/footer.svg" alt="End of index — Krishna Chaitanya" width="100%" />

</div>
