import React, { useState } from 'react';
import { 
  Globe2, 
  Target, 
  Rocket, 
  Server, 
  Zap, 
  ShieldAlert, 
  Info, 
  Cpu, 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  Layers,
  Activity,
  Compass,
  AlertTriangle,
  RotateCw,
  Orbit,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sound } from '@/utils/audio';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics', label: '1. Orbital Basics', icon: Orbit, subtitle: 'Intuition & Fundamentals' },
    { id: 'bplane', label: '2. Encounter & B-Plane', icon: Target, subtitle: '3D to 2D Geometry' },
    { id: 'probability', label: '3. Collision Risk (Pc)', icon: Activity, subtitle: 'Gaussian Probability' },
    { id: 'maneuver', label: '4. Avoidance Physics', icon: Rocket, subtitle: 'CW-STM & 14× Leverage' },
    { id: 'api', label: '5. Technical Specs & API', icon: Server, subtitle: 'Endpoints & Parameters' },
  ];

  const apiEndpoints = [
    { method: 'GET', path: '/health', desc: 'Health check, service version, and ML surrogate state.' },
    { method: 'POST', path: '/scan', desc: 'Executes full two-stage screening (±50km altitude filter + Scipy TCA search + Foster/Alfano Pc).' },
    { method: 'GET', path: '/api/objects?limit=100', desc: 'Propagates catalog satellites to current UTC second in GCRS/ECI frame via SGP4.' },
    { method: 'POST', path: '/api/maneuver', desc: 'Computes optimal impulsive burn using Clohessy-Wiltshire STM SVD decomposition.' },
    { method: 'GET', path: '/api/validation/iridium-cosmos', desc: 'Replays the 2009 Iridium 33 / Cosmos 2251 collision benchmark from historical TLEs.' },
  ];

  return (
    <div className="flex flex-col gap-8 font-sans text-foreground pb-16">
      {/* ═══════════════════════════════════════════════════════
          HEADER BANNER
      ═══════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 rounded-sm border border-primary/30 bg-primary/5 backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary bg-primary/10 px-3 py-1">
            ASTRODYNAMICS GUIDEBOOK
          </Badge>
          <Badge variant="outline" className="font-mono text-xs border-border text-muted-foreground px-3 py-1">
            From First Principles to Exact Mathematics
          </Badge>
        </div>

        <div className="space-y-2 max-w-4xl">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            How Space-Guard Works: Orbital Mechanics & Avoidance
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Understanding satellite collision defense does not require a degree in aerospace engineering. 
            This visual guide begins with basic intuitive physics and progressively reveals the mathematical formulations.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════
            LARGE INTERACTIVE TAB SWITCHER
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id);
                }}
                className={`p-3.5 rounded-xs border text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-primary/40'
                    : 'bg-card/70 border-border/80 text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`size-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {isActive && <span className="size-1.5 rounded-full bg-primary animate-pulse" />}
                </div>
                <div>
                  <span className={`text-sm font-semibold block leading-tight ${isActive ? 'text-foreground font-bold' : ''}`}>
                    {tab.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    {tab.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB 1: ORBITAL BASICS (ZERO JARGON)
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'basics' && (
        <div className="space-y-6 animate-fade-in">
          {/* Intro Card */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-md rounded-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Globe2 className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    1. The Intuition: What Actually Happens in Orbit?
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Why satellites stay up, why they move so blisteringly fast, and why space is getting crowded.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6 text-sm sm:text-base leading-relaxed">
              {/* Concept 1: What is an orbit? */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="size-6 rounded-xs bg-primary/20 text-primary text-xs font-mono font-bold flex items-center justify-center">A</span>
                    An orbit is just "falling continuously without hitting the ground"
                  </h3>
                  <p className="text-muted-foreground">
                    If you throw a ball on Earth, gravity pulls it down into an arc. If you throw it faster, the arc flattens. 
                    If you throw it at <strong className="text-foreground">28,000 km/h (~7.8 km every second)</strong>, the Earth's surface curves away underneath the ball at the exact same rate the ball falls.
                  </p>
                  <p className="text-muted-foreground">
                    There are no engines running continuously — the satellite is in permanent free-fall, maintained entirely by Earth's gravitational pull.
                  </p>
                </div>

                <div className="lg:col-span-5 p-5 rounded-sm border border-primary/20 bg-primary/5 space-y-3">
                  <div className="text-xs font-mono uppercase text-primary font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> Key Astrodynamics Fact
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    7.8 km/s <span className="text-sm text-muted-foreground font-sans font-normal">(28,000 km/h)</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    At this speed, a satellite travels the entire diameter of a city in under 2 seconds. A direct head-on encounter closes at up to <strong className="text-rose-400">14.1 km/s (50,800 km/h)</strong>.
                  </p>
                </div>
              </div>

              {/* Concept 2: Why collisions are catastrophic */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-5 rounded-sm border border-rose-500/30 bg-rose-500/5 space-y-2">
                  <div className="size-8 rounded-xs bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Flame className="size-4" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">Extreme Kinetic Energy</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Kinetic energy scales with velocity squared (E = ½mv²). At 14 km/s, even a 1-centimeter paint fleck carries the destructive force of an exploding grenade.
                  </p>
                </div>

                <div className="p-5 rounded-sm border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <div className="size-8 rounded-xs bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertTriangle className="size-4" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">The Kessler Syndrome</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    When two satellites collide, they disintegrate into thousands of hypervelocity fragments. Each fragment becomes a new projectile, triggering a cascading chain reaction.
                  </p>
                </div>

                <div className="p-5 rounded-sm border border-primary/30 bg-primary/5 space-y-2">
                  <div className="size-8 rounded-xs bg-primary/20 text-primary flex items-center justify-center">
                    <RotateCw className="size-4" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">Counter-Intuitive Driving</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You cannot "step on the brake" in orbit. Firing thrusters backwards lowers your orbit, which makes your orbital period shorter — actually making you catch up faster!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 2: ENCOUNTER GEOMETRY & B-PLANE
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'bplane' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-border/80 bg-card/60 backdrop-blur-md rounded-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Target className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    2. The Geometry: Turning a 3D Flyby into a 2D Dartboard (The B-Plane)
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    How astrodynamicists simplify a hypervelocity encounter into an intuitive 2D cross-section.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6 text-sm sm:text-base leading-relaxed">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-lg font-bold text-foreground">
                    The Problem: 3D Trajectories Cross in Milliseconds
                  </h3>
                  <p className="text-muted-foreground">
                    When Satellite A and Debris B pass each other, they are moving at ~14 km/s. The entire encounter happens in less than a tenth of a second.
                  </p>
                  <p className="text-muted-foreground">
                    To analyze whether they hit, we freeze time at the <strong className="text-foreground">Time of Closest Approach (TCA)</strong>. We place a flat 2D plane perpendicular to the incoming velocity vector.
                  </p>
                  <div className="p-4 rounded-sm border border-border bg-secondary/30 space-y-2">
                    <span className="text-xs font-mono uppercase text-primary font-bold">Analogy: The Dartboard in Space</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Imagine holding a paper dartboard centered on Satellite A, facing directly toward where Debris B is flying in from. The point where Debris B pierces the paper is the <strong className="text-foreground">Miss Vector (b)</strong>.
                    </p>
                  </div>
                </div>

                {/* Visual B-Plane Graphic Card */}
                <div className="lg:col-span-6 p-6 rounded-sm border border-border/80 bg-background/80 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative size-48 rounded-full border border-dashed border-primary/40 flex items-center justify-center bg-primary/5">
                    {/* 3 Sigma Outer Ring */}
                    <div className="absolute size-40 rounded-full border border-amber-500/30 bg-amber-500/5 flex items-center justify-center">
                      {/* 2 Sigma Ring */}
                      <div className="absolute size-28 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
                        {/* 1 Sigma Ring */}
                        <div className="absolute size-16 rounded-full border border-emerald-400/60 bg-emerald-500/20 flex items-center justify-center">
                          {/* Hard Body Core */}
                          <div className="size-4 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                        </div>
                      </div>
                    </div>
                    {/* Crosshair Axes */}
                    <div className="absolute w-full h-px bg-border/80" />
                    <div className="absolute h-full w-px bg-border/80" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-foreground block">
                      B-Plane Coordinate Frame (ξ, ζ)
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      Center: Primary Satellite · Red Dot: Hard-Body Radius (10m) · Rings: 1σ, 2σ, 3σ Positional Uncertainty Cloud
                    </span>
                  </div>
                </div>
              </div>

              {/* Positional Uncertainty Explanation */}
              <div className="p-5 rounded-sm border border-border/70 bg-secondary/20 space-y-2">
                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Info className="size-4 text-primary" />
                  Why is there an uncertainty cloud (σ = 500m)?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Radars on Earth track satellites from hundreds of kilometers away. Atmospheric drag fluctuations and solar radiation pressure introduce small measurement uncertainties. 
                  Therefore, a satellite is not a single point in space — it is surrounded by a <strong className="text-foreground">Gaussian probability bubble (σ ≈ 500 meters)</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 3: COLLISION PROBABILITY (PC)
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'probability' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-border/80 bg-card/60 backdrop-blur-md rounded-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Cpu className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    3. The Mathematics: How Foster/Alfano Calculates Risk in 5 Microseconds
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Analytic 2D Gaussian probability density integration without slow simulations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6 text-sm sm:text-base leading-relaxed">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">
                  The Core Question: "What percentage of the uncertainty cloud overlaps the satellite?"
                </h3>
                <p className="text-muted-foreground">
                  Instead of guessing a risk score or running 1,000,000 slow Monte Carlo coin flips, Space-Guard calculates the exact volume of the 2D Gaussian probability bell curve that sits inside the satellite's physical radius (<strong className="text-foreground">Hard-Body Radius = 10 meters</strong>).
                </p>
              </div>

              {/* Equation Breakdown Box */}
              <div className="p-6 rounded-sm border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                    The Foster/Alfano Analytic Formula
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] border-emerald-500/40 text-emerald-400">
                    &lt; 10 µs EVALUATION
                  </Badge>
                </div>

                <div className="p-4 rounded-xs bg-background/90 text-emerald-400 font-mono text-center text-base sm:text-lg font-bold border border-border overflow-x-auto">
                  Pc ≈ (HBR² / 2σ²) · exp(-d_miss² / 2σ²)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xs bg-secondary/40 border border-border space-y-1">
                    <strong className="text-foreground block">HBR (10 meters)</strong>
                    <span className="text-muted-foreground">Combined physical width of both satellites.</span>
                  </div>
                  <div className="p-3 rounded-xs bg-secondary/40 border border-border space-y-1">
                    <strong className="text-foreground block">σ (500 meters)</strong>
                    <span className="text-muted-foreground">Positional uncertainty spread from tracking radars.</span>
                  </div>
                  <div className="p-3 rounded-xs bg-secondary/40 border border-border space-y-1">
                    <strong className="text-foreground block">d_miss (km)</strong>
                    <span className="text-muted-foreground">Calculated miss distance at the instant of closest approach.</span>
                  </div>
                </div>
              </div>

              {/* Risk Tier Table */}
              <div className="space-y-3 pt-2">
                <h4 className="text-base font-bold text-foreground">Global Operational Thresholds</h4>
                <div className="overflow-x-auto rounded-xs border border-border/80 bg-background/60">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-secondary/40 text-muted-foreground border-b border-border/80 text-[11px] uppercase font-mono">
                      <tr>
                        <th className="py-3 px-4">Risk Tier</th>
                        <th className="py-3 px-4">Probability ($P_c$)</th>
                        <th className="py-3 px-4">Typical Miss Distance</th>
                        <th className="py-3 px-4">Action Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      <tr className="hover:bg-rose-500/10">
                        <td className="py-3 px-4 text-rose-400 font-bold">🔴 Critical</td>
                        <td className="py-3 px-4 font-bold text-rose-400">&gt; 1 × 10⁻⁴ (1 in 10,000)</td>
                        <td className="py-3 px-4 font-sans text-muted-foreground">&lt; 1.0 km</td>
                        <td className="py-3 px-4 font-sans text-foreground">Immediate avoidance burn calculation</td>
                      </tr>
                      <tr className="hover:bg-amber-500/10">
                        <td className="py-3 px-4 text-amber-400 font-bold">🟠 High</td>
                        <td className="py-3 px-4 text-amber-400">10⁻⁵ to 10⁻⁴</td>
                        <td className="py-3 px-4 font-sans text-muted-foreground">1.0 – 5.0 km</td>
                        <td className="py-3 px-4 font-sans text-foreground">Active tracking & standby burn generation</td>
                      </tr>
                      <tr className="hover:bg-secondary/20">
                        <td className="py-3 px-4 text-yellow-400 font-bold">🟡 Moderate</td>
                        <td className="py-3 px-4 text-yellow-400">10⁻⁶ to 10⁻⁵</td>
                        <td className="py-3 px-4 font-sans text-muted-foreground">5.0 – 25.0 km</td>
                        <td className="py-3 px-4 font-sans text-foreground">Elevated radar screening horizon</td>
                      </tr>
                      <tr className="hover:bg-emerald-500/10">
                        <td className="py-3 px-4 text-emerald-400 font-bold">🟢 Nominal</td>
                        <td className="py-3 px-4 text-emerald-400">≤ 1 × 10⁻⁶</td>
                        <td className="py-3 px-4 font-sans text-muted-foreground">&gt; 25.0 km</td>
                        <td className="py-3 px-4 font-sans text-foreground">Routine catalog propagation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 4: MANEUVER PHYSICS & SVD
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'maneuver' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-border/80 bg-card/60 backdrop-blur-md rounded-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Rocket className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    4. The Avoidance Physics: Clohessy-Wiltshire & The 14× Leverage Principle
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    How tiny thruster pulses executed early create immense orbital separation.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6 text-sm sm:text-base leading-relaxed">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-lg font-bold text-foreground">
                    The 14× Leverage Multiplier of Early Action
                  </h3>
                  <p className="text-muted-foreground">
                    If you push a satellite slightly, its orbital period changes. Over every orbit, that slight change in period accumulates secular drift along the flight path.
                  </p>
                  <p className="text-muted-foreground">
                    A tiny <strong className="text-emerald-400">0.10 m/s burn</strong> executed <strong className="text-foreground">24 hours prior</strong> creates <strong className="text-foreground">+4.83 kilometers</strong> of clearance. 
                    If you wait until 1 hour before TCA, that exact same burn produces less than 300 meters of shift!
                  </p>
                </div>

                <div className="lg:col-span-5 p-6 rounded-sm border border-primary/30 bg-primary/5 space-y-3 text-center">
                  <span className="text-xs font-mono uppercase text-primary font-bold">Efficiency Scaling</span>
                  <div className="text-4xl font-bold font-mono text-primary">
                    14× Gain
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Burn applied 24h prior vs 1h prior for identical propellant mass.
                  </p>
                </div>
              </div>

              {/* SVD Explanation */}
              <div className="p-5 rounded-sm border border-border/80 bg-secondary/30 space-y-3">
                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  How SVD (Singular Value Decomposition) Finds the Best Direction
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The Clohessy-Wiltshire State Transition Matrix Φ_rv(Δt) maps a 3D velocity impulse Δv to a 3D position shift Δr. 
                  By performing Singular Value Decomposition on Φ_rv = U Σ Vᵀ, the principal vector v₁ reveals the exact heading where 100% of the rocket's thrust energy converts into maximum separation distance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 5: SYSTEM SPECS & REST API
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-fade-in">
          {/* Engineering Baseline */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-md rounded-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Server className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    5. Engineering Assumptions & FastAPI REST Reference
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Transparent baseline parameters and live REST API specifications.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6 text-sm sm:text-base leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-sm border border-border/70 bg-secondary/20 space-y-1.5">
                  <span className="font-semibold text-foreground text-xs uppercase font-mono">Positional Uncertainty (σ)</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Assumed isotropic Gaussian standard deviation of <strong className="text-foreground">σ = 500 m</strong> (0.5 km) representing standard SGP4 TLE tracking precision.
                  </p>
                </div>

                <div className="p-4 rounded-sm border border-border/70 bg-secondary/20 space-y-1.5">
                  <span className="font-semibold text-foreground text-xs uppercase font-mono">Hard-Body Radius (HBR)</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Combined collision cross-section of <strong className="text-foreground">HBR = 10 m</strong> (0.010 km) for typical LEO communications satellites.
                  </p>
                </div>

                <div className="p-4 rounded-sm border border-border/70 bg-secondary/20 space-y-1.5">
                  <span className="font-semibold text-foreground text-xs uppercase font-mono">Impulsive Thruster Burn</span>
                  <p className="text-muted-foreground leading-relaxed">
                    Instantaneous velocity change modeled via Clohessy-Wiltshire relative motion in representative circular LEO orbit (r ≈ 6,787 km).
                  </p>
                </div>
              </div>

              {/* REST API Table */}
              <div className="space-y-3 pt-2">
                <h4 className="text-base font-bold text-foreground">Live FastAPI REST Endpoints (Port 8000)</h4>
                <div className="overflow-x-auto rounded-xs border border-border/80 bg-background/60">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-secondary/40 text-muted-foreground border-b border-border/80 text-[11px] uppercase font-mono">
                      <tr>
                        <th className="py-3 px-4 w-24">Method</th>
                        <th className="py-3 px-4 w-64">Endpoint</th>
                        <th className="py-3 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      {apiEndpoints.map((ep, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-4">
                            <Badge variant={ep.method === 'GET' ? 'secondary' : 'default'} className="font-mono text-[10px] rounded-xs">
                              {ep.method}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold text-foreground">{ep.path}</td>
                          <td className="py-3 px-4 text-muted-foreground font-sans">{ep.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
