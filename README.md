# 🛰️ Space-Guard — Autonomous Orbital Collision Defense

<div align="center">

![Space-Guard Banner](https://img.shields.io/badge/Space--Guard-v2.1.0-00ff88?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A deterministic, physics-grounded platform for autonomous satellite conjunction risk assessment and Clohessy-Wiltshire maneuver planning in Low Earth Orbit.**

[🌌 Vision](#vision) · [🔭 Core Theory](#core-theory) · [🏗️ Architecture](#architecture) · [🔬 Risk Matrix](#risk-matrix) · [🧪 2009 Replay](#validation) · [🖥️ Workstations](#workstations) · [🚀 Getting Started](#getting-started) · [🔌 API Reference](#api-reference)

</div>

---

<a id="vision"></a>
## 🌌 The Vision

Space debris in Low Earth Orbit (LEO) is accumulating at an exponential rate. With over **27,000 catalogued objects** traveling at relative velocities up to **14 km/s**, hypervelocity orbital conjunctions represent a systemic threat to global space infrastructure. A single collision creates thousands of hypervelocity fragments, accelerating the cascading risk known as the **Kessler Syndrome**.

**Space-Guard** is an open-source astrodynamics project built to demonstrate that real-time orbital collision assessment and avoidance can be performed with **rigorous, deterministic physics** rather than opaque heuristics.

---

<a id="core-theory"></a>
## 🔭 Core Theory

Orbital mechanics behaves counter-intuitively compared to terrestrial navigation. To understand satellite collision avoidance, three fundamental concepts are key:

### 1. The B-Plane Encounter Cross-Section
When two satellites pass at their **Time of Closest Approach (TCA)**, the encounter occurs over mere milliseconds due to extreme relative velocities ($v_{\text{rel}} \approx 10 \text{ to } 15 \text{ km/s}$). We project the encounter geometry onto the **B-Plane** (a 2D plane perpendicular to the relative velocity vector $\vec{v}_{\text{rel}}$ passing through the target satellite). The 3D relative miss vector projects directly onto this plane as a 2D displacement $\vec{b} = (\xi, \zeta)$.

### 2. Gaussian Probability of Collision ($P_c$)
Because satellite positions are derived from tracking observations (e.g., Two-Line Element sets with typical positional uncertainty $\sigma \approx 500\text{ m}$), satellite positions are represented as 3D Gaussian random variables. Projected onto the 2D B-Plane, this forms a 2D Gaussian probability density function $\mathcal{N}(\vec{b}, \mathbf{C}_{\text{2D}})$. 

The analytic probability of collision ($P_c$) is the exact integral of this distribution over a disk of radius equal to the combined **Hard-Body Radius** ($\text{HBR} = 10\text{ m}$):

$$
P_c = \frac{1}{2\pi \sigma_\xi \sigma_\zeta \sqrt{1 - \rho^2}} \iint_{\xi^2 + \zeta^2 \le \text{HBR}^2} \exp\left( -\frac{1}{2(1-\rho^2)}\left[ \frac{(\xi - x_m)^2}{\sigma_\xi^2} - \frac{2\rho(\xi - x_m)(\zeta - y_m)}{\sigma_\xi \sigma_\zeta} + \frac{(\zeta - y_m)^2}{\sigma_\zeta^2} \right] \right) \, d\xi\, d\zeta
$$

Using the **Foster/Alfano** isotropic formulation, this computes in under **10 microseconds** per candidate pair.

### 3. Clohessy-Wiltshire Impulsive Avoidance Maneuver
When $P_c$ exceeds the critical threshold ($10^{-4}$), the satellite must execute an impulsive thrust burn ($\Delta \vec{v}$). In a circular LEO orbit, relative orbital motion under gravity is governed by the **Clohessy-Wiltshire (CW) equations**. 

The velocity-to-position block $\mathbf{\Phi}_{rv}(\Delta t)$ of the State Transition Matrix maps a velocity change $\Delta \vec{v}$ executed at $\Delta t$ before TCA into a positional displacement $\Delta \vec{r}_{\text{TCA}}$ at TCA:

$$
\Delta \vec{r}_{\text{TCA}} = \mathbf{\Phi}_{rv}(\Delta t) \cdot \Delta \vec{v}
$$

By taking the **Singular Value Decomposition (SVD)** of $\mathbf{\Phi}_{rv} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$, the principal right-singular vector $\vec{v}_1$ yields the mathematically optimal burn direction to maximize separation per unit of propellant spent:

$$
\Delta \vec{v}_{\text{opt}} = \|\Delta v\| \cdot \vec{v}_1
$$

> **The Power of Early Action:** Because $\mathbf{\Phi}_{rv}$ scales with time, a $1\text{ m/s}$ burn applied **24 hours before TCA** achieves approximately **$14\times$ greater miss distance** than the exact same burn applied 1 hour before TCA.

---

<a id="architecture"></a>
## 🏗️ Architecture & Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    CELESTRAK / SPACE-TRACK                  │
│             Live Two-Line Element (TLE) Catalog             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  STAGE 1: SGP4 PROPAGATION                  │
│       Coordinate Transformation: TEME → GCRS/ECI Frame      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               STAGE 2: TWO-STAGE SCREENING                  │
│  1. Coarse Filter: Altitude band rejection (|Δh| > 50 km)   │
│  2. Fine Search: Golden-section 1D scalar TCA minimizer     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               STAGE 3: ANALYTIC RISK ENGINE                 │
│  • Foster/Alfano 2D Gaussian B-Plane Probability (Pc)       │
│  • ML Prescreening Acceleration Layer (Surrogate Filter)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               STAGE 4: MANEUVER OPTIMIZATION                │
│  • Clohessy-Wiltshire STM Formulation                       │
│  • SVD Optimal Direction & Minimum-Fuel ΔV Sizing           │
└─────────────────────────────────────────────────────────────┘
```

---

<a id="risk-matrix"></a>
## 🔬 Risk Classification Matrix

| Risk Tier | Collision Probability ($P_c$) | Miss Distance | Action Protocol |
|:---|:---|:---|:---|
| 🔴 **Critical** | $P_c > 10^{-4}$ | $< 1\text{ km}$ | Compute impulsive $\Delta \vec{v}$ burn & trigger emergency alert |
| 🟠 **High** | $10^{-5} < P_c \le 10^{-4}$ | $1 \text{ to } 5\text{ km}$ | Active tracking, candidate burn solution generated |
| 🟡 **Moderate** | $10^{-6} < P_c \le 10^{-5}$ | $5 \text{ to } 25\text{ km}$ | Elevated monitoring window |
| 🟢 **Nominal** | $P_c \le 10^{-6}$ | $> 25\text{ km}$ | Standard catalog propagation |

---

<a id="validation"></a>
## 🧪 2009 Iridium 33 / Cosmos 2251 Validation

On **February 10, 2009 at 16:56 UTC**, the operational communications satellite **Iridium 33** and the decommissioned Russian satellite **Cosmos 2251** collided at an altitude of $789\text{ km}$ over Taymyr Peninsula, Siberia at a relative velocity of $14.1\text{ km/s}$, producing over $2,000$ trackable debris fragments.

Space-Guard was backtested against historical pre-collision TLEs (epoch `09041`):

- ✅ **Early Warning:** Identified conjunction with $P_c = 2.0 \times 10^{-4}$ (Critical Tier) with **48 hours of advance warning**.
- ✅ **Accurate TCA:** Predicted TCA within **15 minutes** of the historical collision timestamp.
- ✅ **Counterfactual Avoidance:** An impulsive burn of just $\Delta v = 0.10\text{ m/s}$ applied 48h prior would have established **$+4.83\text{ km}$ of safe radial clearance**, preventing the catastrophic impact.

---

<a id="workstations"></a>
## 🖥️ Interactive Workstations & Laboratories

| Route | Workstation | Capabilities |
|:---|:---|:---|
| `/` | **Mission Overview** | Live orbital congestion metrics, physics breakdown, telemetry overview |
| `/screening` | **Conjunction Screening** | Two-stage coarse/fine filter, risk triage, JSON telemetry export |
| `/globe` | **3D Orbital Radar** | WebGL 3D Earth, inertial orbital tracks, collision nodes, camera controls |
| `/maneuver` | **Maneuver Planner** | Clohessy-Wiltshire STM SVD solver, ΔV thruster sizing, along-track scaling |
| `/bplane` | **B-Plane Lab** | Interactive drag/click dartboard, 10,000-sample Monte Carlo verification, radar covariance & HBR sliders |
| `/historical` | **2009 Collision Replay** | Iridium 33 / Cosmos 2251 benchmark replay from pre-event TLEs |
| `/walkthrough` | **Pipeline Walkthrough** | 4-stage interactive laboratory with step-by-step math derivations |
| `/catalog` | **Satellite Catalog** | Live SGP4 ephemeris table, altitude sorting, orbital parameters |
| `/docs` | **Astrodynamics Docs** | 5-stage visual guide: zero-jargon intuition to exact mathematical derivations |

---

<a id="repository-structure"></a>
## 📁 Repository Structure

```
space-guard/
├── backend/
│   └── app/
│       ├── api/main.py              # FastAPI endpoints & REST routes
│       ├── ingestion/               # TLE fetcher, parser & local cache
│       ├── propagation/             # SGP4 propagator (TEME → GCRS)
│       ├── screening/               # Coarse altitude filter & Scipy TCA search
│       ├── risk/                    # Foster/Alfano analytic Pc & ML surrogate
│       ├── maneuver/                # Clohessy-Wiltshire STM & SVD solver
│       ├── validation/              # 2009 Iridium/Cosmos benchmark replay
│       └── config.py                # Astrodynamics constants & thresholds
├── frontend/
│   ├── src/
│   │   ├── components/              # 3D Globe, Radar, B-Plane, Maneuver UI
│   │   ├── pages/                   # Workstations & deep-dive interfaces
│   │   └── utils/                   # Audio synthesis & orbital helpers
│   ├── package.json
│   └── vite.config.js
├── dashboard.html                   # Zero-dependency standalone Mission Control
├── requirements.txt                 # Backend Python dependencies
└── README.md
```

---

<a id="getting-started"></a>
## 🚀 Getting Started

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Arpit-Panigrahi/Space-Guard-Autonomous-Orbital-Collision-Defense.git
cd Space-Guard-Autonomous-Orbital-Collision-Defense

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI engine
uvicorn backend.app.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# In a new terminal (navigate to the project frontend directory):
cd Space-Guard-Autonomous-Orbital-Collision-Defense/frontend
# (or if already inside project directory): cd frontend

npm install
npm run dev
```

Visit **`http://localhost:5173`** for the full interactive React experience, or open **`dashboard.html`** in any modern web browser for the zero-dependency standalone interface.

---

<a id="api-reference"></a>
## 🔌 API Reference

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/health` | Service health status, version, and ML surrogate state |
| `POST` | `/scan` | Runs two-stage screening and analytic $P_c$ across catalog |
| `GET` | `/api/objects` | Propagated GCRS coordinates for catalog satellites |
| `POST` | `/api/maneuver` | Computes SVD-optimal Clohessy-Wiltshire $\Delta\vec{v}$ burn |
| `GET` | `/api/validation/iridium-cosmos` | Historical 2009 Iridium 33 / Cosmos 2251 benchmark data |

---

<a id="license"></a>
## 📜 License

MIT License — see [LICENSE](LICENSE) for full details.
