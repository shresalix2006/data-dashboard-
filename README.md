# Editorial Data Dashboard

An enterprise-grade, high-fidelity multi-source telemetry data dashboard built with a modern Full-Stack architecture. Designed as a **3rd Year University Engineering Software Project**, this system processes real-time API streams (GitHub REST API, Crypto index metrics, live environmental telemetry), formats multi-dimensional charts, and supports sandboxed CSV/JSON dataset rendering—all reinforced with a persistent backend caching engine built to handle API rate limits and network degradation.

---

## 🚀 Deployment & Fast-Track Links

* **Live Development URL:** [https://ais-dev-iodaotoqfo6btxvd37am66-68983139101.asia-southeast1.run.app](https://ais-dev-iodaotoqfo6btxvd37am66-68983139101.asia-southeast1.run.app)
* **Demo & Share Link:** [https://ais-pre-iodaotoqfo6btxvd37am66-68983139101.asia-southeast1.run.app](https://ais-pre-iodaotoqfo6btxvd37am66-68983139101.asia-southeast1.run.app)

---

## 📖 Table of Contents
1. [Academic Core Specs](#-academic-core-specs)
2. [Aesthetic & Design Philosophy](#-aesthetic--design-philosophy)
3. [System Architecture](#-system-architecture)
4. [Core Features](#-core-features)
5. [Local Setup in VS Code](#-local-setup-in-vs-code)
6. [How to Deploy to GitHub](#-how-to-deploy-to-github)
7. [Deployment Guide (Vercel & Render)](#-deployment-guide-vercel--render)
8. [Technical Evaluation Highlights](#-technical-evaluation-highlights)

---

## 🎓 Academic Core Specs

As a university practical milestone submission, this project satisfies engineering modules covering:
* **Full-Stack Integration:** Dynamic React core hooked up to a TypeScript/Express ingestion proxy server.
* **Network & API Resilience:** Built-in middleware caches and active token delegation headers to survive public API rate throttles.
* **Data Visualization:** Integration of D3-reliant interactive charting and client-side statistical analytics.
* **Development Automation:** Seamless esbuild aggregation compiling Node.js entry points directly to single-chunk production footprints (`dist/server.cjs`).

---

## 🎨 Aesthetic & Design Philosophy

This dashboard avoids standard templating and over-saturated gradients, choosing a streamlined, high-contrast, professional design:
* **The "Cosmic Slate" Visual Frame:** Dark-mode editorial surfaces using fine slate grays (`bg-neutral-900 / borders-neutral-800`), deep charcoal shadows, and crisp content layouts.
* **Sophisticated Typography:** Primary UI written in high-legibility **Inter** with display metric sections rendered in monospace formats through **JetBrains Mono** to emulate technical telemetry.
* **Spatial Breathing Room:** Balanced margins, comfortable grid spacing, and discrete micro-interactions mediated with native CSS transitions and fine spring-physics animations from **Motion**.

---

## 📡 System Architecture

The software operates on a unified, high-octane build framework:
+---------------------------------------+
                  |           VITE SPA FRONTEND           |
                  |   (React 19 / Recharts / SWR / Tailwind)|
                  +-------------------+-------------------+
                                      |
                    HTTPS (API Cache / JSON Payloads)
                                      |
                                      v
                  +---------------------------------------+
                  |         EXPRESS BACKEND ENGINE        |
                  |    (server.ts / TSX in Dev / CJS Build) |
                  +----+-----------------------------+----+
                       |                             |
      Real-Time Fetch / Token Headers          Live Stream Endpoints
                       v                             v
       +-------------------------------+     +-----------------------+
       |     GitHub REST API (v3)      |     |  Ticker & Weather APIs|
       |  - Repos, Languages, Commits  |     |                       |
       +-------------------------------+     +-----------------------+

       ### Tech Stack Breakdown
* **Frontend:** React 19, TypeScript, **Vite**, **Recharts** (d3-powered data mapping), **SWR** (State-While-Revalidate caching hook), **Tailwind CSS v4** (.css theme utilities), **Motion** (fine spring layout curves), **Lucide React UI Icons**.
* **Backend:** Node.js, **Express** (Routing & Proxy layers), Custom Cache Middlewares, **dotenv** (environment safety).
* **Compiler Build Engine:** `esbuild` for blazing-fast tree-shaken server compilation and `tsx` (TypeScript Execute) for hot dev server launches.

---

## 💎 Core Features

### 1. GitHub Code Analytics Dashboard (GitHub Pulse)
* **Repository Analytics Parser:** Fetch any public repository by parsing `Owner/Repository` names.
* **Dynamic Content Charting:** Real-time metrics charting lines of code, contributors, and multi-temporal active commits graphs.
* **Bypass Rate Limiting:** Built-in custom header fields allowing reviewers to inject a personal GitHub Token (exposing an `"x-github-token"` header via Express), raising the standard rate envelope from 60 to 5,000 requests per hour instantly.
* **High-Fidelity Offline Engine:** When GitHub throttles connection pools, the Express server falls back to an intelligent, multi-layered caching architecture serving cached results, and seamlessly substitutes custom-defined dynamic simulated feeds when rates fully exhaust.

### 2. High-Performance Financial Tickers (Crypto Dashboard)
* Real-time metrics mapping crypto index variations (BTC, ETH, etc.) using smooth sparkline visual panels to track changes.

### 3. Live Environmental Sensor Feeds (Weather Dashboard)
* Dynamically fetches regional telemetry metrics, warning limits, and real-time environment configurations inside elegant widgets.

### 4. Custom Dataset Telemetry Visualizer
* Includes a self-contained panel layout supporting file drag-and-drop or raw copy-pasting of formatted CSV / JSON data streams to render custom bar, line, and area charts locally with zero backend ingestion storage.

---

## 💻 Local Setup in VS Code

Follow this systematic guide to run the codebase locally on your personal machine inside **Visual Studio Code**.

### 1. Prerequisites
Ensure you have **Node.js** running on your computer.
* Download Node.js (LTS version recommended): [https://nodejs.org](https://nodejs.org)
* Verify installation down in your machine terminal:
  ```bash
  node -v
  npm -v

  
