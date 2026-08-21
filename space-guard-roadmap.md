# Space-Guard: AI Conjunction Screening & Collision-Avoidance Platform
### Technical Architectural Design & Astrodynamics Roadmap

---

## 0. Note for the implementing AI / agent

This document is self-contained. It specifies data sources, math, algorithms, API
contracts, file layout, and a phased build order with a Definition-of-Done (DoD) for
each phase. Follow the phase order — later phases depend on earlier ones.

Hard constraints to respect throughout:
- **Never brute-force screen the full catalog.** Always run the Stage-1 altitude-band
  filter (§4.3) before any pairwise distance computation. The full tracked-object
  catalog is on the order of 25,000–30,000 objects; unfiltered O(N²) comparison is
  not viable even offline.
- **Cache all TLE fetches.** Space-Track enforces query throttling and will block
  abusive polling. CelesTrak has no login but should still not be hit on every page
  load. Fetch on a schedule (e.g. every 2–6 hours), store locally, serve from cache.
- **Keep physics and ML separate and honest.** The ML component is a *speed/triage*
  layer, not a replacement for the physics. Never present the ML output as a
  collision probability — only the Monte Carlo / analytic estimate (§4.4) may be
  called "Pc."
- **State every assumption out loud in the UI and in any report/demo.** TLEs do not
  carry covariance data, exact object size, or mass. Every place this matters is
  flagged below — carry those flags into the product itself (tooltips, footnotes),
  not just this document. Transparency and visible intellectual honesty are paramount.

---

## 1. Concept and what makes this different from a generic version

Most teams that touch this problem statement build a dashboard that plots satellite
dots on a globe and prints a "risk score" with no defined meaning. This roadmap avoids
that in four specific ways:

1. **A real two-stage screening algorithm** (coarse altitude-band filter → refined
   time-of-closest-approach search via numerical minimization), not a fixed-step grid
   scan. This is both faster and mathematically correct — a fixed grid can miss or
   mis-locate the true closest approach.
2. **An honest probability-of-collision estimate.** Since TLEs don't include
   covariance, we say so, pick a defensible assumed uncertainty, and compute Pc via
   Monte Carlo sampling in the encounter plane — a method anyone can verify by reading
   the code, rather than a mystery formula.
3. **ML used for what ML is actually good for here: cheap approximation of an
   expensive calculation**, not for manufacturing a risk score from thin air. The
   model learns to predict Pc from cheap features so the expensive Monte Carlo run
   only has to happen on a short list, not on every candidate pair.
4. **Validated against a real historical event** — the 2009 Iridium 33 / Cosmos 2251
   collision (§5) — instead of only ever showing synthetic self-reported numbers.

---

## 2. System architecture

```
 ┌────────────────────┐
 │ CelesTrak / Space-  │   TLE + SATCAT metadata (cached locally)
 │ Track (public data) │
 └─────────┬────────────┘
           ▼
 ┌────────────────────┐
 │ Ingestion &         │   parse TLE -> orbital elements per object
 │ Parsing             │
 └─────────┬────────────┘
           ▼
 ┌────────────────────┐
 │ Propagation         │   SGP4 via Skyfield -> position/velocity (TEME/ECI)
 └─────────┬────────────┘
           ▼
 ┌────────────────────┐
 │ Stage 1: Coarse     │   altitude-band overlap filter -> candidate pairs
 │ Filter              │
 └─────────┬────────────┘
           ▼
 ┌────────────────────┐
 │ Stage 2: Refined    │   coarse time scan + scalar minimization -> true TCA,
 │ TCA Search          │   true miss distance, relative velocity
 └─────────┬────────────┘
           ▼
 ┌────────────────────┐        ┌───────────────────────┐
 │ ML Triage Layer     │──────▶│ Monte Carlo Pc         │
 │ (rank & shortlist)  │       │ (top-K candidates only)│
 └─────────┬────────────┘       └───────────┬────────────┘
           │                                 ▼
           │                        ┌───────────────────┐
           │                        │ Risk tiering       │
           │                        └─────────┬──────────┘
           ▼                                  ▼
 ┌────────────────────────────────────────────────────┐
 │ Maneuver Planner (Clohessy-Wiltshire)               │
 │  -> delta-v vector, projected new miss distance      │
 └─────────────────────┬────────────────────────────────┘
                        ▼
 ┌────────────────────────────────────────────────────┐
 │ FastAPI backend  (§6)                                │
 └─────────────────────┬────────────────────────────────┘
                        ▼
 ┌────────────────────────────────────────────────────┐
 │ Three.js web dashboard (§7)                          │
 └────────────────────────────────────────────────────┘
```

Everything above is software. No sensors, no procurement, no hardware.

---

## 3. Data layer

| Source | Auth | Use | Notes |
|---|---|---|---|
| **CelesTrak** (`celestrak.org/NORAD/elements/`) | None | Daily active-satellite TLEs, grouped by category (`active`, `stations`, `debris` where published) | Fastest to start with. No login. |
| **Space-Track** (`space-track.org`) | Free account | Full catalog, historical TLEs, SATCAT metadata (`OBJECT_TYPE`, `RCS_SIZE`) | Needed for §5 historical validation and for object-size defaults. Respect their published query-rate rules — cache aggressively, do not poll in a loop. |
| **CelesTrak historical collision archive** (`celestrak.org/events/collision/`) | None | Purpose-built dataset covering the Iridium 33 / Cosmos 2251 event specifically | Use this as the primary source for §5 rather than reconstructing it from scratch. |

**Caching strategy:** fetch on startup, store raw TLE text plus a parsed cache
(SQLite or flat JSON) with a `fetched_at` timestamp. Background refresh job every few
hours. Every API response should carry `data_as_of` so the dashboard can show
"Data source: CelesTrak | Last updated: …" honestly.

**Object metadata for sizing:** Space-Track's SATCAT provides `OBJECT_TYPE`
(`PAYLOAD` / `ROCKET BODY` / `DEBRIS` / `UNKNOWN`) and `RCS_SIZE`
(`SMALL` / `MEDIUM` / `LARGE`). Use these to pick a hard-body-radius default per
object (§4.4) instead of a single flat number for everything — this alone is a
noticeable step up in rigor over standard hobby projects.

---

## 4. Core pipeline

### 4.1 Ingestion & parsing
Parse each TLE's two lines into NORAD ID, epoch, inclination, RAAN, eccentricity,
argument of perigee, mean anomaly, mean motion. Reject TLEs whose epoch is more than
~14 days old for live operations (SGP4 accuracy degrades with propagation distance
from epoch) — but note the historical validation case in §5 deliberately uses
period-appropriate old TLEs, which is fine since propagation there stays *close* to
their own epoch.

### 4.2 Propagation
Use `skyfield` (wraps `sgp4`) rather than calling SGP4 directly — it handles the
TEME → other-frame conversions correctly, which is easy to get subtly wrong by hand.

```python
from skyfield.api import EarthSatellite, load

ts = load.timescale()
sat = EarthSatellite(line1, line2, name, ts)
t = ts.utc(2026, 8, 14, 12, 0, 0)
geocentric = sat.at(t)          # position/velocity in GCRS (near-ECI), km and km/s
r_km = geocentric.position.km
v_km_s = geocentric.velocity.km_per_s
```

Keep physics (screening, Pc, maneuver planning) in this inertial frame throughout.
Only convert to ECEF/lat-lon at the very last step, for map rendering — mixing frames
earlier is a common source of silently wrong distances.

### 4.3 Two-stage conjunction screening

**Stage 1 — coarse altitude-band filter.** Cheap, eliminates the vast majority of the
O(N²) pairs before any propagation-heavy work happens.

```python
MU_EARTH_KM3_S2 = 398600.4418

def semi_major_axis_km(mean_motion_rev_per_day: float) -> float:
    n_rad_s = mean_motion_rev_per_day * 2 * math.pi / 86400
    return (MU_EARTH_KM3_S2 / n_rad_s**2) ** (1/3)

def altitude_band_km(a_km: float, e: float) -> tuple[float, float]:
    return a_km * (1 - e), a_km * (1 + e)   # perigee, apogee radii

def bands_overlap(band_a, band_b, margin_km: float = 50.0) -> bool:
    return not (band_a[1] + margin_km < band_b[0] or band_b[1] + margin_km < band_a[0])
```

Only pairs that pass `bands_overlap` proceed to Stage 2.

**Stage 2 — refined time-of-closest-approach search.** Coarse time-grid scan to find
candidate local minima, then refine each with a scalar minimizer instead of trusting
the grid resolution directly. This is the specific improvement over a fixed-step
grid search: a grid alone can under- or over-estimate the true miss distance and can
report the wrong time if the true minimum falls between grid points.

```python
from scipy.optimize import minimize_scalar
import numpy as np

def relative_distance_km(t_epoch_s, sat_i, sat_j, ts):
    ti = ts.tt_jd(ts.tt_jd(0).tt + t_epoch_s / 86400)  # convert to Skyfield time
    ri = sat_i.at(ti).position.km
    rj = sat_j.at(ti).position.km
    return float(np.linalg.norm(ri - rj))

def find_conjunctions(sat_i, sat_j, ts, t_start_s, t_end_s,
                       coarse_step_s=300, screen_threshold_km=25.0):
    times = np.arange(t_start_s, t_end_s, coarse_step_s)
    dists = [relative_distance_km(t, sat_i, sat_j, ts) for t in times]

    events = []
    for k in range(1, len(dists) - 1):
        if dists[k] < dists[k-1] and dists[k] < dists[k+1]:
            result = minimize_scalar(
                relative_distance_km, args=(sat_i, sat_j, ts),
                bounds=(times[k-1], times[k+1]), method="bounded",
            )
            if result.fun < screen_threshold_km:
                events.append({"tca_epoch_s": result.x, "miss_distance_km": result.fun})
    return events
```

`screen_threshold_km` is your initial cheap cutoff (e.g. 25 km) — anything wider than
that isn't worth carrying into risk scoring at all. This threshold reflects operational practice:
real conjunction-assessment screening volumes are commonly on this order of magnitude, precisely
because uncertainty at TLE precision makes anything much tighter not meaningfully distinguishable.

### 4.4 Risk assessment — Monte Carlo Pc estimate

TLEs do not include a covariance (uncertainty) matrix, so an exact probability of
collision cannot be computed from them alone — say this explicitly in the product,
not just here. What we *can* do defensibly:

1. **Hard-body radius (HBR):** combined radius of both objects, `HBR = r_A + r_B`.
   Derive `r_A`, `r_B` from SATCAT `RCS_SIZE` where available
   (e.g. SMALL ≈ 0.5 m, MEDIUM ≈ 2 m, LARGE ≈ 5 m — treat these as configurable
   defaults, not authoritative), else fall back to `OBJECT_TYPE` defaults
   (payload > rocket body > debris fragment).
2. **Assumed positional uncertainty (σ):** since true covariance isn't available,
   use a stated, configurable order-of-magnitude default for combined position
   uncertainty in the encounter plane (documented in code as an assumption, exposed
   in the UI, easy to change). Do not present this as measured — present it as
   "assumed, typical of TLE-derived state uncertainty."
3. **Monte Carlo estimate**, sampled in the 2D plane perpendicular to the relative
   velocity vector at TCA (the "B-plane" / encounter plane):

```python
def monte_carlo_pc(miss_vector_km: np.ndarray, sigma_km: float,
                    hbr_km: float, n_samples: int = 200_000) -> float:
    samples = np.random.normal(loc=miss_vector_km, scale=sigma_km, size=(n_samples, 2))
    inside = np.sum(np.linalg.norm(samples, axis=1) <= hbr_km)
    return inside / n_samples
```

This is intuitive to explain live: *"we simulate a large number of plausible actual
positions given typical TLE uncertainty, and count how often the two objects would
actually overlap."*

4. **Risk tiers.** Map the resulting Pc to Low / Moderate / High / Critical. Real
   spaceflight-safety practice generally treats Pc thresholds in the
   10⁻⁴–10⁻⁵ range as the point where a closer look or maneuver planning is
   warranted — use this as a general reference point for tier boundaries, not a
   precise universal cutoff, and say so.

### 4.5 ML triage layer — a legitimate use of ML here

Running Monte Carlo Pc (§4.4) on every pair that survives Stage 1/2 doesn't scale to
a live dashboard with thousands of candidate events. The honest, defensible use of ML
in this pipeline is as a **fast surrogate model** that approximates the expensive
Monte Carlo calculation well enough to rank and shortlist events — full Monte Carlo
then only runs on the top-K.

- **Features (cheap to compute):** miss distance, relative velocity, combined HBR,
  altitude, inclination difference, object types of both bodies.
- **Training data:** generate it yourself. Sweep the feature space
  (miss distance × relative velocity × HBR × assumed σ), compute ground-truth Pc via
  `monte_carlo_pc` for each combination, and train on `(features → log10(Pc))`.
  Regressing in log space matters: Pc spans many orders of magnitude, and a
  linear-scale model will be dominated by the least-informative high-Pc tail.
- **Model:** `RandomForestRegressor` or `XGBRegressor` — nothing exotic needed, and
  simplicity here is a feature for computational transparency and interpretability.

```python
from sklearn.ensemble import RandomForestRegressor
model = RandomForestRegressor(n_estimators=300, max_depth=14, n_jobs=-1)
model.fit(X_train, y_train_log10_pc)
```

The core principle: *"We don't use ML to invent a risk score
— we use it to approximate an expensive physics calculation fast enough to triage
thousands of events, the same pattern real conjunction-assessment operators use to
manage screening volume."*

### 4.6 Maneuver planning — Clohessy-Wiltshire equations

For a flagged high-risk conjunction, compute an avoidance burn using the standard
Clohessy-Wiltshire (Hill's) relative-motion equations — real orbital mechanics, not
an ad hoc linear approximation.

**Setup:** work in the RTN frame (Radial / along-track / cross-track, i.e. the CW
x/y/z) centered on one object (the "target"), with `n` = the target's mean motion in
rad/s. Derive the initial relative position/velocity of the other object in this
frame from both objects' ECI states (a standard rotation — implement as a helper
`eci_to_rtn(r_target, v_target, r_chaser, v_chaser)`).

**CW state transition matrix**, mapping an initial relative state at a burn time to
the relative state `Δt` later:

```
Φ_rr(Δt) =
| 4 − 3cos(nΔt)         0    0        |
| 6(sin(nΔt) − nΔt)     1    0        |
| 0                     0    cos(nΔt) |

Φ_rv(Δt) =
| sin(nΔt)/n              2(1−cos(nΔt))/n         0            |
| −2(1−cos(nΔt))/n        (4sin(nΔt) − 3nΔt)/n     0            |
| 0                        0                        sin(nΔt)/n   |
```

Position at TCA as a function of an impulsive Δv applied at the burn time:

```
r(Δt) = Φ_rr(Δt)·r0 + Φ_rv(Δt)·(v0 + Δv)
```

**Choosing the burn direction:** for a fixed Δv budget (magnitude), the direction
that maximizes the resulting shift in miss distance is the right singular vector of
`Φ_rv(Δt)` associated with its largest singular value:

```python
def plan_maneuver(r0_rtn, v0_rtn, n_rad_s, dt_s, delta_v_budget_m_s):
    Phi_rr, Phi_rv = cw_stm(n_rad_s, dt_s)               # both 3x3, km / km-s units
    U, S, Vt = np.linalg.svd(Phi_rv)
    burn_direction = Vt[0]                                # unit vector, RTN frame
    delta_v = (delta_v_budget_m_s / 1000.0) * burn_direction   # km/s
    baseline_r_tca = Phi_rr @ r0_rtn + Phi_rv @ v0_rtn
    new_r_tca = baseline_r_tca + Phi_rv @ delta_v
    return {
        "burn_direction_rtn": burn_direction.tolist(),
        "delta_v_m_s": delta_v_budget_m_s,
        "baseline_miss_distance_km": float(np.linalg.norm(baseline_r_tca)),
        "projected_miss_distance_km": float(np.linalg.norm(new_r_tca)),
    }
```

**Practical detail worth stating in the demo:** the along-track secular term
`6(sin(nΔt) − nΔt)` grows with `Δt`, which is why real operators burn well before
TCA rather than at the last minute — an early, small along-track nudge accomplishes
what a much larger burn would be needed for close to TCA. Sweep `dt_s` (time before
TCA) and show how required Δv for a given target miss-distance increase drops sharply
the earlier the burn happens — a genuinely instructive plot for the dashboard.

---

## 5. Historical validation: Iridium 33 / Cosmos 2251 (10 Feb 2009)

This is the strongest differentiator available for this topic: instead of only
showing synthetic, self-reported numbers, run the pipeline against a real, documented
collision and show it independently flags the event.

**Verified facts to build the test case against:**
- Iridium 33 — NORAD/SATCAT catalog number **24946**, COSPAR ID 1997-051C, an active
  US commercial communications satellite (Iridium constellation), inclination ~86.4°.
- Cosmos 2251 — NORAD/SATCAT catalog number **22675**, COSPAR ID 1993-036A, a
  long-defunct Russian (Strela-2M class) military communications satellite,
  inclination ~74°.
- Collision occurred **10 February 2009, ~16:56 UTC**, at an altitude of
  approximately **789–790 km** over the Taymyr Peninsula, Siberia, at a relative
  velocity of roughly **11.6–11.7 km/s**. It was the first known accidental
  hypervelocity collision between two intact satellites, and produced well over a
  thousand pieces of cataloged debris.
- The orbital planes crossed at a very steep angle (Iridium 33 at ~86.4° inclination,
  Cosmos 2251 at ~74°), which is why the geometry was essentially head-on and left no
  room for the encounter to be a survivable near-miss.
- CelesTrak hosts a dedicated historical dataset for this exact event at
  `celestrak.org/events/collision/` — use this as the primary TLE source for the
  test rather than trying to reconstruct it from the general historical archive.

**Validation task:**
1. Pull TLEs for NORAD 24946 and NORAD 22675 with epochs shortly before 10 Feb 2009
   (use CelesTrak's dedicated archive above, or Space-Track's historical TLE query if
   you need finer epoch control).
2. Run the exact same Stage 1 → Stage 2 → Monte Carlo Pc pipeline used for live data,
   with no special-casing.
3. Confirm the pipeline independently surfaces a conjunction between these two
   objects with a TCA landing on/near 10 Feb 2009 ~16:56 UTC and a miss distance
   collapsing toward zero — i.e., the system would have flagged this as a live,
   high-priority event had it been running in real time in February 2009.
4. Keep the propagation window close to the TLEs' own epochs (days, not months) —
   SGP4 accuracy degrades the further you propagate from epoch, and this is exactly
   the kind of detail worth being upfront about if asked.

**Why this matters:** it turns "trust our risk score" into "here is a
real collision our system would have caught," which is a categorically stronger
claim and one very few independent projects in this sector attempt.

---

## 6. Backend API (FastAPI)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/objects` | GET | Current positions for a filtered object set |
| `/api/conjunctions` | GET | Ranked conjunction events for a forecast window |
| `/api/conjunctions/{event_id}` | GET | Full detail for one event, including Pc breakdown |
| `/api/maneuver/{event_id}` | POST | Compute an avoidance burn for one event |
| `/api/validation/iridium-cosmos` | GET | Replays the §5 historical case, returns results |

**`GET /api/objects?group=active&limit=500`**
```json
{
  "data_as_of": "2026-08-14T10:00:00Z",
  "objects": [
    {
      "norad_id": 25544,
      "name": "ISS (ZARYA)",
      "object_type": "PAYLOAD",
      "epoch": "2026-08-13T22:11:04Z",
      "position_km": [4123.4, -5210.7, 1500.2],
      "velocity_km_s": [-2.11, 4.32, 5.98],
      "frame": "ECI"
    }
  ]
}
```

**`GET /api/conjunctions?window_hours=72&top=20`**
```json
{
  "forecast_window_hours": 72,
  "events": [
    {
      "id": "evt_20260814_0001",
      "object_a": {"norad_id": 24946, "name": "IRIDIUM 33"},
      "object_b": {"norad_id": 22675, "name": "COSMOS 2251"},
      "tca_utc": "2026-08-16T04:12:31Z",
      "miss_distance_km": 1.24,
      "relative_velocity_km_s": 11.6,
      "pc_estimate": 3.1e-4,
      "risk_tier": "high",
      "ml_prescreen_score": 0.87
    }
  ]
}
```

**`POST /api/maneuver/{event_id}`**
```json
// request
{ "delta_v_budget_m_s": 0.1, "burn_lead_time_hours": 24 }

// response
{
  "burn_direction_rtn": [0.02, 0.999, -0.01],
  "delta_v_m_s": 0.1,
  "baseline_miss_distance_km": 1.24,
  "projected_miss_distance_km": 6.8,
  "projected_pc": 4.0e-7
}
```

---

## 7. Frontend / visualization (Three.js)

- **Scene:** textured Earth sphere, day/night or simple diffuse texture; camera with
  orbit controls (zoom/pan/rotate).
- **Objects:** points/instanced meshes for tracked objects — use
  `THREE.InstancedMesh` once object count exceeds a few hundred; plotting thousands
  of individual meshes will tank frame rate.
- **Orbit trails:** draw as `THREE.Line` from a short buffer of recent propagated
  positions per object, not a full-orbit ellipse recomputed every frame.
- **Conjunction markers:** glowing marker at each flagged event's approximate
  location, color-coded by risk tier (e.g. yellow → orange → red).
- **Side panel:** ranked conjunction list; clicking an event shows TCA, miss
  distance, relative velocity, Pc (with its assumptions stated inline), and a
  "Recommend Maneuver" button wired to the `/api/maneuver` endpoint.
- **Header strip:** "Data source: CelesTrak/Space-Track | Last updated: …" pulled
  from `data_as_of` — keep this always visible, ensuring operational data provenance.
- **Forecast window selector:** 24h / 72h / 7d, re-queries `/api/conjunctions`.
- **Validation tab:** a dedicated view that runs/displays the §5 historical replay —
  this provides empirical validation against historical telemetry.

Object-count performance note: don't render the full ~25–30k catalog live. Default
to a curated subset (active payloads + a couple of known debris clouds, e.g. the
Iridium 33 / Cosmos 2251 fragments) with an option to load more.

---

## 8. Repository structure

```
space-guard/
├── README.md
├── requirements.txt
├── backend/
│   └── app/
│       ├── main.py                      # FastAPI app + route registration
│       ├── config.py                    # thresholds, default HBR/sigma, forecast window
│       ├── ingestion/
│       │   ├── tle_fetch.py             # CelesTrak/Space-Track fetch + local cache
│       │   └── tle_parser.py            # TLE lines -> orbital element objects
│       ├── propagation/
│       │   └── propagate.py             # Skyfield/SGP4 wrapper
│       ├── screening/
│       │   ├── coarse_filter.py         # altitude-band overlap filter
│       │   └── conjunction.py           # coarse scan + refined TCA search
│       ├── risk/
│       │   ├── monte_carlo_pc.py        # §4.4
│       │   └── ml_triage.py             # §4.5 surrogate model, train + predict
│       ├── maneuver/
│       │   └── cw_planner.py            # §4.6
│       ├── validation/
│       │   └── iridium_cosmos_case.py   # §5 historical replay
│       └── models/
│           └── schemas.py               # Pydantic request/response models
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── scene.js                     # Earth + orbit rendering
│       ├── api.js                       # backend fetch wrapper
│       └── ui.js                        # side panel, event list, controls
└── data/
    ├── tle_cache/
    └── historical/
```

---

## 9. Environment & dependencies

`requirements.txt`
```
sgp4>=2.22
skyfield>=1.46
numpy>=1.26
scipy>=1.11
fastapi>=0.110
uvicorn[standard]>=0.29
pydantic>=2.6
scikit-learn>=1.4
pandas>=2.2
httpx>=0.27
python-dotenv>=1.0
```

Frontend (`package.json` deps): `three`, dev dependency `vite`. Plain JS is
sufficient at this scope — no framework needed.

---

## 10. Phased build plan

Each phase lists a Definition of Done (DoD) so progress is self-verifiable.

**Phase 1 — Ingestion & propagation**
Build `tle_fetch.py`, `tle_parser.py`, `propagate.py`.
*DoD:* given a NORAD ID, the system returns a position/velocity at an arbitrary
timestamp within the TLE's valid window, cross-checked by eye against a known
reference (e.g. ISS position via a public tracker) to within a few km.

**Phase 2 — Screening**
Build `coarse_filter.py`, `conjunction.py`.
*DoD:* running Stage 1 + Stage 2 over a batch of a few hundred objects over a 72h
window completes in a reasonable time (target: well under a minute on a laptop) and
returns a ranked list of `(pair, tca, miss_distance)`.

**Phase 3 — Risk assessment**
Build `monte_carlo_pc.py`; validate against a couple of hand-checkable extreme cases
(e.g. miss distance ≫ HBR + σ should give Pc ≈ 0; miss distance ≈ 0 with small σ
relative to HBR should give Pc approaching 1).
*DoD:* Pc values are monotonic in the expected direction as miss distance increases,
for fixed σ and HBR.

**Phase 4 — ML triage layer**
Generate synthetic training sweep, train the surrogate model, wire it in front of
Monte Carlo so only the top-K candidates get a full Pc run.
*DoD:* model's ranking of held-out synthetic test pairs correlates strongly with true
Monte Carlo Pc ranking (e.g. inspect via Spearman correlation, not just eyeballing).

**Phase 5 — Maneuver planning**
Build `cw_planner.py` and the `eci_to_rtn` helper.
*DoD:* for a synthetic conjunction, larger Δv budgets produce larger projected miss
distances (sanity check on the direction of the effect), and burning earlier
(`dt_s` larger) requires less Δv for the same target miss-distance increase,
consistent with §4.6's secular-term discussion.

**Phase 6 — Historical validation**
Build `iridium_cosmos_case.py` per §5.
*DoD:* pipeline run on pre-collision TLEs for NORAD 24946 / 22675 surfaces a
conjunction with TCA within a reasonable window of 10 Feb 2009 ~16:56 UTC and a miss
distance collapsing toward the low single-digit km range or less.

**Phase 7 — API layer**
Build `main.py` and `schemas.py`, wire all endpoints from §6.
*DoD:* all five endpoints return schema-valid responses against live cached data,
including the validation endpoint.

**Phase 8 — Frontend**
Build the Three.js dashboard per §7.
*DoD:* dashboard loads live objects, displays the ranked conjunction list, lets a
user drill into an event and request a maneuver, and has a working validation tab
showing the historical replay.

**Phase 9 — System Polish & Operational Verification**
Header data-freshness strip, forecast-window selector, error states for stale/missing
data, and a full operational verification run end to end.

---

## 11. Testing & validation checklist

- [ ] Propagated ISS position matches a public reference to within a few km.
- [ ] Altitude-band filter correctly excludes an obviously non-overlapping pair
      (e.g. a LEO object vs. a GEO object) and correctly retains a known close pair.
- [ ] Refined TCA search finds a lower miss distance than the coarse grid alone on at
      least one synthetic close-approach case (demonstrates the refinement matters).
- [ ] Monte Carlo Pc passes the monotonicity sanity checks from Phase 3.
- [ ] ML surrogate ranking correlates with true Monte Carlo ranking on held-out data.
- [ ] Maneuver planner passes the Phase 5 sanity checks.
- [ ] Historical replay (§5) surfaces the Iridium/Cosmos conjunction as specified.
- [ ] API responses validate against the Pydantic schemas under normal and
      empty/error conditions (e.g. TLE fetch temporarily unavailable).
- [ ] Dashboard remains responsive with the curated demo-scale object set.

---

## 12. Known limitations — state these up front, don't wait to be asked

- TLEs carry no covariance; the Pc estimate rests on an assumed, configurable
  uncertainty, not a measured one. This is clearly the single biggest simplification
  in the system and should be the first thing highlighted, ensuring full technical clarity.
- SGP4 accuracy degrades with distance from a TLE's epoch; forecasts are only
  reliable a handful of days out, and old TLEs (as in the historical case) should
  only be propagated near their own epoch.
- Object sizes are category defaults from SATCAT (`RCS_SIZE`/`OBJECT_TYPE`), not
  measured dimensions — real hard-body radii vary within each category.
- The live system runs on a curated subset of the catalog for performance and clarity,
  not the full ~25–30k tracked-object population.
- The ML layer approximates the Monte Carlo Pc calculation; it is a speed
  optimization, not an independent source of ground truth.

---

## 13. End-to-end walkthrough flow

1. Open the dashboard — rotating Earth, live orbit tracks, "Data source: CelesTrak |
   Last updated: …" visible in the header.
2. Set forecast window to 72h, show the ranked conjunction list populate.
3. Open the top event, walk through: objects involved, TCA, miss distance, relative
   velocity, and the Pc estimate — explicitly note the assumed-uncertainty caveat
   while explaining it, rather than glossing over it.
4. Click "Recommend Maneuver," show the projected new miss distance and the burn
   parameters, and briefly explain *why* an early along-track burn is efficient
   (§4.6) — this highlights real astrodynamics domain understanding.
5. Switch to the Validation tab. Run the Iridium 33 / Cosmos 2251 replay live.
   State plainly: *"This is a real collision from February 2009. Running our exact
   pipeline — no special-casing — on TLEs from before the event, the system
   independently flags this conjunction."*
6. Close by naming the limitations from §12 unprompted. This ensures total technical rigor and clarity.

---

## 14. Stretch goals (only if core pipeline is solid with time to spare)

- Swap the isotropic assumed-σ model for a simple along-track/radial/cross-track
  anisotropic uncertainty (still assumed, but more realistic in shape).
- Add a second historical validation case for comparison (e.g. a well-documented
  high-interest conjunction that did *not* result in collision, to show the system
  correctly assigns it a lower risk tier).
- CesiumJS upgrade for the frontend if bandwidth allows — more realistic globe
  rendering, at the cost of needing a (free-tier) Cesium Ion token.
- Batch-mode report generation (PDF/CSV of the current top-N conjunctions) for an
  "operations handoff" angle.

---

## 15. Sources referenced for §5

- Iridium 33 orbital/catalog details — Wikipedia, "Iridium 33."
- Collision event details (date, time, altitude, relative velocity) — NASA Technical
  Reports Server, "Analysis and Consequences of the Iridium 33-Cosmos 2251
  Collision"; Wikipedia, "2009 satellite collision."
- Dedicated historical TLE archive for this event — CelesTrak,
  `celestrak.org/events/collision/`.
